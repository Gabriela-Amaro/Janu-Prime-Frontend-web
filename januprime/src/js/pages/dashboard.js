import { mockData } from "../config/mockData.js";
import { debounce } from "../utils/debounce.js";
import { showNotification } from "../utils/notifications.js";
import { getMainFooter } from "../components/main-footer.js";
import { ticketsService } from "../services/tickets.js";
import { produtosService } from "../services/produtos.js";

// Estado global da aplicação
let currentPage = "dashboard";
let ticketsPendentes = [];
let produtosAtivos = [];

// Função para obter dados do usuário logado
function getUserData() {
  try {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Erro ao obter dados do usuário:", error);
    return null;
  }
}

/**
 * Carrega dados reais da API
 */
async function carregarDadosDashboard() {
  try {
    // Carregar tickets (a API não filtra por status, filtramos localmente)
    const responseDebito = await ticketsService.listarDebito();
    const responseCredito = await ticketsService.listarCredito();

    // Tratar resposta (pode ser array direto ou objeto paginado com results)
    const ticketsDebito = Array.isArray(responseDebito)
      ? responseDebito
      : responseDebito.results || [];
    const ticketsCredito = Array.isArray(responseCredito)
      ? responseCredito
      : responseCredito.results || [];

    // Filtrar apenas tickets com status ABERTO e combinar
    ticketsPendentes = [
      ...ticketsDebito
        .filter((t) => t.status === "ABERTO")
        .map((t) => ({ ...t, tipo: "debito" })),
      ...ticketsCredito
        .filter((t) => t.status === "ABERTO")
        .map((t) => ({ ...t, tipo: "credito" })),
    ];

    console.log("Tickets pendentes carregados:", ticketsPendentes.length);

    // Atualizar UI com tickets
    atualizarTicketsUI();
    atualizarContadores();
  } catch (error) {
    console.error("Erro ao carregar dados do dashboard:", error);
    showNotification(
      "Erro ao carregar dados. Usando dados de demonstração.",
      "warning"
    );
  }
}

/**
 * Gera o HTML de um card de ticket
 */
function gerarCardTicket(ticket) {
  return `
    <div class="mb-3">
      <div class="card border-${
        ticket.tipo === "credito" ? "success" : "warning"
      }">
        <div class="card-body">
          <div class="d-flex justify-content-between align-items-start mb-3">
            <div>
              <h6 class="card-title mb-1">
                <span class="badge bg-${
                  ticket.tipo === "credito" ? "success" : "warning"
                } me-2">
                  ${ticket.tipo === "credito" ? "Crédito" : "Débito"}
                </span>
                #${ticket.codigo}
              </h6>
              <p class="text-muted small mb-0">Cliente: ${
                ticket.nome_cliente || "N/A"
              }</p>
            </div>
            <small class="text-muted">${new Date(
              ticket.created_at
            ).toLocaleDateString("pt-BR")}</small>
          </div>
          
          <div class="mb-3">
            ${
              ticket.tipo === "credito"
                ? `
              <div class="d-flex justify-content-between">
                <span class="text-muted">Valor da Nota:</span>
                <strong class="text-success">R$ ${parseFloat(
                  ticket.preco
                ).toFixed(2)}</strong>
              </div>
              <div class="d-flex justify-content-between">
                <span class="text-muted">Pontos a Creditar:</span>
                <strong class="text-primary">${ticket.pontos || 0} pts</strong>
              </div>
            `
                : `
              <div class="d-flex justify-content-between">
                <span class="text-muted">Produto:</span>
                <strong class="text-warning">${
                  ticket.nome_produto || "N/A"
                }</strong>
              </div>
              <div class="d-flex justify-content-between">
                <span class="text-muted">Pontos a Debitar:</span>
                <strong class="text-danger">${ticket.pontos} pts</strong>
              </div>
            `
            }
          </div>
          
          <div class="d-flex gap-2">
            <button class="btn btn-sm btn-success flex-fill" onclick="aprovarTicket(${
              ticket.id
            }, '${ticket.tipo}')">
              <i class="bi bi-check-lg me-1"></i>Aprovar
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="rejeitarTicket(${
              ticket.id
            }, '${ticket.tipo}')">
              <i class="bi bi-x-lg"></i>
            </button>
            <button class="btn btn-sm btn-outline-primary" onclick="visualizarTicket(${
              ticket.id
            }, '${ticket.tipo}')">
              <i class="bi bi-eye"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  `;
}

