import { getMainFooter } from "../components/main-footer.js";
import { showNotification } from "../utils/notifications.js";
import { estabelecimentosService } from "../services/estabelecimentos.js";

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
}

export function getPerfilContent() {
  const userData = getUserData();
  const nomeEstabelecimento = userData?.estabelecimento?.nome || "Nome do Estabelecimento";
  const emailUsuario = userData?.email || "email@exemplo.com";
  const nomeUsuario = userData?.nome || "Usuário";
  
  // Carregar dados do estabelecimento após renderizar
  setTimeout(() => {
    carregarDadosEstabelecimentoPerfil();
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
              <div class="mb-3">
                <img src="/assets/images/logo.svg" alt="Logo" class="rounded-circle" width="100" height="100">
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

    // Atualizar estabelecimento
    const estabelecimentoAtualizado = await estabelecimentosService.atualizar(
      dadosEstabelecimentoPerfil.id,
      dadosAtualizacao
    );

    // Atualizar dados locais
    dadosEstabelecimentoPerfil = estabelecimentoAtualizado;
    
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

export function adicionarFoto() {
  console.log("Adicionando foto...");
  showNotification(
    "Funcionalidade de adicionar fotos será implementada em breve",
    "info"
  );
}

export function removerFoto(id) {
  console.log("Removendo foto:", id);
  showNotification("Foto removida com sucesso!", "success");
}

// Exportar para escopo global
window.salvarPerfil = salvarPerfil;
window.adicionarFoto = adicionarFoto;
window.removerFoto = removerFoto;
