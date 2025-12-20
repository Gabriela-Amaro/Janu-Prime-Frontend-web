import { getMainFooter } from "../components/main-footer.js";
import { showNotification } from "../utils/notifications.js";
import { estabelecimentosService } from "../services/estabelecimentos.js";
import { fotosEspacoService } from "../services/fotos-espaco.js";
import { APP_CONFIG } from "../config/app.js";

/**
 * Constrói URL completa do logotipo
 */
function getLogotipoUrl(logotipoPath) {
  if (!logotipoPath) return '/assets/images/logo.svg';
  if (logotipoPath.startsWith('http://') || logotipoPath.startsWith('https://')) {
    return logotipoPath;
  }
  const baseUrl = APP_CONFIG.apiUrl.replace('/api', '');
  if (logotipoPath.startsWith('/media/')) {
    return `${baseUrl}${logotipoPath}`;
  }
  if (logotipoPath.startsWith('logotipos/')) {
    return `${baseUrl}/media/${logotipoPath}`;
  }
  const mediaPath = logotipoPath.startsWith('/') ? logotipoPath : `/${logotipoPath}`;
  return `${baseUrl}/media${mediaPath}`;
}

// Função para obter dados do usuário logado
function getUserData() {
  try {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Erro ao obter dados do usuário:", error);
    return null;
  }
}

// Variável para armazenar dados do estabelecimento
let dadosEstabelecimentoPerfil = null;

/**
 * Carrega dados do estabelecimento para o perfil
 */
async function carregarDadosEstabelecimentoPerfil() {
  try {
    dadosEstabelecimentoPerfil = await estabelecimentosService.obterMeuEstabelecimento();
    preencherFormularioPerfil();
  } catch (error) {
    console.error("Erro ao carregar dados do estabelecimento:", error);
    showNotification("Erro ao carregar dados do estabelecimento", "error");
  }
}

/**
 * Preenche o formulário com os dados do estabelecimento
 */
function preencherFormularioPerfil() {
  if (!dadosEstabelecimentoPerfil) return;

  // Preencher campos do formulário
  const nomeInput = document.getElementById("empresaNome");
  if (nomeInput) nomeInput.value = dadosEstabelecimentoPerfil.nome || "";

  const cnpjInput = document.getElementById("empresaCnpj");
  if (cnpjInput) cnpjInput.value = dadosEstabelecimentoPerfil.cnpj || "";

  const enderecoInput = document.getElementById("empresaEndereco");
  if (enderecoInput) enderecoInput.value = dadosEstabelecimentoPerfil.endereco || "";

  const telefoneInput = document.getElementById("empresaTelefone");
  if (telefoneInput && dadosEstabelecimentoPerfil.telefone) {
    telefoneInput.value = dadosEstabelecimentoPerfil.telefone;
  }

  const descricaoInput = document.getElementById("empresaDescricao");
  if (descricaoInput) descricaoInput.value = dadosEstabelecimentoPerfil.descricao || "";

  const horarioInput = document.getElementById("empresaHorario");
  if (horarioInput && dadosEstabelecimentoPerfil.horario_funcionamento) {
    // Converter JSON de horário para string legível
    const horario = dadosEstabelecimentoPerfil.horario_funcionamento;
    if (typeof horario === "object") {
      const horarioStr = Object.entries(horario)
        .map(([dia, horas]) => `${dia}: ${horas}`)
        .join(", ");
      horarioInput.value = horarioStr;
    } else {
      horarioInput.value = horario;
    }
  }

  // Atualizar preview
  atualizarPreviewPerfil();
}

/**
 * Atualiza o preview do perfil
 */
function atualizarPreviewPerfil() {
  if (!dadosEstabelecimentoPerfil) return;

  const previewNome = document.getElementById("previewNome");
  if (previewNome) {
    previewNome.textContent = dadosEstabelecimentoPerfil.nome || "Nome do Estabelecimento";
  }

  const previewDescricao = document.getElementById("previewDescricao");
  if (previewDescricao) {
    previewDescricao.textContent = dadosEstabelecimentoPerfil.descricao || "Descrição não cadastrada";
  }

  const previewEndereco = document.getElementById("previewEndereco");
  if (previewEndereco) {
    previewEndereco.textContent = dadosEstabelecimentoPerfil.endereco || "Endereço não cadastrado";
  }

  const previewHorario = document.getElementById("previewHorario");
  if (previewHorario && dadosEstabelecimentoPerfil.horario_funcionamento) {
    const horario = dadosEstabelecimentoPerfil.horario_funcionamento;
    if (typeof horario === "object") {
      const horarioStr = Object.entries(horario)
        .map(([dia, horas]) => `${dia}: ${horas}`)
        .join(", ");
      previewHorario.textContent = horarioStr;
    } else {
      previewHorario.textContent = horario;
    }
  }

  // Atualizar logotipo no preview
  const previewLogoContainer = document.getElementById("previewLogoContainer");
  if (previewLogoContainer) {
    if (dadosEstabelecimentoPerfil.logotipo) {
      previewLogoContainer.innerHTML = `
        <img src="${getLogotipoUrl(dadosEstabelecimentoPerfil.logotipo)}" alt="Logo" class="rounded-circle" width="100" height="100" style="object-fit: cover;">
      `;
    } else {
      previewLogoContainer.innerHTML = `
        <div class="rounded-circle bg-secondary d-flex align-items-center justify-content-center mx-auto" style="width: 100px; height: 100px;">
          <i class="bi bi-building text-white" style="font-size: 2.5rem;"></i>
        </div>
      `;
    }
  }
}