function atualizarTicketsUI() {
  const containerDebito = document.getElementById("tickets-debito-container");
  const containerCredito = document.getElementById("tickets-credito-container");

  // Separar tickets por tipo e ordenar do mais antigo para o mais recente
  const ticketsDebito = ticketsPendentes
    .filter((t) => t.tipo === "debito")
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  const ticketsCredito = ticketsPendentes
    .filter((t) => t.tipo === "credito")
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  // Atualizar container de Débito
  if (containerDebito) {
    if (ticketsDebito.length === 0) {
      containerDebito.innerHTML = `
        <div class="text-center py-4">
          <i class="bi bi-check-circle text-success" style="font-size: 2rem;"></i>
          <p class="mt-2 text-muted mb-0">Nenhum resgate pendente</p>
        </div>
      `;
    } else {
      containerDebito.innerHTML = ticketsDebito
        .map((ticket) => gerarCardTicket(ticket))
        .join("");
    }
  }

  // Atualizar container de Crédito
  if (containerCredito) {
    if (ticketsCredito.length === 0) {
      containerCredito.innerHTML = `
        <div class="text-center py-4">
          <i class="bi bi-check-circle text-success" style="font-size: 2rem;"></i>
          <p class="mt-2 text-muted mb-0">Nenhuma nota fiscal pendente</p>
        </div>
      `;
    } else {
      containerCredito.innerHTML = ticketsCredito
        .map((ticket) => gerarCardTicket(ticket))
        .join("");
    }
  }

  // Atualizar contadores nos headers
  const contadorDebito = document.getElementById("contador-debito");
  const contadorCredito = document.getElementById("contador-credito");
  if (contadorDebito) contadorDebito.textContent = ticketsDebito.length;
  if (contadorCredito) contadorCredito.textContent = ticketsCredito.length;
}

/**
 * Atualiza contadores do dashboard
 */
function atualizarContadores() {
  const contadorTickets = document.getElementById("contador-tickets-pendentes");
  if (contadorTickets) {
    contadorTickets.textContent = ticketsPendentes.length;
  }
}

