#!/usr/bin/env python3
"""Run Tender Evaluator POC v1.3 cases through the published Dify Workflow API."""
import argparse
import json
import math
import os
import statistics
import sys
import time
import urllib.error
import urllib.request
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
CASES_PATH = ROOT / 'tests' / 'golden' / 'golden_cases.jsonl'
REPORTS = ROOT / 'reports'
DECISIONS = ('Bid', 'Conditional Bid', 'No-Bid')
EXPECTED_WORKFLOW_VERSION = 'poc-v1.3-dify-1.16.1'
REQUIRED = {'schema_version', 'workflow_version', 'case_id', 'decision', 'assurance_status', 'requirements', 'scoring_criteria', 'critical_gaps', 'conflicts', 'manual_review_required', 'manual_review_queue', 'warnings', 'report_markdown'}
DEV_12 = {'G01', 'G02', 'G07', 'G08', 'G09', 'G13', 'G14', 'G15', 'G16', 'G18', 'G19', 'G20'}
KEY_GATES = ('G10', 'G11', 'G12', 'G28', 'G30')

def load_cases():
    return [json.loads(x) for x in CASES_PATH.read_text(encoding='utf-8').splitlines() if x.strip()]

def pct(values, value):
    if not values: return None
    values = sorted(values); n = (len(values) - 1) * value; lo, hi = int(n), math.ceil(n)
    return values[lo] if lo == hi else round(values[lo] + (values[hi] - values[lo]) * (n - lo), 3)

def invoke(base, key, item):
    body = json.dumps({'inputs': {'tender_text': item['tender_text'], 'proposal_text': item['proposal_text'], 'case_id': item['case_id']}, 'response_mode': 'blocking', 'user': 'tender-evaluator-poc-v1-eval'}).encode()
    req = urllib.request.Request(base + '/v1/workflows/run', data=body, headers={'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json'}, method='POST')
    started = time.monotonic()
    try:
        with urllib.request.urlopen(req, timeout=120) as response:
            payload, status = json.loads(response.read().decode()), response.status
    except urllib.error.HTTPError as error:
        return {'case_id': item['case_id'], 'ok': False, 'http_status': error.code, 'error': error.read().decode('utf-8', 'replace')[:500], 'latency_seconds': round(time.monotonic()-started, 3)}
    except Exception as error:
        return {'case_id': item['case_id'], 'ok': False, 'error': str(error), 'latency_seconds': round(time.monotonic()-started, 3)}
    data = payload.get('data', payload); raw = (data.get('outputs') or {}).get('review_json')
    try: result = json.loads(raw) if isinstance(raw, str) else None
    except json.JSONDecodeError as error: result = None; raw = 'invalid json: ' + str(error)
    return {'case_id': item['case_id'], 'ok': status == 200 and data.get('status') == 'succeeded' and result is not None, 'http_status': status, 'workflow_status': data.get('status'), 'run_id': payload.get('workflow_run_id') or data.get('id'), 'result': result, 'raw_output': raw, 'error': None if result else raw, 'latency_seconds': round(time.monotonic()-started, 3), 'usage': data.get('metadata', {}).get('usage') or payload.get('metadata', {}).get('usage')}

def valid_schema(result):
    if not isinstance(result, dict) or not REQUIRED.issubset(result) or result.get('decision') not in DECISIONS: return False
    if not isinstance(result['requirements'], list) or not isinstance(result['scoring_criteria'], list) or not isinstance(result['manual_review_required'], bool): return False
    return all(isinstance(x, dict) and {'clause_id','requirement_quote','status','proposal_quote'}.issubset(x) and x['status'] in {'Met','Gap','Unclear','Conflict'} for x in result['requirements'])

def assess(item, run):
    run = dict(run); result = run.get('result'); run['schema_valid'] = valid_schema(result)
    run['workflow_version_actual'] = result.get('workflow_version') if isinstance(result, dict) else None
    run['workflow_version_valid'] = run['workflow_version_actual'] == EXPECTED_WORKFLOW_VERSION
    run.update(requirement_correct=0, requirement_total=len(item['gold']['requirements']), citation_checks=[], critical_expected=item['gold']['critical_gap_codes'], critical_found=[])
    if not run['schema_valid'] or not run['workflow_version_valid']:
        run.update(decision_correct=False, manual_correct=False, requirements_all_correct=False, critical_correct=False, citations_valid=False, business_assertions_passed=False, accepted=False)
        return run
    by_id = {str(x.get('clause_id')): x for x in result['requirements']}
    run['requirement_correct'] = sum(by_id.get(g['clause_id'], {}).get('status') == g['expected_status'] for g in item['gold']['requirements'])
    run['decision_correct'] = result['decision'] == item['gold']['decision']
    run['manual_correct'] = result['manual_review_required'] == item['gold']['manual_review_required']
    run['critical_found'] = [str(x.get('code')) for x in result['critical_gaps'] if isinstance(x, dict)]
    for req in result['requirements']:
        pquote = req.get('proposal_quote') or ''
        run['citation_checks'].append(isinstance(req.get('requirement_quote'), str) and bool(req['requirement_quote']) and req['requirement_quote'] in item['tender_text'] and isinstance(pquote, str) and (not pquote or pquote in item['proposal_text']) and (req['status'] != 'Met' or bool(pquote)))
    run['requirements_all_correct'] = run['requirement_correct'] == run['requirement_total']
    run['critical_correct'] = set(run['critical_found']) == set(run['critical_expected'])
    run['citations_valid'] = bool(run['citation_checks']) and all(run['citation_checks'])
    run['business_assertions_passed'] = all((run['decision_correct'], run['manual_correct'], run['requirements_all_correct'], run['critical_correct'], run['citations_valid']))
    run['accepted'] = bool(run['ok'] and run['schema_valid'] and run['workflow_version_valid'] and run['business_assertions_passed'])
    return run

