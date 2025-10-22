import "bootstrap/dist/css/bootstrap.min.css";
import "../css/style.css";

import * as bootstrap from "bootstrap";
import { showPage } from './utils/navigation.js';
import { showNotification } from './utils/notifications.js';
import { authService, requireAuth, logout } from './services/auth.js';
import { updateUIBasedOnAuth, updatePermissionsUI, onLoginSuccess, onLogoutSuccess } from './utils/auth-ui.js';

// Importar funções específicas do dashboard
import { 
  filtrarTickets, 
  aprovarTicket, 
  rejeitarTicket, 
  visualizarTicket 
} from './pages/dashboard.js';

// Importar outras funções das páginas
import { salvarPerfil, adicionarFoto, removerFoto } from './pages/perfil.js';
import { editarProduto, excluirProduto, pesquisarProdutos, aplicarFiltros, aplicarFiltrosAuto, limparFiltros } from './pages/catalogo.js';
import { pesquisarAnuncios, aplicarFiltrosAnuncios, aplicarFiltrosAnunciosAuto, limparFiltrosAnuncios } from './pages/anuncios.js';
import { pesquisarFuncionarios, aplicarFiltrosFuncionarios, aplicarFiltrosFuncionariosAuto, limparFiltrosFuncionarios } from './pages/funcionarios.js';
import { atualizarMetricas, aplicarFiltrosMetricas, exportarMetricas, gerarRelatorio, aplicarFiltrosMetricasAuto, limparFiltrosMetricas } from './pages/metricas.js';
import { aplicarFiltrosTransacoesAuto, limparFiltrosTransacoes } from './pages/transacoes.js';
import { aplicarFiltrosAuditoriaAuto, limparFiltrosAuditoria } from './pages/auditoria.js';

/**
 * Inicialização da aplicação
 */
document.addEventListener("DOMContentLoaded", () => {
  initializeApp();
});

function initializeApp() {
  // Atualizar interface baseada no estado de autenticação
  updateUIBasedOnAuth();
  
  // Verificar se o usuário está autenticado
  if (authService.isAuthenticated) {
    // Se estiver autenticado, carregar dashboard
    showPage('dashboard');
    updatePermissionsUI();
  } else {
    // Se não estiver autenticado, carregar página de login
    showPage('login');
  }
  
  // Inicializa tooltips do Bootstrap
  const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
  tooltipTriggerList.map(function (tooltipTriggerEl) {
    return new bootstrap.Tooltip(tooltipTriggerEl);
  });

  // Inicializa dropdowns e gerencia seleção ativa
  initializeDropdowns();

  // Função de teste para verificar se as funções estão disponíveis
  window.testSearchFunctions = function() {
    console.log('Testando funções de busca:');
    console.log('pesquisarProdutosAuto:', typeof window.pesquisarProdutosAuto);
    console.log('pesquisarAnunciosAuto:', typeof window.pesquisarAnunciosAuto);
    console.log('pesquisarFuncionariosAuto:', typeof window.pesquisarFuncionariosAuto);
    console.log('pesquisarTransacoesAuto:', typeof window.pesquisarTransacoesAuto);
    console.log('pesquisarAuditoriaAuto:', typeof window.pesquisarAuditoriaAuto);
    console.log('filtrarTicketsAuto:', typeof window.filtrarTicketsAuto);
    console.log('');
    console.log('Funções de teste:');
    console.log('testPesquisarProdutos:', typeof window.testPesquisarProdutos);
    console.log('testPesquisarAnuncios:', typeof window.testPesquisarAnuncios);
    console.log('testPesquisarFuncionarios:', typeof window.testPesquisarFuncionarios);
    console.log('testPesquisarTransacoes:', typeof window.testPesquisarTransacoes);
    console.log('testPesquisarAuditoria:', typeof window.testPesquisarAuditoria);
    console.log('testFiltrarTickets:', typeof window.testFiltrarTickets);
  };

  // Função de teste para notificações
  window.testNotifications = function() {
    console.log('Testando notificações...');
    showNotification('Esta é uma notificação de sucesso!', 'success');
    setTimeout(() => showNotification('Esta é uma notificação de aviso!', 'warning'), 1000);
    setTimeout(() => showNotification('Esta é uma notificação de erro!', 'error'), 2000);
    setTimeout(() => showNotification('Esta é uma notificação informativa!', 'info'), 3000);
  };

  console.log('Janu Prime - Aplicação inicializada com sucesso!');
  console.log('Digite testSearchFunctions() no console para testar as funções de busca');
  console.log('Digite testNotifications() no console para testar as notificações');
}

function initializeDropdowns() {
  // Remove classe active de todos os dropdown items
  document.addEventListener('click', function(e) {
    if (e.target.closest('.dropdown-item')) {
      const dropdownItem = e.target.closest('.dropdown-item');
      const dropdown = dropdownItem.closest('.dropdown-menu');
      
      // Remove active de todos os items do mesmo dropdown
      dropdown.querySelectorAll('.dropdown-item').forEach(item => {
        item.classList.remove('active');
      });
      
      // Adiciona active ao item clicado
      dropdownItem.classList.add('active');
    }
  });
}

// Funções de ação (placeholders para futuras implementações)
function salvarProduto() {
  console.log('Salvando produto...');
  showNotification('Produto cadastrado com sucesso! O item foi adicionado ao catálogo.', 'success');
}

