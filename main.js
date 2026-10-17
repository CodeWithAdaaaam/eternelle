/* Fleur Éternelle — scripts du site */

/* ===================== À PERSONNALISER ===================== */
// Numéro WhatsApp (format international sans + ni espaces). ⚠️ À remplacer.
var WA_NUMBER = '212600000000';

// Prix en DH. Laisser à null tant que les tarifs ne sont pas fixés :
// le site affiche alors « Prix confirmé sur WhatsApp ».
var PRICES = {
  flower: null,       // prix d'une fleur, ex. 15
  options: {          // prix des options, ex. { carte: 10, led: 30, boite: 50, papillons: 20, nom: 25 }
    carte: null, led: null, boite: null, papillons: null, nom: null
  }
};
/* =========================================================== */

function waLink(msg) { return 'https://wa.me/' + WA_NUMBER + '?text=' + encodeURIComponent(msg); }

var COLORS = {
  rouge: '#C8203A', bordeaux: '#7A1E33', rose: '#F29CB4', poudre: '#F6C9D3', peche: '#F5A97F',
  jaune: '#F4C430', blanc: '#F7F3EC', lilas: '#C8A2E0', violet: '#7E5BB0', bleu: '#6E9BD8', noir: '#2B2727'
};
var COLOR_NAMES = { rouge: 'Rouge', bordeaux: 'Bordeaux', rose: 'Rose', poudre: 'Rose poudré', peche: 'Pêche', jaune: 'Jaune', blanc: 'Blanc', lilas: 'Lilas', violet: 'Violet', bleu: 'Bleu', noir: 'Noir' };
var PAPERS = { kraft: '#C9A27A', creme: '#F1E8DA', noir: '#2A2626', rose: '#F0BFCD', lilas: '#D6C3EA', sauge: '#AFC3A2', blanc: '#FBF8F4' };
var PAPER_NAMES = { kraft: 'Kraft', creme: 'Crème', noir: 'Noir', rose: 'Rose', lilas: 'Lilas', sauge: 'Sauge', blanc: 'Blanc' };
var RIBBONS = { blanc: '#FFFFFF', rouge: '#C8203A', rose: '#F29CB4', noir: '#2B2727', or: '#D4AF37', lilas: '#C8A2E0' };
var RIBBON_NAMES = { blanc: 'Blanc', rouge: 'Rouge', rose: 'Rose', noir: 'Noir', or: 'Doré', lilas: 'Lilas' };

var FLOWERS = [
  { id: 'rose', name: 'Rose', def: 'rouge' },
  { id: 'tulipe', name: 'Tulipe', def: 'rose' },
  { id: 'tournesol', name: 'Tournesol', def: 'jaune' },
  { id: 'marguerite', name: 'Marguerite', def: 'blanc' },
  { id: 'pivoine', name: 'Pivoine', def: 'poudre' },
  { id: 'lavande', name: 'Lavande', def: 'violet' },
  { id: 'coeur', name: 'Cœur', def: 'rouge' }
];
var OPTIONS = [
  { id: 'carte', name: 'Carte message', desc: 'Votre mot, écrit à la main' },
  { id: 'led', name: 'Guirlande LED', desc: 'Petites lumières dans le bouquet' },
  { id: 'boite', name: 'Boîte cadeau', desc: 'Présentation en box' },
  { id: 'papillons', name: 'Papillons', desc: 'Petits papillons décoratifs' },
  { id: 'nom', name: 'Prénom / initiale', desc: 'Lettres en chenille sur le bouquet' }
];

