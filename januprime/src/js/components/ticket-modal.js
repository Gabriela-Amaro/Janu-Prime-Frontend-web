/**
 * Componente reutilizável para modal de visualização de tickets
 * Pode ser usado tanto no dashboard quanto na página de transações
 */

import { APP_CONFIG } from '../config/app.js';

/**
 * Constrói URL completa da imagem
 */
function getImagemUrl(imagemPath) {
  if (!imagemPath) return null;
  if (imagemPath.startsWith('http://') || imagemPath.startsWith('https://')) {
    return imagemPath;
  }
  const baseUrl = APP_CONFIG.apiUrl.replace('/api', '');
  const mediaPath = imagemPath.startsWith('/') ? imagemPath : `/${imagemPath}`;
  return `${baseUrl}/media${mediaPath}`;
}

/**
 * Gera o HTML do conteúdo do modal para ticket de crédito
 */
function gerarConteudoCredito(ticket) {
  const imagemUrl = getImagemUrl(ticket.imagem);
  
  const imagemNota = imagemUrl
    ? `
    <div class="col-lg-5 mb-3 mb-lg-0">
      <div class="card h-100 bg-dark">
        <div class="card-header bg-secondary py-2">
          <h6 class="mb-0 text-white"><i class="bi bi-image me-2"></i>Imagem da Nota Fiscal</h6>
        </div>
        <div class="card-body p-2 d-flex align-items-center justify-content-center" style="min-height: 300px;">
          <a href="${imagemUrl}" target="_blank" title="Clique para ampliar">
            <img src="${imagemUrl}" alt="Nota Fiscal" class="img-fluid rounded" style="max-height: 280px; cursor: zoom-in;">
          </a>
        </div>
        <div class="card-footer text-center py-2">
          <a href="${imagemUrl}" target="_blank" class="btn btn-sm btn-outline-light">
            <i class="bi bi-arrows-fullscreen me-1"></i>Abrir em Nova Aba
          </a>
        </div>
      </div>
    </div>
  `
    : `
    <div class="col-lg-5 mb-3 mb-lg-0">
      <div class="card h-100 bg-secondary">
        <div class="card-body d-flex flex-column align-items-center justify-content-center text-muted" style="min-height: 300px;">
          <i class="bi bi-image text-muted" style="font-size: 4rem;"></i>
          <p class="mt-2 mb-0">Nenhuma imagem enviada</p>
        </div>
      </div>
    </div>
  `;

  return `
    <div class="row">
      ${imagemNota}
      
      <div class="col-lg-7">
        <!-- Dados do Cliente -->
        <div class="card mb-3">
          <div class="card-header py-2" style="background-color: rgba(100, 116, 139, 0.2);">
            <h6 class="mb-0" style="color: #64748b;"><i class="bi bi-person-badge me-2"></i>Dados do Cliente</h6>
          </div>
          <div class="card-body py-2">
            <div class="row">
              <div class="col-6">
                <small class="text-muted d-block">Nome</small>
                <strong>${ticket.nome_cliente || "N/A"}</strong>
              </div>
              <div class="col-6">
                <small class="text-muted d-block">Data do Envio</small>
                <strong>${new Date(ticket.created_at).toLocaleString("pt-BR")}</strong>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Dados da Nota para Verificação -->
        <div class="card mb-3" style="border-color: #94a3b8;">
          <div class="card-header py-2" style="background-color: rgba(148, 163, 184, 0.2);">
            <h6 class="mb-0" style="color: #64748b;"><i class="bi bi-clipboard-check me-2"></i>Dados para Verificação</h6>
          </div>
          <div class="card-body py-2">
            <div class="row g-2">
              <div class="col-6">
                <div class="bg-dark bg-opacity-10 rounded p-2">
                  <small class="text-muted d-block">Nº da Nota</small>
                  <strong class="fs-5">${ticket.numero_nota || "N/A"}</strong>
                </div>
              </div>
              <div class="col-6">
                <div class="bg-dark bg-opacity-10 rounded p-2">
                  <small class="text-muted d-block">Data da Nota</small>
                  <strong class="fs-5">${
                    ticket.data_nota
                      ? new Date(ticket.data_nota).toLocaleDateString("pt-BR")
                      : "N/A"
                  }</strong>
                </div>
              </div>
              <div class="col-6">
                <div class="bg-success bg-opacity-10 rounded p-2">
                  <small class="text-muted d-block">Valor Total</small>
                  <strong class="fs-4 text-success">R$ ${parseFloat(
                    ticket.preco || 0
                  ).toFixed(2)}</strong>
                </div>
              </div>
              <div class="col-6">
                <div class="bg-primary bg-opacity-10 rounded p-2">
                  <small class="text-muted d-block">Estabelecimento</small>
                  <strong>${ticket.nome_estabelecimento || "N/A"}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Resultado -->
        <div class="card" style="border-color: #10b981;">
          <div class="card-header py-2" style="background-color: rgba(16, 185, 129, 0.15);">
            <h6 class="mb-0" style="color: #059669;"><i class="bi bi-coin me-2"></i>Pontos a Creditar</h6>
          </div>
          <div class="card-body py-3 text-center">
            <span class="display-5 fw-bold" style="color: #059669;">${
              ticket.pontos || 0
            }</span>
            <span class="text-muted ms-2">pontos</span>
          </div>
        </div>
      </div>
    </div>
    ${
      ticket.observacao
        ? `
      <div class="alert alert-secondary mt-3 mb-0">
        <i class="bi bi-chat-left-text me-2"></i>
        <strong>Observação:</strong> ${ticket.observacao}
      </div>
    `
        : ""
    }
  `;
}

