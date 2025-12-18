import { mockData } from '../config/mockData.js';
import { debounce } from '../utils/debounce.js';
import { showNotification } from '../utils/notifications.js';
import { getMainFooter } from '../components/main-footer.js';
import { produtosService } from '../services/produtos.js';
import { APP_CONFIG } from '../config/app.js';

// Estado global da página
let produtosCarregados = [];
let produtosFiltrados = [];

/**
 * Constrói URL completa da imagem do produto
 */
function getImagemUrl(imagemPath) {
  if (!imagemPath) {
    return '/assets/images/logo.svg'; // Imagem padrão
  }
  
  // Se já for uma URL completa, retornar como está
  if (imagemPath.startsWith('http://') || imagemPath.startsWith('https://')) {
    return imagemPath;
  }
  
  // Construir URL completa usando a base da API
  // O Django geralmente serve arquivos de mídia em /media/
  const baseUrl = APP_CONFIG.apiUrl.replace('/api', '');
  
  // Se o caminho já começar com /media/, usar diretamente
  if (imagemPath.startsWith('/media/')) {
    return `${baseUrl}${imagemPath}`;
  }
  
  // Se não, adicionar /media/ antes do caminho
  const mediaPath = imagemPath.startsWith('/') ? imagemPath : `/${imagemPath}`;
  return `${baseUrl}/media${mediaPath}`;
}

/**
 * Carrega produtos da API
 */
async function carregarProdutos() {
  try {
    const response = await produtosService.listar();
    produtosCarregados = Array.isArray(response) ? response : response.results || [];
    produtosFiltrados = [...produtosCarregados];
    atualizarExibicaoProdutos(produtosFiltrados);
  } catch (error) {
    console.error('Erro ao carregar produtos:', error);
    showNotification('Erro ao carregar produtos', 'error');
    // Mostrar mensagem de erro no container
    const container = document.getElementById('produtos-container');
    if (container) {
      container.innerHTML = `
        <div class="col-12 text-center py-5">
          <i class="bi bi-exclamation-triangle text-warning" style="font-size: 3rem;"></i>
          <h5 class="mt-3 text-muted">Erro ao carregar produtos</h5>
          <p class="text-muted">Tente recarregar a página.</p>
        </div>
      `;
    }
  }
}

export function getCatalogoContent() {
  // Carregar produtos após renderizar
  setTimeout(() => {
    carregarProdutos();
  }, 100);
  
  return `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col-12 d-flex justify-content-between align-items-center">
          <div>
            <h1 class="text-gradient mb-0">Catálogo de Produtos</h1>
            <p class="text-muted">Gerencie os produtos disponíveis para resgate</p>
          </div>
          <button class="btn btn-primary" onclick="abrirModalProduto()">
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
        <div class="col-12 text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Carregando produtos...</span>
          </div>
          <p class="mt-3 text-muted">Carregando produtos...</p>
        </div>
      </div>
    </div>
    
    ${getMainFooter()}
  `;
}

export async function editarProduto(id) {
  try {
    const produto = await produtosService.obter(id);
    
    // Preencher modal com dados do produto
    const nomeInput = document.getElementById('produtoNome');
    const descricaoInput = document.getElementById('produtoDescricao');
    const precoInput = document.getElementById('produtoPreco');
    const ativoCheckbox = document.getElementById('produtoAtivo');
    const modalTitle = document.getElementById('produtoModalLabel');
    
    if (nomeInput) nomeInput.value = produto.nome || '';
    if (descricaoInput) descricaoInput.value = produto.descricao || '';
    if (precoInput && produto.preco) {
      // Formatar preço para exibição
      const precoFormatado = parseFloat(produto.preco).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });
      precoInput.value = precoFormatado;
    }
    if (ativoCheckbox) ativoCheckbox.checked = produto.ativo !== false;
    if (modalTitle) modalTitle.textContent = 'Editar Produto';
    
    // Armazenar ID do produto sendo editado
    window.produtoEditandoId = id;
    
    // Abrir modal
    const modalElement = document.getElementById('produtoModal');
    if (modalElement) {
      const modal = new window.bootstrap.Modal(modalElement);
      modal.show();
    }
  } catch (error) {
    console.error('Erro ao carregar produto para edição:', error);
    showNotification('Erro ao carregar dados do produto', 'error');
  }
}

