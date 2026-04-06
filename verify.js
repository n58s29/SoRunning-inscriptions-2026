/* ═══════════════════════════════════════════════════════════════════
   VÉRIFICATION D'INSCRIPTION — verify.js
   Lit le CSV anonymisé depuis ./data/participants_anonymises.csv
   Format attendu : ID;NOM;PRÉNOM;EMAIL;[catégorie…]
   Séparateur ; — encodage UTF-8 BOM — champs entre guillemets doubles
═══════════════════════════════════════════════════════════════════ */

const CSV_PATH  = './data/participants_anonymises_Challenge_Connecté_2026.csv';
const THEME_KEY = 'challenge2026_theme';

// ─────────────────────────────────────────────
// THÈME (partagé avec admin via localStorage)
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
let csvData    = null;   // tableau d'objets {ID, NOM, PRÉNOM, EMAIL, …}
let csvHeaders = null;   // tableau des noms de colonnes
let csvDate    = null;   // Date de mise à jour du fichier (Last-Modified)
let csvError   = null;   // message d'erreur si le chargement échoue

// ─────────────────────────────────────────────
// PARSING CSV (gère guillemets doubles, BOM, séparateur ;)
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
// UI — affichage du résultat
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
  el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
}

// ─────────────────────────────────────────────
// ACTION PRINCIPALE
// ─────────────────────────────────────────────
async function doVerify() {
  const input = document.getElementById('idInput');
  const id    = input.value.trim();

  if (!id) {
    input.focus();
    setStatus('warn', `
      <div class="vs-row">
        <span class="vs-icon">⚠️</span>
        <div class="vs-body"><strong>Veuillez saisir votre identifiant d'inscription.</strong></div>
      </div>`);
    return;
  }

  // Chargement du CSV si pas encore fait
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
          <strong>Aucune inscription trouvée pour l'identifiant <em>${escapeHtml(id)}</em></strong>
          <p>Vérifiez l'identifiant dans votre email de confirmation. Si votre inscription est récente, les données sont mises à jour quotidiennement — réessayez demain.</p>
        </div>
      </div>`);
    return;
  }

  // Colonnes catégories = tout ce qui est après EMAIL (index 4+)
  const catCols = csvHeaders.slice(4);
  const categoriesBadges = catCols
    .filter(cat => participant[cat])
    .map(cat => `
      <div class="vs-dossard">
        <span class="vs-doss-cat">${escapeHtml(cat)}</span>
      </div>`)
    .join('');

  const freshnessHtml = csvDate
    ? `<div class="vs-freshness">Données mises à jour le ${csvDate.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}</div>`
    : '';

  setStatus('found', `
    <div class="vs-found-header">
      <span class="vs-check">✅</span>
      <div>
        <div class="vs-found-title">Inscription confirmée</div>
        <div class="vs-found-sub">Votre participation au Challenge Connecté 2026 est bien enregistrée.</div>
      </div>
    </div>

    <div class="vs-info-grid">
      <div class="vs-info-item">
        <span class="vs-info-label">Nom</span>
        <span class="vs-info-value">${escapeHtml(participant['NOM'] || '—')}</span>
      </div>
      <div class="vs-info-item">
        <span class="vs-info-label">Prénom</span>
        <span class="vs-info-value">${escapeHtml(participant['PRÉNOM'] || '—')}</span>
      </div>
      <div class="vs-info-item vs-info-item--full">
        <span class="vs-info-label">Email</span>
        <span class="vs-info-value">${escapeHtml(participant['EMAIL'] || '—')}</span>
      </div>
    </div>

    ${categoriesBadges
      ? `<div class="vs-dossards-title">Épreuve(s) inscrite(s)</div>
         <div class="vs-dossards">${categoriesBadges}</div>`
      : `<div class="vs-no-dossard">Aucune épreuve trouvée pour le moment.</div>`
    }
    ${freshnessHtml}
  `);
}

// ─────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Touche Entrée dans le champ ID
  const input = document.getElementById('idInput');
  if (input) {
    input.addEventListener('keydown', e => {
      if (e.key === 'Enter') doVerify();
    });
  }

  // Pré-chargement du CSV en arrière-plan pour afficher le compteur
  loadCSV().then(() => {
    if (!csvData) return;
    const countEl = document.getElementById('csvParticipantCount');
    if (countEl) {
      countEl.textContent = csvData.length + ' participant' + (csvData.length > 1 ? 's' : '') + ' inscrits';
    }
  });
});
