# CONTEXT.md — why this project exists

## The problem

Most "AI strategy" content for operators is either a vendor pitch dressed
as a framework, or a McKinsey-shaped slide deck that costs $200K and
recommends what the team already knew. Neither helps the operator who
has to walk into a budget meeting on Tuesday and answer one question:

> "Of the things AI could do for us, which **one** should we ship first,
> and what's the realistic 30/60/90?"

That is the only question these two tools try to answer.

## The audience

The primary audience is one of three personas:

1. **The operator-VP.** Owns a P&L line, has a real process they want
   to compress, has been told to "have an AI plan" and wants a 5-minute
   way to get past the buzzword stage.
2. **The internal champion.** A senior IC who has prototyped something,
   needs to convince leadership it's worth committing to, and wants a
   one-page artifact to bring to the next steering committee.
3. **The fractional-CTO / consultant.** Wants a fast intake to use with
   their own clients, may fork the repo, and would prefer one that
   doesn't ask their client to create an account.

All three want the same thing: a deterministic, opinionated answer.
Not a chatbot.

## The brand promise

- **No signup.** Ever. The moment the visitor sees an email gate, the
  tool has failed.
- **No bullshit.** "Not ready yet" is a valid output. The tools refuse
  to recommend an agent for a workflow that isn't ready.
- **Auditable.** Every weight, threshold, and rule is in the repo. If
  you disagree with the methodology, you can point at the line.
- **Take five minutes, get a real plan.** Not a chat. A document.

## The business model

The tools are free. They exist to do three things:

1. **Self-qualify.** A visitor who completes the ROI report and lands
   in "Strong AI candidate" with a complex regulated workflow is a
   high-quality strategy-session lead. A visitor who lands in "Not
   ready yet" is honestly told so, and bookmarks the site.
2. **Earn trust by giving away the methodology.** The skills under
   `.agents/skills/` are the honest version of what would otherwise
   be the first slide of a $50K consulting engagement.
3. **Anchor the brand.** "The person whose ROI tool everyone forwarded"
   is a better positioning than "the consultant with a deck about AI".

The CTA is `solidcage.com/book`. That's the funnel.

## Voice

Direct. Operator-first. Comfortable with "no". The tone is closer to a
senior staff engineer giving a peer review than a salesperson giving a
pitch. If you wouldn't say it in a 1:1 with a CTO who is busy, don't
write it in the UI.

## What this is NOT

- A chatbot
- A model evaluator
- A vendor selection tool
- A general "AI strategy" platform
- A consulting marketing site dressed up as a tool

If a feature request would turn it into one of those, it's out of scope.
