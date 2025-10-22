import { APP_CONFIG } from "../config/app.js";
import { mockData } from "../config/mockData.js";
import { debounce } from "../utils/debounce.js";
import { showNotification } from "../utils/notifications.js";
import { getMainFooter } from "../components/main-footer.js";

// Estado global da aplicação
let currentPage = "dashboard";
let currentUser = {
  nome: "João Silva",
  email: "joao@pizzariasaborlocal.com",
  tipo: "admin",
};

export function getDashboardContent() {
  return `
    <div class="container-fluid">
      <!-- Header com saudação -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="d-flex justify-content-between align-items-center">
            <div>
              <h1 class="text-gradient mb-0">Bem-vindo, ${
                currentUser.nome
              }!</h1>
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
                  <div class="h5 mb-0 font-weight-bold text-gray-800">${
                    mockData.transacoes.filter((t) => t.status === "pendente")
                      .length
                  }</div>
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
      
      <!-- Seção principal com tickets e previews -->
      <div class="row">
        <!-- Tickets Pendentes -->
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h6 class="m-0 font-weight-bold text-primary">
                <i class="bi bi-ticket-perforated me-2"></i>Tickets Pendentes
              </h6>
              <div class="d-flex gap-2">
                <div class="input-group input-group-sm" style="width: 200px;">
                  <input type="text" class="form-control" placeholder="Buscar..." id="searchTickets" oninput="testFiltrarTickets()">
                  <span class="input-group-text">
                    <i class="bi bi-search"></i>
                  </span>
                </div>
                <div class="dropdown" style="width: 120px;">
                  <select class="form-select form-select-sm" id="filterTipoTicket" onchange="testFiltrarTickets()">
                    <option value="">Todos</option>
                    <option value="credito">Crédito</option>
                    <option value="debito">Débito</option>
                  </select>
                  <i class="bi bi-chevron-down dropdown-icon"></i>
                </div>
              </div>
            </div>
            <div class="card-body">
              <div class="row" id="tickets-container">
                ${mockData.transacoes
                  .filter((t) => t.status === "pendente")
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
                                ticket.tipo === "credito"
                                  ? "success"
                                  : "warning"
                              } me-2">
                                ${
                                  ticket.tipo === "credito"
                                    ? "Crédito"
                                    : "Débito"
                                }
                              </span>
                              Ticket #${ticket.id}
                            </h6>
                            <p class="text-muted small mb-0">Cliente: ${
                              ticket.cliente
                            }</p>
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
                  .join("")}
                
                ${
                  mockData.transacoes.filter((t) => t.status === "pendente")
                    .length === 0
                    ? `
                  <div class="col-12 text-center py-5">
                    <i class="bi bi-check-circle text-success" style="font-size: 3rem;"></i>
                    <h5 class="mt-3 text-muted">Nenhum ticket pendente!</h5>
                    <p class="text-muted">Todos os tickets foram processados.</p>
                  </div>
                `
                    : ""
                }
              </div>
            </div>
          </div>
        </div>
        
        <!-- Sidebar com previews -->
        <div class="col-lg-4">
          <!-- Preview do Perfil -->
          <div class="card mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h6 class="m-0 font-weight-bold text-primary">
                <i class="bi bi-building me-2"></i>Perfil da Empresa
              </h6>
              <button class="btn btn-sm btn-outline-primary" onclick="showPage('perfil')">
                <i class="bi bi-pencil"></i>
              </button>
            </div>
            <div class="card-body text-center">
              <div class="mb-3">
                <img src="/assets/images/logo.svg" alt="Logo" class="rounded-circle" width="60" height="60">
              </div>
              <h6 class="mb-1">${APP_CONFIG.empresa.nome}</h6>
              <p class="text-muted small mb-2">${
                APP_CONFIG.empresa.endereco
              }</p>
              <div class="row text-center">
                <div class="col-6">
                  <small class="text-muted d-block">Telefone</small>
                  <small class="fw-bold">${APP_CONFIG.empresa.telefone}</small>
                </div>
                <div class="col-6">
                  <small class="text-muted d-block">Status</small>
                  <span class="badge bg-success">Ativo</span>
                </div>
              </div>
            </div>
          </div>
          
          <!-- Resumo de Atividades -->
          <div class="card mb-4">
            <div class="card-header">
              <h6 class="m-0 font-weight-bold text-primary">
                <i class="bi bi-activity me-2"></i>Resumo de Atividades
              </h6>
            </div>
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="text-muted">Hoje</span>
                <span class="badge bg-primary">${
                  mockData.transacoes.filter(
                    (t) =>
                      new Date(t.data).toDateString() ===
                      new Date().toDateString()
                  ).length
                } transações</span>
              </div>
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="text-muted">Esta semana</span>
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
                <span class="text-muted">Total de clientes</span>
                <span class="badge bg-info">1,247</span>
              </div>
            </div>
          </div>
          
          <!-- Preview dos Produtos -->
          <div class="card mb-4">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h6 class="m-0 font-weight-bold text-primary">
                <i class="bi bi-box-seam me-2"></i>Produtos Recentes
              </h6>
              <button class="btn btn-sm btn-outline-primary" onclick="showPage('catalogo')">
                <i class="bi bi-arrow-right"></i>
              </button>
            </div>
            <div class="card-body">
              ${mockData.produtos
                .slice(0, 10)
                .map(
                  (produto) => `
                <div class="d-flex align-items-center mb-3">
                  <div class="flex-shrink-0">
                    <div class="bg-primary rounded-circle d-flex align-items-center justify-content-center" style="width: 40px; height: 40px;">
                      <i class="bi bi-gift text-white"></i>
                    </div>
                  </div>
                  <div class="flex-grow-1 ms-3">
                    <h6 class="mb-1">${produto.nome}</h6>
                    <small class="text-muted">${produto.pontos} pontos</small>
                  </div>
                  <span class="badge ${
                    produto.ativo ? "bg-success" : "bg-secondary"
                  }">${produto.ativo ? "Ativo" : "Inativo"}</span>
                </div>
              `
                )
                .join("")}
              
              ${
                mockData.produtos.length === 0
                  ? `
                <div class="text-center py-3">
                  <i class="bi bi-box text-muted" style="font-size: 2rem;"></i>
                  <p class="text-muted small mt-2">Nenhum produto cadastrado</p>
                </div>
              `
                  : `
                <div class="text-center mt-3 pt-3 border-top">
                  <button class="btn btn-outline-primary btn-sm" onclick="showPage('catalogo')">
                    <i class="bi bi-arrow-right me-1"></i>Ver Todos os Produtos
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

