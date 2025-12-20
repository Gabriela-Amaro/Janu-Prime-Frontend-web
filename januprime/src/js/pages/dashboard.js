import { mockData } from "../config/mockData.js";
import { debounce } from "../utils/debounce.js";
import { showNotification } from "../utils/notifications.js";
import { getMainFooter } from "../components/main-footer.js";
import { ticketsService } from "../services/tickets.js";
import { produtosService } from "../services/produtos.js";
import { estabelecimentosService } from "../services/estabelecimentos.js";
import { anunciosService } from "../services/anuncios.js";
import { administradoresService } from "../services/administradores.js";
import { exibirTicketModal } from "../components/ticket-modal.js";

// Estado global da aplicação
let currentPage = "dashboard";
let ticketsPendentes = [];
let produtosAtivos = [];
let dadosEstabelecimento = null;

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
 * Carrega dados do estabelecimento da API
 */
async function carregarDadosEstabelecimento() {
  try {
    dadosEstabelecimento = await estabelecimentosService.obterMeuEstabelecimento();
    atualizarPerfilEmpresaUI();
  } catch (error) {
    console.error("Erro ao carregar dados do estabelecimento:", error);
    // Não mostrar erro para o usuário, apenas usar dados padrão
  }
}

/**
 * Atualiza a UI do perfil da empresa no dashboard
 */
function atualizarPerfilEmpresaUI() {
  if (!dadosEstabelecimento) return;

  // Atualizar nome do estabelecimento
  const nomeElement = document.getElementById("dashboard-nome-estabelecimento");
  if (nomeElement) {
    nomeElement.textContent = dadosEstabelecimento.nome || "Seu Estabelecimento";
  }

  // Atualizar endereço
  const enderecoElement = document.getElementById("dashboard-endereco-estabelecimento");
  if (enderecoElement) {
    enderecoElement.textContent = dadosEstabelecimento.endereco || "Endereço não cadastrado";
  }

  // Atualizar telefone
  const telefoneElement = document.getElementById("dashboard-telefone-estabelecimento");
  if (telefoneElement) {
    telefoneElement.textContent = dadosEstabelecimento.telefone || "-";
  }

  // Atualizar status
  const statusElement = document.getElementById("dashboard-status-estabelecimento");
  if (statusElement) {
    const statusBadge = statusElement.querySelector(".badge");
    if (statusBadge) {
      if (dadosEstabelecimento.ativo) {
        statusBadge.textContent = "Ativo";
        statusBadge.className = "badge bg-success";
      } else {
        statusBadge.textContent = "Inativo";
        statusBadge.className = "badge bg-secondary";
      }
    }
  }
}

/**
 * Carrega dados reais da API
 */