function salvarFuncionario() {
  console.log('Salvando funcionário...');
  showNotification('Funcionário cadastrado com sucesso! O usuário foi adicionado à equipe.', 'success');
}

function salvarAnuncio() {
  console.log('Salvando anúncio...');
  showNotification('Anúncio publicado com sucesso! A promoção está ativa no sistema.', 'success');
}

function editarFuncionario(id) {
  console.log('Editando funcionário:', id);
  showNotification('Função de edição será implementada em breve', 'info');
}

function excluirFuncionario(id) {
  console.log('Excluindo funcionário:', id);
  showNotification('Funcionário removido com sucesso! O usuário foi excluído da equipe.', 'success');
}

function toggleFuncionario(id) {
  console.log('Alterando status do funcionário:', id);
  showNotification('Status do funcionário atualizado! As permissões foram modificadas.', 'info');
}

function editarAnuncio(id) {
  console.log('Editando anúncio:', id);
  showNotification('Função de edição será implementada em breve', 'info');
}

function excluirAnuncio(id) {
  console.log('Excluindo anúncio:', id);
  showNotification('Anúncio removido com sucesso! A promoção foi excluída do sistema.', 'success');
}

function visualizarTransacao(id) {
  console.log('Visualizando transação:', id);
  showNotification('Modal de visualização será implementado em breve', 'info');
}

function aprovarTransacao(id) {
  console.log('Aprovando transação:', id);
  showNotification('Transação aprovada com sucesso! O ticket foi processado.', 'success');
}

function rejeitarTransacao(id) {
  console.log('Rejeitando transação:', id);
  showNotification('Transação rejeitada! O ticket foi negado e não será processado.', 'warning');
}

function filtrarTransacoes() {
  console.log('Filtrando transações...');
  showNotification('Filtros aplicados!', 'info');
}

function filtrarAuditoria() {
  console.log('Filtrando auditoria...');
  showNotification('Filtros aplicados!', 'info');
}

// Função de logout já está importada do auth.js

// Exportar funções para uso global (compatibilidade com HTML)
window.showPage = showPage;
window.showNotification = showNotification;

// Funções de formulários
window.salvarProduto = salvarProduto;
window.salvarFuncionario = salvarFuncionario;
window.salvarAnuncio = salvarAnuncio;
window.salvarPerfil = salvarPerfil;

// Funções de produtos
window.editarProduto = editarProduto;
window.excluirProduto = excluirProduto;
window.pesquisarProdutos = pesquisarProdutos;
window.aplicarFiltros = aplicarFiltros;
window.aplicarFiltrosAuto = aplicarFiltrosAuto;
window.limparFiltros = limparFiltros;
// pesquisarProdutosAuto é definida no arquivo catalogo.js

// Funções de funcionários
window.editarFuncionario = editarFuncionario;
window.excluirFuncionario = excluirFuncionario;
window.toggleFuncionario = toggleFuncionario;
window.pesquisarFuncionarios = pesquisarFuncionarios;
window.aplicarFiltrosFuncionarios = aplicarFiltrosFuncionarios;
window.aplicarFiltrosFuncionariosAuto = aplicarFiltrosFuncionariosAuto;
window.limparFiltrosFuncionarios = limparFiltrosFuncionarios;

// Funções de anúncios
window.editarAnuncio = editarAnuncio;
window.excluirAnuncio = excluirAnuncio;
window.pesquisarAnuncios = pesquisarAnuncios;
window.aplicarFiltrosAnuncios = aplicarFiltrosAnuncios;
window.aplicarFiltrosAnunciosAuto = aplicarFiltrosAnunciosAuto;
window.limparFiltrosAnuncios = limparFiltrosAnuncios;

// Funções de transações
window.visualizarTransacao = visualizarTransacao;
window.aprovarTransacao = aprovarTransacao;
window.rejeitarTransacao = rejeitarTransacao;
window.filtrarTransacoes = filtrarTransacoes;
window.filtrarAuditoria = filtrarAuditoria;
window.aplicarFiltrosTransacoesAuto = aplicarFiltrosTransacoesAuto;
window.limparFiltrosTransacoes = limparFiltrosTransacoes;
window.aplicarFiltrosAuditoriaAuto = aplicarFiltrosAuditoriaAuto;
window.limparFiltrosAuditoria = limparFiltrosAuditoria;

// Funções específicas do Dashboard
window.filtrarTickets = filtrarTickets;
window.aprovarTicket = aprovarTicket;
window.rejeitarTicket = rejeitarTicket;
window.visualizarTicket = visualizarTicket;

// Funções de perfil
window.adicionarFoto = adicionarFoto;
window.removerFoto = removerFoto;

// Funções de métricas
window.atualizarMetricas = atualizarMetricas;
window.aplicarFiltrosMetricas = aplicarFiltrosMetricas;
window.exportarMetricas = exportarMetricas;
window.gerarRelatorio = gerarRelatorio;
window.aplicarFiltrosMetricasAuto = aplicarFiltrosMetricasAuto;
window.limparFiltrosMetricas = limparFiltrosMetricas;

// Função de logout
window.logout = logout;

// Exportar serviços de autenticação
window.authService = authService;
window.requireAuth = requireAuth;
