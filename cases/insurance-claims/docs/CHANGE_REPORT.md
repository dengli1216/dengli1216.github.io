# Change Report

## Workflow

无修改。新案例目录中的工作流为源资产的逐字复制，SHA-256 与源文件一致。

## Evaluation

新增本地黄金集与评测脚本，用于验证现有确定性节点；不改变业务规则、阈值或黄金标签。

新增发布后 Dify API regression runner。它只使用环境变量中的 API key，保存 Run ID 与汇总指标，不保存密钥或 provider 错误详情。
