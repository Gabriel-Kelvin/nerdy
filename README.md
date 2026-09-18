# Nerdy · Nova's math universe

Start locally with `npm start`, then visit http://127.0.0.1:5173. The browser app is in `dist/` and is ready to run. `npm ci` installs pinned dependencies; `npm run build` rebuilds the Supabase SDK bundle. Internet access is required for login and cloud saves. Run `npm test` for learning, cloud-conflict, question-generation, and interaction checks.

## Nova and the four worlds

Nova is one star-spark guide in dedicated panels, questions, constellation, and celebrations. Nova first appears at Starlight Summit, wears a leaf crown in Canopy Grove and fins in Wonder Lagoon, and gains glow/color from earned learning evidence. Lesson guidance uses the adaptive model and reviewed phrases. Clicking Nova opens a small AI chat with a short in-memory context. Closing it cancels the pending request and clears the conversation. No chat text is saved by Nerdy. Prompts and local guards encourage age-appropriate answers, honest AI boundaries and trusted-adult support for personal concerns. Interests are removed from the UI, state normalization and question generation. Nova stays still and is never overlaid on the level map.

The four illustrated landscapes share 24 connected discoveries:

| World | Discoveries |
| --- | --- |
| Little Meadow | Count to 5; count to 20; compare; add within 10; subtract within 10; shapes |
| Canopy Grove | Tens and ones; hundreds and tens; two-digit addition; equal groups; multiplication; rectangle area |
| Wonder Lagoon | Equal sharing; division; halves and quarters; naming fractions; equivalent fractions; like-denominator addition |
| Starlight Summit | Adding lengths; metres to centimetres; tenths; decimal place value; decimal addition; larger multiplication |

The 24 levels unlock in order across Meadow, Canopy, Lagoon, and Summit. Every completed run has six questions. Three independent correct first answers earn one star, five earn two, and six earn three. One star opens the next level immediately; zero stars does not. Help, retries and timed-out attempts do not earn independent-answer credit. Best stars never decrease on replay. Existing completed sessions are scored with the same thresholds, and older earned mastery preserves at least one star. Stars and access are separate from delayed-retention evidence. Every level has six fixed challenge positions (1,1,2,2,3,3), identical across grades and settings; operands and illustrated objects vary on replay.

## Evidence and adaptive review

Each adventure has six questions. Only the first attempt is scored: retries or hint-assisted success never become independent correct answers. Questions alternate story, picture, and symbolic presentation, with subject-specific variations. Ten illustrated object types match the story wording. Counting objects can be tapped; subtraction visibly crosses objects out. Hints have two question-specific steps, and wrong-answer feedback describes the selected misconception. A backend-verified reconstruction of the question grounds optional AI coaching. A useful immediate clue is shown even when the provider is slow or unavailable.

An idea is **Taking root** after at least seven of the latest eight first attempts are correct without help, at least two formats have been solved, a level-two-or-higher challenge has been solved, and six answers meet the comfortable fluency threshold. New attempts use the question's visible time allowance: 30 seconds for count-to-five, shape sides and comparison; 40 seconds for early counting/arithmetic/place value and basic fractions/decimals; 45 seconds for grouping, multiplication, division, area, hundreds and basic measurement; 60 seconds for the remaining multi-step operations. The same question type has the same allowance for everyone. The clock pauses when the page is hidden, a dialog is open, or browser read-aloud is active. A hint or first answer stops it. Expiry records one unsuccessful timed first attempt, then permits practice with help; it never auto-submits a correct answer or prevents finishing. Grade and pace cannot change level content. The old pace control is removed; historical attempts retain their original evidence settings.

**Remembered** additionally requires three successful delayed checks, strong current first-attempt evidence, and a recall estimate above the current-strength threshold. A review checks three independent answers; checks must be at least 18 hours apart. The heuristic forgetting curve uses time since practice and a stability value. Passing reviews increases stability, with comfortable response speed influencing the amount; failing reduces stability and the current recall-check count. Recommendations prioritize due reviews and fragile ideas. This is adaptive scheduling, not fixed 1/3/7-day progression and not a measured probability of retention.

Learning retention still tracks initial fluency and successful delayed checks separately. World scenes grow at 1, 9 and 18 best level stars. The Wonder Vault contains 13 companions (including the starter) plus four world crowns. Companions unlock at levels 1, 3, 6, 7, 9, 12, 13, 15, 18, 19, 21 and 24 with at least one star; crowns require all 18 stars in their world. Cards display exact goals, current progress and a route to the target level. Nova hops and celebrates answers and streaks, leans in to help, and reacts to earned stars. Animations respect reduced-motion preferences. There are no paid unlocks, randomized loot, lost rewards or compulsory extra sessions.

The login/signup page cycles through all four existing landscapes every six seconds, with arrows, dots, keyboard navigation, and touch swipes. It keeps moving after arrow clicks and while hovered or focused, and pauses while the page is hidden; reduced-motion preferences disable automatic movement. Its timers are cleaned up on login and page replacement.