export function getDashboardContent() {
  const userData = getUserData();
  const nomeUsuario = userData?.nome || "Usuário";
  const nomeEstabelecimento =
    userData?.estabelecimento?.nome || "Seu Estabelecimento";

  return `
    <div class="container-fluid">
      <!-- Header com saudação -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h1 class="text-gradient mb-0">Bem-vindo, ${nomeUsuario}!</h1>
              <p class="text-muted">Aqui está um resumo do seu estabelecimento</p>
            </div>
            <div class="text-end">
              <small class="text-muted">Última atualização: ${new Date().toLocaleString(
                "pt-BR"
              )}</small>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Cards de métricas clicáveis -->
      <div class="row mb-4">
        <div class="col-xl-3 col-md-6 mb-4">
          <div class="card border-left-primary clickable-card" onclick="showPage('transacoes')" style="cursor: pointer;">
            <div class="card-body">
              <div class="row no-gutters align-items-center">
                <div class="col mr-2">
                  <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Tickets Pendentes
                  </div>
                  <div class="h5 mb-0 font-weight-bold text-gray-800" id="contador-tickets-pendentes">
                    <span class="spinner-border spinner-border-sm" role="status"></span>
                  </div>
                  <div class="text-xs text-warning">
                    <i class="bi bi-exclamation-triangle me-1"></i>Requer atenção
                  </div>
                </div>
                <div class="col-auto">
                  <i class="bi bi-clock-history fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-xl-3 col-md-6 mb-4">
          <div class="card border-left-success clickable-card" onclick="showPage('catalogo')" style="cursor: pointer;">
            <div class="card-body">
              <div class="row no-gutters align-items-center">
                <div class="col mr-2">
                  <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Produtos Ativos
                  </div>
                  <div class="h5 mb-0 font-weight-bold text-gray-800">${
                    mockData.produtos.filter((p) => p.ativo).length
                  }</div>
                  <div class="text-xs text-success">
                    <i class="bi bi-arrow-up me-1"></i>Disponíveis para resgate
                  </div>
                </div>
                <div class="col-auto">
                  <i class="bi bi-box-seam fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-xl-3 col-md-6 mb-4">
          <div class="card border-left-info clickable-card" onclick="showPage('funcionarios')" style="cursor: pointer;">
            <div class="card-body">
              <div class="row no-gutters align-items-center">
                <div class="col mr-2">
                  <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                    Funcionários
                  </div>
                  <div class="h5 mb-0 font-weight-bold text-gray-800">${
                    mockData.funcionarios.length
                  }</div>
                  <div class="text-xs text-info">
                    <i class="bi bi-people me-1"></i>Equipe ativa
                  </div>
                </div>
                <div class="col-auto">
                  <i class="bi bi-people fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-xl-3 col-md-6 mb-4">
          <div class="card border-left-warning clickable-card" onclick="showPage('anuncios')" style="cursor: pointer;">
            <div class="card-body">
              <div class="row no-gutters align-items-center">
                <div class="col mr-2">
                  <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    Anúncios Ativos
                  </div>
                  <div class="h5 mb-0 font-weight-bold text-gray-800">${
                    mockData.anuncios.filter((a) => a.ativo).length
                  }</div>
                  <div class="text-xs text-warning">
                    <i class="bi bi-megaphone me-1"></i>Promoções ativas
                  </div>
                </div>
                <div class="col-auto">
                  <i class="bi bi-megaphone fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Ações Rápidas - Reposicionadas para cima -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h6 class="m-0 font-weight-bold text-primary">
                <i class="bi bi-lightning me-2"></i>Ações Rápidas
              </h6>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-lg-3 col-md-6 mb-3">
                  <button class="btn btn-outline-primary w-100" onclick="showPage('catalogo')">
                    <i class="bi bi-plus-circle me-2"></i>Adicionar Produto
                  </button>
                </div>
                <div class="col-lg-3 col-md-6 mb-3">
                  <button class="btn btn-outline-success w-100" onclick="showPage('anuncios')">
                    <i class="bi bi-megaphone me-2"></i>Criar Anúncio
                  </button>
                </div>
                <div class="col-lg-3 col-md-6 mb-3">
                  <button class="btn btn-outline-info w-100" onclick="showPage('funcionarios')">
                    <i class="bi bi-person-plus me-2"></i>Adicionar Funcionário
                  </button>
                </div>
                <div class="col-lg-3 col-md-6 mb-3">
                  <button class="btn btn-outline-warning w-100" onclick="showPage('metricas')">
                    <i class="bi bi-graph-up me-2"></i>Ver Métricas
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Seção principal com tickets e sidebar -->
      <div class="row">
        <!-- Tickets de Débito (Resgates) -->
        <div class="col-lg-4 mb-4">
          <div class="card h-100">
            <div class="card-header d-flex justify-content-between align-items-center bg-warning bg-opacity-10 py-2">
              <h6 class="m-0 font-weight-bold text-warning small">
                <i class="bi bi-cart-check me-1"></i>Resgates (Débito)
                <span class="badge bg-warning text-dark ms-1" id="contador-debito">0</span>
              </h6>
              <div class="input-group input-group-sm" style="width: 120px;">
                <input type="text" class="form-control form-control-sm" placeholder="Buscar..." id="searchTicketsDebito" oninput="filtrarTicketsDebito()">
                <span class="input-group-text py-0">
                  <i class="bi bi-search small"></i>
                </span>
              </div>
            </div>
            <div class="card-body p-2" style="max-height: 590px; overflow-y: auto; overflow-x: hidden;">
              <div id="tickets-debito-container">
                <div class="text-center py-4">
                  <div class="spinner-border spinner-border-sm text-warning" role="status">
                    <span class="visually-hidden">Carregando...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Tickets de Crédito (Notas Fiscais) -->
        <div class="col-lg-4 mb-4">
          <div class="card h-100">
            <div class="card-header d-flex justify-content-between align-items-center bg-success bg-opacity-10 py-2">
              <h6 class="m-0 font-weight-bold text-success small">
                <i class="bi bi-receipt me-1"></i>Notas Fiscais (Crédito)
                <span class="badge bg-success ms-1" id="contador-credito">0</span>
              </h6>
              <div class="input-group input-group-sm" style="width: 120px;">
                <input type="text" class="form-control form-control-sm" placeholder="Buscar..." id="searchTicketsCredito" oninput="filtrarTicketsCredito()">
                <span class="input-group-text py-0">
                  <i class="bi bi-search small"></i>
                </span>
              </div>
            </div>
            <div class="card-body p-2" style="max-height: 590px; overflow-y: auto; overflow-x: hidden;">
              <div id="tickets-credito-container">
                <div class="text-center py-4">
                  <div class="spinner-border spinner-border-sm text-success" role="status">
                    <span class="visually-hidden">Carregando...</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Sidebar com previews -->
        <div class="col-lg-4">
          <!-- Preview do Perfil -->
          <div class="card mb-3">
            <div class="card-header d-flex justify-content-between align-items-center py-2">
              <h6 class="m-0 font-weight-bold text-primary small">
                <i class="bi bi-building me-1"></i>Perfil da Empresa
              </h6>
              <button class="btn btn-sm btn-outline-primary py-0 px-1" onclick="showPage('perfil')">
                <i class="bi bi-pencil small"></i>
              </button>
            </div>
            <div class="card-body py-2 text-center">
              <div class="mb-2">
                <img src="/assets/images/logo.svg" alt="Logo" class="rounded-circle" width="50" height="50">
              </div>
              <h6 class="mb-1 small">${nomeEstabelecimento}</h6>
              <p class="text-muted small mb-2">endereço</p>
              <div class="row text-center">
                <div class="col-6">
                  <small class="text-muted d-block" style="font-size: 0.7rem;">Telefone</small>
                  <small class="fw-bold" style="font-size: 0.75rem;">(00)00000-0000</small>
                </div>
                <div class="col-6">
                  <small class="text-muted d-block" style="font-size: 0.7rem;">Status</small>
                  <span class="badge bg-success" style="font-size: 0.65rem;">Ativo</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Resumo de Atividades -->
          <div class="card mb-3">
            <div class="card-header py-2">
              <h6 class="m-0 font-weight-bold text-primary small">
                <i class="bi bi-activity me-1"></i>Resumo de Atividades
              </h6>
            </div>
            <div class="card-body py-2">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted small">Hoje</span>
                <span class="badge bg-primary">${
                  mockData.transacoes.filter(
                    (t) =>
                      new Date(t.data).toDateString() ===
                      new Date().toDateString()
                  ).length
                } transações</span>
              </div>
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted small">Esta semana</span>
                <span class="badge bg-success">${
                  mockData.transacoes.filter((t) => {
                    const ticketDate = new Date(t.data);
                    const weekAgo = new Date();
                    weekAgo.setDate(weekAgo.getDate() - 7);
                    return ticketDate >= weekAgo;
                  }).length
                } transações</span>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <span class="text-muted small">Total de clientes</span>
                <span class="badge bg-info">1,247</span>
              </div>
            </div>
          </div>
          
          <!-- Preview dos Produtos -->
          <div class="card mb-3">
            <div class="card-header d-flex justify-content-between align-items-center py-2">
              <h6 class="m-0 font-weight-bold text-primary small">
                <i class="bi bi-box-seam me-1"></i>Produtos Recentes
              </h6>
              <button class="btn btn-sm btn-outline-primary py-0 px-1" onclick="showPage('catalogo')">
                <i class="bi bi-arrow-right small"></i>
              </button>
            </div>
            <div class="card-body py-2">
              ${mockData.produtos
                .slice(0, 3)
                .map(
                  (produto) => `
                <div class="d-flex align-items-center mb-2">
                  <div class="flex-shrink-0">
                    <div class="bg-primary rounded-circle d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
                      <i class="bi bi-gift text-white small"></i>
                    </div>
                  </div>
                  <div class="flex-grow-1 ms-2">
                    <p class="mb-0 small">${produto.nome}</p>
                    <small class="text-muted" style="font-size: 0.7rem;">${
                      produto.pontos
                    } pts</small>
                  </div>
                  <span class="badge ${
                    produto.ativo ? "bg-success" : "bg-secondary"
                  }" style="font-size: 0.65rem;">${
                    produto.ativo ? "Ativo" : "Inativo"
                  }</span>
                </div>
              `
                )
                .join("")}
              
              ${
                mockData.produtos.length === 0
                  ? `
                <div class="text-center py-2">
                  <i class="bi bi-box text-muted"></i>
                  <p class="text-muted small mt-1 mb-0">Nenhum produto</p>
                </div>
              `
                  : `
                <div class="text-center mt-2 pt-2 border-top">
                  <button class="btn btn-outline-primary btn-sm py-0" onclick="showPage('catalogo')">
                    <small><i class="bi bi-arrow-right me-1"></i>Ver Todos</small>
                  </button>
                </div>
              `
              }
            </div>
          </div>
        </div>
      </div>
    </div>
    
    ${getMainFooter()}
  `;
}

