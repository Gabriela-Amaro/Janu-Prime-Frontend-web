import { mockData } from '../config/mockData.js';
import { debounce } from '../utils/debounce.js';
import { showNotification } from '../utils/notifications.js';
import { getMainFooter } from '../components/main-footer.js';
import { ticketsService } from '../services/tickets.js';
import { APP_CONFIG } from '../config/app.js';

// Estado global da página
let transacoesCarregadas = [];
let transacoesFiltradas = [];

/**
 * Mapeia status do backend para exibição
 */
function mapearStatus(status) {
  const statusMap = {
    'ABERTO': { label: 'Pendente', class: 'bg-warning' },
    'CONCLUIDO': { label: 'Aprovado', class: 'bg-success' },
    'APROVADO': { label: 'Aprovado', class: 'bg-success' },
    'RECUSADO': { label: 'Rejeitado', class: 'bg-danger' },
    'CANCELADO': { label: 'Cancelado', class: 'bg-secondary' },
  };
  return statusMap[status] || { label: status, class: 'bg-secondary' };
}

/**
 * Carrega transações da API
 */
async function carregarTransacoes() {
  try {
    const tickets = await ticketsService.listarTodos();
    transacoesCarregadas = Array.isArray(tickets) ? tickets : [];
    transacoesFiltradas = [...transacoesCarregadas];
    atualizarExibicaoTransacoes(transacoesFiltradas);
  } catch (error) {
    console.error('Erro ao carregar transações:', error);
    showNotification('Erro ao carregar transações', 'error');
    // Mostrar mensagem de erro no tbody
    const tbody = document.querySelector('#transacoes-table tbody') || document.querySelector('tbody');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-4">
            <i class="bi bi-exclamation-triangle text-warning" style="font-size: 2rem;"></i>
            <h6 class="mt-2 text-muted">Erro ao carregar transações</h6>
            <p class="text-muted small">Tente recarregar a página.</p>
          </td>
        </tr>
      `;
    }
  }
}

export function getTransacoesContent() {
  // Carregar transações após renderizar
  setTimeout(() => {
    carregarTransacoes();
  }, 100);
  return `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col-12">
          <h1 class="text-gradient mb-0">Transações</h1>
          <p class="text-muted">Gerencie tickets de crédito e débito</p>
        </div>
      </div>
      
      <!-- Filtros -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <div class="row">
                <div class="col-md-3">
                  <label for="pesquisaTransacao" class="form-label">Pesquisar</label>
                  <div class="input-group">
                    <input type="text" class="form-control" id="pesquisaTransacao" placeholder="Cliente ou ID..." oninput="testPesquisarTransacoes()">
                    <span class="input-group-text">
                      <i class="bi bi-search"></i>
                    </span>
                  </div>
                </div>
                <div class="col-md-2">
                  <label for="filtroTipo" class="form-label">Tipo</label>
                  <div class="dropdown">
                    <select class="form-select" id="filtroTipo" onchange="testPesquisarTransacoes()">
                      <option value="">Todos</option>
                      <option value="credito">Crédito</option>
                      <option value="debito">Débito</option>
                    </select>
                    <i class="bi bi-chevron-down dropdown-icon"></i>
                  </div>
                </div>
                <div class="col-md-2">
                  <label for="filtroStatus" class="form-label">Status</label>
                  <div class="dropdown">
                    <select class="form-select" id="filtroStatus" onchange="testPesquisarTransacoes()">
                      <option value="">Todos</option>
                      <option value="ABERTO">Pendente</option>
                      <option value="APROVADO">Aprovado</option>
                      <option value="RECUSADO">Rejeitado</option>
                      <option value="CANCELADO">Cancelado</option>
                    </select>
                    <i class="bi bi-chevron-down dropdown-icon"></i>
                  </div>
                </div>
                <div class="col-md-3">
                  <label for="filtroData" class="form-label">Data</label>
                  <input type="date" class="form-control" id="filtroData" onchange="testPesquisarTransacoes()">
                </div>
                <div class="col-md-2 d-flex align-items-end">
                  <button class="btn btn-outline-secondary w-100" onclick="limparFiltrosTransacoes()">
                    <i class="bi bi-arrow-clockwise me-1"></i>Limpar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Tabela de transações -->
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h6 class="m-0 font-weight-bold text-primary">Lista de Transações</h6>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-dark table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Tipo</th>
                      <th>Cliente</th>
                      <th>Valor/Pontos</th>
                      <th>Status</th>
                      <th>Data</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody id="transacoes-table-body">
                    <tr>
                      <td colspan="7" class="text-center py-4">
                        <div class="spinner-border text-primary" role="status">
                          <span class="visually-hidden">Carregando transações...</span>
                        </div>
                        <p class="mt-2 text-muted">Carregando transações...</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
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
const pesquisarTransacoesAuto = debounce(() => {
  aplicarFiltrosTransacoesAuto();
}, 300);

// Exportar para escopo global
window.pesquisarTransacoesAuto = pesquisarTransacoesAuto;

// Função alternativa simples para teste
window.testPesquisarTransacoes = function() {
  console.log('Teste de pesquisa de transações');
  const input = document.getElementById('pesquisaTransacao');
  if (input) {
    console.log('Input encontrado:', input.value);
    aplicarFiltrosTransacoesAuto();
  } else {
    console.log('Input não encontrado');
  }
};

// Função para aplicar filtros automaticamente
export function aplicarFiltrosTransacoesAuto() {
  const termo = document.getElementById('pesquisaTransacao')?.value.toLowerCase() || '';
  const tipo = document.getElementById('filtroTipo')?.value || '';
  const status = document.getElementById('filtroStatus')?.value || '';
  const data = document.getElementById('filtroData')?.value || '';
  
  let transacoesFiltradas = [...transacoesCarregadas];
  
  // Filtro por termo de busca
  if (termo) {
    transacoesFiltradas = transacoesFiltradas.filter(transacao => {
      const nomeCliente = (transacao.nome_cliente || '').toLowerCase();
      const codigo = (transacao.codigo || '').toLowerCase();
      const nomeProduto = (transacao.nome_produto || '').toLowerCase();
      const nomeEstabelecimento = (transacao.nome_estabelecimento || '').toLowerCase();
      const id = transacao.id?.toString() || '';
      
      return nomeCliente.includes(termo) ||
             codigo.includes(termo) ||
             id.includes(termo) ||
             nomeProduto.includes(termo) ||
             nomeEstabelecimento.includes(termo);
    });
  }
  
  // Filtro por tipo
  if (tipo) {
    transacoesFiltradas = transacoesFiltradas.filter(transacao => 
      transacao.tipo === tipo
    );
  }
  
  // Filtro por status
  if (status) {
    transacoesFiltradas = transacoesFiltradas.filter(transacao => {
      // Tratar CONCLUIDO e APROVADO como "Aprovado" para o filtro
      if (status === 'APROVADO') {
        return transacao.status === 'CONCLUIDO' || transacao.status === 'APROVADO';
      }
      return transacao.status === status;
    });
  }
  
  // Filtro por data
  if (data) {
    transacoesFiltradas = transacoesFiltradas.filter(transacao => {
      const transacaoData = new Date(transacao.created_at).toISOString().split('T')[0];
      return transacaoData === data;
    });
  }
  
  // Atualizar a exibição das transações
  atualizarExibicaoTransacoes(transacoesFiltradas);
}

// Função para atualizar a exibição das transações
function atualizarExibicaoTransacoes(transacoes) {
  const tbody = document.querySelector('#transacoes-table-body') || document.querySelector('tbody');
  if (!tbody) {
    console.error('Tbody não encontrado');
    return;
  }
  
  if (transacoes.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-4">
          <i class="bi bi-search text-muted" style="font-size: 2rem;"></i>
          <h6 class="mt-2 text-muted">Nenhuma transação encontrada!</h6>
          <p class="text-muted small">Tente ajustar os filtros de busca.</p>
        </td>
      </tr>
    `;
    return;
  }
  
  const html = transacoes.map(transacao => {
    const tipo = transacao.tipo; // 'credito' ou 'debito'
    const statusInfo = mapearStatus(transacao.status);
    const nomeCliente = transacao.nome_cliente || 'N/A';
    const data = new Date(transacao.created_at);
    const isPendente = transacao.status === 'ABERTO';
    
    // Determinar valor/pontos baseado no tipo
    let valorPontos = '';
    if (tipo === 'credito') {
      valorPontos = `R$ ${parseFloat(transacao.preco || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    } else {
      valorPontos = `${transacao.pontos || 0} pts`;
    }
    
    return `
      <tr>
        <td>#${transacao.codigo || transacao.id}</td>
        <td>
          <span class="badge ${tipo === 'credito' ? 'bg-success' : 'bg-warning'}">
            ${tipo === 'credito' ? 'Crédito' : 'Débito'}
          </span>
        </td>
        <td>${nomeCliente}</td>
        <td>${valorPontos}</td>
        <td>
          <span class="badge ${statusInfo.class}">
            ${statusInfo.label}
          </span>
        </td>
        <td>${data.toLocaleDateString('pt-BR')}</td>
        <td>
          <div class="btn-group" role="group">
            <button class="btn btn-sm btn-outline-primary" onclick="visualizarTransacao(${transacao.id}, '${tipo}')" title="Visualizar">
              <i class="bi bi-eye"></i>
            </button>
            ${isPendente ? `
              <button class="btn btn-sm btn-outline-success" onclick="aprovarTransacao(${transacao.id}, '${tipo}')" title="Aprovar">
                <i class="bi bi-check-lg"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger" onclick="rejeitarTransacao(${transacao.id}, '${tipo}')" title="Rejeitar">
                <i class="bi bi-x-lg"></i>
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
  
  tbody.innerHTML = html;
  transacoesFiltradas = transacoes;
}

// Função para limpar todos os filtros
export function limparFiltrosTransacoes() {
  const pesquisaInput = document.getElementById('pesquisaTransacao');
  const tipoSelect = document.getElementById('filtroTipo');
  const statusSelect = document.getElementById('filtroStatus');
  const dataInput = document.getElementById('filtroData');
  
  if (pesquisaInput) pesquisaInput.value = '';
  if (tipoSelect) tipoSelect.value = '';
  if (statusSelect) statusSelect.value = '';
  if (dataInput) dataInput.value = '';
  
  transacoesFiltradas = [...transacoesCarregadas];
  aplicarFiltrosTransacoesAuto();
}

// Funções para manipular transações
export async function aprovarTransacao(id, tipo) {
  try {
    if (tipo === 'credito') {
      await ticketsService.aprovarCredito(id);
    } else {
      await ticketsService.aprovarDebito(id);
    }
    showNotification('Transação aprovada com sucesso!', 'success');
    await carregarTransacoes();
  } catch (error) {
    console.error('Erro ao aprovar transação:', error);
    showNotification(`Erro ao aprovar transação: ${error.message || 'Erro desconhecido'}`, 'error');
  }
}

export async function rejeitarTransacao(id, tipo) {
  const motivo = prompt('Informe o motivo da recusa (opcional):') || '';
  
  try {
    if (tipo === 'credito') {
      await ticketsService.recusarCredito(id, motivo);
    } else {
      await ticketsService.recusarDebito(id);
    }
    showNotification('Transação recusada com sucesso!', 'success');
    await carregarTransacoes();
  } catch (error) {
    console.error('Erro ao recusar transação:', error);
    showNotification(`Erro ao recusar transação: ${error.message || 'Erro desconhecido'}`, 'error');
  }
}

export async function visualizarTransacao(id, tipo) {
  try {
    // Buscar ticket da API
    let ticket;
    if (tipo === 'credito') {
      ticket = await ticketsService.obterCredito(id);
    } else {
      ticket = await ticketsService.obterDebito(id);
    }

    if (!ticket) {
      showNotification('Transação não encontrada', 'error');
      return;
    }

    // Construir URL da imagem se houver
    const getImagemUrl = (imagemPath) => {
      if (!imagemPath) return null;
      if (imagemPath.startsWith('http://') || imagemPath.startsWith('https://')) {
        return imagemPath;
      }
      const baseUrl = APP_CONFIG.apiUrl.replace('/api', '');
      const mediaPath = imagemPath.startsWith('/') ? imagemPath : `/${imagemPath}`;
      return `${baseUrl}/media${mediaPath}`;
    };

    // Modal diferenciado para crédito e débito
    let detalhesHTML = "";

    if (tipo === "credito") {
      const imagemNota = ticket.imagem
        ? `
        <div class="col-lg-5 mb-3 mb-lg-0">
          <div class="card h-100 bg-dark">
            <div class="card-header bg-primary text-white py-2">
              <h6 class="mb-0"><i class="bi bi-image me-2"></i>Imagem da Nota Fiscal</h6>
            </div>
            <div class="card-body p-2 d-flex align-items-center justify-content-center" style="min-height: 300px;">
              <a href="${getImagemUrl(ticket.imagem)}" target="_blank" title="Clique para ampliar">
                <img src="${getImagemUrl(ticket.imagem)}" alt="Nota Fiscal" class="img-fluid rounded" style="max-height: 280px; cursor: zoom-in;">
              </a>
            </div>
            <div class="card-footer text-center py-2">
              <a href="${getImagemUrl(ticket.imagem)}" target="_blank" class="btn btn-sm btn-outline-light">
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
                    <strong>${new Date(ticket.created_at).toLocaleString("pt-BR")}</strong>
                  </div>
                </div>
              </div>
            </div>
            
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
                      <strong class="fs-5">${ticket.data_nota ? new Date(ticket.data_nota).toLocaleDateString("pt-BR") : "N/A"}</strong>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="bg-success bg-opacity-10 rounded p-2">
                      <small class="text-muted d-block">Valor Total</small>
                      <strong class="fs-4 text-success">R$ ${parseFloat(ticket.preco || 0).toFixed(2)}</strong>
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
            
            <div class="card border-success">
              <div class="card-header bg-success bg-opacity-25 py-2">
                <h6 class="mb-0 text-success"><i class="bi bi-coin me-2"></i>Pontos a Creditar</h6>
              </div>
              <div class="card-body py-3 text-center">
                <span class="display-5 fw-bold text-success">${ticket.pontos || 0}</span>
                <span class="text-muted ms-2">pontos</span>
              </div>
            </div>
          </div>
        </div>
        ${ticket.observacao ? `
          <div class="alert alert-secondary mt-3 mb-0">
            <i class="bi bi-chat-left-text me-2"></i>
            <strong>Observação:</strong> ${ticket.observacao}
          </div>
        ` : ''}
      `;
    } else {
      detalhesHTML = `
        <div class="row">
          <div class="col-lg-5 mb-3 mb-lg-0">
            <div class="card h-100 bg-dark">
              <div class="card-header bg-warning text-dark py-2">
                <h6 class="mb-0"><i class="bi bi-gift me-2"></i>Produto Solicitado</h6>
              </div>
              <div class="card-body d-flex flex-column align-items-center justify-content-center text-center" style="min-height: 250px;">
                <i class="bi bi-box-seam text-warning" style="font-size: 5rem;"></i>
                <h4 class="mt-3 mb-2 text-warning">${ticket.nome_produto || "Produto"}</h4>
                <div class="bg-danger bg-opacity-25 rounded-pill px-4 py-2 mt-2">
                  <span class="text-danger fw-bold fs-5">
                    <i class="bi bi-dash-circle me-1"></i>${ticket.pontos} pontos
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          <div class="col-lg-7">
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
                    <strong>${new Date(ticket.created_at).toLocaleString("pt-BR")}</strong>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="card border-warning">
              <div class="card-header bg-warning bg-opacity-25 py-2">
                <h6 class="mb-0 text-warning"><i class="bi bi-info-circle me-2"></i>Detalhes do Resgate</h6>
              </div>
              <div class="card-body py-2">
                <div class="row g-2">
                  <div class="col-12">
                    <div class="bg-dark bg-opacity-10 rounded p-2">
                      <small class="text-muted d-block">Código do Ticket</small>
                      <strong class="fs-5 font-monospace">#${ticket.codigo}</strong>
                    </div>
                  </div>
                  <div class="col-6">
                    <div class="bg-dark bg-opacity-10 rounded p-2">
                      <small class="text-muted d-block">Status</small>
                      <span class="badge bg-${ticket.status === "ABERTO" ? "warning" : ticket.status === "APROVADO" ? "success" : "secondary"} fs-6">
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
        ${ticket.observacao ? `
          <div class="alert alert-secondary mt-3 mb-0">
            <i class="bi bi-chat-left-text me-2"></i>
            <strong>Observação:</strong> ${ticket.observacao}
          </div>
        ` : ''}
      `;
    }

    const modalHtml = `
      <div class="modal fade" id="transacaoModal" tabindex="-1" aria-labelledby="transacaoModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-lg">
          <div class="modal-content">
            <div class="modal-header bg-${tipo === "credito" ? "success" : "warning"} text-white">
              <h5 class="modal-title" id="transacaoModalLabel">
                <i class="bi bi-ticket-perforated me-2"></i>
                Ticket ${tipo === "credito" ? "de Crédito" : "de Débito"} #${ticket.codigo || ticket.id}
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="d-flex justify-content-between align-items-center mb-3">
                <span class="badge bg-${tipo === "credito" ? "success" : "warning"} fs-6">
                  ${tipo === "credito" ? "Crédito de Pontos" : "Resgate de Produto"}
                </span>
                <span class="badge bg-info fs-6">
                  Status: ${ticket.status}
                </span>
              </div>
              ${detalhesHTML}
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
              ${ticket.status === "ABERTO" ? `
                <button type="button" class="btn btn-danger" onclick="rejeitarTransacao(${ticket.id}, '${tipo}'); bootstrap.Modal.getInstance(document.getElementById('transacaoModal')).hide();">
                  <i class="bi bi-x-lg me-1"></i>Recusar
                </button>
                <button type="button" class="btn btn-success" onclick="aprovarTransacao(${ticket.id}, '${tipo}'); bootstrap.Modal.getInstance(document.getElementById('transacaoModal')).hide();">
                  <i class="bi bi-check-lg me-1"></i>Aprovar
                </button>
              ` : ''}
            </div>
          </div>
        </div>
      </div>
    `;

    // Remover modal existente se houver
    const existingModal = document.getElementById("transacaoModal");
    if (existingModal) {
      existingModal.remove();
    }

    // Adicionar novo modal ao body
    document.body.insertAdjacentHTML("beforeend", modalHtml);

    // Mostrar o modal
    const modal = new window.bootstrap.Modal(document.getElementById("transacaoModal"));
    modal.show();
  } catch (error) {
    console.error('Erro ao visualizar transação:', error);
    showNotification(`Erro ao carregar detalhes: ${error.message || 'Erro desconhecido'}`, 'error');
  }
}

// Exportar funções para escopo global
window.aprovarTransacao = aprovarTransacao;
window.rejeitarTransacao = rejeitarTransacao;
window.visualizarTransacao = visualizarTransacao;
window.carregarTransacoes = carregarTransacoes;
