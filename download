const STORAGE_KEY = "ryosTiermemoryProgressV1";
const LOG_KEY = "ryosTiermemoryLogV1";

const $ = (id) => document.getElementById(id);

let current = null;
let examTimer = null;
let secondsLeft = 60;

function normalize(value) {
  return (value || "")
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[–—-]/g, " ")
    .replace(/[^\p{Letter}\p{Number}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}

function loadProgress() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {}; }
  catch { return {}; }
}

function saveProgress(progress) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function loadLog() {
  try { return JSON.parse(localStorage.getItem(LOG_KEY)) || []; }
  catch { return []; }
}

function saveLog(log) {
  localStorage.setItem(LOG_KEY, JSON.stringify(log.slice(-50)));
}

function getFilteredAnimals() {
  const group = $("groupSelect").value;
  const onlyRequired = $("onlyRequiredToggle").checked;
  return window.TIERE_ROTLISTE.filter((animal) => {
    if (onlyRequired && !animal.pflicht) return false;
    if (group === "all") return true;
    if (animal.gruppe === group) return true;
    if (animal.klasseFilter === group) return true;
    return false;
  });
}

function weightedPick(items) {
  const progress = loadProgress();
  const weighted = [];
  for (const item of items) {
    const state = progress[item.id]?.state || "new";
    const weight = state === "instabil" ? 5 : state === "partial" ? 3 : state === "stable" ? 1 : 2;
    for (let i = 0; i < weight; i++) weighted.push(item);
  }
  return weighted[Math.floor(Math.random() * weighted.length)] || items[0] || null;
}

function setImage(animal) {
  const img = $("animalImage");
  const fallback = $("imageFallback");

  img.style.display = "none";
  fallback.style.display = "grid";
  img.removeAttribute("src");

  if (!animal?.image) return;

  img.onload = () => {
    img.style.display = "block";
    fallback.style.display = "none";
  };
  img.onerror = () => {
    img.style.display = "none";
    fallback.style.display = "grid";
    fallback.querySelector("small").textContent = animal.image;
  };
  img.src = animal.image;
}

function getTaxonValue(animal, level) {
  const deutsch = animal.deutsch?.[level] || "";
  const latein = animal.latein?.[level] || "";
  return { deutsch, latein };
}

function getRequiredLevel(animal) {
  const map = {
    "Art": "art",
    "Familie": "familie",
    "Ordnung": "ordnung",
    "Unterordnung": "unterordnung",
    "Klasse": "klasse",
    "Stamm": "stamm"
  };
  return map[animal.gefragteEbene] || "art";
}

function renderAnswerArea() {
  const mode = $("modeSelect").value;
  const area = $("answerArea");
  area.innerHTML = "";

  if (!current) return;

  if (mode === "taxon" || mode === "exam") {
    const level = getRequiredLevel(current);
    const label = `Pflicht-Taxon (${current.gefragteEbene})`;
    area.innerHTML = `
      <div class="answer-field">
        <label for="answerRequired">${label}</label>
        <input id="answerRequired" type="text" autocomplete="off" placeholder="deutsch oder lateinisch eingeben" />
      </div>
      <div class="answer-field">
        <label for="answerHigher">Ein übergeordnetes Taxon, falls du es weißt</label>
        <input id="answerHigher" type="text" autocomplete="off" placeholder="z. B. Ordnung, Familie oder Klasse" />
      </div>
      <div class="answer-field">
        <label for="answerFeature">Ein sichtbares / charakteristisches Merkmal</label>
        <input id="answerFeature" type="text" autocomplete="off" placeholder="z. B. Warnfärbung, Laichschnüre, Zickzackband ..." />
      </div>
    `;
    $("answerRequired").focus();
  }

  if (mode === "tree") {
    area.innerHTML = `
      <div class="answer-grid">
        <div class="answer-field">
          <label for="answerArt">Art</label>
          <input id="answerArt" type="text" autocomplete="off" placeholder="deutsch oder lateinisch" />
        </div>
        <div class="answer-field">
          <label for="answerFamilie">Familie</label>
          <input id="answerFamilie" type="text" autocomplete="off" placeholder="deutsch oder lateinisch" />
        </div>
        <div class="answer-field">
          <label for="answerOrdnung">Ordnung</label>
          <input id="answerOrdnung" type="text" autocomplete="off" placeholder="deutsch oder lateinisch" />
        </div>
        <div class="answer-field">
          <label for="answerKlasse">Klasse</label>
          <input id="answerKlasse" type="text" autocomplete="off" placeholder="deutsch oder lateinisch" />
        </div>
      </div>
    `;
    $("answerArt").focus();
  }
}

