/* ═══════════════════════════════════════════════════════════════════
   RÉCUPÉRATION DES DOSSARDS — dossard.js
   Lit le CSV anonymisé, retrouve les dossards par numéro d'inscription
   et affiche les PNG depuis ./dossards/XXXX.png
═══════════════════════════════════════════════════════════════════ */

const CSV_PATH    = './data/participants_anonymises_Challenge_Connecté_2026.csv';
const DOSSARD_DIR = './dossards/';
const THEME_KEY   = 'challenge2026_theme';

const DOSSARD_FOLDERS = ['course-5km', 'course-10km', 'course-21km', 'marche-5km', 'marche-10km', 'marche-21km'];

function getDossardFolder(bibFilename) {
  const num = parseInt(bibFilename, 10);
  const folder = DOSSARD_FOLDERS[Math.floor(num / 1000)];
  return folder || '';
}

// ─────────────────────────────────────────────
// THÈME
// ─────────────────────────────────────────────
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  const icon = document.getElementById('themeIcon');
  if (icon) icon.textContent = theme === 'light' ? '☀️' : '🌙';
  localStorage.setItem(THEME_KEY, theme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTheme(current === 'dark' ? 'light' : 'dark');
}

(function initTheme() {
  const saved = localStorage.getItem(THEME_KEY);
  if (saved) {
    applyTheme(saved);
  } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    applyTheme('light');
  } else {
    applyTheme('dark');
  }
})();

// ─────────────────────────────────────────────
// ÉTAT GLOBAL
// ─────────────────────────────────────────────
let csvData    = null;
let csvHeaders = null;
let csvDate    = null;
let csvError   = null;

// ─────────────────────────────────────────────
// PARSING CSV
// ─────────────────────────────────────────────
function parseCSVRow(line) {
  const fields = [];
  let current  = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === ';' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);
  return fields;
}

async function loadCSV() {
  try {
    const resp = await fetch(CSV_PATH + '?t=' + Date.now());
    if (!resp.ok) throw new Error('HTTP ' + resp.status);

    const lastMod = resp.headers.get('Last-Modified');
    csvDate = lastMod ? new Date(lastMod) : null;

    const text  = await resp.text();
    const lines = text.replace(/^\uFEFF/, '').split('\n').filter(l => l.trim());
    if (lines.length < 1) throw new Error('Fichier vide');

    csvHeaders = parseCSVRow(lines[0]);
    csvData    = [];

    for (let i = 1; i < lines.length; i++) {
      const fields = parseCSVRow(lines[i]);
      const obj    = {};
      csvHeaders.forEach((h, idx) => { obj[h] = (fields[idx] || '').trim(); });
      if (obj['ID']) csvData.push(obj);
    }

    return true;
  } catch (e) {
    csvError = e.message;
    return false;
  }
}

function searchById(id) {
  if (!csvData) return null;
  const needle = String(id).trim().toLowerCase();
  return csvData.find(row => String(row['ID'] || '').trim().toLowerCase() === needle) || null;
}

// ─────────────────────────────────────────────
// UI — helpers
// ─────────────────────────────────────────────
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function setStatus(type, html) {
  const el = document.getElementById('verifyStatus');
  el.className = 'verify-status verify-status--' + type;
  el.innerHTML = html;
  el.style.display = 'block';
}

function hideStatus() {
  const el = document.getElementById('verifyStatus');
  el.style.display = 'none';
}

function hideGrid() {
  const el = document.getElementById('dossardGrid');
  el.style.display = 'none';
  el.innerHTML = '';
}

// ─────────────────────────────────────────────
// VÉRIFICATION DE L'EXISTENCE D'UN PNG
// ─────────────────────────────────────────────
function checkImageExists(url) {
  return new Promise(resolve => {
    const img = new Image();
    img.onload  = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = url;
  });
}

