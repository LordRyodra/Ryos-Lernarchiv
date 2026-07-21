:root {
  --bg: #07110d;
  --panel: rgba(14, 27, 22, 0.92);
  --panel-2: rgba(19, 38, 31, 0.96);
  --line: rgba(121, 255, 183, 0.18);
  --text: #e8f5ee;
  --muted: #98ad9f;
  --accent: #36f59a;
  --accent-soft: rgba(54, 245, 154, 0.16);
  --warning: #f2c94c;
  --danger: #ff6b6b;
  --ok: #6ee7b7;
  --shadow: 0 18px 60px rgba(0, 0, 0, 0.38);
  --radius: 22px;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

* { box-sizing: border-box; }

body {
  margin: 0;
  background:
    radial-gradient(circle at top left, rgba(54, 245, 154, 0.14), transparent 34rem),
    radial-gradient(circle at bottom right, rgba(48, 132, 93, 0.18), transparent 36rem),
    var(--bg);
  color: var(--text);
  min-height: 100vh;
}

button, select, input {
  font: inherit;
}

.app-shell {
  width: min(1200px, calc(100% - 28px));
  margin: 0 auto;
  padding: 28px 0 60px;
}

.archive-header {
  display: flex;
  justify-content: space-between;
  gap: 24px;
  align-items: flex-end;
  padding: 28px;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  background: linear-gradient(135deg, rgba(14, 27, 22, 0.96), rgba(8, 18, 14, 0.86));
  box-shadow: var(--shadow);
  margin-bottom: 18px;
}

.eyebrow {
  color: var(--accent);
  text-transform: uppercase;
  letter-spacing: 0.13em;
  font-size: 0.78rem;
  margin: 0 0 8px;
}

h1, h2, p { margin-top: 0; }
h1 { margin-bottom: 6px; font-size: clamp(2rem, 6vw, 4rem); line-height: 0.95; }
h2 { font-size: 1.1rem; margin-bottom: 12px; }
.subtitle { margin-bottom: 0; color: var(--muted); }

.header-stats {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.header-stats > div {
  min-width: 92px;
  padding: 12px 14px;
  border-radius: 16px;
  background: var(--accent-soft);
  border: 1px solid var(--line);
  text-align: center;
}

.header-stats span {
  display: block;
  font-size: 1.35rem;
  font-weight: 800;
}

.header-stats small {
  display: block;
  color: var(--muted);
  margin-top: 2px;
}

main {
  display: grid;
  gap: 18px;
}

.card {
  background: var(--panel);
  border: 1px solid var(--line);
  border-radius: var(--radius);
  box-shadow: var(--shadow);
  padding: 18px;
}

.control-panel {
  display: flex;
  gap: 14px;
  align-items: end;
  flex-wrap: wrap;
}

.control-group {
  display: grid;
  gap: 7px;
}

.control-group label {
  color: var(--muted);
  font-size: 0.88rem;
}

select, input[type="text"] {
  color: var(--text);
  background: rgba(0, 0, 0, 0.22);
  border: 1px solid var(--line);
  border-radius: 12px;
  padding: 10px 12px;
  min-height: 42px;
}

select { min-width: 210px; }

.check-row {
  display: flex;
  align-items: center;
  gap: 8px;
  padding-bottom: 9px;
}

button {
  border: 0;
  border-radius: 14px;
  padding: 11px 14px;
  color: var(--text);
  cursor: pointer;
  transition: transform 120ms ease, opacity 120ms ease, border 120ms ease;
}

button:hover { transform: translateY(-1px); }
button:active { transform: translateY(0); }

.primary {
  background: linear-gradient(135deg, #17985d, #21d883);
  color: #03100a;
  font-weight: 800;
}

.secondary {
  background: rgba(54, 245, 154, 0.14);
  border: 1px solid var(--line);
}

.ghost {
  background: transparent;
  border: 1px solid var(--line);
  color: var(--muted);
}

.danger {
  background: rgba(255, 107, 107, 0.12);
  border: 1px solid rgba(255, 107, 107, 0.34);
  color: #ffd2d2;
}

.quest-card {
  background: var(--panel-2);
}

.quest-topline {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.badge, .timer {
  display: inline-flex;
  min-height: 34px;
  align-items: center;
  justify-content: center;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid var(--line);
  background: var(--accent-soft);
  color: var(--accent);
  font-weight: 800;
}

.timer {
  min-width: 54px;
  color: var(--warning);
  border-color: rgba(242, 201, 76, 0.45);
  background: rgba(242, 201, 76, 0.12);
}

.hidden { display: none !important; }

.image-wrap {
  position: relative;
  display: grid;
  place-items: center;
  min-height: 330px;
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid var(--line);
  background: rgba(0,0,0,0.23);
  margin-bottom: 18px;
}

#animalImage {
  width: 100%;
  max-height: 520px;
  object-fit: contain;
  display: none;
  background: rgba(0,0,0,0.18);
}

.image-fallback {
  display: grid;
  gap: 6px;
  place-items: center;
  color: var(--muted);
  padding: 26px;
  text-align: center;
}

.image-fallback span {
  font-size: 1.6rem;
  color: var(--accent);
  font-weight: 900;
}

.prompt p { color: var(--muted); margin-bottom: 0; }

.answer-area {
  display: grid;
  gap: 12px;
  margin: 18px 0;
}

.answer-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.answer-field {
  display: grid;
  gap: 6px;
}

.answer-field label {
  color: var(--muted);
  font-size: 0.85rem;
}

.action-row {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.feedback {
  margin-top: 14px;
  border-radius: 16px;
  padding: 12px 14px;
  display: none;
  border: 1px solid var(--line);
  background: rgba(0, 0, 0, 0.18);
}

.feedback.show { display: block; }
.feedback.ok { border-color: rgba(110, 231, 183, 0.55); color: #b9ffe5; }
.feedback.warn { border-color: rgba(242, 201, 76, 0.55); color: #ffecad; }
.feedback.bad { border-color: rgba(255, 107, 107, 0.55); color: #ffd2d2; }

.tree-output {
  display: grid;
  gap: 8px;
}

.tree-row {
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 10px;
  align-items: start;
  padding: 10px 12px;
  border: 1px solid var(--line);
  border-radius: 14px;
  background: rgba(0,0,0,0.14);
}

.tree-row strong { color: var(--accent); }
.tree-row span { color: var(--text); }

.muted { color: var(--muted); }

.lab-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}

.chip-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.chip {
  border: 1px solid var(--line);
  border-radius: 999px;
  padding: 7px 10px;
  color: var(--muted);
  background: rgba(0,0,0,0.16);
}

.log-output {
  display: grid;
  gap: 8px;
  max-height: 260px;
  overflow: auto;
}

.log-item {
  border-bottom: 1px solid var(--line);
  padding: 0 0 8px;
}

.log-item:last-child { border-bottom: 0; }

@media (max-width: 760px) {
  .archive-header {
    align-items: stretch;
    flex-direction: column;
  }

  .header-stats {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
  }

  .control-panel {
    display: grid;
  }

  select { min-width: 100%; }

  .answer-grid,
  .lab-grid {
    grid-template-columns: 1fr;
  }

  .tree-row {
    grid-template-columns: 1fr;
  }

  .image-wrap {
    min-height: 250px;
  }
}
