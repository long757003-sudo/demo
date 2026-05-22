# Wiki Schema — 工作项目知识库

> 本文件遵循主目录 `CLAUDE.md` 的全局约定（术语权威源、矛盾处理、Git 规范、写作规范、交付自检元原则）。
> 本文件只写 wiki 维护特有的规则。

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
| `wiki/glossary.md` | **全项目术语权威源**（主目录声明） | 读写 |

**重要**：永远不要修改 `raw/` 下的任何文件。

---

## 页面类型判定规则

每个 wiki 页面必须归入以下五类之一，判定标准如下：

| type | 定义 | 典型内容 |
|------|------|---------|
| `entity` | 有生命周期的具体对象 | 项目、系统、部门、角色、人员 |
| `concept` | 业务规则/术语/技术方案的定义，通常是名词性抽象 | "征集批次"、"遴选流程"、"角色权限模型" |
| `source` | 对某份原始资料的客观摘要，**不做跨来源推理** | 某份会议记录摘要、某份需求文档摘要 |
| `decision` | ADR 决策记录，必须有"背景/选项/结论/影响"四段 | 架构决策、流程设计决策 |
| `synthesis` | 跨多个 source 或 entity 的推理性总结，**必须列出所有依赖 sources** | "评审机制全景"、"角色权限矩阵" |

判定时遇到模糊情况（如一个对象既像 entity 又像 concept），优先选 concept；只有当这个对象会被独立引用、有状态变化时才选 entity。

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
所有业务术语必须使用 `wiki/glossary.md` 的规范称谓。

---

## 核心操作指令

### `/ingest <文件路径>`
**职责仅限于"读取与摘要"**，不做跨页面更新（那是 `/propagate` 的活）。

流程：
1. 完整读取文件
2. 向用户简述 3-5 个关键要点，确认理解方向
3. 在 `wiki/sources/` 创建摘要页
4. 提取文件中出现的所有业务术语，与 `glossary.md` 比对：
   - 已收录且用规范称谓 → 无需动作
   - 已收录但原文用了别名 → 在 source 页内统一为规范称谓，别名记入 glossary 的"别名"字段
   - 未收录 → 列出清单询问用户是否补充 glossary
5. 追加日志：`## [YYYY-MM-DD] ingest | 文件名`
6. 末尾给出建议：`建议接下来执行 /propagate wiki/sources/xxx.md`

**/ingest 不主动更新 entities/concepts/index/overview**。这一步独立成 /propagate，让人的判断介入点更清晰。

#### ingest 处理 OpenSpec 文件的额外规范
当文件来自 `raw/openspec/` 目录时，按文件类型区别处理：
- `proposal.md` → source 页中额外提取"为什么做"和需求边界
- `design.md` → source 页中额外提取技术选型和架构决策
- `tasks.md` → **不存入 wiki**，它是施工单不是知识
- `spec.md`（归档后）→ source 页中标注该功能已上线

#### ingest 处理会议转写文件的额外规范
识别条件：路径包含 `raw/meetings/` 或文件名含"会议"
额外输出：
- 提取所有 Action Items，格式为 `- [ ] 事项`
- 识别会议中出现的决策，询问用户是否创建 `/decision` 记录
- 说话人如果可识别，保留归属标注

### `/propagate <source页路径>`
把一份 source 页的信息传播到相关的 entities / concepts / index，是 /ingest 的后续步骤。

流程：
1. 读取指定 source 页
2. 识别涉及的 entity / concept，逐一检查：
   - 不存在 → 提议创建，等用户确认
   - 已存在 → 对比现有内容，列出"将新增/将修改"清单，等用户确认后再动
3. 矛盾检查：若新内容与现有页面冲突
   - 版本迭代型 → 以新为准，旧内容加历史注记
   - 真实冲突 → 标 `> ⚠️ 与 [[xxx]] 存在矛盾，待确认`，迁入 `wiki/synthesis/conflicts/`
   - （遵循主目录的矛盾处理元原则：不自行选边）
4. 更新 `wiki/index.md` 和 `wiki/overview.md`
5. 追加日志：`## [YYYY-MM-DD] propagate | source页 → [涉及页面清单]`

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

---

## 维护与治理指令

### `/sync`
检查哪些 `raw/` 文件尚未被 ingest：
1. 列出 `raw/` 下所有文件及修改时间
2. 对比 `wiki/log.md`，找出未处理的文件
3. 列出清单，逐一询问用户是否处理

### `/audit`（建议每月执行一次）
对 wiki 做全面体检，输出到 `wiki/_audit-YYYYMMDD.md`，**不直接修改任何内容页面**，只列清单给用户裁决。

报告内容：
1. **同义页面候选**：标题或 tags 高度相似的页面对（如"二级单位"/"下属单位"/"分支机构"），列出让用户决定合并或保留
2. **概念散落**：在 ≥3 个页面被反复定义但没有独立 concept 页的术语
3. **类型误用**：frontmatter 的 type 与实际内容不符的页面（如标为 entity 但内容是抽象规则）
4. **过时 synthesis**：sources 列表里过半文件在 synthesis 创建后有更新的页面
5. **孤岛页面**：没有任何其他页面链接到它的页面
6. **矛盾标记汇总**：所有 ⚠️ 标记，按"待确认 / 版本迭代 / 真实冲突"三类归档
7. **glossary 漂移**：wiki 中使用了但未收录在 glossary 的术语；或 glossary 有但全 wiki 无人使用的术语