// ─────────────────────────────────────────────
// RENDU DE LA GRILLE DE DOSSARDS
// ─────────────────────────────────────────────
async function renderDossards(participant) {
  const catCols = csvHeaders.slice(4);
  const races = catCols.filter(cat => participant[cat]);

  const grid = document.getElementById('dossardGrid');
  grid.style.display = 'none';
  grid.innerHTML = '';

  if (races.length === 0) {
    setStatus('notfound', `
      <div class="vs-row">
        <span class="vs-icon">🔍</span>
        <div class="vs-body">
          <strong>Aucune épreuve trouvée pour cette inscription.</strong>
          <p>Vérifiez votre identifiant ou contactez l'organisation.</p>
        </div>
      </div>`);
    return;
  }

  hideStatus();

  // Vérifier l'existence de chaque PNG
  const checks = await Promise.all(
    races.map(async cat => {
      const bib = participant[cat]; // valeur du CSV : "XXXX.png"
      const folder = getDossardFolder(bib);
      const url = DOSSARD_DIR + (folder ? folder + '/' : '') + bib;
      const exists = await checkImageExists(url);
      return { cat, bib, url, exists };
    })
  );

  const freshness = csvDate
    ? `<div class="db-freshness">Données mises à jour le ${csvDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</div>`
    : '';

  const cards = checks.map(({ cat, bib, url, exists }) => {
    const preview = exists
      ? `<img src="${escapeHtml(url)}" alt="Dossard ${escapeHtml(bib)}" loading="lazy">`
      : `<div class="db-bib-placeholder">
           <div class="db-placeholder-icon">🏷️</div>
           <div>Dossard non encore disponible</div>
         </div>`;

    const btn = exists
      ? `<a class="db-download-btn" href="${escapeHtml(url)}" download="${escapeHtml(bib)}">
           <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16l-6-6h4V4h4v6h4l-6 6zm-7 4h14v-2H5v2z"/></svg>
           Télécharger
         </a>`
      : `<span class="db-download-btn db-download-btn--disabled">Non disponible</span>`;

    return `
      <div class="db-card">
        <div class="db-race-name">${escapeHtml(cat)}</div>
        <div class="db-bib-preview">${preview}</div>
        <div class="db-card-footer">
          <span class="db-bib-number">#${escapeHtml(bib)}</span>
          ${btn}
        </div>
      </div>`;
  }).join('');

  grid.innerHTML = `<div class="db-grid">${cards}</div>${freshness}`;
  grid.style.display = 'block';
  grid.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ─────────────────────────────────────────────
// ACTION PRINCIPALE
// ─────────────────────────────────────────────
async function doDossard() {
  const input = document.getElementById('idInput');
  const id    = input.value.trim();

  hideGrid();

  if (!id) {
    input.focus();
    setStatus('warn', `
      <div class="vs-row">
        <span class="vs-icon">⚠️</span>
        <div class="vs-body"><strong>Veuillez saisir votre numéro d'inscription.</strong></div>
      </div>`);
    return;
  }

  if (!csvData && !csvError) {
    setStatus('loading', `
      <div class="vs-row">
        <span class="vs-icon vs-spin">⏳</span>
        <div class="vs-body">Chargement des données en cours…</div>
      </div>`);
    const ok = await loadCSV();
    if (!ok) {
      setStatus('error', `
        <div class="vs-row">
          <span class="vs-icon">❌</span>
          <div class="vs-body">
            <strong>Impossible de charger les données.</strong><br>
            <small>${escapeHtml(csvError)}</small>
          </div>
        </div>`);
      return;
    }
  }

  if (csvError) {
    setStatus('error', `
      <div class="vs-row">
        <span class="vs-icon">❌</span>
        <div class="vs-body"><strong>Données non disponibles.</strong></div>
      </div>`);
    return;
  }

  const participant = searchById(id);

  if (!participant) {
    setStatus('notfound', `
      <div class="vs-row">
        <span class="vs-icon">🔍</span>
        <div class="vs-body">
          <strong>Aucune inscription trouvée pour l'identifiant <em>${escapeHtml(id)}</em>.</strong>
          <p>Vérifiez le numéro dans votre email de confirmation. Si votre inscription est récente, les données sont mises à jour quotidiennement — réessayez demain.</p>
        </div>
      </div>`);
    return;
  }

  setStatus('loading', `
    <div class="vs-row">
      <span class="vs-icon vs-spin">⏳</span>
      <div class="vs-body">Récupération de vos dossards…</div>
    </div>`);

  await renderDossards(participant);
}

// ─────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  const input = document.getElementById('idInput');
  if (input) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') doDossard();
    });
  }
});
