/**
 * Página de Gerenciamento do Perfil do Usuário Logado
 * Permite visualizar informações e alterar senha
 */
import { getMainFooter } from "../components/main-footer.js";
import { showNotification } from "../utils/notifications.js";
import { apiService } from "../config/api.js";
import { APP_CONFIG } from "../config/app.js";

// Dados do usuário logado
let dadosUsuario = null;

/**
 * Obtém dados do usuário logado do localStorage
 */
function getUserData() {
  try {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  } catch (error) {
    console.error("Erro ao obter dados do usuário:", error);
    return null;
  }
}

/**
 * Carrega dados atualizados do usuário da API
 */
async function carregarDadosUsuario() {
  try {
    dadosUsuario = await apiService.get(APP_CONFIG.authEndpoints.me);
    preencherFormulario();
  } catch (error) {
    console.error("Erro ao carregar dados do usuário:", error);
    showNotification("Erro ao carregar dados do perfil", "error");
  }
}

/**
 * Preenche o formulário com os dados do usuário
 */
function preencherFormulario() {
  if (!dadosUsuario) return;

  const nomeInput = document.getElementById("meuPerfilNome");
  if (nomeInput) nomeInput.value = dadosUsuario.nome || "";

  const emailInput = document.getElementById("meuPerfilEmail");
  if (emailInput) emailInput.value = dadosUsuario.email || "";

  const cpfInput = document.getElementById("meuPerfilCpf");
  if (cpfInput) cpfInput.value = formatarCPF(dadosUsuario.cpf) || "";

  const estabelecimentoInput = document.getElementById("meuPerfilEstabelecimento");
  if (estabelecimentoInput) {
    estabelecimentoInput.value = dadosUsuario.estabelecimento?.nome || "";
  }

  const tipoUsuarioInput = document.getElementById("meuPerfilTipoUsuario");
  if (tipoUsuarioInput) {
    tipoUsuarioInput.value = dadosUsuario.super_user ? "Gerente" : "Funcionário";
  }
}

/**
 * Formata CPF para exibição
 */
function formatarCPF(cpf) {
  if (!cpf) return "";
  const numeros = cpf.replace(/\D/g, "");
  if (numeros.length !== 11) return cpf;
  return numeros.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
}

/**
 * Salva alterações do perfil (apenas nome por enquanto)
 */
export async function salvarMeuPerfil() {
  try {
    if (!dadosUsuario) {
      showNotification("Dados do usuário não carregados", "error");
      return;
    }

    const nome = document.getElementById("meuPerfilNome")?.value?.trim();

    if (!nome) {
      showNotification("O nome é obrigatório", "error");
      return;
    }

    // Atualizar via endpoint de administradores
    await apiService.patch(`/administradores/${dadosUsuario.id}/`, { nome });

    // Atualizar dados locais
    dadosUsuario.nome = nome;

    // Atualizar localStorage
    const userData = getUserData();
    if (userData) {
      userData.nome = nome;
      localStorage.setItem("userData", JSON.stringify(userData));
    }

    showNotification("Perfil atualizado com sucesso!", "success");

    // Atualizar nome na navbar
    const navbarUserName = document.getElementById("navbar-user-name");
    if (navbarUserName) {
      navbarUserName.textContent = nome.split(" ")[0];
    }
  } catch (error) {
    console.error("Erro ao salvar perfil:", error);
    showNotification(`Erro ao salvar perfil: ${error.message || "Erro desconhecido"}`, "error");
  }
}

/**
 * Altera a senha do usuário
 */
export async function alterarSenha() {
  try {
    const senhaAtual = document.getElementById("senhaAtual")?.value;
    const novaSenha = document.getElementById("novaSenha")?.value;
    const confirmarSenha = document.getElementById("confirmarSenha")?.value;

    // Validações
    if (!senhaAtual || !novaSenha || !confirmarSenha) {
      showNotification("Preencha todos os campos de senha", "error");
      return;
    }

    if (novaSenha !== confirmarSenha) {
      showNotification("As senhas não coincidem", "error");
      return;
    }

    if (novaSenha.length < 8) {
      showNotification("A nova senha deve ter pelo menos 8 caracteres", "error");
      return;
    }

    // Chamar endpoint de alteração de senha
    await apiService.put("/usuarios/change-password/", {
      old_password: senhaAtual,
      new_password: novaSenha,
      new_password2: confirmarSenha,
    });

    // Limpar campos
    document.getElementById("senhaAtual").value = "";
    document.getElementById("novaSenha").value = "";
    document.getElementById("confirmarSenha").value = "";

    showNotification("Senha alterada com sucesso!", "success");
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    
    // Tratar erros específicos
    if (error.message?.includes("400")) {
      showNotification("Senha atual incorreta ou nova senha inválida", "error");
    } else {
      showNotification(`Erro ao alterar senha: ${error.message || "Erro desconhecido"}`, "error");
    }
  }
}

