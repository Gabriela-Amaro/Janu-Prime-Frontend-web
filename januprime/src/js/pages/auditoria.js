import { debounce } from '../utils/debounce.js';
import { showNotification } from '../utils/notifications.js';
import { getMainFooter } from '../components/main-footer.js';

export function getAuditoriaContent() {
  return `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col-12">
          <h1 class="text-gradient mb-0">Registros de Auditoria</h1>
          <p class="text-muted">Acompanhe todas as ações realizadas no sistema</p>
        </div>
      </div>
      
      <!-- Filtros -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <div class="row">
                <div class="col-md-3">
                  <label for="pesquisaAuditoria" class="form-label">Pesquisar</label>
                  <div class="input-group">
                    <input type="text" class="form-control" id="pesquisaAuditoria" placeholder="Usuário ou ação..." oninput="testPesquisarAuditoria()">
                    <span class="input-group-text">
                      <i class="bi bi-search"></i>
                    </span>
                  </div>
                </div>
                <div class="col-md-2">
                  <label for="filtroUsuario" class="form-label">Usuário</label>
                  <div class="dropdown">
                    <select class="form-select" id="filtroUsuario" onchange="testPesquisarAuditoria()">
                      <option value="">Todos</option>
                      <option value="admin">Administrador</option>
                      <option value="funcionario">Funcionário</option>
                    </select>
                    <i class="bi bi-chevron-down dropdown-icon"></i>
                  </div>
                </div>
                <div class="col-md-2">
                  <label for="filtroAcao" class="form-label">Ação</label>
                  <div class="dropdown">
                    <select class="form-select" id="filtroAcao" onchange="testPesquisarAuditoria()">
                      <option value="">Todas</option>
                      <option value="login">Login</option>
                      <option value="criar">Criar</option>
                      <option value="editar">Editar</option>
                      <option value="excluir">Excluir</option>
                    </select>
                    <i class="bi bi-chevron-down dropdown-icon"></i>
                  </div>
                </div>
                <div class="col-md-3">
                  <label for="filtroDataAuditoria" class="form-label">Data</label>
                  <input type="date" class="form-control" id="filtroDataAuditoria" onchange="testPesquisarAuditoria()">
                </div>
                <div class="col-md-2 d-flex align-items-end">
                  <button class="btn btn-outline-secondary w-100" onclick="limparFiltrosAuditoria()">
                    <i class="bi bi-arrow-clockwise me-1"></i>Limpar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Tabela de auditoria -->
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h6 class="m-0 font-weight-bold text-primary">Log de Auditoria</h6>
            </div>
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-dark table-hover">
                  <thead>
                    <tr>
                      <th>Data/Hora</th>
                      <th>Usuário</th>
                      <th>Ação</th>
                      <th>Recurso</th>
                      <th>IP</th>
                      <th>Detalhes</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>15/01/2024 14:30</td>
                      <td>João Silva</td>
                      <td><span class="badge bg-success">Criar</span></td>
                      <td>Produto</td>
                      <td>192.168.1.100</td>
                      <td>Produto "Pizza Grande" criado</td>
                    </tr>
                    <tr>
                      <td>15/01/2024 14:25</td>
                      <td>Maria Santos</td>
                      <td><span class="badge bg-primary">Aprovar</span></td>
                      <td>Transação</td>
                      <td>192.168.1.101</td>
                      <td>Ticket #123 aprovado</td>
                    </tr>
                    <tr>
                      <td>15/01/2024 14:20</td>
                      <td>João Silva</td>
                      <td><span class="badge bg-info">Login</span></td>
                      <td>Sistema</td>
                      <td>192.168.1.100</td>
                      <td>Login realizado com sucesso</td>
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

// Dados mock para auditoria
const mockAuditoriaData = [
  {
    id: 1,
    data: '2024-01-15T14:30:00',
    usuario: 'João Silva',
    acao: 'Criar',
    recurso: 'Produto',
    ip: '192.168.1.100',
    detalhes: 'Produto "Pizza Grande" criado'
  },
  {
    id: 2,
    data: '2024-01-15T14:25:00',
    usuario: 'Maria Santos',
    acao: 'Aprovar',
    recurso: 'Transação',
    ip: '192.168.1.101',
    detalhes: 'Ticket #123 aprovado'
  },
  {
    id: 3,
    data: '2024-01-15T14:20:00',
    usuario: 'João Silva',
    acao: 'Login',
    recurso: 'Sistema',
    ip: '192.168.1.100',
    detalhes: 'Login realizado com sucesso'
  }
];

// Função de busca automática com debounce
const pesquisarAuditoriaAuto = debounce(() => {
  aplicarFiltrosAuditoriaAuto();
}, 300);

// Exportar para escopo global
window.pesquisarAuditoriaAuto = pesquisarAuditoriaAuto;

// Função alternativa simples para teste
window.testPesquisarAuditoria = function() {
  console.log('Teste de pesquisa de auditoria');
  const input = document.getElementById('pesquisaAuditoria');
  if (input) {
    console.log('Input encontrado:', input.value);
    aplicarFiltrosAuditoriaAuto();
  } else {
    console.log('Input não encontrado');
  }
};

// Função para aplicar filtros automaticamente
export function aplicarFiltrosAuditoriaAuto() {
  const termo = document.getElementById('pesquisaAuditoria')?.value.toLowerCase() || '';
  const usuario = document.getElementById('filtroUsuario')?.value || '';
  const acao = document.getElementById('filtroAcao')?.value || '';
  const data = document.getElementById('filtroDataAuditoria')?.value || '';
  
  let auditoriaFiltrada = [...mockAuditoriaData];
  
  // Filtro por termo de busca
  if (termo) {
    auditoriaFiltrada = auditoriaFiltrada.filter(registro => 
      registro.usuario.toLowerCase().includes(termo) ||
      registro.acao.toLowerCase().includes(termo) ||
      registro.recurso.toLowerCase().includes(termo) ||
      registro.detalhes.toLowerCase().includes(termo)
    );
  }
  
  // Filtro por usuário
  if (usuario) {
    auditoriaFiltrada = auditoriaFiltrada.filter(registro => 
      registro.usuario.toLowerCase().includes(usuario)
    );
  }
  
  // Filtro por ação
  if (acao) {
    auditoriaFiltrada = auditoriaFiltrada.filter(registro => 
      registro.acao.toLowerCase() === acao.toLowerCase()
    );
  }
  
  // Filtro por data
  if (data) {
    auditoriaFiltrada = auditoriaFiltrada.filter(registro => {
      const registroData = new Date(registro.data).toISOString().split('T')[0];
      return registroData === data;
    });
  }
  
  // Atualizar a exibição da auditoria
  atualizarExibicaoAuditoria(auditoriaFiltrada);
}

// Função para atualizar a exibição da auditoria
function atualizarExibicaoAuditoria(registros) {
  const tbody = document.querySelector('tbody');
  if (tbody) {
    tbody.innerHTML = registros.map(registro => `
      <tr>
        <td>${new Date(registro.data).toLocaleString('pt-BR')}</td>
        <td>${registro.usuario}</td>
        <td><span class="badge bg-${getBadgeColor(registro.acao)}">${registro.acao}</span></td>
        <td>${registro.recurso}</td>
        <td>${registro.ip}</td>
        <td>${registro.detalhes}</td>
      </tr>
    `).join('') || `
      <tr>
        <td colspan="6" class="text-center py-4">
          <i class="bi bi-search text-muted" style="font-size: 2rem;"></i>
          <h6 class="mt-2 text-muted">Nenhum registro encontrado!</h6>
          <p class="text-muted small">Tente ajustar os filtros de busca.</p>
        </td>
      </tr>
    `;
  }
}

// Função auxiliar para determinar a cor do badge
function getBadgeColor(acao) {
  switch (acao.toLowerCase()) {
    case 'criar':
      return 'success';
    case 'editar':
      return 'primary';
    case 'excluir':
      return 'danger';
    case 'login':
      return 'info';
    case 'aprovar':
      return 'success';
    case 'rejeitar':
      return 'warning';
    default:
      return 'secondary';
  }
}

// Função para limpar todos os filtros
export function limparFiltrosAuditoria() {
  const pesquisaInput = document.getElementById('pesquisaAuditoria');
  const usuarioSelect = document.getElementById('filtroUsuario');
  const acaoSelect = document.getElementById('filtroAcao');
  const dataInput = document.getElementById('filtroDataAuditoria');
  
  if (pesquisaInput) pesquisaInput.value = '';
  if (usuarioSelect) usuarioSelect.value = '';
  if (acaoSelect) acaoSelect.value = '';
  if (dataInput) dataInput.value = '';
  
  aplicarFiltrosAuditoriaAuto();
}
