# 团队通用约定

## 项目结构
```
my-project-parent/
├── my-project-code/     ← 代码仓库
└── my-project-wiki/     ← wiki 知识库
```

## 跨仓库操作约定
- 代码仓库路径：`../my-project-code/`
- wiki 仓库路径：`../my-project-wiki/`
- OpenSpec 归档后，将 changes/ 文件同步到 wiki：
  `cp -r ../my-project/openspec/changes/[变更名] ../my-project-wiki/raw/openspec/`

## 通用写作规范
- 所有文档用中文编写
- 不确定的内容标注 `*（待确认）*`
- 结论必须标注来源

## 通用 Git 规范
- 文件重命名使用 `git mv`，不直接 `mv`
- commit message 格式：`类型: 简短描述`
  - 类型：feat / fix / docs / refactor / chore

## Demo 前端编码规范

### 角色 ID 一致性
若在执行中发现某个逻辑角色有两个 ID 并存（如 `unit-admin` / `unit-sysadmin`），不得仅在当前文件修正。必须在同一次提交中搜索全文件所有出现位置并统一为一个 ID，同时在 SUMMARY.md 中注明统一后的标准 ID。后续所有代码严格使用该标准 ID。

### 角色操作列禁止用 else 兜底
为多角色渲染不同操作按钮时，每个"应有特定操作"的角色必须写显式分支；`else` 只允许作为"确实只读/无操作"的兜底。若一个角色应有操作按钮但未在显式分支里出现，视为遗漏，必须修正。

## graphify

This project has a graphify knowledge graph at graphify-out/.

Rules:
- Before answering architecture or codebase questions, read graphify-out/GRAPH_REPORT.md for god nodes and community structure
- If graphify-out/wiki/index.md exists, navigate it instead of reading raw files
- After modifying code files in this session, run `python3 -c "from graphify.watch import _rebuild_code; from pathlib import Path; _rebuild_code(Path('.'))"` to keep the graph current
