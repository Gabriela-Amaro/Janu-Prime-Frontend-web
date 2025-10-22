import { mockData } from '../config/mockData.js';
import { debounce } from '../utils/debounce.js';
import { showNotification } from '../utils/notifications.js';
import { getMainFooter } from '../components/main-footer.js';

export function getAnunciosContent() {
  return `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col-12 d-flex justify-content-between align-items-center">
          <div>
            <h1 class="text-gradient mb-0">Anúncios</h1>
            <p class="text-muted">Gerencie os anúncios promocionais</p>
          </div>
          <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#anuncioModal">
            <i class="bi bi-plus-lg me-2"></i>Criar Anúncio
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
                  <label for="pesquisaAnuncio" class="form-label">Pesquisar Anúncio</label>
                  <div class="input-group">
                    <input type="text" class="form-control" id="pesquisaAnuncio" placeholder="Título do anúncio..." oninput="testPesquisarAnuncios()">
                    <span class="input-group-text">
                      <i class="bi bi-search"></i>
                    </span>
                  </div>
                </div>
                <div class="col-md-3">
                  <label for="filtroStatusAnuncio" class="form-label">Status</label>
                  <div class="dropdown">
                    <select class="form-select" id="filtroStatusAnuncio" onchange="testPesquisarAnuncios()">
                      <option value="">Todos</option>
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                      <option value="expirado">Expirado</option>
                    </select>
                    <i class="bi bi-chevron-down dropdown-icon"></i>
                  </div>
                </div>
                <div class="col-md-3">
                  <label for="filtroDataAnuncio" class="form-label">Período</label>
                  <div class="dropdown">
                    <select class="form-select" id="filtroDataAnuncio" onchange="testPesquisarAnuncios()">
                      <option value="">Todos</option>
                      <option value="hoje">Hoje</option>
                      <option value="semana">Esta semana</option>
                      <option value="mes">Este mês</option>
                      <option value="ano">Este ano</option>
                    </select>
                    <i class="bi bi-chevron-down dropdown-icon"></i>
                  </div>
                </div>
                <div class="col-md-2 d-flex align-items-end">
                  <button class="btn btn-outline-secondary w-100" onclick="limparFiltrosAnuncios()">
                    <i class="bi bi-arrow-clockwise me-1"></i>Limpar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="row" id="anuncios-container">
        ${mockData.anuncios.map(anuncio => `
          <div class="col-lg-6 mb-4">
            <div class="card">
              <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <h5 class="card-title">${anuncio.titulo}</h5>
                  <span class="badge ${anuncio.ativo ? 'bg-success' : 'bg-secondary'}">
                    ${anuncio.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <p class="card-text">${anuncio.descricao}</p>
                <div class="row text-muted small mb-3">
                  <div class="col-6">
                    <strong>Início:</strong> ${new Date(anuncio.dataInicio).toLocaleDateString('pt-BR')}
                  </div>
                  <div class="col-6">
                    <strong>Fim:</strong> ${new Date(anuncio.dataFim).toLocaleDateString('pt-BR')}
                  </div>
                </div>
                <div class="d-flex gap-2">
                  <button class="btn btn-sm btn-outline-primary" onclick="editarAnuncio(${anuncio.id})">
                    <i class="bi bi-pencil me-1"></i>Editar
                  </button>
                  <button class="btn btn-sm btn-outline-danger" onclick="excluirAnuncio(${anuncio.id})">
                    <i class="bi bi-trash me-1"></i>Excluir
                  </button>
                </div>
              </div>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
    
    ${getMainFooter()}
  `;
}

// Função de busca automática com debounce
const pesquisarAnunciosAuto = debounce(() => {
  aplicarFiltrosAnunciosAuto();
}, 300);

// Exportar para escopo global
window.pesquisarAnunciosAuto = pesquisarAnunciosAuto;

// Função alternativa simples para teste
window.testPesquisarAnuncios = function() {
  console.log('Teste de pesquisa de anúncios');
  const input = document.getElementById('pesquisaAnuncio');
  if (input) {
    console.log('Input encontrado:', input.value);
    aplicarFiltrosAnunciosAuto();
  } else {
    console.log('Input não encontrado');
  }
};

// Exportar função para escopo global
window.limparFiltrosAnuncios = limparFiltrosAnuncios;

// Função de teste para verificar os filtros
window.testarFiltrosAnuncios = function() {
  console.log('=== TESTE DOS FILTROS DE ANÚNCIOS ===');
  
  // Teste 1: Filtro de status "ativo"
  console.log('\n1. Testando filtro de status "ativo":');
  document.getElementById('filtroStatusAnuncio').value = 'ativo';
  document.getElementById('pesquisaAnuncio').value = '';
  document.getElementById('filtroDataAnuncio').value = '';
  aplicarFiltrosAnunciosAuto();
  
  // Teste 2: Filtro de status "expirado"
  console.log('\n2. Testando filtro de status "expirado":');
  document.getElementById('filtroStatusAnuncio').value = 'expirado';
  aplicarFiltrosAnunciosAuto();
  
  // Teste 3: Filtro de período "hoje"
  console.log('\n3. Testando filtro de período "hoje":');
  document.getElementById('filtroStatusAnuncio').value = '';
  document.getElementById('filtroDataAnuncio').value = 'hoje';
  aplicarFiltrosAnunciosAuto();
  
  // Teste 4: Filtro de período "semana"
  console.log('\n4. Testando filtro de período "semana":');
  document.getElementById('filtroDataAnuncio').value = 'semana';
  aplicarFiltrosAnunciosAuto();
  
  // Teste 5: Limpar filtros
  console.log('\n5. Limpando filtros:');
  limparFiltrosAnuncios();
  
  console.log('\n=== FIM DOS TESTES ===');
};

// Função para aplicar filtros automaticamente
export function aplicarFiltrosAnunciosAuto() {
  try {
    const termo = document.getElementById('pesquisaAnuncio')?.value.toLowerCase() || '';
    const status = document.getElementById('filtroStatusAnuncio')?.value || '';
    const periodo = document.getElementById('filtroDataAnuncio')?.value || '';
    
    console.log('Aplicando filtros:', { termo, status, periodo });
    
    let anunciosFiltrados = [...mockData.anuncios];
    console.log('Total de anúncios antes dos filtros:', anunciosFiltrados.length);
  
  // Filtro por termo de busca
  if (termo) {
    anunciosFiltrados = anunciosFiltrados.filter(anuncio => 
      anuncio.titulo.toLowerCase().includes(termo) ||
      anuncio.descricao.toLowerCase().includes(termo)
    );
    console.log('Após filtro de termo:', anunciosFiltrados.length);
  }
  
  // Filtro por status
  if (status) {
    anunciosFiltrados = anunciosFiltrados.filter(anuncio => {
      const hoje = new Date();
      const dataInicio = new Date(anuncio.dataInicio);
      const dataFim = new Date(anuncio.dataFim);
      
      if (status === 'ativo') {
        // Anúncio ativo: campo ativo=true E dentro do período de vigência
        return anuncio.ativo && dataInicio <= hoje && dataFim >= hoje;
      } else if (status === 'inativo') {
        // Anúncio inativo: campo ativo=false OU fora do período de vigência
        return !anuncio.ativo || dataInicio > hoje || dataFim < hoje;
      } else if (status === 'expirado') {
        // Anúncio expirado: data fim já passou
        return dataFim < hoje;
      }
      return true;
    });
    console.log('Após filtro de status:', anunciosFiltrados.length);
  }
  
  // Filtro por período
  if (periodo) {
    const hoje = new Date();
    anunciosFiltrados = anunciosFiltrados.filter(anuncio => {
      const dataInicio = new Date(anuncio.dataInicio);
      const dataFim = new Date(anuncio.dataFim);
      
      switch (periodo) {
        case 'hoje':
          // Anúncios que começaram hoje
          return dataInicio.toDateString() === hoje.toDateString();
        case 'semana':
          // Anúncios que começaram na última semana
          const semanaAtras = new Date(hoje);
          semanaAtras.setDate(hoje.getDate() - 7);
          return dataInicio >= semanaAtras && dataInicio <= hoje;
        case 'mes':
          // Anúncios que começaram no último mês
          const mesAtras = new Date(hoje);
          mesAtras.setMonth(hoje.getMonth() - 1);
          return dataInicio >= mesAtras && dataInicio <= hoje;
        case 'ano':
          // Anúncios que começaram no último ano
          const anoAtras = new Date(hoje);
          anoAtras.setFullYear(hoje.getFullYear() - 1);
          return dataInicio >= anoAtras && dataInicio <= hoje;
        default:
          return true;
      }
    });
    console.log('Após filtro de período:', anunciosFiltrados.length);
  }
  
  // Atualizar a exibição dos anúncios
  console.log('Resultado final:', anunciosFiltrados.length, 'anúncios');
  atualizarExibicaoAnuncios(anunciosFiltrados);
  } catch (error) {
    console.error('Erro ao aplicar filtros de anúncios:', error);
  }
}

// Função para atualizar a exibição dos anúncios
function atualizarExibicaoAnuncios(anuncios) {
  // Procurar pelo container de anúncios usando ID específico
  let container = document.getElementById('anuncios-container');
  if (!container) {
    // Fallback: procurar pelo container de anúncios de forma mais robusta
    container = document.querySelector('.container-fluid .row:last-child');
    if (!container) {
      // Se não encontrar, procurar por qualquer row que contenha cards de anúncios
      const rows = document.querySelectorAll('.row');
      for (let row of rows) {
        if (row.querySelector('.card')) {
          container = row;
          break;
        }
      }
    }
  }
  
  console.log('Container de anúncios encontrado:', container);
  
  if (container) {
    const html = anuncios.length > 0 ? anuncios.map(anuncio => `
      <div class="col-lg-6 mb-4">
        <div class="card">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <h5 class="card-title">${anuncio.titulo}</h5>
              <span class="badge ${anuncio.ativo ? 'bg-success' : 'bg-secondary'}">
                ${anuncio.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <p class="card-text">${anuncio.descricao}</p>
            <div class="row text-muted small mb-3">
              <div class="col-6">
                <strong>Início:</strong> ${new Date(anuncio.dataInicio).toLocaleDateString('pt-BR')}
              </div>
              <div class="col-6">
                <strong>Fim:</strong> ${new Date(anuncio.dataFim).toLocaleDateString('pt-BR')}
              </div>
            </div>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-primary" onclick="editarAnuncio(${anuncio.id})">
                <i class="bi bi-pencil me-1"></i>Editar
              </button>
              <button class="btn btn-sm btn-outline-danger" onclick="excluirAnuncio(${anuncio.id})">
                <i class="bi bi-trash me-1"></i>Excluir
              </button>
            </div>
          </div>
        </div>
      </div>
    `).join('') : `
      <div class="col-12 text-center py-5">
        <i class="bi bi-search text-muted" style="font-size: 3rem;"></i>
        <h5 class="mt-3 text-muted">Nenhum anúncio encontrado!</h5>
        <p class="text-muted">Tente ajustar os filtros de busca.</p>
      </div>
    `;
    
    container.innerHTML = html;
    console.log('Anúncios atualizados:', anuncios.length);
  } else {
    console.error('Container não encontrado para atualizar anúncios');
  }
}

// Função para limpar todos os filtros
export function limparFiltrosAnuncios() {
  const pesquisaInput = document.getElementById('pesquisaAnuncio');
  const statusSelect = document.getElementById('filtroStatusAnuncio');
  const periodoSelect = document.getElementById('filtroDataAnuncio');
  
  if (pesquisaInput) pesquisaInput.value = '';
  if (statusSelect) statusSelect.value = '';
  if (periodoSelect) periodoSelect.value = '';
  
  aplicarFiltrosAnunciosAuto();
}

// Funções originais mantidas para compatibilidade
export function pesquisarAnuncios() {
  aplicarFiltrosAnunciosAuto();
}

export function aplicarFiltrosAnuncios() {
  aplicarFiltrosAnunciosAuto();
}

// Funções para manipular anúncios
export function editarAnuncio(id) {
  console.log('Editando anúncio:', id);
  showNotification('Função de edição será implementada em breve', 'info');
}

export function excluirAnuncio(id) {
  console.log('Excluindo anúncio:', id);
  showNotification('Anúncio removido com sucesso! O item foi excluído.', 'success');
}
