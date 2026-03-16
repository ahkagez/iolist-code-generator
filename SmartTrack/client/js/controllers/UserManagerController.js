class UserManagerController {

  static CACHE_KEY     = 'um_collapsed';
  static ROL_LABELS    = { admin: 'Admin', supervisor: 'Supervisor', operador: 'Operador' };
  static AVATAR_COLORS = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#06B6D4','#84CC16'];

  constructor() {
    this._data      = [];
    this._depts     = [];
    this._editId    = null;
    this._isOpen    = false;
    this._el        = null;
    this._confirmOverlay = null;

    const saved = CacheService.get(UserManagerController.CACHE_KEY);
    this._collapsed = new Set(Array.isArray(saved) ? saved : []);

    this._buildDOM();
    this._bindNavBtn();
  }

  // ─── DOM ─────────────────────────────────────────────────
  _buildDOM() {
    const panel = document.createElement('div');
    panel.className = 'um-panel';
    panel.id = 'um-panel';
    panel.innerHTML = `
      <div class="um-header">
        <button class="um-back-btn um-hidden" id="um-back">‹</button>
        <h2 class="um-title" id="um-title">Gestión de Usuarios</h2>
        <div class="um-header-actions">
          <button class="um-btn-new" id="um-new">+ Nuevo</button>
          <button class="um-close-btn" id="um-close">✕</button>
        </div>
      </div>

      <div class="um-view" id="um-list-view">
        <div class="um-list" id="um-list"></div>
      </div>

      <div class="um-view um-hidden" id="um-form-view">
        <form class="um-form" id="um-form" autocomplete="off">

          <p class="um-section-title">Datos personales</p>

          <div class="um-field-row">
            <div class="um-field">
              <label class="um-label">Nombre *</label>
              <input class="um-input" type="text" name="nombre" required placeholder="Nombre">
            </div>
            <div class="um-field">
              <label class="um-label">Primer apellido *</label>
              <input class="um-input" type="text" name="prApellido" required placeholder="Apellido">
            </div>
          </div>

          <div class="um-field-row">
            <div class="um-field">
              <label class="um-label">Segundo apellido</label>
              <input class="um-input" type="text" name="sgApellido" placeholder="Opcional">
            </div>
            <div class="um-field">
              <label class="um-label">Teléfono</label>
              <input class="um-input" type="tel" name="telefono" placeholder="+34 600 000 000">
            </div>
          </div>

          <div class="um-field-row">
            <div class="um-field">
              <label class="um-label">Cargo</label>
              <input class="um-input" type="text" name="cargo" placeholder="Ej: Técnico naval">
            </div>
            <div class="um-field">
              <label class="um-label">Departamento *</label>
              <select class="um-input" name="departamentoId" id="um-dept-select" required>
                <option value="">— Seleccionar —</option>
              </select>
            </div>
          </div>

          <p class="um-section-title" id="um-account-title">Cuenta de acceso</p>

          <div class="um-field">
            <label class="um-label">Email <span id="um-email-req"></span></label>
            <input class="um-input" type="email" name="email" id="um-email-input" placeholder="usuario@empresa.com">
          </div>

          <div class="um-field-row">
            <div class="um-field">
              <label class="um-label">Contraseña <span id="um-pass-req"></span></label>
              <input class="um-input" type="password" name="password" id="um-pass-input" placeholder="Mínimo 6 caracteres">
            </div>
            <div class="um-field">
              <label class="um-label">Rol</label>
              <select class="um-input" name="rol">
                <option value="operador">Operador</option>
                <option value="supervisor">Supervisor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
          </div>

          <div class="um-form-error um-hidden" id="um-form-error"></div>

          <div class="um-form-actions">
            <button type="button" class="um-btn um-btn--secondary" id="um-cancel-form">Cancelar</button>
            <button type="submit"  class="um-btn um-btn--primary"   id="um-save-btn">Guardar</button>
          </div>

        </form>
      </div>
    `;

    document.body.appendChild(panel);
    this._el = panel;

    // Modal de confirmación
    const overlay = document.createElement('div');
    overlay.className = 'confirm-overlay';
    overlay.innerHTML = `
      <div class="confirm-dialog">
        <div class="confirm-icon">
          <svg viewBox="0 0 20 20" fill="currentColor" width="22" height="22">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
        </div>
        <p class="confirm-title">Eliminar empleado</p>
        <p class="confirm-message">¿Seguro que quieres eliminar a <span class="confirm-name" id="um-confirm-name"></span>? Se eliminará su registro y su cuenta de acceso si la tiene. Esta acción no se puede deshacer.</p>
        <div class="confirm-actions">
          <button class="confirm-btn confirm-btn--cancel" id="um-confirm-cancel">Cancelar</button>
          <button class="confirm-btn confirm-btn--danger"  id="um-confirm-ok">Eliminar</button>
        </div>
      </div>
    `;
    document.body.appendChild(overlay);
    this._confirmOverlay = overlay;

    this._bindPanelEvents();
  }

  _bindNavBtn() {
    const btn = document.getElementById('um-nav-btn');
    if (btn) btn.addEventListener('click', () => this.toggle());
  }

  _bindPanelEvents() {
    this._el.querySelector('#um-close').addEventListener('click', () => this.close());
    this._el.querySelector('#um-new').addEventListener('click', () => this._showForm(null, null));
    this._el.querySelector('#um-back').addEventListener('click', () => this._showList());
    this._el.querySelector('#um-cancel-form').addEventListener('click', () => this._showList());
    this._el.querySelector('#um-form').addEventListener('submit', e => { e.preventDefault(); this._save(); });
  }

  // ─── Panel ───────────────────────────────────────────────
  toggle() { this._isOpen ? this.close() : this.open(); }

  open() {
    window._locationManager?.close();
    this._isOpen = true;
    this._el.classList.add('um-panel--open');
    document.getElementById('um-nav-btn')?.classList.add('active');
    this._showList();
    this._loadData();
  }

  close() {
    this._isOpen = false;
    this._el.classList.remove('um-panel--open');
    document.getElementById('um-nav-btn')?.classList.remove('active');
  }

  // ─── Vistas ──────────────────────────────────────────────
  _showList() {
    this._editId = null;
    this._el.querySelector('#um-list-view').classList.remove('um-hidden');
    this._el.querySelector('#um-form-view').classList.add('um-hidden');
    this._el.querySelector('#um-back').classList.add('um-hidden');
    this._el.querySelector('#um-new').classList.remove('um-hidden');
    this._el.querySelector('#um-title').textContent = 'Gestión de Usuarios';
  }

  // u = entry del API (empleado + cuenta). deptId = pre-selección de dept
  _showForm(u = null, deptId = null) {
    this._editId = u ? String(u._id) : null;

    this._el.querySelector('#um-list-view').classList.add('um-hidden');
    this._el.querySelector('#um-form-view').classList.remove('um-hidden');
    this._el.querySelector('#um-back').classList.remove('um-hidden');
    this._el.querySelector('#um-new').classList.add('um-hidden');
    this._el.querySelector('#um-title').textContent = u ? 'Editar empleado' : 'Nuevo empleado';
    this._el.querySelector('#um-form-error').classList.add('um-hidden');

    const form      = this._el.querySelector('#um-form');
    const emailInput = this._el.querySelector('#um-email-input');
    const passInput  = this._el.querySelector('#um-pass-input');
    const emailReq   = this._el.querySelector('#um-email-req');
    const passReq    = this._el.querySelector('#um-pass-req');
    const accountTitle = this._el.querySelector('#um-account-title');

    form.reset();
    this._populateDeptSelect(deptId || u?.departamentoId?._id);

    if (u) {
      // Editar existente
      form.nombre.value      = u.nombre      || '';
      form.prApellido.value  = u.prApellido  || '';
      form.sgApellido.value  = u.sgApellido  || '';
      form.telefono.value    = u.telefono    || '';
      form.cargo.value       = u.cargo       || '';
      form.email.value       = u.email       || '';
      form.rol.value         = u.rol         || 'operador';

      if (u.hasAccount) {
        accountTitle.textContent = 'Cuenta de acceso';
        emailReq.textContent     = '';
        passReq.textContent      = '';
        passInput.placeholder    = 'Dejar vacío para no cambiar';
      } else {
        accountTitle.textContent = 'Cuenta de acceso (opcional)';
        emailReq.textContent     = '';
        passReq.textContent      = '';
        passInput.placeholder    = 'Requerida si se asigna email';
      }
      emailInput.required = false;
      passInput.required  = false;
    } else {
      // Nuevo
      accountTitle.textContent = 'Cuenta de acceso (opcional)';
      emailReq.textContent     = '';
      passReq.textContent      = '';
      passInput.placeholder    = 'Requerida si se asigna email';
      emailInput.required      = false;
      passInput.required       = false;
    }
  }

  _populateDeptSelect(selectedId = null) {
    const sel = this._el.querySelector('#um-dept-select');
    sel.innerHTML = '<option value="">— Seleccionar —</option>';
    this._depts.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d._id;
      opt.textContent = d.nombre;
      if (selectedId && String(d._id) === String(selectedId)) opt.selected = true;
      sel.appendChild(opt);
    });
  }

  // ─── Carga ───────────────────────────────────────────────
  async _loadData() {
    const listEl = this._el.querySelector('#um-list');
    listEl.innerHTML = '<div class="um-loading">Cargando...</div>';
    try {
      [this._data, this._depts] = await Promise.all([
        apiClient.get('/usuarios'),
        apiClient.get('/departamentos')
      ]);
      this._renderList();
    } catch {
      listEl.innerHTML = '<div class="um-error">Error al cargar los datos</div>';
    }
  }

  // ─── Render ──────────────────────────────────────────────
  _renderList() {
    const listEl = this._el.querySelector('#um-list');
    listEl.innerHTML = '';

    if (!this._data.length) {
      listEl.innerHTML = '<div class="um-empty">No hay empleados registrados.<br>Crea el primero con el botón + Nuevo.</div>';
      return;
    }

    // Agrupar por departamento
    const deptMap = new Map();
    this._depts.forEach(d => deptMap.set(String(d._id), { dept: d, users: [] }));

    const sinDept = [];
    this._data.forEach(u => {
      const deptId = String(u.departamentoId?._id || '');
      if (deptId && deptMap.has(deptId)) {
        deptMap.get(deptId).users.push(u);
      } else {
        sinDept.push(u);
      }
    });

    deptMap.forEach(({ dept, users }) => {
      listEl.appendChild(this._buildDeptGroup(dept, users));
    });

    if (sinDept.length) {
      const fakeDept = { _id: '__none__', nombre: 'Sin departamento', color: '#9ca3af' };
      listEl.appendChild(this._buildDeptGroup(fakeDept, sinDept, true));
    }
  }

  _buildDeptGroup(dept, users, isPhantom = false) {
    const deptIdStr = String(dept._id);
    const collapsed = this._collapsed.has(deptIdStr);

    const group = document.createElement('div');
    group.className = 'um-dept-group';
    group.dataset.deptId = deptIdStr;

    const header = document.createElement('div');
    header.className = 'um-dept-header';
    header.innerHTML = `
      <span class="um-dept-dot" style="background:${dept.color}"></span>
      <span class="um-dept-name">${dept.nombre}</span>
      <span class="um-dept-count">${users.length}</span>
      ${!isPhantom ? `<button class="um-dept-add-btn" title="Nuevo en ${dept.nombre}">+</button>` : ''}
      <svg class="um-dept-chevron ${collapsed ? 'collapsed' : ''}" viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
        <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
      </svg>
    `;

    if (!isPhantom) {
      header.querySelector('.um-dept-add-btn').addEventListener('click', e => {
        e.stopPropagation();
        this._showForm(null, dept._id);
      });
    }
    header.addEventListener('click', () => this._toggleDept(deptIdStr));

    const usersDiv = document.createElement('div');
    usersDiv.className = `um-dept-users${collapsed ? ' collapsed' : ''}`;

    users.forEach(u => usersDiv.appendChild(this._buildUserCard(u, deptIdStr)));

    // Drop zone
    if (!isPhantom) {
      group.addEventListener('dragover', e => { e.preventDefault(); group.classList.add('drag-over'); });
      group.addEventListener('dragleave', e => { if (!group.contains(e.relatedTarget)) group.classList.remove('drag-over'); });
      group.addEventListener('drop', e => {
        e.preventDefault();
        group.classList.remove('drag-over');
        const empId    = e.dataTransfer.getData('um-user-id');
        const fromDept = e.dataTransfer.getData('um-from-dept');
        if (empId && fromDept !== deptIdStr) this._changeDept(empId, deptIdStr);
      });
    }

    group.appendChild(header);
    group.appendChild(usersDiv);
    return group;
  }

  _buildUserCard(u, deptIdStr) {
    const fullName = `${u.nombre || ''} ${u.prApellido || ''}`.trim();
    const initials = this._initials(u.nombre, u.prApellido);
    const color    = this._avatarColor(u.prApellido || u.email || '');

    // Badge de rol o "sin cuenta"
    let badgeHtml;
    if (u.hasAccount) {
      const rolLabel = UserManagerController.ROL_LABELS[u.rol] || u.rol;
      badgeHtml = `<span class="um-rol-badge um-rol-badge--${u.rol}">${rolLabel}</span>`;
    } else {
      badgeHtml = `<span class="um-rol-badge um-rol-badge--none">Sin cuenta</span>`;
    }

    const meta = [u.email, u.cargo].filter(Boolean).join(' · ');

    const card = document.createElement('div');
    card.className = 'um-user-card';
    card.setAttribute('draggable', 'true');
    card.dataset.userId = String(u._id);
    card.dataset.deptId = deptIdStr;

    card.innerHTML = `
      <div class="um-user-avatar" style="background:${color}">${initials}</div>
      <div class="um-user-info">
        <span class="um-user-name">${fullName}</span>
        <span class="um-user-meta">${meta}</span>
      </div>
      ${badgeHtml}
      <div class="um-user-actions">
        <button class="um-icon-btn um-icon-btn--edit" title="Editar">
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
            <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zm-2.207 2.207L3 14.172V17h2.828l8.38-8.379-2.83-2.828z"/>
          </svg>
        </button>
        <button class="um-icon-btn um-icon-btn--delete" title="Eliminar">
          <svg viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
            <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
          </svg>
        </button>
      </div>
    `;

    card.querySelector('.um-icon-btn--edit').addEventListener('click', e => { e.stopPropagation(); this._showForm(u, null); });
    card.querySelector('.um-icon-btn--delete').addEventListener('click', e => { e.stopPropagation(); this._confirmDelete(u); });

    card.addEventListener('dragstart', e => {
      e.dataTransfer.setData('um-user-id',   String(u._id));
      e.dataTransfer.setData('um-from-dept', deptIdStr);
      e.dataTransfer.effectAllowed = 'move';
      requestAnimationFrame(() => card.classList.add('dragging'));
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      this._el.querySelectorAll('.um-dept-group.drag-over').forEach(g => g.classList.remove('drag-over'));
    });

    return card;
  }

  _toggleDept(deptIdStr) {
    this._collapsed.has(deptIdStr) ? this._collapsed.delete(deptIdStr) : this._collapsed.add(deptIdStr);
    CacheService.set(UserManagerController.CACHE_KEY, [...this._collapsed]);
    this._renderList();
  }

  // ─── CRUD ────────────────────────────────────────────────
  async _save() {
    const form    = this._el.querySelector('#um-form');
    const saveBtn = this._el.querySelector('#um-save-btn');
    const errEl   = this._el.querySelector('#um-form-error');

    errEl.classList.add('um-hidden');

    const body = {
      nombre:         form.nombre.value.trim(),
      prApellido:     form.prApellido.value.trim(),
      sgApellido:     form.sgApellido.value.trim(),
      telefono:       form.telefono.value.trim(),
      cargo:          form.cargo.value.trim(),
      email:          form.email.value.trim(),
      rol:            form.rol.value,
      departamentoId: form.departamentoId.value
    };
    if (form.password.value) body.password = form.password.value;

    saveBtn.disabled    = true;
    saveBtn.textContent = 'Guardando...';

    try {
      if (this._editId) {
        await apiClient.put(`/usuarios/${this._editId}`, body);
      } else {
        await apiClient.post('/usuarios', body);
      }
      this._showList();
      await this._loadData();
    } catch (err) {
      errEl.textContent = err.message || 'Error al guardar';
      errEl.classList.remove('um-hidden');
    } finally {
      saveBtn.disabled    = false;
      saveBtn.textContent = 'Guardar';
    }
  }

  _confirmDelete(u) {
    const fullName = `${u.nombre || ''} ${u.prApellido || ''}`.trim();
    const overlay  = this._confirmOverlay;

    overlay.querySelector('#um-confirm-name').textContent = `"${fullName}"`;
    overlay.classList.add('visible');

    const okBtn     = overlay.querySelector('#um-confirm-ok');
    const cancelBtn = overlay.querySelector('#um-confirm-cancel');

    const close = () => {
      overlay.classList.remove('visible');
      okBtn.removeEventListener('click', onOk);
      cancelBtn.removeEventListener('click', onCancel);
      overlay.removeEventListener('click', onOverlay);
    };
    const onOk      = () => { close(); this._delete(String(u._id)); };
    const onCancel  = () => close();
    const onOverlay = e => { if (e.target === overlay) onCancel(); };

    okBtn.addEventListener('click', onOk);
    cancelBtn.addEventListener('click', onCancel);
    overlay.addEventListener('click', onOverlay);
  }

  async _delete(empId) {
    try {
      await apiClient.delete(`/usuarios/${empId}`);
      await this._loadData();
    } catch (err) {
      alert('Error al eliminar: ' + (err.message || err));
    }
  }

  async _changeDept(empId, deptId) {
    try {
      await apiClient.patch(`/usuarios/${empId}/departamento`, { departamentoId: deptId });
      await this._loadData();
    } catch (err) {
      console.error('[UserManager] Error al cambiar departamento:', err);
    }
  }

  // ─── Utils ───────────────────────────────────────────────
  _initials(nombre, apellido) {
    return ((nombre?.[0] || '') + (apellido?.[0] || '')).toUpperCase() || '?';
  }

  _avatarColor(seed) {
    const c = UserManagerController.AVATAR_COLORS;
    return c[(seed?.charCodeAt(0) || 0) % c.length];
  }
}
