// Importar componentes de autenticação
import { getAuthFooter } from '../components/auth-navbar.js';

// Página de Esqueci Minha Senha
export function getForgotPasswordContent() {
  return `
    <div class="auth-page">
      <div class="auth-main-content">
      <div class="auth-card auth-fade-in">
        <div class="card-body">
              <div class="text-center mb-4">
                <img src="/assets/images/logo.svg" alt="Janu Prime" width="60" height="60" class="mb-3">
                <h2 class="text-gradient mb-2">Esqueceu sua senha?</h2>
                <p class="text-muted">Digite seu e-mail para receber instruções de recuperação</p>
              </div>
              
              <form id="forgotPasswordForm" onsubmit="handleForgotPassword(event)">
                <div class="mb-3">
                  <label for="forgotEmail" class="form-label">
                    <i class="bi bi-envelope me-2"></i>E-mail
                  </label>
                  <input 
                    type="email" 
                    class="form-control" 
                    id="forgotEmail" 
                    placeholder="seu@email.com"
                    required
                  >
                </div>
                
                <button type="submit" class="btn btn-primary w-100 mb-3">
                  <i class="bi bi-send me-2"></i>
                  Enviar Instruções
                </button>
              </form>
              
              <hr class="my-4">
              
              <div class="text-center">
                <p class="text-muted mb-0">Lembrou da senha?</p>
                <button class="btn btn-outline-primary mt-2" onclick="showPage('login')">
                  <i class="bi bi-box-arrow-in-right me-2"></i>
                  Voltar ao Login
                </button>
              </div>
        </div>
      </div>
    </div>
    
    ${getAuthFooter()}
    </div>
  `;
}

// Função para lidar com o envio de e-mail de recuperação
export async function handleForgotPassword(event) {
  event.preventDefault();
  
  const email = document.getElementById('forgotEmail').value;
  
  // Validação básica
  if (!email) {
    showNotification('Por favor, digite seu e-mail', 'error');
    return;
  }
  
  // Mostrar loading no botão
  const submitButton = event.target.querySelector('button[type="submit"]');
  const originalText = submitButton.innerHTML;
  submitButton.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Enviando...';
  submitButton.disabled = true;
  
  try {
    // Simular envio de e-mail (substituir por chamada real à API)
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    showNotification('Instruções de recuperação enviadas para seu e-mail!', 'success');
    
    // Limpar formulário
    document.getElementById('forgotPasswordForm').reset();
    
    // Redirecionar para login após 3 segundos
    setTimeout(() => {
      showPage('login');
    }, 3000);
  } catch (error) {
    console.error('Erro ao enviar e-mail:', error);
    showNotification('Erro ao enviar e-mail. Tente novamente.', 'error');
  } finally {
    // Restaurar botão
    submitButton.innerHTML = originalText;
    submitButton.disabled = false;
  }
}

// Exportar funções para uso global
window.handleForgotPassword = handleForgotPassword;