/**
 * Gera o HTML do conteúdo do modal para ticket de débito
 */
function gerarConteudoDebito(ticket) {
  const imagemProdutoUrl = getImagemUrl(ticket.imagem_produto);
  
  return `
    <div class="row">
      <!-- Card do Produto -->
      <div class="col-lg-5 mb-3 mb-lg-0">
        <div class="card h-100 bg-dark">
          <div class="card-header bg-secondary py-2">
            <h6 class="mb-0 text-white"><i class="bi bi-gift me-2"></i>Produto Solicitado</h6>
          </div>
          <div class="card-body d-flex flex-column align-items-center justify-content-center text-center p-3" style="min-height: 280px;">
            ${imagemProdutoUrl
              ? `<img src="${imagemProdutoUrl}" alt="${ticket.nome_produto || 'Produto'}" class="img-fluid rounded mb-3" style="max-height: 150px; object-fit: contain;">`
              : `<div class="d-flex align-items-center justify-content-center mb-3" style="width: 150px; height: 150px; background-color: rgba(255,255,255,0.1); border-radius: 8px;">
                  <i class="bi bi-image text-muted" style="font-size: 4rem;"></i>
                </div>`
            }
            <h4 class="mb-2 text-white">${ticket.nome_produto || "Produto"}</h4>
            <div class="rounded-pill px-4 py-2 mt-2" style="background-color: rgba(148, 163, 184, 0.3);">
              <span class="text-white fw-bold fs-5">
                <i class="bi bi-dash-circle me-1"></i>${ticket.pontos} pontos
              </span>
            </div>
          </div>
        </div>
      </div>
      
      <div class="col-lg-7">
        <!-- Dados do Cliente -->
        <div class="card mb-3">
          <div class="card-header py-2" style="background-color: rgba(100, 116, 139, 0.2);">
            <h6 class="mb-0" style="color: #64748b;"><i class="bi bi-person-badge me-2"></i>Dados do Cliente</h6>
          </div>
          <div class="card-body py-2">
            <div class="row">
              <div class="col-6">
                <small class="text-muted d-block">Nome</small>
                <strong>${ticket.nome_cliente || "N/A"}</strong>
              </div>
              <div class="col-6">
                <small class="text-muted d-block">Data da Solicitação</small>
                <strong>${new Date(ticket.created_at).toLocaleString("pt-BR")}</strong>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Detalhes do Resgate -->
        <div class="card" style="border-color: #94a3b8;">
          <div class="card-header py-2" style="background-color: rgba(148, 163, 184, 0.2);">
            <h6 class="mb-0" style="color: #64748b;"><i class="bi bi-info-circle me-2"></i>Detalhes do Resgate</h6>
          </div>
          <div class="card-body py-2">
            <div class="row g-2">
              <div class="col-12">
                <div class="bg-dark bg-opacity-10 rounded p-2">
                  <small class="text-muted d-block">Código do Ticket</small>
                  <strong class="fs-5 font-monospace">#${ticket.codigo}</strong>
                </div>
              </div>
              <div class="col-6">
                <div class="bg-dark bg-opacity-10 rounded p-2">
                  <small class="text-muted d-block">Status</small>
                  <span class="badge bg-${
                    ticket.status === "ABERTO"
                      ? "info"
                      : ticket.status === "APROVADO" || ticket.status === "CONCLUIDO"
                      ? "success"
                      : "secondary"
                  } fs-6">
                    ${ticket.status}
                  </span>
                </div>
              </div>
              <div class="col-6">
                <div class="bg-danger bg-opacity-10 rounded p-2">
                  <small class="text-muted d-block">Pontos a Debitar</small>
                  <strong class="fs-4 text-danger">${ticket.pontos}</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    ${
      ticket.observacao
        ? `
      <div class="alert alert-secondary mt-3 mb-0">
        <i class="bi bi-chat-left-text me-2"></i>
        <strong>Observação:</strong> ${ticket.observacao}
      </div>
    `
        : ""
    }
  `;
}

