// Utilitários para controlar a interface baseada na autenticação
import { authService } from '../services/auth.js';

export function updateUIBasedOnAuth() {
  const navbar = document.getElementById('mainNavbar');
  
  if (authService.isAuthenticated) {
    // Mostrar navegação
    if (navbar) navbar.style.display = 'block';
    
    // Atualizar informações do usuário na interface
    updateUserInfo();
  } else {
    // Esconder navegação
    if (navbar) navbar.style.display = 'none';
  }
}

// Atualizar informações do usuário na interface
function updateUserInfo() {
  const userData = authService.getUserData();
  if (!userData) return;
  
  // Atualizar título da página
  document.title = `Janu Prime - ${userData.empresa || 'Painel do Estabelecimento'}`;
  
  // Atualizar informações do usuário em elementos específicos (se existirem)
  const userInfoElements = document.querySelectorAll('[data-user-info]');
  userInfoElements.forEach(element => {
    const infoType = element.getAttribute('data-user-info');
    switch (infoType) {
      case 'nome':
        element.textContent = userData.nome || 'Usuário';
        break;
      case 'email':
        element.textContent = userData.email || '';
        break;
      case 'empresa':
        element.textContent = userData.empresa || '';
        break;
      case 'role':
        element.textContent = getRoleDisplayName(userData.role);
        break;
    }
  });
}

// Obter nome de exibição do cargo
function getRoleDisplayName(role) {
  const roleNames = {
    'admin': 'Administrador',
    'gerente': 'Gerente',
    'funcionario': 'Funcionário'
  };
  return roleNames[role] || role;
}

// Controlar visibilidade de elementos baseado no cargo do usuário
export function updatePermissionsUI() {
  const userData = authService.getUserData();
  if (!userData) {
    // Se não houver userData, esconder todos os elementos restritos
    document.querySelectorAll('[data-role="admin"]').forEach(element => {
      element.style.display = 'none';
    });
    return;
  }
  
  // Verificar se é super_user do estabelecimento
  // O backend retorna super_user diretamente no userData quando é ADMINISTRADOR
  const isSuperUser = userData.super_user === true || userData.super_user === 1;
  
  // Esconder elementos que o usuário não tem permissão para ver
  const adminOnlyElements = document.querySelectorAll('[data-role="admin"]');
  const gerenteOnlyElements = document.querySelectorAll('[data-role="gerente"]');
  const funcionarioOnlyElements = document.querySelectorAll('[data-role="funcionario"]');
  
  // Dropdown de administração aparece apenas para super_user do estabelecimento
  adminOnlyElements.forEach(element => {
    element.style.display = isSuperUser ? 'block' : 'none';
  });
  
  // Outros elementos baseados em role (se necessário)
  gerenteOnlyElements.forEach(element => {
    // Manter lógica existente se necessário
  });
  
  funcionarioOnlyElements.forEach(element => {
    // Manter lógica existente se necessário
  });
}

// Função para mostrar/esconder navegação
export function toggleNavigation(show) {
  const navbar = document.getElementById('mainNavbar');
  
  if (show) {
    if (navbar) navbar.style.display = 'block';
  } else {
    if (navbar) navbar.style.display = 'none';
  }
}

// Função para atualizar interface após login
export function onLoginSuccess() {
  updateUIBasedOnAuth();
  updatePermissionsUI();
}

// Função para atualizar interface após logout
export function onLogoutSuccess() {
  updateUIBasedOnAuth();
}

// Exportar funções para uso global
window.updateUIBasedOnAuth = updateUIBasedOnAuth;
window.updatePermissionsUI = updatePermissionsUI;
window.toggleNavigation = toggleNavigation;
window.onLoginSuccess = onLoginSuccess;
window.onLogoutSuccess = onLogoutSuccess;
