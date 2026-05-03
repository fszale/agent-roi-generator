# CLAUDE.md

This file is for Claude (and any Anthropic model) operating in this
repository. **Read `AGENTS.md` first** — it is the source of truth.
This file only adds Claude-specific shortcuts.

---

## Quick reference

- **Source of truth for any methodology question:** the skill files
  under `.agents/skills/`. They are written for you to consume.
- **Source of truth for "why":** `CONTEXT.md`.
- **Source of truth for "how to operate":** `AGENTS.md`.
- **Pure logic lives in `app/src/lib/`.** Everything testable belongs
  there. Pages should be thin.

## Tone of voice

When writing copy in this repo (UI strings, READMEs, observations,
roadmap deliverables), use **Filip Szalewicz's** voice:

- Plain, direct, slightly dry
- Concrete over abstract — "ship a Slack approval flow" > "leverage
  HITL synergies"
- Comfortable with hard truths — "you are not ready yet" is a valid
  output and should not be softened
- Never marketing-speak. No "unleash", no "transform", no "AI-powered"
  as a self-descriptor

## Common mistakes to avoid

1. **Do not** call an LLM from the scoring path. The whole point of
   these tools is determinism.
2. **Do not** fetch external data at runtime. The tools must work
   offline after first load.
3. **Do not** introduce React state into `app/src/lib/`. That folder
   is pure TypeScript.
4. **Do not** skip the test files. If you added a scoring branch and
   you didn't add a test, the change is not done.

## When you don't know

If you are uncertain whether a change is in scope, **stop and ask in
the PR description**. The codebase is small. It's faster to confirm
than to revert.
