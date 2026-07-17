---
name: Mockup sandbox first-run vite failure
description: A freshly created mockup-sandbox artifact's dev server workflow fails on first restart.
---

A newly created mockup-sandbox artifact's `Component Preview Server` workflow can fail on its
first restart with `sh: 1: vite: not found`, because `node_modules` hasn't been installed yet
in the artifact's own directory (it's a separate package.json from the main app).

**Why:** Creating the artifact scaffolds files and a workflow, but doesn't always install
dependencies before the workflow's first auto-start attempt.

**How to apply:** If the mockup-sandbox workflow fails immediately after artifact creation, run
`npm install` inside `artifacts/<mockup-sandbox-dir>/` before restarting the workflow again.
