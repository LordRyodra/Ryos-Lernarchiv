(() => {
  const DATA = window.LEARNING_ARCHIVE_DATA;
  const STORAGE_KEY = "ryosLernarchiv.v0.2.formenkenntnis";
  const $ = (selector) => document.querySelector(selector);

  const modes = [
    { id: "plants", label: "Pflanzen", target: "plants", question: "family", text: "100 Pflanzen: Familie, Gattung, Art." },
    { id: "familyDrill", label: "Familien-Diagnose", target: "plants", question: "familyTraits", text: "Merkmale → passende Pflanzenfamilie." },
    { id: "animals", label: "Tiere", target: "animals", question: "family", text: "Tiere: Taxonomie, Familien, Ordnungen." },
    { id: "species", label: "Artnamen", target: "all", question: "species", text: "Deutsch ↔ wissenschaftlich." },
    { id: "traits", label: "Merkmale", target: "all", question: "traits", text: "Merkmale wirklich begründen." }
  ];

  const defaultState = {
    mode: "plants",
    filterGroup: "all",
    selectedCluster: null,
    quiz: null,
    mastery: {},
    proofs: [],
    familyMastery: {}
  };

  let state = loadState();

  function loadState() {
    try {
      return { ...defaultState, ...(JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}) };
    } catch {
      return { ...defaultState };
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function items() {
    return [...DATA.plants, ...DATA.animals];
  }

  function currentMode() {
    return modes.find((m) => m.id === state.mode) || modes[0];
  }

  function relevantItems() {
    const mode = currentMode();
    let base = items();
    if (mode.target !== "all") base = base.filter((item) => item.group === mode.target);
    if (state.filterGroup !== "all") {
      base = base.filter((item) => clusterKey(item) === state.filterGroup);
    }
    return base;
  }

  function clusterKey(item) {
    if (item.group === "plants") return `plants:${item.family || "Unbekannt"}`;
    return `animals:${item.order || item.family || item.className || "Unbekannt"}`;
  }

  function clusterTitle(key) {
    const [group, name] = key.split(":");
    if (group === "plants") return `${name}`;
    return name;
  }

  function mastery(item) {
    return state.mastery[item.id] || { family: 0, species: 0, traits: 0, recognition: 0, attempts: 0, correct: 0 };
  }

  function masteryPercent(item) {
    const m = mastery(item);
    const values = [m.family || 0, m.species || 0, m.traits || 0, m.recognition || 0];
    return Math.round(values.reduce((a, b) => a + b, 0) / (values.length * 3) * 100);
  }

  function plantFamilies() {
    return [...new Set(DATA.plants.map((item) => item.family).filter(Boolean))].sort();
  }

  function familyItems(family) {
    return DATA.plants.filter((item) => item.family === family);
  }

  function familyMastery(family) {
    return state.familyMastery?.[family] || { level: 0, attempts: 0, correct: 0 };
  }

  function familyPercent(family) {
    const fm = familyMastery(family);
    return Math.round(((fm.level || 0) / 5) * 100);
  }

  function itemName(item) {
    return item.germanName || item.displayName || item.scientificName || "Unbenannt";
  }

  function scientific(item) {
    return item.scientificName || item.displayName || "—";
  }

  function groupLabel(item) {
    if (!item) return "";
    if (item.group === "plants") return "Pflanze";
    if (item.group === "animals") return "Tier";
    return item.group || "";
  }

  function itemTaxonomyLine(item) {
    if (!item) return "";
    const parts = [groupLabel(item)];
    if (item.order) parts.push(`Ordnung: ${item.order}`);
    if (item.family) parts.push(`Familie: ${item.family}`);
    return parts.filter(Boolean);
  }

  function daysUntil(dateStr) {
    const today = new Date();
    const target = new Date(`${dateStr}T00:00:00`);
    return Math.ceil((target - today) / 86400000);
  }

  function examFor(group) {
    return DATA.exams.find((exam) => exam.scope === group);
  }

  function overallStats() {
    const all = items();
    const plants = DATA.plants;
    const animals = DATA.animals;
    const mastered = all.filter((item) => masteryPercent(item) >= 80).length;
    return { all: all.length, plants: plants.length, animals: animals.length, mastered };
  }

  function renderHeader() {
    const s = overallStats();
    const pExam = examFor("plants");
    const aExam = examFor("animals");
    $("#headerStats").innerHTML = `
      <div class="stat-pill"><strong>${s.mastered}/${s.all}</strong><span>sicher ≥80%</span></div>
      <div class="stat-pill"><strong>${s.plants}</strong><span>Pflanzen</span></div>
      <div class="stat-pill"><strong>${s.animals}</strong><span>Tiere</span></div>
      <div class="stat-pill"><strong>${daysUntil(pExam.date)}</strong><span>Tage Pflanzen</span></div>
      <div class="stat-pill"><strong>${daysUntil(aExam.date)}</strong><span>Tage Tiere</span></div>
    `;
  }

  function renderQuickstart() {
    const mode = currentMode();
    const pExam = examFor("plants");
    const aExam = examFor("animals");
    const weak = getWeakItems(1)[0];
    $("#quickstartCard").innerHTML = `
      <div class="quick-grid">
        <div>
          <p class="eyebrow">Schnellstart</p>
          <h2>${escapeHTML(mode.label)} trainieren</h2>
          <p class="muted">${escapeHTML(mode.text)} Fortschritt steigt nur durch richtige Quizantworten oder einen gespeicherten Lernbeweis.</p>
          <div class="exam-row">
            <span class="exam-chip"><strong>${escapeHTML(pExam.title)}</strong>: ${formatDate(pExam.date)} · ${daysUntil(pExam.date)} Tage</span>
            <span class="exam-chip"><strong>${escapeHTML(aExam.title)}</strong>: ${formatDate(aExam.date)} · ${daysUntil(aExam.date)} Tage</span>
          </div>
          ${weak ? `<p style="margin-top:12px"><span class="status-chip status-danger">Aktuelle Gefahrenzone: ${escapeHTML(itemName(weak))} · ${masteryPercent(weak)}%</span></p>` : ""}
        </div>
        <div class="controls">
          <button class="primary-button" type="button" data-action="new-quiz">Neue Frage</button>
          <button class="ghost-button" type="button" data-action="focus-weak">Schwächstes Thema</button>
          <button class="ghost-button" type="button" data-action="start-family-drill">Familien-Diagnose</button>
        </div>
      </div>
    `;
  }

  function renderModes() {
    $("#modeBar").innerHTML = modes.map((mode) => `
      <button class="mode-button ${state.mode === mode.id ? "active" : ""}" type="button" data-action="set-mode" data-id="${mode.id}">
        <strong>${escapeHTML(mode.label)}</strong><br><span>${escapeHTML(mode.text)}</span>
      </button>
    `).join("");
  }

  function clusters() {
    const mode = currentMode();
    let base = items();
    if (mode.target !== "all") base = base.filter((item) => item.group === mode.target);
    const map = new Map();
    base.forEach((item) => {
      const key = clusterKey(item);
      if (!map.has(key)) map.set(key, []);
      map.get(key).push(item);
    });
    return [...map.entries()].map(([key, list]) => ({ key, list, avg: Math.round(list.reduce((s, item) => s + masteryPercent(item), 0) / list.length) }))
      .sort((a, b) => a.avg - b.avg || b.list.length - a.list.length);
  }

  function renderMap() {
    const cls = clusters();
    $("#mapFilter").innerHTML = `
      <button class="filter-button ${state.filterGroup === "all" ? "active" : ""}" type="button" data-action="set-filter" data-id="all">Alle</button>
      ${cls.slice(0, 18).map((c) => `<button class="filter-button ${state.filterGroup === c.key ? "active" : ""}" type="button" data-action="set-filter" data-id="${escapeAttr(c.key)}">${escapeHTML(clusterTitle(c.key))}</button>`).join("")}
    `;
    $("#examMap").innerHTML = cls.map((c) => {
      const tone = c.avg >= 80 ? "status-ok" : c.avg >= 35 ? "status-warning" : "status-danger";
      return `<article class="node-card ${state.filterGroup === c.key ? "active" : ""}">
        <div>
          <h3>${escapeHTML(clusterTitle(c.key))}</h3>
          <div class="meta-line"><span>${c.list.length} Einträge</span><span>${c.avg}% sicher</span></div>
        </div>
        <div class="progress-bar"><div class="progress-fill" style="width:${c.avg}%"></div></div>
        <span class="status-chip ${tone}">${c.avg >= 80 ? "stabil" : c.avg >= 35 ? "im Aufbau" : "kritisch"}</span>
        <button class="ghost-button" type="button" data-action="set-filter" data-id="${escapeAttr(c.key)}">Öffnen</button>
      </article>`;
    }).join("");
  }

  function getWeakItems(limit = 8) {
    const pool = relevantItems().length ? relevantItems() : items();
    return [...pool].sort((a, b) => masteryPercent(a) - masteryPercent(b)).slice(0, limit);
  }

  function renderDangerZones() {
    const weak = getWeakItems(6);
    $("#dangerZones").innerHTML = weak.length ? weak.map((item) => `
      <div class="danger-zone">
        <h3>${escapeHTML(itemName(item))}</h3>
        <div class="meta-line"><span>${escapeHTML(scientific(item))}</span><span>${escapeHTML(item.family || item.order || "")}</span><span>${masteryPercent(item)}%</span></div>
        <button class="ghost-button" type="button" data-action="train-item" data-id="${item.id}">Jetzt prüfen</button>
      </div>
    `).join("") : `<div class="empty-state">Keine Gefahrenzone im aktuellen Filter.</div>`;
  }

  function renderQuestLog() {
    const plantsExam = examFor("plants");
    const animalsExam = examFor("animals");
    const plantOpen = DATA.plants.filter((item) => masteryPercent(item) < 80).length;
    const animalOpen = DATA.animals.filter((item) => masteryPercent(item) < 80).length;
    const plantPerDay = Math.max(1, Math.ceil(plantOpen / Math.max(1, daysUntil(plantsExam.date))));
    const animalPerDay = Math.max(1, Math.ceil(animalOpen / Math.max(1, daysUntil(animalsExam.date))));
    const quests = [
      { title: `Pflanzen: ${plantPerDay} neue/stabile Einträge`, text: `${plantOpen} Pflanzen unter 80%. Familien zuerst.` , mode: "plants"},
      { title: `Tiere: ${animalPerDay} neue/stabile Einträge`, text: `${animalOpen} Tiere unter 80%. Ordnung/Familie zuerst.` , mode: "animals"},
      { title: "Familien-Diagnose", text: "Merkmale sehen → Familie nennen. Perfekt gegen reines Arten-Auswendiglernen.", mode: "familyDrill"},
      { title: "Merkmalsbeweis", text: "Nimm 1 unsicheren Eintrag und schreibe 3 echte Merkmale auf.", mode: "traits"}
    ];
    $("#questLog").innerHTML = quests.map((q) => `
      <div class="quest-item">
        <h3>${escapeHTML(q.title)}</h3>
        <p class="muted">${escapeHTML(q.text)}</p>
        <button class="ghost-button" type="button" data-action="set-mode" data-id="${q.mode}">Starten</button>
      </div>
    `).join("");
  }

  function makeQuiz(forcedItem = null) {
    const mode = currentMode();
    if (mode.question === "familyTraits") {
      makeFamilyQuiz();
      return;
    }
    const pool = relevantItems().filter((item) => item.family || item.germanName || item.scientificName || item.displayName);
    const item = forcedItem || weightedPick(pool.length ? pool : items());
    const questionType = mode.question;
    let prompt = "";
    let answer = "";
    let field = "family";

    if (questionType === "species") {
      field = "species";
      if (item.scientificName || item.displayName) {
        prompt = `Welcher deutsche Name gehört zu: ${scientific(item)}?`;
        answer = item.germanName || itemName(item);
      } else {
        prompt = `Zu welcher Familie gehört: ${itemName(item)}?`;
        answer = item.family || item.familyGerman || item.order || "Unbekannt";
        field = "family";
      }
    } else if (questionType === "traits") {
      field = "traits";
      prompt = `Nenne einen sicheren Erkennungsbeweis für: ${itemName(item)} (${scientific(item)}).`;
      answer = (DATA.familyHints[item.family] || item.traits || ["Eigene Merkmale prüfen"])[0] || "Merkmal prüfen";
    } else {
      field = "family";
      prompt = `Welche Familie hat: ${itemName(item)} (${scientific(item)})?`;
      answer = item.family || item.familyGerman || item.order || "Unbekannt";
    }

    const options = buildOptions(answer, field, item);
    state.quiz = { itemId: item.id, prompt, answer, options, field, checked: false, selected: null };
    saveState();
    render();
  }

  function makeFamilyQuiz() {
    const families = plantFamilies().filter((family) => DATA.familyHints?.[family]?.length);
    const sorted = [...families].sort((a, b) => familyPercent(a) - familyPercent(b));
    const focusPool = sorted.slice(0, Math.max(8, Math.ceil(sorted.length * 0.45)));
    const family = focusPool[Math.floor(Math.random() * focusPool.length)] || sorted[0];
    const hints = [...(DATA.familyHints[family] || [])].slice(0, 4);
    const examples = familyItems(family).slice(0, 4).map(itemName);
    const options = [family, ...families.filter((f) => f !== family).sort(() => Math.random() - 0.5).slice(0, 3)].sort(() => Math.random() - 0.5);
    state.quiz = {
      isFamilyDrill: true,
      family,
      itemId: null,
      prompt: `Welche Pflanzenfamilie passt zu diesen Merkmalen? ${hints.slice(0, 3).join(" · ")}`,
      answer: family,
      options,
      field: "familyProfile",
      checked: false,
      selected: null,
      traits: hints,
      examples
    };
    saveState();
    render();
  }

  function makeFamilyQuizFor(family) {
    const hints = [...(DATA.familyHints[family] || [])].slice(0, 4);
    const families = plantFamilies().filter((f) => DATA.familyHints?.[f]?.length);
    const examples = familyItems(family).slice(0, 4).map(itemName);
    const options = [family, ...families.filter((f) => f !== family).sort(() => Math.random() - 0.5).slice(0, 3)].sort(() => Math.random() - 0.5);
    state.quiz = { isFamilyDrill: true, family, itemId: null, prompt: `Welche Pflanzenfamilie passt zu diesen Merkmalen? ${hints.slice(0, 3).join(" · ")}`, answer: family, options, field: "familyProfile", checked: false, selected: null, traits: hints, examples };
    saveState();
    render();
  }

  function weightedPick(pool) {
    const sorted = [...pool].sort((a, b) => masteryPercent(a) - masteryPercent(b));
    const top = sorted.slice(0, Math.max(8, Math.ceil(sorted.length * 0.35)));
    return top[Math.floor(Math.random() * top.length)] || sorted[0];
  }

  function buildOptions(answer, field, item) {
    const cleanAnswer = answer || "Unbekannt";
    let candidates = [];
    if (field === "family") {
      if (item?.group === "plants") {
        candidates = plantFamilies();
      } else if (item?.group === "animals") {
        candidates = [...new Set(DATA.animals.map((x) => x.family || x.familyGerman || x.order || x.className).filter(Boolean))];
      } else {
        candidates = [...new Set(relevantItems().map((x) => x.family || x.familyGerman || x.order || x.className).filter(Boolean))];
      }
    } else if (field === "species") {
      candidates = [...new Set(items().map((x) => x.germanName).filter(Boolean))];
    } else {
      candidates = [...new Set([...(DATA.familyHints[item.family] || []), "Fundort + Blüte/Blatt vergleichen", "Verwechslungspartner nennen", "Familie anhand Schlüsselmerkmal prüfen"])];
    }
    const wrong = candidates.filter((x) => x !== cleanAnswer).sort(() => Math.random() - 0.5).slice(0, 3);
    return [cleanAnswer, ...wrong].sort(() => Math.random() - 0.5);
  }

  function answerQuiz(selected) {
    if (!state.quiz) return;
    const correct = selected === state.quiz.answer;
    state.quiz.selected = selected;
    state.quiz.checked = true;

    if (state.quiz.isFamilyDrill) {
      state.familyMastery = state.familyMastery || {};
      const family = state.quiz.family;
      const fm = familyMastery(family);
      fm.attempts = (fm.attempts || 0) + 1;
      if (correct) {
        fm.correct = (fm.correct || 0) + 1;
        fm.level = Math.min(5, (fm.level || 0) + 1);
        familyItems(family).forEach((plant) => {
          const m = mastery(plant);
          m.family = Math.min(3, (m.family || 0) + 1);
          state.mastery[plant.id] = m;
        });
      } else {
        fm.level = Math.max(0, (fm.level || 0) - 1);
      }
      state.familyMastery[family] = fm;
    }

    const item = items().find((x) => x.id === state.quiz.itemId);
    if (item) {
      const m = mastery(item);
      m.attempts = (m.attempts || 0) + 1;
      if (correct) {
        m.correct = (m.correct || 0) + 1;
        m[state.quiz.field] = Math.min(3, (m[state.quiz.field] || 0) + 1);
      } else {
        m[state.quiz.field] = Math.max(0, (m[state.quiz.field] || 0) - 1);
      }
      state.mastery[item.id] = m;
    }
    saveState();
    renderActiveQuest();
    renderHeader();
    renderMap();
    renderDangerZones();
    renderQuestLog();
  }

  function renderActiveQuest() {
    const quiz = state.quiz;
    if (quiz?.isFamilyDrill) {
      renderFamilyDrillQuest();
      return;
    }
    const item = quiz ? items().find((x) => x.id === quiz.itemId) : getWeakItems(1)[0];
    const hints = item ? DATA.familyHints[item.family] || item.traits || [] : [];
    const revealDetails = !quiz || quiz.checked;
    const questTitle = !quiz
      ? (item ? itemName(item) : "Keine Auswahl")
      : revealDetails && item
        ? itemName(item)
        : quiz.field === "species"
          ? "Artnamen-Quiz"
          : quiz.field === "family"
            ? "Familienfrage"
            : "Merkmalsfrage";
    const hiddenMeta = item
      ? `<div class="meta-line"><span>${escapeHTML(groupLabel(item))}</span><span>Einordnung nach deiner Antwort</span><span>${masteryPercent(item)}%</span></div>`
      : "";
    const visibleMeta = item
      ? `<div class="meta-line">${itemTaxonomyLine(item).map((part) => `<span>${escapeHTML(part)}</span>`).join("")}<span>${masteryPercent(item)}%</span></div>`
      : "";
    $("#activeQuestPanel").innerHTML = `
      <div class="section-title-row">
        <div>
          <p class="eyebrow">Aktive Quest</p>
          <h2>${escapeHTML(questTitle)}</h2>
        </div>
        <button class="primary-button" type="button" data-action="new-quiz">Neue Frage</button>
      </div>
      <div class="active-layout">
        <div class="quiz-box">
          <p class="eyebrow">Prüfmodus</p>
          <div class="quiz-question">${quiz ? escapeHTML(quiz.prompt) : "Starte eine Quizfrage."}</div>
          ${quiz ? `<div class="answer-grid">${quiz.options.map((opt) => {
            let cls = "";
            if (quiz.checked && opt === quiz.answer) cls = "correct";
            if (quiz.checked && opt === quiz.selected && opt !== quiz.answer) cls = "wrong";
            return `<button class="answer-button ${cls}" type="button" data-action="answer" data-value="${escapeAttr(opt)}">${escapeHTML(opt)}</button>`;
          }).join("")}</div>` : ""}
          ${quiz?.checked ? `<p style="margin-top:12px" class="${quiz.selected === quiz.answer ? "status-ok" : "status-danger"}">${quiz.selected === quiz.answer ? "Richtig. Fortschritt gespeichert." : `Nicht richtig. Erwartet: ${escapeHTML(quiz.answer)}`}</p>` : ""}
        </div>
        <div>
          <h3>Einordnung</h3>
          ${revealDetails ? visibleMeta : hiddenMeta}
          <h3 style="margin-top:14px">Merkmals-Check</h3>
          ${revealDetails
            ? (hints.length ? hints.map((h) => `<label class="checkline"><input type="checkbox"> ${escapeHTML(h)}</label>`).join("") : `<p class="muted">Noch keine Merkmale hinterlegt. Nutze den Lernbeweis, um eigene Merkmale zu speichern.</p>`)
            : `<p class="muted">Familie, Einordnung und Merkmale werden erst nach deiner Antwort angezeigt, damit nichts verraten wird.</p>`}
          ${revealDetails ? `<textarea id="proofInput" placeholder="Lernbeweis: Woran erkennst du das Taxon? Was wäre ein Verwechslungspartner? Warum ist die Familie plausibel?"></textarea>
          <div class="controls"><button class="primary-button" type="button" data-action="save-proof">Lernbeweis speichern</button></div>` : `<div class="empty-state">Wähle zuerst eine Antwort. Danach erscheinen Diagnosemerkmale und Lernbeweis.</div>`}
        </div>
      </div>
    `;
  }

  function renderFamilyDrillQuest() {
    const quiz = state.quiz;
    const contrasts = (DATA.familyContrasts?.[quiz.family] || []).filter((family) => DATA.familyHints?.[family]);
    const revealDetails = quiz.checked;
    $("#activeQuestPanel").innerHTML = `
      <div class="section-title-row">
        <div>
          <p class="eyebrow">Aktive Quest · Familien-Diagnose</p>
          <h2>Merkmale → Familie</h2>
        </div>
        <button class="primary-button" type="button" data-action="new-quiz">Neue Familienfrage</button>
      </div>
      <div class="active-layout">
        <div class="quiz-box">
          <p class="eyebrow">Diagnosefrage</p>
          <div class="quiz-question">${escapeHTML(quiz.prompt)}</div>
          <div class="answer-grid">${quiz.options.map((opt) => {
            let cls = "";
            if (quiz.checked && opt === quiz.answer) cls = "correct";
            if (quiz.checked && opt === quiz.selected && opt !== quiz.answer) cls = "wrong";
            return `<button class="answer-button ${cls}" type="button" data-action="answer" data-value="${escapeAttr(opt)}">${escapeHTML(opt)}</button>`;
          }).join("")}</div>
          ${quiz.checked ? `<p style="margin-top:12px" class="${quiz.selected === quiz.answer ? "status-ok" : "status-danger"}">${quiz.selected === quiz.answer ? "Richtig. Familienverständnis gespeichert." : `Nicht richtig. Erwartet: ${escapeHTML(quiz.answer)}`}</p>` : ""}
        </div>
        <div>
          ${revealDetails ? `<h3>${escapeHTML(quiz.family)}</h3>
          <div class="meta-line"><span>${familyItems(quiz.family).length} Pflanzen in deiner Liste</span><span>${familyPercent(quiz.family)}% Familiensicherheit</span></div>
          <h3 style="margin-top:14px">Diagnosemerkmale</h3>
          ${quiz.traits.map((h) => `<label class="checkline"><input type="checkbox"> ${escapeHTML(h)}</label>`).join("")}
          <h3 style="margin-top:14px">Beispiele aus deiner Liste</h3>
          <p class="muted">${quiz.examples.map(escapeHTML).join(" · ") || "Keine Beispiele gefunden."}</p>
          ${contrasts.length ? `<h3 style="margin-top:14px">Nicht verwechseln mit</h3><div class="contrast-list">${contrasts.map((family) => `<details class="contrast-card"><summary>${escapeHTML(family)}</summary><p>${(DATA.familyHints[family] || []).map(escapeHTML).join(" · ")}</p></details>`).join("")}</div>` : ""}
          <textarea id="proofInput" placeholder="Familienbeweis: Warum ist das diese Familie? Welches Merkmal wäre am sichersten? Womit würdest du sie verwechseln?"></textarea>
          <div class="controls"><button class="primary-button" type="button" data-action="save-family-proof">Familienbeweis speichern</button></div>` : `<h3>Diagnose nach Antwort</h3>
          <p class="muted">Die Familienantwort, Beispiele und Verwechslungen werden erst nach deiner Auswahl angezeigt. So bleibt die Übung wirklich prüfend.</p>
          <div class="empty-state">Erst Familie auswählen, dann Diagnosemerkmale absichern.</div>`}
        </div>
      </div>
    `;
  }

  function saveFamilyProof() {
    const quiz = state.quiz;
    const input = $("#proofInput");
    const text = input?.value.trim() || "";
    if (!quiz?.isFamilyDrill) return;
    if (text.length < 30) {
      alert("Der Familienbeweis ist noch zu kurz. Schreib mindestens 30 Zeichen.");
      input?.focus();
      return;
    }
    state.proofs.unshift({ id: crypto.randomUUID ? crypto.randomUUID() : `proof-${Date.now()}`, itemId: `family-${quiz.family}`, itemName: `Familie ${quiz.family}`, text, createdAt: new Date().toISOString() });
    state.familyMastery = state.familyMastery || {};
    const fm = familyMastery(quiz.family);
    fm.level = Math.min(5, (fm.level || 0) + 1);
    state.familyMastery[quiz.family] = fm;
    familyItems(quiz.family).forEach((plant) => {
      const m = mastery(plant);
      m.traits = Math.min(3, (m.traits || 0) + 1);
      state.mastery[plant.id] = m;
    });
    saveState();
    render();
  }

  function saveProof() {
    const quiz = state.quiz;
    const item = quiz ? items().find((x) => x.id === quiz.itemId) : getWeakItems(1)[0];
    const input = $("#proofInput");
    const text = input?.value.trim() || "";
    if (!item) return;
    if (text.length < 30) {
      alert("Der Lernbeweis ist noch zu kurz. Schreib mindestens 30 Zeichen.");
      input?.focus();
      return;
    }
    state.proofs.unshift({ id: crypto.randomUUID ? crypto.randomUUID() : `proof-${Date.now()}`, itemId: item.id, itemName: itemName(item), text, createdAt: new Date().toISOString() });
    const m = mastery(item);
    m.traits = Math.min(3, (m.traits || 0) + 1);
    m.recognition = Math.min(3, (m.recognition || 0) + 1);
    state.mastery[item.id] = m;
    saveState();
    render();
  }

  function renderResearchBook() {
    const current = relevantItems().slice(0, 80);
    $("#researchBook").innerHTML = `
      <div class="active-layout">
        <div>
          <h3>Pflanzenfamilien-Diagnose</h3>
          <div class="family-drill-list">
            ${plantFamilies().map((family) => `<button class="family-chip" type="button" data-action="train-family" data-id="${escapeAttr(family)}"><strong>${escapeHTML(family)}</strong><span>${familyItems(family).length} Arten · ${familyPercent(family)}%</span></button>`).join("")}
          </div>
          <h3 style="margin-top:16px">Einträge im aktuellen Filter</h3>
          <div class="item-list">
            ${current.map((item) => `<article class="item-card">
              <h3>${escapeHTML(itemName(item))}</h3>
              <div class="meta-line"><span>${escapeHTML(scientific(item))}</span><span>${escapeHTML(item.family || item.order || "")}</span><span>${masteryPercent(item)}%</span></div>
              <div class="progress-bar"><div class="progress-fill" style="width:${masteryPercent(item)}%"></div></div>
              <button class="ghost-button" type="button" data-action="train-item" data-id="${item.id}">Prüfen</button>
            </article>`).join("")}
          </div>
        </div>
        <div>
          <h3>Gespeicherte Lernbeweise</h3>
          <div class="proof-list">
            ${state.proofs.length ? state.proofs.slice(0, 10).map((p) => `<article class="proof-card"><h3>${escapeHTML(p.itemName)}</h3><p class="muted">${formatDateTime(p.createdAt)}</p><p>${escapeHTML(p.text)}</p></article>`).join("") : `<div class="empty-state">Noch keine Lernbeweise gespeichert.</div>`}
          </div>
        </div>
      </div>
    `;
  }

  function render() {
    renderHeader();
    renderQuickstart();
    renderModes();
    renderMap();
    renderDangerZones();
    renderQuestLog();
    if (!state.quiz) makeQuiz();
    renderActiveQuest();
    renderResearchBook();
  }

  function handleClick(event) {
    const button = event.target.closest("button");
    if (!button) return;
    const action = button.dataset.action;
    const id = button.dataset.id;
    if (action === "set-mode") { state.mode = id; state.filterGroup = "all"; state.quiz = null; saveState(); render(); }
    if (action === "set-filter") { state.filterGroup = id; state.quiz = null; saveState(); render(); }
    if (action === "reset-filter") { state.filterGroup = "all"; saveState(); render(); }
    if (action === "new-quiz") makeQuiz();
    if (action === "focus-weak") { const weak = getWeakItems(1)[0]; if (weak) makeQuiz(weak); }
    if (action === "start-family-drill") { state.mode = "familyDrill"; state.filterGroup = "all"; state.quiz = null; saveState(); makeQuiz(); }
    if (action === "train-family") { state.mode = "familyDrill"; state.filterGroup = "plants:" + id; state.quiz = null; makeFamilyQuizFor(id); }
    if (action === "train-item") { const item = items().find((x) => x.id === id); if (item) makeQuiz(item); }
    if (action === "answer") answerQuiz(button.dataset.value);
    if (action === "save-proof") saveProof();
    if (action === "save-family-proof") saveFamilyProof();
    if (action === "reset-progress") {
      if (confirm("Lokalen Fortschritt wirklich löschen? Das betrifft nur diesen Browser.")) {
        state = { ...defaultState, mastery: {}, familyMastery: {}, proofs: [], quiz: null };
        saveState(); render();
      }
    }
  }

  function formatDate(date) { return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", year: "numeric" }).format(new Date(`${date}T00:00:00`)); }
  function formatDateTime(iso) { return new Intl.DateTimeFormat("de-DE", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" }).format(new Date(iso)); }
  function escapeHTML(v) { return String(v ?? "").replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;"); }
  function escapeAttr(v) { return escapeHTML(v).replaceAll("`", "&#096;"); }

  document.addEventListener("click", handleClick);
  render();
})();