async function carregarDadosDashboard() {
  try {
    // Carregar todos os dados em paralelo
    await Promise.all([
      carregarDadosEstabelecimento(),
      
      // Carregar tickets
      (async () => {
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
      })(),
      
      // Carregar produtos ativos e produtos recentes
      (async () => {
        try {
          const response = await produtosService.listar();
          const produtos = Array.isArray(response) ? response : response.results || [];
          const produtosAtivosCount = produtos.filter((p) => p.ativo === true).length;
          
          // Atualizar contador de produtos ativos
          const contadorProdutos = document.getElementById("contador-produtos-ativos");
          if (contadorProdutos) contadorProdutos.textContent = produtosAtivosCount;
          
          // Atualizar card de produtos recentes (últimos 3 produtos)
          const produtosRecentesContainer = document.getElementById("produtos-recentes-container");
          if (produtosRecentesContainer) {
            if (produtos.length === 0) {
              produtosRecentesContainer.innerHTML = `
                <div class="text-center py-2">
                  <i class="bi bi-box text-muted"></i>
                  <p class="text-muted small mt-1 mb-0">Nenhum produto</p>
                </div>
              `;
            } else {
              // Ordenar por data de criação (mais recentes primeiro) e pegar os 3 primeiros
              const produtosRecentes = [...produtos]
                .sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0))
                .slice(0, 3);
              
              produtosRecentesContainer.innerHTML = `
                ${produtosRecentes.map(produto => `
                  <div class="d-flex align-items-center mb-2">
                    <div class="flex-shrink-0">
                      <div class="bg-primary rounded-circle d-flex align-items-center justify-content-center" style="width: 32px; height: 32px;">
                        <i class="bi bi-gift text-white small"></i>
                      </div>
                    </div>
                    <div class="flex-grow-1 ms-2">
                      <p class="mb-0 small">${produto.nome}</p>
                      <small class="text-muted" style="font-size: 0.7rem;">${produto.pontos || 0} pts</small>
                    </div>
                    <span class="badge ${produto.ativo ? "bg-success" : "bg-secondary"}" style="font-size: 0.65rem;">
                      ${produto.ativo ? "Ativo" : "Inativo"}
                    </span>
                  </div>
                `).join('')}
                <div class="text-center mt-2 pt-2 border-top">
                  <button class="btn btn-outline-primary btn-sm py-0" onclick="showPage('catalogo')">
                    <small><i class="bi bi-arrow-right me-1"></i>Ver Todos</small>
                  </button>
                </div>
              `;
            }
          }
        } catch (error) {
          console.error("Erro ao carregar produtos:", error);
          const contadorProdutos = document.getElementById("contador-produtos-ativos");
          if (contadorProdutos) contadorProdutos.textContent = "-";
          
          const produtosRecentesContainer = document.getElementById("produtos-recentes-container");
          if (produtosRecentesContainer) {
            produtosRecentesContainer.innerHTML = `
              <div class="text-center py-2">
                <i class="bi bi-exclamation-triangle text-warning"></i>
                <p class="text-muted small mt-1 mb-0">Erro ao carregar</p>
              </div>
            `;
          }
        }
      })(),
      
      // Carregar funcionários
      (async () => {
        try {
          const response = await administradoresService.listar();
          const funcionarios = Array.isArray(response) ? response : response.results || [];
          // Filtrar apenas funcionários ativos
          const funcionariosAtivos = funcionarios.filter((f) => f.usuario?.is_active === true).length;
          
          const contadorFuncionarios = document.getElementById("contador-funcionarios");
          if (contadorFuncionarios) contadorFuncionarios.textContent = funcionariosAtivos;
        } catch (error) {
          console.error("Erro ao carregar funcionários:", error);
          const contadorFuncionarios = document.getElementById("contador-funcionarios");
          if (contadorFuncionarios) contadorFuncionarios.textContent = "-";
        }
      })(),
      
      // Carregar anúncios ativos
      (async () => {
        try {
          const response = await anunciosService.listar();
          const anuncios = Array.isArray(response) ? response : response.results || [];
          const hoje = new Date();
          // Anúncios ativos são aqueles cuja data de expiração ainda não passou
          const anunciosAtivos = anuncios.filter((a) => new Date(a.data_expiracao) >= hoje).length;
          
          const contadorAnuncios = document.getElementById("contador-anuncios-ativos");
          if (contadorAnuncios) contadorAnuncios.textContent = anunciosAtivos;
        } catch (error) {
          console.error("Erro ao carregar anúncios:", error);
          const contadorAnuncios = document.getElementById("contador-anuncios-ativos");
          if (contadorAnuncios) contadorAnuncios.textContent = "-";
        }
      })(),
      
      // Carregar resumo de atividades (transações finalizadas)
      (async () => {
        try {
          const tickets = await ticketsService.listarTodos();
          const todosTickets = Array.isArray(tickets) ? tickets : [];
          
          // Filtrar apenas tickets finalizados (não ABERTO/pendente)
          const transacoesFinalizadas = todosTickets.filter(
            (t) => t.status !== "ABERTO" && t.status !== "PENDENTE"
          );
          
          const hoje = new Date();
          hoje.setHours(0, 0, 0, 0);
          
          const semanaAtras = new Date();
          semanaAtras.setDate(semanaAtras.getDate() - 7);
          semanaAtras.setHours(0, 0, 0, 0);
          
          // Contar transações finalizadas hoje (usa updated_at - quando foi aprovado/rejeitado)
          const transacoesHoje = transacoesFinalizadas.filter((t) => {
            const dataFinalizacao = new Date(t.updated_at || t.created_at);
            dataFinalizacao.setHours(0, 0, 0, 0);
            return dataFinalizacao.getTime() === hoje.getTime();
          }).length;
          
          // Contar transações finalizadas na semana
          const transacoesSemana = transacoesFinalizadas.filter((t) => {
            const dataFinalizacao = new Date(t.updated_at || t.created_at);
            return dataFinalizacao >= semanaAtras;
          }).length;
          
          // Total de transações finalizadas
          const transacoesTotal = transacoesFinalizadas.length;
          
          // Atualizar UI
          const elHoje = document.getElementById("transacoes-hoje");
          const elSemana = document.getElementById("transacoes-semana");
          const elTotal = document.getElementById("transacoes-total");
          
          if (elHoje) elHoje.textContent = `${transacoesHoje} transações`;
          if (elSemana) elSemana.textContent = `${transacoesSemana} transações`;
          if (elTotal) elTotal.textContent = transacoesTotal.toLocaleString('pt-BR');
        } catch (error) {
          console.error("Erro ao carregar resumo de atividades:", error);
          const elHoje = document.getElementById("transacoes-hoje");
          const elSemana = document.getElementById("transacoes-semana");
          const elTotal = document.getElementById("transacoes-total");
          
          if (elHoje) elHoje.textContent = "- transações";
          if (elSemana) elSemana.textContent = "- transações";
          if (elTotal) elTotal.textContent = "-";
        }
      })(),
    ]);
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
          <div class="card border-left-primary clickable-card" onclick="scrollParaTickets()" style="cursor: pointer;">
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
                  <div class="h5 mb-0 font-weight-bold text-gray-800" id="contador-produtos-ativos">
                    <span class="spinner-border spinner-border-sm" role="status"></span>
                  </div>
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
                  <div class="h5 mb-0 font-weight-bold text-gray-800" id="contador-funcionarios">
                    <span class="spinner-border spinner-border-sm" role="status"></span>
                  </div>
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
                  <div class="h5 mb-0 font-weight-bold text-gray-800" id="contador-anuncios-ativos">
                    <span class="spinner-border spinner-border-sm" role="status"></span>
                  </div>
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
                  <button class="btn btn-outline-primary w-100" onclick="abrirModalProduto()">
                    <i class="bi bi-plus-circle me-2"></i>Adicionar Produto
                  </button>
                </div>
                <div class="col-lg-3 col-md-6 mb-3">
                  <button class="btn btn-outline-success w-100" onclick="abrirModalAnuncio()">
                    <i class="bi bi-megaphone me-2"></i>Criar Anúncio
                  </button>
                </div>
                <div class="col-lg-3 col-md-6 mb-3">
                  <button class="btn btn-outline-info w-100" onclick="abrirModalFuncionario()">
                    <i class="bi bi-person-plus me-2"></i>Adicionar Funcionário
                  </button>
                </div>
                <div class="col-lg-3 col-md-6 mb-3">
                  <button class="btn btn-outline-warning w-100" onclick="showPage('transacoes')">
                    <i class="bi bi-credit-card me-2"></i>Ver Transações
                  </button>
                </div>
                <!-- Temporariamente desabilitado
                <div class="col-lg-3 col-md-6 mb-3">
                  <button class="btn btn-outline-warning w-100" onclick="showPage('metricas')">
                    <i class="bi bi-graph-up me-2"></i>Ver Métricas
                  </button>
                </div>
                -->
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Seção principal com tickets e sidebar -->
      <div class="row" id="secao-tickets">
        <!-- Tickets de Débito (Resgates) -->
        <div class="col-lg-4 mb-4">
          <div class="card h-100">
            <div class="card-header d-flex justify-content-between align-items-center bg-warning bg-opacity-10 py-2">
              <h6 class="m-0 font-weight-bold text-warning small">
                <i class="bi bi-cart-check me-1"></i>Resgates (Débito)
                <span class="badge bg-warning text-white ms-1" id="contador-debito">0</span>
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
              <h6 class="mb-1 small" id="dashboard-nome-estabelecimento">${nomeEstabelecimento}</h6>
              <p class="text-muted small mb-2" id="dashboard-endereco-estabelecimento">Carregando...</p>
              <div class="row text-center">
                <div class="col-6">
                  <small class="text-muted d-block" style="font-size: 0.7rem;">Telefone</small>
                  <small class="fw-bold" style="font-size: 0.75rem;" id="dashboard-telefone-estabelecimento">-</small>
                </div>
                <div class="col-6" id="dashboard-status-estabelecimento">
                  <small class="text-muted d-block" style="font-size: 0.7rem;">Status</small>
                  <span class="badge bg-success" style="font-size: 0.65rem;">Carregando...</span>
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
                <span class="fw-bold text-white" id="transacoes-hoje">
                  <span class="spinner-border spinner-border-sm" role="status"></span>
                </span>
              </div>
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="text-muted small">Esta semana</span>
                <span class="fw-bold text-white" id="transacoes-semana">
                  <span class="spinner-border spinner-border-sm" role="status"></span>
                </span>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <span class="text-muted small">Total de transações</span>
                <span class="fw-bold text-white" id="transacoes-total">
                  <span class="spinner-border spinner-border-sm" role="status"></span>
                </span>
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
            <div class="card-body py-2" id="produtos-recentes-container">
              <div class="text-center py-3">
                <div class="spinner-border spinner-border-sm text-primary" role="status">
                  <span class="visually-hidden">Carregando...</span>
                </div>
              </div>
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

  // Usar o componente reutilizável de modal
  exibirTicketModal(ticket, tipo, {
    modalId: 'ticketModal',
    onAprovar: 'aprovarTicket',
    onRejeitar: 'rejeitarTicket'
  });
}

