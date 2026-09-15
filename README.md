# Nerdy · Pip's math world

Start locally with `npm start`, then visit http://127.0.0.1:5173. The bundled browser app is ready to run. Use `npm ci` and `npm run build` only to rebuild the pinned Supabase SDK bundle. Internet access is needed for authentication and cloud storage. Run the learning-engine checks with `npm test`.

The website lives in `dist/`. It includes adaptive arithmetic and visual numeracy practice, six-question adventures, first-attempt evidence, delayed recall, earned companions, optional sound and read-aloud, comfortable pace mode, and a parent journal with JSON export. Grade selection is a starting point; all ten practice areas remain explorable.

## Learning model

Difficulty adjusts within each math area. Seven of the last eight first attempts must be independently correct; six must be comfortably fluent (45 seconds for K–1, 30 seconds for later grades) unless comfortable pace mode is enabled. This schedules a next-day recall. Three independent recall answers are required to pass each delayed check. Successful checks return after 3, 7, then 14 days; a failed check schedules next-day practice and reduces the recall milestone. A session cannot create a second same-day recall opportunity. Completing sessions never grants mastery.

Evidence, explorer settings, rewards, theme, and selected world are stored in Supabase per adult account. Email/password signup, confirmation resend, login, logout, and password recovery are implemented. The private learning-journals Storage bucket holds exported JSON journals. Row-level policies restrict records and files to their owner. The browser contains only a publishable key, never an administrative credential.

Pending saves are cached under the signed-in user ID and retried when connectivity returns. Revision checks merge concurrent discoveries without double-counting rewards. Resets use a separate generation; conflicting unsaved progress can be downloaded before loading the cloud copy. Earlier device-only progress requires explicit import in My account. One explorer is supported per adult account; classroom rosters and multiple child profiles are not implemented.

Supabase project: kchfinneyxkzwwgptydx (Mumbai, free tier). Schema and policies are in supabase/schema.sql. The transactional test supabase/verify-rls.sql checks two-account isolation and rolls back its fixtures.

Email uses Supabase's built-in free sender, as requested. It only sends to project-team addresses and is rate-limited (currently two messages per hour). Public verification and password-reset delivery require custom SMTP; the app cannot override this provider restriction. Email confirmation remains enabled. Localhost and the hosted website are registered redirect destinations. See https://supabase.com/docs/guides/auth/auth-smtp.

## Scope and evidence

This is a functional product prototype, not a validated full K–5 curriculum or a proven substitute for tutoring. Ten representative math areas contain varying depth; comprehensive standards coverage, diagnostic placement, transfer tasks, and curriculum-level mastery require further instructional development. Labels refer to observed practice evidence, not certification of an entire subject. The UI is currently English with language-light visual math models and browser-supported read-aloud.

A production school release needs teacher workflows, accessibility and localization review, safeguarding/privacy review, content validation, and an independently evaluated learning study. A pilot should compare pre/post and delayed assessments at matched difficulty against an appropriate comparison group. Session length alone is not evidence of learning.

The Groq credential supplied in the conversation was not saved or embedded. All question generation and answer checking are deterministic mathematical operations, with zero model token use.
