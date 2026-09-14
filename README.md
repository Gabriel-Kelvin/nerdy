# Nerdy · Pip's math world

Start locally with `npm start`, then visit http://127.0.0.1:5173. No installation or API key is required. Run the learning-engine checks with `npm test`.

The website lives in `dist/`. It includes adaptive arithmetic and visual numeracy practice, six-question adventures, first-attempt evidence, delayed recall, earned companions, optional sound and read-aloud, comfortable pace mode, and a parent journal with JSON export. Grade selection is a starting point; all ten practice areas remain explorable.

## Learning model

Difficulty adjusts within each math area. Seven of the last eight first attempts must be independently correct; six must be comfortably fluent (45 seconds for K–1, 30 seconds for later grades) unless comfortable pace mode is enabled. This schedules a next-day recall. Three independent recall answers are required to pass each delayed check. Successful checks return after 3, 7, then 14 days; a failed check schedules next-day practice and reduces the recall milestone. A session cannot create a second same-day recall opportunity. Completing sessions never grants mastery.

Evidence is stored locally in this browser only. No accounts, synchronization, server analytics, or classroom roster exist in this release. Clearing browser storage removes progress. Settings and the parent journal are not an authenticated parental security boundary.

## Scope and evidence

This is a functional product prototype, not a validated full K–5 curriculum or a proven substitute for tutoring. Ten representative math areas contain varying depth; comprehensive standards coverage, diagnostic placement, transfer tasks, and curriculum-level mastery require further instructional development. Labels refer to observed practice evidence, not certification of an entire subject. The UI is currently English with language-light visual math models and browser-supported read-aloud.

A production school release needs learner accounts and recoverable storage, teacher workflows, accessibility and localization review, safeguarding/privacy review, content validation, and an independently evaluated learning study. A pilot should compare pre/post and delayed assessments at matched difficulty against an appropriate comparison group. Session length alone is not evidence of learning.

The Groq credential supplied in the conversation was not saved or embedded. All question generation and answer checking are deterministic mathematical operations, with zero model token use.