function showTree(animal, reveal = false) {
  const out = $("treeOutput");
  if (!animal) {
    out.className = "tree-output muted";
    out.textContent = "Noch keine Karte geladen.";
    return;
  }

  out.className = "tree-output";
  const rows = [
    ["Stamm", animal.deutsch.stamm, animal.latein.stamm],
    ["Unterstamm", animal.deutsch.unterstamm, animal.latein.unterstamm],
    ["Klasse", animal.deutsch.klasse, animal.latein.klasse],
    ["Ordnung", animal.deutsch.ordnung, animal.latein.ordnung],
    animal.deutsch.unterordnung || animal.latein.unterordnung ? ["Unterordnung", animal.deutsch.unterordnung, animal.latein.unterordnung] : null,
    ["Familie", animal.deutsch.familie, animal.latein.familie],
    ["Art", animal.deutsch.art, animal.latein.art]
  ].filter(Boolean);

  out.innerHTML = rows.map(([label, de, la]) => `
    <div class="tree-row">
      <strong>${label}</strong>
      <span>${reveal ? `${de || "—"} <em>(${la || "—"})</em>` : "—"}</span>
    </div>
  `).join("");

  if (reveal) {
    const features = animal.merkmale?.length ? animal.merkmale.join(" · ") : "—";
    out.innerHTML += `
      <div class="tree-row">
        <strong>Merkmale</strong>
        <span>${features}</span>
      </div>
    `;
  }
}

function showFeedback(type, html) {
  const box = $("feedback");
  box.className = `feedback show ${type}`;
  box.innerHTML = html;
}

function clearFeedback() {
  const box = $("feedback");
  box.className = "feedback";
  box.innerHTML = "";
}

function updateStats() {
  const progress = loadProgress();
  const required = window.TIERE_ROTLISTE.filter(a => a.pflicht);
  const stable = required.filter(a => progress[a.id]?.state === "stable").length;
  const unstable = required.filter(a => progress[a.id]?.state === "instabil").length;

  $("statTotal").textContent = required.length;
  $("statStable").textContent = stable;
  $("statUnstable").textContent = unstable;
}

function renderConfusions() {
  $("confusionOutput").innerHTML = window.VERWECHSLUNGSGRUPPEN
    .map(group => `<span class="chip">${group.join(" ↔ ")}</span>`)
    .join("");
}

function renderLog() {
  const log = loadLog().slice().reverse();
  const out = $("logOutput");
  if (!log.length) {
    out.className = "log-output muted";
    out.textContent = "Noch keine Lernbeweise.";
    return;
  }
  out.className = "log-output";
  out.innerHTML = log.map(item => `
    <div class="log-item">
      <strong>${item.name}</strong> · ${item.result}<br>
      <small>${new Date(item.date).toLocaleString("de-DE")}</small>
    </div>
  `).join("");
}

function addLog(animal, result) {
  const log = loadLog();
  log.push({
    id: animal.id,
    name: animal.deutsch.art,
    result,
    date: new Date().toISOString()
  });
  saveLog(log);
  renderLog();
}

function setProgress(animal, state) {
  const progress = loadProgress();
  progress[animal.id] = {
    state,
    updatedAt: new Date().toISOString()
  };
  saveProgress(progress);
  updateStats();
}

function startTimerIfNeeded() {
  clearInterval(examTimer);
  $("timer").classList.add("hidden");
  if ($("modeSelect").value !== "exam") return;

  secondsLeft = 60;
  $("timer").textContent = secondsLeft;
  $("timer").classList.remove("hidden");

  examTimer = setInterval(() => {
    secondsLeft -= 1;
    $("timer").textContent = secondsLeft;
    if (secondsLeft <= 0) {
      clearInterval(examTimer);
      showFeedback("warn", "Zeit abgelaufen. Prüfe jetzt ehrlich oder zeige die Lösung.");
    }
  }, 1000);
}

function nextCard() {
  const items = getFilteredAnimals();
  if (!items.length) {
    current = null;
    setImage(null);
    $("currentBadge").textContent = "Keine Treffer";
    $("promptTitle").textContent = "Keine Karten im Filter";
    $("promptText").textContent = "Ändere Gruppe oder schalte „Nur rote Pflicht-Taxa“ aus.";
    $("answerArea").innerHTML = "";
    showTree(null);
    return;
  }

  current = weightedPick(items);
  setImage(current);
  clearFeedback();
  renderAnswerArea();
  showTree(current, false);
  startTimerIfNeeded();

  $("currentBadge").textContent = `${current.klasseFilter} · ${current.gefragteEbene}`;
  $("promptTitle").textContent = current.deutsch.art;
  $("promptText").textContent = $("modeSelect").value === "tree"
    ? "Baue den Stammbaum aus Art, Familie, Ordnung und Klasse."
    : `Bestimme das rote Pflicht-Taxon auf Ebene: ${current.gefragteEbene}.`;
}

