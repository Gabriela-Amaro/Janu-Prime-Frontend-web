import { mockData } from '../config/mockData.js';
import { debounce } from '../utils/debounce.js';
import { showNotification } from '../utils/notifications.js';
import { getMainFooter } from '../components/main-footer.js';

export function getCatalogoContent() {
  return `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col-12 d-flex justify-content-between align-items-center">
          <div>
            <h1 class="text-gradient mb-0">Catálogo de Produtos</h1>
            <p class="text-muted">Gerencie os produtos disponíveis para resgate</p>
          </div>
          <button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#produtoModal">
            <i class="bi bi-plus-lg me-2"></i>Adicionar Produto
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
                  <label for="pesquisaProduto" class="form-label">Pesquisar Produto</label>
                  <div class="input-group">
                    <input type="text" class="form-control" id="pesquisaProduto" placeholder="Nome do produto..." oninput="testPesquisarProdutos()">
                    <span class="input-group-text">
                      <i class="bi bi-search"></i>
                    </span>
                  </div>
                </div>
                <div class="col-md-3">
                  <label for="filtroStatus" class="form-label">Status</label>
                  <div class="dropdown">
                    <select class="form-select" id="filtroStatus" onchange="testPesquisarProdutos()">
                      <option value="">Todos</option>
                      <option value="ativo">Ativo</option>
                      <option value="inativo">Inativo</option>
                    </select>
                    <i class="bi bi-chevron-down dropdown-icon"></i>
                  </div>
                </div>
                <div class="col-md-3">
                  <label for="filtroPontos" class="form-label">Faixa de Pontos</label>
                  <div class="dropdown">
                    <select class="form-select" id="filtroPontos" onchange="testPesquisarProdutos()">
                      <option value="">Todos</option>
                      <option value="0-100">0 - 100 pontos</option>
                      <option value="101-500">101 - 500 pontos</option>
                      <option value="501-1000">501 - 1000 pontos</option>
                      <option value="1000+">Acima de 1000 pontos</option>
                    </select>
                    <i class="bi bi-chevron-down dropdown-icon"></i>
                  </div>
                </div>
                <div class="col-md-2 d-flex align-items-end">
                  <button class="btn btn-outline-secondary w-100" onclick="limparFiltros()">
                    <i class="bi bi-arrow-clockwise me-1"></i>Limpar
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="row" id="produtos-container">
        ${mockData.produtos.map(produto => `
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="card h-100">
                <div class="card-body">
                <div class="d-flex justify-content-between align-items-start mb-3">
                  <h5 class="card-title">${produto.nome}</h5>
                  <span class="badge ${produto.ativo ? 'bg-success' : 'bg-secondary'}">
                    ${produto.ativo ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <p class="card-text">${produto.descricao}</p>
                <div class="d-flex justify-content-between align-items-center">
                  <span class="h6 text-primary mb-0">${produto.pontos} pontos</span>
                  <div>
                    <button class="btn btn-sm btn-outline-primary me-2" onclick="editarProduto(${produto.id})">
                      <i class="bi bi-pencil"></i>
                    </button>
                    <button class="btn btn-sm btn-outline-danger" onclick="excluirProduto(${produto.id})">
                      <i class="bi bi-trash"></i>
                    </button>
                  </div>
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

export function editarProduto(id) {
  console.log('Editando produto:', id);
  showNotification('Função de edição será implementada em breve', 'info');
}

export function excluirProduto(id) {
  console.log('Excluindo produto:', id);
  showNotification('Produto removido com sucesso! O item foi excluído do catálogo.', 'success');
}

// Função de busca automática com debounce
const pesquisarProdutosAuto = debounce(() => {
  console.log('Pesquisando produtos automaticamente...');
  aplicarFiltrosAuto();
}, 300);

// Exportar para escopo global
window.pesquisarProdutosAuto = pesquisarProdutosAuto;

// Função alternativa simples para teste
window.testPesquisarProdutos = function() {
  console.log('Teste de pesquisa de produtos');
  const input = document.getElementById('pesquisaProduto');
  if (input) {
    console.log('Input encontrado:', input.value);
    aplicarFiltrosAuto();
  } else {
    console.log('Input não encontrado');
  }
};

// Exportar função para escopo global
window.limparFiltros = limparFiltros;

// Função para aplicar filtros automaticamente
export function aplicarFiltrosAuto() {
  try {
    const termo = document.getElementById('pesquisaProduto')?.value.toLowerCase() || '';
    const status = document.getElementById('filtroStatus')?.value || '';
    const pontos = document.getElementById('filtroPontos')?.value || '';
    
    let produtosFiltrados = [...mockData.produtos];
    
    // Filtro por termo de busca
    if (termo) {
      produtosFiltrados = produtosFiltrados.filter(produto => 
        produto.nome.toLowerCase().includes(termo) ||
        produto.descricao.toLowerCase().includes(termo)
      );
    }
    
    // Filtro por status
    if (status) {
      produtosFiltrados = produtosFiltrados.filter(produto => 
        (status === 'ativo' && produto.ativo) || 
        (status === 'inativo' && !produto.ativo)
      );
    }
    
    // Filtro por faixa de pontos
    if (pontos) {
      produtosFiltrados = produtosFiltrados.filter(produto => {
        switch (pontos) {
          case '0-100':
            return produto.pontos >= 0 && produto.pontos <= 100;
          case '101-500':
            return produto.pontos >= 101 && produto.pontos <= 500;
          case '501-1000':
            return produto.pontos >= 501 && produto.pontos <= 1000;
          case '1000+':
            return produto.pontos > 1000;
          default:
            return true;
        }
      });
    }
    
    // Atualizar a exibição dos produtos
    atualizarExibicaoProdutos(produtosFiltrados);
  } catch (error) {
    console.error('Erro ao aplicar filtros:', error);
  }
}

// Função para atualizar a exibição dos produtos
function atualizarExibicaoProdutos(produtos) {
  // Procurar pelo container de produtos usando ID específico
  let container = document.getElementById('produtos-container');
  if (!container) {
    // Fallback: procurar pelo container de produtos de forma mais robusta
    container = document.querySelector('.container-fluid .row:last-child');
    if (!container) {
      // Se não encontrar, procurar por qualquer row que contenha cards de produtos
      const rows = document.querySelectorAll('.row');
      for (let row of rows) {
        if (row.querySelector('.card')) {
          container = row;
          break;
        }
      }
    }
  }
  
  console.log('Container encontrado:', container);
  
  if (container) {
    const html = produtos.length > 0 ? produtos.map(produto => `
      <div class="col-lg-4 col-md-6 mb-4">
        <div class="card h-100">
            <div class="card-body">
            <div class="d-flex justify-content-between align-items-start mb-3">
              <h5 class="card-title">${produto.nome}</h5>
              <span class="badge ${produto.ativo ? 'bg-success' : 'bg-secondary'}">
                ${produto.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <p class="card-text">${produto.descricao}</p>
            <div class="d-flex justify-content-between align-items-center">
              <span class="h6 text-primary mb-0">${produto.pontos} pontos</span>
              <div>
                <button class="btn btn-sm btn-outline-primary me-2" onclick="editarProduto(${produto.id})">
                  <i class="bi bi-pencil"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="excluirProduto(${produto.id})">
                  <i class="bi bi-trash"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `).join('') : `
      <div class="col-12 text-center py-5">
        <i class="bi bi-search text-muted" style="font-size: 3rem;"></i>
        <h5 class="mt-3 text-muted">Nenhum produto encontrado!</h5>
        <p class="text-muted">Tente ajustar os filtros de busca.</p>
      </div>
    `;
    
    container.innerHTML = html;
    console.log('Produtos atualizados:', produtos.length);
  } else {
    console.error('Container não encontrado para atualizar produtos');
  }
}

// Função para limpar todos os filtros
export function limparFiltros() {
  const pesquisaInput = document.getElementById('pesquisaProduto');
  const statusSelect = document.getElementById('filtroStatus');
  const pontosSelect = document.getElementById('filtroPontos');
  
  if (pesquisaInput) pesquisaInput.value = '';
  if (statusSelect) statusSelect.value = '';
  if (pontosSelect) pontosSelect.value = '';
  
  aplicarFiltrosAuto();
}

// Funções originais mantidas para compatibilidade
export function pesquisarProdutos() {
  aplicarFiltrosAuto();
}

export function aplicarFiltros() {
  aplicarFiltrosAuto();
}
