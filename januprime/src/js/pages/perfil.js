import { APP_CONFIG } from "../config/app.js";
import { getMainFooter } from "../components/main-footer.js";

export function getPerfilContent() {
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
                      <input type="text" class="form-control" id="empresaNome" value="${APP_CONFIG.empresa.nome}">
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="empresaCnpj" class="form-label">CNPJ</label>
                      <input type="text" class="form-control" id="empresaCnpj" value="${APP_CONFIG.empresa.cnpj}">
                    </div>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label for="empresaEndereco" class="form-label">Endereço</label>
                  <input type="text" class="form-control" id="empresaEndereco" value="${APP_CONFIG.empresa.endereco}">
                </div>
                
                <div class="row">
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="empresaTelefone" class="form-label">Telefone</label>
                      <input type="text" class="form-control" id="empresaTelefone" value="${APP_CONFIG.empresa.telefone}">
                    </div>
                  </div>
                  <div class="col-md-6">
                    <div class="mb-3">
                      <label for="empresaEmail" class="form-label">E-mail</label>
                      <input type="email" class="form-control" id="empresaEmail" value="${APP_CONFIG.empresa.email}">
                    </div>
                  </div>
                </div>
                
                <div class="mb-3">
                  <label for="empresaDescricao" class="form-label">Descrição</label>
                  <textarea class="form-control" id="empresaDescricao" rows="4" placeholder="Descreva seu estabelecimento...">A melhor pizza da cidade! Ambiente familiar e acolhedor.</textarea>
                </div>
                
                <div class="mb-3">
                  <label for="empresaHorario" class="form-label">Horário de Funcionamento</label>
                  <input type="text" class="form-control" id="empresaHorario" value="Ter-Dom: 18h-23h">
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
              <h5 id="previewNome">${APP_CONFIG.empresa.nome}</h5>
              <p class="text-muted" id="previewEndereco">${APP_CONFIG.empresa.endereco}</p>
              <p class="text-muted" id="previewHorario">Ter-Dom: 18h-23h</p>
              <p class="small" id="previewDescricao">A melhor pizza da cidade! Ambiente familiar e acolhedor.</p>
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
                <!-- Fotos existentes -->
                <div class="col-6 mb-3">
                  <div class="position-relative">
                    <img src="/assets/images/logo.svg" alt="Foto do estabelecimento" class="img-fluid rounded" style="width: 100%; height: 120px; object-fit: cover;">
                    <button class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1" onclick="removerFoto(1)" title="Remover foto">
                      <i class="bi bi-x"></i>
                    </button>
                  </div>
                </div>
                <div class="col-6 mb-3">
                  <div class="position-relative">
                    <img src="/assets/images/logo.svg" alt="Foto do estabelecimento" class="img-fluid rounded" style="width: 100%; height: 120px; object-fit: cover;">
                    <button class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1" onclick="removerFoto(2)" title="Remover foto">
                      <i class="bi bi-x"></i>
                    </button>
                  </div>
                </div>
                <div class="col-6 mb-3">
                  <div class="position-relative">
                    <img src="/assets/images/logo.svg" alt="Foto do estabelecimento" class="img-fluid rounded" style="width: 100%; height: 120px; object-fit: cover;">
                    <button class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1" onclick="removerFoto(3)" title="Remover foto">
                      <i class="bi bi-x"></i>
                    </button>
                  </div>
                </div>
                <div class="col-6 mb-3">
                  <div class="position-relative">
                    <img src="/assets/images/logo.svg" alt="Foto do estabelecimento" class="img-fluid rounded" style="width: 100%; height: 120px; object-fit: cover;">
                    <button class="btn btn-sm btn-danger position-absolute top-0 end-0 m-1" onclick="removerFoto(4)" title="Remover foto">
                      <i class="bi bi-x"></i>
                    </button>
                  </div>
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
