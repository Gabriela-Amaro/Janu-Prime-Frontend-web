// Importar componentes de autenticação
import { getAuthFooter } from '../components/auth-navbar.js';

// Página de Cadastro
export function getRegisterContent() {
  return `
    <div class="auth-page">
      <div class="auth-main-content">
      <div class="auth-card register-card auth-fade-in">
        <div class="card-body">
              <div class="text-center mb-4">
                <img src="/assets/images/logo.svg" alt="Janu Prime" width="60" height="60" class="mb-3">
                <h2 class="text-gradient mb-2">Criar nova conta</h2>
                <p class="text-muted">Preencha os dados para se cadastrar</p>
              </div>
              
              <form id="registerForm" onsubmit="handleRegister(event)">
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="registerNome" class="form-label">
                        <i class="bi bi-person me-2"></i>Nome Completo
                      </label>
                      <input 
                        type="text" 
                        class="form-control" 
                        id="registerNome" 
                        placeholder="Seu nome completo"
                        required
                      >
                    </div>
                  </div>
                  
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="registerEmail" class="form-label">
                        <i class="bi bi-envelope me-2"></i>E-mail
                      </label>
                      <input 
                        type="email" 
                        class="form-control" 
                        id="registerEmail" 
                        placeholder="seu@email.com"
                        required
                      >
                    </div>
                  </div>
                </div>
                
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="registerTelefone" class="form-label">
                        <i class="bi bi-telephone me-2"></i>Telefone
                      </label>
                      <input 
                        type="tel" 
                        class="form-control" 
                        id="registerTelefone" 
                        placeholder="(38) 99999-9999"
                        oninput="formatPhone(this)"
                        required
                      >
                    </div>
                  </div>
                  
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="registerCnpj" class="form-label">
                        <i class="bi bi-building me-2"></i>CNPJ
                      </label>
                      <input 
                        type="text" 
                        class="form-control" 
                        id="registerCnpj" 
                        placeholder="00.000.000/0000-00"
                        oninput="formatCNPJ(this)"
                        required
                      >
                    </div>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label for="registerEmpresa" class="form-label">
                    <i class="bi bi-shop me-2"></i>Nome da Empresa
                  </label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="registerEmpresa" 
                    placeholder="Nome do seu estabelecimento"
                    required
                  >
                </div>
                
                <div class="mb-3">
                  <label for="registerEndereco" class="form-label">
                    <i class="bi bi-geo-alt me-2"></i>Endereço
                  </label>
                  <input 
                    type="text" 
                    class="form-control" 
                    id="registerEndereco" 
                    placeholder="Rua, número, bairro, cidade"
                    required
                  >
                </div>
                
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="registerPassword" class="form-label">
                        <i class="bi bi-lock me-2"></i>Senha
                      </label>
                      <div class="input-group">
                        <input 
                          type="password" 
                          class="form-control" 
                          id="registerPassword" 
                          placeholder="Mínimo 6 caracteres"
                          required
                          minlength="6"
                        >
                        <button 
                          class="btn btn-outline-secondary" 
                          type="button" 
                          onclick="togglePasswordVisibility('registerPassword')"
                        >
                          <i class="bi bi-eye" id="registerPasswordIcon"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="registerConfirmPassword" class="form-label">
                        <i class="bi bi-lock-fill me-2"></i>Confirmar Senha
                      </label>
                      <div class="input-group">
                        <input 
                          type="password" 
                          class="form-control" 
                          id="registerConfirmPassword" 
                          placeholder="Digite a senha novamente"
                          required
                        >
                        <button 
                          class="btn btn-outline-secondary" 
                          type="button" 
                          onclick="togglePasswordVisibility('registerConfirmPassword')"
                        >
                          <i class="bi bi-eye" id="registerConfirmPasswordIcon"></i>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div class="mb-3 form-check">
                  <input type="checkbox" class="form-check-input" id="acceptTerms" required>
                  <label class="form-check-label" for="acceptTerms">
                    Aceito os <a href="#" class="text-primary">Termos de Uso</a> e 
                    <a href="#" class="text-primary">Política de Privacidade</a>
                  </label>
                </div>
                
                <div class="mb-3 form-check">
                  <input type="checkbox" class="form-check-input" id="acceptNewsletter">
                  <label class="form-check-label" for="acceptNewsletter">
                    Quero receber novidades e promoções por e-mail
                  </label>
                </div>
                
                <button type="submit" class="btn btn-primary w-100 mb-3">
                  <i class="bi bi-person-plus me-2"></i>
                  Criar Conta
                </button>
              </form>
              
              <hr class="my-4">
              
              <div class="text-center">
                <p class="text-muted mb-0">Já tem uma conta?</p>
                <button class="btn btn-outline-primary mt-2" onclick="showPage('login')">
                  <i class="bi bi-box-arrow-in-right me-2"></i>
                  Fazer Login
                </button>
              </div>
        </div>
      </div>
    </div>
    
    ${getAuthFooter()}
    </div>
  `;
}