export async function excluirProduto(id) {
  if (!confirm('Tem certeza que deseja excluir este produto?')) {
    return;
  }
  
  try {
    await produtosService.remover(id);
    showNotification('Produto removido com sucesso!', 'success');
    // Recarregar produtos
    await carregarProdutos();
  } catch (error) {
    console.error('Erro ao excluir produto:', error);
    showNotification(`Erro ao excluir produto: ${error.message || 'Erro desconhecido'}`, 'error');
  }
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

// Exportar funções para escopo global
window.limparFiltros = limparFiltros;
window.carregarProdutos = carregarProdutos;

// Função para aplicar filtros automaticamente
export function aplicarFiltrosAuto() {
  try {
    const termo = document.getElementById('pesquisaProduto')?.value.toLowerCase() || '';
    const status = document.getElementById('filtroStatus')?.value || '';
    const pontos = document.getElementById('filtroPontos')?.value || '';
    
    // Filtrar produtos carregados
    let produtosFiltrados = [...produtosCarregados];
    
    // Filtro por termo de busca
    if (termo) {
      produtosFiltrados = produtosFiltrados.filter(produto => 
        (produto.nome && produto.nome.toLowerCase().includes(termo)) ||
        (produto.descricao && produto.descricao.toLowerCase().includes(termo))
      );
    }
    
    // Filtro por status
    if (status) {
      produtosFiltrados = produtosFiltrados.filter(produto => 
        (status === 'ativo' && produto.ativo === true) || 
        (status === 'inativo' && produto.ativo === false)
      );
    }
    
    // Filtro por faixa de pontos
    if (pontos) {
      produtosFiltrados = produtosFiltrados.filter(produto => {
        const pontosProduto = produto.pontos || 0;
        switch (pontos) {
          case '0-100':
            return pontosProduto >= 0 && pontosProduto <= 100;
          case '101-500':
            return pontosProduto >= 101 && pontosProduto <= 500;
          case '501-1000':
            return pontosProduto >= 501 && pontosProduto <= 1000;
          case '1000+':
            return pontosProduto > 1000;
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
  const container = document.getElementById('produtos-container');
  
  if (!container) {
    console.error('Container de produtos não encontrado');
    return;
  }
  
  if (produtos.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="bi bi-search text-muted" style="font-size: 3rem;"></i>
        <h5 class="mt-3 text-muted">Nenhum produto encontrado!</h5>
        <p class="text-muted">Tente ajustar os filtros de busca.</p>
      </div>
    `;
    return;
  }
  
  const html = produtos.map(produto => {
    const temImagem = produto.imagem && produto.imagem.trim() !== '';
    const imagemUrl = temImagem ? getImagemUrl(produto.imagem) : null;
    const descricao = produto.descricao || 'Sem descrição';
    const pontos = produto.pontos || 0;
    
    return `
      <div class="col-lg-3 col-md-4 col-sm-6 mb-3">
        <div class="card h-100 shadow-sm product-card">
          <div class="card-img-top-container" style="aspect-ratio: 1; overflow: hidden; background-color: #333; display: flex; align-items: center; justify-content: center; position: relative;">
            ${temImagem ? `
              <img 
                src="${imagemUrl}" 
                alt="${produto.nome}" 
                class="card-img-top" 
                style="object-fit: cover; width: 100%; height: 100%;"
                onerror="this.parentElement.innerHTML='<i class=\\'bi bi-image text-muted\\' style=\\'font-size: 3rem; opacity: 0.5;\\'></i>';"
              >
            ` : `
              <i class="bi bi-image text-muted" style="font-size: 3rem; opacity: 0.5;"></i>
            `}
          </div>
          <div class="card-body d-flex flex-column" style="padding: 1rem;">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <h6 class="card-title mb-0" style="font-size: 0.95rem; font-weight: 600;">${produto.nome}</h6>
              <span class="badge ${produto.ativo ? 'bg-success' : 'bg-secondary'}" style="font-size: 0.7rem;">
                ${produto.ativo ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <p class="card-text text-muted small flex-grow-1" style="min-height: 35px; font-size: 0.8rem; margin-bottom: 0.75rem;">${descricao}</p>
            <div class="d-flex justify-content-between align-items-center mt-auto">
              <span class="fw-bold text-white mb-0" style="font-size: 1rem; color: #ffffff !important;">
                <i class="bi bi-star-fill text-warning me-1" style="color: #fbbf24 !important;"></i>${pontos} pontos
              </span>
              <div>
                <button class="btn btn-sm btn-outline-primary me-1" onclick="editarProduto(${produto.id})" title="Editar" style="padding: 0.25rem 0.5rem;">
                  <i class="bi bi-pencil" style="font-size: 0.85rem;"></i>
                </button>
                <button class="btn btn-sm btn-outline-danger" onclick="excluirProduto(${produto.id})" title="Excluir" style="padding: 0.25rem 0.5rem;">
                  <i class="bi bi-trash" style="font-size: 0.85rem;"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  container.innerHTML = html;
}

// Função para limpar todos os filtros
export function limparFiltros() {
  const pesquisaInput = document.getElementById('pesquisaProduto');
  const statusSelect = document.getElementById('filtroStatus');
  const pontosSelect = document.getElementById('filtroPontos');
  
  if (pesquisaInput) pesquisaInput.value = '';
  if (statusSelect) statusSelect.value = '';
  if (pontosSelect) pontosSelect.value = '';
  
  produtosFiltrados = [...produtosCarregados];
  aplicarFiltrosAuto();
}

// Funções originais mantidas para compatibilidade
export function pesquisarProdutos() {
  aplicarFiltrosAuto();
}

export function aplicarFiltros() {
  aplicarFiltrosAuto();
}
