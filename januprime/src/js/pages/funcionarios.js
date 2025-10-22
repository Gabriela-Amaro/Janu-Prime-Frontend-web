import { mockData } from '../config/mockData.js';
import { debounce } from '../utils/debounce.js';
import { showNotification } from '../utils/notifications.js';
import { getMainFooter } from '../components/main-footer.js';

export function getFuncionariosContent() {
  return `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col-12 d-flex justify-content-between align-items-center">
          <div>
            <h1 class="text-gradient mb-0">Funcionários</h1>
            <p class="text-muted">Gerencie os funcionários do estabelecimento</p>
          </div>
          <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#funcionarioModal">
            <i class="bi bi-plus-lg me-2"></i>Adicionar Funcionário
          </button>
        </div>
      </div>
      
      <!-- Filtros e Pesquisa -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <div class="row">
                <div class="col-md-4">
                  <label for="pesquisaFuncionario" class="form-label">Pesquisar Funcionário</label>
                  <div class="input-group">
                    <input type="text" class="form-control" id="pesquisaFuncionario" placeholder="Nome ou email..." oninput="testPesquisarFuncionarios()">
                    <span class="input-group-text">
                      <i class="bi bi-search"></i>
                    </span>
                  </div>
                </div>
                <div class="col-md-3">
                  <label for="filtroCargo" class="form-label">Cargo</label>
                  <div class="dropdown">
                    <select class="form-select" id="filtroCargo" onchange="testPesquisarFuncionarios()">
                      <option value="">Todos</option>
                      <option value="gerente">Gerente</option>
                      <option value="funcionario">Funcionário</option>
                    </select>
                    <i class="bi bi-chevron-down dropdown-icon"></i>
                  </div>
                </div>
                <div class="col-md-3">
                  <label for="filtroStatusFuncionario" class="form-label">Status</label>
                  <div class="dropdown">
                    <select class="form-select" id="filtroStatusFuncionario" onchange="testPesquisarFuncionarios()">
                      <option value="">Todos</option>
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                    </select>
                    <i class="bi bi-chevron-down dropdown-icon"></i>
                  </div>
                </div>
                <div class="col-md-2 d-flex align-items-end">
                  <button class="btn btn-outline-secondary w-100" onclick="limparFiltrosFuncionarios()">
                    <i class="bi bi-arrow-clockwise me-1"></i>Limpar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="row">
        <div class="col-12">
          <div class="card">
            <div class="card-body">
              <div class="table-responsive">
                <table class="table table-dark table-hover">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>E-mail</th>
                      <th>Cargo</th>
                      <th>Status</th>
                      <th>Data de Cadastro</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    ${mockData.funcionarios.map(funcionario => `
                      <tr>
                        <td>${funcionario.nome}</td>
                        <td>${funcionario.email}</td>
                        <td>
                          <span class="badge ${funcionario.cargo === 'gerente' ? 'bg-primary' : 'bg-secondary'}">
                            ${funcionario.cargo === 'gerente' ? 'Gerente' : 'Funcionário'}
                          </span>
                        </td>
                        <td>
                          <span class="badge ${funcionario.ativo ? 'bg-success' : 'bg-danger'}">
                            ${funcionario.ativo ? 'Ativo' : 'Inativo'}
                          </span>
                        </td>
                        <td>${new Date().toLocaleDateString('pt-BR')}</td>
                        <td>
                          <div class="btn-group" role="group">
                            <button class="btn btn-sm btn-outline-primary" onclick="editarFuncionario(${funcionario.id})" title="Editar">
                              <i class="bi bi-pencil"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-warning" onclick="toggleFuncionario(${funcionario.id})" title="${funcionario.ativo ? 'Desativar' : 'Ativar'}">
                              <i class="bi bi-${funcionario.ativo ? 'pause' : 'play'}"></i>
                            </button>
                            <button class="btn btn-sm btn-outline-danger" onclick="excluirFuncionario(${funcionario.id})" title="Excluir">
                              <i class="bi bi-trash"></i>
                            </button>
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
const pesquisarFuncionariosAuto = debounce(() => {
  aplicarFiltrosFuncionariosAuto();
}, 300);

// Exportar para escopo global
window.pesquisarFuncionariosAuto = pesquisarFuncionariosAuto;

// Função alternativa simples para teste
window.testPesquisarFuncionarios = function() {
  console.log('Teste de pesquisa de funcionários');
  const input = document.getElementById('pesquisaFuncionario');
  if (input) {
    console.log('Input encontrado:', input.value);
    aplicarFiltrosFuncionariosAuto();
  } else {
    console.log('Input não encontrado');
  }
};

// Função para aplicar filtros automaticamente
export function aplicarFiltrosFuncionariosAuto() {
  const termo = document.getElementById('pesquisaFuncionario')?.value.toLowerCase() || '';
  const cargo = document.getElementById('filtroCargo')?.value || '';
  const status = document.getElementById('filtroStatusFuncionario')?.value || '';
  
  let funcionariosFiltrados = [...mockData.funcionarios];
  
  // Filtro por termo de busca
  if (termo) {
    funcionariosFiltrados = funcionariosFiltrados.filter(funcionario => 
      funcionario.nome.toLowerCase().includes(termo) ||
      funcionario.email.toLowerCase().includes(termo)
    );
  }
  
  // Filtro por cargo
  if (cargo) {
    funcionariosFiltrados = funcionariosFiltrados.filter(funcionario => 
      funcionario.cargo === cargo
    );
  }
  
  // Filtro por status
  if (status) {
    funcionariosFiltrados = funcionariosFiltrados.filter(funcionario => 
      (status === 'ativo' && funcionario.ativo) || 
      (status === 'inativo' && !funcionario.ativo)
    );
  }
  
  // Atualizar a exibição dos funcionários
  atualizarExibicaoFuncionarios(funcionariosFiltrados);
}

// Função para atualizar a exibição dos funcionários
function atualizarExibicaoFuncionarios(funcionarios) {
  const tbody = document.querySelector('tbody');
  if (tbody) {
    tbody.innerHTML = funcionarios.map(funcionario => `
      <tr>
        <td>${funcionario.nome}</td>
        <td>${funcionario.email}</td>
        <td>
          <span class="badge ${funcionario.cargo === 'gerente' ? 'bg-primary' : 'bg-secondary'}">
            ${funcionario.cargo === 'gerente' ? 'Gerente' : 'Funcionário'}
          </span>
        </td>
        <td>
          <span class="badge ${funcionario.ativo ? 'bg-success' : 'bg-danger'}">
            ${funcionario.ativo ? 'Ativo' : 'Inativo'}
          </span>
        </td>
        <td>${new Date().toLocaleDateString('pt-BR')}</td>
        <td>
          <div class="btn-group" role="group">
            <button class="btn btn-sm btn-outline-primary" onclick="editarFuncionario(${funcionario.id})" title="Editar">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm btn-outline-warning" onclick="toggleFuncionario(${funcionario.id})" title="${funcionario.ativo ? 'Desativar' : 'Ativar'}">
              <i class="bi bi-${funcionario.ativo ? 'pause' : 'play'}"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="excluirFuncionario(${funcionario.id})" title="Excluir">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('') || `
      <tr>
        <td colspan="6" class="text-center py-4">
          <i class="bi bi-search text-muted" style="font-size: 2rem;"></i>
          <h6 class="mt-2 text-muted">Nenhum funcionário encontrado!</h6>
          <p class="text-muted small">Tente ajustar os filtros de busca.</p>
        </td>
      </tr>
    `;
  }
}

// Função para limpar todos os filtros
export function limparFiltrosFuncionarios() {
  const pesquisaInput = document.getElementById('pesquisaFuncionario');
  const cargoSelect = document.getElementById('filtroCargo');
  const statusSelect = document.getElementById('filtroStatusFuncionario');
  
  if (pesquisaInput) pesquisaInput.value = '';
  if (cargoSelect) cargoSelect.value = '';
  if (statusSelect) statusSelect.value = '';
  
  aplicarFiltrosFuncionariosAuto();
}

// Funções originais mantidas para compatibilidade
export function pesquisarFuncionarios() {
  aplicarFiltrosFuncionariosAuto();
}

export function aplicarFiltrosFuncionarios() {
  aplicarFiltrosFuncionariosAuto();
}