def summarize(scored, repeats, index):
    total = len(scored); good = [x for x in scored if x['ok']]; schema = [x for x in scored if x['schema_valid']]
    critical = [x for x in scored if x['critical_expected']]; review = [x for x in scored if index[x['case_id']]['gold']['manual_review_required']]
    cites = [b for x in schema for b in x['citation_checks']]; latencies = [x['latency_seconds'] for x in good]
    matrix = {truth: {pred: 0 for pred in DECISIONS} for truth in DECISIONS}
    for x in schema: matrix[index[x['case_id']]['gold']['decision']][x['result']['decision']] += 1
    stable = []
    for runs in repeats.values():
        if len(runs) == 3 and all(x['accepted'] for x in runs):
            stable.append(len({json.dumps({'d':x['result']['decision'],'m':x['result']['manual_review_required'],'r':[(v.get('clause_id'),v.get('status')) for v in x['result']['requirements']]}, sort_keys=True) for x in runs}) == 1)
    return {'cases_run':total,'api_completion_coverage':round(sum(bool(x.get('run_id') or x.get('error')) for x in scored)/total,4) if total else None,'workflow_success_rate':round(len(good)/total,4) if total else None,'workflow_version_compliance_rate':round(sum(x['workflow_version_valid'] for x in scored)/total,4) if total else None,'schema_compliance_rate':round(len(schema)/total,4) if total else None,'synthetic_golden_consistency_rate':round(sum(x['business_assertions_passed'] for x in scored)/total,4) if total else None,'requirement_status_accuracy':round(sum(x['requirement_correct'] for x in scored)/sum(x['requirement_total'] for x in scored),4) if total else None,'critical_gap_recall':round(sum(set(x['critical_expected']).issubset(set(x['critical_found'])) for x in critical)/len(critical),4) if critical else None,'decision_accuracy':round(sum(x['decision_correct'] for x in scored)/total,4) if total else None,'manual_review_recall':round(sum(x['result']['manual_review_required'] for x in review if x['schema_valid'])/len(review),4) if review else None,'citation_validity_rate':round(sum(cites)/len(cites),4) if cites else None,'hallucinated_clause_or_evidence_rate':round(1-sum(cites)/len(cites),4) if cites else None,'key_gate_three_run_coverage':round(sum(len(repeats.get(case_id, [])) == 3 for case_id in KEY_GATES)/len(KEY_GATES),4),'key_gate_three_run_consistency_rate':round(sum(stable)/len(stable),4) if stable else None,'accepted_case_rate':round(sum(x['accepted'] for x in scored)/total,4) if total else None,'latency_seconds':{'average':round(statistics.mean(latencies),3) if latencies else None,'p50':pct(latencies,.5),'p95':pct(latencies,.95)},'token_or_cost_metadata_available_runs':sum(bool(x.get('usage')) for x in good),'decision_confusion_matrix':matrix}

def display_gate(scored, repeats):
    return (
        len(scored) == 30
        and all(x.get('run_id') or x.get('error') for x in scored)
        and all(len(repeats.get(case_id, [])) == 3 for case_id in KEY_GATES)
        and all(x['accepted'] for runs in repeats.values() for x in runs)
    )

def failure_classification(run):
    if not run.get('ok'): return 'environment_or_api'
    if not run.get('workflow_version_valid'): return 'workflow_version'
    if not run.get('schema_valid'): return 'schema'
    if not run.get('citations_valid'): return 'evidence_citation'
    if not run.get('critical_correct'): return 'critical_gate'
    if not run.get('decision_correct') or not run.get('manual_correct') or not run.get('requirements_all_correct'): return 'prompt_or_business_rule'
    return 'accepted'