// Função para lidar com o cadastro
export async function handleRegister(event) {
  event.preventDefault();
  
  const formData = {
    nome: document.getElementById('registerNome').value,
    email: document.getElementById('registerEmail').value,
    telefone: document.getElementById('registerTelefone').value,
    cnpj: document.getElementById('registerCnpj').value,
    empresa: document.getElementById('registerEmpresa').value,
    endereco: document.getElementById('registerEndereco').value,
    password: document.getElementById('registerPassword').value,
    confirmPassword: document.getElementById('registerConfirmPassword').value,
    acceptTerms: document.getElementById('acceptTerms').checked,
    acceptNewsletter: document.getElementById('acceptNewsletter').checked
  };
  
  // Validações
  if (!validateRegisterForm(formData)) {
    return;
  }
  
  // Mostrar loading no botão
  const submitButton = event.target.querySelector('button[type="submit"]');
  const originalText = submitButton.innerHTML;
  submitButton.innerHTML = '<i class="bi bi-hourglass-split me-2"></i>Criando conta...';
  submitButton.disabled = true;
  
  try {
    // Usar o serviço de autenticação
    const result = await authService.register(formData);
    
    if (result.success) {
      showNotification(result.message || 'Conta criada com sucesso! Você pode fazer login agora.', 'success');
      
      // Limpar formulário
      document.getElementById('registerForm').reset();
      
      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        showPage('login');
      }, 2000);
    } else {
      showNotification(result.message || 'Erro ao criar conta. Tente novamente.', 'error');
    }
  } catch (error) {
    console.error('Erro no cadastro:', error);
    showNotification('Erro interno do servidor', 'error');
  } finally {
    // Restaurar botão
    submitButton.innerHTML = originalText;
    submitButton.disabled = false;
  }
}

// Função para validar formulário de cadastro
function validateRegisterForm(data) {
  // Validar se todos os campos obrigatórios estão preenchidos
  if (!data.nome || !data.email || !data.telefone || !data.cnpj || 
      !data.empresa || !data.endereco || !data.password || !data.confirmPassword) {
    showNotification('Por favor, preencha todos os campos obrigatórios', 'error');
    return false;
  }
  
  // Validar e-mail
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(data.email)) {
    showNotification('Por favor, insira um e-mail válido', 'error');
    return false;
  }
  
  // Validar senha
  if (data.password.length < 6) {
    showNotification('A senha deve ter pelo menos 6 caracteres', 'error');
    return false;
  }
  
  // Validar confirmação de senha
  if (data.password !== data.confirmPassword) {
    showNotification('As senhas não coincidem', 'error');
    return false;
  }
  
  // Validar CNPJ (formato básico)
  const cnpjRegex = /^\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2}$/;
  if (!cnpjRegex.test(data.cnpj)) {
    showNotification('Por favor, insira um CNPJ válido (formato: 00.000.000/0000-00)', 'error');
    return false;
  }
  
  // Validar telefone (formato básico)
  const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
  if (!phoneRegex.test(data.telefone)) {
    showNotification('Por favor, insira um telefone válido (formato: (00) 00000-0000)', 'error');
    return false;
  }
  
  // Validar termos de uso
  if (!data.acceptTerms) {
    showNotification('Você deve aceitar os Termos de Uso para continuar', 'error');
    return false;
  }
  
  return true;
}

// Função para registrar usuário (simulada)
function registerUser(userData) {
  // Em produção, isso seria uma chamada à API
  try {
    // Simular processamento
    const newUser = {
      id: Date.now(),
      ...userData,
      createdAt: new Date().toISOString(),
      status: 'pending_approval' // Conta criada mas aguardando aprovação
    };
    
    // Salvar no localStorage (em produção, seria salvo no servidor)
    const existingUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
    existingUsers.push(newUser);
    localStorage.setItem('registeredUsers', JSON.stringify(existingUsers));
    
    return true;
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    return false;
  }
}

// Função para formatar CNPJ
export function formatCNPJ(input) {
  let value = input.value.replace(/\D/g, '');
  value = value.replace(/^(\d{2})(\d)/, '$1.$2');
  value = value.replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3');
  value = value.replace(/\.(\d{3})(\d)/, '.$1/$2');
  value = value.replace(/(\d{4})(\d)/, '$1-$2');
  input.value = value;
}

// Função para formatar telefone
export function formatPhone(input) {
  let value = input.value.replace(/\D/g, '');
  if (value.length <= 10) {
    value = value.replace(/^(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
  } else {
    value = value.replace(/^(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
  }
  input.value = value;
}

// Exportar funções para uso global
window.handleRegister = handleRegister;
window.formatCNPJ = formatCNPJ;
window.formatPhone = formatPhone;
