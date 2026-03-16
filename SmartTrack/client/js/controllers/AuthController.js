class AuthController {
  constructor() {
    this.form    = document.querySelector('form');
    this.btnLogin = document.querySelector('.btn-login');
    this._checkAlreadyLoggedIn();
    this._bindEvents();
  }

  _checkAlreadyLoggedIn() {
    if (AuthService.isLoggedIn()) {
      window.location.href = 'index.html';
    }
  }

  _bindEvents() {
    if (!this.form) return;
    this.form.addEventListener('submit', (e) => this._handleSubmit(e));
  }

  async _handleSubmit(e) {
    e.preventDefault();
    const email    = document.getElementById('usuario').value.trim();
    const password = document.getElementById('contrasena').value;

    if (!email || !password) {
      this._showError('Por favor, rellena todos los campos.');
      return;
    }

    this._setLoading(true);
    this._clearError();

    try {
      await AuthService.login(email, password);
      window.location.href = 'index.html';
    } catch (error) {
      this._showError(error.message);
    } finally {
      this._setLoading(false);
    }
  }

  _setLoading(loading) {
    if (!this.btnLogin) return;
    if (loading) {
      this.btnLogin.dataset.originalText = this.btnLogin.textContent;
      this.btnLogin.textContent = '...';
      this.btnLogin.disabled = true;
    } else {
      if (this.btnLogin.dataset.originalText) {
        this.btnLogin.textContent = this.btnLogin.dataset.originalText;
      }
      this.btnLogin.disabled = false;
    }
  }

  _showError(message) {
    let errorEl = document.getElementById('login-error');
    if (!errorEl) {
      errorEl = document.createElement('p');
      errorEl.id = 'login-error';
      errorEl.style.cssText = 'color:#dc3545; font-size:clamp(12px,1vw,15px); margin-top:-10px; margin-bottom:15px;';
      this.btnLogin.before(errorEl);
    }
    errorEl.textContent = message;
  }

  _clearError() {
    const errorEl = document.getElementById('login-error');
    if (errorEl) errorEl.textContent = '';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  new AuthController();
});
