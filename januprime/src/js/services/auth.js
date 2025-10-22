// Serviço de Autenticação
export class AuthService {
  constructor() {
    this.isAuthenticated = this.checkAuthStatus();
    this.userData = this.getUserData();
  }

  // Verificar se o usuário está autenticado
  checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    const isAuth = localStorage.getItem('isAuthenticated') === 'true';
    return !!(token && isAuth);
  }

  // Obter dados do usuário
  getUserData() {
    try {
      const userData = localStorage.getItem('userData');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Erro ao obter dados do usuário:', error);
      return null;
    }
  }

  // Fazer login
  async login(email, password) {
    try {
      // Simular chamada à API (substituir por chamada real)
      const response = await this.authenticateUser(email, password);
      
      if (response.success) {
        // Salvar dados de autenticação
        localStorage.setItem('authToken', response.token);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userData', JSON.stringify(response.user));
        
        this.isAuthenticated = true;
        this.userData = response.user;
        
        return { success: true, user: response.user };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Erro no login:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  }

  // Fazer logout
  logout() {
    // Limpar dados de autenticação
    localStorage.removeItem('authToken');
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userData');
    
    this.isAuthenticated = false;
    this.userData = null;
    
    // Atualizar interface
    if (typeof onLogoutSuccess === 'function') {
      onLogoutSuccess();
    }
    
    // Redirecionar para login
    if (typeof showPage === 'function') {
      showPage('login');
    }
  }

  // Registrar novo usuário
  async register(userData) {
    try {
      // Simular chamada à API (substituir por chamada real)
      const response = await this.createUser(userData);
      
      if (response.success) {
        return { success: true, message: 'Conta criada com sucesso!' };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      console.error('Erro no cadastro:', error);
      return { success: false, message: 'Erro interno do servidor' };
    }
  }

  // Verificar se o usuário tem permissão para acessar uma página
  hasPermission(page) {
    if (!this.isAuthenticated || !this.userData) {
      return false;
    }

    const userRole = this.userData.role;
    
    // Definir permissões por página
    const permissions = {
      'dashboard': ['admin', 'gerente', 'funcionario'],
      'perfil': ['admin', 'gerente', 'funcionario'],
      'catalogo': ['admin', 'gerente', 'funcionario'],
      'anuncios': ['admin', 'gerente', 'funcionario'],
      'transacoes': ['admin', 'gerente', 'funcionario'],
      'funcionarios': ['admin', 'gerente'],
      'metricas': ['admin', 'gerente'],
      'auditoria': ['admin']
    };

    return permissions[page] ? permissions[page].includes(userRole) : false;
  }

  // Obter token de autenticação
  getToken() {
    return localStorage.getItem('authToken');
  }

  // Verificar se o token é válido
  isTokenValid() {
    const token = this.getToken();
    if (!token) return false;

    try {
      // Em produção, verificar se o token não expirou
      const tokenData = JSON.parse(atob(token.split('.')[1]));
      const now = Date.now() / 1000;
      return tokenData.exp > now;
    } catch (error) {
      return false;
    }
  }

  // Simular autenticação de usuário (substituir por chamada real à API)
  async authenticateUser(email, password) {
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Dados de usuários de exemplo
    const users = [
      { 
        email: 'admin@januprime.com', 
        password: 'admin123', 
        role: 'admin',
        nome: 'Administrador',
        empresa: 'Janu Prime'
      },
      { 
        email: 'gerente@januprime.com', 
        password: 'gerente123', 
        role: 'gerente',
        nome: 'Gerente',
        empresa: 'Pizzaria Sabor Local'
      },
      { 
        email: 'funcionario@januprime.com', 
        password: 'func123', 
        role: 'funcionario',
        nome: 'Funcionário',
        empresa: 'Pizzaria Sabor Local'
      }
    ];

    const user = users.find(u => u.email === email && u.password === password);

    if (user) {
      const token = this.generateToken(user);
      return {
        success: true,
        token: token,
        user: {
          email: user.email,
          role: user.role,
          nome: user.nome,
          empresa: user.empresa,
          loginTime: new Date().toISOString()
        }
      };
    } else {
      return {
        success: false,
        message: 'E-mail ou senha incorretos'
      };
    }
  }

  // Simular criação de usuário (substituir por chamada real à API)
  async createUser(userData) {
    // Simular delay da API
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      // Verificar se o e-mail já existe
      const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
      const emailExists = existingUsers.some(user => user.email === userData.email);

      if (emailExists) {
        return {
          success: false,
          message: 'Este e-mail já está cadastrado'
        };
      }

      // Criar novo usuário
      const newUser = {
        id: Date.now(),
        ...userData,
        createdAt: new Date().toISOString(),
        status: 'pending_approval'
      };

      // Salvar usuário (em produção, seria salvo no servidor)
      existingUsers.push(newUser);
      localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));

      return {
        success: true,
        message: 'Conta criada com sucesso! Aguarde a aprovação.'
      };
    } catch (error) {
      return {
        success: false,
        message: 'Erro ao criar conta'
      };
    }
  }

  // Gerar token de autenticação (simulado)
  generateToken(user) {
    const header = {
      alg: 'HS256',
      typ: 'JWT'
    };

    const payload = {
      sub: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
    };

    // Em produção, usar uma biblioteca JWT real
    const encodedHeader = btoa(JSON.stringify(header));
    const encodedPayload = btoa(JSON.stringify(payload));
    const signature = btoa('mock-signature');

    return `${encodedHeader}.${encodedPayload}.${signature}`;
  }

  // Atualizar dados do usuário
  updateUserData(newData) {
    if (this.userData) {
      this.userData = { ...this.userData, ...newData };
      localStorage.setItem('userData', JSON.stringify(this.userData));
    }
  }

  // Verificar se deve lembrar do usuário
  shouldRememberUser() {
    return localStorage.getItem('rememberMe') === 'true';
  }

  // Obter e-mail salvo para "lembrar de mim"
  getRememberedEmail() {
    return localStorage.getItem('userEmail') || '';
  }
}

// Instância global do serviço de autenticação
export const authService = new AuthService();

// Função para verificar autenticação e redirecionar se necessário
export function requireAuth(pageName) {
  if (!authService.isAuthenticated) {
    showPage('login');
    return false;
  }

  if (!authService.hasPermission(pageName)) {
    showNotification('Você não tem permissão para acessar esta página', 'error');
    showPage('dashboard');
    return false;
  }

  return true;
}

// Função para fazer logout
export function logout() {
  authService.logout();
  showNotification('Sessão encerrada com sucesso!', 'success');
}

// Exportar funções para uso global
window.requireAuth = requireAuth;
window.logout = logout;
