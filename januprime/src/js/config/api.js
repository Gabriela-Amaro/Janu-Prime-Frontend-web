import { APP_CONFIG } from "../config/app.js";
class ApiService {
  constructor() {
    this.baseURL = APP_CONFIG.apiUrl;
  }
  /**
   * Método genérico para fazer requisições HTTP
   */
  async request(endpoint, options = {}) {
    const url = `${this.baseURL}${endpoint}`;

    // Configuração padrão
    const config = {
      headers: {
        "Content-Type": "application/json",
        ...options.headers,
      },
      ...options,
    };
    // Adicionar token JWT se o usuário estiver autenticado
    const token = this.getAccessToken();
    if (token && !options.skipAuth) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    try {
      const response = await fetch(url, config);
      // Tratamento de erro 401 (token expirado)
      if (response.status === 401 && !options.skipAuth) {
        const refreshed = await this.refreshToken();
        if (refreshed) {
          // Tentar novamente com novo token
          return this.request(endpoint, options);
        } else {
          // Refresh falhou, fazer logout
          this.handleUnauthorized();
          throw new Error("Sessão expirada");
        }
      }
      // Tratamento de outros erros HTTP
      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(
          error.detail || error.message || `Erro HTTP ${response.status}`
        );
      }
      // Retornar resposta parseada
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        return await response.json();
      }
      return await response.text();
    } catch (error) {
      console.error("Erro na requisição:", error);
      throw error;
    }
  }
  /**
   * Helpers para métodos HTTP
   */
  get(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "GET" });
  }
  post(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "POST",
      body: JSON.stringify(data),
    });
  }
  put(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PUT",
      body: JSON.stringify(data),
    });
  }
  patch(endpoint, data, options = {}) {
    return this.request(endpoint, {
      ...options,
      method: "PATCH",
      body: JSON.stringify(data),
    });
  }
  delete(endpoint, options = {}) {
    return this.request(endpoint, { ...options, method: "DELETE" });
  }
  /**
   * Gerenciamento de tokens
   */
  getAccessToken() {
    return localStorage.getItem("accessToken");
  }
  getRefreshToken() {
    return localStorage.getItem("refreshToken");
  }
  setTokens(access, refresh) {
    localStorage.setItem("accessToken", access);
    localStorage.setItem("refreshToken", refresh);
  }
  clearTokens() {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  }
  /**
   * Renovar access token usando refresh token
   */
  async refreshToken() {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) return false;
    try {
      const response = await this.request(APP_CONFIG.authEndpoints.refresh, {
        method: "POST",
        body: JSON.stringify({ refresh: refreshToken }),
        skipAuth: true,
      });
      if (response.access) {
        localStorage.setItem("accessToken", response.access);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Erro ao renovar token:", error);
      return false;
    }
  }
  /**
   * Lidar com sessão expirada
   */
  handleUnauthorized() {
    this.clearTokens();
    localStorage.removeItem("userData");
    localStorage.removeItem("isAuthenticated");

    // Redirecionar para login
    if (typeof window.showPage === "function") {
      window.showPage("login");
    }
  }
}
export const apiService = new ApiService();
