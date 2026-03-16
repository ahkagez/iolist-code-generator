class SidebarController {
  // Mapeo nombre BD (minúsculas) → clave del diccionario
  static CACHE_KEY  = 'sidebar_collapsed';
  static DEPT_KEYS = {
    'mecánica':       'dept_mecanica',
    'electricidad':   'dept_electricidad',
    'pintura':        'dept_pintura',
    'administración': 'dept_administracion',
    'limpieza':       'dept_limpieza',
    'carpintería':    'dept_carpinteria',
  };

  constructor() {
    this._employees   = [];
    this._departments = new Map();
    const saved       = CacheService.get(SidebarController.CACHE_KEY);
    this._collapsed   = new Set(Array.isArray(saved) ? saved : []);
    this._query       = '';

    this._contentEl = document.querySelector('.sidebar-content');
    this._searchEl  = document.querySelector('.search-input');

    this._searchEl.addEventListener('input', (e) => {
      this._query = e.target.value.toLowerCase().trim();
      this._render();
    });

    // Re-renderizar al cambiar de idioma
    document.addEventListener('langchange', () => this._render());

    this._load();
  }

  // ─── Traducción ───────────────────────────────────────
  _t(key) {
    const lang = CacheService.obtenerIdioma();
    return Diccionarios.index?.[lang]?.[key] || key;
  }

  _deptName(dbName) {
    const key = SidebarController.DEPT_KEYS[dbName.toLowerCase()];
    return key ? this._t(key) : dbName;
  }

  // ─── Carga de datos ───────────────────────────────────
  async _load() {
    this._contentEl.innerHTML = `<p class="sidebar-loading">${this._t('loading')}</p>`;
    try {
      const employees = await apiClient.get('/empleados');
      this._employees = employees;

      employees.forEach(emp => {
        const dept = emp.departamentoId;
        if (dept && !this._departments.has(dept._id)) {
          this._departments.set(dept._id, dept);
        }
      });

      this._render();
    } catch (err) {
      this._contentEl.innerHTML = `<p class="sidebar-error">${this._t('load_error')}</p>`;
      console.error('[SidebarController]', err);
    }
  }

  // ─── Render ───────────────────────────────────────────
  _render() {
    const q         = this._query;
    const searching = q.length > 0;

    const filtered = searching
      ? this._employees.filter(emp => {
          const full = `${emp.nombre} ${emp.prApellido} ${emp.sgApellido || ''} ${emp.cargo || ''}`.toLowerCase();
          return full.includes(q);
        })
      : this._employees;

    if (filtered.length === 0) {
      this._contentEl.innerHTML = `<p class="sidebar-empty">${this._t('no_results')}</p>`;
      return;
    }

    // Agrupar por departamento respetando el orden del mapa
    const grouped = new Map();
    this._departments.forEach((_, id) => grouped.set(id, []));
    filtered.forEach(emp => {
      const id = emp.departamentoId?._id;
      if (grouped.has(id)) grouped.get(id).push(emp);
    });

    let html = '';
    grouped.forEach((employees, deptId) => {
      if (employees.length === 0) return;
      const dept      = this._departments.get(deptId);
      const collapsed = !searching && this._collapsed.has(deptId);

      html += `
        <div class="department-group">
          <h4 class="department-title" data-dept-id="${deptId}">
            <span class="dept-dot" style="background:${dept.color}"></span>
            <span class="dept-name">${this._deptName(dept.nombre)}</span>
            <span class="dept-count">${employees.length}</span>
            <svg class="dept-chevron ${collapsed ? 'collapsed' : ''}" viewBox="0 0 20 20" fill="currentColor" width="14" height="14">
              <path fill-rule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clip-rule="evenodd"/>
            </svg>
          </h4>
          <div class="department-employees ${collapsed ? 'collapsed' : ''}">
            ${employees.map(emp => this._renderCard(emp)).join('')}
          </div>
        </div>`;
    });

    this._contentEl.innerHTML = html;

    this._contentEl.querySelectorAll('.department-title').forEach(el => {
      el.addEventListener('click', () => this._toggleDept(el.dataset.deptId));
    });
  }

  _renderCard(emp) {
    const initials = `${emp.nombre[0]}${emp.prApellido[0]}`.toUpperCase();
    const fullName = `${emp.nombre} ${emp.prApellido}`;
    const isActive = !!emp.ubicacionActualId;
    const title    = isActive ? this._t('in_service') : this._t('unassigned');

    return `
      <div class="employee-card">
        <div class="emp-avatar" style="background:${this._avatarColor(emp.prApellido)}">${initials}</div>
        <div class="emp-details">
          <span class="emp-name">${fullName}</span>
          <span class="emp-position">${emp.cargo || ''}</span>
        </div>
        <div class="emp-status ${isActive ? 'active' : 'inactive'}" title="${title}"></div>
      </div>`;
  }

  _toggleDept(deptId) {
    this._collapsed.has(deptId) ? this._collapsed.delete(deptId) : this._collapsed.add(deptId);
    CacheService.set(SidebarController.CACHE_KEY, [...this._collapsed]);
    this._render();
  }

  _avatarColor(apellido) {
    const colors = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6','#EC4899','#06B6D4','#84CC16'];
    return colors[(apellido?.charCodeAt(0) || 0) % colors.length];
  }
}
