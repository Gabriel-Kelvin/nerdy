// dist/engine.js
var DAY = 864e5;
function fresh() {
  return { version: 1, name: "Explorer", grade: 1, avatar: "\u{1F331}", seeds: 0, days: [], sessions: [], skills: {}, attempts: [], sound: false, untimed: false, nova: { introduced: false } };
}

// dist/journey.js
function starsFor(correct, total = 6) {
  if (!Number.isFinite(correct) || total <= 0) return 0;
  return correct >= total ? 3 : correct / total >= 0.8 ? 2 : correct / total >= 0.5 ? 1 : 0;
}
function bestStars(state, node, legacyPeak = 0) {
  return Math.max(legacyPeak > 0 ? 1 : 0, ...(state.sessions || []).filter((s) => s.node === node && s.total === 6).map((s) => starsFor(s.correct, s.total)));
}
var questionLevel = (index) => [1, 1, 2, 2, 3, 3][Math.max(0, Math.min(5, index))];
function questionSeconds(node) {
  return ["count5", "shapes", "compare"].includes(node) ? 30 : ["count20", "add10", "subtract10", "tens", "halves", "fractions", "tenths", "decimals"].includes(node) ? 40 : ["hundreds", "groups", "multiply", "area", "share", "divide", "length", "convert"].includes(node) ? 45 : 60;
}
var TREASURES = [
  { icon: "\u{1F331}", name: "Little sprout", world: 0, level: 0, tier: "Your first companion", desc: "A little green beginning." },
  { icon: "\u{1F98A}", name: "Ember the fox", world: 0, level: 1, tier: "Meadow companion", desc: "A curious tail for your very first trail." },
  { icon: "\u{1F438}", name: "Ripple the frog", world: 0, level: 3, tier: "Meadow companion", desc: "A pond-hopping partner with enormous dreams." },
  { icon: "\u{1F98B}", name: "Dawnwing", world: 0, level: 6, tier: "World guardian", desc: "Six meadow discoveries bring these wings to life." },
  { icon: "\u{1F43F}\uFE0F", name: "Pocket the squirrel", world: 1, level: 7, tier: "Canopy companion", desc: "A collector of acorns and clever little ideas." },
  { icon: "\u{1F989}", name: "Luma the owl", world: 1, level: 9, tier: "Canopy companion", desc: "Your lantern-eyed lookout among the branches." },
  { icon: "\u{1F99C}", name: "Prism parrot", world: 1, level: 12, tier: "World guardian", desc: "A whole canopy of color, earned one level at a time." },
  { icon: "\u{1F422}", name: "Tide the turtle", world: 2, level: 13, tier: "Lagoon companion", desc: "A gentle explorer of the great blue beyond." },
  { icon: "\u{1F419}", name: "Inky", world: 2, level: 15, tier: "Lagoon companion", desc: "Eight arms, endless curiosity." },
  { icon: "\u{1F42C}", name: "Moonwake", world: 2, level: 18, tier: "World guardian", desc: "A silver leap across the lagoon you have explored." },
  { icon: "\u{1F984}", name: "Comet", world: 3, level: 19, tier: "Summit companion", desc: "A trail of stardust follows every new discovery." },
  { icon: "\u{1F99A}", name: "Aurora plume", world: 3, level: 21, tier: "Summit companion", desc: "A sky full of colors, tucked into one feathered friend." },
  { icon: "\u{1F409}", name: "Nova\u2019s star dragon", world: 3, level: 24, tier: "Journey guardian", desc: "The guardian waiting at the end of all four worlds." },
  ...["\u{1F33C}", "\u{1F343}", "\u{1F41A}", "\u{1F48E}"].map((icon, world) => ({ icon, name: ["Sunflower crown", "Emerald crown", "Pearl crown", "Starlight crown"][world], world, level: (world + 1) * 6, crown: true, tier: "Three-star collection", desc: "Earn all 18 stars in this world to wear its crown." }))
];

