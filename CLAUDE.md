# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Version Control

This project uses Git with GitHub (BenTheWin/ClaudeTest, private).

**Commit and push regularly throughout all work** — after every meaningful unit of progress (new file, feature complete, bug fixed, config changed). Never batch up large amounts of work before committing. The goal is that GitHub always reflects current state so work is never lost and any change can be reverted.

```bash
git add <files>
git commit -m "concise description of what changed and why"
git push
```

Commit messages should be clear and descriptive — explain *why*, not just *what*. Use the imperative mood ("add", "fix", "update"), keep the subject line under 72 characters, and include context in the body when the reason isn't obvious from the code.
