// ── theme.js ──────────────────────────────────────────────────────────────────
// Aplica las variables CSS del tema y la sintaxis definidas en config.js.
// Debe cargarse DESPUÉS de config.js y ANTES de app.js.
// El IIFE al final aplica el tema inicial en cuanto se carga la página.
// ─────────────────────────────────────────────────────────────────────────────

const _cfg = window.APP_CONFIG || {};

// Aplica los colores del tema (fondo, textos, bordes, barco…) como CSS variables.
function _applyThemeVars(t) {
  const root = document.documentElement;
  const set  = (v, val) => { if (val != null) root.style.setProperty(v, String(val)); };
  set('--upload-card-bg',  t.uploadCardBg);
  set('--bg-main',         t.bgMain);
  set('--bg-sidebar',      t.bgSidebar);
  set('--bg-editor',       t.bgEditor);
  set('--bg-gutter',       t.bgGutter);
  set('--bg-window-bar',   t.bgWindowBar);
  set('--bg-panel',        t.bgPanel);
  set('--border-color',    t.borderColor);
  set('--border-dark',     t.borderDark);
  set('--text-main',       t.textMain);
  set('--text-code',       t.textCode);
  set('--text-muted',      t.textMuted);
  set('--line-numbers',    t.lineNumbers);
  set('--accent',          t.accent);
  set('--upload-btn',      t.uploadBtn);
  set('--upload-btn-text', t.uploadBtnText);
  set('--upload-wave-1',   t.uploadWave1);
  set('--upload-wave-2',   t.uploadWave2);
  set('--yacht-sail-1',    t.yachtSail1);
  set('--yacht-sail-2',    t.yachtSail2);
  set('--yacht-mast',      t.yachtMast);
  set('--yacht-hull-top',  t.yachtHullTop);
  set('--yacht-waterline', t.yachtWaterline);
  set('--yacht-hull-bot',  t.yachtHullBot);
}

// Aplica los colores del resaltado de sintaxis PLC como CSS variables.
function _applySyntaxVars(s) {
  const root = document.documentElement;
  const set  = (v, val) => { if (val != null) root.style.setProperty(v, String(val)); };
  set('--plc-kw',      s.keyword);
  set('--plc-type',    s.type);
  set('--plc-comment', s.comment);
  set('--plc-string',  s.string);
  set('--plc-number',  s.number);
  set('--plc-hwaddr',  s.hwAddress);
  set('--plc-attr',    s.attribute);
  set('--plc-xmltag',  s.xmlTag);
}

// Aplica el tema inicial (oscuro) y los ajustes del editor al cargar la página.
(function () {
  const root = document.documentElement;
  const set  = (v, val) => { if (val != null) root.style.setProperty(v, String(val)); };

  _applySyntaxVars(_cfg.syntax || {});
  _applyThemeVars(_cfg.theme  || {});

  const e = _cfg.editor || {};
  if (e.fontFamily) set('--editor-font-family', e.fontFamily);
  if (e.fontSize)   set('--editor-font-size',   e.fontSize + 'px');
  if (e.lineHeight) set('--editor-line-height',  String(e.lineHeight));
  if (e.tabSize)    set('--editor-tab-size',     String(e.tabSize));
})();
