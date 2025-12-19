import { administradoresService } from '../services/administradores.js';
import { debounce } from '../utils/debounce.js';
import { showNotification } from '../utils/notifications.js';
import { getMainFooter } from '../components/main-footer.js';

// Estado local para armazenar funcionários
let funcionariosData = [];
let funcionarioEditandoId = null;

/**
 * Carrega funcionários da API
 */
export async function carregarFuncionarios() {
  try {
    const tbody = document.querySelector('.funcionarios-table tbody');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Carregando...</span>
            </div>
            <p class="mt-2 text-muted">Carregando funcionários...</p>
          </td>
        </tr>
      `;
    }

    const response = await administradoresService.listar();
    funcionariosData = Array.isArray(response) ? response : [];
    
    atualizarExibicaoFuncionarios(funcionariosData);
    return funcionariosData;
  } catch (error) {
    console.error('Erro ao carregar funcionários:', error);
    showNotification('Erro ao carregar funcionários. Tente novamente.', 'error');
    
    const tbody = document.querySelector('.funcionarios-table tbody');
    if (tbody) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-4">
            <i class="bi bi-exclamation-triangle text-danger" style="font-size: 2rem;"></i>
            <h6 class="mt-2 text-danger">Erro ao carregar funcionários</h6>
            <p class="text-muted small">Verifique sua conexão e tente novamente.</p>
            <button class="btn btn-outline-primary btn-sm" onclick="carregarFuncionarios()">
              <i class="bi bi-arrow-clockwise me-1"></i>Tentar novamente
            </button>
          </td>
        </tr>
      `;
    }
    return [];
  }
}

// Expor para escopo global
window.carregarFuncionarios = carregarFuncionarios;

