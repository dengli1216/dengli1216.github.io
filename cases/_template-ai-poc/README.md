# AI POC Case Template

这个目录用于创建新的 AI POC / Solution 案例详情页。默认只需要准备：

- `case.config.example.js`：案例内容、页面骨架、自定义模块、指标映射。
- `evidence.example.json`：公开 evidence 摘要，KPI 从这里读取。
- `assets/`：hero 图、流程截图、demo poster 等真实素材。
- `report.example.md` 或工程报告：作为 POC evidence 的原始可追溯材料。

## 必填字段

- `hero`：`eyebrow`、`title`、`subtitle`、`tags`、`validationStatus`。
- `businessValue.cards`：默认 3 张卡，说明业务问题、传统方式、AI 机会。
- `solution.flow`：配置 `input -> AI -> decision -> human/business action`，节点数量可变。
- `evidence.url`：指向公开 evidence JSON。
- `evidence.primaryMetrics`：每个指标必须有 `label`、`type`、`sourceKey`。
- `decisionBoundary`：明确 `verifiedCapabilities` 与 `notProvenItems`。
- `productionPath.steps`：建议 3-4 步，从 POC 到 pilot / integration。
- `roleDeliverables`：说明个人角色和可交付物。

## Optional 模块

`customSections` 最多建议 1-3 个。常见类型：

- `roi`
- `cards`
- RAG Quality / Safety / Demo Video / Architecture Deep Dive 可先用 `cards` 表达。

保留模块的 gate：能体现商业价值、专业工程能力、POC 可信 evidence 或生产化决策；否则不展示。

## Evidence 接入

指标不写死在 HTML。配置里的 `sourceKey` 使用点路径读取 evidence，例如：

```js
{ label: "Schema 合规", type: "schema_compliance", sourceKey: "final_regression.schema_compliance" }
```

如果 evidence 缺失或字段不存在，页面显示 `未验证`，不要写 synthetic / mock / estimated 数字冒充生产 evidence。

## 本地预览

在仓库根目录启动静态服务：

```bash
python3 -m http.server 8000
```

然后访问：

```text
http://localhost:8000/cases/_template-ai-poc/index.html
```