export function getPerfilContent() {
  const userData = getUserData();
  const nomeEstabelecimento = userData?.estabelecimento?.nome || "Nome do Estabelecimento";
  const emailUsuario = userData?.email || "email@exemplo.com";
  const nomeUsuario = userData?.nome || "Usuário";
  
  // Carregar dados do estabelecimento e fotos após renderizar
  setTimeout(() => {
    carregarDadosEstabelecimentoPerfil();
    carregarFotos();
  }, 100);
  
  return `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col-12">
          <h1 class="text-gradient mb-0">Perfil da Empresa</h1>
          <p class="text-muted">Gerencie as informações do seu estabelecimento</p>
        </div>
      </div>
      
      <div class="row">
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header">
              <h6 class="m-0 font-weight-bold text-primary">Informações Básicas</h6>
            </div>
            <div class="card-body">
              <form id="perfilForm">
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="empresaNome" class="form-label">Nome da Empresa</label>
                      <input type="text" class="form-control" id="empresaNome" value="${nomeEstabelecimento}">
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="empresaCnpj" class="form-label">CNPJ</label>
                      <input type="text" class="form-control" id="empresaCnpj" placeholder="00.000.000/0000-00" readonly>
                      <small class="text-muted">CNPJ não pode ser alterado</small>
                    </div>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label for="empresaEndereco" class="form-label">Endereço</label>
                  <input type="text" class="form-control" id="empresaEndereco" placeholder="Rua, número - Bairro, Cidade-UF">
                </div>
                
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="empresaTelefone" class="form-label">Telefone</label>
                      <input type="text" class="form-control" id="empresaTelefone" placeholder="(00) 00000-0000">
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="empresaEmail" class="form-label">E-mail</label>
                      <input type="email" class="form-control" id="empresaEmail" value="${emailUsuario}">
                    </div>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label for="empresaDescricao" class="form-label">Descrição</label>
                  <textarea class="form-control" id="empresaDescricao" rows="4" placeholder="Descreva seu estabelecimento..."></textarea>
                </div>
                
                <div class="mb-3">
                  <label for="empresaHorario" class="form-label">Horário de Funcionamento</label>
                  <input type="text" class="form-control" id="empresaHorario" placeholder="Seg-Sex: 08h-18h">
                </div>
                
                <div class="mb-3">
                  <label for="empresaLogo" class="form-label">Logo da Empresa</label>
                  <input type="file" class="form-control" id="empresaLogo" accept="image/*">
                </div>
                
                <button type="button" class="btn btn-primary" onclick="salvarPerfil()">
                  <i class="bi bi-check-lg me-2"></i>Salvar Alterações
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <div class="col-lg-4">
          <div class="card mb-4">
            <div class="card-header">
              <h6 class="m-0 font-weight-bold text-primary">Preview do Perfil</h6>
            </div>
            <div class="card-body text-center">
              <div class="mb-3" id="previewLogoContainer">
                <div class="rounded-circle bg-secondary d-flex align-items-center justify-content-center mx-auto" style="width: 100px; height: 100px;">
                  <i class="bi bi-building text-white" style="font-size: 2.5rem;"></i>
                </div>
              </div>
              <h5 id="previewNome">${nomeEstabelecimento}</h5>
              <p class="text-muted small" id="previewDescricao">Descrição não cadastrada</p>
              <hr class="my-2">
              <p class="text-muted small mb-1" id="previewEndereco"><i class="bi bi-geo-alt me-1"></i>Endereço não cadastrado</p>
              <p class="text-muted small" id="previewHorario"><i class="bi bi-clock me-1"></i>Horário não cadastrado</p>
            </div>
          </div>
          
          <!-- Galeria de Fotos do Estabelecimento -->
          <div class="card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h6 class="m-0 font-weight-bold text-primary">
                <i class="bi bi-images me-2"></i>Fotos do Estabelecimento
              </h6>
              <button class="btn btn-sm btn-outline-primary" onclick="adicionarFoto()">
                <i class="bi bi-plus-lg"></i>
              </button>
            </div>
            <div class="card-body">
              <div class="row" id="galeria-fotos">
                <div class="col-12 text-center py-4">
                  <i class="bi bi-images text-muted" style="font-size: 3rem;"></i>
                  <p class="text-muted mt-2">Nenhuma foto cadastrada</p>
                </div>
              </div>
              
              <div class="text-center mt-3">
                <button class="btn btn-outline-primary btn-sm" onclick="adicionarFoto()">
                  <i class="bi bi-camera me-1"></i>Adicionar Fotos
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    ${getMainFooter()}
  `;
}