// dist/constellation.js
var WORLDS = [
  { name: "Little Meadow", tag: "ONE SMALL STEP", desc: "Count the seeds. Find a path. Let new ideas bloom.", color: "#aee798", ink: "#285849", asset: "meadow.png", landmarks: ["Firefly bridge", "Daisy windmill", "The wishing tree"], story: ["Your first clear ideas light a bridge over the stream.", "Steady practice turns the windmill. New paths lead onward.", "All 18 meadow stars bring the wishing tree into bloom."] },
  { name: "Canopy Grove", tag: "BUILD ON WHAT YOU KNOW", desc: "Bundle, group, and climb toward the treetops.", color: "#83dbc5", ink: "#17594e", asset: "canopy.png", landmarks: ["Lantern trail", "Sky elevator", "Treetop library"], story: ["Your number patterns light the way into the canopy.", "Connected ideas lift a new platform into the branches.", "All 18 canopy stars open the treetop library."] },
  { name: "Wonder Lagoon", tag: "A WHOLE SEA OF PIECES", desc: "Share fairly. Look deeper. Discover the whole.", color: "#8cdef5", ink: "#165673", asset: "lagoon.png", landmarks: ["Pearl stepping stones", "Coral arch", "Glass reef"], story: ["Your sharing discoveries reveal a trail of pearls.", "Parts and wholes come together beneath a coral arch.", "All 18 lagoon stars illuminate the glass reef."] },
  { name: "Starlight Summit", tag: "WHERE NOVA BEGAN", desc: "Follow tiny details toward enormous discoveries.", color: "#c9b8ff", ink: "#534785", asset: "summit.png", landmarks: ["Comet trail", "Crystal telescope", "Aurora observatory"], story: ["This is where Nova first sparked. Your ideas light a comet trail.", "Place value and precision focus the crystal telescope.", "All 18 summit stars fill the observatory with an aurora."] }
];
var n = (id, name, skill, world, grade, prereqs, icon) => ({ id, name, skill, world, grade, prereqs, icon });
var NODES = [
  n("count5", "Count to 5", "count", 0, 0, [], "\u25CF"),
  n("count20", "Count to 20", "count", 0, 0, ["count5"], "\u2022\u2022"),
  n("compare", "Compare numbers", "count", 0, 0, ["count20"], "\u2277"),
  n("add10", "Add within 10", "add", 0, 0, ["count5"], "+"),
  n("subtract10", "Subtract within 10", "subtract", 0, 0, ["count5"], "\u2212"),
  n("shapes", "Shape detectives", "geometry", 0, 0, [], "\u25B3"),
  n("tens", "Tens & ones", "place", 1, 1, ["count20"], "10"),
  n("hundreds", "Hundreds & tens", "place", 1, 2, ["tens"], "100"),
  n("add100", "Add two-digit numbers", "add", 1, 2, ["tens", "add10"], "++"),
  n("groups", "Equal groups", "multiply", 1, 1, ["count20", "add10"], "\u25A6"),
  n("multiply", "Multiplication facts", "multiply", 1, 2, ["groups", "tens"], "\xD7"),
  n("area", "Rectangle area", "geometry", 1, 3, ["multiply", "shapes"], "\u25A1"),
  n("share", "Share equally", "divide", 2, 1, ["count20"], "\xF7"),
  n("divide", "Division facts", "divide", 2, 3, ["share", "multiply"], "\xF7"),
  n("halves", "Halves & quarters", "fraction", 2, 1, ["shapes", "share"], "\xBD"),
  n("fractions", "Name fractions", "fraction", 2, 3, ["halves"], "\u2153"),
  n("equivalent", "Equivalent fractions", "fraction", 2, 4, ["fractions", "multiply"], "="),
  n("addFractions", "Add like fractions", "fraction", 2, 4, ["fractions", "add10"], "\u2156"),
  n("length", "Add lengths", "measure", 3, 1, ["add10"], "\u2194"),
  n("convert", "Metres to centimetres", "measure", 3, 3, ["length", "hundreds"], "cm"),
  n("tenths", "Tenths of a whole", "decimal", 3, 3, ["fractions", "tens"], "\u2152"),
  n("decimals", "Decimal place value", "decimal", 3, 4, ["tenths", "hundreds"], ".1"),
  n("decimalAdd", "Add decimal tenths", "decimal", 3, 4, ["decimals", "add100"], ".+"),
  n("multiMultiply", "Multiply larger numbers", "multiply", 3, 4, ["multiply", "hundreds", "add100"], "\xD710")
];
var byNode = Object.fromEntries(NODES.map((n2) => [n2.id, n2]));
var clamp = (v, a, b) => Math.max(a, Math.min(b, v));
var fluentAttempt = (a) => a.untimed || a.ms <= (a.fluencyLimitMs || 45e3);
function evidence(state, id, now = Date.now()) {
  const history = state.attempts.filter((a) => a.node === id && a.at <= now).sort((a, b) => a.at - b.at || String(a.eventId).localeCompare(String(b.eventId)));
  let stability = 1, checks = 0, lastReview = 0, lastAt = 0, level = 1, peak = 0;
  const batches = /* @__PURE__ */ new Map(), seen = [];
  const forms = /* @__PURE__ */ new Set();
  for (const a of history) {
    seen.push(a);
    lastAt = a.at;
    const clean = a.ok && !a.hint;
    if (clean) forms.add(a.form);
    if (a.review && a.sessionId) {
      const group = batches.get(a.sessionId) || [];
      group.push(a);
      batches.set(a.sessionId, group);
      if (group.length === 3 && a.at - lastReview >= 18 * 36e5) {
        const pass = group.every((x) => x.ok && !x.hint);
        const speed = group.filter(fluentAttempt).length / 3;
        if (pass) {
          checks++;
          stability = clamp(stability * (1.65 + 0.7 * speed) + 0.5, 1, 40);
        } else {
          checks = Math.max(0, checks - 1);
          stability = Math.max(0.7, stability * 0.48);
        }
        lastReview = a.at;
      }
    }
    const prior = seen.slice(-4);
    if (prior.length === 4 && prior.every((x) => x.ok && !x.hint)) level = clamp(level + 1, 1, 3);
    if (prior.slice(-3).filter((x) => !x.ok || x.hint).length >= 2) level = clamp(level - 1, 1, 3);
    const r = seen.slice(-8), good = r.filter((x) => x.ok && !x.hint);
    const fluent2 = good.filter(fluentAttempt).length >= 6;
    if (r.length >= 8 && good.length >= 7 && forms.size >= 2 && fluent2 && seen.some((x) => x.ok && !x.hint && x.level >= 2)) peak = Math.max(peak, checks >= 3 ? 3 : checks >= 1 ? 2 : 1);
  }
  const recent = history.slice(-8), correct = recent.filter((a) => a.ok && !a.hint), accuracy = recent.length ? correct.length / recent.length : 0;
  const fluent = correct.filter(fluentAttempt).length >= 6;
  const variety = new Set(history.filter((a) => a.ok && !a.hint).map((a) => a.form)).size;
  const solid = recent.length >= 8 && correct.length >= 7 && fluent && variety >= 2 && history.some((a) => a.ok && !a.hint && a.level >= 2);
  const age = lastAt ? Math.max(0, (now - lastAt) / DAY) : 0;
  const recall = Math.exp(-age / (stability * 4));
  const fragile = history.length >= 3 && history.slice(-3).filter((a) => !a.ok || a.hint).length >= 2;
  const due = solid && now - (lastReview || lastAt) >= 18 * 36e5 && recall < 0.86;
  const earned = peak === 3;
  const mastered = solid && checks >= 3 && !fragile && recall >= 0.72;
  const confidence = history.length ? clamp(correct.length / 8 * (0.65 + 0.35 * Math.min(variety / 2, 1)) * recall, 0, 1) : 0;
  return { history, accuracy, solid, mastered, earned, peak, checks, stability, recall, fragile, due, confidence, lastAt, lastReview, level, reviewAt: lastAt ? Math.max(lastAt - stability * 4 * DAY * Math.log(0.86), (lastReview || lastAt) + 18 * 36e5) : null };
}
function model(state, now = Date.now()) {
  const nodes = Object.fromEntries(NODES.map((n2) => [n2.id, { ...n2, ...evidence(state, n2.id, now) }]));
  let firstIncomplete = null;
  NODES.forEach((node, index) => {
    const n2 = nodes[node.id];
    n2.order = index + 1;
    n2.previous = NODES[index - 1]?.id || null;
    n2.blockedBy = firstIncomplete;
    n2.unlocked = firstIncomplete === null;
    n2.stars = bestStars(state, n2.id, n2.peak);
    n2.complete = n2.stars > 0;
    if (!n2.complete && !firstIncomplete) firstIncomplete = n2.id;
  });
  for (const n2 of Object.values(nodes)) {
    n2.support = NODES.filter((x) => x.prereqs.includes(n2.id)).reduce((v, x) => Math.max(v, nodes[x.id].confidence * 0.35), 0);
    n2.helps = NODES.filter((x) => x.prereqs.includes(n2.id) && nodes[x.id].fragile).map((x) => x.name);
    n2.ready = n2.unlocked && n2.prereqs.every((id) => nodes[id].solid && nodes[id].recall >= 0.72);
    n2.stage = !n2.unlocked ? "Locked" : n2.mastered ? "Remembered" : n2.due || n2.fragile ? "Rekindle" : n2.solid ? "Taking root" : n2.history.length ? "Growing" : n2.ready ? "Ready to explore" : "A new horizon";
  }
  const ranked = Object.values(nodes).filter((n2) => n2.unlocked).map((n2) => {
    const eligible = n2.grade <= state.grade;
    let score = -100;
    if (n2.helps.length && !n2.solid && n2.history.length) score = 101;
    else if (n2.due) score = 110 + (1 - n2.recall) * 20;
    else if (n2.fragile) score = 95;
    else if (!n2.solid && n2.history.length) score = 65 + (1 - n2.accuracy) * 10;
    else if (n2.ready && !n2.solid) score = 55 + (eligible ? 10 : 0) + n2.grade;
    else if (n2.support > 0.2 && !n2.history.length) score = 76;
    if (n2.solid && !n2.due && !n2.fragile) score = -10;
    return { n: n2, score };
  }).sort((a, b) => b.score - a.score);
  const chosen = firstIncomplete ? nodes[firstIncomplete] : ranked[0]?.n || nodes.count5;
  const reason = chosen.helps.length && !chosen.solid ? `A little ${chosen.name.toLowerCase()} can help with ${chosen.helps[0].toLowerCase()}.` : chosen.due ? "A short revisit will help this idea last." : chosen.fragile ? "Let\u2019s try a smaller step with a helpful picture." : chosen.support > 0.2 && !chosen.history.length ? "Your connected ideas suggest this is worth a quick look." : chosen.prereqs.length && chosen.ready ? `Your ${nodes[chosen.prereqs[0]].name.toLowerCase()} ideas open this path.` : "A little discovery at your pace.";
  const worlds = WORLDS.map((w, i) => {
    const ns = Object.values(nodes).filter((n2) => n2.world === i), milestones = ns.reduce((s, n2) => s + n2.stars, 0);
    return { ...w, nodes: ns, milestones, unlocked: [1, 9, 18].filter((t) => milestones >= t).length, remembered: ns.filter((n2) => n2.mastered).length };
  });
  const earned = Object.values(nodes).filter((n2) => n2.earned).length, rooted = Object.values(nodes).filter((n2) => n2.peak > 0).length;
  return { nodes, worlds, totalStars: Object.values(nodes).reduce((s, n2) => s + n2.stars, 0), completed: Object.values(nodes).filter((n2) => n2.complete).length, recommendation: chosen, reason, earned, rooted, glow: clamp((rooted + earned * 2) / (NODES.length * 3), 0, 1), fringe: Object.values(nodes).filter((n2) => n2.ready && !n2.solid), ranked };
}

