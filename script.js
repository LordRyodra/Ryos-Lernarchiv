(() => {
  const DATA = window.LEARNING_ARCHIVE_DATA;
  const STORAGE_KEY = "ryosLernarchiv.v0.1";

  const $ = (selector) => document.querySelector(selector);
  const emptyTemplate = () => $("#emptyStateTemplate").content.firstElementChild.cloneNode(true).outerHTML;

  const defaultState = {
    activeModeId: "rescue",
    selectedArea: "all",
    selectedNodeId: DATA.mapNodes[0]?.id ?? null,
    activeQuestId: DATA.quests[0]?.id ?? null,
    questStatus: {},
    questSteps: {},
    proofs: []
  };

  let state = loadState();

  function loadState() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return { ...defaultState, ...(parsed || {}) };
    } catch (error) {
      console.warn("Lernarchiv: localStorage konnte nicht gelesen werden.", error);
      return { ...defaultState };
    }
  }

  function saveState() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  function resetState() {
    const confirmed = confirm("Lokalen Fortschritt wirklich löschen? Das betrifft nur diesen Browser.");
    if (!confirmed) return;
    state = { ...defaultState, proofs: [], questStatus: {}, questSteps: {} };
    saveState();
    render();
  }

  function getNode(nodeId) {
    return DATA.mapNodes.find((node) => node.id === nodeId);
  }

  function getQuest(questId) {
    return DATA.quests.find((quest) => quest.id === questId);
  }

  function getNodeProofs(nodeId) {
    return state.proofs.filter((proof) => proof.nodeId === nodeId);
  }

  function getQuestProofs(questId) {
    return state.proofs.filter((proof) => proof.questId === questId);
  }

  function getQuestForNode(nodeId) {
    return DATA.quests.find((quest) => quest.nodeId === nodeId && state.questStatus[quest.id] !== "done")
      || DATA.quests.find((quest) => quest.nodeId === nodeId)
      || null;
  }

  function getNodeProgress(node) {
    const proofs = getNodeProofs(node.id).length;
    const required = node.requiredProofs || 1;
    const percent = Math.min(100, Math.round((proofs / required) * 100));
    const completedLinkedQuests = DATA.quests
      .filter((quest) => quest.nodeId === node.id && state.questStatus[quest.id] === "done")
      .length;

    let label = "Unbewiesen";
    let tone = "status-danger";

    if (percent >= 100) {
      label = "Stabilisiert";
      tone = "status-ok";
    } else if (proofs > 0 || completedLinkedQuests > 0) {
      label = "In Arbeit";
      tone = "status-warning";
    } else if (node.initialConfidence >= 3) {
      label = "Bekannt, ungeprüft";
      tone = "status-warning";
    }

    return { proofs, required, percent, label, tone };
  }

  function getGlobalStats() {
    const totalNodes = DATA.mapNodes.length;
    const stabilizedNodes = DATA.mapNodes.filter((node) => getNodeProgress(node).percent >= 100).length;
    const doneQuests = DATA.quests.filter((quest) => state.questStatus[quest.id] === "done").length;
    const proofCount = state.proofs.length;
    const totalRequiredProofs = DATA.mapNodes.reduce((sum, node) => sum + (node.requiredProofs || 1), 0);
    const earnedProofs = DATA.mapNodes.reduce((sum, node) => sum + Math.min(getNodeProofs(node.id).length, node.requiredProofs || 1), 0);
    const proofPercent = totalRequiredProofs ? Math.round((earnedProofs / totalRequiredProofs) * 100) : 0;

    return { totalNodes, stabilizedNodes, doneQuests, proofCount, proofPercent };
  }

  function getDangerScore(node) {
    const progress = getNodeProgress(node);
    const lack = 100 - progress.percent;
    const confidencePenalty = Math.max(0, 4 - node.initialConfidence) * 14;
    const importanceBoost = node.importance * 8;
    return lack + confidencePenalty + importanceBoost;
  }

  function getCriticalNodes(limit = 3) {
    return [...DATA.mapNodes]
      .map((node) => ({ node, score: getDangerScore(node), progress: getNodeProgress(node) }))
      .filter((item) => item.progress.percent < 100)
      .sort((a, b) => b.score - a.score)
      .slice(0, limit);
  }

  function getRecommendedQuest() {
    const activeMode = state.activeModeId;
    const openQuests = DATA.quests.filter((quest) => state.questStatus[quest.id] !== "done");
    const modeQuest = openQuests.find((quest) => quest.modeHint === activeMode);
    if (modeQuest) return modeQuest;

    const criticalNode = getCriticalNodes(1)[0]?.node;
    if (criticalNode) {
      const quest = openQuests.find((item) => item.nodeId === criticalNode.id);
      if (quest) return quest;
    }

    return openQuests[0] || DATA.quests[0] || null;
  }

  function formatDate(isoString) {
    return new Intl.DateTimeFormat("de-DE", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    }).format(new Date(isoString));
  }

  function escapeHTML(value) {
    return String(value)
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  function setActiveQuest(questId) {
    const quest = getQuest(questId);
    if (!quest) return;
    state.activeQuestId = quest.id;
    state.selectedNodeId = quest.nodeId;
    saveState();
    render();
    $("#activeQuestPanel")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function setSelectedNode(nodeId) {
    const node = getNode(nodeId);
    if (!node) return;
    state.selectedNodeId = node.id;
    const quest = getQuestForNode(node.id);
    if (quest) state.activeQuestId = quest.id;
    saveState();
    render();
  }

  function toggleStep(questId, stepIndex, checked) {
    const current = state.questSteps[questId] || [];
    current[stepIndex] = checked;
    state.questSteps[questId] = current;
    saveState();
    renderActiveQuest();
  }

  function saveProof({ completeQuest }) {
    const quest = getQuest(state.activeQuestId);
    if (!quest) return;

    const input = $("#proofInput");
    const text = input?.value.trim() || "";

    if (text.length < 30) {
      alert("Der Lernbeweis ist noch zu kurz. Schreib mindestens 30 Zeichen, damit es kein Fake-Haken wird.");
      input?.focus();
      return;
    }

    const proof = {
      id: crypto.randomUUID ? crypto.randomUUID() : `proof-${Date.now()}`,
      questId: quest.id,
      nodeId: quest.nodeId,
      text,
      createdAt: new Date().toISOString()
    };

    state.proofs.unshift(proof);

    if (completeQuest) {
      state.questStatus[quest.id] = "done";
      state.questSteps[quest.id] = quest.steps.map(() => true);
    }

    const nextQuest = getRecommendedQuest();
    if (completeQuest && nextQuest && nextQuest.id !== quest.id) {
      state.activeQuestId = nextQuest.id;
      state.selectedNodeId = nextQuest.nodeId;
    }

    saveState();
    render();
  }

  function deleteProof(proofId) {
    const confirmed = confirm("Diesen Lernbeweis löschen?");
    if (!confirmed) return;
    state.proofs = state.proofs.filter((proof) => proof.id !== proofId);
    saveState();
    render();
  }

  function reopenQuest(questId) {
    delete state.questStatus[questId];
    saveState();
    render();
  }

  function renderHeaderStats() {
    const stats = getGlobalStats();
    $("#headerStats").innerHTML = `
      <div class="stat-pill"><strong>${stats.proofPercent}%</strong><span>belegter Fortschritt</span></div>
      <div class="stat-pill"><strong>${stats.stabilizedNodes}/${stats.totalNodes}</strong><span>Knoten stabilisiert</span></div>
      <div class="stat-pill"><strong>${stats.proofCount}</strong><span>Lernbeweise</span></div>
    `;
  }

  function renderQuickstart() {
    const recommended = getRecommendedQuest();
    const node = recommended ? getNode(recommended.nodeId) : null;
    const critical = getCriticalNodes(1)[0];
    const stats = getGlobalStats();

    $("#quickstartCard").innerHTML = `
      <div class="quickstart-layout">
        <div>
          <p class="eyebrow">Schnellstart</p>
          <h2>${recommended ? escapeHTML(recommended.title) : "Alles erledigt"}</h2>
          <p>
            ${recommended
              ? `Empfohlen für <strong>${escapeHTML(node?.title || "unbekannt")}</strong>: ${escapeHTML(recommended.objective)}`
              : "Alle aktuellen Quests sind abgeschlossen. Ergänze neue echte Prüfungsdaten in data.js."
            }
          </p>
          ${critical ? `<p><span class="status-chip status-danger">Kritischster Knoten: ${escapeHTML(critical.node.title)} · ${critical.progress.percent}% belegt</span></p>` : ""}
        </div>
        <div class="quickstart-actions">
          ${recommended ? `<button class="primary-button" type="button" data-action="activate-quest" data-id="${recommended.id}">Aktive Quest starten</button>` : ""}
          <button class="secondary-button" type="button" data-action="focus-danger">Gefahren ansehen</button>
          <button class="ghost-button" type="button" data-action="reset-progress">Fortschritt zurücksetzen</button>
        </div>
      </div>
      <div class="reset-row">
        <div class="progress-line" aria-label="Gesamtfortschritt"><span style="--value:${stats.proofPercent}%"></span></div>
      </div>
    `;
  }

  function renderModes() {
    $("#modeBar").innerHTML = DATA.startModes.map((mode) => `
      <button class="mode-button ${state.activeModeId === mode.id ? "is-active" : ""}" type="button" data-action="set-mode" data-id="${mode.id}">
        <strong>${escapeHTML(mode.title)}</strong>
        <span>${escapeHTML(mode.description)}</span>
      </button>
    `).join("");
  }

  function renderMapFilter() {
    const areas = ["all", ...new Set(DATA.mapNodes.map((node) => node.area))];
    $("#mapFilter").innerHTML = areas.map((area) => `
      <button class="filter-chip ${state.selectedArea === area ? "is-active" : ""}" type="button" data-action="filter-area" data-id="${escapeHTML(area)}">
        ${area === "all" ? "Alle Gebiete" : escapeHTML(area)}
      </button>
    `).join("");
  }

  function renderMap() {
    renderMapFilter();
    const nodes = DATA.mapNodes.filter((node) => state.selectedArea === "all" || node.area === state.selectedArea);

    $("#examMap").innerHTML = nodes.map((node) => {
      const progress = getNodeProgress(node);
      const linked = node.connections.map((id) => getNode(id)?.title).filter(Boolean).join(" · ");
      return `
        <button class="node-card ${state.selectedNodeId === node.id ? "is-selected" : ""}" type="button" data-action="select-node" data-id="${node.id}">
          <div class="node-meta">
            <span class="status-chip ${progress.tone}">${progress.label}</span>
            <span class="status-chip">${progress.proofs}/${progress.required} Beweise</span>
            <span class="status-chip">Relevanz ${node.importance}/5</span>
          </div>
          <div>
            <h3>${escapeHTML(node.title)}</h3>
            <p>${escapeHTML(node.summary)}</p>
          </div>
          <div class="progress-line"><span style="--value:${progress.percent}%"></span></div>
          <div class="node-meta">
            ${node.tags.map((tag) => `<span class="tag">${escapeHTML(tag)}</span>`).join("")}
          </div>
          <p><small>Verknüpft: ${escapeHTML(linked || "noch offen")}</small></p>
        </button>
      `;
    }).join("") || emptyTemplate();
  }

  function renderDangerZones() {
    const criticalNodes = getCriticalNodes(4);
    const manualZones = DATA.dangerZones.map((zone) => {
      const zoneNodes = zone.nodeIds.map(getNode).filter(Boolean);
      const averageProgress = zoneNodes.length
        ? Math.round(zoneNodes.reduce((sum, node) => sum + getNodeProgress(node).percent, 0) / zoneNodes.length)
        : 0;
      return { ...zone, averageProgress, zoneNodes };
    });

    const html = `
      <div class="danger-list">
        ${manualZones.map((zone) => `
          <article class="danger-item">
            <div class="node-meta">
              <span class="status-chip ${zone.averageProgress < 40 ? "status-danger" : "status-warning"}">${zone.averageProgress}% belegt</span>
              <span class="status-chip">${zone.zoneNodes.length} Knoten</span>
            </div>
            <h3>${escapeHTML(zone.title)}</h3>
            <p>${escapeHTML(zone.reason)}</p>
            <p><strong>Nächste echte Handlung:</strong> ${escapeHTML(zone.suggestedAction)}</p>
          </article>
        `).join("")}
      </div>
      <div class="reset-row">
        <p class="eyebrow">Automatisch kritisch</p>
        <div class="danger-list">
          ${criticalNodes.map(({ node, progress }) => `
            <article class="danger-item">
              <div class="node-meta">
                <span class="status-chip status-danger">${progress.percent}%</span>
                <span class="status-chip">${escapeHTML(node.exam)}</span>
              </div>
              <h3>${escapeHTML(node.title)}</h3>
              <p>${escapeHTML(node.summary)}</p>
              <button class="tiny-button" type="button" data-action="select-node" data-id="${node.id}">Knoten öffnen</button>
            </article>
          `).join("")}
        </div>
      </div>
    `;

    $("#dangerZones").innerHTML = html;
  }

  function renderQuestLog() {
    const mode = state.activeModeId;
    const sortedQuests = [...DATA.quests].sort((a, b) => {
      const aDone = state.questStatus[a.id] === "done" ? 1 : 0;
      const bDone = state.questStatus[b.id] === "done" ? 1 : 0;
      const aMode = a.modeHint === mode ? -1 : 0;
      const bMode = b.modeHint === mode ? -1 : 0;
      return aDone - bDone || aMode - bMode;
    });

    $("#questLog").innerHTML = `
      <div class="quest-list">
        ${sortedQuests.map((quest) => {
          const node = getNode(quest.nodeId);
          const done = state.questStatus[quest.id] === "done";
          const proofs = getQuestProofs(quest.id).length;
          return `
            <button class="quest-item ${state.activeQuestId === quest.id ? "is-active" : ""} ${done ? "is-done" : ""}" type="button" data-action="activate-quest" data-id="${quest.id}">
              <div class="quest-meta">
                <span class="status-chip ${done ? "status-ok" : "status-warning"}">${done ? "Belegt" : "Offen"}</span>
                <span class="status-chip">${escapeHTML(quest.type)}</span>
                <span class="status-chip">${quest.estimatedMinutes} min</span>
                ${proofs ? `<span class="status-chip">${proofs} Beweis(e)</span>` : ""}
              </div>
              <div>
                <h3>${escapeHTML(quest.title)}</h3>
                <p>${escapeHTML(node?.title || "Unbekannter Knoten")} · ${escapeHTML(quest.objective)}</p>
              </div>
            </button>
          `;
        }).join("")}
      </div>
    `;
  }

  function renderActiveQuest() {
    const quest = getQuest(state.activeQuestId) || getRecommendedQuest();
    if (!quest) {
      $("#activeQuestPanel").innerHTML = emptyTemplate();
      return;
    }

    const node = getNode(quest.nodeId);
    const done = state.questStatus[quest.id] === "done";
    const stepState = state.questSteps[quest.id] || [];
    const proofs = getQuestProofs(quest.id);
    const nodeProgress = node ? getNodeProgress(node) : null;

    $("#activeQuestPanel").innerHTML = `
      <div class="section-title-row">
        <div>
          <p class="eyebrow">Aktive Quest</p>
          <h2>${escapeHTML(quest.title)}</h2>
        </div>
        <div class="inline-actions">
          ${done ? `<button class="secondary-button" type="button" data-action="reopen-quest" data-id="${quest.id}">Wieder öffnen</button>` : ""}
        </div>
      </div>
      <div class="active-layout">
        <div>
          <div class="quest-meta">
            <span class="status-chip ${done ? "status-ok" : "status-warning"}">${done ? "Abgeschlossen mit Beweis" : "Offen"}</span>
            <span class="status-chip">${escapeHTML(quest.type)}</span>
            <span class="status-chip">${quest.estimatedMinutes} min</span>
            ${nodeProgress ? `<span class="status-chip ${nodeProgress.tone}">${nodeProgress.proofs}/${nodeProgress.required} Knotenbeweise</span>` : ""}
          </div>
          <p>${escapeHTML(quest.objective)}</p>
          <h3>Schritte</h3>
          <ul class="step-list">
            ${quest.steps.map((step, index) => `
              <li>
                <label>
                  <input type="checkbox" ${stepState[index] ? "checked" : ""} data-action="toggle-step" data-quest-id="${quest.id}" data-step-index="${index}" />
                  <span>${escapeHTML(step)}</span>
                </label>
              </li>
            `).join("")}
          </ul>
          <p><strong>Fertig erst wenn:</strong> ${escapeHTML(quest.doneDefinition)}</p>
        </div>

        <div class="proof-box">
          <div>
            <p class="eyebrow">Lernbeweis</p>
            <h3>${escapeHTML(quest.proofPrompt)}</h3>
          </div>
          <textarea id="proofInput" placeholder="Schreib hier deine Erklärung, Rechnung, Skizzenbeschreibung oder Mini-Prüfungsantwort. Es muss nicht schön sein, aber eigenständig."></textarea>
          <div class="inline-actions">
            <button class="primary-button" type="button" data-action="save-proof-complete">Speichern & Quest abschließen</button>
            <button class="secondary-button" type="button" data-action="save-proof-only">Nur Beweis speichern</button>
          </div>
          <div class="proof-history">
            ${proofs.length ? proofs.map((proof) => `
              <article class="proof-entry">
                <time>${formatDate(proof.createdAt)}</time>
                <p>${escapeHTML(proof.text)}</p>
                <button class="tiny-button" type="button" data-action="delete-proof" data-id="${proof.id}">Beweis löschen</button>
              </article>
            `).join("") : emptyTemplate()}
          </div>
        </div>
      </div>
    `;
  }

  function renderResearchBook() {
    const selectedNodeId = state.selectedNodeId;
    const entries = DATA.researchBook.filter((entry) => entry.nodeId === selectedNodeId || entry.nodeId === "meta");
    const node = getNode(selectedNodeId);

    $("#researchBook").innerHTML = `
      <div class="research-list">
        ${node ? `
          <article class="research-item">
            <div class="research-meta">
              <span class="status-chip">Ausgewählter Knoten</span>
              <span class="status-chip">${escapeHTML(node.area)}</span>
            </div>
            <h3>${escapeHTML(node.title)}</h3>
            <p>${escapeHTML(node.summary)}</p>
          </article>
        ` : ""}
        ${entries.map((entry) => `
          <article class="research-item">
            <div class="research-meta">
              <span class="status-chip">${escapeHTML(entry.type)}</span>
            </div>
            <h3>${escapeHTML(entry.title)}</h3>
            <p>${escapeHTML(entry.summary)}</p>
            ${entry.questions?.length ? `
              <div class="reset-row">
                ${entry.questions.map((question) => `<span class="tag">${escapeHTML(question)}</span>`).join(" ")}
              </div>
            ` : ""}
          </article>
        `).join("")}
      </div>
    `;
  }

  function render() {
    renderHeaderStats();
    renderQuickstart();
    renderModes();
    renderMap();
    renderDangerZones();
    renderQuestLog();
    renderActiveQuest();
    renderResearchBook();
  }

  document.addEventListener("click", (event) => {
    const target = event.target.closest("[data-action]");
    if (!target) return;

    const action = target.dataset.action;
    const id = target.dataset.id;

    if (action === "set-mode") {
      state.activeModeId = id;
      const recommended = getRecommendedQuest();
      if (recommended) {
        state.activeQuestId = recommended.id;
        state.selectedNodeId = recommended.nodeId;
      }
      saveState();
      render();
    }

    if (action === "filter-area") {
      state.selectedArea = id;
      saveState();
      renderMap();
    }

    if (action === "show-all-nodes") {
      state.selectedArea = "all";
      saveState();
      renderMap();
    }

    if (action === "select-node") setSelectedNode(id);
    if (action === "activate-quest") setActiveQuest(id);
    if (action === "save-proof-complete") saveProof({ completeQuest: true });
    if (action === "save-proof-only") saveProof({ completeQuest: false });
    if (action === "delete-proof") deleteProof(id);
    if (action === "reopen-quest") reopenQuest(id);
    if (action === "reset-progress") resetState();

    if (action === "focus-danger") {
      document.querySelector(".danger-card")?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  });

  document.addEventListener("change", (event) => {
    const target = event.target;
    if (target?.dataset?.action === "toggle-step") {
      toggleStep(target.dataset.questId, Number(target.dataset.stepIndex), target.checked);
    }
  });

  render();
})();
