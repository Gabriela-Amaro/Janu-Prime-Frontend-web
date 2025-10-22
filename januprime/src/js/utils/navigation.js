// Sistema de navegação
export function showPage(pageName) {
  const content = document.getElementById('page-content');
  
  // Verificar se é uma página que requer autenticação
  const protectedPages = ['dashboard', 'perfil', 'catalogo', 'anuncios', 'transacoes', 'funcionarios', 'metricas', 'auditoria'];
  
  if (protectedPages.includes(pageName)) {
    // Verificar autenticação
    if (typeof requireAuth === 'function' && !requireAuth(pageName)) {
      return; // requireAuth já redireciona se necessário
    }
  }
  
  // Se for página de auth e usuário já estiver logado, redirecionar para dashboard
  if ((['login', 'register', 'forgot-password'].includes(pageName)) && typeof authService !== 'undefined' && authService.isAuthenticated) {
    showPage('dashboard');
    return;
  }
  
  // Remove classe ativa de todos os links
  document.querySelectorAll('.nav-link').forEach(link => {
    link.classList.remove('active');
  });
  
  // Remove classe ativa de todos os dropdown items
  document.querySelectorAll('.dropdown-item').forEach(item => {
    item.classList.remove('active');
  });
  
  // Adiciona classe ativa ao link atual (apenas se não for página de auth)
  if (!['login', 'register', 'forgot-password'].includes(pageName)) {
    const activeLink = document.querySelector(`[onclick="showPage('${pageName}')"]`);
    if (activeLink) {
      activeLink.classList.add('active');
    }
    
    // Adiciona classe ativa ao dropdown item correspondente
    const activeDropdownItem = document.querySelector(`[onclick="showPage('${pageName}')"].dropdown-item`);
    if (activeDropdownItem) {
      activeDropdownItem.classList.add('active');
    }
  }
  
  // Carrega o conteúdo da página
  content.innerHTML = getPageContent(pageName);
  content.classList.add('fade-in-up');
  
  // Fecha o offcanvas se estiver aberto
  const offcanvas = bootstrap.Offcanvas.getInstance(document.getElementById('offcanvasNavbar'));
  if (offcanvas) {
    offcanvas.hide();
  }
}

// Gera o conteúdo das páginas
function getPageContent(pageName) {
  switch (pageName) {
    case 'login':
      return getLoginContent();
    case 'register':
      return getRegisterContent();
    case 'forgot-password':
      return getForgotPasswordContent();
    case 'dashboard':
      return getDashboardContent();
    case 'perfil':
      return getPerfilContent();
    case 'catalogo':
      return getCatalogoContent();
    case 'anuncios':
      return getAnunciosContent();
    case 'transacoes':
      return getTransacoesContent();
    case 'funcionarios':
      return getFuncionariosContent();
    case 'metricas':
      return getMetricasContent();
    case 'auditoria':
      return getAuditoriaContent();
    default:
      return getLoginContent(); // Página padrão agora é login
  }
}

// Importar funções de geração de conteúdo das páginas
import { getLoginContent } from '../pages/login.js';
import { getRegisterContent } from '../pages/register.js';
import { getForgotPasswordContent } from '../pages/forgot-password.js';
import { getDashboardContent } from '../pages/dashboard.js';
import { getPerfilContent } from '../pages/perfil.js';
import { getCatalogoContent } from '../pages/catalogo.js';
import { getAnunciosContent } from '../pages/anuncios.js';
import { getTransacoesContent } from '../pages/transacoes.js';
import { getFuncionariosContent } from '../pages/funcionarios.js';
import { getMetricasContent } from '../pages/metricas.js';
import { getAuditoriaContent } from '../pages/auditoria.js';