/* Modèles de la collection (prénommés pour l'exemple, à adapter) */
var MODELS = [
  { id: 'eternel-amour', name: 'Éternel Amour', occ: 'Amour', paper: 'noir', ribbon: 'rouge', flowers: { rose: [12, 'rouge'] } },
  { id: 'douceur', name: 'Douceur Poudrée', occ: 'Anniversaire', paper: 'blanc', ribbon: 'rose', flowers: { pivoine: [3, 'poudre'], tulipe: [5, 'rose'], marguerite: [4, 'blanc'] } },
  { id: 'soleil', name: 'Rayon de Soleil', occ: 'Anniversaire', paper: 'kraft', ribbon: 'blanc', flowers: { tournesol: [5, 'jaune'], marguerite: [5, 'blanc'] } },
  { id: 'maman', name: 'Pour Maman', occ: 'Fête des mères', paper: 'rose', ribbon: 'blanc', flowers: { tulipe: [6, 'peche'], rose: [4, 'rose'], lavande: [3, 'lilas'] } },
  { id: 'mini-coeur', name: 'Mini Cœur', occ: 'Mini', paper: 'creme', ribbon: 'rouge', flowers: { coeur: [1, 'rouge'], rose: [3, 'rouge'] } },
  { id: 'provence', name: 'Champ de Lavande', occ: 'Mini', paper: 'sauge', ribbon: 'lilas', flowers: { lavande: [7, 'violet'] } },
  { id: 'nuit', name: 'Nuit Étoilée', occ: 'Amour', paper: 'noir', ribbon: 'or', flowers: { rose: [7, 'bleu'], marguerite: [4, 'blanc'] } },
  { id: 'tulipes', name: 'Tulipes Pastel', occ: 'Fête des mères', paper: 'lilas', ribbon: 'blanc', flowers: { tulipe: [10, 'lilas'] } }
];
// Remplacer par les vrais prix des modèles, ex. 'eternel-amour': '250 DH'
var MODEL_PRICES = {};