### `/refactor <诉求>`
**仅在用户主动发起时执行**。例如"/refactor 合并 [[二级单位]] 和 [[下属单位]]"、"/refactor 把 concepts/xxx 拆成两页"。

流程：
1. 列出本次 refactor 的影响范围（涉及哪些页面、哪些 links 需要改）
2. 等用户确认后执行
3. 合并时：保留规范页，其余改成 30 字内重定向（`本页已并入 [[xxx]]，原始内容见 git 历史`），**不真删**
4. 追加日志：`## [YYYY-MM-DD] refactor | 说明`

### `/glossary <操作>`
glossary 的专属维护命令：
- `/glossary add <术语>` → 询问规范名、别名、一句话定义、首次出现来源
- `/glossary check <页面路径>` → 检查该页面所有术语是否与 glossary 一致，不一致列出清单
- `/glossary check all` → 全 wiki 扫描，输出所有使用别名或未收录术语的位置

glossary 条目格式：
```markdown
## 征集批次
- 规范名：征集批次
- 别名：`collection-batch`（代码）、"需求征集轮次"（早期文档）
- 定义：信息办定期发起的、面向所有二级单位的需求收集周期单元。
- 首次出现：raw/docs/2024-Q3-prd.md
```

### `/lint`
轻量健康检查，作为 /audit 的日常版（不生成独立报告，直接输出）：
- 🔴 矛盾标记列表（`⚠️`）
- 🔴 可能已过时的 synthesis 页面
- 🟡 孤立页面
- 🟡 被提及但缺少独立页面的重要概念
- 🟢 建议补充的资料方向

---

## 与 OpenSpec 的协作约定

OpenSpec 管"当前功能是什么"，wiki 管"为什么这样决策"和"跨需求的全局理解"。具体分工见主目录 CLAUDE.md 的职责边界表。

OpenSpec 归档（`/opsx:archive`）后：
1. 在 code 仓执行 `cp -r openspec/changes/[变更名] ../my-project-wiki/raw/openspec/`
2. 进入 wiki 仓执行 `/ingest raw/openspec/[变更名]/proposal.md`
3. 视情况执行 `/ingest raw/openspec/[变更名]/design.md`
4. 执行 `/propagate` 让决策背景传播到相关 concepts 和 decisions

---

## 文件重命名规范

主目录 CLAUDE.md 已声明用 `git mv`。wiki 补充：
- `raw/` 文件重命名后，必须告知 Claude Code 旧路径和新路径
- 重命名后自动更新所有页面的 `sources:` 引用

## 原始资料变更处理原则

- `raw/` 文件永远只增不删（主目录元原则），过时文件加 `-archived` 后缀
- 文档拆分/合并时，在旧 source 页顶部加变更说明并链接新页
- wiki 页面的内容以最新版本为准，但保留历史沿革说明

## 矛盾处理流程（wiki 侧具体操作）

> 元原则见主目录 CLAUDE.md。以下是 wiki 内的具体落地。

- 版本迭代导致的矛盾：以时间较新的文档为准，旧页面加历史注记
- 真实存在的矛盾：迁入 `wiki/synthesis/conflicts/`，创建专门页面列明双方说法和来源，标注"待业务确认"
- 所有矛盾在解决前保持 `⚠️` 标注，`/lint` 和 `/audit` 时统一列出

---

## 交付前自检清单（wiki 侧）

遵循主目录的自检元原则，wiki 操作的具体自检项：

**每次 /ingest 后自检：**
- ✅ source 页 frontmatter 完整（type、sources、created）
- ✅ 术语已与 glossary 对齐，新术语已询问是否补充
- ✅ 日志已追加
- ⚠️ 明确告知用户：本次未执行 /propagate，相关 entities/concepts 尚未更新

**每次 /propagate 后自检：**
- ✅ 所有提议的创建/修改都经用户确认
- ✅ index.md 和 overview.md 已更新
- ✅ 新增冲突已标 ⚠️ 并归档
- ✅ 日志已追加，列出本次涉及的所有页面

**每次 /refactor 后自检：**
- ✅ 合并后的规范页内容完整
- ✅ 被合并页已变为重定向（未真删）
- ✅ 全 wiki 扫过一次链接，没有指向旧页的断链

禁止使用"应该更新了""相关页面已同步"这类未验证措辞。

---

## Anti-pattern（必须避免）

- ❌ 在 /ingest 时擅自更新 entities/concepts（那是 /propagate 的活）
- ❌ 遇到新旧冲突时自行选边（必须标 ⚠️ 给用户决策）
- ❌ 在 synthesis 页里引入 source 列表以外的信息
- ❌ 主动发起跨页面重构（必须等用户 /refactor）
- ❌ 新增业务术语时跳过 glossary 直接写入页面
- ❌ 删除 raw/ 下的任何文件
