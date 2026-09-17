// dist/engine.js
var DAY = 864e5;
function fresh() {
  return { version: 1, name: "Explorer", grade: 1, avatar: "\u{1F331}", seeds: 0, days: [], sessions: [], skills: {}, attempts: [], sound: false, untimed: false, nova: { introduced: false } };
}

// dist/constellation.js
var WORLDS = [
  { name: "Little Meadow", tag: "ONE SMALL STEP", desc: "Count the seeds. Find a path. Let new ideas bloom.", color: "#aee798", ink: "#285849", asset: "meadow.png", landmarks: ["Firefly bridge", "Daisy windmill", "The wishing tree"], story: ["Your first clear ideas light a bridge over the stream.", "Steady practice turns the windmill. New paths lead onward.", "Ideas remembered on different days bring the wishing tree into bloom."] },
  { name: "Canopy Grove", tag: "BUILD ON WHAT YOU KNOW", desc: "Bundle, group, and climb toward the treetops.", color: "#83dbc5", ink: "#17594e", asset: "canopy.png", landmarks: ["Lantern trail", "Sky elevator", "Treetop library"], story: ["Your number patterns light the way into the canopy.", "Connected ideas lift a new platform into the branches.", "Remembered ideas open the treetop library."] },
  { name: "Wonder Lagoon", tag: "A WHOLE SEA OF PIECES", desc: "Share fairly. Look deeper. Discover the whole.", color: "#8cdef5", ink: "#165673", asset: "lagoon.png", landmarks: ["Pearl stepping stones", "Coral arch", "Glass reef"], story: ["Your sharing discoveries reveal a trail of pearls.", "Parts and wholes come together beneath a coral arch.", "Remembered ideas illuminate the glass reef."] },
  { name: "Starlight Summit", tag: "WHERE NOVA BEGAN", desc: "Follow tiny details toward enormous discoveries.", color: "#c9b8ff", ink: "#534785", asset: "summit.png", landmarks: ["Comet trail", "Crystal telescope", "Aurora observatory"], story: ["This is where Nova first sparked. Your ideas light a comet trail.", "Place value and precision focus the crystal telescope.", "Remembered ideas fill the observatory with an aurora."] }
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
    n2.complete = n2.peak > 0;
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
  const chosen = ranked[0]?.n || nodes.count5;
  const reason = chosen.helps.length && !chosen.solid ? `A little ${chosen.name.toLowerCase()} can help with ${chosen.helps[0].toLowerCase()}.` : chosen.due ? "A short revisit will help this idea last." : chosen.fragile ? "Let\u2019s try a smaller step with a helpful picture." : chosen.support > 0.2 && !chosen.history.length ? "Your connected ideas suggest this is worth a quick look." : chosen.prereqs.length && chosen.ready ? `Your ${nodes[chosen.prereqs[0]].name.toLowerCase()} ideas open this path.` : "A little discovery at your pace.";
  const worlds = WORLDS.map((w, i) => {
    const ns = Object.values(nodes).filter((n2) => n2.world === i), milestones = ns.reduce((s, n2) => s + n2.peak, 0);
    return { ...w, nodes: ns, milestones, unlocked: [1, 6, 12].filter((t) => milestones >= t).length, remembered: ns.filter((n2) => n2.mastered).length };
  });
  const earned = Object.values(nodes).filter((n2) => n2.earned).length, rooted = Object.values(nodes).filter((n2) => n2.peak > 0).length;
  return { nodes, worlds, recommendation: chosen, reason, earned, rooted, glow: clamp((rooted + earned * 2) / (NODES.length * 3), 0, 1), fringe: Object.values(nodes).filter((n2) => n2.ready && !n2.solid), ranked };
}

// dist/insights-evidence.js
function learningEvidence(raw, now = Date.now()) {
  const state = { ...fresh(), grade: Number.isInteger(raw?.grade) ? raw.grade : 1, attempts: (Array.isArray(raw?.attempts) ? raw.attempts : []).filter((a) => a && NODES.some((n2) => n2.id === a.node) && Number.isFinite(a.at) && a.at <= now && Number.isFinite(a.ms)), sessions: Array.isArray(raw?.sessions) ? raw.sessions : [] };
  const m = model(state, now);
  return { totalFirstAttempts: state.attempts.length, practiceDays: new Set(state.attempts.map((a) => Math.floor(a.at / DAY))).size, completedLevels: Object.values(m.nodes).filter((n2) => n2.complete).map((n2) => n2.order), rememberedNow: Object.values(m.nodes).filter((n2) => n2.mastered).map((n2) => n2.order), suggestedNext: m.recommendation.name, skills: Object.values(m.nodes).filter((n2) => n2.history.length).map((n2) => ({ level: n2.order, name: n2.name, completionEarned: n2.complete, currentStage: n2.stage, attempts: n2.history.length, independentCorrect: n2.history.filter((a) => a.ok && !a.hint).length, firstAttemptMistakes: n2.history.filter((a) => !a.ok).length, hintAssisted: n2.history.filter((a) => a.hint).length, recentIndependentAccuracy: Math.round(n2.accuracy * 100), successfulDelayedChecks: n2.checks, reviewSuggested: n2.due || n2.fragile, daysSincePractice: Math.floor((now - n2.lastAt) / DAY), formats: [...new Set(n2.history.map((a) => a.form))].filter((x) => ["visual", "story", "symbolic"].includes(x)), recentChallengeLevels: [...new Set(n2.history.slice(-8).map((a) => a.level))] })), limits: "First attempts only. Retries, feelings, ability, personality, diagnoses and life outside this app are not measured. Completion means initial fluent evidence; durable retention is tracked separately. Recent accuracy covers up to eight attempts and different challenge sizes." };
}
export {
  learningEvidence
};
