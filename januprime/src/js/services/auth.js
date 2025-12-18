import { apiService } from "../config/api.js";
import { APP_CONFIG } from "../config/app.js";

// Serviço de Autenticação
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

  // Registrar novo usuário
  async register(userData) {
    try {
      // Simular chamada à API (substituir por chamada real)
      const response = await this.createUser(userData);

      if (response.success) {
        return { success: true, message: "Conta criada com sucesso!" };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error("Erro no cadastro:", error);
      return { success: false, message: "Erro interno do servidor" };
    }
  }

  // Verificar se o usuário tem permissão para acessar uma página
  hasPermission(page) {
    if (!this.isAuthenticated || !this.userData) {
      return false;
    }

    const tipoUsuario = this.userData.tipo_usuario;
    const isSuperUser = this.userData.super_user === true;

    // Definir permissões por página baseado no tipo_usuario do backend
    const permissions = {
      dashboard: ["ADMINISTRADOR", "CLIENTE"],
      perfil: ["ADMINISTRADOR", "CLIENTE"],
      catalogo: ["ADMINISTRADOR"],
      anuncios: ["ADMINISTRADOR"],
      transacoes: ["ADMINISTRADOR"],
      funcionarios: ["ADMINISTRADOR"], // Apenas super_user na prática
      metricas: ["ADMINISTRADOR"],
      auditoria: ["ADMINISTRADOR"], // Apenas super_user
    };

    // Páginas restritas a super_user
    const superUserOnly = ["funcionarios", "auditoria"];

    if (superUserOnly.includes(page) && !isSuperUser) {
      return false;
    }

    return permissions[page] ? permissions[page].includes(tipoUsuario) : false;
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
      // Em produção, verificar se o token não expirou
      const tokenData = JSON.parse(atob(token.split(".")[1]));
      const now = Date.now() / 1000;
      return tokenData.exp > now;
    } catch (error) {
      return false;
    }
  }

  // Simular criação de usuário (substituir por chamada real à API)
  async createUser(userData) {
    // Simular delay da API
    await new Promise((resolve) => setTimeout(resolve, 1500));

    try {
      // Verificar se o e-mail já existe
      const existingUsers = JSON.parse(
        localStorage.getItem("registeredUsers") || "[]"
      );
      const emailExists = existingUsers.some(
        (user) => user.email === userData.email
      );

      if (emailExists) {
        return {
          success: false,
          message: "Este e-mail já está cadastrado",
        };
      }

      // Criar novo usuário
      const newUser = {
        id: Date.now(),
        ...userData,
        createdAt: new Date().toISOString(),
        status: "pending_approval",
      };

      // Salvar usuário (em produção, seria salvo no servidor)
      existingUsers.push(newUser);
      localStorage.setItem("registeredUsers", JSON.stringify(existingUsers));

      return {
        success: true,
        message: "Conta criada com sucesso! Aguarde a aprovação.",
      };
    } catch (error) {
      return {
        success: false,
        message: "Erro ao criar conta",
      };
    }
  }

  // Atualizar dados do usuário
  updateUserData(newData) {
    if (this.userData) {
      this.userData = { ...this.userData, ...newData };
      localStorage.setItem("userData", JSON.stringify(this.userData));
    }
  }

  // Verificar se deve lembrar do usuário
  shouldRememberUser() {
    return localStorage.getItem("rememberMe") === "true";
  }

  // Obter e-mail salvo para "lembrar de mim"
  getRememberedEmail() {
    return localStorage.getItem("userEmail") || "";
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
