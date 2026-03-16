class CacheService {
  static get(key) {
    try { return JSON.parse(localStorage.getItem(key)); }
    catch { return null; }
  }
  static set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  }
  static remove(key) {
    localStorage.removeItem(key);
  }

  static CLAVE_IDIOMA = 'app_language';

    static guardarIdioma(idIdioma) {
        localStorage.setItem(this.CLAVE_IDIOMA, idIdioma);
    }

    static obtenerIdioma() {
        // Devuelve el idioma guardado, o "1" (Español) por defecto
        return localStorage.getItem(this.CLAVE_IDIOMA) || "1";
    }
}