// Função de busca automática com debounce
const filtrarTicketsAuto = debounce(() => {
  filtrarTickets();
}, 300);

// Exportar para escopo global
window.filtrarTicketsAuto = filtrarTicketsAuto;

function filtrarTicketsDebito() {
  const searchTerm =
    document.getElementById("searchTicketsDebito")?.value.toLowerCase() || "";
  const containerDebito = document.getElementById("tickets-debito-container");

  if (!containerDebito) return;

  // Filtrar tickets de débito
  let ticketsFiltrados = ticketsPendentes
    .filter((t) => t.tipo === "debito")
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  // Aplicar filtro de busca
  if (searchTerm) {
    ticketsFiltrados = ticketsFiltrados.filter(
      (t) =>
        (t.nome_cliente && t.nome_cliente.toLowerCase().includes(searchTerm)) ||
        (t.codigo && t.codigo.toString().toLowerCase().includes(searchTerm)) ||
        (t.nome_produto && t.nome_produto.toLowerCase().includes(searchTerm))
    );
  }

  // Atualizar container
  if (ticketsFiltrados.length === 0) {
    containerDebito.innerHTML = `
      <div class="text-center py-4">
        <i class="bi bi-search text-muted" style="font-size: 2rem;"></i>
        <p class="mt-2 text-muted mb-0">${
          searchTerm ? "Nenhum resultado encontrado" : "Nenhum resgate pendente"
        }</p>
      </div>
    `;
  } else {
    containerDebito.innerHTML = ticketsFiltrados
      .map((ticket) => gerarCardTicket(ticket))
      .join("");
  }

  // Atualizar contador
  const contadorDebito = document.getElementById("contador-debito");
  if (contadorDebito) contadorDebito.textContent = ticketsFiltrados.length;
}

