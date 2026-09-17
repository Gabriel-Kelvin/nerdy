# Play design decisions — 17 September 2026

The user's revised requirements take precedence over the earlier mastery gate: a finished run can unlock the next level with one star, while learning/retention evidence remains separate.

## Research informing the revision

- Duolingo describes distinct character reactions to correct exercises and celebrations within a lesson. Nerdy applies that principle with Nova occupying a dedicated stage and responding to answers, hints and streaks; reactions never cover answer controls. [Duolingo: Building character](https://blog.duolingo.com/building-character/)
- Supercell's Trophy Road makes progress milestones and reward destinations visible. The Wonder Vault applies explicit goals and a path to each treasure: a named level with one star, or all 18 stars for a world crown. [Supercell: Trophy Road](https://support.supercell.com/clash-royale/en/articles/trophy-road-5.html)
- Prodigy connects in-game rewards to achieved learning goals. Nerdy reveals companions after earned results, without purchases, timers that destroy rewards, randomized loot or penalties for absence. [Prodigy: Classroom goals and rewards](https://www.prodigygame.com/main-en/teachers/rewards)

These references inform interaction design; they do not establish learning efficacy for Nerdy. Brand artwork and animations were not copied.

## Implemented contract

- Same 24 levels and six challenge positions for everyone; random operands/object types keep replays varied.
- Six questions, first answer only: 0–2 correct = zero stars, 3–4 = one, 5 = two, 6 = three. Hints and timeouts do not count as independent success. Best completed-run stars persist. One star opens the next sequential level.
- Correctness, timing and score are deterministic. AI explains the specific problem and selected wrong answer, using a server-reconstructed problem and verified worked steps. Failure of the AI does not block feedback or play.
- 30/40/45/60-second timers by question type; no grade or pace differences. After expiry the learner can continue practicing. Hidden pages, open dialogs and speech pause the clock.
- Ten original SVG object illustrations: seed, egg, apple, acorn, block, leaf, shell, fish, star and crystal. Object naming and artwork share one registry.
- Seventeen treasures including the starter and four crowns. Cards state exact conditions, show progress, and open the relevant quest. Best stars and unlocked treasures are never revoked by weaker replays.
- Nova's chat remains temporary and clears on close. Parent insights use saved evidence, with numeric checks and the underlying factual record visible.
- Saves remain private to the authenticated account. Background retry and cached pending copies recover from network interruptions; normal save messages stay out of play.

## Limits requiring broader launch work

The automated and live checks verify these software paths. They do not substitute for child usability studies, content review across the whole K–5 curriculum, independent learning-outcome studies, multilingual coverage, a full accessibility audit or production load testing. AI output can still be imperfect; the factual worked clue and report evidence are always available alongside it.