## Accounts and storage

Email/password signup, login, and logout use Supabase. Email verification and password recovery are deferred at the owner's request, with Confirm email disabled. No reset or resend options appear. One explorer is supported per adult account.

Attempts, settings, rewards, theme, and world are stored in Supabase per account. Private exported JSON journals use the `learning-journals` Storage bucket. Ownership-based row-level policies protect records and files. The browser contains only a publishable key. No administrative credential or model API secret is embedded.

Pending saves are cached under the signed-in user ID. Normal saving/saved banners are hidden during play. A save has a 12-second deadline and up to five automatic retries with backoff; failures retain the local copy and show a reconnect action. Detailed status remains in My account. Revision checks merge concurrent discoveries without double-counting rewards. Reset generations prevent stale devices from silently restoring reset progress; an unsaved copy can be downloaded before loading the cloud copy. Earlier device-only progress requires explicit import. Existing practice and rewards are preserved, but legacy broad-skill attempts do not certify the new atomic discoveries.

Supabase project: `kchfinneyxkzwwgptydx` (Mumbai, free tier). Schema and policies: `supabase/schema.sql`. Transactional isolation test: `supabase/verify-rls.sql`. Stars derive from saved completed sessions; no separate editable score counter is stored.

## Scope and validation

This release has 24 discoveries with a prerequisite graph and separate measures for level completion and delayed recall. It does not yet cover a full K–5 curriculum or constitute a validated learning assessment. The interface is English with visual math models and optional browser read-aloud. Comprehensive localization, teacher workflows, accessibility review, instructional content validation, and an independent learning study remain future work.

Tests cover 30,000 legacy questions, 4,320 Nova question samples, graph dependencies, delayed recall, same-day replay protection, permanent earned milestones, legacy preference removal, cloud conflict/account isolation behavior, and the main UI interactions. Real Supabase signup, a separate password login, and state reload were also verified with a disposable account, then the account was removed. These checks establish software behavior, not demonstrated learning gains.

Question answers and lesson guidance are computed locally. Optional chat, question-specific tutoring, and parent insights use Groq's openai/gpt-oss-20b model with low reasoning effort and bounded context/output. In For grown-ups, Ask Nova reads the authenticated account's saved practice and summarizes completed levels, first-attempt errors, hints and delayed recall. Only a derived evidence summary goes to the report model, without the child's name or chat messages. Reports cannot assess personality, ability or diagnoses, and AI summaries can make mistakes. Accounts with no attempts receive a factual starter message.

The Supabase nova Edge Function verifies the access token against Auth and reads progress under the user's RLS policies. It rejects caller-supplied identity/progress. Provider credentials are server-only, in the encrypted Vault (nerdy_groq_api_key), or the GROQ_API_KEY Edge Function secret; never put them in browser files. supabase/nova.sql defines backend-only usage counters and secret access. Limits are 10 chat calls/minute and 100/day, 30 coaching calls/minute and 300/day, and 2 reports/minute and 10/day per account. Coaching receives only a validated node, position, random seed and selected answer; the backend reconstructs the question and its correct worked example, and rejects invalid choices. Repeated clues for the same question are cached in memory. Only counts are stored; prompts and reports are not logged or persisted by this app. Groq processes submitted content under its own [data policies](https://console.groq.com/docs/your-data). The model is available through Groq's free developer plan subject to provider quotas. Rebuild the Edge Function's shared evidence module with npm run build:ai before deploying its index.js, policy.js and learning.js files. verify_jwt is false at the gateway because the function performs its own fresh Auth verification. Original generated artwork and prompt provenance are recorded in `docs/nova-art.json`.


## Play revision validation

Research notes: docs/play-design.md. Tests include 3,600 seeded questions across all 24 levels and six positions, identical difficulty across grades, ten matching illustrations, two distinct worked clues, exact star boundaries, sequential unlocking, best-score preservation, all treasure goals, timer pause/expiry, no double scoring after timeout, and automatic save recovery. Live Supabase verification exercised six consecutive attempt saves, session save, a fresh read confirming one-star unlock, AI hint and wrong-answer coaching, invalid-question rejection and parent-report evidence.


## GitHub and cloud hosting

The browser app is a static site in `dist/`, deployed on Vercel with `vercel.json`. Supabase continues to provide email/password authentication, account-owned learning progress, private journal storage, and the Nova usage counter. Nova's authenticated AI API runs on Render from `render/server.mjs`; it uses the same question validation and child-safe response rules as the Supabase Edge Function. `supabase/render-backend.sql` grants an authenticated account access only to its own daily quota claim.

The Render service uses Node, `npm ci` for its build command, and `node render/server.mjs` for its start command. Configure `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `GROQ_API_KEY`, and `ALLOWED_ORIGINS` as Render environment variables. The Groq key belongs only on the backend. The Vercel project builds with `npm run build` and publishes `dist/`.