/**
 * Conteúdo da página Meu Perfil
 */
export function getMeuPerfilContent() {
  const userData = getUserData();
  const nomeUsuario = userData?.nome || "Usuário";

  // Carregar dados atualizados após renderizar
  setTimeout(() => {
    carregarDadosUsuario();
  }, 100);

  return `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col-12">
          <h1 class="text-gradient mb-0">Meu Perfil</h1>
          <p class="text-muted">Gerencie suas informações pessoais e senha</p>
        </div>
      </div>
      
      <div class="row">
        <!-- Informações Pessoais -->
        <div class="col-lg-6 mb-4">
          <div class="card h-100">
            <div class="card-header">
              <h6 class="m-0 font-weight-bold text-primary">
                <i class="bi bi-person me-2"></i>Informações Pessoais
              </h6>
            </div>
            <div class="card-body">
              <form id="meuPerfilForm">
                <div class="mb-3">
                  <label for="meuPerfilNome" class="form-label">Nome Completo</label>
                  <input type="text" class="form-control" id="meuPerfilNome" value="${nomeUsuario}">
                </div>
                
                <div class="mb-3">
                  <label for="meuPerfilEmail" class="form-label">E-mail</label>
                  <input type="email" class="form-control" id="meuPerfilEmail" readonly>
                  <small class="text-muted">O e-mail não pode ser alterado</small>
                </div>
                
                <div class="mb-3">
                  <label for="meuPerfilCpf" class="form-label">CPF</label>
                  <input type="text" class="form-control" id="meuPerfilCpf" readonly>
                  <small class="text-muted">O CPF não pode ser alterado</small>
                </div>
                
                <div class="row">
                  <div class="col-md-6 mb-3">
                    <label for="meuPerfilEstabelecimento" class="form-label">Estabelecimento</label>
                    <input type="text" class="form-control" id="meuPerfilEstabelecimento" readonly>
                  </div>
                  <div class="col-md-6 mb-3">
                    <label for="meuPerfilTipoUsuario" class="form-label">Tipo de Acesso</label>
                    <input type="text" class="form-control" id="meuPerfilTipoUsuario" readonly>
                  </div>
                </div>
                
                <button type="button" class="btn btn-primary" onclick="salvarMeuPerfil()">
                  <i class="bi bi-check-lg me-2"></i>Salvar Alterações
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <!-- Alterar Senha -->
        <div class="col-lg-6 mb-4">
          <div class="card h-100">
            <div class="card-header">
              <h6 class="m-0 font-weight-bold text-primary">
                <i class="bi bi-key me-2"></i>Alterar Senha
              </h6>
            </div>
            <div class="card-body">
              <form id="alterarSenhaForm">
                <div class="mb-3">
                  <label for="senhaAtual" class="form-label">Senha Atual</label>
                  <input type="password" class="form-control" id="senhaAtual" placeholder="Digite sua senha atual">
                </div>
                
                <div class="mb-3">
                  <label for="novaSenha" class="form-label">Nova Senha</label>
                  <input type="password" class="form-control" id="novaSenha" placeholder="Digite a nova senha">
                  <small class="text-muted">Mínimo de 8 caracteres</small>
                </div>
                
                <div class="mb-3">
                  <label for="confirmarSenha" class="form-label">Confirmar Nova Senha</label>
                  <input type="password" class="form-control" id="confirmarSenha" placeholder="Confirme a nova senha">
                </div>
                
                <button type="button" class="btn btn-warning" onclick="alterarSenha()">
                  <i class="bi bi-shield-lock me-2"></i>Alterar Senha
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    ${getMainFooter()}
  `;
}

// Exportar para escopo global
window.salvarMeuPerfil = salvarMeuPerfil;
window.alterarSenha = alterarSenha;