/**
 * Faz scroll suave para a seção de tickets
 */
function scrollParaTickets() {
  const secaoTickets = document.getElementById("secao-tickets");
  if (secaoTickets) {
    secaoTickets.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

/**
 * Abre o modal de produto
 */
function abrirModalProduto() {
  // Limpar formulário
  const form = document.getElementById("produtoForm");
  if (form) {
    form.reset();
  }
  
  // Limpar ID de edição
  window.produtoEditandoId = null;
  
  // Garantir que o checkbox ativo esteja marcado por padrão
  const ativoCheckbox = document.getElementById("produtoAtivo");
  if (ativoCheckbox) {
    ativoCheckbox.checked = true;
  }
  
  // Atualizar título do modal
  const modalTitle = document.getElementById("produtoModalLabel");
  if (modalTitle) {
    modalTitle.textContent = "Adicionar Produto";
  }
  
  // Abrir modal usando Bootstrap
  const modalElement = document.getElementById("produtoModal");
  if (modalElement) {
    const modal = new window.bootstrap.Modal(modalElement);
    modal.show();
  }
}

/**
 * Abre o modal de anúncio
 */
function abrirModalAnuncio() {
  // Limpar campos
  const dataExpiracaoInput = document.getElementById("anuncioDataExpiracao");
  const imagemInput = document.getElementById("anuncioImagem");
  const modalTitle = document.getElementById("anuncioModalLabel");
  
  if (dataExpiracaoInput) dataExpiracaoInput.value = '';
  if (imagemInput) imagemInput.value = '';
  if (modalTitle) modalTitle.textContent = 'Criar Anúncio';
  
  // Limpar ID de edição
  window.anuncioEditandoId = null;
  
  // Limpar formulário
  const form = document.getElementById("anuncioForm");
  if (form) {
    form.reset();
  }
  
  // Abrir modal usando Bootstrap
  const modalElement = document.getElementById("anuncioModal");
  if (modalElement) {
    const modal = new window.bootstrap.Modal(modalElement);
    modal.show();
  }
}

/**
 * Formata o campo de CPF
 */
function formatCPF(input) {
  let value = input.value.replace(/\D/g, "");
  value = value.replace(/^(\d{3})(\d)/, "$1.$2");
  value = value.replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3");
  value = value.replace(/\.(\d{3})(\d)/, ".$1-$2");
  input.value = value;
}

/**
 * Alterna visibilidade da senha
 */
function togglePasswordVisibility(inputId) {
  const input = document.getElementById(inputId);
  const icon = document.getElementById(inputId + "Icon");
  
  if (input && icon) {
    if (input.type === "password") {
      input.type = "text";
      icon.classList.remove("bi-eye");
      icon.classList.add("bi-eye-slash");
    } else {
      input.type = "password";
      icon.classList.remove("bi-eye-slash");
      icon.classList.add("bi-eye");
    }
  }
}

/**
 * Carrega estabelecimentos para o select (apenas para superuser)
 */
async function carregarEstabelecimentosParaSelect() {
  try {
    const estabelecimentos = await estabelecimentosService.listar();
    const select = document.getElementById("funcionarioEstabelecimento");
    
    if (!select) return;
    
    // Limpar opções existentes
    select.innerHTML = '<option value="">Selecione um estabelecimento</option>';
    
    // Adicionar estabelecimentos
    const estabelecimentosArray = Array.isArray(estabelecimentos) 
      ? estabelecimentos 
      : estabelecimentos.results || [];
    
    estabelecimentosArray.forEach((estabelecimento) => {
      const option = document.createElement("option");
      option.value = estabelecimento.id;
      option.textContent = estabelecimento.nome;
      select.appendChild(option);
    });
  } catch (error) {
    console.error("Erro ao carregar estabelecimentos:", error);
  }
}

/**
 * Abre o modal de funcionário
 */
async function abrirModalFuncionario() {
  // Limpar formulário
  const form = document.getElementById("funcionarioForm");
  if (form) {
    form.reset();
  }
  
  // Verificar se o usuário pode escolher estabelecimento
  // Apenas superuser da plataforma (Django is_superuser) pode escolher
  // Por enquanto, vamos tentar carregar estabelecimentos e ver se funciona
  // Se o usuário não tiver permissão, a API retornará erro
  const userData = getUserData();
  
  // Tentar carregar estabelecimentos - se o usuário for superuser da plataforma,
  // conseguirá listar todos. Se não, a API retornará apenas o dele
  const estabelecimentoContainer = document.getElementById("funcionarioEstabelecimentoContainer");
  if (estabelecimentoContainer) {
    try {
      const estabelecimentos = await estabelecimentosService.listar();
      const estabelecimentosArray = Array.isArray(estabelecimentos) 
        ? estabelecimentos 
        : estabelecimentos.results || [];
      
      // Se houver mais de um estabelecimento, o usuário pode escolher
      if (estabelecimentosArray.length > 1) {
        estabelecimentoContainer.style.display = "block";
        await carregarEstabelecimentosParaSelect();
      } else {
        // Se houver apenas um, ocultar o campo (será usado automaticamente)
        estabelecimentoContainer.style.display = "none";
      }
    } catch (error) {
      // Se houver erro, ocultar o campo
      estabelecimentoContainer.style.display = "none";
    }
  }
  
  // Atualizar título do modal
  const modalTitle = document.getElementById("funcionarioModalLabel");
  if (modalTitle) {
    modalTitle.textContent = "Adicionar Funcionário";
  }
  
  // Abrir modal usando Bootstrap
  const modalElement = document.getElementById("funcionarioModal");
  if (modalElement) {
    const modal = new window.bootstrap.Modal(modalElement);
    modal.show();
  }
}

/**
 * Formata o campo de preço como moeda brasileira
 */
function formatCurrency(input) {
  // Remove tudo que não é dígito
  let value = input.value.replace(/\D/g, "");
  
  // Se estiver vazio, limpa o campo
  if (value === "") {
    input.value = "";
    return;
  }
  
  // Converte para número e divide por 100 para ter centavos
  const numberValue = parseFloat(value) / 100;
  
  // Formata como moeda brasileira sem símbolo R$ (já tem no input-group)
  // Formato: 1.234,56
  const formatted = numberValue.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  
  input.value = formatted;
}

/**
 * Converte valor formatado (1.234,56) para número (1234.56)
 */
function parseCurrency(value) {
  if (!value) return 0;
  
  // Remove espaços e pontos (milhares)
  // Converte vírgula (decimal) para ponto
  const cleanValue = value
    .toString()
    .replace(/\s/g, "")
    .replace(/\./g, "")  // Remove pontos de milhar
    .replace(",", ".");  // Converte vírgula para ponto decimal
  
  const number = parseFloat(cleanValue);
  return isNaN(number) ? 0 : number;
}

/**
 * Salva um novo produto ou atualiza um existente
 */
async function salvarProdutoDashboard() {
  try {
    const nome = document.getElementById("produtoNome")?.value.trim();
    const descricao = document.getElementById("produtoDescricao")?.value.trim();
    const precoInput = document.getElementById("produtoPreco");
    const produtoId = window.produtoEditandoId; // ID se estiver editando
    
    if (!nome) {
      showNotification("Nome do produto é obrigatório", "error");
      return;
    }
    
    if (!precoInput || !precoInput.value) {
      showNotification("Preço é obrigatório", "error");
      return;
    }
    
    // Converter valor formatado para número
    const preco = parseCurrency(precoInput.value);
    
    if (preco <= 0) {
      showNotification("Preço deve ser maior que zero", "error");
      return;
    }

    // Obter status ativo do checkbox
    const ativoCheckbox = document.getElementById("produtoAtivo");
    const ativo = ativoCheckbox ? ativoCheckbox.checked : true;

    const dadosProduto = {
      nome,
      descricao: descricao || "",
      preco: preco.toFixed(2),
      ativo: ativo,
    };

    // Criar ou atualizar produto via API
    if (produtoId) {
      await produtosService.atualizar(produtoId, dadosProduto);
      showNotification("Produto atualizado com sucesso!", "success");
    } else {
      await produtosService.criar(dadosProduto);
      showNotification("Produto criado com sucesso!", "success");
    }

    // Limpar ID de edição
    window.produtoEditandoId = null;

    // Fechar modal
    const modalElement = document.getElementById("produtoModal");
    if (modalElement) {
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
    
    // Recarregar produtos se estiver na página de catálogo
    if (typeof window.carregarProdutos === 'function') {
      await window.carregarProdutos();
    } else {
      // Se não estiver na página de catálogo, navegar para lá
      setTimeout(() => {
        showPage("catalogo");
      }, 500);
    }
  } catch (error) {
    console.error("Erro ao salvar produto:", error);
    showNotification(
      `Erro ao salvar produto: ${error.message || "Erro desconhecido"}`,
      "error"
    );
  }
}

/**
 * Salva um novo anúncio e navega para a página de anúncios
 */
async function salvarAnuncioDashboard() {
  try {
    const dataExpiracaoInput = document.getElementById("anuncioDataExpiracao");
    const imagemInput = document.getElementById("anuncioImagem");
    const anuncioId = window.anuncioEditandoId; // ID se estiver editando
    
    if (!dataExpiracaoInput || !dataExpiracaoInput.value) {
      showNotification("Data de expiração é obrigatória", "error");
      return;
    }

    // Converter data para formato ISO com hora (final do dia)
    const dataExpiracao = new Date(dataExpiracaoInput.value + "T23:59:59").toISOString();

    const dadosAnuncio = {
      data_expiracao: dataExpiracao,
    };

    // Se houver imagem selecionada, adicionar ao objeto
    if (imagemInput && imagemInput.files && imagemInput.files.length > 0) {
      dadosAnuncio.imagem = imagemInput.files[0];
    }

    // Criar ou atualizar anúncio via API
    if (anuncioId) {
      await anunciosService.atualizar(anuncioId, dadosAnuncio);
      showNotification("Anúncio atualizado com sucesso!", "success");
    } else {
      await anunciosService.criar(dadosAnuncio);
      showNotification("Anúncio criado com sucesso!", "success");
    }

    // Limpar ID de edição
    window.anuncioEditandoId = null;

    // Limpar campos do formulário
    if (dataExpiracaoInput) dataExpiracaoInput.value = '';
    if (imagemInput) imagemInput.value = '';

    // Fechar modal
    const modalElement = document.getElementById("anuncioModal");
    if (modalElement) {
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }
    
    // Recarregar anúncios se estiver na página de anúncios
    if (typeof window.carregarAnuncios === 'function') {
      await window.carregarAnuncios();
    } else {
      // Navegar para a página de anúncios após um pequeno delay
      setTimeout(() => {
        showPage("anuncios");
      }, 500);
    }
  } catch (error) {
    console.error("Erro ao salvar anúncio:", error);
    showNotification(
      `Erro ao salvar anúncio: ${error.message || "Erro desconhecido"}`,
      "error"
    );
  }
}

/**
 * Salva um novo funcionário e navega para a página de funcionários
 */
async function salvarFuncionarioDashboard() {
  try {
    const nome = document.getElementById("funcionarioNome")?.value.trim();
    const cpf = document.getElementById("funcionarioCpf")?.value.replace(/\D/g, ""); // Remove formatação
    const email = document.getElementById("funcionarioEmail")?.value.trim();
    const senha = document.getElementById("funcionarioSenha")?.value;
    const confirmarSenha = document.getElementById("funcionarioConfirmarSenha")?.value;
    
    // Validações
    if (!nome) {
      showNotification("Nome é obrigatório", "error");
      return;
    }
    
    if (!cpf || cpf.length !== 11) {
      showNotification("CPF inválido", "error");
      return;
    }
    
    if (!email) {
      showNotification("E-mail é obrigatório", "error");
      return;
    }
    
    if (!senha || senha.length < 6) {
      showNotification("Senha deve ter no mínimo 6 caracteres", "error");
      return;
    }
    
    if (senha !== confirmarSenha) {
      showNotification("As senhas não coincidem", "error");
      return;
    }

    const dadosFuncionario = {
      nome,
      cpf,
      email,
      password: senha,
      password2: confirmarSenha,
    };
    
    // Se o campo de estabelecimento estiver visível e preenchido, adicionar
    const estabelecimentoContainer = document.getElementById("funcionarioEstabelecimentoContainer");
    const estabelecimentoSelect = document.getElementById("funcionarioEstabelecimento");
    
    if (estabelecimentoContainer && estabelecimentoContainer.style.display !== "none") {
      const estabelecimentoId = estabelecimentoSelect?.value;
      if (estabelecimentoId) {
        dadosFuncionario.estabelecimento = parseInt(estabelecimentoId);
      }
    }
    // Se não estiver visível, a API usará automaticamente o estabelecimento do usuário logado

    // Criar funcionário via API
    await administradoresService.criar(dadosFuncionario);

    // Fechar modal
    const modalElement = document.getElementById("funcionarioModal");
    if (modalElement) {
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      if (modal) {
        modal.hide();
      }
    }

    showNotification("Funcionário criado com sucesso!", "success");
    
    // Navegar para a página de funcionários após um pequeno delay
    setTimeout(() => {
      showPage("funcionarios");
    }, 500);
  } catch (error) {
    console.error("Erro ao criar funcionário:", error);
    
    // Tratar erros específicos da API
    let errorMessage = "Erro ao criar funcionário";
    if (error.message) {
      errorMessage = error.message;
    } else if (error.response) {
      // Se houver resposta da API com detalhes
      const errorData = await error.response.json().catch(() => ({}));
      if (errorData.password) {
        errorMessage = Array.isArray(errorData.password) 
          ? errorData.password.join(", ") 
          : errorData.password;
      } else if (errorData.detail) {
        errorMessage = errorData.detail;
      }
    }
    
    showNotification(errorMessage, "error");
  }
}

// Exportar funções para escopo global
window.carregarDadosDashboard = carregarDadosDashboard;
window.aprovarTicket = aprovarTicket;
window.rejeitarTicket = rejeitarTicket;
window.visualizarTicket = visualizarTicket;
window.scrollParaTickets = scrollParaTickets;
window.abrirModalProduto = abrirModalProduto;
window.abrirModalAnuncio = abrirModalAnuncio;
window.abrirModalFuncionario = abrirModalFuncionario;
window.salvarProdutoDashboard = salvarProdutoDashboard;
window.salvarAnuncioDashboard = salvarAnuncioDashboard;
window.salvarFuncionarioDashboard = salvarFuncionarioDashboard;
window.formatCurrency = formatCurrency;
window.formatCPF = formatCPF;
window.togglePasswordVisibility = togglePasswordVisibility;