function matchesAnswer(input, animal, level) {
  const answer = normalize(input);
  const { deutsch, latein } = getTaxonValue(animal, level);
  const options = [deutsch, latein].map(normalize).filter(Boolean);
  return options.includes(answer);
}

function anyTaxonMatches(input, animal) {
  const levels = ["art", "familie", "ordnung", "unterordnung", "klasse", "unterstamm", "stamm"];
  const answer = normalize(input);
  if (!answer) return false;
  return levels.some(level => {
    const { deutsch, latein } = getTaxonValue(animal, level);
    return [deutsch, latein].map(normalize).includes(answer);
  });
}

function featureMatches(input, animal) {
  const answer = normalize(input);
  if (!answer) return false;
  return (animal.merkmale || []).some(m => {
    const normalizedFeature = normalize(m);
    return normalizedFeature.includes(answer) || answer.split(" ").some(part => part.length > 4 && normalizedFeature.includes(part));
  });
}

function checkAnswer() {
  if (!current) return;
  const mode = $("modeSelect").value;
  let correct = 0;
  let total = 0;
  let details = [];

  if (mode === "taxon" || mode === "exam") {
    const level = getRequiredLevel(current);
    const requiredInput = $("answerRequired")?.value || "";
    const higherInput = $("answerHigher")?.value || "";
    const featureInput = $("answerFeature")?.value || "";

    total += 1;
    if (matchesAnswer(requiredInput, current, level)) {
      correct += 1;
      details.push("Pflicht-Taxon richtig.");
    } else {
      details.push("Pflicht-Taxon falsch oder leer.");
    }

    if (higherInput.trim()) {
      total += 1;
      if (anyTaxonMatches(higherInput, current)) {
        correct += 1;
        details.push("Übergeordnetes Taxon passt.");
      } else {
        details.push("Übergeordnetes Taxon passt nicht.");
      }
    }

    if (featureInput.trim()) {
      total += 1;
      if (featureMatches(featureInput, current)) {
        correct += 1;
        details.push("Merkmal passt grob.");
      } else {
        details.push("Merkmal konnte nicht abgeglichen werden.");
      }
    }
  }

  if (mode === "tree") {
    const checks = [
      ["Art", "art", $("answerArt")?.value],
      ["Familie", "familie", $("answerFamilie")?.value],
      ["Ordnung", "ordnung", $("answerOrdnung")?.value],
      ["Klasse", "klasse", $("answerKlasse")?.value]
    ];

    for (const [label, level, value] of checks) {
      total += 1;
      if (matchesAnswer(value, current, level)) {
        correct += 1;
        details.push(`${label} richtig.`);
      } else {
        details.push(`${label} falsch oder leer.`);
      }
    }
  }

  const ratio = correct / Math.max(total, 1);
  showTree(current, true);

  if (ratio >= 0.85) {
    setProgress(current, "stable");
    addLog(current, `stabil (${correct}/${total})`);
    showFeedback("ok", `<strong>${correct}/${total}</strong> · Stabil. ${details.join(" ")}`);
  } else if (ratio >= 0.5) {
    setProgress(current, "partial");
    addLog(current, `teilweise (${correct}/${total})`);
    showFeedback("warn", `<strong>${correct}/${total}</strong> · Teilweise. ${details.join(" ")}`);
  } else {
    setProgress(current, "instabil");
    addLog(current, `instabil (${correct}/${total})`);
    showFeedback("bad", `<strong>${correct}/${total}</strong> · Instabil. ${details.join(" ")}`);
  }
}

function reveal() {
  if (!current) return;
  showTree(current, true);
  showFeedback("warn", "Lösung angezeigt. Das zählt nicht als stabiler Abruf.");
  addLog(current, "Lösung angezeigt");
}

function markUnstable() {
  if (!current) return;
  setProgress(current, "instabil");
  showTree(current, true);
  showFeedback("bad", "Als instabil markiert. Diese Karte erscheint künftig häufiger.");
  addLog(current, "manuell instabil");
}

function resetProgress() {
  if (!confirm("Fortschritt und Lernlog wirklich löschen?")) return;
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(LOG_KEY);
  updateStats();
  renderLog();
  clearFeedback();
}

$("nextButton").addEventListener("click", nextCard);
$("checkButton").addEventListener("click", checkAnswer);
$("revealButton").addEventListener("click", reveal);
$("markUnstableButton").addEventListener("click", markUnstable);
$("resetButton").addEventListener("click", resetProgress);
$("modeSelect").addEventListener("change", () => current ? nextCard() : null);
$("groupSelect").addEventListener("change", () => current ? nextCard() : null);
$("onlyRequiredToggle").addEventListener("change", () => current ? nextCard() : updateStats());

updateStats();
renderConfusions();
renderLog();
showTree(null);
