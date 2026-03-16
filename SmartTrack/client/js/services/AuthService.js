class AuthService {
  static TOKEN_KEY = 'auth_token';
  static USER_KEY  = 'auth_user';

  static async login(email, password) {
    const data = await apiClient.post('/auth/login', { email, password });
    CacheService.set(this.TOKEN_KEY, data.token);
    CacheService.set(this.USER_KEY,  data.usuario);
    return data;
  }

  static async logout() {
    try {
      await apiClient.post('/auth/logout', {});
    } finally {
      CacheService.remove(this.TOKEN_KEY);
      CacheService.remove(this.USER_KEY);
    }
  }

  static isLoggedIn() {
    return !!CacheService.get(this.TOKEN_KEY);
  }

  static getToken() {
    return CacheService.get(this.TOKEN_KEY);
  }

  static getUsuario() {
    return CacheService.get(this.USER_KEY);
  }
}