// dist/insights-evidence.js
function learningEvidence(raw, now = Date.now()) {
  const state = { ...fresh(), grade: Number.isInteger(raw?.grade) ? raw.grade : 1, attempts: (Array.isArray(raw?.attempts) ? raw.attempts : []).filter((a) => a && NODES.some((n2) => n2.id === a.node) && Number.isFinite(a.at) && a.at <= now && Number.isFinite(a.ms)), sessions: Array.isArray(raw?.sessions) ? raw.sessions : [] };
  const m = model(state, now);
  return { totalFirstAttempts: state.attempts.length, practiceDays: new Set(state.attempts.map((a) => Math.floor(a.at / DAY))).size, completedLevels: Object.values(m.nodes).filter((n2) => n2.complete).map((n2) => n2.order), rememberedNow: Object.values(m.nodes).filter((n2) => n2.mastered).map((n2) => n2.order), suggestedNext: m.recommendation.name, skills: Object.values(m.nodes).filter((n2) => n2.history.length).map((n2) => ({ level: n2.order, name: n2.name, completionEarned: n2.complete, bestStars: n2.stars, currentStage: n2.stage, attempts: n2.history.length, independentCorrect: n2.history.filter((a) => a.ok && !a.hint).length, firstAttemptMistakes: n2.history.filter((a) => !a.ok).length, hintAssisted: n2.history.filter((a) => a.hint).length, timedOut: n2.history.filter((a) => a.timedOut).length, recentIndependentAccuracy: Math.round(n2.accuracy * 100), successfulDelayedChecks: n2.checks, reviewSuggested: n2.due || n2.fragile, daysSincePractice: Math.floor((now - n2.lastAt) / DAY), formats: [...new Set(n2.history.map((a) => a.form))].filter((x) => ["visual", "story", "symbolic"].includes(x)), recentChallengeLevels: [...new Set(n2.history.slice(-8).map((a) => a.level))] })), limits: "First attempts only. Retries, feelings, ability, personality, diagnoses and life outside this app are not measured. Completion means at least one star on a six-question run (3 independent correct answers); this is not mastery. Durable retention is tracked separately. Recent accuracy covers up to eight attempts and different challenge sizes." };
}

