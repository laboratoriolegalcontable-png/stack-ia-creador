// app.js - Stack IA Creador PWA
// Vanilla JS. Sin dependencias.

(function () {
  "use strict";

  const ETAPA_LABEL = {
    "meta": "Meta",
    "01-guion": "01 Guion",
    "02-imagen": "02 Imagen",
    "03-video": "03 Video",
    "04-voz": "04 Voz",
    "05-avatar": "05 Avatar",
    "06-dms": "06 DMs",
    "07-master": "Master Prompt",
  };

  let DATA = { prompts: [], programas: [], skills: [] };

  async function loadJson(path) {
    const r = await fetch(path, { cache: "no-store" });
    if (!r.ok) throw new Error(`fetch ${path}: ${r.status}`);
    return r.json();
  }

  async function loadData() {
    let prompts = [], programas = [], skills = [];
    try {
      const [pr, pg] = await Promise.all([
        loadJson("/prompts.json"),
        loadJson("/programas.json"),
      ]);
      prompts = pr.prompts || [];
      programas = pg.programas || [];
    } catch (err) {
      console.error("Error cargando data:", err);
    }
    try {
      skills = JSON.parse(document.getElementById("skills-data").textContent);
    } catch (e) { console.error(e); }
    return { prompts, programas, skills };
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    })[c]);
  }

  function renderPromptBody(p) {
    const vars = (p.variables || []).map((v) => `<span>{${escapeHtml(v)}}</span>`).join("");
    return `
      ${vars ? `<div class="vars"><strong>Variables:</strong> ${vars}</div>` : ""}
      <pre><button class="copy-btn" data-copy="${encodeURIComponent(p.body)}" aria-label="Copiar prompt">Copiar</button><code>${escapeHtml(p.body)}</code></pre>`;
  }

  function renderSkills(query) {
    const container = document.getElementById("skillsList");
    const q = (query || "").trim().toLowerCase();
    const filtered = DATA.skills.filter((s) => {
      if (!q) return true;
      const haystack = [
        s.name, s.desc, s.etapa, ...(s.triggers || []), ...(s.prompts || []),
      ].join(" ").toLowerCase();
      return haystack.includes(q);
    });

    if (!filtered.length) {
      container.innerHTML = '<div class="empty">Sin resultados.</div>';
      return;
    }

    container.innerHTML = filtered.map((s) => {
      const promptDetails = (s.prompts || []).map((pid) => {
        const p = DATA.prompts.find((pp) => pp.id === pid);
        if (!p) return "";
        return `
          <details>
            <summary>${escapeHtml(p.id)} - ${escapeHtml(p.titulo)}</summary>
            ${renderPromptBody(p)}
          </details>`;
      }).join("");

      return `
        <div class="card">
          <h3>${escapeHtml(s.name)}</h3>
          <div class="tags">
            <span class="tag ${s.active ? "active" : "inactive"}">${s.active ? "ACTIVO" : "INACTIVO"}</span>
            <span class="tag">${escapeHtml(ETAPA_LABEL[s.etapa] || s.etapa)}</span>
          </div>
          <p>${escapeHtml(s.desc)}</p>
          <div class="vars"><strong>Triggers:</strong> ${(s.triggers || []).map((t) => `<span>${escapeHtml(t)}</span>`).join("")}</div>
          ${promptDetails}
        </div>`;
    }).join("");

    attachCopyHandlers();
  }

  function renderPrompts(query, etapa) {
    const container = document.getElementById("promptsList");
    const q = (query || "").trim().toLowerCase();
    const filtered = DATA.prompts.filter((p) => {
      if (etapa && p.etapa !== etapa) return false;
      if (!q) return true;
      const haystack = [p.id, p.titulo, p.etapa, p.body].join(" ").toLowerCase();
      return haystack.includes(q);
    });

    if (!filtered.length) {
      container.innerHTML = '<div class="empty">Sin resultados.</div>';
      return;
    }

    container.innerHTML = filtered.map((p) => `
      <div class="card">
        <h3>${escapeHtml(p.titulo)}</h3>
        <div class="tags">
          <span class="tag">${escapeHtml(ETAPA_LABEL[p.etapa] || p.etapa)}</span>
          <span class="tag">${escapeHtml(p.herramienta_primaria || "")}</span>
          <span class="tag">${escapeHtml(p.id)}</span>
        </div>
        ${renderPromptBody(p)}
      </div>
    `).join("");

    attachCopyHandlers();
  }

  function renderProgramas(query, etapa) {
    const container = document.getElementById("programasList");
    const q = (query || "").trim().toLowerCase();
    const filtered = DATA.programas.filter((p) => {
      if (etapa && p.etapa !== etapa) return false;
      if (!q) return true;
      const haystack = [p.id, p.nombre, p.rol, p.etapa, p.costo].join(" ").toLowerCase();
      return haystack.includes(q);
    });

    if (!filtered.length) {
      container.innerHTML = '<div class="empty">Sin resultados.</div>';
      return;
    }

    container.innerHTML = filtered.map((p) => `
      <div class="card">
        <h3>${escapeHtml(p.nombre)}</h3>
        <div class="tags">
          <span class="tag">${escapeHtml(ETAPA_LABEL[p.etapa] || p.etapa)}</span>
          ${p.modelos ? p.modelos.map((m) => `<span class="tag">${escapeHtml(m)}</span>`).join("") : ""}
        </div>
        <p><strong>Rol:</strong> ${escapeHtml(p.rol || "")}</p>
        <p><strong>Costo:</strong> ${escapeHtml(p.costo || "n/d")}</p>
        ${p.setup ? `<p style="font-size:0.8rem"><strong>Setup:</strong> ${escapeHtml(p.setup)}</p>` : ""}
        <div style="margin-top:0.6rem;display:flex;gap:0.4rem;flex-wrap:wrap">
          <a class="btn" href="${escapeHtml(p.url_web)}" target="_blank" rel="noopener">Abrir</a>
          ${p.url_cli ? `<a class="btn btn-secondary" href="${escapeHtml(p.url_cli)}" target="_blank" rel="noopener">CLI / docs</a>` : ""}
        </div>
      </div>
    `).join("");
  }

  function attachCopyHandlers() {
    document.querySelectorAll(".copy-btn").forEach((btn) => {
      if (btn.dataset.bound) return;
      btn.dataset.bound = "1";
      btn.addEventListener("click", async () => {
        const text = decodeURIComponent(btn.dataset.copy || "");
        try {
          await navigator.clipboard.writeText(text);
          const old = btn.textContent;
          btn.textContent = "Copiado";
          btn.classList.add("copied");
          setTimeout(() => {
            btn.textContent = old;
            btn.classList.remove("copied");
          }, 1500);
        } catch (e) {
          alert("No se pudo copiar. Selecciona el texto manualmente.");
        }
      });
    });
  }

  function downloadAllPrompts() {
    const lines = [
      "# Stack IA Creador - Pack de prompts",
      "",
      "> Tool-agnostic. Listos para pegar en Claude, ChatGPT, Gemini, Perplexity, etc.",
      "",
    ];
    DATA.prompts.forEach((p) => {
      lines.push(`## ${p.id} - ${p.titulo}`);
      lines.push(`- Etapa: ${p.etapa}`);
      lines.push(`- Herramienta: ${p.herramienta_primaria}`);
      if (p.variables && p.variables.length) {
        lines.push(`- Variables: ${p.variables.join(", ")}`);
      }
      lines.push("");
      lines.push("```");
      lines.push(p.body);
      lines.push("```");
      lines.push("");
    });
    const blob = new Blob([lines.join("\n")], { type: "text/markdown;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "stack-ia-prompts.md";
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function setupTabs() {
    document.querySelectorAll("nav.tabs button").forEach((btn) => {
      btn.addEventListener("click", () => {
        document.querySelectorAll("nav.tabs button").forEach((b) => b.classList.remove("active"));
        btn.classList.add("active");
        ["skills", "prompts", "programas"].forEach((id) => {
          document.getElementById(`tab-${id}`).classList.toggle("hidden", id !== btn.dataset.tab);
        });
      });
    });
  }

  function populateEtapaFilter(selectId, items) {
    const sel = document.getElementById(selectId);
    const etapas = [...new Set(items.map((i) => i.etapa))].sort();
    etapas.forEach((et) => {
      const opt = document.createElement("option");
      opt.value = et;
      opt.textContent = ETAPA_LABEL[et] || et;
      sel.appendChild(opt);
    });
  }

  function registerServiceWorker() {
    if (!("serviceWorker" in navigator)) return;
    if (location.protocol !== "https:" && location.hostname !== "localhost") return;
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("/sw.js").catch((err) => {
        console.warn("SW registration failed:", err);
      });
    });
  }

  async function init() {
    setupTabs();
    DATA = await loadData();

    populateEtapaFilter("promptsFilter", DATA.prompts);
    populateEtapaFilter("programasFilter", DATA.programas);

    renderSkills("");
    renderPrompts("", "");
    renderProgramas("", "");

    document.getElementById("skillsSearch").addEventListener("input", (e) =>
      renderSkills(e.target.value));
    document.getElementById("promptsSearch").addEventListener("input", (e) =>
      renderPrompts(e.target.value, document.getElementById("promptsFilter").value));
    document.getElementById("promptsFilter").addEventListener("change", (e) =>
      renderPrompts(document.getElementById("promptsSearch").value, e.target.value));
    document.getElementById("programasSearch").addEventListener("input", (e) =>
      renderProgramas(e.target.value, document.getElementById("programasFilter").value));
    document.getElementById("programasFilter").addEventListener("change", (e) =>
      renderProgramas(document.getElementById("programasSearch").value, e.target.value));
    document.getElementById("downloadAll").addEventListener("click", downloadAllPrompts);

    registerServiceWorker();
  }

  init();
})();
