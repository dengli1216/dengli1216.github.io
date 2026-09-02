#!/usr/bin/env python3
"""Run the four P0 fixtures against a published Dify workflow. No secrets are stored."""
import json
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

BASE_URL = os.environ.get("DIFY_BASE_URL", "http://localhost").rstrip("/")
API_KEY = os.environ.get("DIFY_APP_API_KEY") or os.environ.get("DIFY_API_KEY")
FIXTURE_DIR = Path(__file__).parent / "fixtures"


def fail(message: str) -> None:
    print(f"FAIL: {message}", file=sys.stderr)
    raise AssertionError(message)


def run_fixture(path: Path) -> dict:
    fixture = json.loads(path.read_text(encoding="utf-8"))
    payload = json.dumps({
        "inputs": fixture["inputs"],
        "response_mode": "blocking",
        "user": "tender-evaluator-p0-regression",
    }).encode("utf-8")
    request = urllib.request.Request(
        f"{BASE_URL}/v1/workflows/run",
        data=payload,
        headers={"Authorization": f"Bearer {API_KEY}", "Content-Type": "application/json"},
        method="POST",
    )
    started = time.monotonic()
    try:
        with urllib.request.urlopen(request, timeout=90) as response:
            body = json.loads(response.read().decode("utf-8"))
            status = response.status
    except urllib.error.HTTPError as error:
        fail(f"{fixture['name']}: HTTP {error.code}: {error.read().decode('utf-8', 'replace')[:300]}")
    except urllib.error.URLError as error:
        fail(f"{fixture['name']}: request error: {error.reason}")
    if status != 200:
        fail(f"{fixture['name']}: HTTP {status}")
    data = body.get("data", body)
    if data.get("status") != "succeeded":
        fail(f"{fixture['name']}: workflow status={data.get('status')}")
    run_id = body.get("workflow_run_id") or data.get("id")
    if not run_id:
        fail(f"{fixture['name']}: missing workflow run id")
    raw_result = (data.get("outputs") or {}).get("review_json")
    if not isinstance(raw_result, str):
        fail(f"{fixture['name']}: missing review_json output")
    try:
        result = json.loads(raw_result)
    except json.JSONDecodeError as error:
        fail(f"{fixture['name']}: review_json is invalid: {error}")
    for key in ("decision", "critical_gaps", "manual_review_required", "scoring_criteria", "evidence"):
        if key not in result:
            fail(f"{fixture['name']}: missing result field {key}")
    if not result["evidence"].get("tender") or not result["evidence"].get("proposal"):
        fail(f"{fixture['name']}: evidence must be non-empty")
    expected = fixture["expect"]
    if result["decision"] != expected["decision"]:
        fail(f"{fixture['name']}: decision={result['decision']} expected={expected['decision']}")
    if "manual_review_required" in expected and result["manual_review_required"] != expected["manual_review_required"]:
        fail(f"{fixture['name']}: manual review rule mismatch")
    if expected.get("critical_gap") and not result["critical_gaps"]:
        fail(f"{fixture['name']}: expected critical gap")
    if "scoring_criteria_empty" in expected and bool(result["scoring_criteria"]) != (not expected["scoring_criteria_empty"]):
        fail(f"{fixture['name']}: scoring criteria rule mismatch")
    return {"name": fixture["name"], "passed": True, "run_id": run_id, "duration_seconds": round(time.monotonic() - started, 2)}


def main() -> int:
    if not API_KEY:
        print("DIFY_APP_API_KEY (or DIFY_API_KEY) is required; no key is read from files.", file=sys.stderr)
        return 2
    results = []
    for path in sorted(FIXTURE_DIR.glob("dify-*.json")):
        try:
            results.append(run_fixture(path))
            print(f"PASS: {results[-1]['name']} ({results[-1]['run_id']})")
        except AssertionError as error:
            results.append({"name": path.stem, "passed": False, "error": str(error)})
            print(f"FAIL: {error}", file=sys.stderr)
    print(json.dumps({"base_url": BASE_URL, "results": results}, ensure_ascii=False, indent=2))
    return 0 if all(item["passed"] for item in results) else 1


if __name__ == "__main__":
    raise SystemExit(main())
