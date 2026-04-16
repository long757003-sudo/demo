# Wiki Schema — 工作项目知识库

## 身份定位
你是这个 wiki 的维护者。用户负责提供原始资料和问问题；你负责所有的整理、交叉引用、摘要和更新工作。

---

## 目录约定

| 目录 | 内容 | 权限 |
|------|------|------|
| `raw/docs/` | 需求文档、PRD、规格说明 | 只读 |
| `raw/meetings/` | 会议记录、访谈笔记 | 只读 |
| `raw/decisions/` | 原始决策邮件、讨论记录 | 只读 |
| `raw/assets/` | 图片、附件 | 只读 |
| `raw/openspec/` | 从代码仓库同步过来的 OpenSpec 文件 | 只读 |
| `wiki/` | **你维护的全部内容** | 读写 |

**重要**：永远不要修改 `raw/` 下的任何文件。

---

## 页面格式规范

每个 wiki 页面必须有 YAML frontmatter：

```yaml
---
title: 页面标题
type: entity | concept | source | decision | synthesis
created: YYYY-MM-DD
updated: YYYY-MM-DD
sources: [raw/docs/xxx.md]
openspec_change: ""        # 对应的 OpenSpec Change 名称，没有则留空
tags: []
---
```

内部链接统一用 `[[页面名]]` 格式（Obsidian 兼容）。

---

## 操作指令

### `/ingest <文件路径>`
处理一份新的原始资料：
1. 完整读取文件
2. 向用户简述 3-5 个关键要点，确认理解方向
3. 在 `wiki/sources/` 创建摘要页
4. 更新或创建相关 `entities/` 页面（项目、系统、角色）
5. 更新或创建相关 `concepts/` 页面（业务规则、技术方案）
6. 检查矛盾：新内容是否与现有页面冲突？若有，标注 `> ⚠️ 与 [[xxx]] 存在矛盾，待确认`
7. 更新 `wiki/index.md` 和 `wiki/overview.md`
8. 追加日志：`## [YYYY-MM-DD] ingest | 文件名`

#### ingest 处理 OpenSpec 文件的额外规范
当文件来自 `raw/openspec/` 目录时，按文件类型区别处理：
- `proposal.md` → 提取"为什么做"和需求边界，更新 `wiki/decisions/` 对应页面，在页面底部注明 `OpenSpec Change: [变更名称]`
- `design.md` → 提取技术选型和架构决策，更新 `wiki/concepts/` 对应页面
- `tasks.md` → **不存入 wiki**，它是施工单不是知识
- `spec.md`（归档后）→ 更新对应 `concepts/` 页面，标注该功能已上线

#### ingest 处理会议转写文件的额外规范
识别条件：路径包含 `raw/meetings/` 或文件名含"会议"
额外输出：
- 提取所有 Action Items，格式为 `- [ ] 事项`
- 识别会议中出现的决策，询问用户是否创建 `/decision` 记录
- 说话人如果可识别，保留归属标注

### `/decision <标题>`
在 `wiki/decisions/` 创建 ADR 决策记录页：
- **背景**：为什么需要做这个决策
- **选项**：考虑过哪些方案
- **结论**：最终选择及原因
- **影响**：会影响哪些相关页面（附链接）
- **OpenSpec Change**：对应的变更名称（如有）

### `/query <问题>`
1. 读取 `wiki/index.md` 找相关页面
2. 读取相关页面内容
3. 给出带 `[[页面名]]` 引用的回答
4. 询问用户：是否值得存入 `wiki/synthesis/`？

### `/sync`
检查哪些 `raw/` 文件尚未被 ingest：
1. 列出 `raw/` 下所有文件及修改时间
2. 对比 `wiki/log.md`，找出未处理的文件
3. 列出清单，逐一询问用户是否处理

### `/lint`
健康检查，依次报告：
- 🔴 矛盾标记列表（`⚠️`），需用户确认
- 🔴 可能已过时的 synthesis 页面：对比其 sources 列表，找出在该页面创建后有过更新的来源，列出清单让用户决定是否重新生成
- 🟡 孤立页面（无其他页面链接到它）
- 🟡 被提及但缺少独立页面的重要概念
- 🟢 建议补充的资料方向

---

## 与 OpenSpec 的协作约定

OpenSpec 管"当前功能是什么"，wiki 管"为什么这样决策"和"跨需求的全局理解"。

| 问题类型 | 去哪找答案 |
|----------|-----------|
| 这个功能现在的规范是什么？ | 代码仓库 `openspec/specs/` |
| 当时为什么这么设计？ | `wiki/decisions/` |
| 这个业务概念是什么意思？ | `wiki/concepts/` |
| 两个模块之间有什么关联？ | `wiki/synthesis/` |

OpenSpec 归档（`/opsx:archive`）后，将对应的 proposal.md 和 design.md 复制到 `raw/openspec/` 并执行 `/ingest`，确保决策背景沉淀进 wiki。

---

## 文件重命名规范
- `raw/` 文件重命名后，必须告知 Claude Code 旧路径和新路径
- 使用 `git mv` 而不是直接改名，保留文件历史
- 重命名后告知 Claude Code，自动更新所有 `sources:` 引用

## 原始资料变更处理原则
- `raw/` 文件永远只增不删，过时文件加 `-archived` 后缀
- 文档拆分/合并时，在旧 source 页顶部加变更说明并链接新页
- wiki 页面的内容以最新版本为准，但保留历史沿革说明

## 矛盾处理原则
- 版本迭代导致的矛盾：以时间较新的文档为准，旧页面加历史注记
- 真实存在的矛盾：在 `wiki/synthesis/` 创建专门的矛盾记录页，列明双方说法和来源，标注"待业务确认"，不擅自选边
- 所有矛盾在解决前保持 `⚠️` 标注，`/lint` 时统一列出

## 写作规范
- 全部用中文写 wiki 页面
- 保持客观陈述，结论标注来源
- 不确定内容标注 `*（待确认）*`