/* ===================== Dessin d'un bouquet (SVG) ===================== */
var uid = 0;
function shade(hex, amt) {
  var n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255;
  function f(c) { return Math.max(0, Math.min(255, Math.round(amt < 0 ? c * (1 + amt) : c + (255 - c) * amt))); }
  return '#' + ((1 << 24) + (f(r) << 16) + (f(g) << 8) + f(b)).toString(16).slice(1);
}
function petals(n, len, wid, col, stroke, rot) {
  var s = '';
  for (var i = 0; i < n; i++) {
    var a = (360 / n) * i + (rot || 0);
    s += '<ellipse cx="0" cy="' + (-len / 2) + '" rx="' + wid + '" ry="' + (len / 2) + '" fill="' + col + '" stroke="' + stroke + '" stroke-width="1.6" transform="rotate(' + a + ')"/>';
  }
  return s;
}
function flowerShape(type, hex, s) {
  var d = shade(hex, -0.25), l = shade(hex, 0.35);
  switch (type) {
    case 'rose':
      return '<circle r="' + s * .95 + '" fill="' + hex + '" stroke="' + d + '" stroke-width="2"/>' +
        '<path d="M0 0 m-' + s * .15 + ' 0 a' + s * .15 + ' ' + s * .15 + ' 0 1 1 ' + s * .3 + ' 0 a' + s * .32 + ' ' + s * .32 + ' 0 1 1 -' + s * .62 + ' 0 a' + s * .5 + ' ' + s * .5 + ' 0 1 1 ' + s * .98 + ' 0 a' + s * .66 + ' ' + s * .66 + ' 0 1 1 -' + s * 1.3 + ' 0" fill="none" stroke="' + d + '" stroke-width="' + Math.max(2, s * .12) + '" stroke-linecap="round"/>';
    case 'tulipe':
      return '<path d="M-' + s * .8 + ' -' + s * .2 + ' Q-' + s * .85 + ' ' + s * .9 + ' 0 ' + s * .9 + ' Q' + s * .85 + ' ' + s * .9 + ' ' + s * .8 + ' -' + s * .2 + ' L' + s * .45 + ' ' + s * .15 + ' L0 -' + s * .55 + ' L-' + s * .45 + ' ' + s * .15 + ' Z" fill="' + hex + '" stroke="' + d + '" stroke-width="2" stroke-linejoin="round"/>' +
        '<path d="M0 -' + s * .55 + ' L0 ' + s * .7 + '" stroke="' + d + '" stroke-width="1.5" opacity=".5"/>';
    case 'tournesol':
      return petals(14, s * 1.05, s * .2, hex, d, 0) + '<circle r="' + s * .48 + '" fill="#5A3A1E" stroke="#3C2612" stroke-width="2"/>';
    case 'marguerite':
      return petals(10, s * 1.05, s * .22, hex, shade(hex, -0.12), 0) + '<circle r="' + s * .3 + '" fill="#F4C430" stroke="#C99A12" stroke-width="2"/>';
    case 'pivoine':
      return '<circle r="' + s * 1.05 + '" fill="' + d + '"/>' + petals(8, s * 1.1, s * .42, hex, d, 0) + petals(6, s * .75, s * .32, l, hex, 30) + '<circle r="' + s * .25 + '" fill="' + l + '"/>';
    case 'lavande':
      var g = '';
      for (var i = 0; i < 6; i++) g += '<ellipse cx="' + (i % 2 ? 3 : -3) + '" cy="' + (-s * 1.1 + i * s * .38) + '" rx="' + s * .22 + '" ry="' + s * .2 + '" fill="' + hex + '" stroke="' + d + '" stroke-width="1.4"/>';
      return g;
    case 'coeur':
      return '<path d="M0 ' + s * .85 + ' C-' + s * 1.3 + ' 0 -' + s * .8 + ' -' + s * 1.05 + ' 0 -' + s * .4 + ' C' + s * .8 + ' -' + s * 1.05 + ' ' + s * 1.3 + ' 0 0 ' + s * .85 + 'Z" fill="' + hex + '" stroke="' + d + '" stroke-width="2.4" stroke-linejoin="round"/>';
  }
  return '';
}
/* items: [{type, color}] ; paper, ribbon: hex ; opts: {led, papillons, nom} */
function bouquetSVG(items, paper, ribbon, opts, label) {
  opts = opts || {};
  var id = 'fz' + (uid++);
  var cx = 200, cy = 175, k = Math.min(items.length, 40);
  var s = Math.max(15, Math.min(34, 40 - k * 0.9));
  var R = 34 + Math.sqrt(k) * (s * 1.05);
  var pts = [];
  for (var i = 0; i < k; i++) {
    var r = k === 1 ? 0 : R * Math.sqrt((i + 0.5) / k);
    var a = i * 2.39996 + 0.4;
    pts.push({ x: cx + r * Math.cos(a) * 1.15, y: cy - 10 + r * Math.sin(a) * 0.72 - (R - r) * 0.15, it: items[i] });
  }
  pts.sort(function (p, q) { return p.y - q.y; });
  var paperD = shade(paper, -0.18), paperL = shade(paper, 0.15);
  var half = Math.min(150, 70 + R * 0.6);
  var svg = '<svg viewBox="0 0 400 470" role="img" aria-label="' + (label || 'Aperçu du bouquet') + '" xmlns="http://www.w3.org/2000/svg">' +
    '<defs><filter id="' + id + '" x="-20%" y="-20%" width="140%" height="140%"><feTurbulence type="fractalNoise" baseFrequency="1.4" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="3.2"/></filter></defs>';
  // papier arrière
  svg += '<path d="M' + (cx - half - 18) + ' ' + (cy - 30) + ' Q' + cx + ' ' + (cy - R - 70) + ' ' + (cx + half + 18) + ' ' + (cy - 30) + ' L' + cx + ' 430 Z" fill="' + paperD + '"/>';
  // tiges
  svg += '<g stroke="#5E8B4F" stroke-width="3.2" stroke-linecap="round" filter="url(#' + id + ')">';
  pts.forEach(function (p) { svg += '<path d="M' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ' Q' + ((p.x + cx) / 2).toFixed(1) + ' ' + (p.y + 80).toFixed(1) + ' ' + cx + ' 400"/>'; });
  svg += '</g>';
  // feuilles
  svg += '<g fill="#7FA86C" stroke="#4E7A40" stroke-width="1.6" filter="url(#' + id + ')">' +
    '<ellipse cx="' + (cx - half * 0.55) + '" cy="' + (cy + 40) + '" rx="12" ry="30" transform="rotate(-40 ' + (cx - half * 0.55) + ' ' + (cy + 40) + ')"/>' +
    '<ellipse cx="' + (cx + half * 0.55) + '" cy="' + (cy + 40) + '" rx="12" ry="30" transform="rotate(40 ' + (cx + half * 0.55) + ' ' + (cy + 40) + ')"/></g>';
  // fleurs
  svg += '<g filter="url(#' + id + ')">';
  pts.forEach(function (p) {
    var sz = p.it.type === 'pivoine' ? s * 1.15 : p.it.type === 'lavande' ? s * 0.9 : s;
    svg += '<g transform="translate(' + p.x.toFixed(1) + ' ' + p.y.toFixed(1) + ')">' + flowerShape(p.it.type, p.it.color, sz) + '</g>';
  });
  svg += '</g>';
  if (opts.papillons) {
    [[cx - half + 10, cy - R + 10, '#F29CB4'], [cx + half - 20, cy - R + 40, '#6E9BD8']].forEach(function (b) {
      svg += '<g transform="translate(' + b[0] + ' ' + b[1] + ') rotate(-15)" filter="url(#' + id + ')"><ellipse cx="-8" cy="0" rx="9" ry="12" fill="' + b[2] + '"/><ellipse cx="8" cy="0" rx="9" ry="12" fill="' + b[2] + '"/><rect x="-1.5" y="-10" width="3" height="20" rx="1.5" fill="#2B2727"/></g>';
    });
  }
  if (opts.led) {
    svg += '<g>';
    for (var j = 0; j < 14; j++) {
      var a2 = Math.PI * (j / 13), lx = cx - Math.cos(a2) * (R + 10), ly = cy - 5 - Math.sin(a2) * (R * 0.7 + 8);
      svg += '<circle cx="' + lx.toFixed(1) + '" cy="' + ly.toFixed(1) + '" r="3.2" fill="#FFE9A8"/><circle cx="' + lx.toFixed(1) + '" cy="' + ly.toFixed(1) + '" r="7" fill="#FFE9A8" opacity=".25"/>';
    }
    svg += '</g>';
  }
  // papier avant
  svg += '<path d="M' + (cx - half) + ' ' + (cy + 20) + ' L' + cx + ' 440 L' + (cx + half) + ' ' + (cy + 20) + ' Q' + cx + ' ' + (cy + 70) + ' ' + (cx - half) + ' ' + (cy + 20) + 'Z" fill="' + paper + '" stroke="' + paperD + '" stroke-width="2"/>';
  svg += '<path d="M' + (cx - half * 0.55) + ' ' + (cy + 52) + ' L' + cx + ' 440" stroke="' + paperL + '" stroke-width="2" opacity=".7"/>';
  svg += '<path d="M' + (cx + half * 0.55) + ' ' + (cy + 52) + ' L' + cx + ' 440" stroke="' + paperD + '" stroke-width="2" opacity=".5"/>';
  // ruban
  var ry = 345, rd = shade(ribbon, -0.22);
  svg += '<g stroke="' + rd + '" stroke-width="1.8" stroke-linejoin="round"><path d="M' + cx + ' ' + ry + ' C' + (cx - 45) + ' ' + (ry - 32) + ' ' + (cx - 58) + ' ' + (ry + 18) + ' ' + cx + ' ' + ry + 'Z" fill="' + ribbon + '"/><path d="M' + cx + ' ' + ry + ' C' + (cx + 45) + ' ' + (ry - 32) + ' ' + (cx + 58) + ' ' + (ry + 18) + ' ' + cx + ' ' + ry + 'Z" fill="' + ribbon + '"/><path d="M' + (cx - 4) + ' ' + ry + ' L' + (cx - 22) + ' ' + (ry + 50) + ' M' + (cx + 4) + ' ' + ry + ' L' + (cx + 24) + ' ' + (ry + 48) + '" fill="none" stroke="' + ribbon + '" stroke-width="7" stroke-linecap="round"/><circle cx="' + cx + '" cy="' + ry + '" r="7" fill="' + ribbon + '"/></g>';
  if (opts.nom) {
    svg += '<text x="' + cx + '" y="' + (cy + 105) + '" text-anchor="middle" font-family="Fraunces, Georgia, serif" font-style="italic" font-size="30" fill="' + (paper === PAPERS.noir ? '#F6C9D3' : '#7A1E33') + '" filter="url(#' + id + ')">' + escapeXML(String(opts.nom).slice(0, 12)) + '</text>';
  }
  return svg + '</svg>';
}
function escapeXML(s) { return s.replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }

