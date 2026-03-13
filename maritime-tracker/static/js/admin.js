const Admin = (() => {

  // Rastrea qué marcadores están en modo drag actualmente
  const dragging = {};

  function openPanel(boats, locations, onBoatChange, onLocationChange) {
    let panel = document.getElementById('admin-panel');
    if (!panel) {
      panel = document.createElement('div');
      panel.id = 'admin-panel';
      document.body.appendChild(panel);
    }

    panel.innerHTML = `
      <div class="admin-header">
        <span>⚙️ Administración</span>
        <button class="admin-close" onclick="Admin.closePanel()">✕</button>
      </div>

      <div class="admin-body">

        <div class="admin-section-title">⛵ Barcos</div>
        <div id="admin-boats">
          ${boats.map(boat => `
            <div class="admin-card" data-id="${boat.id}">
              <div class="admin-row">
                <input
                  class="admin-input admin-name"
                  data-id="${boat.id}" data-type="boat" data-field="name"
                  value="${boat.name}" placeholder="Nombre"
                />
                <label class="admin-toggle">
                  <input type="checkbox" data-id="${boat.id}" data-type="boat" data-field="active" ${boat.active ? 'checked' : ''}/>
                  <span class="admin-toggle-label">${boat.active ? '🟢' : '🔴'}</span>
                </label>
              </div>
              <div class="admin-row admin-row-coords">
                <input
                  class="admin-input admin-input-coord"
                  data-id="${boat.id}" data-type="boat" data-field="lat"
                  value="${boat.current.lat}" placeholder="Lat" type="number" step="any"
                />
                <input
                  class="admin-input admin-input-coord"
                  data-id="${boat.id}" data-type="boat" data-field="lng"
                  value="${boat.current.lng}" placeholder="Lng" type="number" step="any"
                />
                <button class="admin-btn-drag" data-id="${boat.id}" data-type="boat" title="Arrastrar en mapa">
                  🖱️
                </button>
              </div>
              <div class="admin-row">
                <button class="admin-btn-center" data-lat="${boat.current.lat}" data-lng="${boat.current.lng}">
                  🎯 Ver
                </button>
                <button class="admin-btn-save" data-id="${boat.id}" data-type="boat">
                  💾 Guardar
                </button>
              </div>
            </div>
          `).join('')}
        </div>

        <div class="admin-section-title">🏢 Bases</div>
        <div id="admin-locations">
          ${locations.map(loc => `
            <div class="admin-card" data-id="${loc.id}">
              <div class="admin-row">
                <input
                  class="admin-input admin-name"
                  data-id="${loc.id}" data-type="location" data-field="name"
                  value="${loc.name}" placeholder="Nombre"
                />
              </div>
              <div class="admin-row admin-row-coords">
                <input
                  class="admin-input admin-input-coord"
                  data-id="${loc.id}" data-type="location" data-field="lat"
                  value="${loc.lat}" placeholder="Lat" type="number" step="any"
                />
                <input
                  class="admin-input admin-input-coord"
                  data-id="${loc.id}" data-type="location" data-field="lng"
                  value="${loc.lng}" placeholder="Lng" type="number" step="any"
                />
                <button class="admin-btn-drag" data-id="${loc.id}" data-type="location" title="Arrastrar en mapa">
                  🖱️
                </button>
              </div>
              <div class="admin-row">
                <button class="admin-btn-center" data-lat="${loc.lat}" data-lng="${loc.lng}">
                  🎯 Ver
                </button>
                <button class="admin-btn-save" data-id="${loc.id}" data-type="location">
                  💾 Guardar
                </button>
              </div>
            </div>
          `).join('')}
        </div>

      </div>
    `;

    // Botones "Ver en mapa"
    panel.querySelectorAll('.admin-btn-center').forEach(btn => {
      btn.addEventListener('click', () => {
        MapModule.centerOn(parseFloat(btn.dataset.lat), parseFloat(btn.dataset.lng));
      });
    });

    // Botones "Guardar"
    panel.querySelectorAll('.admin-btn-save').forEach(btn => {
      btn.addEventListener('click', () => {
        const id   = btn.dataset.id;
        const type = btn.dataset.type;
        const card = panel.querySelector(`.admin-card[data-id="${id}"]`);

        if (type === 'boat') {
          const name   = card.querySelector('[data-field="name"]').value.trim();
          const lat    = parseFloat(card.querySelector('[data-field="lat"]').value);
          const lng    = parseFloat(card.querySelector('[data-field="lng"]').value);
          const active = card.querySelector('[data-field="active"]').checked;
          onBoatChange(id, { name, lat, lng, active });
        } else {
          const name = card.querySelector('[data-field="name"]').value.trim();
          const lat  = parseFloat(card.querySelector('[data-field="lat"]').value);
          const lng  = parseFloat(card.querySelector('[data-field="lng"]').value);
          onLocationChange(id, { name, lat, lng });
        }

        // Si estaba en modo drag, desactivarlo al guardar
        if (dragging[id]) toggleDrag(id, btn.dataset.type);
      });
    });

    // Toggle activo/inactivo
    panel.querySelectorAll('[data-field="active"]').forEach(checkbox => {
      checkbox.addEventListener('change', () => {
        checkbox.nextElementSibling.textContent = checkbox.checked ? '🟢' : '🔴';
      });
    });

    // Botones drag
    panel.querySelectorAll('.admin-btn-drag').forEach(btn => {
      btn.addEventListener('click', () => {
        toggleDrag(btn.dataset.id, btn.dataset.type, btn);
      });
    });

    panel.classList.add('open');
  }

  function toggleDrag(id, type, btn) {
    // Buscar el botón si no se pasó directamente
    if (!btn) {
      btn = document.querySelector(`.admin-btn-drag[data-id="${id}"]`);
    }

    if (dragging[id]) {
      // Desactivar drag
      MapModule.disableDrag(id, type);
      dragging[id] = false;
      btn.classList.remove('drag-active');
      btn.title = 'Arrastrar en mapa';
    } else {
      // Activar drag
      MapModule.enableDrag(id, type, onDragEnd);
      dragging[id] = true;
      btn.classList.add('drag-active');
      btn.title = 'Click para salir del modo arrastrar';
    }
  }

  // Se llama cuando se suelta el marcador en el mapa
  function onDragEnd(id, type, lat, lng) {
    // Actualizar los inputs de coordenadas automáticamente
    MapModule.updateAdminInputs(id, lat, lng);
  }

  function closePanel() {
    // Desactivar todos los drags activos antes de cerrar
    Object.keys(dragging).forEach(id => {
      if (dragging[id]) {
        const type = document.querySelector(`.admin-btn-drag[data-id="${id}"]`)?.dataset.type;
        if (type) MapModule.disableDrag(id, type);
        dragging[id] = false;
      }
    });
    const panel = document.getElementById('admin-panel');
    if (panel) panel.classList.remove('open');
  }

  return { openPanel, closePanel };

})();