function filtrarTicketsCredito() {
  const searchTerm =
    document.getElementById("searchTicketsCredito")?.value.toLowerCase() || "";
  const containerCredito = document.getElementById("tickets-credito-container");

  if (!containerCredito) return;

  // Filtrar tickets de crédito
  let ticketsFiltrados = ticketsPendentes
    .filter((t) => t.tipo === "credito")
    .sort((a, b) => new Date(a.created_at) - new Date(b.created_at));

  // Aplicar filtro de busca
  if (searchTerm) {
    ticketsFiltrados = ticketsFiltrados.filter(
      (t) =>
        (t.nome_cliente && t.nome_cliente.toLowerCase().includes(searchTerm)) ||
        (t.codigo && t.codigo.toString().toLowerCase().includes(searchTerm)) ||
        (t.numero_nota && t.numero_nota.toString().includes(searchTerm))
    );
  }

  // Atualizar container
  if (ticketsFiltrados.length === 0) {
    containerCredito.innerHTML = `
      <div class="text-center py-4">
        <i class="bi bi-search text-muted" style="font-size: 2rem;"></i>
        <p class="mt-2 text-muted mb-0">${
          searchTerm
            ? "Nenhum resultado encontrado"
            : "Nenhuma nota fiscal pendente"
        }</p>
      </div>
    `;
  } else {
    containerCredito.innerHTML = ticketsFiltrados
      .map((ticket) => gerarCardTicket(ticket))
      .join("");
  }

  // Atualizar contador
  const contadorCredito = document.getElementById("contador-credito");
  if (contadorCredito) contadorCredito.textContent = ticketsFiltrados.length;
}

// Exportar funções de filtro para escopo global
window.filtrarTicketsDebito = filtrarTicketsDebito;
window.filtrarTicketsCredito = filtrarTicketsCredito;

// Função alternativa simples para teste
window.testFiltrarTickets = function () {
  console.log("Teste de filtro de tickets");
  const input = document.getElementById("searchTickets");
  if (input) {
    console.log("Input encontrado:", input.value);
    filtrarTickets();
  } else {
    console.log("Input não encontrado");
  }
};

