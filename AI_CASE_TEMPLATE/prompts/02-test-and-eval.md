# 02 — Test and Eval

## 任务

建立并执行可复现的黄金集评测，产出可追踪的运行与失败记录。

## 事实源

- `poc/tests/golden-set.template.json`
- `poc/tests/run_eval.template.py`
- `docs/DECISION_CONTRACT.md`

## 范围

- 覆盖 Happy Path、关键缺口、待确认、冲突/异常。
- 执行 preflight、smoke、full、关键 Gate 重复运行与失败用例重跑。

## 禁止项

- 不读取或打印密钥；仅从环境变量读取。
- 不用修改黄金标签或手工编辑结果来提高指标。

## 验收

- 每条仅断言五个合同字段；首轮与重跑记录均保留。
- 生成 JSON/Markdown 评测与失败分析，明确数据来源和评审状态。

## 完成汇报

汇报命令、范围、Gate 结果、失败分类、重跑结果和 Test Gate 结论。