export function aprovarTicket(id) {
  console.log("Aprovando ticket:", id);
  // Encontrar o ticket e atualizar status
  const ticket = mockData.transacoes.find((t) => t.id === id);
  if (ticket) {
    ticket.status = "aprovado";
    // Recarregar a página para mostrar as mudanças
    showPage("dashboard");
    // Mostrar notificação de sucesso
    showNotification(
      "Ticket aprovado com sucesso! A transação foi processada.",
      "success"
    );
  }
}

export function rejeitarTicket(id) {
  console.log("Rejeitando ticket:", id);
  // Encontrar o ticket e atualizar status
  const ticket = mockData.transacoes.find((t) => t.id === id);
  if (ticket) {
    ticket.status = "rejeitado";
    // Recarregar a página para mostrar as mudanças
    showPage("dashboard");
    // Mostrar notificação de sucesso
    showNotification(
      "Ticket rejeitado! A transação foi negada e não será processada.",
      "warning"
    );
  }
}

export function visualizarTicket(id) {
  console.log("Visualizando ticket:", id);
  const ticket = mockData.transacoes.find((t) => t.id === id);
  if (ticket) {
    // Criar modal para visualizar detalhes do ticket
    const modalHtml = `
      <div class="modal fade" id="ticketModal" tabindex="-1" aria-labelledby="ticketModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="ticketModalLabel">
                <i class="bi bi-ticket-perforated me-2"></i>Ticket #${ticket.id}
              </h5>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="row">
                <div class="col-md-6">
                  <h6>Informações do Cliente</h6>
                  <p><strong>Nome:</strong> ${ticket.cliente}</p>
                  <p><strong>Data:</strong> ${new Date(
                    ticket.data
                  ).toLocaleDateString("pt-BR")}</p>
                  <p><strong>Tipo:</strong> 
                    <span class="badge bg-${
                      ticket.tipo === "credito" ? "success" : "warning"
                    }">
                      ${ticket.tipo === "credito" ? "Crédito" : "Débito"}
                    </span>
                  </p>
                </div>
                <div class="col-md-6">
                  <h6>Detalhes da Transação</h6>
                  ${
                    ticket.tipo === "credito"
                      ? `
                    <p><strong>Valor da Nota:</strong> R$ ${ticket.valor}</p>
                    <p><strong>Pontos a Creditar:</strong> ${ticket.pontos} pts</p>
                  `
                      : `
                    <p><strong>Produto:</strong> ${ticket.produto}</p>
                    <p><strong>Pontos a Debitar:</strong> ${ticket.pontos} pts</p>
                  `
                  }
                  <p><strong>Status:</strong> 
                    <span class="badge bg-${
                      ticket.status === "aprovado"
                        ? "success"
                        : ticket.status === "pendente"
                        ? "warning"
                        : "danger"
                    }">
                      ${ticket.status}
                    </span>
                  </p>
                </div>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
              ${
                ticket.status === "pendente"
                  ? `
                <button type="button" class="btn btn-success" onclick="aprovarTicket(${ticket.id}); bootstrap.Modal.getInstance(document.getElementById('ticketModal')).hide();">
                  <i class="bi bi-check-lg me-1"></i>Aprovar
                </button>
                <button type="button" class="btn btn-danger" onclick="rejeitarTicket(${ticket.id}); bootstrap.Modal.getInstance(document.getElementById('ticketModal')).hide();">
                  <i class="bi bi-x-lg me-1"></i>Rejeitar
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
    const modal = new bootstrap.Modal(document.getElementById("ticketModal"));
    modal.show();
  }
}
