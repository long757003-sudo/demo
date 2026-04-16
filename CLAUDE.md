# CLAUDE.md（主）

## 项目结构
```
my-project-parent/
├── my-project-code/     ← 代码仓库
└── my-project-wiki/     ← wiki 知识库
```

跨仓库路径：
- 代码仓库：`../my-project-code/`
- wiki 仓库：`../my-project-wiki/`
- OpenSpec 归档同步：`cp -r ../my-project-code/openspec/changes/[变更名] ../my-project-wiki/raw/openspec/`

## 写作规范
- 所有文档用中文。
- 不确定的内容标注 `*（待确认）*`。
- 结论必须标注来源。

## graphify
若项目包含 `graphify-out/`：
- 回答架构或代码库问题前，先读 `graphify-out/GRAPH_REPORT.md`。
- 若 `graphify-out/wiki/index.md` 存在，优先导航它而不是读原始文件。
- 本次会话修改代码后，运行：
  `python3 -c "from graphify.watch import _rebuild_code; from pathlib import Path; _rebuild_code(Path('.'))"`

## 代码仓约定
进入 `my-project-code/` 后，参见该仓库下的 `CLAUDE.md`（包含思考原则、OpenSpec 工作流、前端编码规范、Git 规范等）。