export function getFuncionariosContent() {
  // Carregar funcionários após o conteúdo ser inserido no DOM
  setTimeout(() => {
    carregarFuncionarios();
  }, 100);

  return `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col-12 d-flex justify-content-between align-items-center">
          <div>
            <h1 class="text-gradient mb-0">Funcionários</h1>
            <p class="text-muted">Gerencie os funcionários do estabelecimento</p>
          </div>
          <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#funcionarioModal" onclick="prepararNovoFuncionario()">
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
                    <input type="text" class="form-control" id="pesquisaFuncionario" placeholder="Nome ou email..." oninput="filtrarFuncionariosLocal()">
                    <span class="input-group-text">
                      <i class="bi bi-search"></i>
                    </span>
                  </div>
                </div>
                <div class="col-md-3">
                  <label for="filtroCargo" class="form-label">Cargo</label>
                  <div class="dropdown">
                    <select class="form-select" id="filtroCargo" onchange="filtrarFuncionariosLocal()">
                      <option value="">Todos</option>
                      <option value="gerente">Gerente</option>
                      <option value="funcionario">Funcionário</option>
                    </select>
                    <i class="bi bi-chevron-down dropdown-icon"></i>
                  </div>
                </div>
                <div class="col-md-3">
                  <label for="filtroStatus" class="form-label">Status</label>
                  <div class="dropdown">
                    <select class="form-select" id="filtroStatus" onchange="filtrarFuncionariosLocal()">
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
                <table class="table table-dark table-hover funcionarios-table">
                  <thead>
                    <tr>
                      <th>Nome</th>
                      <th>E-mail</th>
                      <th>CPF</th>
                      <th>Cargo</th>
                      <th>Status</th>
                      <th>Data de Cadastro</th>
                      <th>Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td colspan="7" class="text-center py-4">
                        <div class="spinner-border text-primary" role="status">
                          <span class="visually-hidden">Carregando...</span>
                        </div>
                        <p class="mt-2 text-muted">Carregando funcionários...</p>
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

/**
 * Formatar CPF para exibição
 */
function formatarCPF(cpf) {
  if (!cpf) return '-';
  const cpfLimpo = cpf.replace(/\D/g, '');
  if (cpfLimpo.length !== 11) return cpf;
  return cpfLimpo.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4');
}

/**
 * Formatar data para exibição
 */
function formatarData(dataString) {
  if (!dataString) return '-';
  try {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR');
  } catch {
    return '-';
  }
}

/**
 * Obter ID do funcionário (pode estar em usuario ou direto)
 */
function getIdFuncionario(funcionario) {
  return funcionario.usuario?.id || funcionario.id || funcionario.usuario;
}

/**
 * Atualiza a exibição dos funcionários na tabela
 */
function atualizarExibicaoFuncionarios(funcionarios) {
  const tbody = document.querySelector('.funcionarios-table tbody');
  if (!tbody) return;

  if (!funcionarios || funcionarios.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="7" class="text-center py-4">
          <i class="bi bi-people text-muted" style="font-size: 2rem;"></i>
          <h6 class="mt-2 text-muted">Nenhum funcionário encontrado</h6>
          <p class="text-muted small">Clique em "Adicionar Funcionário" para cadastrar o primeiro.</p>
        </td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = funcionarios.map(funcionario => {
    // O ID do administrador é o mesmo que o ID do usuario (PK = usuario_id)
    const id = funcionario.usuario?.id;
    const nome = funcionario.nome || '-';
    // Escapar aspas simples no nome para não quebrar o onclick
    const nomeEscapado = nome.replace(/'/g, "\\'").replace(/"/g, '\\"');
    const email = funcionario.usuario?.email || '-';
    const cpf = formatarCPF(funcionario.cpf);
    const isSuperUser = funcionario.super_user === true;
    const isAtivo = funcionario.usuario?.is_active === true;
    const dataCadastro = formatarData(funcionario.usuario?.created_at);

    return `
      <tr data-funcionario-id="${id}">
        <td>${nome}</td>
        <td>${email}</td>
        <td>${cpf}</td>
        <td>
          <span class="badge ${isSuperUser ? 'bg-primary' : 'bg-secondary'}">
            ${isSuperUser ? 'Gerente' : 'Funcionário'}
          </span>
        </td>
        <td>
          <span class="badge ${isAtivo ? 'bg-success' : 'bg-danger'}">
            ${isAtivo ? 'Ativo' : 'Inativo'}
          </span>
        </td>
        <td>${dataCadastro}</td>
        <td>
          <div class="btn-group" role="group">
            <button class="btn btn-sm btn-outline-primary" onclick="editarFuncionario(${id})" title="Editar">
              <i class="bi bi-pencil"></i>
            </button>
            <button class="btn btn-sm ${isAtivo ? 'btn-outline-warning' : 'btn-outline-success'}" onclick="toggleStatusFuncionario(${id}, ${isAtivo})" title="${isAtivo ? 'Desativar' : 'Ativar'}">
              <i class="bi bi-${isAtivo ? 'pause-fill' : 'play-fill'}"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="confirmarExclusaoFuncionario(${id}, '${nomeEscapado}')" title="Excluir">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

/**
 * Filtra funcionários localmente (já carregados)
 */
export function filtrarFuncionariosLocal() {
  const termo = document.getElementById('pesquisaFuncionario')?.value.toLowerCase() || '';
  const cargo = document.getElementById('filtroCargo')?.value || '';
  const status = document.getElementById('filtroStatus')?.value || '';
  
  let funcionariosFiltrados = [...funcionariosData];
  
  // Filtro por termo de busca
  if (termo) {
    funcionariosFiltrados = funcionariosFiltrados.filter(funcionario => 
      (funcionario.nome?.toLowerCase().includes(termo)) ||
      (funcionario.usuario?.email?.toLowerCase().includes(termo))
    );
  }
  
  // Filtro por cargo (super_user)
  if (cargo) {
    funcionariosFiltrados = funcionariosFiltrados.filter(funcionario => {
      if (cargo === 'gerente') {
        return funcionario.super_user === true;
      } else if (cargo === 'funcionario') {
        return funcionario.super_user === false;
      }
      return true;
    });
  }
  
  // Filtro por status (is_active)
  if (status) {
    funcionariosFiltrados = funcionariosFiltrados.filter(funcionario => {
      if (status === 'ativo') {
        return funcionario.usuario?.is_active === true;
      } else if (status === 'inativo') {
        return funcionario.usuario?.is_active === false;
      }
      return true;
    });
  }
  
  atualizarExibicaoFuncionarios(funcionariosFiltrados);
}

// Expor para escopo global
window.filtrarFuncionariosLocal = filtrarFuncionariosLocal;

// Função de busca automática com debounce
const pesquisarFuncionariosAuto = debounce(() => {
  filtrarFuncionariosLocal();
}, 300);

window.pesquisarFuncionariosAuto = pesquisarFuncionariosAuto;

/**
 * Limpa todos os filtros
 */
export function limparFiltrosFuncionarios() {
  const pesquisaInput = document.getElementById('pesquisaFuncionario');
  const cargoSelect = document.getElementById('filtroCargo');
  const statusSelect = document.getElementById('filtroStatus');
  
  if (pesquisaInput) pesquisaInput.value = '';
  if (cargoSelect) cargoSelect.value = '';
  if (statusSelect) statusSelect.value = '';
  
  atualizarExibicaoFuncionarios(funcionariosData);
}

/**
 * Prepara o modal para adicionar novo funcionário
 */
export function prepararNovoFuncionario() {
  funcionarioEditandoId = null;
  
  // Limpar formulário
  const form = document.getElementById('funcionarioForm');
  if (form) form.reset();
  
  // Atualizar título do modal
  const modalTitle = document.getElementById('funcionarioModalLabel');
  if (modalTitle) modalTitle.textContent = 'Adicionar Funcionário';
  
  // Mostrar campos de senha (obrigatórios para novo funcionário)
  const senhaContainer = document.getElementById('funcionarioSenha')?.closest('.mb-3');
  const confirmarSenhaContainer = document.getElementById('funcionarioConfirmarSenha')?.closest('.mb-3');
  if (senhaContainer) senhaContainer.style.display = 'block';
  if (confirmarSenhaContainer) confirmarSenhaContainer.style.display = 'block';
  
  // Definir campos como obrigatórios
  const senhaInput = document.getElementById('funcionarioSenha');
  const confirmarSenhaInput = document.getElementById('funcionarioConfirmarSenha');
  if (senhaInput) senhaInput.required = true;
  if (confirmarSenhaInput) confirmarSenhaInput.required = true;
  
  // Habilitar campos de CPF e email (editáveis apenas na criação)
  const cpfInput = document.getElementById('funcionarioCpf');
  const emailInput = document.getElementById('funcionarioEmail');
  if (cpfInput) {
    cpfInput.readOnly = false;
    cpfInput.classList.remove('text-muted', 'bg-dark');
    cpfInput.style.opacity = '1';
  }
  if (emailInput) {
    emailInput.readOnly = false;
    emailInput.classList.remove('text-muted', 'bg-dark');
    emailInput.style.opacity = '1';
  }
  
  // Remover avisos de campos não editáveis
  document.getElementById('cpfNaoEditavelAviso')?.remove();
  document.getElementById('emailNaoEditavelAviso')?.remove();
}

window.prepararNovoFuncionario = prepararNovoFuncionario;

/**
 * Prepara o modal para editar funcionário existente
 */
export async function editarFuncionario(id) {
  try {
    funcionarioEditandoId = id;
    
    // Buscar dados do funcionário
    const funcionario = await administradoresService.obter(id);
    
    // Preencher formulário
    const nomeInput = document.getElementById('funcionarioNome');
    const cpfInput = document.getElementById('funcionarioCpf');
    const emailInput = document.getElementById('funcionarioEmail');
    
    if (nomeInput) nomeInput.value = funcionario.nome || '';
    if (cpfInput) cpfInput.value = formatarCPF(funcionario.cpf) || '';
    if (emailInput) emailInput.value = funcionario.usuario?.email || '';
    
    // Atualizar título do modal
    const modalTitle = document.getElementById('funcionarioModalLabel');
    if (modalTitle) modalTitle.textContent = 'Editar Funcionário';
    
    // Ocultar campos de senha (não são editáveis)
    const senhaContainer = document.getElementById('funcionarioSenha')?.closest('.mb-3');
    const confirmarSenhaContainer = document.getElementById('funcionarioConfirmarSenha')?.closest('.mb-3');
    if (senhaContainer) senhaContainer.style.display = 'none';
    if (confirmarSenhaContainer) confirmarSenhaContainer.style.display = 'none';
    
    // Remover obrigatoriedade
    const senhaInput = document.getElementById('funcionarioSenha');
    const confirmarSenhaInput = document.getElementById('funcionarioConfirmarSenha');
    if (senhaInput) senhaInput.required = false;
    if (confirmarSenhaInput) confirmarSenhaInput.required = false;
    
    // Desabilitar campos de CPF e email (não editáveis)
    if (cpfInput) {
      cpfInput.readOnly = true;
      cpfInput.classList.add('text-muted', 'bg-dark');
      cpfInput.style.opacity = '0.6';
      cpfInput.style.cursor = 'not-allowed';
      
      // Adicionar aviso se não existir
      if (!document.getElementById('cpfNaoEditavelAviso')) {
        const aviso = document.createElement('small');
        aviso.id = 'cpfNaoEditavelAviso';
        aviso.className = 'text-muted d-block mt-1';
        aviso.innerHTML = '<i class="bi bi-lock me-1"></i>Este campo não pode ser alterado';
        cpfInput.parentNode.appendChild(aviso);
      }
    }
    if (emailInput) {
      emailInput.readOnly = true;
      emailInput.classList.add('text-muted', 'bg-dark');
      emailInput.style.opacity = '0.6';
      emailInput.style.cursor = 'not-allowed';
      
      // Adicionar aviso se não existir
      if (!document.getElementById('emailNaoEditavelAviso')) {
        const aviso = document.createElement('small');
        aviso.id = 'emailNaoEditavelAviso';
        aviso.className = 'text-muted d-block mt-1';
        aviso.innerHTML = '<i class="bi bi-lock me-1"></i>Este campo não pode ser alterado';
        emailInput.parentNode.appendChild(aviso);
      }
    }
    
    // Abrir modal
    const modal = new window.bootstrap.Modal(document.getElementById('funcionarioModal'));
    modal.show();
    
  } catch (error) {
    console.error('Erro ao carregar funcionário para edição:', error);
    showNotification('Erro ao carregar dados do funcionário.', 'error');
  }
}

window.editarFuncionario = editarFuncionario;

/**
 * Salva funcionário (criar ou atualizar)
 */
export async function salvarFuncionarioDashboard() {
  const nomeInput = document.getElementById('funcionarioNome');
  const cpfInput = document.getElementById('funcionarioCpf');
  const emailInput = document.getElementById('funcionarioEmail');
  const senhaInput = document.getElementById('funcionarioSenha');
  const confirmarSenhaInput = document.getElementById('funcionarioConfirmarSenha');
  
  // Validações básicas
  if (!nomeInput?.value?.trim()) {
    showNotification('Por favor, informe o nome do funcionário.', 'warning');
    nomeInput?.focus();
    return;
  }
  
  if (!emailInput?.value?.trim()) {
    showNotification('Por favor, informe o e-mail do funcionário.', 'warning');
    emailInput?.focus();
    return;
  }
  
  // Validações específicas para novo funcionário
  if (!funcionarioEditandoId) {
    if (!cpfInput?.value?.trim()) {
      showNotification('Por favor, informe o CPF do funcionário.', 'warning');
      cpfInput?.focus();
      return;
    }
    
    if (!senhaInput?.value) {
      showNotification('Por favor, informe a senha do funcionário.', 'warning');
      senhaInput?.focus();
      return;
    }
    
    if (senhaInput?.value !== confirmarSenhaInput?.value) {
      showNotification('As senhas não coincidem.', 'warning');
      confirmarSenhaInput?.focus();
      return;
    }
    
    if (senhaInput?.value.length < 6) {
      showNotification('A senha deve ter pelo menos 6 caracteres.', 'warning');
      senhaInput?.focus();
      return;
    }
  }
  
  try {
    // Limpar CPF (remover pontuação)
    const cpfLimpo = cpfInput?.value?.replace(/\D/g, '') || '';
    
    if (funcionarioEditandoId) {
      // Atualizar funcionário existente
      const dadosAtualizacao = {
        nome: nomeInput.value.trim()
      };
      
      await administradoresService.atualizar(funcionarioEditandoId, dadosAtualizacao);
      showNotification('Funcionário atualizado com sucesso!', 'success');
    } else {
      // Criar novo funcionário
      const dadosCriacao = {
        nome: nomeInput.value.trim(),
        cpf: cpfLimpo,
        email: emailInput.value.trim(),
        password: senhaInput.value,
        password2: confirmarSenhaInput.value
      };
      
      await administradoresService.criar(dadosCriacao);
      showNotification('Funcionário cadastrado com sucesso!', 'success');
    }
    
    // Fechar modal
    const modal = window.bootstrap.Modal.getInstance(document.getElementById('funcionarioModal'));
    if (modal) modal.hide();
    
    // Recarregar lista
    await carregarFuncionarios();
    
  } catch (error) {
    console.error('Erro ao salvar funcionário:', error);
    showNotification(error.message || 'Erro ao salvar funcionário. Tente novamente.', 'error');
  }
}

window.salvarFuncionarioDashboard = salvarFuncionarioDashboard;

/**
 * Confirma exclusão de funcionário
 */
export function confirmarExclusaoFuncionario(id, nome) {
  if (confirm(`Tem certeza que deseja excluir o funcionário "${nome}"?\n\nEsta ação não pode ser desfeita.`)) {
    excluirFuncionario(id);
  }
}

window.confirmarExclusaoFuncionario = confirmarExclusaoFuncionario;

/**
 * Exclui funcionário
 */
export async function excluirFuncionario(id) {
  try {
    await administradoresService.deletar(id);
    showNotification('Funcionário excluído com sucesso!', 'success');
    await carregarFuncionarios();
  } catch (error) {
    console.error('Erro ao excluir funcionário:', error);
    showNotification(error.message || 'Erro ao excluir funcionário. Tente novamente.', 'error');
  }
}

window.excluirFuncionario = excluirFuncionario;

/**
 * Alterna o status ativo/inativo do funcionário
 */
export async function toggleStatusFuncionario(id, statusAtual) {
  const novoStatus = !statusAtual;
  const acao = novoStatus ? 'ativar' : 'desativar';
  
  if (!confirm(`Tem certeza que deseja ${acao} este funcionário?`)) {
    return;
  }
  
  try {
    await administradoresService.atualizar(id, { is_active: novoStatus });
    showNotification(
      novoStatus ? 'Funcionário ativado com sucesso!' : 'Funcionário desativado com sucesso!',
      'success'
    );
    await carregarFuncionarios();
  } catch (error) {
    console.error('Erro ao alterar status do funcionário:', error);
    showNotification(error.message || 'Erro ao alterar status. Tente novamente.', 'error');
  }
}

window.toggleStatusFuncionario = toggleStatusFuncionario;

// Funções de compatibilidade
export function pesquisarFuncionarios() {
  filtrarFuncionariosLocal();
}

export function aplicarFiltrosFuncionarios() {
  filtrarFuncionariosLocal();
}

export function aplicarFiltrosFuncionariosAuto() {
  filtrarFuncionariosLocal();
}

// Função de teste
window.testPesquisarFuncionarios = function() {
  console.log('Teste de pesquisa de funcionários');
  const input = document.getElementById('pesquisaFuncionario');
  if (input) {
    console.log('Input encontrado:', input.value);
    filtrarFuncionariosLocal();
  } else {
    console.log('Input não encontrado');
  }
};
