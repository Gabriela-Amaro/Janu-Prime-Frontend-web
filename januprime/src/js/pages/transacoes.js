import { mockData } from '../config/mockData.js';
import { debounce } from '../utils/debounce.js';
import { showNotification } from '../utils/notifications.js';
import { getMainFooter } from '../components/main-footer.js';

export function getTransacoesContent() {
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
                      <option value="pendente">Pendente</option>
                      <option value="aprovado">Aprovado</option>
                      <option value="rejeitado">Rejeitado</option>
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
                  <tbody>
                    ${mockData.transacoes.map(transacao => `
                      <tr>
                        <td>#${transacao.id}</td>
                        <td>
                          <span class="badge ${transacao.tipo === 'credito' ? 'bg-success' : 'bg-warning'}">
                            ${transacao.tipo === 'credito' ? 'Crédito' : 'Débito'}
                          </span>
                        </td>
                        <td>${transacao.cliente}</td>
                        <td>${transacao.tipo === 'credito' ? `R$ ${transacao.valor}` : `${transacao.pontos} pts`}</td>
                        <td>
                          <span class="badge ${transacao.status === 'aprovado' ? 'bg-success' : transacao.status === 'pendente' ? 'bg-warning' : 'bg-danger'}">
                            ${transacao.status}
                          </span>
                        </td>
                        <td>${new Date(transacao.data).toLocaleDateString('pt-BR')}</td>
                        <td>
                          <div class="btn-group" role="group">
                            <button class="btn btn-sm btn-outline-primary" onclick="visualizarTransacao(${transacao.id})" title="Visualizar">
                              <i class="bi bi-eye"></i>
                            </button>
                            ${transacao.status === 'pendente' ? `
                              <button class="btn btn-sm btn-outline-success" onclick="aprovarTransacao(${transacao.id})" title="Aprovar">
                                <i class="bi bi-check-lg"></i>
                              </button>
                              <button class="btn btn-sm btn-outline-danger" onclick="rejeitarTransacao(${transacao.id})" title="Rejeitar">
                                <i class="bi bi-x-lg"></i>
                              </button>
                            ` : ''}
                          </div>
                        </td>
                      </tr>
                    `).join('')}
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
  
  let transacoesFiltradas = [...mockData.transacoes];
  
  // Filtro por termo de busca
  if (termo) {
    transacoesFiltradas = transacoesFiltradas.filter(transacao => 
      transacao.cliente.toLowerCase().includes(termo) ||
      transacao.id.toString().includes(termo) ||
      (transacao.produto && transacao.produto.toLowerCase().includes(termo))
    );
  }
  
  // Filtro por tipo
  if (tipo) {
    transacoesFiltradas = transacoesFiltradas.filter(transacao => 
      transacao.tipo === tipo
    );
  }
  
  // Filtro por status
  if (status) {
    transacoesFiltradas = transacoesFiltradas.filter(transacao => 
      transacao.status === status
    );
  }
  
  // Filtro por data
  if (data) {
    transacoesFiltradas = transacoesFiltradas.filter(transacao => {
      const transacaoData = new Date(transacao.data).toISOString().split('T')[0];
      return transacaoData === data;
    });
  }
  
  // Atualizar a exibição das transações
  atualizarExibicaoTransacoes(transacoesFiltradas);
}

// Função para atualizar a exibição das transações
function atualizarExibicaoTransacoes(transacoes) {
  const tbody = document.querySelector('tbody');
  if (tbody) {
    tbody.innerHTML = transacoes.map(transacao => `
      <tr>
        <td>#${transacao.id}</td>
        <td>
          <span class="badge ${transacao.tipo === 'credito' ? 'bg-success' : 'bg-warning'}">
            ${transacao.tipo === 'credito' ? 'Crédito' : 'Débito'}
          </span>
        </td>
        <td>${transacao.cliente}</td>
        <td>${transacao.tipo === 'credito' ? `R$ ${transacao.valor}` : `${transacao.pontos} pts`}</td>
        <td>
          <span class="badge ${transacao.status === 'aprovado' ? 'bg-success' : transacao.status === 'pendente' ? 'bg-warning' : 'bg-danger'}">
            ${transacao.status}
          </span>
        </td>
        <td>${new Date(transacao.data).toLocaleDateString('pt-BR')}</td>
        <td>
          <div class="btn-group" role="group">
            <button class="btn btn-sm btn-outline-primary" onclick="visualizarTransacao(${transacao.id})" title="Visualizar">
              <i class="bi bi-eye"></i>
            </button>
            ${transacao.status === 'pendente' ? `
              <button class="btn btn-sm btn-outline-success" onclick="aprovarTransacao(${transacao.id})" title="Aprovar">
                <i class="bi bi-check-lg"></i>
              </button>
              <button class="btn btn-sm btn-outline-danger" onclick="rejeitarTransacao(${transacao.id})" title="Rejeitar">
                <i class="bi bi-x-lg"></i>
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `).join('') || `
      <tr>
        <td colspan="7" class="text-center py-4">
          <i class="bi bi-search text-muted" style="font-size: 2rem;"></i>
          <h6 class="mt-2 text-muted">Nenhuma transação encontrada!</h6>
          <p class="text-muted small">Tente ajustar os filtros de busca.</p>
        </td>
      </tr>
    `;
  }
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
  
  aplicarFiltrosTransacoesAuto();
}
