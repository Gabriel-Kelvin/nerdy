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

The 24 levels unlock in order across Meadow, Canopy, Lagoon, and Summit. A level opens only when every preceding level has earned its Taking root milestone through independent fluent answers. Earned access persists after breaks; delayed recall remains separate. All four worlds can be previewed, while locked levels explain what to finish first. Lesson entry, recommendations, and the constellation share this gate. Existing advanced evidence is preserved but cannot bypass an unfinished earlier level. The prerequisite graph continues to guide readiness and review among accessible levels.

## Evidence and adaptive review

Each adventure has six questions. Only the first attempt is scored: retries or hint-assisted success never become independent correct answers. Challenge level adjusts from recent unassisted performance. Questions alternate story, picture, and symbolic presentation, with subject-specific variations.

An idea is **Taking root** after at least seven of the latest eight first attempts are correct without help, at least two formats have been solved, a level-two-or-higher challenge has been solved, and six answers meet the comfortable fluency threshold. Thresholds are 45 seconds for K–1 and 30 seconds later, with no visible timer. Comfortable pace removes the speed requirement for attempts made in that mode. Each attempt retains its fluency setting, so changing settings cannot revoke earned discoveries.

**Remembered** additionally requires three successful delayed checks, strong current first-attempt evidence, and a recall estimate above the current-strength threshold. A review checks three independent answers; checks must be at least 18 hours apart. The heuristic forgetting curve uses time since practice and a stability value. Passing reviews increases stability, with comfortable response speed influencing the amount; failing reduces stability and the current recall-check count. Recommendations prioritize due reviews and fragile ideas. This is adaptive scheduling, not fixed 1/3/7-day progression and not a measured probability of retention.

Each discovery can earn three permanent milestones: taking root, one delayed check, and three delayed checks. World story beats and visible light/path effects unlock at totals of 1, 6, and 12 milestones. Keepsakes and Nova's glow use earned evidence. Current readiness can fade while earned scenery and keepsakes remain. There are no paid unlocks, lost streak rewards, or compulsory extra sessions.

The login/signup page cycles through all four existing landscapes every six seconds, with arrows, dots, keyboard navigation, and touch swipes. It keeps moving after arrow clicks and while hovered or focused, and pauses while the page is hidden; reduced-motion preferences disable automatic movement. Its timers are cleaned up on login and page replacement.

## Accounts and storage

Email/password signup, login, and logout use Supabase. Email verification and password recovery are deferred at the owner's request, with Confirm email disabled. No reset or resend options appear. One explorer is supported per adult account.

Attempts, settings, rewards, theme, and world are stored in Supabase per account. Private exported JSON journals use the `learning-journals` Storage bucket. Ownership-based row-level policies protect records and files. The browser contains only a publishable key. No administrative credential or model API secret is embedded.

Pending saves are cached under the signed-in user ID. Revision checks merge concurrent discoveries without double-counting rewards. Reset generations prevent stale devices from silently restoring reset progress; an unsaved copy can be downloaded before loading the cloud copy. Earlier device-only progress requires explicit import. Existing practice and rewards are preserved, but legacy broad-skill attempts do not certify the new atomic discoveries.

Supabase project: `kchfinneyxkzwwgptydx` (Mumbai, free tier). Schema and policies: `supabase/schema.sql`. Transactional isolation test: `supabase/verify-rls.sql`. Nova's metadata fits the existing state document without a schema migration.

## Scope and validation

This is a functional prototype with a prerequisite graph, not an ALEKS implementation or a validated Knowledge Space Theory assessment. Twenty-four representative discoveries do not constitute a full K–5 curriculum. The interface is English with visual math models and optional browser read-aloud. Comprehensive localization, teacher workflows, accessibility review, instructional content validation, and an independent learning study remain future work.

Tests cover 30,000 legacy questions, 4,320 Nova question samples, graph dependencies, delayed recall, same-day replay protection, permanent earned milestones, legacy preference removal, cloud conflict/account isolation behavior, and the main UI interactions. Real Supabase signup, a separate password login, and state reload were also verified with a disposable account, then the account was removed. These checks establish software behavior, not demonstrated learning gains.

Question answers and lesson guidance are computed locally. Optional chat and parent insights use Groq's openai/gpt-oss-20b model with low reasoning effort and bounded context/output. In For grown-ups, Ask Nova reads the authenticated account's saved practice and summarizes completed levels, first-attempt errors, hints and delayed recall. Only a derived evidence summary goes to the report model, without the child's name or chat messages. Reports cannot assess personality, ability or diagnoses, and AI summaries can make mistakes. Accounts with no attempts receive a factual starter message.

The Supabase nova Edge Function verifies the access token against Auth and reads progress under the user's RLS policies. It rejects caller-supplied identity/progress. Provider credentials are server-only, in the encrypted Vault (nerdy_groq_api_key), or the GROQ_API_KEY Edge Function secret; never put them in browser files. supabase/nova.sql defines backend-only usage counters and secret access. Limits are 10 chat calls/minute and 100/day, and 2 reports/minute and 10/day per account. Only counts are stored; prompts and reports are not logged or persisted by this app. Groq processes submitted content under its own [data policies](https://console.groq.com/docs/your-data). The model is available through Groq's free developer plan subject to provider quotas. Rebuild the Edge Function's shared evidence module with npm run build:ai before deploying its index.js, policy.js and learning.js files. verify_jwt is false at the gateway because the function performs its own fresh Auth verification. Original generated artwork and prompt provenance are recorded in `docs/nova-art.json`.
