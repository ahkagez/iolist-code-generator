// Responsabilidad: toda la comunicación con el servidor Python.
// Ningún otro módulo hace fetch directamente.

const BASE_URL = 'http://localhost:5000/api';

async function request(path, method = 'GET', body = null) {
    const options = {
        method,
        headers: { 'Content-Type': 'application/json' }
    };
    if (body) options.body = JSON.stringify(body);
    const response = await fetch(BASE_URL + path, options);
    return response.json();
}

const api = {
    getEmployees: () => fetch('../data/employees.json').then(r => r.json()),
    getBoats:     () => fetch('../data/yachts.json').then(r => r.json()),
    getLocations: () => fetch('../data/locations.json').then(r => r.json()),

    getState:       ()                         => request('/state'),
    moveUser:       (userId, locationId)       => request('/move', 'POST', { user_id: userId, location_id: locationId }),
    updateUser:     (userId, data)             => request(`/user/${userId}`, 'PUT', data),
    addLocation:    (name, type)               => request('/locations', 'POST', { name, type }),
    deleteLocation: (locationId)               => request(`/locations/${locationId}`, 'DELETE'),
};