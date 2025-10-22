// Importar componentes de autenticação
import { getAuthFooter } from '../components/auth-navbar.js';

// Página de Login
export function getLoginContent() {
  return `
    <div class="auth-page">
      <div class="auth-main-content">
      <div class="auth-card auth-fade-in">
        <div class="card-body">
              <div class="text-center mb-4">
                <img src="/assets/images/logo.svg" alt="Janu Prime" width="60" height="60" class="mb-3">
                <h2 class="text-gradient mb-2">Bem-vindo de volta!</h2>
                <p class="text-muted">Faça login para acessar sua conta</p>
              </div>
              
              <form id="loginForm" onsubmit="handleLogin(event)">
                <div class="mb-3">
                  <label for="loginEmail" class="form-label">
                    <i class="bi bi-envelope me-2"></i>E-mail
                  </label>
                  <input 
                    type="email" 
                    class="form-control" 
                    id="loginEmail" 
                    placeholder="seu@email.com"
                    required
                  >
                </div>
                
                <div class="mb-3">
                  <label for="loginPassword" class="form-label">
                    <i class="bi bi-lock me-2"></i>Senha
                  </label>
                  <div class="input-group">
                    <input 
                      type="password" 
                      class="form-control" 
                      id="loginPassword" 
                      placeholder="Digite sua senha"
                      required
                    >
                    <button 
                      class="btn btn-outline-secondary" 
                      type="button" 
                      onclick="togglePasswordVisibility('loginPassword')"
                    >
                      <i class="bi bi-eye" id="loginPasswordIcon"></i>
                    </button>
                  </div>
                </div>
                
                <div class="mb-3 form-check">
                  <input type="checkbox" class="form-check-input" id="rememberMe">
                  <label class="form-check-label" for="rememberMe">
                    Lembrar de mim
                  </label>
                </div>
                
                <button type="submit" class="btn btn-primary w-100 mb-3">
                  <i class="bi bi-box-arrow-in-right me-2"></i>
                  Entrar
                </button>
                
                <div class="text-center">
                  <a href="#" onclick="showPage('forgot-password')" class="text-decoration-none">
                    Esqueceu sua senha?
                  </a>
                </div>
              </form>
              
              <hr class="my-4">
              
              <div class="text-center">
                <p class="text-muted mb-0">Não tem uma conta?</p>
                <button class="btn btn-outline-primary mt-2" onclick="showPage('register')">
                  <i class="bi bi-person-plus me-2"></i>
                  Criar conta
                </button>
              </div>
        </div>
      </div>
    </div>
    
    ${getAuthFooter()}
    </div>
  `;
}

// Função para alternar visibilidade da senha
export function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(inputId + 'Icon');
  
  if (input.type === 'password') {
    input.type = 'text';
    icon.className = 'bi bi-eye-slash';
  } else {
    input.type = 'password';
    icon.className = 'bi bi-eye';
  }
}

// Função para lidar com o login
export async function handleLogin(event) {
  event.preventDefault();
  
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const rememberMe = document.getElementById('rememberMe').checked;
  
  // Validação básica
  if (!email || !password) {
    showNotification('Por favor, preencha todos os campos', 'error');
    return;
  }
  
  // Mostrar loading no botão
  const submitButton = event.target.querySelector('button[type="submit"]');
  const originalText = submitButton.innerHTML;
  submitButton.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Entrando...';
  submitButton.disabled = true;
  
  try {
    // Usar o serviço de autenticação
    const result = await authService.login(email, password);
    
    if (result.success) {
      // Salvar dados de sessão se "lembrar de mim" estiver marcado
      if (rememberMe) {
        localStorage.setItem('rememberMe', 'true');
        localStorage.setItem('userEmail', email);
      }
      
      showNotification('Login realizado com sucesso!', 'success');
      
      // Atualizar interface
      if (typeof onLoginSuccess === 'function') {
        onLoginSuccess();
      }
      
      // Redirecionar para o dashboard após 1 segundo
      setTimeout(() => {
        showPage('dashboard');
      }, 1000);
    } else {
      showNotification(result.message || 'E-mail ou senha incorretos', 'error');
    }
  } catch (error) {
    console.error('Erro no login:', error);
    showNotification('Erro interno do servidor', 'error');
  } finally {
    // Restaurar botão
    submitButton.innerHTML = originalText;
    submitButton.disabled = false;
  }
}

// Função para autenticar usuário (simulada)
function authenticateUser(email, password) {
  // Dados de usuários de exemplo (em produção, isso viria de uma API)
  const users = [
    { email: 'admin@januprime.com', password: 'admin123', role: 'admin' },
    { email: 'gerente@januprime.com', password: 'gerente123', role: 'gerente' },
    { email: 'funcionario@januprime.com', password: 'func123', role: 'funcionario' }
  ];
  
  const user = users.find(u => u.email === email && u.password === password);
  
  if (user) {
    // Salvar dados do usuário
    localStorage.setItem('userData', JSON.stringify({
      email: user.email,
      role: user.role,
      loginTime: new Date().toISOString()
    }));
    return true;
  }
  
  return false;
}

// Função para gerar token de autenticação (simulada)
function generateAuthToken(email) {
  // Em produção, isso seria um JWT real
  return btoa(email + ':' + Date.now());
}

// Exportar funções para uso global
window.togglePasswordVisibility = togglePasswordVisibility;
window.handleLogin = handleLogin;