// Funções específicas para o Dashboard
export function filtrarTickets() {
  const searchTerm =
    document.getElementById("searchTickets")?.value.toLowerCase() || "";
  const filterTipo = document.getElementById("filterTipoTicket")?.value || "";

  let ticketsFiltrados = mockData.transacoes.filter(
    (t) => t.status === "pendente"
  );

  // Filtro por tipo
  if (filterTipo) {
    ticketsFiltrados = ticketsFiltrados.filter((t) => t.tipo === filterTipo);
  }

  // Filtro por busca
  if (searchTerm) {
    ticketsFiltrados = ticketsFiltrados.filter(
      (t) =>
        t.cliente.toLowerCase().includes(searchTerm) ||
        t.id.toString().includes(searchTerm) ||
        (t.produto && t.produto.toLowerCase().includes(searchTerm))
    );
  }

  // Atualizar a exibição dos tickets
  const container = document.getElementById("tickets-container");
  if (container) {
    container.innerHTML =
      ticketsFiltrados
        .map(
          (ticket) => `
      <div class="col-md-6 mb-3">
        <div class="card h-100 border-${
          ticket.tipo === "credito" ? "success" : "warning"
        }">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <div>
                <h6 class="card-title mb-1">
                  <span class="badge bg-${
                    ticket.tipo === "credito" ? "success" : "warning"
                  } me-2">
                    ${ticket.tipo === "credito" ? "Crédito" : "Débito"}
                  </span>
                  Ticket #${ticket.id}
                </h6>
                <p class="text-muted small mb-0">Cliente: ${ticket.cliente}</p>
              </div>
              <small class="text-muted">${new Date(
                ticket.data
              ).toLocaleDateString("pt-BR")}</small>
            </div>
            
            <div class="mb-3">
              ${
                ticket.tipo === "credito"
                  ? `
                <div class="d-flex justify-content-between">
                  <span class="text-muted">Valor da Nota:</span>
                  <strong class="text-success">R$ ${ticket.valor}</strong>
                </div>
                <div class="d-flex justify-content-between">
                  <span class="text-muted">Pontos a Creditar:</span>
                  <strong class="text-primary">${ticket.pontos} pts</strong>
                </div>
              `
                  : `
                <div class="d-flex justify-content-between">
                  <span class="text-muted">Produto:</span>
                  <strong class="text-warning">${ticket.produto}</strong>
                </div>
                <div class="d-flex justify-content-between">
                  <span class="text-muted">Pontos a Debitar:</span>
                  <strong class="text-danger">${ticket.pontos} pts</strong>
                </div>
              `
              }
            </div>
            
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-success flex-fill" onclick="aprovarTicket(${
                ticket.id
              })">
                <i class="bi bi-check-lg me-1"></i>Aprovar
              </button>
              <button class="btn btn-sm btn-outline-danger" onclick="rejeitarTicket(${
                ticket.id
              })">
                <i class="bi bi-x-lg"></i>
              </button>
              <button class="btn btn-sm btn-outline-primary" onclick="visualizarTicket(${
                ticket.id
              })">
                <i class="bi bi-eye"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    `
        )
        .join("") ||
      `
      <div class="col-12 text-center py-5">
        <i class="bi bi-search text-muted" style="font-size: 3rem;"></i>
        <h5 class="mt-3 text-muted">Nenhum ticket encontrado!</h5>
        <p class="text-muted">Tente ajustar os filtros de busca.</p>
      </div>
    `;
  }
}

export async function aprovarTicket(id, tipo) {
  console.log("Aprovando ticket:", id, tipo);
  try {
    if (tipo === "debito") {
      await ticketsService.aprovarDebito(id);
    } else {
      await ticketsService.aprovarCredito(id);
    }
    showNotification("Ticket aprovado com sucesso!", "success");
    // Recarregar dados
    await carregarDadosDashboard();
  } catch (error) {
    console.error("Erro ao aprovar ticket:", error);
    showNotification("Erro ao aprovar ticket: " + error.message, "error");
  }
}

export async function rejeitarTicket(id, tipo) {
  console.log("Rejeitando ticket:", id, tipo);
  try {
    if (tipo === "debito") {
      await ticketsService.recusarDebito(id);
    } else {
      await ticketsService.recusarCredito(id);
    }
    showNotification("Ticket recusado!", "warning");
    // Recarregar dados
    await carregarDadosDashboard();
  } catch (error) {
    console.error("Erro ao recusar ticket:", error);
    showNotification("Erro ao recusar ticket: " + error.message, "error");
  }
}