// dist/math-objects.js
var svg = (body) => `<svg viewBox="0 0 64 64" aria-hidden="true">${body}</svg>`;
var OBJECTS = {
  seed: { one: "seed", many: "seeds", art: svg('<path d="M49 9C54 34 44 55 27 55 5 52 12 25 49 9Z" fill="#a96a39" stroke="#633b24" stroke-width="3"/><path d="M23 45Q30 27 43 18" fill="none" stroke="#e9bd78" stroke-width="5" stroke-linecap="round"/>') },
  egg: { one: "egg", many: "eggs", art: svg('<path d="M32 6C20 6 11 30 11 42a21 17 0 0 0 42 0C53 30 44 6 32 6Z" fill="#fff4d8" stroke="#c9a975" stroke-width="3"/><path d="M23 18Q16 29 17 37" fill="none" stroke="#fff" stroke-width="5" stroke-linecap="round"/><g fill="#c9a975"><circle cx="38" cy="40" r="2"/><circle cx="27" cy="47" r="2"/><circle cx="41" cy="28" r="1.5"/></g>') },
  apple: { one: "apple", many: "apples", art: svg('<path d="M32 22C5 5 3 46 23 56q9-4 18 0C61 44 59 5 32 22" fill="#ee705c" stroke="#b84439" stroke-width="3"/><path d="M32 22V8" stroke="#72513b" stroke-width="5"/><path d="M34 14Q37 1 53 8Q45 20 34 14" fill="#73b655"/><path d="M19 26q-6 5-5 13" fill="none" stroke="#ffba9c" stroke-width="5" stroke-linecap="round"/>') },
  acorn: { one: "acorn", many: "acorns", art: svg('<path d="M14 28H50Q50 48 32 58Q14 48 14 28" fill="#dca355" stroke="#825527" stroke-width="3"/><path d="M8 29Q12 11 32 12Q52 11 56 29Z" fill="#8c643b" stroke="#5c4028" stroke-width="3"/><path d="M31 13Q29 4 39 5" fill="none" stroke="#5c4028" stroke-width="5"/><path d="M22 35v10" stroke="#f5ca8b" stroke-width="4" stroke-linecap="round"/>') },
  block: { one: "block", many: "blocks", art: svg('<path d="M32 5L57 19V46L32 60 7 46V19Z" fill="#65bfb0" stroke="#277568" stroke-width="3"/><path d="M7 19L32 33 57 19M32 33V60" fill="none" stroke="#277568" stroke-width="3"/><path d="M12 19L32 8 52 19 32 30Z" fill="#b4ebc9"/>') },
  leaf: { one: "leaf", many: "leaves", art: svg('<path d="M53 7Q4 5 12 43Q37 62 53 7Z" fill="#80bd60" stroke="#3d8346" stroke-width="3"/><path d="M9 56L44 18M23 40L22 24M32 31L43 31" stroke="#d5f0a6" stroke-width="3" fill="none"/>') },
  shell: { one: "shell", many: "shells", art: svg('<path d="M24 53L6 30C-1 7 19 6 23 14C27 0 42 0 44 15C59 6 68 23 55 36L41 53Z" fill="#f0b5c1" stroke="#ad677d" stroke-width="3"/><path d="M29 49L18 18M34 49V13M39 48L51 22" stroke="#ffe8d4" stroke-width="4"/><path d="M22 53H43V58H22Z" fill="#e992aa"/>') },
  fish: { one: "fish", many: "fish", art: svg('<path d="M16 30L3 16V48L16 35Q37 62 60 32Q37 3 16 30Z" fill="#60c9e4" stroke="#267792" stroke-width="3"/><path d="M30 20L24 12 43 15M30 44L26 52 44 47" fill="#e8c066"/><circle cx="46" cy="28" r="4" fill="#174452"/>') },
  star: { one: "star", many: "stars", art: svg('<path d="M32 4L40 23 60 25 45 39 49 59 32 49 15 59 19 39 4 25 24 23Z" fill="#ffd475" stroke="#c49336" stroke-width="3"/><path d="M31 15L34 28 23 29" fill="none" stroke="#fff5bd" stroke-width="4" stroke-linecap="round"/>') },
  crystal: { one: "crystal", many: "crystals", art: svg('<path d="M32 3L49 15 57 41 32 61 7 41 15 15Z" fill="#b69bea" stroke="#7256b3" stroke-width="3"/><path d="M32 3L23 25 32 61 42 25Z" fill="#e1d3ff"/><path d="M15 15L23 25H42L49 15" fill="none" stroke="#7256b3" stroke-width="2"/>') }
};
var WORLD_OBJECTS = [["seed", "egg", "apple"], ["acorn", "block", "leaf"], ["shell", "fish", "egg"], ["star", "crystal", "block"]];

