# 阶段3个人解决方案架构案例变更

## 页面定位

从“AI 生成式报告展示”升级为可验证的个人 AI 解决方案架构案例，服务于求职作品集与技术面试讲解。

## 版本保留

- 上一版页面保留在 `preview-v2/`，包含独立 HTML、CSS、JavaScript，并通过相对路径读取同一脱敏证据包。
- 当前主页面继续使用 `index.html`，未覆盖上一版预览。

## 页面结构

1. 首屏：业务目标、30/30 事实与六项个人贡献。
2. G10 / G30：要求 → 证据 → LLM 状态 → Gate → 建议 → 人工行动。
3. 双层架构：业务决策流、编号 Dify Workflow、关键架构决策表。
4. 工程迭代：v1.2 问题 → 根因 → 修复 → v1.3 验证，以及五个工程证据入口。
5. 验证证据：30/30 Run、5/5 三次一致、Schema 30/30、P95 58.257s。
6. 边界与计划：Synthetic POC 事实边界和真实客户试点待验证指标。

## 事实边界

- 数据来源仅为既有 `page-evidence.json`、POC 报告、failure analysis、Workflow YAML 和评测脚本。
- `Synthetic POC / human_review_pending`，不代表生产准确率、客户效果或真实 ROI。
- LLM 只归纳条款与证据；Code Gate 计算建议；人工负责最终授权。
- 本轮未调用 Dify、未读取密钥、未新增数据。

## 验证结果

- 原生 HTML / CSS / JavaScript，无额外构建命令。
- JavaScript、JSON、Git diff 静态检查通过。
- 320、768、1024、1440px 浏览器检查通过：证据加载正常、6 个主区块、无全局横向溢出、控制台 0 错误/0 警告。
- 真实 Workflow 图片和五个工程证据链接均可访问；上一版预览可独立加载。
- 未提交、未推送。

## 阶段3A工作流演示视频

### 变更范围

- 在 Hero 后、正文首个决策区块前新增 30 秒工作流演示区块；不删除或改写既有页面内容。
- 新增浏览器兼容视频 `assets/ai_tender_review.mp4` 与 poster `assets/ai_tender_review-poster.jpg`；保留原始 `.mov` 文件。
- 视频使用原生控件、`preload="metadata"`、无自动播放、`playsinline` 与响应式最大宽度；演示摘要固定展示输入、处理和输出。

### 事实与边界

- 视频只用于说明既有 POC 处理链路，不新增 Dify 运行、Workflow、测试、报告或页面事实。
- 保留“人工负责最终投标授权”的页面边界；不新增生产准确率、ROI、客户效果或 Live Run 表述。

### 验证

- `.mp4` 已核验为 H.264 视频 + AAC 音频，带 faststart；poster 取自接近结尾的清晰帧。
- 页面静态检查、视频属性与响应式浏览器检查结果见本轮执行记录。
- 未提交、未推送。
