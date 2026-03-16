class ApiClient {
  #baseUrl;

  constructor(baseUrl) {
    this.#baseUrl = baseUrl;
  }

  #getHeaders() {
    const headers = { 'Content-Type': 'application/json' };
    const token = CacheService.get('auth_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
    return headers;
  }

  #processResponse(response, data) {
    if (response.status === 401) {
      const hadToken = !!CacheService.get('auth_token');
      CacheService.remove('auth_token');
      CacheService.remove('auth_user');
      if (hadToken) window.location.replace('login.html');
    }
    if (!response.ok) throw new Error(data.error || 'Error en la petición');
    return data;
  }

  async post(endpoint, body) {
    const response = await fetch(`${this.#baseUrl}${endpoint}`, {
      method: 'POST',
      headers: this.#getHeaders(),
      body: JSON.stringify(body)
    });
    const data = await response.json();
    return this.#processResponse(response, data);
  }

  async get(endpoint) {
    const response = await fetch(`${this.#baseUrl}${endpoint}`, {
      method: 'GET',
      headers: this.#getHeaders()
    });
    const data = await response.json();
    return this.#processResponse(response, data);
  }

  async put(endpoint, body) {
    const response = await fetch(`${this.#baseUrl}${endpoint}`, {
      method: 'PUT',
      headers: this.#getHeaders(),
      body: JSON.stringify(body)
    });
    const data = await response.json();
    return this.#processResponse(response, data);
  }

  async patch(endpoint, body) {
    const response = await fetch(`${this.#baseUrl}${endpoint}`, {
      method: 'PATCH',
      headers: this.#getHeaders(),
      body: JSON.stringify(body)
    });
    const data = await response.json();
    return this.#processResponse(response, data);
  }

  async delete(endpoint) {
    const response = await fetch(`${this.#baseUrl}${endpoint}`, {
      method: 'DELETE',
      headers: this.#getHeaders()
    });
    const data = await response.json();
    return this.#processResponse(response, data);
  }
}

const apiClient = new ApiClient(API_BASE_URL);
