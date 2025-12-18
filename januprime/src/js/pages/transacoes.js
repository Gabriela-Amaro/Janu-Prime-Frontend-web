import { mockData } from '../config/mockData.js';
import { debounce } from '../utils/debounce.js';
import { showNotification } from '../utils/notifications.js';
import { getMainFooter } from '../components/main-footer.js';
import { ticketsService } from '../services/tickets.js';

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

export function visualizarTransacao(id, tipo) {
  // Por enquanto apenas mostrar notificação
  showNotification('Visualização de detalhes será implementada em breve', 'info');
  console.log('Visualizar transação:', id, tipo);
}

// Exportar funções para escopo global
window.aprovarTransacao = aprovarTransacao;
window.rejeitarTransacao = rejeitarTransacao;
window.visualizarTransacao = visualizarTransacao;
window.carregarTransacoes = carregarTransacoes;