export async function salvarPerfil() {
  try {
    if (!dadosEstabelecimentoPerfil || !dadosEstabelecimentoPerfil.id) {
      showNotification("Erro: Estabelecimento não encontrado", "error");
      return;
    }

    // Coletar dados do formulário
    const nome = document.getElementById("empresaNome")?.value || "";
    const endereco = document.getElementById("empresaEndereco")?.value || "";
    const telefone = document.getElementById("empresaTelefone")?.value || "";
    const descricao = document.getElementById("empresaDescricao")?.value || "";
    const horarioStr = document.getElementById("empresaHorario")?.value || "";
    const logotipoInput = document.getElementById("empresaLogo");

    // Converter horário de string para JSON se necessário
    let horarioFuncionamento = dadosEstabelecimentoPerfil.horario_funcionamento || {};
    if (horarioStr) {
      // Tentar parsear se for JSON válido, senão manter como string
      try {
        horarioFuncionamento = JSON.parse(horarioStr);
      } catch {
        // Se não for JSON, manter como está ou processar de outra forma
        horarioFuncionamento = horarioStr;
      }
    }

    // Preparar dados para atualização
    const dadosAtualizacao = {
      nome: nome.trim(),
      endereco: endereco.trim(),
      telefone: telefone.trim() || null,
      descricao: descricao.trim(),
      horario_funcionamento: horarioFuncionamento,
    };

    // Remover campos vazios
    Object.keys(dadosAtualizacao).forEach((key) => {
      if (dadosAtualizacao[key] === "" || dadosAtualizacao[key] === null) {
        delete dadosAtualizacao[key];
      }
    });

    // Verificar se há logotipo selecionado
    const logotipo = logotipoInput?.files?.[0] || null;

    // Atualizar dados textuais primeiro
    let estabelecimentoAtualizado = await estabelecimentosService.atualizar(
      dadosEstabelecimentoPerfil.id,
      dadosAtualizacao
    );

    // Se há logotipo, atualizar em uma requisição separada
    if (logotipo) {
      estabelecimentoAtualizado = await estabelecimentosService.atualizarComLogotipo(
        dadosEstabelecimentoPerfil.id,
        logotipo
      );
    }

    // Atualizar dados locais
    dadosEstabelecimentoPerfil = estabelecimentoAtualizado;
    
    // Limpar input de arquivo
    if (logotipoInput) {
      logotipoInput.value = "";
    }
    
    // Atualizar preview
    atualizarPreviewPerfil();

    showNotification("Perfil salvo com sucesso!", "success");
  } catch (error) {
    console.error("Erro ao salvar perfil:", error);
    showNotification(
      `Erro ao salvar perfil: ${error.message || "Erro desconhecido"}`,
      "error"
    );
  }
}

/**
 * Constrói URL completa da foto
 */
function getFotoUrl(fotoPath) {
  if (!fotoPath) return null;
  if (fotoPath.startsWith('http://') || fotoPath.startsWith('https://')) {
    return fotoPath;
  }
  const baseUrl = APP_CONFIG.apiUrl.replace('/api', '');
  if (fotoPath.startsWith('/media/')) {
    return `${baseUrl}${fotoPath}`;
  }
  if (fotoPath.startsWith('Fotos_Espaco/')) {
    return `${baseUrl}/media/${fotoPath}`;
  }
  const mediaPath = fotoPath.startsWith('/') ? fotoPath : `/${fotoPath}`;
  return `${baseUrl}/media${mediaPath}`;
}

/**
 * Carrega e exibe as fotos do estabelecimento
 */
