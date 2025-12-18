import { getMainFooter } from "../components/main-footer.js";
import { showNotification } from "../utils/notifications.js";

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

export function getPerfilContent() {
  const userData = getUserData();
  const nomeEstabelecimento = userData?.estabelecimento?.nome || "Nome do Estabelecimento";
  const emailUsuario = userData?.email || "email@exemplo.com";
  const nomeUsuario = userData?.nome || "Usuário";
  
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
                      <input type="text" class="form-control" id="empresaCnpj" placeholder="00.000.000/0000-00">
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
              <p class="text-muted small">${nomeUsuario} - ${userData?.tipo_usuario || "Administrador"}</p>
              <p class="text-muted" id="previewEndereco">Endereço não cadastrado</p>
              <p class="text-muted" id="previewHorario">Horário não cadastrado</p>
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

export function salvarPerfil() {
  console.log("Salvando perfil...");
  showNotification("Perfil salvo com sucesso!", "success");
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
