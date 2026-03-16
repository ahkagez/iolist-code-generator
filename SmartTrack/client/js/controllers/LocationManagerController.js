class LocationManagerController {

  constructor(mapController) {
    this._map    = mapController;
    this._data   = [];
    this._editId = null;
    this._isOpen = false;
    this._el     = null;
    this._pickBar = null;

    this._buildDOM();
    this._bindNavBtn();
  }

  // ─── Construcción DOM ─────────────────────────────────
  _buildDOM() {
    // Pick bar (hint flotante para pick mode)
    this._pickBar = document.createElement('div');
    this._pickBar.className = 'lm-pick-bar';
    this._pickBar.textContent = 'Haz clic en el mapa para colocar el punto · ESC para cancelar';
    document.body.appendChild(this._pickBar);

    // Panel principal
    const panel = document.createElement('div');
    panel.className = 'lm-panel';
    panel.id = 'lm-panel';
    panel.innerHTML = `
      <div class="lm-header">
        <button class="lm-back-btn lm-hidden" id="lm-back">‹</button>
        <h2 class="lm-title" id="lm-title">Ubicaciones</h2>
        <div class="lm-header-actions">
          <button class="lm-btn-new" id="lm-new">+ Nueva</button>
          <button class="lm-close-btn" id="lm-close">✕</button>
        </div>
      </div>

      <!-- Vista lista -->
      <div class="lm-view" id="lm-list-view">
        <div class="lm-list" id="lm-list"></div>
      </div>

      <!-- Vista formulario -->
      <div class="lm-view lm-hidden" id="lm-form-view">
        <form class="lm-form" id="lm-form" autocomplete="off">

          <div class="lm-field">
            <label class="lm-label">Nombre *</label>
            <input class="lm-input" type="text" name="nombre" required placeholder="Nombre de la ubicación">
          </div>

          <div class="lm-field">
            <label class="lm-label">Tipo *</label>
            <select class="lm-input" name="tipo" required>
              <option value="">— Seleccionar tipo —</option>
              <option value="base">Base</option>
              <option value="oficina">Oficina</option>
              <option value="taller">Taller</option>
              <option value="barco">Barco</option>
            </select>
          </div>

          <div class="lm-field">
            <label class="lm-label">Descripción</label>
            <textarea class="lm-input lm-textarea" name="descripcion" rows="2" maxlength="500" placeholder="Descripción opcional"></textarea>
          </div>

          <div class="lm-field-group">
            <div class="lm-field lm-field--half">
              <label class="lm-label">Latitud *</label>
              <input class="lm-input" type="number" name="lat" step="any" required placeholder="39.5634">
            </div>
            <div class="lm-field lm-field--half">
              <label class="lm-label">Longitud *</label>
              <input class="lm-input" type="number" name="lng" step="any" required placeholder="2.6400">
            </div>
          </div>

          <div class="lm-coord-actions">
            <button type="button" class="lm-btn-coord" id="lm-pick-btn">
              <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd"/>
              </svg>
              Marcar en mapa
            </button>
            <button type="button" class="lm-btn-coord" id="lm-drag-btn">
              <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
                <path d="M10 3.5a.5.5 0 01.5.5V8h4a.5.5 0 010 1h-4v3.5a.5.5 0 01-1 0V9H5.5a.5.5 0 010-1H9.5V4a.5.5 0 01.5-.5z"/>
                <path fill-rule="evenodd" d="M10 2a8 8 0 100 16A8 8 0 0010 2zM4 10a6 6 0 1112 0A6 6 0 014 10z" clip-rule="evenodd"/>
              </svg>
              Arrastrar punto
            </button>
          </div>

          <!-- Campos extra: barco -->
          <div id="lm-barco-fields" class="lm-hidden">
            <div class="lm-divider">Datos del barco</div>
            <div class="lm-field">
              <label class="lm-label">Matrícula</label>
              <input class="lm-input" type="text" name="matricula" placeholder="7A-1234-01">
            </div>
            <div class="lm-field-group">
              <div class="lm-field lm-field--half">
                <label class="lm-label">Eslora (m)</label>
                <input class="lm-input" type="number" name="eslora" step="0.01" min="0" placeholder="0.00">
              </div>
              <div class="lm-field lm-field--half">
                <label class="lm-label">Manga (m)</label>
                <input class="lm-input" type="number" name="manga" step="0.01" min="0" placeholder="0.00">
              </div>
            </div>
            <div class="lm-field">
              <label class="lm-label">Propietario</label>
              <input class="lm-input" type="text" name="propietario" placeholder="Nombre del propietario">
            </div>
            <div class="lm-field">
              <label class="lm-label">Tipo de barco</label>
              <select class="lm-input" name="tipoBarco">
                <option value="velero">Velero</option>
                <option value="motor">Motor</option>
                <option value="catamaran">Catamarán</option>
                <option value="superyacht">Superyacht</option>
                <option value="otro" selected>Otro</option>
              </select>
            </div>
          </div>

          <div class="lm-form-error lm-hidden" id="lm-form-error"></div>

          <div class="lm-form-actions">
            <button type="button" class="lm-btn lm-btn--secondary" id="lm-cancel-form">Cancelar</button>
            <button type="submit" class="lm-btn lm-btn--primary" id="lm-save-btn">Guardar</button>
          </div>

        </form>
      </div>
    `;

    document.body.appendChild(panel);
    this._el = panel;

    // Modal de confirmación de borrado
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
      <div class="confirm-dialog">
        <div class="confirm-icon">
          <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
        </div>
        <p class="confirm-title">Eliminar ubicación</p>
        <p class="confirm-message">¿Seguro que quieres eliminar <span class="confirm-name" id="lm-confirm-name"></span>? Esta acción no se puede deshacer.</p>
        <div class="confirm-actions">
          <button class="confirm-btn confirm-btn--cancel" id="lm-confirm-cancel">Cancelar</button>
          <button class="confirm-btn confirm-btn--danger" id="lm-confirm-ok">Eliminar</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    this._confirmOverlay = overlay;

    this._bindPanelEvents();
  }

  _bindNavBtn() {
    const btn = document.getElementById('lm-nav-btn');
    if (btn) btn.addEventListener('click', () => this.toggle());
  }

  _bindPanelEvents() {
    this._el.querySelector('#lm-close').addEventListener('click', () => this.close());
    this._el.querySelector('#lm-new').addEventListener('click', () => this._showForm(null));
    this._el.querySelector('#lm-back').addEventListener('click', () => this._showList());
    this._el.querySelector('#lm-cancel-form').addEventListener('click', () => this._showList());

    // Mostrar campos extra para barco
    this._el.querySelector('[name="tipo"]').addEventListener('change', e => {
      this._toggleBarcoFields(e.target.value === 'barco');
    });

    // Marcar en mapa
    this._el.querySelector('#lm-pick-btn').addEventListener('click', () => this._startPickMode());

    // Arrastrar punto
    this._el.querySelector('#lm-drag-btn').addEventListener('click', () => this._startDragMode());

    // Submit formulario
    this._el.querySelector('#lm-form').addEventListener('submit', e => {
      e.preventDefault();
      this._save();
    });

    // ESC cancela pick mode
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape') {
        this._cancelPickMode();
      }
    });
  }

  // ─── Toggle panel ─────────────────────────────────────
  toggle() {
    this._isOpen ? this.close() : this.open();
  }

  open() {
    window._userManager?.close();
    this._isOpen = true;
    this._el.classList.add('lm-panel--open');
    document.getElementById('lm-nav-btn')?.classList.add('active');
    this._showList();
    this._loadList();
  }

  close() {
    this._isOpen = false;
    this._el.classList.remove('lm-panel--open');
    document.getElementById('lm-nav-btn')?.classList.remove('active');
    this._cancelPickMode();
    this._map.removeTempMarker();
  }

  // ─── Vistas ───────────────────────────────────────────
  _showList() {
    this._editId = null;
    this._cancelPickMode();
    this._map.removeTempMarker();

    this._el.querySelector('#lm-list-view').classList.remove('lm-hidden');
    this._el.querySelector('#lm-form-view').classList.add('lm-hidden');
    this._el.querySelector('#lm-back').classList.add('lm-hidden');
    this._el.querySelector('#lm-new').classList.remove('lm-hidden');
    this._el.querySelector('#lm-title').textContent = 'Ubicaciones';
  }

  _showForm(ubicacion = null) {
    this._editId = ubicacion ? ubicacion._id : null;

    this._el.querySelector('#lm-list-view').classList.add('lm-hidden');
    this._el.querySelector('#lm-form-view').classList.remove('lm-hidden');
    this._el.querySelector('#lm-back').classList.remove('lm-hidden');
    this._el.querySelector('#lm-new').classList.add('lm-hidden');
    this._el.querySelector('#lm-title').textContent = ubicacion ? 'Editar ubicación' : 'Nueva ubicación';
    this._el.querySelector('#lm-form-error').classList.add('lm-hidden');

    const form = this._el.querySelector('#lm-form');
    form.reset();

    if (ubicacion) {
      form.nombre.value      = ubicacion.nombre            || '';
      form.tipo.value        = ubicacion.tipo              || '';
      form.descripcion.value = ubicacion.descripcion       || '';
      form.lat.value         = ubicacion.coordenadas?.lat  ?? '';
      form.lng.value         = ubicacion.coordenadas?.lng  ?? '';
      if (ubicacion.tipo === 'barco') {
        form.matricula.value   = ubicacion.matricula   || '';
        form.eslora.value      = ubicacion.eslora      || '';
        form.manga.value       = ubicacion.manga       || '';
        form.propietario.value = ubicacion.propietario || '';
        form.tipoBarco.value   = ubicacion.tipoBarco   || 'otro';
      }
      this._toggleBarcoFields(ubicacion.tipo === 'barco');
    } else {
      this._toggleBarcoFields(false);
    }
  }

  _toggleBarcoFields(show) {
    const fields = this._el.querySelector('#lm-barco-fields');
    show ? fields.classList.remove('lm-hidden') : fields.classList.add('lm-hidden');
  }

  // ─── Carga de datos ───────────────────────────────────
  async _loadList() {
    const listEl = this._el.querySelector('#lm-list');
    listEl.innerHTML = '<div class="lm-loading">Cargando ubicaciones...</div>';
    try {
      this._data = await apiClient.get('/ubicaciones');
      this._renderList();
    } catch (err) {
      listEl.innerHTML = '<div class="lm-error">Error al cargar ubicaciones</div>';
    }
  }

  _renderList() {
    const listEl = this._el.querySelector('#lm-list');

    if (!this._data.length) {
      listEl.innerHTML = '<div class="lm-empty">No hay ubicaciones registradas.<br>Crea la primera con el botón + Nueva.</div>';
      return;
    }

    listEl.innerHTML = '';
    this._data.forEach(u => {
      const tipo = MapController.TIPOS[u.tipo] || MapController.TIPOS.base;
      const item = document.createElement('div');
      item.className = 'lm-item';
      item.innerHTML = `
        <div class="lm-item-marker" style="background:${tipo.color}">
          <span>${tipo.symbol}</span>
        </div>
        <div class="lm-item-info">
          <span class="lm-item-name">${u.nombre}</span>
          <span class="lm-item-meta">${tipo.label} · ${Number(u.coordenadas.lat).toFixed(5)}, ${Number(u.coordenadas.lng).toFixed(5)}</span>
        </div>
        <div class="lm-item-actions">
          <button class="lm-icon-btn lm-icon-btn--edit" title="Editar">
            <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-2.207 2.207L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
            </svg>
          </button>
          <button class="lm-icon-btn lm-icon-btn--delete" title="Eliminar">
            <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
      `;

      item.querySelector('.lm-icon-btn--edit').addEventListener('click', () => this._showForm(u));
      item.querySelector('.lm-icon-btn--delete').addEventListener('click', () => this._confirmDelete(u));
      listEl.appendChild(item);
    });
  }

  // ─── CRUD ─────────────────────────────────────────────
  async _save() {
    const form    = this._el.querySelector('#lm-form');
    const saveBtn = this._el.querySelector('#lm-save-btn');
    const errEl   = this._el.querySelector('#lm-form-error');

    errEl.classList.add('lm-hidden');

    const tipo = form.tipo.value;
    const body = {
      nombre:      form.nombre.value.trim(),
      tipo,
      coordenadas: {
        lat: parseFloat(form.lat.value),
        lng: parseFloat(form.lng.value)
      }
    };

    if (form.descripcion.value.trim()) {
      body.descripcion = form.descripcion.value.trim();
    }

    if (tipo === 'barco') {
      if (form.matricula.value.trim())   body.matricula   = form.matricula.value.trim();
      if (form.eslora.value)             body.eslora      = parseFloat(form.eslora.value);
      if (form.manga.value)              body.manga       = parseFloat(form.manga.value);
      if (form.propietario.value.trim()) body.propietario = form.propietario.value.trim();
      body.tipoBarco = form.tipoBarco.value;
    }

    saveBtn.disabled    = true;
    saveBtn.textContent = 'Guardando...';

    try {
      let saved;
      if (this._editId) {
        saved = await apiClient.put(`/ubicaciones/${this._editId}`, body);
        this._map.refreshMarker(saved);
      } else {
        saved = await apiClient.post('/ubicaciones', body);
        this._map.addMarkerFromData(saved);
      }
      this._map.removeTempMarker();
      this._showList();
      await this._loadList();
    } catch (err) {
      errEl.textContent = err.message || 'Error al guardar';
      errEl.classList.remove('lm-hidden');
    } finally {
      saveBtn.disabled    = false;
      saveBtn.textContent = 'Guardar';
    }
  }

  _confirmDelete(u) {
    const overlay = this._confirmOverlay;
    overlay.querySelector('#lm-confirm-name').textContent = `"${u.nombre}"`;
    overlay.classList.add('visible');

    const okBtn     = overlay.querySelector('#lm-confirm-ok');
    const cancelBtn = overlay.querySelector('#lm-confirm-cancel');

    const close = () => {
      overlay.classList.remove('visible');
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
      overlay.removeEventListener('click', onOverlayClick);
    };

    const onOk          = () => { close(); this._delete(u._id); };
    const onCancel      = () => close();
    const onOverlayClick = (e) => { if (e.target === overlay) onCancel(); };

    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
    overlay.addEventListener('click', onOverlayClick);
  }

  async _delete(id) {
    try {
      await apiClient.delete(`/ubicaciones/${id}`);
      this._map.removeMarkerById(id);
      await this._loadList();
    } catch (err) {
      alert('Error al eliminar: ' + (err.message || err));
    }
  }

  // ─── Interacción con el mapa ──────────────────────────
  _startPickMode() {
    // Ocultar panel temporalmente para ver el mapa
    this._el.classList.remove('lm-panel--open');
    this._pickBar.classList.add('visible');

    this._map.enterPickMode((lat, lng) => {
      this._el.classList.add('lm-panel--open');
      this._pickBar.classList.remove('visible');

      const form = this._el.querySelector('#lm-form');
      form.lat.value = lat.toFixed(7);
      form.lng.value = lng.toFixed(7);

      // Colocar marcador arrastrable en la posición elegida
      this._map.addDraggableTempMarker(lat, lng, (newLat, newLng) => {
        form.lat.value = newLat.toFixed(7);
        form.lng.value = newLng.toFixed(7);
      });
    });
  }

  _startDragMode() {
    const form = this._el.querySelector('#lm-form');
    const lat  = parseFloat(form.lat.value)  || MapController.DEFAULT_CENTER[0];
    const lng  = parseFloat(form.lng.value)  || MapController.DEFAULT_CENTER[1];

    form.lat.value = lat.toFixed(7);
    form.lng.value = lng.toFixed(7);

    this._map.addDraggableTempMarker(lat, lng, (newLat, newLng) => {
      form.lat.value = newLat.toFixed(7);
      form.lng.value = newLng.toFixed(7);
    });
  }

  _cancelPickMode() {
    this._map.exitPickMode();
    this._pickBar.classList.remove('visible');
    if (this._isOpen) {
      this._el.classList.add('lm-panel--open');
    }
  }
}