// dist/nova-problems.js
function novaProblem(state, node, index = 0, now = Date.now(), seed = Math.floor(Math.random() * 4294967296)) {
  let cursor = seed >>> 0;
  const rand = (a2, b2) => {
    cursor = Math.imul(1664525, cursor) + 1013904223 >>> 0;
    return a2 + Math.floor(cursor / 4294967296 * (b2 - a2 + 1));
  };
  const mix = (a2) => {
    for (let i = a2.length - 1; i > 0; i--) {
      const j = rand(0, i);
      [a2[i], a2[j]] = [a2[j], a2[i]];
    }
    return a2;
  };
  const n2 = byNode[node];
  if (!n2) throw Error("Unknown discovery");
  const level = questionLevel(index), object = WORLD_OBJECTS[n2.world][(index + seed % 3) % 3], thing = OBJECTS[object].many;
  let a, b, c, answer, prompt, display = "", hint, visual = null, choices, form = index % 3 === 0 ? "story" : index % 3 === 1 ? "visual" : "symbolic";
  const cap = [5, 8, 10][level - 1];
  switch (node) {
    case "count5":
    case "count20":
      a = rand(node === "count5" ? 1 : 6, node === "count5" ? 5 : level === 1 ? 10 : 20);
      answer = a;
      prompt = `How many ${thing} can you count?`;
      visual = { type: "count", a };
      hint = `Tap each ${OBJECTS[object].one} once. Count in order from 1${a > 1 ? " to " + a : ""}. Only the real objects count.`;
      if (form === "symbolic") {
        prompt = "Which number comes next?";
        display = `${Math.max(0, a - 2)}, ${a - 1}, ?`;
        visual = null;
        hint = `The numbers go up by 1: ${Math.max(0, a - 2)}, then ${a - 1}. Add 1 to ${a - 1}.`;
      }
      break;
    case "compare":
      a = rand(1, level === 1 ? 10 : 20);
      b = a + rand(1, 5);
      answer = b;
      prompt = `Which group has more ${thing}?`;
      display = `${a} or ${b}`;
      hint = `Compare ${a} and ${b}. Start at ${a}; ${b} is ${b - a} steps farther along the number line.`;
      if (form === "visual") visual = { type: "compare", a, b };
      break;
    case "add10":
      a = rand(1, cap - 1);
      b = rand(1, Math.max(1, Math.min(10 - a, cap)));
      answer = a + b;
      prompt = form === "story" ? `Nova finds ${a} ${thing}, then ${b} more. How many altogether?` : "Bring the two groups together.";
      display = `${a} + ${b} = ?`;
      hint = `Start at ${a}. Count on ${b}: ${Array.from({ length: b }, (_, i) => a + i + 1).join(", ")}.`;
      if (form === "visual") visual = { type: "add", a, b };
      break;
    case "subtract10":
      a = rand(2, cap);
      b = rand(1, a);
      answer = a - b;
      prompt = form === "story" ? `There are ${a} ${thing}. Move ${b} away. How many remain?` : "Find what stays behind.";
      display = `${a} \u2212 ${b} = ?`;
      hint = `Start with ${a}. Cross out ${b}, then count what remains.`;
      if (form === "visual") visual = { type: "subtract", a, b };
      break;
    case "shapes":
      a = ["triangle", "square", "rectangle", "pentagon"][rand(0, level === 1 ? 2 : 3)];
      answer = a === "triangle" ? 3 : a === "pentagon" ? 5 : 4;
      prompt = "How many sides does this shape have?";
      visual = { type: "shape", shape: a };
      hint = `Trace the ${a}. Count its straight edges, not its corners twice. ${a === "rectangle" ? "Two long edges and two short edges make its outline." : a === "triangle" ? "Follow the bottom and its two sloping edges." : a === "square" ? "Follow the top, right, bottom, and left edges." : "Follow the five straight edges around the outside."}`;
      if (form === "symbolic") {
        prompt = `How many sides does a ${a} have?`;
        visual = null;
      }
      choices = [3, 4, 5, 6];
      break;
    case "tens":
      a = rand(1, level === 1 ? 4 : 9);
      b = rand(0, 9);
      answer = a * 10 + b;
      prompt = form === "story" ? `Pack ${a} bundles of 10 ${thing}, with ${b} left over. How many?` : "Build this number.";
      display = `${a} tens + ${b} ones`;
      hint = `${a} tens is ${a * 10}. Add ${b} ones.`;
      if (form === "visual") visual = { type: "place", a, b };
      break;
    case "hundreds":
      a = rand(1, level === 1 ? 4 : 9);
      b = rand(0, 9);
      c = rand(0, 9);
      answer = a * 100 + b * 10 + c;
      prompt = "Build a number from its parts.";
      display = `${a} hundreds + ${b} tens + ${c} ones`;
      hint = `Put ${a} in the hundreds place, ${b} in the tens place, and ${c} in the ones place.`;
      if (form === "visual") visual = { type: "place-labels", a, b, c };
      break;
    case "add100":
      a = rand(10, 49);
      b = rand(10, 49);
      answer = a + b;
      prompt = form === "story" ? `There are ${a} ${thing} on one platform and ${b} on another. How many together?` : "Add the two numbers.";
      display = `${a} + ${b} = ?`;
      hint = `Add tens: ${Math.floor(a / 10) * 10} + ${Math.floor(b / 10) * 10}. Add ones: ${a % 10} + ${b % 10}. Combine both totals.`;
      if (form === "visual") visual = { type: "decompose", a, b };
      break;
    case "groups":
    case "multiply":
      a = rand(2, node === "groups" ? 4 : level * 3 + 1);
      b = rand(2, node === "groups" ? 5 : level * 3 + 1);
      answer = a * b;
      prompt = form === "story" ? `${a} baskets each hold ${b} ${thing}. How many altogether?` : "How many in these equal groups?";
      display = form === "symbolic" ? `${a} \xD7 ${b} = ?` : `${a} groups of ${b}`;
      hint = `Add ${b}, ${a} times: ${Array(a).fill(b).join(" + ")}.`;
      if (form === "visual") visual = { type: "groups", a, b };
      break;
    case "area":
      a = rand(2, level * 3 + 1);
      b = rand(2, level * 2 + 1);
      answer = a * b;
      prompt = "How many square units cover this rectangle?";
      display = `${a} units \xD7 ${b} units`;
      hint = `There are ${a} columns and ${b} rows. Multiply ${a} by ${b}.`;
      if (form !== "symbolic") visual = { type: "area", a, b };
      break;
    case "share":
    case "divide":
      b = rand(2, node === "share" ? 4 : level * 3 + 1);
      answer = rand(1, node === "share" ? 5 : level * 3 + 1);
      a = b * answer;
      prompt = `Share ${a} ${thing} equally among ${b} baskets. How many per basket?`;
      display = `${a} \xF7 ${b} = ?`;
      hint = `Ask: ${b} equal groups of what make ${a}? Try putting one in every basket at a time.`;
      if (form === "visual") visual = { type: "share", a, b };
      break;
    case "halves":
    case "fractions":
      b = node === "halves" ? [2, 4][rand(0, 1)] : [3, 4, 5, 6, 8][rand(0, level + 1)];
      a = rand(1, b - 1);
      answer = `${a}/${b}`;
      prompt = form === "symbolic" ? `${a} of ${b} equal pieces are lit. What fraction is lit?` : "What fraction of the whole is lit?";
      hint = `The whole has ${b} equal pieces. ${a} are lit: ${a}/${b}.`;
      if (form !== "symbolic") visual = { type: "fraction", a, b };
      choices = [answer, `${b}/${b}`, `${a}/${b + 1}`, `${a - 1}/${b}`];
      break;
    case "equivalent":
      b = rand(2, level + 3);
      a = rand(1, b - 1);
      c = rand(2, level + 2);
      answer = a * c;
      display = `${a}/${b} = ?/${b * c}`;
      prompt = "Keep the same amount. Find the missing top number.";
      hint = `The bottom was multiplied by ${c}. Multiply the top ${a} by ${c} too.`;
      if (form === "visual") visual = { type: "equivalent", a, b, c };
      break;
    case "addFractions":
      b = [4, 6, 8, 10][rand(0, level)];
      a = rand(1, b - 2);
      c = rand(1, b - a);
      answer = `${a + c}/${b}`;
      display = `${a}/${b} + ${c}/${b} = ?`;
      prompt = "Join pieces that have the same size.";
      hint = `Keep ${b} as the bottom number. Add ${a} and ${c} on top.`;
      if (form === "visual") visual = { type: "fraction-add", a, b, c };
      choices = [answer, `${a + c}/${2 * b}`, `${a + c - 1}/${b}`, `${a + c + 1}/${b}`];
      break;
    case "length":
      a = rand(1, level * 5);
      b = rand(1, level * 5);
      answer = a + b;
      display = `${a} cm + ${b} cm = ? cm`;
      prompt = "Join two paths. How long is the new path?";
      hint = `Add ${a} and ${b}. Both measurements use centimetres.`;
      if (form === "visual") visual = { type: "ruler", a, b };
      break;
    case "convert":
      a = rand(1, level * 4);
      answer = a * 100;
      display = `${a} m = ? cm`;
      prompt = "Measure a bridge in centimetres.";
      hint = `1 metre is 100 centimetres. Multiply ${a} by 100.`;
      if (form === "visual") visual = { type: "convert", a };
      break;
    case "tenths":
      a = rand(1, 9);
      answer = (a / 10).toFixed(1);
      prompt = "Write the lit part as a decimal.";
      display = form === "symbolic" ? `${a}/10 = ?` : "";
      hint = `${a} tenths is written 0.${a}. The first place after the dot counts tenths.`;
      if (form !== "symbolic") visual = { type: "fraction", a, b: 10 };
      choices = [answer, `${a}.0`, (Math.max(0, a - 1) / 10).toFixed(1), (Math.min(10, a + 1) / 10).toFixed(1)];
      break;
    case "decimals":
      a = rand(1, 9);
      b = rand(1, 9);
      answer = (a + b / 10).toFixed(1);
      display = `${a} ones + ${b} tenths = ?`;
      prompt = "Build a decimal from its places.";
      hint = `Write ${a} before the dot and ${b} after it: ${a}.${b}.`;
      choices = [answer, (a + (b - 1) / 10).toFixed(1), (a + (b + 1) / 10).toFixed(1), (a + 1 + b / 10).toFixed(1)];
      if (form === "visual") visual = { type: "decimal-place", a, b };
      break;
    case "decimalAdd":
      a = rand(1, level * 15);
      b = rand(1, level * 15);
      answer = ((a + b) / 10).toFixed(1);
      display = `${(a / 10).toFixed(1)} + ${(b / 10).toFixed(1)} = ?`;
      prompt = "Join two lengths measured in tenths.";
      hint = `${a} tenths + ${b} tenths = ${a + b} tenths. Ten tenths make one whole.`;
      choices = [answer, ((a + b + 1) / 10).toFixed(1), ((a + b + 10) / 10).toFixed(1), ((a + b - 1) / 10).toFixed(1)];
      if (form === "visual") visual = { type: "decimal-split", a, b };
      break;
    case "multiMultiply":
      a = rand(12, level * 15 + 10);
      b = rand(2, level + 4);
      answer = a * b;
      display = `${a} \xD7 ${b} = ?`;
      prompt = form === "story" ? `${b} crates each hold ${a} ${thing}. How many altogether?` : "Multiply by splitting the larger number.";
      hint = `${Math.floor(a / 10) * 10} \xD7 ${b} = ${Math.floor(a / 10) * 10 * b}; ${a % 10} \xD7 ${b} = ${a % 10 * b}. Add both parts.`;
      if (form === "visual") visual = { type: "multiply-split", a, b };
      break;
  }
  if (!choices) {
    const set = /* @__PURE__ */ new Set([answer]);
    let offset = 1;
    while (set.size < 4) {
      set.add(answer + offset);
      if (answer - offset >= 0 && set.size < 4) set.add(answer - offset);
      offset++;
    }
    choices = [...set];
  }
  choices = mix([...new Set(choices)]);
  if (choices.length !== 4) throw Error(`Choice collision in ${node}`);
  if (visual) visual.object = object;
  const steps = { count5: visual ? `Count: ${Array.from({ length: a }, (_, i) => i + 1).join(", ")}. There ${a === 1 ? "is" : "are"} ${a} ${a === 1 ? OBJECTS[object].one : thing}.` : `${a - 1} + 1 = ${a}. So the next number is ${a}.`, count20: visual ? `Count in groups of five, then the leftovers. The total is ${a} ${thing}.` : `${a - 1} + 1 = ${a}.`, compare: `${b} is greater than ${a} because it has ${b - a} more.`, add10: `${a} + ${b} = ${answer}. The two groups together have ${answer} ${thing}.`, subtract10: `${a} \u2212 ${b} = ${answer}. After moving ${b} away, ${answer} remain.`, shapes: `A ${a} has ${answer} straight sides.`, tens: `${a} \xD7 10 + ${b} = ${answer}.`, hundreds: `${a * 100} + ${b * 10} + ${c} = ${answer}.`, add100: `${Math.floor(a / 10) * 10 + Math.floor(b / 10) * 10} tens-value + ${a % 10 + b % 10} ones = ${answer}.`, groups: `${a} groups of ${b} make ${answer}.`, multiply: `${a} \xD7 ${b} = ${answer}.`, area: `${a} columns \xD7 ${b} rows = ${answer} square units.`, share: `${b} baskets \xD7 ${answer} each = ${a} altogether.`, divide: `${a} \xF7 ${b} = ${answer}, because ${b} \xD7 ${answer} = ${a}.`, halves: `${a} lit pieces out of ${b} equal pieces is ${answer}.`, fractions: `The top counts lit pieces (${a}); the bottom counts all pieces (${b}). That is ${answer}.`, equivalent: `${a} \xD7 ${c} = ${answer}; ${b} \xD7 ${c} = ${b * c}. Both parts grow by the same factor.`, addFractions: `${a} + ${c} = ${a + c}. The pieces stay the same size: ${answer}.`, length: `${a} + ${b} = ${answer} centimetres.`, convert: `${a} \xD7 100 = ${answer} centimetres.`, tenths: `${a} \xF7 10 = ${answer}.`, decimals: `${a} whole ones plus ${b} tenths is ${answer}.`, decimalAdd: `${a} + ${b} = ${a + b} tenths, written ${answer}.`, multiMultiply: `${Math.floor(a / 10) * 10 * b} + ${a % 10 * b} = ${answer}.` };
  return { id: n2.skill, node, index, seed, level, form, answer, prompt, display, hint, worked: steps[node], visual, choices, object, timeLimit: questionSeconds(node) };
}

