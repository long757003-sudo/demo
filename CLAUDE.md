# CLAUDE.md（主）— 项目章程

本文件是整个项目的**元协议**，code 仓库和 wiki 仓库都必须遵守。
具体的工程规范见各子目录下的 CLAUDE.md。

---

## 项目结构

```
my-project-parent/
├── my-project-code/     ← 代码仓库（HTML 原型演示）
└── my-project-wiki/     ← wiki 知识库（需求、决策、概念沉淀）
```

跨仓库路径：
- 代码仓库：`../my-project-code/`
- wiki 仓库：`../my-project-wiki/`
- OpenSpec 归档同步：`cp -r ../my-project-code/openspec/changes/[变更名] ../my-project-wiki/raw/openspec/`

### 两个仓库的职责边界

| 问题类型 | 去哪找答案 |
|----------|-----------|
| 这个功能现在的规范是什么？ | `my-project-code/openspec/specs/` |
| 当时为什么这么设计？ | `my-project-wiki/wiki/decisions/` |
| 这个业务概念是什么意思？ | `my-project-wiki/wiki/concepts/` |
| 两个模块之间有什么关联？ | `my-project-wiki/wiki/synthesis/` |
| 业务术语的规范称谓？ | `my-project-wiki/wiki/glossary.md` |

---

## 术语权威源（重要）

**`my-project-wiki/wiki/glossary.md` 是全项目业务术语的唯一权威来源。**

这条规则适用于：
- wiki 里的页面命名、概念定义、links 目标
- code 里的变量命名、角色 ID、UI 文案、注释
- 所有会议记录、邮件摘要、需求文档里使用的业务词汇

操作约定：
- 遇到新业务术语时，先查 glossary，规范名已存在就直接用
- glossary 里没有的，**先更新 glossary 再使用**，不要先散落后收敛
- 发现代码或 wiki 里有别名（如 `unit-admin` / `unit-sysadmin`）时，以 glossary 规范名为准全仓统一

为什么这么严：之前已经踩过角色 ID 两种写法并存的坑。术语漂移在早期几乎没感知，积累到后期就是灾难。

---

## 写作规范（全项目）

- 所有文档用中文。
- 不确定的内容标注 `*（待确认）*`。
- 结论必须标注来源（文件路径或 `[[页面名]]`）。
- 业务术语以 `wiki/glossary.md` 的规范称谓为准。

---

## 矛盾处理元原则

无论在 code 还是 wiki 中遇到信息冲突，都遵循以下原则：

- **不自行选边**。两份文档说法冲突时，标注 ⚠️ 并列出双方来源，交由用户决策。
- **版本迭代导致的矛盾**：以时间较新的为准，旧的加历史注记，不删除。
- **真实业务冲突**：迁入 `my-project-wiki/wiki/synthesis/conflicts/`，不在原页面混写。
- **原始资料永远只增不删**，过时文件加 `-archived` 后缀。

---

## 交付前自检元原则

无论是改代码还是更新 wiki，交付前必须自检，禁止使用"应该可以了""代码逻辑正确"这类未验证措辞。

- **code 侧**的完整自检流程见 `my-project-code/CLAUDE.md` 的 TDD 开发流程。
- **wiki 侧**的自检流程（ingest/propagate 后的检查清单）见 `my-project-wiki/CLAUDE.md`。

共同要求：交付消息必须是"已实测 X，预期 Y，实际 Z"的形态，或明确列出未覆盖的场景与风险。

---

## Git 规范（全项目）

- 文件重命名用 `git mv`，不直接 `mv`，保留文件历史。
- wiki 中重命名后必须告知 Claude Code 旧路径和新路径，以便更新 `sources:` 引用。
- commit message 格式：`类型: 简短描述`
- 类型：`feat` / `fix` / `docs` / `refactor` / `chore`

---

## graphify（可选工具）

若项目包含 `graphify-out/`：
- 回答架构或代码库问题前，先读 `graphify-out/GRAPH_REPORT.md`。
- 若 `graphify-out/wiki/index.md` 存在，优先导航它而不是读原始文件。
- 本次会话修改代码后，运行：
  `python3 -c "from graphify.watch import _rebuild_code; from pathlib import Path; _rebuild_code(Path('.'))"`

---

## 进入子目录后

- 进入 `my-project-code/` → 参见其 `CLAUDE.md`（思考原则、TDD、OpenSpec 工作流、编码规范）
- 进入 `my-project-wiki/` → 参见其 `CLAUDE.md`（目录约定、页面格式、ingest/propagate/audit 指令）
