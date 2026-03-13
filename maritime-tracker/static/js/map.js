// Responsabilidad: inicializar el mapa Leaflet y gestionar los marcadores.

const MapModule = (() => {

  const map = L.map('map', {
    center: [39.564, 2.638],
    zoom: 17,
    zoomControl: false,
  });

  L.control.zoom({ position: 'bottomright' }).addTo(map);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap &copy; CARTO',
    subdomains: 'abcd',
    maxZoom: 20,
  }).addTo(map);

  const boatMarkers     = {};
  const locationMarkers = {};

  // ── Crear icono circular con L.divIcon ──────────────────
  function createIcon(color) {
    return L.divIcon({
      className: '',
      html: `<div class="map-dot" style="background:${color};border-color:${color}"></div>`,
      iconSize: [16, 16],
      iconAnchor: [8, 8],
      tooltipAnchor: [0, -10],
      popupAnchor: [0, -10],
    });
  }

  // ── Barcos ───────────────────────────────────────────────
  function renderBoats(boats, onMarkerClick) {
    boats.forEach(boat => {
      const { lat, lng } = boat.current;

      if (boatMarkers[boat.id]) {
        if (boat.active) {
          boatMarkers[boat.id].setLatLng([lat, lng]);
          boatMarkers[boat.id].addTo(map);
        } else {
          map.removeLayer(boatMarkers[boat.id]);
        }
        return;
      }

      if (!boat.active) return;

      boatMarkers[boat.id] = L.marker([lat, lng], {
        icon: createIcon('#00b4d8'),
        draggable: false,
      })
      .addTo(map)
      .bindTooltip(boat.name, { permanent: true, direction: 'top', offset: [0, -4] })
      .on('click', () => onMarkerClick(boat.id));
    });
  }

  // ── Bases ────────────────────────────────────────────────
  function renderLocations(locations, onMarkerClick) {
    locations.forEach(loc => {
      if (locationMarkers[loc.id]) return;

      locationMarkers[loc.id] = L.marker([loc.lat, loc.lng], {
        icon: createIcon('#f4a261'),
        draggable: false,
      })
      .addTo(map)
      .bindTooltip(loc.name, { permanent: true, direction: 'top', offset: [0, -4] })
      .on('click', () => onMarkerClick(loc.id));
    });
  }

  // ── Popup nativo anclado al punto ────────────────────────
  let currentPopup = null;

  function showPopup(lat, lng, htmlContent) {
    if (currentPopup) {
      map.closePopup(currentPopup);
    }
    currentPopup = L.popup({
      closeButton: true,
      autoClose: false,
      closeOnClick: false,
      className: 'marker-popup',
      maxWidth: 280,  // ← antes 240
      minWidth: 260,
      offset: [0, -8],
    })
    .setLatLng([lat, lng])
    .setContent(htmlContent)
    .openOn(map);
  }

  function closePopup() {
    if (currentPopup) {
      map.closePopup(currentPopup);
      currentPopup = null;
    }
  }

  // ── Centrar mapa ─────────────────────────────────────────
  function centerOn(lat, lng) {
    map.setView([lat, lng], 18);
  }

  // ── Drag ─────────────────────────────────────────────────
  function enableDrag(id, type, onDragEnd) {
    const marker = type === 'boat' ? boatMarkers[id] : locationMarkers[id];
    if (!marker) return;

    const dragColor = '#e63946';
    marker.setIcon(createIcon(dragColor));
    marker.dragging.enable();

    marker.off('dragend');
    marker.on('dragend', (e) => {
      const { lat, lng } = e.target.getLatLng();
      onDragEnd(id, type, lat, lng);
    });
  }

  function disableDrag(id, type) {
    const marker = type === 'boat' ? boatMarkers[id] : locationMarkers[id];
    if (!marker) return;

    marker.dragging.disable();
    marker.off('dragend');

    const color = type === 'boat' ? '#00b4d8' : '#f4a261';
    marker.setIcon(createIcon(color));
  }

  function updateAdminInputs(id, lat, lng) {
    const card = document.querySelector(`.admin-card[data-id="${id}"]`);
    if (!card) return;
    card.querySelector('[data-field="lat"]').value = lat.toFixed(6);
    card.querySelector('[data-field="lng"]').value = lng.toFixed(6);
  }

  // ── Actualizar marcadores ─────────────────────────────────
  function updateBoatMarker(boat) {
    if (!boatMarkers[boat.id]) return;
    boatMarkers[boat.id]
      .setLatLng([boat.current.lat, boat.current.lng])
      .setTooltipContent(boat.name);
    if (boat.active) {
      boatMarkers[boat.id].addTo(map);
    } else {
      map.removeLayer(boatMarkers[boat.id]);
    }
  }

  function updateLocationMarker(loc) {
    if (!locationMarkers[loc.id]) return;
    locationMarkers[loc.id]
      .setLatLng([loc.lat, loc.lng])
      .setTooltipContent(loc.name);
  }

  // Obtener coordenadas de un punto por id
  function getLatLng(id, type) {
    const marker = type === 'boat' ? boatMarkers[id] : locationMarkers[id];
    return marker ? marker.getLatLng() : null;
  }

  return {
    renderBoats, renderLocations,
    showPopup, closePopup,
    centerOn,
    enableDrag, disableDrag, updateAdminInputs,
    updateBoatMarker, updateLocationMarker,
    getLatLng,
  };

})();