def save(scored, summary, repeats, failure_retries, emit_page_evidence=False):
    REPORTS.mkdir(parents=True, exist_ok=True)
    payload = {'generated_at':time.strftime('%Y-%m-%dT%H:%M:%SZ',time.gmtime()),'workflow_version_expected':EXPECTED_WORKFLOW_VERSION,'summary':summary,'runs':scored,'failure_retries':failure_retries,'key_gate_repeats':repeats,'page_evidence_gate_passed':display_gate(scored,repeats)}
    (REPORTS/'eval-summary.json').write_text(json.dumps(payload,ensure_ascii=False,indent=2),encoding='utf-8')
    lines = ['# POC v1.3 API 评测结果','','> 数据来自真实 Dify API 运行；黄金集为 synthetic / human_review_pending。','',f'- expected_workflow_version: {EXPECTED_WORKFLOW_VERSION}'] + [f'- {k}: {v}' for k,v in summary.items() if k not in {'decision_confusion_matrix','latency_seconds'}] + ['',f"- latency_seconds: {summary['latency_seconds']}",f'- page_evidence_gate_passed: {display_gate(scored,repeats)}','','## 混淆矩阵','```json',json.dumps(summary['decision_confusion_matrix'],ensure_ascii=False,indent=2),'```']
    (REPORTS/'eval-summary.md').write_text('\n'.join(lines)+'\n',encoding='utf-8')
    failed = [x for x in scored if not x['accepted']]
    failure_lines = ['# API 失败分析','',f'> expected_workflow_version: `{EXPECTED_WORKFLOW_VERSION}`','']
    failure_lines += [f"- {x['case_id']}: category={failure_classification(x)} accepted={x['accepted']} http={x.get('http_status')} workflow={x.get('workflow_status')} run_id={x.get('run_id')} error={x.get('error')}" for x in failed] or ['- 首轮无未接受用例。']
    if failure_retries:
        failure_lines += ['', '## 首轮失败重跑']
        failure_lines += [f"- {case_id}: " + ', '.join(f"accepted={x['accepted']} http={x.get('http_status')} run_id={x.get('run_id')}" for x in runs) for case_id, runs in failure_retries.items()]
    (REPORTS/'failure-analysis.md').write_text('\n'.join(failure_lines)+'\n',encoding='utf-8')
    evidence_path = REPORTS/'page-evidence.json'
    if emit_page_evidence and display_gate(scored,repeats):
        reps = [x for x in scored if x['case_id'] in {'G01','G07','G13'} and x['schema_valid']]
        evidence = {'evidence_status':'api_verified_synthetic_poc','workflow_version':EXPECTED_WORKFLOW_VERSION,'dataset':{'size':summary['cases_run'],'provenance':'synthetic','review_status':'human_review_pending'},'decision_distribution':dict(Counter(x['result']['decision'] for x in schema_runs(scored))),'core_metrics':summary,'representative_cases':[{'case_id':x['case_id'],'run_id':x.get('run_id'),'decision':x['result']['decision'],'manual_review_required':x['result']['manual_review_required']} for x in reps],'limitations':['Synthetic POC / human_review_pending，不代表生产准确率或客户 ROI。','不替代法务、资质、报价或最终投标授权。']}
        evidence_path.write_text(json.dumps(evidence,ensure_ascii=False,indent=2),encoding='utf-8')
    elif evidence_path.exists():
        evidence_path.unlink()

def schema_runs(scored): return [x for x in scored if x['schema_valid']]

def main():
    parser = argparse.ArgumentParser(); parser.add_argument('--full',action='store_true'); parser.add_argument('--case-id',action='append'); parser.add_argument('--emit-page-evidence',action='store_true'); parser.add_argument('--base-url',default=os.environ.get('DIFY_BASE_URL','http://localhost')); args = parser.parse_args()
    key = os.environ.get('DIFY_APP_API_KEY') or os.environ.get('DIFY_API_KEY')
    if not key:
        print('DIFY_APP_API_KEY (or DIFY_API_KEY) is required in the environment; no key is read from files.',file=sys.stderr); return 2
    index = {x['case_id']:x for x in CASES}; chosen = CASES if args.full else [x for x in CASES if x['case_id'] in DEV_12]
    if args.case_id: chosen = [x for x in CASES if x['case_id'] in set(args.case_id)]
    def run_case(item):
        return assess(item,invoke(args.base_url.rstrip('/'),key,item))
    scored = []
    for item in chosen:
        x = run_case(item); scored.append(x)
        print(f"{x['case_id']}: ok={x['ok']} run_id={x.get('run_id')}", flush=True)
    repeats = defaultdict(list)
    failure_retries = defaultdict(list)
    if args.full:
        for item, first_run in zip(chosen, scored):
            if not first_run['accepted']:
                failure_retries[item['case_id']].append(assess(item,invoke(args.base_url.rstrip('/'),key,item)))
        for item in [index[case_id] for case_id in KEY_GATES]:
            repeats[item['case_id']].append(next(x for x in scored if x['case_id']==item['case_id']))
            repeats[item['case_id']].extend(assess(item,invoke(args.base_url.rstrip('/'),key,item)) for _ in range(2))
    summary = summarize(scored,repeats,index); save(scored,summary,repeats,failure_retries,args.emit_page_evidence); print(json.dumps(summary,ensure_ascii=False,indent=2))
    return 0 if all(x['accepted'] for x in scored) and summary['key_gate_three_run_consistency_rate'] == 1 else 1

CASES = load_cases()
if __name__ == '__main__': raise SystemExit(main())
