// ── app.js ────────────────────────────────────────────────────────────────────
// Punto de entrada de la aplicación Vue.
// Ensambla los métodos de los distintos módulos y define el estado reactivo.
//
// Dependencias (cargadas antes via <script> en index.html):
//   theme.js        → _applyThemeVars, _applySyntaxVars, _cfg
//   templates.js    → APP_TEMPLATES  (plantillas XML)
//   plc-helpers.js  → plcHelpers     (alignDecls, alignFbCalls, highlightPLC)
//   xml-builders.js → xmlBuilders    (buildIOTagsXml, downloadXml*, …)
//   excel-helpers.js → excelHelpers  (toStrTrim, normalizeHeader, …)
//   generators.js   → generators     (generateAll, _buildIOTagsAndGVL, …)
// ─────────────────────────────────────────────────────────────────────────────

const { createApp } = Vue;

createApp({

  data() {
    const appCfg = ((window.APP_CONFIG || {}).app) || {};
    return {

      // ── Plantillas XML (desde templates.js) ──
      ...APP_TEMPLATES,

      // ── Estado UI ──
      isDarkMode:    true,
      screen:        'upload',
      fileError:     '',
      activeSection: 'io_tags',

      // ── Configuración (desde config.js) ──
      headerRowNumber:    appCfg.headerRowNumber    ?? 10,
      preferredSheetName: appCfg.preferredSheetName ?? 'IO-list',

      // ── Runtime ──
      usedSheetName: '',
      rows:          [],

      // ── Outputs: IO_Tags y GVL ──
      tags:         [],
      controlCount: 0,
      tagsText:     '',
      GVLtags:      '',

      // ── Outputs: Alarm_tags ──
      alarmDigitalText: '',
      alarmAnalogText:  '',
      alarmTagsText:    '',

      // ── Outputs: Alarms PRG (Declarations + Program) ──
      alarmsTwinCatDeclaration: '',
      alarmsTwinCatProgram:     '',

      // ── Outputs: Scaling ──
      variableScalingProgram: '',
      variableMappingProgram: '',

      // ── Outputs: .tmc ──
      tmcText:             '',
      tmcDigitalEventsText: '',
      tmcAnalogEventsText:  '',

      // ── IDs máximos (para el XML de Alarm_tags) ──
      maxID:  null,
      maxIDA: null,

      // ── Debug ──
      debug: '',
    };
  },

  computed: {
    alarmDigitalLinesCount() {
      return (this.alarmDigitalText || '').split('\n').filter(l => l.trim()).length;
    },
    alarmAnalogLinesCount() {
      return (this.alarmAnalogText || '').split('\n').filter(l => l.trim()).length;
    },
    styleModeImg() {
      return this.isDarkMode ? 'images/svg/moon-v1.svg' : 'images/svg/sun-v1.svg';
    },
  },

  methods: {

    // ── Módulos externos ─────────────────────────────────────────────────
    ...plcHelpers,
    ...xmlBuilders,
    ...excelHelpers,
    ...generators,

    // ════════════════════════════════════════════════════════
    // UI
    // ════════════════════════════════════════════════════════

    // Alterna entre tema oscuro y claro, aplicando las variables CSS.
    toggleTheme() {
      this.isDarkMode = !this.isDarkMode;
      const t = this.isDarkMode ? (_cfg.theme      || {}) : (_cfg.themeLight || {});
      const s = this.isDarkMode ? (_cfg.syntax     || {}) : (_cfg.syntaxLight || {});
      _applyThemeVars(t);
      _applySyntaxVars(s);
    },

    // Carga el fichero Excel seleccionado, parsea las filas y lanza generateAll.
    onFile(e) {
      const file = e.target.files && e.target.files[0];
      if (!file) return;

      const allowed = /\.(xlsx|xls|xlsm)$/i;
      if (!allowed.test(file.name)) {
        this.fileError = `Archivo no válido: "${file.name}". Solo se aceptan archivos .xlsx, .xls o .xlsm.`;
        e.target.value = '';
        return;
      }
      this.fileError = '';

      const reader = new FileReader();
      reader.onload = (evt) => {
        try {
          const data = new Uint8Array(evt.target.result);
          const wb   = XLSX.read(data, { type: 'array' });

          const sheetName = wb.SheetNames.includes(this.preferredSheetName)
            ? this.preferredSheetName
            : wb.SheetNames[0];

          this.usedSheetName = sheetName;

          const ws   = wb.Sheets[sheetName];
          this.rows  = XLSX.utils.sheet_to_json(ws, { header: 1, blankrows: true, defval: '' });

          this.generateAll();
          this.screen = 'app';
        } catch (err) {
          this.fileError = `Error al leer el archivo: ${err && err.message ? err.message : String(err)}`;
        }
      };

      reader.readAsArrayBuffer(file);
    },

    // Copia texto al portapapeles con fallback para navegadores sin API moderna.
    async copyText(text, label = '') {
      const value = (text ?? '').toString();
      if (!value.trim()) {
        this.debug = `Nothing to copy${label ? ` (${label})` : ''}.`;
        return;
      }

      try {
        if (navigator.clipboard && navigator.clipboard.writeText) {
          await navigator.clipboard.writeText(value);
          this.debug = `✅ Copied${label ? ` (${label})` : ''}.`;
          return;
        }
      } catch (err) {
        // fall through to fallback
      }

      try {
        const ta = document.createElement('textarea');
        ta.value = value;
        ta.setAttribute('readonly', '');
        ta.style.position = 'fixed';
        ta.style.left     = '-9999px';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        ta.setSelectionRange(0, ta.value.length);
        document.execCommand('copy');
        document.body.removeChild(ta);
        this.debug = `✅ Copied${label ? ` (${label})` : ''} (fallback).`;
      } catch (err) {
        this.debug = `❌ Copy failed: ${err && err.message ? err.message : String(err)}`;
      }
    },

  },

}).directive('autoresize', {
  mounted(el) {
    el.style.overflow = 'hidden';
    el.style.height   = 'auto';
    el.style.height   = el.scrollHeight + 'px';
  },
  updated(el) {
    el.style.overflow = 'hidden';
    el.style.height   = 'auto';
    el.style.height   = el.scrollHeight + 'px';
  }
}).mount('#app');