function expand(flowerMap) {
  // répartit les fleurs en alternance pour un rendu mélangé
  var lists = Object.keys(flowerMap).map(function (t) {
    var q = flowerMap[t][0], c = COLORS[flowerMap[t][1]] || flowerMap[t][1], arr = [];
    for (var i = 0; i < q; i++) arr.push({ type: t, color: c });
    return arr;
  });
  var out = [], more = true;
  while (more) { more = false; lists.forEach(function (l) { if (l.length) { out.push(l.shift()); more = true; } }); }
  return out;
}
function modelSVG(m) { return bouquetSVG(expand(m.flowers), PAPERS[m.paper], RIBBONS[m.ribbon], {}, 'Bouquet ' + m.name); }
function modelCount(m) { return Object.keys(m.flowers).reduce(function (n, t) { return n + m.flowers[t][0]; }, 0); }
function modelDesc(m) {
  return Object.keys(m.flowers).map(function (t) {
    var f = FLOWERS.filter(function (x) { return x.id === t; })[0];
    return m.flowers[t][0] + ' ' + f.name.toLowerCase() + (m.flowers[t][0] > 1 ? 's' : '') + ' ' + COLOR_NAMES[m.flowers[t][1]].toLowerCase();
  }).join(', ');
}

/* ===================== Démarrage ===================== */
document.addEventListener('DOMContentLoaded', function () {
  var burger = document.querySelector('.burger'), nav = document.querySelector('.nav');
  if (burger && nav) burger.addEventListener('click', function () {
    var open = nav.classList.toggle('open');
    burger.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  document.querySelectorAll('[data-wa]').forEach(function (a) {
    a.href = waLink(a.getAttribute('data-wa') || 'Bonjour Fleur Éternelle !');
    a.target = '_blank'; a.rel = 'noopener';
  });
  // Bouquets dessinés : <div data-model="id">
  document.querySelectorAll('[data-model]').forEach(function (el) {
    var m = MODELS.filter(function (x) { return x.id === el.getAttribute('data-model'); })[0];
    if (m) el.innerHTML = modelSVG(m);
  });
  initCollection();
  initBuilder();
  initGallery();
});

/* ===================== Collection ===================== */
function productCard(m) {
  var price = MODEL_PRICES[m.id] || '[PRIX] DH';
  return '<article class="product" data-occ="' + m.occ + '">' +
    '<a class="pimg" href="personnaliser.html?modele=' + m.id + '" aria-label="Personnaliser ' + m.name + '">' + modelSVG(m) + '</a>' +
    '<span class="tag">' + m.occ + ' · ' + modelCount(m) + ' fleurs</span>' +
    '<h3>' + m.name + '</h3><p>' + modelDesc(m) + '</p>' +
    '<div class="prow"><span class="price">' + price + '</span></div>' +
    '<div class="pact"><a class="btn btn-sm" href="personnaliser.html?modele=' + m.id + '">Personnaliser</a>' +
    '<a class="btn btn-sm btn-fill" href="' + waLink('Bonjour Fleur Éternelle ! Je souhaite commander le bouquet « ' + m.name + ' » (' + modelDesc(m) + ').') + '" target="_blank" rel="noopener">Commander</a></div>' +
    '</article>';
}
function initCollection() {
  var best = document.getElementById('bestsellers');
  if (best) best.innerHTML = ['eternel-amour', 'douceur', 'soleil', 'maman'].map(function (id) {
    return productCard(MODELS.filter(function (m) { return m.id === id; })[0]);
  }).join('');
  var grid = document.getElementById('collection');
  if (!grid) return;
  grid.innerHTML = MODELS.map(productCard).join('');
  var pills = document.querySelectorAll('#filters .pill');
  pills.forEach(function (p) {
    p.addEventListener('click', function () {
      var c = p.getAttribute('data-occ');
      pills.forEach(function (x) { x.classList.toggle('on', x === p); x.setAttribute('aria-pressed', x === p ? 'true' : 'false'); });
      grid.querySelectorAll('.product').forEach(function (el) { el.hidden = !(c === 'Tout' || el.getAttribute('data-occ') === c); });
    });
  });
}

/* ===================== Configurateur ===================== */
function initBuilder() {
  var root = document.getElementById('builder');
  if (!root) return;
  var st = { qty: {}, col: {}, paper: 'kraft', ribbon: 'blanc', opts: {}, model: null };
  FLOWERS.forEach(function (f) { st.qty[f.id] = 0; st.col[f.id] = f.def; });
  var params = new URLSearchParams(location.search);
  var m = MODELS.filter(function (x) { return x.id === params.get('modele'); })[0];
  if (m) {
    st.model = m.name; st.paper = m.paper; st.ribbon = m.ribbon;
    Object.keys(m.flowers).forEach(function (t) { st.qty[t] = m.flowers[t][0]; st.col[t] = m.flowers[t][1]; });
    document.getElementById('from-model').hidden = false;
    document.getElementById('from-model-name').textContent = m.name;
  } else { st.qty.rose = 5; st.qty.marguerite = 3; }

  // Fleurs
  var fl = document.getElementById('flower-list');
  fl.innerHTML = FLOWERS.map(function (f) {
    var sw = Object.keys(COLORS).map(function (c) {
      return '<button type="button" class="sw" data-f="' + f.id + '" data-c="' + c + '" style="--c:' + COLORS[c] + '" aria-label="' + f.name + ' ' + COLOR_NAMES[c] + '" title="' + COLOR_NAMES[c] + '"></button>';
    }).join('');
    return '<div class="frow" data-f="' + f.id + '">' +
      '<div class="fhead"><span class="ficon" data-icon="' + f.id + '"></span><div class="fname"><b>' + f.name + '</b><small class="fcol"></small></div>' +
      '<div class="qty"><button type="button" class="dec" aria-label="Retirer une ' + f.name.toLowerCase() + '">−</button><span class="q" aria-live="polite">0</span><button type="button" class="inc" aria-label="Ajouter une ' + f.name.toLowerCase() + '">+</button></div></div>' +
      '<div class="swatches" role="group" aria-label="Couleur ' + f.name.toLowerCase() + '">' + sw + '</div></div>';
  }).join('');
  fl.querySelectorAll('.frow').forEach(function (row) {
    var id = row.getAttribute('data-f');
    row.querySelector('.inc').addEventListener('click', function () { if (total() < 40) { st.qty[id]++; render(); } });
    row.querySelector('.dec').addEventListener('click', function () { st.qty[id] = Math.max(0, st.qty[id] - 1); render(); });
    row.querySelectorAll('.sw').forEach(function (b) {
      b.addEventListener('click', function () { st.col[id] = b.getAttribute('data-c'); if (!st.qty[id]) st.qty[id] = 1; render(); });
    });
  });

  function swGroup(elId, map, names, key) {
    var el = document.getElementById(elId);
    el.innerHTML = Object.keys(map).map(function (c) {
      return '<button type="button" class="chip" data-c="' + c + '"><span style="background:' + map[c] + '"></span>' + names[c] + '</button>';
    }).join('');
    el.querySelectorAll('.chip').forEach(function (b) { b.addEventListener('click', function () { st[key] = b.getAttribute('data-c'); render(); }); });
  }
  swGroup('paper-list', PAPERS, PAPER_NAMES, 'paper');
  swGroup('ribbon-list', RIBBONS, RIBBON_NAMES, 'ribbon');

  var ol = document.getElementById('option-list');
  ol.innerHTML = OPTIONS.map(function (o) {
    var p = PRICES.options[o.id];
    return '<label class="optc"><input type="checkbox" value="' + o.id + '"><span class="box"></span><span class="t"><b>' + o.name + '</b><small>' + o.desc + (p ? ' · +' + p + ' DH' : '') + '</small></span></label>';
  }).join('');
  ol.querySelectorAll('input').forEach(function (i) { i.addEventListener('change', function () { st.opts[i.value] = i.checked; render(); }); });
  ['f-carte', 'f-nom', 'f-name', 'f-phone', 'f-city', 'f-address', 'f-date'].forEach(function (id) {
    document.getElementById(id).addEventListener('input', render);
  });
  var dateEl = document.getElementById('f-date');
  var tmr = new Date(); tmr.setDate(tmr.getDate() + 2);
  dateEl.min = tmr.toISOString().slice(0, 10);

  function total() { return FLOWERS.reduce(function (n, f) { return n + st.qty[f.id]; }, 0); }
  function itemsMap() {
    var mp = {};
    FLOWERS.forEach(function (f) { if (st.qty[f.id]) mp[f.id] = [st.qty[f.id], st.col[f.id]]; });
    return mp;
  }

  // petites icônes de fleurs
  fl.querySelectorAll('.ficon').forEach(function (el) {
    var t = el.getAttribute('data-icon');
    el.innerHTML = '<svg viewBox="-30 -30 60 60" aria-hidden="true">' + flowerShape(t, COLORS[st.col[t]], 20) + '</svg>';
  });

  function render() {
    var n = total();
    fl.querySelectorAll('.frow').forEach(function (row) {
      var id = row.getAttribute('data-f');
      row.querySelector('.q').textContent = st.qty[id];
      row.classList.toggle('active', st.qty[id] > 0);
      row.querySelector('.fcol').textContent = COLOR_NAMES[st.col[id]];
      row.querySelector('.ficon').innerHTML = '<svg viewBox="-30 -30 60 60" aria-hidden="true">' + flowerShape(id, COLORS[st.col[id]], 20) + '</svg>';
      row.querySelectorAll('.sw').forEach(function (b) { var on = b.getAttribute('data-c') === st.col[id]; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    });
    document.querySelectorAll('#paper-list .chip').forEach(function (b) { var on = b.getAttribute('data-c') === st.paper; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    document.querySelectorAll('#ribbon-list .chip').forEach(function (b) { var on = b.getAttribute('data-c') === st.ribbon; b.classList.toggle('on', on); b.setAttribute('aria-pressed', on); });
    document.getElementById('carte-wrap').hidden = !st.opts.carte;
    document.getElementById('nom-wrap').hidden = !st.opts.nom;

    var nom = st.opts.nom ? document.getElementById('f-nom').value.trim() : '';
    document.getElementById('preview').innerHTML = n ? bouquetSVG(expand(itemsMap()), PAPERS[st.paper], RIBBONS[st.ribbon], { led: st.opts.led, papillons: st.opts.papillons, nom: nom }) :
      '<p class="empty">Ajoutez au moins une fleur pour voir votre bouquet.</p>';
    document.getElementById('count').textContent = n + (n > 1 ? ' fleurs' : ' fleur');
    document.getElementById('count-hint').textContent = n >= 40 ? 'Maximum en ligne : 40 fleurs. Pour plus, écrivez-nous.' : '';

    // prix
    var price = null;
    if (PRICES.flower) {
      price = n * PRICES.flower;
      OPTIONS.forEach(function (o) { if (st.opts[o.id]) price += PRICES.options[o.id] || 0; });
    }
    document.getElementById('price').textContent = price !== null ? price + ' DH' : 'Prix confirmé sur WhatsApp';

    // récap
    var lines = FLOWERS.filter(function (f) { return st.qty[f.id]; }).map(function (f) {
      return st.qty[f.id] + ' × ' + f.name + ' ' + COLOR_NAMES[st.col[f.id]].toLowerCase();
    });
    var opts = OPTIONS.filter(function (o) { return st.opts[o.id]; }).map(function (o) { return o.name; });
    document.getElementById('recap').innerHTML = (lines.length ? lines.map(function (l) { return '<li>' + l + '</li>'; }).join('') : '<li>Aucune fleur</li>') +
      '<li>Papier ' + PAPER_NAMES[st.paper].toLowerCase() + ', ruban ' + RIBBON_NAMES[st.ribbon].toLowerCase() + '</li>' +
      (opts.length ? '<li>' + opts.join(', ') + '</li>' : '');

    var name = val('f-name'), phone = val('f-phone'), city = val('f-city'), addr = val('f-address');
    var missing = [];
    if (!n) missing.push('au moins une fleur');
    if (!name) missing.push('votre nom');
    if (!phone) missing.push('votre téléphone');
    if (!city) missing.push('la ville');
    var ready = !missing.length;
    var btn = document.getElementById('send');
    btn.setAttribute('aria-disabled', ready ? 'false' : 'true');
    btn.classList.toggle('off', !ready);
    document.getElementById('hint').textContent = ready ? 'Tout est prêt ! Votre commande s\'ouvre dans WhatsApp.' : 'Il manque : ' + missing.join(', ') + '.';
    var msg = 'Bonjour Fleur Éternelle ! 💐 Je souhaite commander un bouquet personnalisé' + (st.model ? ' (base : « ' + st.model + ' »)' : '') + ' :\n' +
      lines.map(function (l) { return '🌸 ' + l; }).join('\n') +
      '\n🎀 Papier ' + PAPER_NAMES[st.paper].toLowerCase() + ', ruban ' + RIBBON_NAMES[st.ribbon].toLowerCase() +
      (opts.length ? '\n✨ Options : ' + opts.join(', ') : '') +
      (st.opts.nom && nom ? '\n🔤 Prénom : ' + nom : '') +
      (st.opts.carte && val('f-carte') ? '\n💌 Message de la carte : « ' + val('f-carte') + ' »' : '') +
      '\nTotal : ' + n + ' fleurs' + (price !== null ? ' · ' + price + ' DH' : '') +
      '\n\n👤 ' + name + '\n📞 ' + phone + '\n📦 Livraison : ' + city + (addr ? ', ' + addr : '') +
      (val('f-date') ? '\n📅 Souhaitée pour le ' + val('f-date').split('-').reverse().join('/') : '');
    btn.href = ready ? waLink(msg) : '#infos';
  }
  function val(id) { return document.getElementById(id).value.trim(); }
  document.getElementById('send').addEventListener('click', function (e) {
    if (this.getAttribute('aria-disabled') === 'true') {
      e.preventDefault();
      var target = total() ? document.getElementById(!val('f-name') ? 'f-name' : !val('f-phone') ? 'f-phone' : 'f-city') : fl;
      target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      if (target.focus) setTimeout(function () { target.focus({ preventScroll: true }); }, 400);
    }
  });
  document.getElementById('reset').addEventListener('click', function () {
    FLOWERS.forEach(function (f) { st.qty[f.id] = 0; st.col[f.id] = f.def; });
    st.model = null; document.getElementById('from-model').hidden = true; render();
  });
  render();
}

/* ===================== Galerie ===================== */
function initGallery() {
  var g = document.getElementById('gallery');
  if (!g) return;
  var box = document.getElementById('lightbox'), inner = box.querySelector('.lb-inner'), cap = box.querySelector('.lcap');
  function close() { box.classList.remove('open'); document.body.style.overflow = ''; }
  g.querySelectorAll('button').forEach(function (b) {
    b.addEventListener('click', function () {
      inner.innerHTML = b.querySelector('.gi').innerHTML;
      cap.textContent = b.getAttribute('aria-label');
      box.classList.add('open'); document.body.style.overflow = 'hidden';
      box.querySelector('.close').focus();
    });
  });
  box.querySelector('.close').addEventListener('click', close);
  box.addEventListener('click', function (e) { if (e.target === box) close(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
}