/**
 * Gera o HTML completo do modal de ticket
 * @param {Object} ticket - Dados do ticket
 * @param {string} tipo - Tipo do ticket: 'credito' ou 'debito'
 * @param {Object} options - Opções adicionais
 * @param {string} options.modalId - ID do modal (padrão: 'ticketModal')
 * @param {Function} options.onAprovar - Nome da função de aprovar (padrão: 'aprovarTicket')
 * @param {Function} options.onRejeitar - Nome da função de rejeitar (padrão: 'rejeitarTicket')
 */
export function gerarTicketModalHTML(ticket, tipo, options = {}) {
  const {
    modalId = 'ticketModal',
    onAprovar = 'aprovarTicket',
    onRejeitar = 'rejeitarTicket'
  } = options;

  const detalhesHTML = tipo === 'credito' 
    ? gerarConteudoCredito(ticket) 
    : gerarConteudoDebito(ticket);

  return `
    <div class="modal fade" id="${modalId}" tabindex="-1" aria-labelledby="${modalId}Label" aria-hidden="true">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header bg-${tipo === "credito" ? "success" : "warning"} text-white">
            <h5 class="modal-title" id="${modalId}Label">
              <i class="bi bi-ticket-perforated me-2"></i>
              Ticket ${tipo === "credito" ? "de Crédito" : "de Débito"} #${ticket.codigo || ticket.id}
            </h5>
            <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <span class="badge bg-${tipo === "credito" ? "success" : "warning"} fs-6">
                ${tipo === "credito" ? "Crédito de Pontos" : "Resgate de Produto"}
              </span>
              <span class="badge bg-info fs-6">
                Status: ${ticket.status}
              </span>
            </div>
            ${detalhesHTML}
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
            ${
              ticket.status === "ABERTO"
                ? `
              <button type="button" class="btn btn-danger" onclick="${onRejeitar}(${ticket.id}, '${tipo}'); bootstrap.Modal.getInstance(document.getElementById('${modalId}')).hide();">
                <i class="bi bi-x-lg me-1"></i>Recusar
              </button>
              <button type="button" class="btn btn-success" onclick="${onAprovar}(${ticket.id}, '${tipo}'); bootstrap.Modal.getInstance(document.getElementById('${modalId}')).hide();">
                <i class="bi bi-check-lg me-1"></i>Aprovar
              </button>
            `
                : ""
            }
          </div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Exibe o modal de ticket
 * @param {Object} ticket - Dados do ticket
 * @param {string} tipo - Tipo do ticket: 'credito' ou 'debito'
 * @param {Object} options - Opções adicionais (ver gerarTicketModalHTML)
 */
export function exibirTicketModal(ticket, tipo, options = {}) {
  const modalId = options.modalId || 'ticketModal';
  
  // Remover modal existente se houver
  const existingModal = document.getElementById(modalId);
  if (existingModal) {
    existingModal.remove();
  }

  // Gerar e inserir o modal
  const modalHtml = gerarTicketModalHTML(ticket, tipo, options);
  document.body.insertAdjacentHTML("beforeend", modalHtml);

  // Mostrar o modal
  const modal = new window.bootstrap.Modal(document.getElementById(modalId));
  modal.show();
}
