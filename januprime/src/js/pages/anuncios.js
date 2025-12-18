import { mockData } from '../config/mockData.js';
import { debounce } from '../utils/debounce.js';
import { showNotification } from '../utils/notifications.js';
import { getMainFooter } from '../components/main-footer.js';
import { anunciosService } from '../services/anuncios.js';
import { APP_CONFIG } from '../config/app.js';

// Estado global da página
let anunciosCarregados = [];
let anunciosFiltrados = [];

/**
 * Constrói URL completa da imagem do anúncio
 */
function getImagemUrl(imagemPath) {
  if (!imagemPath) {
    return null; // Sem imagem
  }
  
  // Se já for uma URL completa, retornar como está
  if (imagemPath.startsWith('http://') || imagemPath.startsWith('https://')) {
    return imagemPath;
  }
  
  // Construir URL completa usando a base da API
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
 * Carrega anúncios da API
 */
async function carregarAnuncios() {
  try {
    const response = await anunciosService.listar();
    anunciosCarregados = Array.isArray(response) ? response : response.results || [];
    anunciosFiltrados = [...anunciosCarregados];
    atualizarExibicaoAnuncios(anunciosFiltrados);
  } catch (error) {
    console.error('Erro ao carregar anúncios:', error);
    showNotification('Erro ao carregar anúncios', 'error');
    // Mostrar mensagem de erro no container
    const container = document.getElementById('anuncios-container');
    if (container) {
      container.innerHTML = `
        <div class="col-12 text-center py-5">
          <i class="bi bi-exclamation-triangle text-warning" style="font-size: 3rem;"></i>
          <h5 class="mt-3 text-muted">Erro ao carregar anúncios</h5>
          <p class="text-muted">Tente recarregar a página.</p>
        </div>
      `;
    }
  }
}

export function getAnunciosContent() {
  // Carregar anúncios após renderizar
  setTimeout(() => {
    carregarAnuncios();
  }, 100);
  return `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col-12 d-flex justify-content-between align-items-center">
          <div>
            <h1 class="text-gradient mb-0">Anúncios</h1>
            <p class="text-muted">Gerencie os anúncios promocionais</p>
          </div>
          <button class="btn btn-primary" onclick="abrirModalAnuncio()">
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
                <div class="col-md-3">
                  <label for="filtroStatusAnuncio" class="form-label">Status</label>
                  <div class="dropdown">
                    <select class="form-select" id="filtroStatusAnuncio" onchange="testPesquisarAnuncios()">
                      <option value="">Todos</option>
                      <option value="ativo">Ativo</option>
                      <option value="expirado">Expirado</option>
                    </select>
                    <i class="bi bi-chevron-down dropdown-icon"></i>
                  </div>
                </div>
                <div class="col-md-9 d-flex align-items-end">
                  <button class="btn btn-outline-secondary" onclick="limparFiltrosAnuncios()">
                    <i class="bi bi-arrow-clockwise me-1"></i>Limpar Filtros
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div class="row" id="anuncios-container">
        <div class="col-12 text-center py-5">
          <div class="spinner-border text-primary" role="status">
            <span class="visually-hidden">Carregando anúncios...</span>
          </div>
          <p class="mt-3 text-muted">Carregando anúncios...</p>
        </div>
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
  aplicarFiltrosAnunciosAuto();
};

// Exportar função para escopo global
window.limparFiltrosAnuncios = limparFiltrosAnuncios;


// Função para aplicar filtros automaticamente
export function aplicarFiltrosAnunciosAuto() {
  try {
    const status = document.getElementById('filtroStatusAnuncio')?.value || '';
    
    // Filtrar anúncios carregados
    let anunciosFiltrados = [...anunciosCarregados];
  
    // Filtro por status
    if (status) {
      const hoje = new Date();
      anunciosFiltrados = anunciosFiltrados.filter(anuncio => {
        const dataExpiracao = new Date(anuncio.data_expiracao);
        
        if (status === 'ativo') {
          // Anúncio ativo: ainda não expirou
          return dataExpiracao >= hoje;
        } else if (status === 'expirado') {
          // Anúncio expirado: data expiração já passou
          return dataExpiracao < hoje;
        }
        return true;
      });
    }
  
    // Atualizar a exibição dos anúncios
    atualizarExibicaoAnuncios(anunciosFiltrados);
  } catch (error) {
    console.error('Erro ao aplicar filtros de anúncios:', error);
  }
}

// Função para atualizar a exibição dos anúncios
function atualizarExibicaoAnuncios(anuncios) {
  const container = document.getElementById('anuncios-container');
  
  if (!container) {
    console.error('Container de anúncios não encontrado');
    return;
  }
  
  if (anuncios.length === 0) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <i class="bi bi-search text-muted" style="font-size: 3rem;"></i>
        <h5 class="mt-3 text-muted">Nenhum anúncio encontrado!</h5>
        <p class="text-muted">Tente ajustar os filtros de busca.</p>
      </div>
    `;
    return;
  }
  
  const html = anuncios.map(anuncio => {
    const imagemUrl = getImagemUrl(anuncio.imagem);
    const dataExpiracao = new Date(anuncio.data_expiracao);
    const hoje = new Date();
    const isExpirado = dataExpiracao < hoje;
    const dataCriacao = new Date(anuncio.created_at);
    
    return `
      <div class="col-lg-3 col-md-4 col-sm-6 mb-3">
        <div class="card h-100 shadow-sm">
          ${imagemUrl ? `
            <div style="aspect-ratio: 1; overflow: hidden; background-color: #333; display: flex; align-items: center; justify-content: center;">
              <img 
                src="${imagemUrl}" 
                alt="Anúncio ${anuncio.id}" 
                class="card-img-top" 
                style="object-fit: cover; width: 100%; height: 100%;"
                onerror="this.parentElement.innerHTML='<i class=\\'bi bi-image text-muted\\' style=\\'font-size: 3rem; opacity: 0.5;\\'></i>';"
              >
            </div>
          ` : `
            <div style="aspect-ratio: 1; overflow: hidden; background-color: #333; display: flex; align-items: center; justify-content: center;">
              <i class="bi bi-image text-muted" style="font-size: 3rem; opacity: 0.5;"></i>
            </div>
          `}
          <div class="card-body d-flex flex-column" style="padding: 1rem;">
            <div class="d-flex justify-content-end align-items-start mb-2">
              <span class="badge ${isExpirado ? 'bg-secondary' : 'bg-success'}" style="font-size: 0.7rem;">
                ${isExpirado ? 'Expirado' : 'Ativo'}
              </span>
            </div>
            <div class="text-muted small mb-2">
              <div class="mb-1">
                <strong><i class="bi bi-calendar-event me-1"></i>Expira em:</strong><br>
                ${dataExpiracao.toLocaleDateString('pt-BR')} ${dataExpiracao.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
              </div>
              <div>
                <strong><i class="bi bi-clock me-1"></i>Criado em:</strong><br>
                ${dataCriacao.toLocaleDateString('pt-BR')}
              </div>
            </div>
            <div class="d-flex gap-2 mt-auto">
              <button class="btn btn-sm btn-outline-primary" onclick="editarAnuncio(${anuncio.id})" style="padding: 0.25rem 0.5rem;">
                <i class="bi bi-pencil me-1"></i>Editar
              </button>
              <button class="btn btn-sm btn-outline-danger" onclick="excluirAnuncio(${anuncio.id})" style="padding: 0.25rem 0.5rem;">
                <i class="bi bi-trash me-1"></i>Excluir
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
  
  container.innerHTML = html;
  anunciosFiltrados = anuncios;
}

// Função para limpar todos os filtros
export function limparFiltrosAnuncios() {
  const statusSelect = document.getElementById('filtroStatusAnuncio');
  
  if (statusSelect) statusSelect.value = '';
  
  anunciosFiltrados = [...anunciosCarregados];
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
export async function editarAnuncio(id) {
  try {
    const anuncio = await anunciosService.obter(id);
    
    // Preencher modal com dados do anúncio
    const dataExpiracaoInput = document.getElementById('anuncioDataExpiracao');
    const modalTitle = document.getElementById('anuncioModalLabel');
    
    if (dataExpiracaoInput && anuncio.data_expiracao) {
      const dataExpiracao = new Date(anuncio.data_expiracao);
      // Formatar data para input type="date" (YYYY-MM-DD)
      dataExpiracaoInput.value = dataExpiracao.toISOString().split('T')[0];
    }
    if (modalTitle) modalTitle.textContent = 'Editar Anúncio';
    
    // Armazenar ID do anúncio sendo editado
    window.anuncioEditandoId = id;
    
    // Abrir modal
    const modalElement = document.getElementById('anuncioModal');
    if (modalElement) {
      const modal = new window.bootstrap.Modal(modalElement);
      modal.show();
    }
  } catch (error) {
    console.error('Erro ao carregar anúncio para edição:', error);
    showNotification('Erro ao carregar dados do anúncio', 'error');
  }
}

export async function excluirAnuncio(id) {
  if (!confirm('Tem certeza que deseja excluir este anúncio?')) {
    return;
  }
  
  try {
    await anunciosService.remover(id);
    showNotification('Anúncio removido com sucesso!', 'success');
    // Recarregar anúncios
    await carregarAnuncios();
  } catch (error) {
    console.error('Erro ao excluir anúncio:', error);
    showNotification(`Erro ao excluir anúncio: ${error.message || 'Erro desconhecido'}`, 'error');
  }
}

// Função para abrir modal de anúncio (criar novo)
export function abrirModalAnuncio() {
  // Limpar campos
  const dataExpiracaoInput = document.getElementById("anuncioDataExpiracao");
  const imagemInput = document.getElementById("anuncioImagem");
  const modalTitle = document.getElementById("anuncioModalLabel");
  
  if (dataExpiracaoInput) dataExpiracaoInput.value = '';
  if (imagemInput) imagemInput.value = '';
  if (modalTitle) modalTitle.textContent = 'Criar Anúncio';
  
  // Limpar ID de edição
  window.anuncioEditandoId = null;
  
  // Abrir modal
  const modalElement = document.getElementById('anuncioModal');
  if (modalElement) {
    const modal = new window.bootstrap.Modal(modalElement);
    modal.show();
  }
}

// Exportar funções para escopo global
window.editarAnuncio = editarAnuncio;
window.excluirAnuncio = excluirAnuncio;
window.carregarAnuncios = carregarAnuncios;
window.abrirModalAnuncio = abrirModalAnuncio;
