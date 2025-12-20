import { apiService } from "../config/api.js";
import { APP_CONFIG } from "../config/app.js";

/**
 * Serviço de Autenticação
 * Este frontend é exclusivo para administradores de estabelecimentos
 */
export class AuthService {
  constructor() {
    this.isAuthenticated = this.checkAuthStatus();
    this.userData = this.getUserData();
  }

  // Verificar se o usuário está autenticado
  checkAuthStatus() {
    const token = localStorage.getItem("authToken");
    const isAuth = localStorage.getItem("isAuthenticated") === "true";
    return !!(token && isAuth);
  }

  // Obter dados do usuário
  getUserData() {
    try {
      const userData = localStorage.getItem("userData");
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error("Erro ao obter dados do usuário:", error);
      return null;
    }
  }

  // Fazer login
  async login(email, password) {
    try {
      // Obtem tokens
      const response = await apiService.post(
        APP_CONFIG.authEndpoints.login,
        { email, password },
        { skipAuth: true }
      );

      if (response.access && response.refresh) {
        // Salva tokens
        apiService.setTokens(response.access, response.refresh);

        // Busca dados do usuário
        const userData = await apiService.get(APP_CONFIG.authEndpoints.me);

        // Verificar se é administrador (único tipo permitido neste frontend)
        if (userData.tipo_usuario !== "ADMINISTRADOR") {
          apiService.clearTokens();
          return {
            success: false,
            message: "Acesso permitido apenas para administradores",
          };
        }

        // Salva estado de autenticação e dados do usuário
        localStorage.setItem("isAuthenticated", "true");
        localStorage.setItem("userData", JSON.stringify(userData));

        this.isAuthenticated = true;
        this.userData = userData;

        return { success: true, user: userData };
      } else {
        return { success: false, message: "Resposta inválida do servidor" };
      }
    } catch (error) {
      console.error("Erro no login:", error);
      return {
        success: false,
        message: error.message || "Erro ao fazer login",
      };
    }
  }

  /**
   * Logout com blacklist do token
   */
  async logout() {
    try {
      const refreshToken = apiService.getRefreshToken();
      if (refreshToken) {
        await apiService.post(APP_CONFIG.authEndpoints.logout, {
          refresh: refreshToken,
        });
      }
    } catch (error) {
      console.error("Erro ao fazer logout:", error);
    } finally {
      // Limpar dados locais independente do resultado
      apiService.clearTokens();
      localStorage.removeItem("isAuthenticated");
      localStorage.removeItem("userData");
      localStorage.removeItem("currentPage");

      this.isAuthenticated = false;
      this.userData = null;

      // Atualizar UI
      if (typeof onLogoutSuccess === "function") {
        onLogoutSuccess();
      }

      if (typeof showPage === "function") {
        showPage("login");
      }
    }
  }

  /**
   * Decodificar JWT (payload)
   */
  decodeToken(token) {
    try {
      const payload = token.split(".")[1];
      const decoded = JSON.parse(atob(payload));
      return {
        user_id: decoded.user_id,
        exp: decoded.exp,
      };
    } catch (error) {
      console.error("Erro ao decodificar token:", error);
      return null;
    }
  }

  /**
   * Verificar se o usuário tem permissão para acessar uma página
   * Páginas restritas a super_user (gerentes): funcionarios, auditoria
   */
  hasPermission(page) {
    if (!this.isAuthenticated || !this.userData) {
      return false;
    }

    // Verificar se é administrador
    if (this.userData.tipo_usuario !== "ADMINISTRADOR") {
      return false;
    }

    // Páginas restritas a super_user (gerentes)
    const superUserOnly = ["funcionarios", "auditoria"];

    if (superUserOnly.includes(page) && !this.userData.super_user) {
      return false;
    }

    return true;
  }

  // Obter token de autenticação
  getToken() {
    return localStorage.getItem("authToken");
  }

  // Verificar se o token é válido
  isTokenValid() {
    const token = this.getToken();
    if (!token) return false;

    try {
      const tokenData = JSON.parse(atob(token.split(".")[1]));
      const now = Date.now() / 1000;
      return tokenData.exp > now;
    } catch (error) {
      return false;
    }
  }

  // Atualizar dados do usuário
  updateUserData(newData) {
    if (this.userData) {
      this.userData = { ...this.userData, ...newData };
      localStorage.setItem("userData", JSON.stringify(this.userData));
    }
  }
}

// Instância global do serviço de autenticação
export const authService = new AuthService();

// Função para verificar autenticação e redirecionar se necessário
export function requireAuth(pageName) {
  if (!authService.isAuthenticated) {
    showPage("login");
    return false;
  }

  if (!authService.hasPermission(pageName)) {
    showNotification(
      "Você não tem permissão para acessar esta página",
      "error"
    );
    showPage("dashboard");
    return false;
  }

  return true;
}

// Função para fazer logout
export function logout() {
  authService.logout();
  showNotification("Sessão encerrada com sucesso!", "success");
}

// Exportar funções para uso global
window.requireAuth = requireAuth;
window.logout = logout;

