# 公开发布规则

本仓库默认公开展示结果，不默认公开完整实现与原始数据。创建或提交文件前，先按以下边界判断。

## PUBLIC

- GitHub Pages 页面、样式、脚本和页面实际引用的资源；
- 面向读者的案例说明、无敏感细节的架构或流程；
- 脱敏 Evidence、汇总指标与少量示例数据；
- 作为页面证据入口的精简 `POC_REPORT.md`、`page-evidence.json` 或 `portfolio-evidence.json`。

## PRIVATE_BY_DEFAULT

- Secret、凭据、`.env*`、本地绝对路径；
- raw evaluation、完整 Golden Set、原始输入输出、API dump、Run ID 明细；
- debug output、失败分析、内部 handoff、工作笔记、完整运行或 token/cost 日志；
- 客户数据、临时导出、虚拟环境、缓存和 Playwright 产物。

此类文件应保留在本地并加入 `.gitignore`；已经被跟踪时使用 `git rm --cached <file>`，不得删除本地文件。页面需要数据时，新增脱敏、汇总的 public summary，而不是公开 raw file。

## REVIEW_REQUIRED

- Dify workflow YAML；
- 完整 Prompt；
- eval script；
- 详细 POC report、schema 和 public sample。

仅当对外展示价值高于被复制或泄露风险，且不含 Secret、客户数据或完整原始材料时，才公开。Review 文件不因本规则自动移除。

## 中文内容规范

案例主页 HTML 文案、POC Report、Markdown 报告、Failure Analysis、Handoff、README 案例说明、页面导航、图表标题和测试总结默认使用中文。API 字段、代码变量、标准技术术语以及 Dify API、LLM、POC、P95、ROI 等国际通用名称可保留英文；避免整页英文影响阅读。