async function carregarFotos() {
  try {
    const fotos = await fotosEspacoService.listar();
    const galeriaContainer = document.getElementById("galeria-fotos");
    
    if (!galeriaContainer) return;
    
    const fotosArray = Array.isArray(fotos) ? fotos : fotos.results || [];
    
    if (fotosArray.length === 0) {
      galeriaContainer.innerHTML = `
        <div class="col-12 text-center py-4">
          <i class="bi bi-images text-muted" style="font-size: 3rem;"></i>
          <p class="text-muted mt-2">Nenhuma foto cadastrada</p>
        </div>
      `;
      return;
    }
    
    galeriaContainer.innerHTML = fotosArray.map(foto => `
      <div class="col-4 col-md-3 mb-2">
        <div class="position-relative">
          <img src="${getFotoUrl(foto.foto)}" alt="Foto do estabelecimento" class="img-fluid rounded" style="aspect-ratio: 1; object-fit: cover; width: 100%;">
          <button class="btn btn-danger btn-sm position-absolute top-0 end-0 m-1" onclick="removerFoto(${foto.id})" style="padding: 0.15rem 0.4rem;">
            <i class="bi bi-x" style="font-size: 0.8rem;"></i>
          </button>
        </div>
      </div>
    `).join('');
  } catch (error) {
    console.error("Erro ao carregar fotos:", error);
  }
}

/**
 * Abre o modal para adicionar foto
 */
export function adicionarFoto() {
  // Verificar se o modal já existe
  let modalElement = document.getElementById("fotoModal");
  
  if (!modalElement) {
    // Criar o modal
    const modalHTML = `
      <div class="modal fade" id="fotoModal" tabindex="-1" aria-labelledby="fotoModalLabel" aria-hidden="true">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header bg-primary text-white">
              <h5 class="modal-title" id="fotoModalLabel">
                <i class="bi bi-camera me-2"></i>Adicionar Foto
              </h5>
              <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
              <div class="mb-3">
                <label for="novaFoto" class="form-label">Selecione a foto</label>
                <input type="file" class="form-control" id="novaFoto" accept="image/*">
              </div>
              <div id="previewNovaFoto" class="text-center mb-3" style="display: none;">
                <img src="" alt="Preview" class="img-fluid rounded" style="max-height: 200px;">
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" class="btn btn-primary" onclick="salvarFoto()">
                <i class="bi bi-upload me-1"></i>Enviar Foto
              </button>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.insertAdjacentHTML("beforeend", modalHTML);
    modalElement = document.getElementById("fotoModal");
    
    // Adicionar listener para preview
    const inputFoto = document.getElementById("novaFoto");
    inputFoto?.addEventListener("change", function(e) {
      const file = e.target.files[0];
      const previewDiv = document.getElementById("previewNovaFoto");
      const previewImg = previewDiv?.querySelector("img");
      
      if (file && previewDiv && previewImg) {
        const reader = new FileReader();
        reader.onload = function(event) {
          previewImg.src = event.target.result;
          previewDiv.style.display = "block";
        };
        reader.readAsDataURL(file);
      } else if (previewDiv) {
        previewDiv.style.display = "none";
      }
    });
  }
  
  // Limpar input e preview
  const inputFoto = document.getElementById("novaFoto");
  const previewDiv = document.getElementById("previewNovaFoto");
  if (inputFoto) inputFoto.value = "";
  if (previewDiv) previewDiv.style.display = "none";
  
  // Abrir modal
  const modal = new window.bootstrap.Modal(modalElement);
  modal.show();
}

/**
 * Salva a foto selecionada
 */
export async function salvarFoto() {
  try {
    const inputFoto = document.getElementById("novaFoto");
    const foto = inputFoto?.files?.[0];
    
    if (!foto) {
      showNotification("Selecione uma foto", "error");
      return;
    }
    
    await fotosEspacoService.criar(foto);
    
    // Fechar modal
    const modalElement = document.getElementById("fotoModal");
    if (modalElement) {
      const modal = window.bootstrap.Modal.getInstance(modalElement);
      modal?.hide();
    }
    
    // Recarregar fotos
    await carregarFotos();
    
    showNotification("Foto adicionada com sucesso!", "success");
  } catch (error) {
    console.error("Erro ao salvar foto:", error);
    showNotification(`Erro ao salvar foto: ${error.message || "Erro desconhecido"}`, "error");
  }
}

/**
 * Remove uma foto
 */
export async function removerFoto(id) {
  if (!confirm("Tem certeza que deseja remover esta foto?")) {
    return;
  }
  
  try {
    await fotosEspacoService.remover(id);
    await carregarFotos();
    showNotification("Foto removida com sucesso!", "success");
  } catch (error) {
    console.error("Erro ao remover foto:", error);
    showNotification(`Erro ao remover foto: ${error.message || "Erro desconhecido"}`, "error");
  }
}

// Exportar para escopo global
window.salvarPerfil = salvarPerfil;
window.adicionarFoto = adicionarFoto;
window.salvarFoto = salvarFoto;
window.removerFoto = removerFoto;

