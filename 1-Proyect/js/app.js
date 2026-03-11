const { createApp } = Vue;

// ── Apply config.js to CSS variables ────────────────────────────────────────
const _cfg = window.APP_CONFIG || {};

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

(function () {
  const root = document.documentElement;
  const set  = (v, val) => { if (val != null) root.style.setProperty(v, String(val)); };

  _applySyntaxVars(_cfg.syntax || {});
  _applyThemeVars(_cfg.theme || {});

  const e = _cfg.editor || {};
  if (e.fontFamily) set('--editor-font-family', e.fontFamily);
  if (e.fontSize)   set('--editor-font-size',   e.fontSize + 'px');
  if (e.lineHeight) set('--editor-line-height',  String(e.lineHeight));
  if (e.tabSize)    set('--editor-tab-size',     String(e.tabSize));
})();
// ────────────────────────────────────────────────────────────────────────────

    createApp({
      data() {
        const appCfg = ((window.APP_CONFIG || {}).app) || {};
		return {
          // Theme
          isDarkMode: true,

          // Screen
          screen: 'upload',
          fileError: '',
          activeSection: 'io_tags',

          // Settings (from config.js or defaults)
          headerRowNumber: appCfg.headerRowNumber ?? 10,
          preferredSheetName: appCfg.preferredSheetName ?? 'IO-list',

          // Runtime
          usedSheetName: '',
          rows: [],

		  // NEW: máximos para el XML de Alarm_tags
		  maxID: null,
		  maxIDA: null,

          // Outputs
          tags: [],
          tagsText: '',
		  GVLtags: '',
          alarmDigitalText: '',
          alarmAnalogText: '',
          alarmTagsText: '',
          alarmsTwinCatDeclaration: '',
          alarmsTwinCatProgram: '',
		  variableScalingProgram: '',
		  variableMappingProgram: '',
          debug: '',

		  // For Alarms.tmc
		  tmcText: '',
		tmcDigitalEventsText: '',
		tmcAnalogEventsText: '',

		  tplTmcHeader:
		  `<?xml version="1.0"?>\n` +
		  `<TcModuleClass>\n` +
		  `\t<DataTypes>\n` +
		  `\t\t<DataType>\n` +
		  `\t\t\t<Name GUID="{F35E4D12-5B8B-4C8F-95D2-0AE92108A152}">AlarmClass</Name>\n` +
		  `\t\t\t<DisplayName TxtId=""><![CDATA[Alarms]]></DisplayName>`,

		  tplTmcFooter:
		  `\t\t\t<Hides>\n` +
		  `\t\t\t\t<Hide GUID="{E7B8BF09-DA2F-43D9-8251-4C214D77CFBB}"/>\n` +
		  `\t\t\t\t<Hide GUID="{CBF90603-C429-49C1-92C4-454EBD10F716}"/>\n` +
		  `\t\t\t\t<Hide GUID="{42EEBECA-5185-42BE-8389-5A7DA26A926F}"/>\n` +
		  `\t\t\t\t<Hide GUID="{21017743-398E-4446-8129-0925ADC15AD9}"/>\n` +
		  `\t\t\t\t<Hide GUID="{390EA75C-CC63-4FC5-9B03-1A06C29A2A30}"/>\n` +
		  `\t\t\t\t<Hide GUID="{551E4D89-E3A8-4642-B7A6-77482930F8C8}"/>\n` +
		  `\t\t\t\t<Hide GUID="{CA4CA1EF-B7E4-43CB-8D79-D140B03E196E}"/>\n` +
		  `\t\t\t\t<Hide GUID="{BD7EAD56-F85A-434F-BC76-EA84C4194656}"/>\n` +
		  `\t\t\t\t<Hide GUID="{5BE57882-1887-4DC6-A745-62AE0883584B}"/>\n` +
		  `\t\t\t\t<Hide GUID="{8BBF7EC2-E5D4-44E6-B5BF-C7CDA821DCCC}"/>\n` +
		  `\t\t\t\t<Hide GUID="{B6CAB811-BEF3-4E23-B0B4-9381B807F4C7}"/>\n` +
		  `\t\t\t\t<Hide GUID="{43FFCBA6-5F44-43ED-9771-FB96E54B41CD}"/>\n` +
		  `\t\t\t\t<Hide GUID="{AF1B25DF-6DE6-4A41-8105-FABBE55412B5}"/>\n` +
		  `\t\t\t\t<Hide GUID="{DC81660B-BCFD-45D8-932F-18A29A2DB34C}"/>\n` +
		  `\t\t\t\t<Hide GUID="{B2B6336A-1BAA-4CC3-960F-F398DB7EAD14}"/>\n` +
		  `\t\t\t\t<Hide GUID="{AC3C0553-739E-43F7-B723-0B5692D67F4F}"/>\n` +
		  `\t\t\t\t<Hide GUID="{3A5B0D97-C9A0-4EFE-90D0-92D148DF41AD}"/>\n` +
		  `\t\t\t\t<Hide GUID="{4A6C504E-0A05-4046-BF0B-BCBC5903E5D3}"/>\n` +
		  `\t\t\t\t<Hide GUID="{0E8410E7-FFF7-4B2F-8DFE-3C501CCD38E6}"/>\n` +
		  `\t\t\t\t<Hide GUID="{A23DB3C7-DA7F-48C6-B9B8-188165D24202}"/>\n` +
		  `\t\t\t\t<Hide GUID="{1C918F25-D9E1-47DC-99F5-41179C9E0E7A}"/>\n` +
		  `\t\t\t\t<Hide GUID="{4E02245A-FA0B-4E1A-8E68-C5DAD38BD585}"/>\n` +
		  `\t\t\t\t<Hide GUID="{92789ACA-75D3-4964-B159-1F23A113C540}"/>\n` +
		  `\t\t\t\t<Hide GUID="{F324088C-1E2B-436A-ABBB-168FC6F6D393}"/>\n` +
		  `\t\t\t\t<Hide GUID="{F77806D3-4A13-4580-80D7-8D9C364E1BD1}"/>\n` +
		  `\t\t\t</Hides>\n` +
		  `\t\t</DataType>\n` +
		  `\t</DataTypes>\n` +
		  `</TcModuleClass>`,

		  tplXmlIOTags: `<?xml version="1.0" encoding="utf-8"?>
		  <project xmlns="http://www.plcopen.org/xml/tc6_0200">
		  <fileHeader companyName="Beckhoff Automation GmbH" productName="TwinCAT PLC Control" productVersion="3.5.20.60" creationDateTime="2026-02-19T13:40:53.8672332" />
		  <contentHeader name="Untitled1" modificationDateTime="2026-02-19T13:40:53.8717493">
			<coordinateInfo>
			  <fbd>
				<scaling x="1" y="1" />
			  </fbd>
			  <ld>
				<scaling x="1" y="1" />
			  </ld>
			  <sfc>
				<scaling x="1" y="1" />
			  </sfc>
			</coordinateInfo>
			<addData>
			  <data name="http://www.3s-software.com/plcopenxml/projectinformation" handleUnknown="implementation">
				<ProjectInformation />
			  </data>
			</addData>
		  </contentHeader>
		  <types>
			<dataTypes />
			<pous />
		  </types>
		  <instances>
			<configurations />
		  </instances>
		  <addData>
			<data name="http://www.3s-software.com/plcopenxml/globalvars" handleUnknown="implementation">
			  <globalVars name="IO_Tags">
				<addData>
				  <data name="http://www.3s-software.com/plcopenxml/attributes" handleUnknown="implementation">
					<Attributes>
					  <Attribute Name="global_init_slot" Value="40500" />
					</Attributes>
				  </data>
				  <data name="http://www.3s-software.com/plcopenxml/buildproperties" handleUnknown="implementation">
					<BuildProperties>
					  <LinkAlways>true</LinkAlways>
					</BuildProperties>
				  </data>
				  <data name="http://www.3s-software.com/plcopenxml/interfaceasplaintext" handleUnknown="implementation">
					<InterfaceAsPlainText>
					  <xhtml xmlns="http://www.w3.org/1999/xhtml">{attribute 'global_init_slot' := '40500'}
VAR_GLOBAL
// Insert code here
END_VAR</xhtml>
					</InterfaceAsPlainText>
				  </data>
				  <data name="http://www.3s-software.com/plcopenxml/objectid" handleUnknown="discard">
					<ObjectId>b57b3cc8-481e-47d2-932e-c1d070231dc5</ObjectId>
				  </data>
				</addData>
			  </globalVars>
			</data>
			<data name="http://www.3s-software.com/plcopenxml/projectstructure" handleUnknown="discard">
			  <ProjectStructure>
				<Object Name="IO_Tags" ObjectId="b57b3cc8-481e-47d2-932e-c1d070231dc5" />
			  </ProjectStructure>
			</data>
		  </addData>
		</project>`,

		  	tplXmlAlarmTags: `<?xml version="1.0" encoding="utf-8"?>
			<project xmlns="http://www.plcopen.org/xml/tc6_0200">
			  <fileHeader companyName="Beckhoff Automation GmbH" productName="TwinCAT PLC Control" productVersion="3.5.20.60" creationDateTime="2026-02-19T13:41:07.4111748" />
			  <contentHeader name="Untitled1" modificationDateTime="2026-02-19T13:41:07.4111748">
				<coordinateInfo>
				  <fbd>
					<scaling x="1" y="1" />
				  </fbd>
				  <ld>
					<scaling x="1" y="1" />
				  </ld>
				  <sfc>
					<scaling x="1" y="1" />
				  </sfc>
				</coordinateInfo>
				<addData>
				  <data name="http://www.3s-software.com/plcopenxml/projectinformation" handleUnknown="implementation">
					<ProjectInformation />
				  </data>
				</addData>
			  </contentHeader>
			  <types>
				<dataTypes />
				<pous />
			  </types>
			  <instances>
				<configurations />
			  </instances>
			  <addData>
				<data name="http://www.3s-software.com/plcopenxml/globalvars" handleUnknown="implementation">
				  <globalVars name="Alarm_tags" constant="true">
					<variable name="ArrMinD">
					  <type>
						<INT />
					  </type>
					  <initialValue>
						<simpleValue value="1" />
					  </initialValue>
					  <documentation>
						<xhtml xmlns="http://www.w3.org/1999/xhtml"> Digital alarm array size</xhtml>
					  </documentation>
					</variable>
					<variable name="ArrMaxD">
					  <type>
						<INT />
					  </type>
					  <initialValue>
						<simpleValue value="!!!'ERROR'!!!" />
					  </initialValue>
					</variable>
					<variable name="ArrMinA">
					  <type>
						<INT />
					  </type>
					  <initialValue>
						<simpleValue value="1" />
					  </initialValue>
					  <documentation>
						<xhtml xmlns="http://www.w3.org/1999/xhtml"> Analog alarm array size</xhtml>
					  </documentation>
					</variable>
					<variable name="ArrMaxA">
					  <type>
						<INT />
					  </type>
					  <initialValue>
						<simpleValue value="!!!'ERROR'!!!" />
					  </initialValue>
					</variable>
					<variable name="Arr_AlarmDigital">
					  <type>
						<array>
						  <dimension lower="ArrMinD" upper="ArrMaxD" />
						  <baseType>
							<derived name="ST_ALARM_DI" />
						  </baseType>
						</array>
					  </type>
					  <documentation>
						<xhtml xmlns="http://www.w3.org/1999/xhtml"> Array needs to be at least as big as the highest digital struct ID</xhtml>
					  </documentation>
					</variable>
					<variable name="Arr_AlarmAnalog">
					  <type>
						<array>
						  <dimension lower="ArrMinA" upper="ArrMaxA" />
						  <baseType>
							<derived name="ST_ALARM_AI" />
						  </baseType>
						</array>
					  </type>
					  <documentation>
						<xhtml xmlns="http://www.w3.org/1999/xhtml"> Array needs to be at least as big as the highest analog struct ID</xhtml>
					  </documentation>
					</variable>
					<addData>
					  <data name="http://www.3s-software.com/plcopenxml/attributes" handleUnknown="implementation">
						<Attributes>
						  <Attribute Name="global_init_slot" Value="40502" />
						</Attributes>
					  </data>
					  <data name="http://www.3s-software.com/plcopenxml/buildproperties" handleUnknown="implementation">
						<BuildProperties>
						  <LinkAlways>true</LinkAlways>
						</BuildProperties>
					  </data>
					  <data name="http://www.3s-software.com/plcopenxml/interfaceasplaintext" handleUnknown="implementation">
						<InterfaceAsPlainText>
						  <xhtml xmlns="http://www.w3.org/1999/xhtml">{attribute 'global_init_slot' := '40502'}
VAR_GLOBAL CONSTANT
	// Digital alarm array size
	ArrMinD: INT := 1;
	ArrMaxD: INT := __MAX_ID__;
	// Analog alarm array size
	ArrMinA: INT := 1;
	ArrMaxA: INT := __MAX_IDA__;
END_VAR

VAR_GLOBAL
	// Array needs to be at least as big as the highest digital struct ID
	Arr_AlarmDigital: ARRAY[ArrMinD..ArrMaxD] OF ST_ALARM_DI;
	// Array needs to be at least as big as the highest analog struct ID
	Arr_AlarmAnalog: ARRAY[ArrMinA..ArrMaxA] OF ST_ALARM_AI;
END_VAR

VAR_GLOBAL PERSISTENT
	// Insert code here
END_VAR</xhtml>
						</InterfaceAsPlainText>
					  </data>
					  <data name="http://www.3s-software.com/plcopenxml/objectid" handleUnknown="discard">
						<ObjectId>c33b50e5-b5f9-493f-a74a-119256a28240</ObjectId>
					  </data>
					  <data name="http://www.3s-software.com/plcopenxml/mixedattrsvarlist" handleUnknown="implementation">
						<MixedAttrsVarList>
						  <globalVars name="Alarm_tags" constant="true">
							<variable name="ArrMinD">
							  <type>
								<INT />
							  </type>
							  <initialValue>
								<simpleValue value="1" />
							  </initialValue>
							  <documentation>
								<xhtml xmlns="http://www.w3.org/1999/xhtml"> Digital alarm array size</xhtml>
							  </documentation>
							</variable>
							<variable name="ArrMaxD">
							  <type>
								<INT />
							  </type>
							  <initialValue>
								<simpleValue value="!!!'ERROR'!!!" />
							  </initialValue>
							</variable>
							<variable name="ArrMinA">
							  <type>
								<INT />
							  </type>
							  <initialValue>
								<simpleValue value="1" />
							  </initialValue>
							  <documentation>
								<xhtml xmlns="http://www.w3.org/1999/xhtml"> Analog alarm array size</xhtml>
							  </documentation>
							</variable>
							<variable name="ArrMaxA">
							  <type>
								<INT />
							  </type>
							  <initialValue>
								<simpleValue value="!!!'ERROR'!!!" />
							  </initialValue>
							</variable>
						  </globalVars>
						  <globalVars name="Alarm_tags">
							<variable name="Arr_AlarmDigital">
							  <type>
								<array>
								  <dimension lower="ArrMinD" upper="ArrMaxD" />
								  <baseType>
									<derived name="ST_ALARM_DI" />
								  </baseType>
								</array>
							  </type>
							  <documentation>
								<xhtml xmlns="http://www.w3.org/1999/xhtml"> Array needs to be at least as big as the highest digital struct ID</xhtml>
							  </documentation>
							</variable>
							<variable name="Arr_AlarmAnalog">
							  <type>
								<array>
								  <dimension lower="ArrMinA" upper="ArrMaxA" />
								  <baseType>
									<derived name="ST_ALARM_AI" />
								  </baseType>
								</array>
							  </type>
							  <documentation>
								<xhtml xmlns="http://www.w3.org/1999/xhtml"> Array needs to be at least as big as the highest analog struct ID</xhtml>
							  </documentation>
							</variable>
						  </globalVars>
						</MixedAttrsVarList>
					  </data>
					</addData>
				  </globalVars>
				</data>
				<data name="http://www.3s-software.com/plcopenxml/projectstructure" handleUnknown="discard">
				  <ProjectStructure>
					<Object Name="Alarm_tags" ObjectId="c33b50e5-b5f9-493f-a74a-119256a28240" />
				  </ProjectStructure>
				</data>
			  </addData>
		  </project>`
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
        toggleTheme() {
          this.isDarkMode = !this.isDarkMode;
          const t = this.isDarkMode
            ? (_cfg.theme      || {})
            : (_cfg.themeLight || {});
          const s = this.isDarkMode
            ? (_cfg.syntax      || {})
            : (_cfg.syntaxLight || {});
          _applyThemeVars(t);
          _applySyntaxVars(s);
        },

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
              const wb = XLSX.read(data, { type: 'array' });

              const sheetName = wb.SheetNames.includes(this.preferredSheetName)
                ? this.preferredSheetName
                : wb.SheetNames[0];

              this.usedSheetName = sheetName;

              const ws = wb.Sheets[sheetName];
              this.rows = XLSX.utils.sheet_to_json(ws, {
			    header: 1,
			    blankrows: true,
			    defval: ''
			  });

              this.generateAll();
              this.screen = 'app';
            } catch (err) {
              this.fileError = `Error al leer el archivo: ${err && err.message ? err.message : String(err)}`;
            }
          };

          reader.readAsArrayBuffer(file);
        },

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
            // fall through
          }

          try {
            const ta = document.createElement('textarea');
            ta.value = value;
            ta.setAttribute('readonly', '');
            ta.style.position = 'fixed';
            ta.style.left = '-9999px';
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

		// Add description
		xmlEscape(s) {
		  return String(s ?? '')
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;');
		},

		downloadXmlIO() {
			const xml = this.buildIOTagsXml(this.tplXmlIOTags, this.tagsText);
			this.downloadTextFile(xml, 'IO_Tags.xml');
		},

		downloadXmlGVL() {
		  const xml = this.buildIOTagsXml(this.tplXmlGVL, this.GVLtags);
		  this.downloadTextFile(xml, 'GVL.xml');
		},

		downloadXmlAlarm() {
		  const persistentST = [this.alarmDigitalText, this.alarmAnalogText]
			.filter(Boolean)
			.join('\n')
			.trimEnd();

		  const xml = this.buildAlarmTagsXml(
			this.tplXmlAlarmTags,
			persistentST,
			this.maxID,
			this.maxIDA
		  );
			this.downloadTextFile(xml, 'Alarm_tags.xml');
		},


		buildIOTagsXml(templateXml, ioTagsStText) {
  return (templateXml ?? '').replace(
    '// Insert code here',
    this.xmlEscape((ioTagsStText ?? '').trimEnd())
  );
},

buildAlarmTagsXml(templateXml, persistentST, maxID, maxIDA) {
  let xml = String(templateXml ?? '');

  // Rellenar los __MAX_ID*__ del texto plano
  xml = xml.replace(/ArrMaxD\s*:\s*INT\s*:=\s*__MAX_ID__\s*;/g,  `ArrMaxD: INT := ${maxID};`);
  xml = xml.replace(/ArrMaxA\s*:\s*INT\s*:=\s*__MAX_IDA__\s*;/g, `ArrMaxA: INT := ${maxIDA};`);

  // Insertar ST en el marcador
  xml = xml.replace(
    '// Insert code here',
    this.xmlEscape((persistentST ?? '').trimEnd())
  );

  return xml;
},

		downloadTmc() {
		  const tmc = this.buildTmc(
			this.tplTmcHeader,
			this.tplTmcFooter,
			this.tmcDigitalEventsText,
			this.tmcAnalogEventsText
		  );

		  this.downloadTextFile(tmc, 'Alarms.tmc', 'application/xml');
		},

		buildTmc(tplHeader, tplFooter, digitalEventsText, analogEventsText) {
		  const digital = (digitalEventsText ?? '').trimEnd();
		  const analog  = (analogEventsText ?? '').trimEnd();

		  const middle =
			[digital, analog]
			  .filter(Boolean)
			  .join('\n');

		  return String(tplHeader ?? '') + middle + '\n' + String(tplFooter ?? '');
		},

		downloadTextFile(content, filename, mime='application/xml') {
		  const blob = new Blob([content], { type: mime });
		  const url = URL.createObjectURL(blob);
		  const a = document.createElement('a');
		  a.href = url;
		  a.download = filename;
		  a.click();
		  URL.revokeObjectURL(url);
		},

        // Column-align an array of PLC declaration lines.
        // Handles two formats:
        //   IO_Tags : "name AT %addr : TYPE; // comment"
        //   Simple  : "name: TYPE; // comment"  (GVL, FB instances, etc.)
        // Lines that don't match either pattern pass through unchanged.
        alignDecls(lines) {
          if (!lines || !lines.length) return lines;

          const parsed = lines.map(line => {
            // IO_Tags pattern
            const ioM = line.match(/^(\s*)([A-Za-z_]\w*)\s+(AT\s+\S+)\s*:\s*([A-Za-z_]\w+)\s*;(.*)$/i);
            if (ioM) return { fmt: 'io', indent: ioM[1] || '\t',
              name: ioM[2], at: ioM[3], type: ioM[4], rest: ioM[5].trim() };

            // Simple declaration: name: TYPE;  (no := init, no extra colon)
            const simM = line.match(/^(\s*)([A-Za-z_]\w*)\s*:\s*([A-Za-z_]\w+)\s*;(.*)$/);
            if (simM) return { fmt: 'sim', indent: simM[1] || '\t',
              name: simM[2], type: simM[3], rest: simM[4].trim() };

            return { fmt: 'raw', original: line };
          });

          const ios  = parsed.filter(p => p.fmt === 'io');
          const sims = parsed.filter(p => p.fmt === 'sim');

          if (ios.length) {
            const mxName = Math.max(...ios.map(p => p.name.length));
            const mxAt   = Math.max(...ios.map(p => p.at.length));
            const mxType = Math.max(...ios.map(p => p.type.length));
            return parsed.map(p => {
              if (p.fmt === 'raw') return p.original;
              const cmt = p.rest ? `  ${p.rest}` : '';
              if (p.fmt === 'io')
                return `${p.indent}${p.name.padEnd(mxName)}  ${p.at.padEnd(mxAt)}  : ${p.type.padEnd(mxType)};${cmt}`;
              return `${p.indent}${p.name}  : ${p.type};${cmt}`;
            });
          }

          if (sims.length) {
            const mxName = Math.max(...sims.map(p => p.name.length));
            const mxType = Math.max(...sims.map(p => p.type.length));
            return parsed.map(p => {
              if (p.fmt === 'raw') return p.original;
              const cmt = p.rest ? `  ${p.rest}` : '';
              return `${p.indent}${p.name.padEnd(mxName)}  : ${p.type.padEnd(mxType)};${cmt}`;
            });
          }

          return lines;
        },

        highlightPLC(raw) {
          if (!raw) return '';

          const KEYWORDS = new Set([
            'VAR','VAR_GLOBAL','VAR_INPUT','VAR_OUTPUT','VAR_IN_OUT','VAR_TEMP','VAR_STAT',
            'END_VAR','PROGRAM','FUNCTION','FUNCTION_BLOCK','END_PROGRAM','END_FUNCTION',
            'END_FUNCTION_BLOCK','METHOD','END_METHOD','PROPERTY','END_PROPERTY',
            'IF','THEN','ELSE','ELSIF','END_IF','FOR','TO','BY','DO','END_FOR',
            'WHILE','END_WHILE','REPEAT','UNTIL','END_REPEAT','CASE','OF','END_CASE',
            'RETURN','EXIT','NOT','AND','OR','XOR','MOD','TRUE','FALSE',
            'AT','RETAIN','PERSISTENT','CONSTANT','TYPE','END_TYPE',
            'STRUCT','END_STRUCT','UNION','END_UNION','ARRAY','POINTER','REF_TO',
            'INTERFACE','END_INTERFACE','EXTENDS','IMPLEMENTS',
            'PUBLIC','PRIVATE','PROTECTED','INTERNAL','ABSTRACT','FINAL',
            'THIS','SUPER','NEW','DELETE'
          ]);

          const TYPES = new Set([
            'BOOL','BYTE','WORD','DWORD','LWORD',
            'SINT','USINT','INT','UINT','DINT','UDINT','LINT','ULINT',
            'REAL','LREAL','TIME','DATE','DT','TOD','STRING','WSTRING',
            'ANY','ANY_INT','ANY_REAL','ANY_NUM','ANY_BIT','ANY_DATE',
            'ANY_ELEMENTARY','ANY_DERIVED','PVOID','XINT','UXINT'
          ]);

          let out = '';
          let i = 0;
          const len = raw.length;

          const esc = s => s
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

          const span = (cls, text) => `<span class="${cls}">${esc(text)}</span>`;

          while (i < len) {
            const ch = raw[i];
            const ch2 = raw[i + 1] || '';

            // Block comment (* ... *)
            if (ch === '(' && ch2 === '*') {
              const end = raw.indexOf('*)', i + 2);
              const chunk = end === -1 ? raw.slice(i) : raw.slice(i, end + 2);
              out += span('plc-comment', chunk);
              i += chunk.length;
              continue;
            }

            // Line comment //
            if (ch === '/' && ch2 === '/') {
              const end = raw.indexOf('\n', i);
              const chunk = end === -1 ? raw.slice(i) : raw.slice(i, end);
              out += span('plc-comment', chunk);
              i += chunk.length;
              continue;
            }

            // Single-quoted string 'x'
            if (ch === "'") {
              let j = i + 1;
              while (j < len && raw[j] !== "'" && raw[j] !== '\n') j++;
              if (raw[j] === "'") j++;
              out += span('plc-string', raw.slice(i, j));
              i = j;
              continue;
            }

            // XML tag  <Tag ...>  (only if < is followed by letter / ? ! /)
            if (ch === '<' && /[a-zA-Z?!/]/.test(ch2)) {
              const end = raw.indexOf('>', i);
              if (end !== -1) {
                out += span('plc-xmltag', raw.slice(i, end + 1));
                i = end + 1;
                continue;
              }
            }

            // Hardware address  %IX0.0  %QX0.0  %MW1
            if (ch === '%') {
              let j = i + 1;
              while (j < len && /[\w.]/.test(raw[j])) j++;
              out += span('plc-hwaddr', raw.slice(i, j));
              i = j;
              continue;
            }

            // Pragma / attribute  {attribute 'x'}
            if (ch === '{') {
              const end = raw.indexOf('}', i);
              const chunk = end === -1 ? raw.slice(i) : raw.slice(i, end + 1);
              out += span('plc-attr', chunk);
              i += chunk.length;
              continue;
            }

            // Number  (digit at word boundary)
            if (/[0-9]/.test(ch) && (i === 0 || /\W/.test(raw[i - 1]))) {
              let j = i;
              while (j < len && /[0-9_.#EeXx]/.test(raw[j])) j++;
              out += span('plc-number', raw.slice(i, j));
              i = j;
              continue;
            }

            // Identifier → keyword / type / variable
            if (/[A-Za-z_]/.test(ch)) {
              let j = i;
              while (j < len && /[\w]/.test(raw[j])) j++;
              const word = raw.slice(i, j);
              const upper = word.toUpperCase();
              if (KEYWORDS.has(upper))     out += span('plc-kw', word);
              else if (TYPES.has(upper))   out += span('plc-type', word);
              else                         out += esc(word);
              i = j;
              continue;
            }

            // Everything else
            out += esc(ch);
            i++;
          }

          // Wrap each line so CSS can render line numbers via counter
          return out.split('\n')
            .map(l => `<span class="line">${l}</span>`)
            .join('');
        },

        generateAll() {
          // Helpers
          const toStrTrim = (v) => (v === null || v === undefined) ? '' : String(v).trim();

          const normalizeHeader = (s) =>
            toStrTrim(s)
              .toLowerCase()
              .replace(/\s+/g, ' ')
              .replace(/[^\w ]/g, '');

          const isAlarmMark = (v) => toStrTrim(v).toLowerCase() === 'x';

		const enToConfig = (v, defaultConfig) => {
		  const s = toStrTrim(v).toLowerCase();
		  if (!s) return '0';
		  if (s === 'x' || s === '1' || s === 'true') return defaultConfig; // enabled -> use AlarmConfig
		  // if the cell contains a number, use it directly as AlarmConfig for that threshold
		  const n = Number(s);
		  if (!Number.isNaN(n) && Number.isFinite(n)) return String(n);
		  return defaultConfig; // fallback
		  };

          const fmtNumberOrRaw = (v, fallback = '0') => {
            const s = toStrTrim(v);
            if (!s) return fallback;
            const n = Number(s);
            if (!Number.isNaN(n) && Number.isFinite(n)) return String(n);
            return s;
          };

          const toIdentifier = (s) => toStrTrim(s).replace(/[^\w]/g, '_');

          const pickSheetHeaderRowIndex = () => {
            const fixedIdx = Math.max(0, this.headerRowNumber - 1);
            const fixedRow = this.rows[fixedIdx] || [];
            const fixedNorm = fixedRow.map(normalizeHeader);

            if (fixedNorm.includes('name')) return fixedIdx;

            const maxScan = Math.min(this.rows.length, 50);
            for (let i = 0; i < maxScan; i++) {
              const r = this.rows[i] || [];
              const n = r.map(normalizeHeader);
              if (n.includes('name') && n.includes('alarm')) return i;
              if (n.includes('name')) return i;
            }
            return -1;
          };

          // Locate header row
          const headerRowIndex = pickSheetHeaderRowIndex();
          if (headerRowIndex === -1) {
            this.tags = [];
            this.tagsText = '';
            this.alarmDigitalText = '';
            this.alarmAnalogText = '';
            this.alarmTagsText = '';
            this.alarmsTwinCatDeclaration = '';
            this.alarmsTwinCatProgram = '';
            this.debug = `Header row not found. Expected row ${this.headerRowNumber} or a row containing NAME/Alarm.`;
            return;
          }

          const headerRaw = this.rows[headerRowIndex] || [];
          const headerNorm = headerRaw.map(normalizeHeader);
          const startDataIndex = headerRowIndex + 1;

          const col = {};
          headerNorm.forEach((h, i) => { if (h) col[h] = i; });

          // Required
          const dataRows = this.rows.slice(startDataIndex);
          const idxNAME = col['name'];
          const idxAlarm = col['alarm'];
		  const idxTYPE = col['type'];
		  const idxHMI = col['hmi'];

          if (idxNAME === undefined) {
            this.debug = `"NAME" column not found on header row ${headerRowIndex + 1}.`;
            return;
          }
          if (idxAlarm === undefined) {
            this.debug = `"Alarm" column not found on header row ${headerRowIndex + 1}.`;
            return;
          }
		  if (idxTYPE === undefined) {
		    this.debug = `"TYPE" column not found on header row ${headerRowIndex + 1}.`;
		    return;
		  }
		  if (idxHMI === undefined) {
		    this.variableScalingProgram = '';
		    this.debug += '\nHMI column not found.';
		  }

          // Columns for IO_Tags
          const idxHardwareDecl = col['hardware declaration'];
          const idxComment = col['comment'];
		  const idxControl = col['control'];

          // Columns for alarms
          const idxALMNAME = col['alm name'];
		  const idxSubSystem = col['sub system'];	//Could it be 'system' column instead

		  // Columns for digital alarms
          const idxID  = col['id'];
		  const idxInv = col['inv'];
          const idxAlarmConfig = col['alarmconfig'];
          const idxAlarmDelay  = col['alarmdelay'];

		  // Columns for analog alarms
          const idxIDA = col['ida'];
		  const idxCondition = col['condition'];
		  const idxDeadband = col['deadband'];

		  const idxAlarmConfigLL  = col['en'];
          const idxLowLowLimit = col['lowlowlimit'];
          const idxLowLowDelay = col['lowlowdelay'];

		  const idxAlarmConfigL = col['en2'];
          const idxLowLimit = col['lowlimit'];
          const idxLowDelay = col['lowdelay'];

		  const idxAlarmConfigH = col['en3'];
		  const idxHighLimit = col['highlimit'];
          const idxHighDelay = col['highdelay'];

		  const idxAlarmConfigHH = col['en4'];
          const idxHighHighLimit = col['highhighlimit'];
          const idxHighHighDelay = col['highhighdelay'];

		  // Columns for scaling
		  const idxRawZero     = col['rawzero'];
		  const idxRawFull     = col['rawfull'];
		  const idxScaledZero  = col['scaledzero'];
		  const idxScaledFull  = col['scaledfull'];

		  // Colums for GVL
		  const idxLocation = col['location']; // opcional
		  const idxModbusReg = col['modbus declaration'] ?? col['modbus'] ?? col['modbus reg'] ?? col['modbus register'];

		  // Columns for .tmc file
		  const idx1 = col['id1'];
		  const idx2 = col['id2'];
		  const idx3 = col['id3'];
		  const idx4 = col['id4'];
		  const idxDigSeverity = col['digital alarm severity'];
		  const xmlEscapeAttr = (s) => this.xmlEscape(s ?? '').replace(/\"/g, '&quot;');
		  const tmcEvent = (id, eventName, displayName, severity, systemValue) => {
		    const idAttr = xmlEscapeAttr(String(id ?? '').trim());
		    const disp = String(displayName ?? '').trim();
		    const sev = String(severity ?? '').trim();
		    const sys = this.xmlEscape(String(systemValue ?? '').trim());
		    return (`			<EventId>
				<Name Id="${idAttr}">${eventName}</Name>
				<DisplayName TxtId=""><![CDATA[${disp}]]></DisplayName>
				<Severity>${sev}</Severity>
				<Properties>
					<Property>
						<Name>System</Name>
						<Value>${sys}</Value>
					</Property>
				</Properties>
			</EventId>`
		    );
		  };
		  const tmcDigitalEvents = [];
		  const tmcAnalogEvents  = [];

		  //Other
		  const producedTags = new Set();

			// -----------------------------------------------------------------------------
			// Build IO_Tags and VariableScale outputs.
			// The IO_Tags text is emitted in two sections:
			// 1) All base IO tag declarations
			// 2) All ST_AI instances (st_<TAG>) for HMI-enabled rows
			// -----------------------------------------------------------------------------
			const ioTagDeclLines = [];
			const stAiDeclLines = [];
			const scalingLines = [];
			let controlCount = 0;

			// GVL (internal tags)
			const gvlLines = [];
			const gvlLinesModbusTCP = [];	// Location = ModbusTCP
			const gvlLinesModbus = [];		// Location = Modbus
			const gvlErrors = [];
			const allowedGvlTypes = new Set(['DIGITAL','BOOL','INT','UINT','DINT','SINT','USINT','DUINT','REAL','WORD','DWORD','BYTE']);
			const normalizeGvlType = (typeRaw) => {
			  const t = toStrTrim(typeRaw).toUpperCase();
			  if (!t) return null;

			  // If it contains "DIGITAL" or "BOOL", force BOOL
			  if (t.includes('DIGITAL') || t.includes('BOOL')) return 'BOOL';

			  // Otherwise accept only strict allowed types
			  return allowedGvlTypes.has(t) ? t : null;
			};

			// SubSystem internal lines (unique)
			const subSystemMap = new Map(); // key: SubSystem_<identifier>, value: raw text

			// ST string escape: ' -> ''
			const stEscape = (s) => String(s ?? '').replace(/'/g, "''");

			for (const [i, r] of dataRows.entries()) {
			  const controlCell = (idxControl !== undefined) ? toStrTrim(r[idxControl]) : '';
			  const isControl = (controlCell.trim().toLowerCase() === 'x');

			  const hmiCell = (idxHMI !== undefined) ? toStrTrim(r[idxHMI]) : '';
			  const isHmi = (hmiCell.trim().toLowerCase() === 'x');

			  // Collect SubSystem from ALL rows
			  const subSystemRaw = (idxSubSystem !== undefined) ? toStrTrim(r[idxSubSystem]) : '';
			  if (subSystemRaw) {
			    const varName = `SubSystem_${toIdentifier(subSystemRaw)}`;
			    if (!subSystemMap.has(varName)) subSystemMap.set(varName, subSystemRaw);
			  }

			  // Process rows that are either Control or HMI.
			  if (!isControl && !isHmi) continue;

			  // Count only Control rows
			  if (isControl) controlCount++;

			  const tag = toStrTrim(r[idxNAME]);
			  if (!tag) continue;

			  const tagLower = tag.toLowerCase();
			  if (tagLower === 'spare_di' || tagLower === 'spare_do' || tagLower === 'spare_ai' || tagLower === 'spare_ao') continue;

			  let atDecl = '';
			  if (tag.endsWith('_DI'))      atDecl = 'AT %I* : BOOL';
			  else if (tag.endsWith('_DO')) atDecl = 'AT %Q* : BOOL';
			  else if (tag.endsWith('_AI')) atDecl = 'AT %I* : INT';
			  else if (tag.endsWith('_AO')) atDecl = 'AT %Q* : INT';

			  const hwDecl = (idxHardwareDecl !== undefined) ? toStrTrim(r[idxHardwareDecl]) : '';
			  const comment = (idxComment !== undefined) ? toStrTrim(r[idxComment]) : '';
			  const commentSuffix = comment ? ` // ${comment}` : '';

			  // Base IO_Tags declarations.
			  if (hwDecl) ioTagDeclLines.push(hwDecl);
			  ioTagDeclLines.push(`${tag} ${atDecl};${commentSuffix}`);

			  // HMI-related declarations and scaling program (stored separately).
			  if (isHmi && !isControl) {
				const stVar = `st_${tag}`;

				const rawZero    = fmtNumberOrRaw((idxRawZero    !== undefined) ? r[idxRawZero]    : null, 0);
				const rawFull    = fmtNumberOrRaw((idxRawFull    !== undefined) ? r[idxRawFull]    : null, 0);
				const scaledZero = fmtNumberOrRaw((idxScaledZero !== undefined) ? r[idxScaledZero] : null, 0);
				const scaledFull = fmtNumberOrRaw((idxScaledFull !== undefined) ? r[idxScaledFull] : null, 0);

				stAiDeclLines.push(`${stVar}: ST_AI := (RawZero:=${rawZero}, RawFull:=${rawFull}, ScaledZero:=${scaledZero}, ScaledFull:=${scaledFull});`);
				scalingLines.push(`${stVar}.Raw := ${tag}; ${stVar}.Scaled := FAiScale(${stVar});`);

				// GVL (internal tags)
				const typeRaw = (idxTYPE !== undefined) ? toStrTrim(r[idxTYPE]) : '';
				const gvlType = normalizeGvlType(typeRaw);

				const locationRaw = (idxLocation !== undefined) ? toStrTrim(r[idxLocation]) : '';
			    const locationLower = locationRaw.toLowerCase();
			    const isModbusTCP = locationLower.includes('modbustcp');
				const isModbus = !isModbusTCP && locationLower.includes('modbus');

				if (!gvlType) {
			  	const excelRow = startDataIndex + 1 + i; // 1-based Excel row number
			  	  gvlErrors.push(`Row ${excelRow}: invalid TYPE '${typeRaw}' for HMI tag '${tag}'`);
			    } else {
			  	const cmt = comment || '';
				  if (isModbusTCP) gvlLinesModbusTCP.push(`${tag}: ${gvlType} ;       //${cmt}`);
				  if (isModbus) gvlLinesModbus.push(`${tag}: ${gvlType} ;       //${cmt}`);
			  	  else gvlLines.push(`${tag}: ${gvlType} ;       //${cmt}`);
			    }
			  }
			producedTags.add(tag);
			this.controlCount = controlCount;
			}


			// Final formatting: first IO tags, then ST_AI instances.
			const separator = (stAiDeclLines.length > 0) ? '\n' : '';
			this.tagsText =
			`{attribute 'global_init_slot' := '40500'}\n` +
			`VAR_GLOBAL\n` +
			`{region "I/O Tags"}	// I/O hardware linked tags\n` +
			this.alignDecls(ioTagDeclLines).join('\n') + separator +
			`{endregion}\n\n` +
			`{region "Scaling"}		// Analog tags scalings\n` +
			stAiDeclLines.join('\n') + `\n` +
			`{endregion}\n\n` +
			`END_VAR`

			this.variableScalingProgram = scalingLines.join('\n').trim();

			this.tags = [...producedTags];

			// GVL (internal tags)
			const internalLines = Array.from(subSystemMap.entries())
			  .sort(([a], [b]) => a.localeCompare(b))
			  .map(([varName, raw]) => `${varName}: FB_TcSourceInfo:= (sName:='${stEscape(raw)}');`);

			const sections = [
			  `VAR_GLOBAL`,
			  `// Internal tags\n${this.alignDecls(gvlLines).join('\n')}`,

			  // Only if Location = ModbusTCP
			  gvlLinesModbusTCP.length
				? `// ModbusTCP tags\n${this.alignDecls(gvlLinesModbusTCP).join('\n')}`
				: '',

			  // Only if Location = Modbus
			  gvlLinesModbus.length
				? `// Modbus tags\n${this.alignDecls(gvlLinesModbus).join('\n')}`
				: '',

			  `// Sub systems\n${internalLines.join('\n')}`,
			  `END_VAR`
			];

			this.GVLtags = sections.filter(Boolean).join('\n\n');

			if (gvlErrors.length) {
			  this.debug = (this.debug ? (this.debug + '\n') : '') + 'GVL TYPE errors:\n' + gvlErrors.join('\n');
			}


          // Alarm_tags
          const digitalAlarmLines = [];
          const analogAlarmLines = [];

          // TwinCAT Declarations
          const fbDeclDigital = [];
          const fbDeclAnalog = [];
          const eventDeclDigital = [];
          const eventDeclAnalog = [];

          // TwinCAT Program
		  const programFbLinesDigital = [];
		  const programFbLinesAnalog  = [];

		  const programCreateExLinesDigital = [];
		  const programCreateExLinesAnalog  = [];

          const typeErrors = [];
		  let maxID = null;
		  let maxIDA = null;

		  for (const [i, r] of dataRows.entries()) {
		    const tag = toStrTrim(r[idxNAME]);
		    if (!tag) continue;
		    if (!isAlarmMark(r[idxAlarm])) continue;

		    // Fila real del Excel (1-based)
		    const excelRow = startDataIndex + 1 + i;

		    const typeRaw = toStrTrim(r[idxTYPE]);
		    if (!typeRaw) {
		  	typeErrors.push(`Row ${excelRow}: 'TYPE' column is empty (${tag})`);
		  	continue; // no generes nada para esta alarma
		    }

		    const typeUpper = typeRaw.toUpperCase();
		    const isDigital = typeUpper.includes('DIGITAL');
		    const isAnalog  = !isDigital; // todo lo que NO contenga DIGITAL => INT (analógica)

			// .tmc
			const almName = (idxALMNAME !== undefined) ? toStrTrim(r[idxALMNAME]) : '';
			const sysCell = (idxSubSystem !== undefined) ? toStrTrim(r[idxSubSystem]) : ((idxSubSystem !== undefined) ? toStrTrim(r[idxSubSystem]) : '');

            // Alarm_tags generation
            if (isDigital) {
              const idCell = (idxID !== undefined) ? toStrTrim(r[idxID]) : '';
			  const idNum = Number(idCell);
			  if (Number.isFinite(idNum)) maxID = (maxID === null) ? idNum : Math.max(maxID, idNum);

			  const id = fmtNumberOrRaw(idxID !== undefined ? r[idxID] : '', '0');
              const almName = toStrTrim(idxALMNAME !== undefined ? r[idxALMNAME] : '');
              const alarmConfig = fmtNumberOrRaw(idxAlarmConfig !== undefined ? r[idxAlarmConfig] : '', '0');
              const alarmDelay  = fmtNumberOrRaw(idxAlarmDelay !== undefined ? r[idxAlarmDelay] : '', '0');

			  const id1 = (idx1 !== undefined) ? toStrTrim(r[idx1]) : '';
			  const sev = (idxDigSeverity !== undefined) ? toStrTrim(r[idxDigSeverity]) : 'Warning'; // default
              if (id1) {
			    tmcDigitalEvents.push(
				  tmcEvent(id1, `Event_${tag}`, almName, sev, sysCell)
				);
			  }

			  digitalAlarmLines.push(
                `st_al_${tag}: ST_ALARM_DI := (ID:=${id}, Tag:='${tag}', TagInfo:='${almName}', AlarmConfig:=${alarmConfig}, AlarmDelay:=${alarmDelay}, Snooze:=0);`
              );
            }

            if (isAnalog) {
              const idaCell = (idxIDA !== undefined) ? toStrTrim(r[idxIDA]) : '';
			  const idaNum = Number(idaCell);
			  if (Number.isFinite(idaNum)) maxIDA = (maxIDA === null) ? idaNum : Math.max(maxIDA, idaNum);

			  const ida = fmtNumberOrRaw(idxIDA !== undefined ? r[idxIDA] : '', '0');
              const almName = toStrTrim(idxALMNAME !== undefined ? r[idxALMNAME] : '');
              const alarmConfig = fmtNumberOrRaw(idxAlarmConfig !== undefined ? r[idxAlarmConfig] : '', '0');

              const deadband = fmtNumberOrRaw(idxDeadband !== undefined ? r[idxDeadband] : '', '0');
              const lowLowLimit = fmtNumberOrRaw(idxLowLowLimit !== undefined ? r[idxLowLowLimit] : '', '0');
              const lowLowDelay = fmtNumberOrRaw(idxLowLowDelay !== undefined ? r[idxLowLowDelay] : '', '0');
              const lowLimit = fmtNumberOrRaw(idxLowLimit !== undefined ? r[idxLowLimit] : '', '0');
              const lowDelay = fmtNumberOrRaw(idxLowDelay !== undefined ? r[idxLowDelay] : '', '0');
              const highLimit = fmtNumberOrRaw(idxHighLimit !== undefined ? r[idxHighLimit] : '', '0');
              const highDelay = fmtNumberOrRaw(idxHighDelay !== undefined ? r[idxHighDelay] : '', '0');
              const highHighLimit = fmtNumberOrRaw(idxHighHighLimit !== undefined ? r[idxHighHighLimit] : '', '0');
              const highHighDelay = fmtNumberOrRaw(idxHighHighDelay !== undefined ? r[idxHighHighDelay] : '', '0');
			  const alarmConfigLL = enToConfig(idxAlarmConfigLL  !== undefined ? r[idxAlarmConfigLL]  : '', alarmConfig);
			  const alarmConfigL  = enToConfig(idxAlarmConfigL !== undefined ? r[idxAlarmConfigL] : '', alarmConfig);
			  const alarmConfigH  = enToConfig(idxAlarmConfigH !== undefined ? r[idxAlarmConfigH] : '', alarmConfig);
			  const alarmConfigHH = enToConfig(idxAlarmConfigHH !== undefined ? r[idxAlarmConfigHH] : '', alarmConfig);

			  // .tmc
			  const id1 = (idx1 !== undefined) ? toStrTrim(r[idx1]) : '';
			  const id2 = (idx2 !== undefined) ? toStrTrim(r[idx2]) : '';
			  const id3 = (idx3 !== undefined) ? toStrTrim(r[idx3]) : '';
			  const id4 = (idx4 !== undefined) ? toStrTrim(r[idx4]) : '';

			  if (id1) tmcAnalogEvents.push(tmcEvent(id1, `EventHH_${tag}`, `${almName} high high`, 'Critical', sysCell));
			  if (id2) tmcAnalogEvents.push(tmcEvent(id2, `EventH_${tag}`,  `${almName} high`,      'Warning',  sysCell));
			  if (id3) tmcAnalogEvents.push(tmcEvent(id3, `EventL_${tag}`,  `${almName} low`,       'Warning',  sysCell));
			  if (id4) tmcAnalogEvents.push(tmcEvent(id4, `EventLL_${tag}`, `${almName} low low`,   'Critical', sysCell));

              analogAlarmLines.push(
                `st_al_${tag}: ST_ALARM_AI := (` +
                  `ID:=${ida}, ` +
                  `TAG:='${tag}', ` +
				  `ScaledMax:=st_${tag}.ScaledFull, ` +
                  `TagInfo:='${almName}', ` +
                  `AlarmConfigLL:=${alarmConfigLL}, AlarmConfigL:=${alarmConfigL}, AlarmConfigH:=${alarmConfigH}, AlarmConfigHH:=${alarmConfigHH}, ` +
                  `Deadband:=${deadband}, ` +
                  `LowLowLimit:=${lowLowLimit}, LowLowDelay:=${lowLowDelay}, ` +
                  `LowLimit:=${lowLimit}, LowDelay:=${lowDelay}, ` +
                  `HighLimit:=${highLimit}, HighDelay:=${highDelay}, ` +
                  `HighHighLimit:=${highHighLimit}, HighHighDelay:=${highHighDelay}` +
                `);`
              );
            }

            // Declarations (FB instances)
            if (isDigital) fbDeclDigital.push(`fb_${tag}: FB_DI;`);
            if (isAnalog)  fbDeclAnalog.push(`fb_${tag}: FB_AI;`);

            // Declarations (Event FBs)
            if (isDigital) {
              eventDeclDigital.push(`Event_${tag}: FB_TcAlarm;`);
            }
            if (isAnalog) {
              eventDeclAnalog.push(`EventL_${tag}: FB_TcAlarm;`);
              eventDeclAnalog.push(`EventLL_${tag}: FB_TcAlarm;`);
              eventDeclAnalog.push(`EventH_${tag}: FB_TcAlarm;`);
              eventDeclAnalog.push(`EventHH_${tag}: FB_TcAlarm;`);
            }

            // Program (FB calls + CreateEx init)
            const invMark = (idxInv !== undefined) ? toStrTrim(r[idxInv]).toLowerCase() : '';
            const isInverted = (invMark === 'x');

            const subSystemRaw = (idxSubSystem !== undefined) ? toStrTrim(r[idxSubSystem]) : '';
            const subSystemExpr = subSystemRaw ? `SubSystem_${toIdentifier(subSystemRaw)}` : '0';
			const condRaw = (idxCondition !== undefined) ? toStrTrim(r[idxCondition]) : '';
			const bCondition = condRaw ? condRaw : 'True';

            if (isDigital) {
              const varExpr = isInverted ? `NOT ${tag}` : `${tag}`;

              programFbLinesDigital.push(
                `fb_${tag}(i_bVariable:=${varExpr}, i_bConfig:=bAlarmSetupActive, ST_Variable:=st_al_${tag}, FB_Alarm:=Event_${tag});`
              );

              programCreateExLinesDigital.push(
                `Event_${tag}.CreateEx(TC_Events.AlarmClass.Event_${tag}, TRUE, ${subSystemExpr});`
              );
            }

            if (isAnalog) {
              programFbLinesAnalog.push(
                `fb_${tag}(i_nVariable:=st_${tag}.Scaled, i_bCondition:=${bCondition}, i_bConfig:=bAlarmSetupActive, ST_Variable:=st_al_${tag}, ` +
                `FB_LowAlarm:=EventL_${tag}, FB_LowLowAlarm:=EventLL_${tag}, FB_HighAlarm:=EventH_${tag}, FB_HighHighAlarm:=EventHH_${tag});`
              );

              programCreateExLinesAnalog.push(
                `EventL_${tag}.CreateEx(TC_Events.AlarmClass.EventL_${tag}, TRUE, ${subSystemExpr});`
              );
              programCreateExLinesAnalog.push(
                `EventLL_${tag}.CreateEx(TC_Events.AlarmClass.EventLL_${tag}, TRUE, ${subSystemExpr});`
              );
              programCreateExLinesAnalog.push(
                `EventH_${tag}.CreateEx(TC_Events.AlarmClass.EventH_${tag}, TRUE, ${subSystemExpr});`
              );
              programCreateExLinesAnalog.push(
                `EventHH_${tag}.CreateEx(TC_Events.AlarmClass.EventHH_${tag}, TRUE, ${subSystemExpr});`
              );
            }
          }

		  this.maxID  = maxID;
		  this.maxIDA = maxIDA;

		  if (typeErrors.length) {
		    this.alarmDigitalText = '';
		    this.alarmAnalogText = '';
		    this.alarmTagsText = '';
		    this.alarmsTwinCatDeclaration = '';
		    this.alarmsTwinCatProgram = '';
			this.tmcDigitalEventsText = '';
			this.tmcAnalogEventsText  = '';
		    this.debug = 'Error: ' + typeErrors.join('\n');
		  return;
		  }

		  // .tmc
		  this.tmcDigitalEventsText = tmcDigitalEvents.join('\n');
		  this.tmcAnalogEventsText  = tmcAnalogEvents.join('\n')

          // Fill Alarm_tags boxes data
          this.alarmDigitalText = digitalAlarmLines.join('\n');
          this.alarmAnalogText = analogAlarmLines.join('\n');

          // Combined Alarm_tags for one single textarea
          this.alarmTagsText =
`{attribute 'global_init_slot' := '40502'}
VAR_GLOBAL PERSISTENT
{region "Digital alarms"}	// Digital alarms structure declaration from I/O list
${this.alarmDigitalText || ''}${(this.alarmDigitalText && this.alarmAnalogText) ? '\n' : ''}
{endregion}\n
{region "Analog alarms"}	// Analog alarms structure declaration from I/O list
${this.alarmAnalogText || ''}
{endregion}\n
END_VAR

VAR_GLOBAL CONSTANT
//Digital alarm array size
	ArrMinD: INT := 1;
	ArrMaxD: INT := ${maxID ?? '-' };
//Analog alarm array size
	ArrMinA: INT := 1;
	ArrMaxA: INT := ${maxIDA ?? '-' };
END_VAR

VAR_GLOBAL
//Array needs to be at least as big as the highest digital struct ID
	Arr_AlarmDigital: ARRAY[ArrMinD..ArrMaxD] OF ST_ALARM_DI;
//Array needs to be at least as big as the highest analog struct ID
	Arr_AlarmAnalog: ARRAY[ArrMinA..ArrMaxA] OF ST_ALARM_AI;
END_VAR`.trim() + '\n';

          // TwinCAT declarations
          const allFbDecls  = this.alignDecls([...fbDeclDigital,    ...fbDeclAnalog]);
          const allEvtDecls = this.alignDecls([...eventDeclDigital, ...eventDeclAnalog]);

          this.alarmsTwinCatDeclaration =
`PROGRAM Alarms
VAR
{region "Alarms FB declarations"}	// Digital + analog
${allFbDecls.join('\n')}
{endregion}\n
{region "Events declaration"}		// Digital + analog
${allEvtDecls.join('\n')}
{endregion}\n
//Other tags
	fbEventlogger: FB_TcEventLogger;
	bSilence: BOOL;
	bTemp: BOOL;
	i: INT;
	o_bBuzzerD: BOOL;
	o_bBuzzerA: BOOL;
	o_bAlarmLightD: BOOL;
	o_bAlarmLightA: BOOL;
	bTempA: BOOL;
	fbSRLight: RS;
	fbTRIGLight: R_TRIG;
	bIsInitalized: BOOL;
	bConfirm: BOOL;
	bConfirmAll: BOOL;
	bAlarmSetupActive: BOOL;
	bClearAll: BOOL;
	bDigitalCounter: INT;
	bAnalogCounter: INT;
END_VAR`.trim() + '\n';

          // TwinCAT program
            const createExIndented = [
		    programCreateExLinesDigital.map(l => l).join('\n'),
		    programCreateExLinesAnalog.map(l => l).join('\n')
		  ].filter(s => (s ?? '').trim().length).join('\n\n');

		  const programFbLinesOrdered = [
		    programFbLinesDigital.join('\n'),
		    programFbLinesAnalog.join('\n')
		  ].filter(s => (s ?? '').trim().length).join('\n\n');

          this.alarmsTwinCatProgram =
`{attribute 'global_init_slot' := '40503'}
IF NOT bIsInitalized THEN
    bIsInitalized := TRUE;
${createExIndented}
END_IF

{region "Alarms"}	// Alarm functions
${programFbLinesOrdered}
{endregion}

IF bConfirmAll THEN
	bConfirmAll := FALSE;
	fbEventLogger.ConfirmAllAlarms(0);
	fbSRLight(RESET1 := TRUE);
ELSE
	fbSRLight(RESET1 := FALSE);
END_IF

FOR i := ArrMinD TO ArrMaxD-1 BY 1 DO  // Buzzer activation for digital alarms
	IF Arr_AlarmDigital[i].AlarmRaised THEN
		o_bBuzzerD := 1;
	END_IF
	IF Arr_AlarmDigital[i].AlarmActive THEN
		o_bAlarmLightD := 1;
		bTemp :=1;
	END_IF
END_FOR

FOR i := ArrMinA TO ArrMaxA-1 BY 1 DO	// Buzzer activation for analog alarms
	IF Arr_AlarmAnalog[i].AlarmRaised THEN
		o_bBuzzerA := 1;
	END_IF
END_FOR

IF bSilence THEN	//silence of buzzers
	bSilence := 0;
	o_bBuzzerD := 0;
	o_bBuzzerA := 0;
END_IF

IF ((o_bBuzzerD OR o_bBuzzerA) THEN		// Buzzer activation at ¿?
	// Add buzzers here = 1;
ELSE
	// Add buzzers here = 0;
END_IF

IF (o_bBuzzerD OR o_bBuzzerA) THEN 		// Alarm light SET
	fbTRIGLight(CLK:=TRUE);
	fbSRLight(SET := fbTRIGLight.Q);
ELSE
	fbSRLight(SET := FALSE);
	fbTRIGLight(CLK:=FALSE);
END_IF

bTemp :=0;
bTempA :=0;

//alarm light output
IF fbSRLight.Q1 THEN
	// Add light *_DO here = 1;
ELSE
	// Add light *_DO here = 0;
END_IF`.trim() + '\n';

		  // .tmc file generation
		  this.tmcText =
			this.tplTmcHeader +
			tmcDigitalEvents.join('\n') + '\n' +
			tmcAnalogEvents.join('\n') + '\n' +
			this.tplTmcFooter;

          // Debug
          const missing = [];
          const must = (key, label) => { if (col[key] === undefined) missing.push(label); };
          must('hardware declaration', 'Hardware declaration (optional)');
          must('comment', 'Comment (optional)');
          must('inv', 'Inv (optional, for NOT)');
          must('sub system', 'Sub system (optional, for CreateEx)');

          this.debug =
            //`Header row used: ${headerRowIndex + 1}\n` +
            `Data start row: ${startDataIndex + 1}\n` +
			`Total IOs (control column): ${this.controlCount}\n` +
            //`Total tags: ${this.tags.length}\n` +
            `Digital alarms: ${maxID}\n` +
            `Analog alarms: ${maxIDA}\n`;
            //`PROGRAM FB calls: ${programFbLinesOrdered.length}\n` +
            //`PROGRAM CreateEx calls: ${programCreateExLines.length}\n` +
            //`Missing optional columns (if any): ${missing.length ? missing.join(', ') : 'none'}\n`;
        }
      }
    }).directive('autoresize', {
      mounted(el) {
        el.style.overflow = 'hidden';
        el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
      },
      updated(el) {
        el.style.overflow = 'hidden';
        el.style.height = 'auto';
        el.style.height = el.scrollHeight + 'px';
      }
    }).mount('#app');
