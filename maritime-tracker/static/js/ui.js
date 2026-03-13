// ui.js
const UI = (() => {

  function getInitials(name, surname) {
    return `${name[0]}${surname[0]}`.toUpperCase();
  }

  function togglePanel() {
    const panel = document.getElementById('side-panel');
    const btn   = document.getElementById('toggle-btn');
    panel.classList.toggle('collapsed');
    btn.classList.toggle('collapsed');
    btn.textContent = panel.classList.contains('collapsed') ? '❯' : '❮';
  }

  // Resuelve el nombre de current_location buscando en locations y boats
  function resolveLocationName(locationId, locations, boats) {
    const all = [...locations, ...boats];
    const found = all.find(l => l.id === locationId);
    return found ? found.name : '?';
  }

  function renderEmployeeList(employees, locations, boats, onEmployeeClick) {
    const container = document.getElementById('employee-list');

    container.innerHTML = employees.map(emp => `
      <div class="employee-card" data-id="${emp.id}">
        <div class="employee-avatar" style="background: ${emp.color}">
          ${getInitials(emp.name, emp.surname)}
        </div>
        <div class="employee-info">
          <div class="employee-name">${emp.name} ${emp.surname}</div>
          <div class="employee-location">
            📍 ${resolveLocationName(emp.current_location, locations, boats)}
          </div>
          ${emp.description
            ? `<div class="employee-description">${emp.description}</div>`
            : ''
          }
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.employee-card').forEach(card => {
      card.addEventListener('click', () => onEmployeeClick(card.dataset.id));
    });
  }

  function openEmployeePanel(employee, boats, locations, onLocationSelect, onDescriptionChange) {
    let panel = document.getElementById('detail-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'detail-panel';
      document.body.appendChild(panel);
    }

    const currentName = resolveLocationName(employee.current_location, locations, boats);

    panel.innerHTML = `
      <button class="detail-close" onclick="UI.closeDetailPanel()">✕</button>
      <div class="detail-avatar" style="background: ${employee.color}">
        ${getInitials(employee.name, employee.surname)}
      </div>
      <div class="detail-name">${employee.name} ${employee.surname}</div>
      <div class="detail-base">Base: ${employee.base_location}</div>
      <div class="detail-current">📍 Ahora en: ${currentName}</div>

      <div class="detail-actions">
        <button class="detail-btn" onclick="UI.openLocationModal('${employee.id}')">
          📍 Cambiar ubicación
        </button>
      </div>

      <div class="detail-desc-section">
        <label class="detail-desc-label">Descripción</label>
        <textarea
          id="detail-desc-input"
          class="detail-desc-input"
          placeholder="Sin descripción..."
        >${employee.description || ''}</textarea>
        <button class="detail-btn" onclick="UI.saveDescription('${employee.id}')">
          💾 Guardar descripción
        </button>
      </div>
    `;

    panel._employeeId          = employee.id;
    panel._boats               = boats;
    panel._locations           = locations;
    panel._onLocationSelect    = onLocationSelect;
    panel._onDescriptionChange = onDescriptionChange;

    panel.classList.add('open');
  }

  function saveDescription(employeeId) {
    const panel = document.getElementById('detail-panel');
    const value = document.getElementById('detail-desc-input').value.trim();
    panel._onDescriptionChange(employeeId, value);
  }

  function closeDetailPanel() {
    const panel = document.getElementById('detail-panel');
    if (panel) panel.classList.remove('open');
  }

  function openLocationModal(employeeId) {
    const panel            = document.getElementById('detail-panel');
    const boats            = panel._boats;
    const locations        = panel._locations;
    const onLocationSelect = panel._onLocationSelect;

    let modal = document.getElementById('location-modal');
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'location-modal';
      document.body.appendChild(modal);
    }

    modal.innerHTML = `
      <div class="modal-box">
        <h3>📍 Seleccionar ubicación</h3>
        <div class="modal-type-btns">
          <button class="type-btn" data-type="base">🏢 Base</button>
          <button class="type-btn" data-type="yacht">⛵ Yate</button>
        </div>
        <div id="modal-options"></div>
        <button class="modal-cancel" onclick="UI.closeLocationModal()">Cancelar</button>
      </div>
    `;

    modal.querySelectorAll('.type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        modal.querySelectorAll('.type-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const options          = btn.dataset.type === 'base' ? locations : boats;
        const optionsContainer = document.getElementById('modal-options');

        optionsContainer.innerHTML = options.map(opt => `
          <button class="location-option" data-loc-id="${opt.id}">
            ${opt.name}
          </button>
        `).join('');

        optionsContainer.querySelectorAll('.location-option').forEach(opt => {
          opt.addEventListener('click', () => {
            onLocationSelect(employeeId, opt.dataset.locId);
          });
        });
      });
    });

    modal.classList.add('open');
  }

  function closeLocationModal() {
    const modal = document.getElementById('location-modal');
    if (modal) modal.classList.remove('open');
  }

  function showMarkerPopup(location, employees, point) {
    closeMarkerPopup();

    const popup = document.createElement('div');
    popup.id = 'marker-popup';

    const windowWidth = window.innerWidth;
    const popupWidth  = 220;
    const margin      = 16;
    const goLeft      = point.x + popupWidth + margin > windowWidth;

    popup.style.top  = `${point.y}px`;
    popup.style.left = goLeft
      ? `${point.x - popupWidth - margin}px`
      : `${point.x + margin}px`;

    popup.innerHTML = `
      <div class="mp-header">
        <span class="mp-title">${location.name}</span>
        <button class="mp-close" onclick="UI.closeMarkerPopup()">✕</button>
      </div>
      ${location.image ? `
        <div class="mp-image-wrap">
          <img src="${location.image}" class="mp-image" alt="${location.name}"
            onclick="UI.openImageViewer('${location.image}')" />
        </div>
      ` : ''}
      <div class="mp-body">
        ${employees.length === 0
          ? `<p class="mp-empty">Nadie aquí ahora</p>`
          : employees.map(emp => `
              <div class="mp-employee">
                <div class="mp-avatar" style="background: ${emp.color}">
                  ${emp.name[0]}${emp.surname[0]}
                </div>
                <span class="mp-name">${emp.name} ${emp.surname}</span>
              </div>
            `).join('')
        }
      </div>
    `;

    document.body.appendChild(popup);
  }

  function closeMarkerPopup() {
    const existing = document.getElementById('marker-popup');
    if (existing) existing.remove();
  }

  function openImageViewer(src) {
    closeImageViewer();
    const viewer = document.createElement('div');
    viewer.id = 'image-viewer';
    viewer.innerHTML = `<img src="${src}" class="iv-img" alt="Imagen ampliada" />`;
    viewer.addEventListener('click', (e) => {
      if (e.target !== viewer.querySelector('.iv-img')) closeImageViewer();
    });
    document.body.appendChild(viewer);
  }

  function closeImageViewer() {
    const existing = document.getElementById('image-viewer');
    if (existing) existing.remove();
  }

  return {
    togglePanel,
    renderEmployeeList,
    openEmployeePanel,
    saveDescription,
    closeDetailPanel,
    openLocationModal,
    closeLocationModal,
    showMarkerPopup,
    closeMarkerPopup,
    openImageViewer,
    closeImageViewer,
  };

})();