export function visualizarTicket(id, tipo) {
  console.log("Visualizando ticket:", id, tipo);

  // Buscar ticket do array local
  const ticket = ticketsPendentes.find((t) => t.id === id && t.tipo === tipo);

  if (!ticket) {
    showNotification("Ticket não encontrado", "error");
    return;
  }

  // Modal diferenciado para crédito e débito
  let detalhesHTML = "";

  if (tipo === "credito") {
    // Ticket de Crédito - Layout otimizado para verificação de nota fiscal
    const imagemNota = ticket.imagem
      ? `
      <div class="col-lg-5 mb-3 mb-lg-0">
        <div class="card h-100 bg-dark">
          <div class="card-header bg-primary text-white py-2">
            <h6 class="mb-0"><i class="bi bi-image me-2"></i>Imagem da Nota Fiscal</h6>
          </div>
          <div class="card-body p-2 d-flex align-items-center justify-content-center" style="min-height: 300px;">
            <a href="${ticket.imagem}" target="_blank" title="Clique para ampliar">
              <img src="${ticket.imagem}" alt="Nota Fiscal" class="img-fluid rounded" style="max-height: 280px; cursor: zoom-in;">
            </a>
          </div>
          <div class="card-footer text-center py-2">
            <a href="${ticket.imagem}" target="_blank" class="btn btn-sm btn-outline-light">
              <i class="bi bi-arrows-fullscreen me-1"></i>Abrir em Nova Aba
            </a>
          </div>
        </div>
      </div>
    `
      : `
      <div class="col-lg-5 mb-3 mb-lg-0">
        <div class="card h-100 bg-secondary">
          <div class="card-body d-flex flex-column align-items-center justify-content-center text-muted" style="min-height: 300px;">
            <i class="bi bi-image text-muted" style="font-size: 4rem;"></i>
            <p class="mt-2 mb-0">Nenhuma imagem enviada</p>
          </div>
        </div>
      </div>
    `;

    detalhesHTML = `
      <div class="row">
        ${imagemNota}
        
        <div class="col-lg-7">
          <!-- Dados do Cliente -->
          <div class="card mb-3">
            <div class="card-header bg-info bg-opacity-25 py-2">
              <h6 class="mb-0 text-info"><i class="bi bi-person-badge me-2"></i>Dados do Cliente</h6>
            </div>
            <div class="card-body py-2">
              <div class="row">
                <div class="col-6">
                  <small class="text-muted d-block">Nome</small>
                  <strong>${ticket.nome_cliente || "N/A"}</strong>
                </div>
                <div class="col-6">
                  <small class="text-muted d-block">Data do Envio</small>
                  <strong>${new Date(ticket.created_at).toLocaleString(
                    "pt-BR"
                  )}</strong>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Dados da Nota para Verificação -->
          <div class="card mb-3 border-warning">
            <div class="card-header bg-warning bg-opacity-25 py-2">
              <h6 class="mb-0 text-warning"><i class="bi bi-clipboard-check me-2"></i>Dados para Verificação</h6>
            </div>
            <div class="card-body py-2">
              <div class="row g-2">
                <div class="col-6">
                  <div class="bg-dark bg-opacity-10 rounded p-2">
                    <small class="text-muted d-block">Nº da Nota</small>
                    <strong class="fs-5">${ticket.numero_nota || "N/A"}</strong>
                  </div>
                </div>
                <div class="col-6">
                  <div class="bg-dark bg-opacity-10 rounded p-2">
                    <small class="text-muted d-block">Data da Nota</small>
                    <strong class="fs-5">${
                      ticket.data_nota
                        ? new Date(ticket.data_nota).toLocaleDateString("pt-BR")
                        : "N/A"
                    }</strong>
                  </div>
                </div>
                <div class="col-6">
                  <div class="bg-success bg-opacity-10 rounded p-2">
                    <small class="text-muted d-block">Valor Total</small>
                    <strong class="fs-4 text-success">R$ ${parseFloat(
                      ticket.preco || 0
                    ).toFixed(2)}</strong>
                  </div>
                </div>
                <div class="col-6">
                  <div class="bg-primary bg-opacity-10 rounded p-2">
                    <small class="text-muted d-block">Estabelecimento</small>
                    <strong>${ticket.nome_estabelecimento || "N/A"}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Resultado -->
          <div class="card border-success">
            <div class="card-header bg-success bg-opacity-25 py-2">
              <h6 class="mb-0 text-success"><i class="bi bi-coin me-2"></i>Pontos a Creditar</h6>
            </div>
            <div class="card-body py-3 text-center">
              <span class="display-5 fw-bold text-success">${
                ticket.pontos || 0
              }</span>
              <span class="text-muted ms-2">pontos</span>
            </div>
          </div>
        </div>
      </div>
      ${
        ticket.observacao
          ? `
        <div class="alert alert-secondary mt-3 mb-0">
          <i class="bi bi-chat-left-text me-2"></i>
          <strong>Observação:</strong> ${ticket.observacao}
        </div>
      `
          : ""
      }
    `;
  } else {
    // Ticket de Débito - Layout elegante para resgate de produto
    detalhesHTML = `
      <div class="row">
        <!-- Card do Produto -->
        <div class="col-lg-5 mb-3 mb-lg-0">
          <div class="card h-100 bg-dark">
            <div class="card-header bg-warning text-dark py-2">
              <h6 class="mb-0"><i class="bi bi-gift me-2"></i>Produto Solicitado</h6>
            </div>
            <div class="card-body d-flex flex-column align-items-center justify-content-center text-center" style="min-height: 250px;">
              <i class="bi bi-box-seam text-warning" style="font-size: 5rem;"></i>
              <h4 class="mt-3 mb-2 text-warning">${
                ticket.nome_produto || "Produto"
              }</h4>
              <div class="bg-danger bg-opacity-25 rounded-pill px-4 py-2 mt-2">
                <span class="text-danger fw-bold fs-5">
                  <i class="bi bi-dash-circle me-1"></i>${ticket.pontos} pontos
                </span>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-lg-7">
          <!-- Dados do Cliente -->
          <div class="card mb-3">
            <div class="card-header bg-info bg-opacity-25 py-2">
              <h6 class="mb-0 text-info"><i class="bi bi-person-badge me-2"></i>Dados do Cliente</h6>
            </div>
            <div class="card-body py-2">
              <div class="row">
                <div class="col-6">
                  <small class="text-muted d-block">Nome</small>
                  <strong>${ticket.nome_cliente || "N/A"}</strong>
                </div>
                <div class="col-6">
                  <small class="text-muted d-block">Data da Solicitação</small>
                  <strong>${new Date(ticket.created_at).toLocaleString(
                    "pt-BR"
                  )}</strong>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Detalhes do Resgate -->
          <div class="card border-warning">
            <div class="card-header bg-warning bg-opacity-25 py-2">
              <h6 class="mb-0 text-warning"><i class="bi bi-info-circle me-2"></i>Detalhes do Resgate</h6>
            </div>
            <div class="card-body py-2">
              <div class="row g-2">
                <div class="col-12">
                  <div class="bg-dark bg-opacity-10 rounded p-2">
                    <small class="text-muted d-block">Código do Ticket</small>
                    <strong class="fs-5 font-monospace">#${
                      ticket.codigo
                    }</strong>
                  </div>
                </div>
                <div class="col-6">
                  <div class="bg-dark bg-opacity-10 rounded p-2">
                    <small class="text-muted d-block">Status</small>
                    <span class="badge bg-${
                      ticket.status === "ABERTO"
                        ? "warning"
                        : ticket.status === "APROVADO"
                        ? "success"
                        : "secondary"
                    } fs-6">
                      ${ticket.status}
                    </span>
                  </div>
                </div>
                <div class="col-6">
                  <div class="bg-danger bg-opacity-10 rounded p-2">
                    <small class="text-muted d-block">Pontos a Debitar</small>
                    <strong class="fs-4 text-danger">${ticket.pontos}</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      ${
        ticket.observacao
          ? `
        <div class="alert alert-secondary mt-3 mb-0">
          <i class="bi bi-chat-left-text me-2"></i>
          <strong>Observação:</strong> ${ticket.observacao}
        </div>
      `
          : ""
      }
    `;
  }

  const modalHtml = `
    <div class="modal fade" id="ticketModal" tabindex="-1" aria-labelledby="ticketModalLabel" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-${
            tipo === "credito" ? "success" : "warning"
          } text-white">
            <h5 class="modal-title" id="ticketModalLabel">
              <i class="bi bi-ticket-perforated me-2"></i>
              Ticket ${tipo === "credito" ? "de Crédito" : "de Débito"} #${
    ticket.codigo
  }
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <span class="badge bg-${
                tipo === "credito" ? "success" : "warning"
              } fs-6">
                ${
                  tipo === "credito"
                    ? "Crédito de Pontos"
                    : "Resgate de Produto"
                }
              </span>
              <span class="badge bg-info fs-6">
                Status: ${ticket.status}
              </span>
            </div>
            ${detalhesHTML}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
            ${
              ticket.status === "ABERTO"
                ? `
              <button type="button" class="btn btn-danger" onclick="rejeitarTicket(${ticket.id}, '${tipo}'); bootstrap.Modal.getInstance(document.getElementById('ticketModal')).hide();">
                <i class="bi bi-x-lg me-1"></i>Recusar
              </button>
              <button type="button" class="btn btn-success" onclick="aprovarTicket(${ticket.id}, '${tipo}'); bootstrap.Modal.getInstance(document.getElementById('ticketModal')).hide();">
                <i class="bi bi-check-lg me-1"></i>Aprovar
              </button>
            `
                : ""
            }
          </div>
        </div>
      </div>
    </div>
  `;

  // Remover modal existente se houver
  const existingModal = document.getElementById("ticketModal");
  if (existingModal) {
    existingModal.remove();
  }

  // Adicionar novo modal ao body
  document.body.insertAdjacentHTML("beforeend", modalHtml);

  // Mostrar o modal
  const modal = new window.bootstrap.Modal(
    document.getElementById("ticketModal")
  );
  modal.show();
}

// Exportar funções para escopo global
window.carregarDadosDashboard = carregarDadosDashboard;
window.aprovarTicket = aprovarTicket;
window.rejeitarTicket = rejeitarTicket;
window.visualizarTicket = visualizarTicket;
