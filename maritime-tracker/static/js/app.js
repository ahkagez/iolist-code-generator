const App = (() => {

  const state = {
    employees: [],
    boats: [],
    locations: [],
  };

  async function init() {
    const [employees, boats, locations] = await Promise.all([
      api.getEmployees(),
      api.getBoats(),
      api.getLocations(),
    ]);

    state.employees = employees;
    state.boats     = boats;
    state.locations = locations;

    UI.renderEmployeeList(state.employees, state.locations, state.boats, onEmployeeClick);
    MapModule.renderBoats(boats, onMarkerClick);
    MapModule.renderLocations(locations, onMarkerClick);
  }

  function onEmployeeClick(employeeId) {
    const employee = state.employees.find(e => e.id === employeeId);
    UI.openEmployeePanel(employee, state.boats, state.locations, onLocationSelect, onDescriptionChange);
  }

  function onLocationSelect(employeeId, locationId) {
    const employee = state.employees.find(e => e.id === employeeId);
    employee.current_location = locationId;
    UI.renderEmployeeList(state.employees, state.locations, state.boats, onEmployeeClick);
    UI.closeLocationModal();
    UI.openEmployeePanel(employee, state.boats, state.locations, onLocationSelect, onDescriptionChange);
  }

  function onDescriptionChange(employeeId, description) {
    const employee = state.employees.find(e => e.id === employeeId);
    employee.description = description || null;
    UI.renderEmployeeList(state.employees, state.locations, state.boats, onEmployeeClick);
  }

  function onMarkerClick(locationId) {
    const allLocations = [...state.locations, ...state.boats];
    const location     = allLocations.find(l => l.id === locationId);
    const employees    = state.employees.filter(e => e.current_location === locationId);

    // Obtener coordenadas geográficas del marcador
    const type   = state.boats.find(b => b.id === locationId) ? 'boat' : 'location';
    const latLng = MapModule.getLatLng(locationId, type);
    if (!latLng) return;

    // Construir el HTML del popup
    const html = `
        <div class="mp-header">
        <span class="mp-title">${location.name}</span>
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
                <div class="mp-avatar" style="background:${emp.color}">
                    ${emp.name[0]}${emp.surname[0]}
                </div>
                <span class="mp-name">${emp.name} ${emp.surname}</span>
                </div>
            `).join('')
        }
        </div>
    `;

    MapModule.showPopup(latLng.lat, latLng.lng, html);
    }

  // Callback cuando se edita un barco desde admin
  function onBoatChange(boatId, changes) {
    const boat = state.boats.find(b => b.id === boatId);
    boat.name          = changes.name;
    boat.current.lat   = changes.lat;
    boat.current.lng   = changes.lng;
    boat.active        = changes.active;

    // Actualizar marcador en el mapa
    MapModule.updateBoatMarker(boat);

    // Refrescar lista de empleados por si el nombre del barco aparece
    UI.renderEmployeeList(state.employees, state.locations, state.boats, onEmployeeClick);
  }

  // Callback cuando se edita una base desde admin
  function onLocationChange(locId, changes) {
    const loc = state.locations.find(l => l.id === locId);
    loc.name = changes.name;
    loc.lat  = changes.lat;
    loc.lng  = changes.lng;

    MapModule.updateLocationMarker(loc);
    UI.renderEmployeeList(state.employees, state.locations, state.boats, onEmployeeClick);
  }

  // Exponer openAdmin para el botón del mapa
  function openAdmin() {
    Admin.openPanel(state.boats, state.locations, onBoatChange, onLocationChange);
  }

  // Hacerlo accesible desde el HTML
  window.openAdmin = openAdmin;

  init();

})();