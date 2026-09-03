#!/usr/bin/env python3
"""Safe evaluation skeleton. Implement transport for the chosen platform; never print secrets."""
import argparse
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CASES_PATH = ROOT / "tests" / "golden-set.template.json"
REPORTS = ROOT / "reports"
API_KEY_ENV = "AI_CASE_API_KEY"  # Replace only with an approved environment-variable name.


def load_cases():
    """TODO: validate dataset metadata and return cases; reject missing review_status."""
    return json.loads(CASES_PATH.read_text(encoding="utf-8"))["cases"]


def preflight():
    """TODO: check local files, schema, required configuration and output directory.
    Read API keys only from os.environ; do not read .env files and never print key values.
    """
    required = (CASES_PATH,)
    missing = [str(path) for path in required if not path.exists()]
    return {"ok": not missing, "missing": missing, "api_key_configured": bool(os.environ.get(API_KEY_ENV))}


def invoke_case(case, api_key):
    """TODO: call the approved endpoint with a timeout; keep API key out of logs/errors.
    Return only a sanitized run record: case_id, status, decision, critical_gap,
    manual_review, citation, latency_seconds, run_ref, error_category.
    """
    raise NotImplementedError("Implement approved platform transport; no URL is bound by this template.")


def assert_case(case, result):
    """TODO: compare only decision/status/critical_gap/manual_review/citation."""
    expected = case["expected"]
    fields = ("decision", "status", "critical_gap", "manual_review", "citation")
    return {field: result.get(field) == expected[field] for field in fields}


def run_suite(cases, api_key, mode):
    """TODO: use a small approved subset for smoke and all cases for full."""
    _ = (cases, api_key, mode)
    raise NotImplementedError


def repeat_key_gates(cases, api_key):
    """TODO: repeat case-specific critical gates; persist each run and compare asserted fields."""
    _ = (cases, api_key)
    return {}


def rerun_failures(failed_cases, api_key):
    """TODO: rerun failures without overwriting first-run records; attach retry_of/run number."""
    _ = (failed_cases, api_key)
    return []


def write_reports(results, gate_repeats, failure_retries):
    """TODO: generate eval-summary.json, POC_REPORT.md, failure-analysis.md and page-evidence.json.
    page-evidence.json may be emitted only when its evidence Gate passes.
    """
    REPORTS.mkdir(parents=True, exist_ok=True)
    payload = {"runs": results, "key_gate_repeats": gate_repeats, "failure_retries": failure_retries}
    (REPORTS / "eval-summary.json").write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--preflight", action="store_true")
    parser.add_argument("--smoke", action="store_true")
    parser.add_argument("--full", action="store_true")
    parser.add_argument("--evidence", action="store_true")
    args = parser.parse_args()
    if sum((args.preflight, args.smoke, args.full, args.evidence)) != 1:
        parser.error("choose exactly one mode")
    check = preflight()
    if args.preflight:
        print(json.dumps(check, ensure_ascii=False)); return 0 if check["ok"] else 2
    if not check["ok"] or not check["api_key_configured"]:
        print("Preflight failed or API key is absent; key values are never printed.", file=sys.stderr); return 2
    # TODO: obtain api_key = os.environ[API_KEY_ENV], then execute smoke/full/evidence workflow.
    raise NotImplementedError("Complete approved execution flow before use.")


if __name__ == "__main__":
    raise SystemExit(main())