// dist/coaching.js
function coachingFacts(q, { mode = "hint", selected, step = 0 } = {}) {
  const hint = step > 0 ? q.worked : q.hint;
  let observation = "";
  if (mode === "wrong") {
    if (typeof q.answer === "number" && Number.isFinite(Number(selected))) {
      const difference = Number(selected) - q.answer;
      observation = q.node.startsWith("count") && q.visual ? `You counted ${selected}. That is ${Math.abs(difference)} ${difference > 0 ? "too many" : "too few"}.` : q.node === "compare" ? `You chose ${selected}; the question asks for the larger group.` : `${selected} does not fit this question yet.`;
    } else observation = `You chose ${selected}. Let\u2019s check how the pieces fit.`;
  }
  return { mode, prompt: q.prompt, display: q.display, selected: mode === "wrong" ? String(selected) : void 0, correctAnswer: String(q.answer), instruction: hint, observation, reply: [observation, hint].filter(Boolean).join(" "), step };
}
function validCoaching(reply, facts) {
  if (typeof reply !== "string" || !reply.trim() || reply.length > 700) return false;
  if (/https?:|www\.|\b(stupid|dumb|idiot|loser|hate|sexy|fuck)\b/i.test(reply)) return false;
  const permitted = new Set(JSON.stringify(facts).match(/\d+(?:\.\d+)?/g) || []);
  return (reply.match(/\d+(?:\.\d+)?/g) || []).every((n2) => permitted.has(n2));
}
export {
  coachingFacts,
  learningEvidence,
  novaProblem,
  validCoaching
};
