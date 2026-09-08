# AI Application Case Portfolio

一个面向业务场景的 AI 应用案例作品集。项目采用原生 HTML、CSS、JavaScript，无后端和构建依赖，可直接部署到 GitHub Pages。

## 作品集定位

不只展示模型或代码，而是以“技术能力 → 业务场景 → 在线体验 → 技术实现 → 商业价值”组织每个 Case。适用于简历、面试、GitHub/LinkedIn 主页、售前沟通与方案验证。

在线地址：`https://ai-application-projects.github.io/ai-cases/`

## 目录结构

```text
ai-Cases/
├── index.html / style.css / main.js     # 作品集首页
├── case-base.css                        # Case 页面共享样式
├── assets/                              # 封面与截图素材
├── <case-slug>/                         # 真实案例入口（一级短路径）
│   └── index.html|style.css|main.js
├── cases/                               # 唯一案例库
└── docs/                                # 案例与定位文档
```

## 本地预览

直接双击 `index.html` 即可基础预览。推荐在项目根目录启动静态服务：

```bash
python3 -m http.server 8000
```

访问 `http://localhost:8000`。

## 部署到 GitHub Pages

1. 将本项目推送到仓库（建议仓库名为 `ai-cases`）。
2. 在仓库中依次进入：

```text
Settings
↓
Pages
↓
Build and deployment
↓
Source: Deploy from a branch
↓
Branch: main
↓
Folder: /root
↓
Save
```

3. 本项目发布后访问：`https://ai-application-projects.github.io/ai-cases/`。

> 若使用组织账号，请确认仓库名与访问路径一致；GitHub Pages 首次发布通常需要数分钟。

## 如何新增 Case

1. 复制一个现有案例目录为 `cases/your-case-slug/`。
2. 修改其中 `index.html` 的分类、价值、场景、技术栈、商业价值和开发计划。
3. 在根目录 `main.js` 的 `data` 中新增中英文卡片记录，并将 `path` 指向 `cases/your-case-slug/`。
4. 不创建重复入口；案例仅维护在 `cases/`。
5. 使用 [docs/case-template.md](docs/case-template.md) 补齐案例说明。

## Demo 案例模板

每个案例建议包含：一句话价值、目标场景、目标用户、核心交互、技术架构、能力点、商业价值、限制与迭代计划。详见 `docs/case-template.md`。

## 后续规划

- 将占位区替换为真实可交互 Demo
- 增加案例详情文档、截图、视频与技术架构图
- 为案例补充可量化的验证指标与复盘
- 按行业、技术能力、交互类型增加筛选与检索
