// Componente de rodapé principal para páginas autenticadas
export function getMainFooter() {
  return `
    <footer class="main-footer">
      <div class="container-fluid">
        <!-- Seção principal do rodapé -->
        <div class="row py-5">
          <!-- Coluna da empresa -->
          <div class="col-lg-4 col-md-6 mb-4">
            <div class="footer-brand">
              <div class="d-flex align-items-center mb-3">
                <img src="/assets/images/logo.svg" alt="Janu Prime" width="32" height="32" class="me-3">
                <h5 class="text-gradient mb-0">Janu Prime</h5>
              </div>
              <p class="text-muted mb-3">
                Plataforma de fidelização que conecta clientes a comércios locais, 
                criando experiências únicas e recompensas valiosas.
              </p>
              <div class="social-links">
                <a href="#" class="social-link" title="Facebook">
                  <i class="bi bi-facebook"></i>
                </a>
                <a href="#" class="social-link" title="Instagram">
                  <i class="bi bi-instagram"></i>
                </a>
                <a href="#" class="social-link" title="LinkedIn">
                  <i class="bi bi-linkedin"></i>
                </a>
                <a href="#" class="social-link" title="Twitter">
                  <i class="bi bi-twitter"></i>
                </a>
              </div>
            </div>
          </div>
          
          <!-- Coluna de links rápidos -->
          <div class="col-lg-2 col-md-6 mb-4">
            <h6 class="footer-title mb-3">Plataforma</h6>
            <ul class="footer-links">
              <li><a href="#" onclick="showPage('dashboard')">Dashboard</a></li>
              <li><a href="#" onclick="showPage('catalogo')">Catálogo</a></li>
              <li><a href="#" onclick="showPage('transacoes')">Transações</a></li>
              <li><a href="#" onclick="showPage('funcionarios')">Funcionários</a></li>
              <li><a href="#" onclick="showPage('metricas')">Métricas</a></li>
            </ul>
          </div>
          
          <!-- Coluna de recursos -->
          <div class="col-lg-2 col-md-6 mb-4">
            <h6 class="footer-title mb-3">Recursos</h6>
            <ul class="footer-links">
              <li><a href="#" onclick="showPage('anuncios')">Anúncios</a></li>
              <li><a href="#" onclick="showPage('auditoria')">Auditoria</a></li>
              <li><a href="#" onclick="showPage('perfil')">Perfil</a></li>
              <li><a href="#" class="text-muted">API</a></li>
              <li><a href="#" class="text-muted">Integrações</a></li>
            </ul>
          </div>
          
          <!-- Coluna de suporte -->
          <div class="col-lg-2 col-md-6 mb-4">
            <h6 class="footer-title mb-3">Suporte</h6>
            <ul class="footer-links">
              <li><a href="#" class="text-muted">Central de Ajuda</a></li>
              <li><a href="#" class="text-muted">Documentação</a></li>
              <li><a href="#" class="text-muted">Tutoriais</a></li>
              <li><a href="#" class="text-muted">Contato</a></li>
              <li><a href="#" class="text-muted">Status</a></li>
            </ul>
          </div>
          
          <!-- Coluna de contato -->
          <div class="col-lg-2 col-md-6 mb-4">
            <h6 class="footer-title mb-3">Contato</h6>
            <div class="contact-info">
              <div class="contact-item mb-2">
                <i class="bi bi-envelope me-2 text-primary"></i>
                <span class="text-muted small">contato@januprime.com</span>
              </div>
              <div class="contact-item mb-2">
                <i class="bi bi-telephone me-2 text-primary"></i>
                <span class="text-muted small">(11) 99999-9999</span>
              </div>
              <div class="contact-item mb-2">
                <i class="bi bi-geo-alt me-2 text-primary"></i>
                <span class="text-muted small">São Paulo, SP</span>
              </div>
              <div class="contact-item">
                <i class="bi bi-clock me-2 text-primary"></i>
                <span class="text-muted small">Seg-Sex: 9h-18h</span>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Divisor -->
        <hr class="footer-divider">
        
        <!-- Seção inferior -->
        <div class="row py-3">
          <div class="col-md-6">
            <p class="text-muted small mb-0">
              © ${new Date().getFullYear()} Janu Prime. Todos os direitos reservados.
            </p>
          </div>
          <div class="col-md-6 text-md-end">
            <div class="footer-legal-links">
              <a href="#" class="text-muted small me-3">Política de Privacidade</a>
              <a href="#" class="text-muted small me-3">Termos de Uso</a>
              <a href="#" class="text-muted small">Cookies</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  `;
}

// Exportar para uso global
window.getMainFooter = getMainFooter;
