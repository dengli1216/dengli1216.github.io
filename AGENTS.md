# 项目协作规则

## Publication Safety

创建新文件前先判断其属于 `PUBLIC`、`PRIVATE_BY_DEFAULT` 或 `REVIEW_REQUIRED`。详细边界以 [公开发布规则](docs/PUBLICATION_RULES.md) 为准。

### PUBLIC

- 案例主页 HTML、面向读者的 Markdown、架构/流程说明；
- 汇总后的 Evidence 与脱敏指标。

### PRIVATE_BY_DEFAULT

- raw evaluation、完整 Golden Set、secrets、credentials、debug output；
- internal notes、API dumps、完整运行日志和客户数据。

### REVIEW_REQUIRED

- workflow YAML、prompts、evaluation scripts、detailed POC reports。

PRIVATE 文件优先加入 `.gitignore`，不要提交 Git。页面需要数据时，生成精简、脱敏的 public summary，不直接公开 raw file。

## 内容语言

除 API 字段、代码变量、标准技术术语和国际通用模型/框架名称外，案例主页 HTML 文案、POC Report、Markdown 报告、Failure Analysis、Handoff、README 案例说明、页面导航、图表标题和测试总结默认使用中文；必要英文仅作为辅助。
