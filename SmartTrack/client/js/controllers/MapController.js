class MapController {
  static DEFAULT_CENTER = [39.563429, 2.640039];
  static DEFAULT_ZOOM   = 17;
  static CACHE_KEY      = 'map_style';

  static STYLES = {
    light:     { label_key: 'map_light',     url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png' },
    standard:  { label_key: 'map_standard',  url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' },
    dark:      { label_key: 'map_dark',      url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png' },
    satellite: { label_key: 'map_satellite', url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}' },
  };

  // Color y símbolo por tipo de ubicación
  static TIPOS = {
    base:    { color: '#124C8C', symbol: '⌂', label: 'Base'    },
    oficina: { color: '#059669', symbol: '◼', label: 'Oficina' },
    taller:  { color: '#D97706', symbol: '⚙', label: 'Taller'  },
    barco:   { color: '#0891B2', symbol: '⚓', label: 'Barco'   },
  };

  constructor(containerId) {
    this._activeStyle = CacheService.get(MapController.CACHE_KEY) || 'light';
    this._tileLayer   = null;
    this._switcherEl  = null;
    this._markers     = new Map(); // id → marker
    this._tempMarker  = null;
    this._pickMode    = false;
    this._pickHandler = null;

    this._map = L.map(containerId, {
      center:             MapController.DEFAULT_CENTER,
      zoom:               MapController.DEFAULT_ZOOM,
      attributionControl: false,
      zoomControl:        false
    });

    L.control.zoom({ position: 'bottomright' }).addTo(this._map);
    this._applyStyle(this._activeStyle);
    this._addStyleSwitcher();
    this._loadUbicaciones();
  }

  // ─── Tile layer ───────────────────────────────────────
  _applyStyle(key) {
    if (!MapController.STYLES[key]) key = 'light';
    if (this._tileLayer) this._map.removeLayer(this._tileLayer);
    this._tileLayer   = L.tileLayer(MapController.STYLES[key].url, { maxZoom: 20 }).addTo(this._map);
    this._activeStyle = key;
    CacheService.set(MapController.CACHE_KEY, key);
  }

  // ─── Carga inicial ────────────────────────────────────
  async _loadUbicaciones() {
    try {
      const ubicaciones = await apiClient.get('/ubicaciones');
      ubicaciones.forEach(u => this._addMarker(u));
    } catch (err) {
      console.error('[MapController] Error cargando ubicaciones:', err);
    }
  }

  // ─── Marcadores ───────────────────────────────────────
  _addMarker(ubicacion) {
    const { lat, lng } = ubicacion.coordenadas;
    const tipo = MapController.TIPOS[ubicacion.tipo] || MapController.TIPOS.base;

    const icon = L.divIcon({
      className: '',
      html: `<div class="map-marker map-marker--${ubicacion.tipo}" style="background:${tipo.color}">
               <span class="map-marker-symbol">${tipo.symbol}</span>
             </div>`,
      iconSize:   [38, 38],
      iconAnchor: [19, 38],
      popupAnchor:[0, -42]
    });

    const marker = L.marker([lat, lng], { icon })
      .bindPopup(this._buildPopup(ubicacion, tipo), {
        maxWidth: 260,
        className: 'map-popup-wrapper'
      })
      .addTo(this._map);

    this._markers.set(String(ubicacion._id), marker);
    return marker;
  }

  addMarkerFromData(ubicacion) {
    this._addMarker(ubicacion);
  }

  removeMarkerById(id) {
    const marker = this._markers.get(String(id));
    if (marker) {
      this._map.removeLayer(marker);
      this._markers.delete(String(id));
    }
  }

  refreshMarker(ubicacion) {
    this.removeMarkerById(ubicacion._id);
    this._addMarker(ubicacion);
  }

  // ─── Marcador temporal arrastrable ────────────────────
  addDraggableTempMarker(lat, lng, onDragEnd) {
    this.removeTempMarker();

    const icon = L.divIcon({
      className: '',
      html: `<div class="map-marker map-marker--temp" style="background:#6B7280; opacity:0.9;">
               <span class="map-marker-symbol">✛</span>
             </div>`,
      iconSize:   [38, 38],
      iconAnchor: [19, 38],
    });

    this._tempMarker = L.marker([lat, lng], { icon, draggable: true }).addTo(this._map);
    this._tempMarker.on('dragend', e => {
      const pos = e.target.getLatLng();
      onDragEnd(pos.lat, pos.lng);
    });

    this._map.panTo([lat, lng]);
    return this._tempMarker;
  }

  removeTempMarker() {
    if (this._tempMarker) {
      this._map.removeLayer(this._tempMarker);
      this._tempMarker = null;
    }
  }

  // ─── Pick mode (clic en mapa para coordenadas) ────────
  enterPickMode(callback) {
    if (this._pickMode) return;
    this._pickMode = true;
    this._map.getContainer().classList.add('map--pick-mode');

    this._pickHandler = e => {
      this.exitPickMode();
      callback(e.latlng.lat, e.latlng.lng);
    };
    this._map.once('click', this._pickHandler);
  }

  exitPickMode() {
    if (!this._pickMode) return;
    this._pickMode = false;
    this._map.getContainer().classList.remove('map--pick-mode');
    if (this._pickHandler) {
      this._map.off('click', this._pickHandler);
      this._pickHandler = null;
    }
  }

  // ─── Popup ────────────────────────────────────────────
  _buildPopup(u, tipo) {
    const isBarco = u.tipo === 'barco';
    const extraRows = isBarco ? `
      ${u.matricula   ? `<div class="popup-row"><span class="popup-label">Matrícula</span><span>${u.matricula}</span></div>` : ''}
      ${u.eslora      ? `<div class="popup-row"><span class="popup-label">Eslora</span><span>${u.eslora} m</span></div>` : ''}
      ${u.propietario ? `<div class="popup-row"><span class="popup-label">Propietario</span><span>${u.propietario}</span></div>` : ''}
      ${u.tipoBarco   ? `<div class="popup-row"><span class="popup-label">Tipo</span><span>${u.tipoBarco.charAt(0).toUpperCase() + u.tipoBarco.slice(1)}</span></div>` : ''}
    ` : '';

    return `
      <div class="map-popup">
        <div class="map-popup-header" style="border-color:${tipo.color}">
          <span class="map-popup-badge" style="background:${tipo.color}">${tipo.label}</span>
          <span class="map-popup-name">${u.nombre}</span>
        </div>
        ${u.descripcion ? `<p class="map-popup-desc">${u.descripcion}</p>` : ''}
        ${extraRows ? `<div class="map-popup-rows">${extraRows}</div>` : ''}
      </div>`;
  }

  // ─── Style switcher ───────────────────────────────────
  _addStyleSwitcher() {
    const self = this;
    const StyleSwitcher = L.Control.extend({
      options: { position: 'topleft' },
      onAdd() {
        const wrap = L.DomUtil.create('div', 'map-style-switcher');
        L.DomEvent.disableClickPropagation(wrap);
        self._switcherEl = wrap;
        self._renderSwitcherButtons(wrap);
        return wrap;
      }
    });
    new StyleSwitcher().addTo(this._map);
  }

  _renderSwitcherButtons(wrap) {
    wrap.innerHTML = '';
    Object.entries(MapController.STYLES).forEach(([key, style]) => {
      const btn = L.DomUtil.create('button', 'map-style-btn', wrap);
      btn.textContent = this._t(style.label_key);
      btn.dataset.key = key;
      if (key === this._activeStyle) btn.classList.add('active');
      L.DomEvent.on(btn, 'click', () => {
        this._applyStyle(key);
        wrap.querySelectorAll('.map-style-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
  }

  refreshLabels() {
    if (this._switcherEl) this._renderSwitcherButtons(this._switcherEl);
  }

  // ─── Util ─────────────────────────────────────────────
  _t(key) {
    const lang = CacheService.obtenerIdioma();
    return Diccionarios.index?.[lang]?.[key] || key;
  }
}
