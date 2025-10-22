// Navbar para páginas de autenticação
export function getAuthNavbar() {
  return `
    <nav class="navbar navbar-expand-lg navbar-dark auth-navbar">
      <div class="container-fluid">
        <div class="navbar-brand d-flex align-items-center fade-in-left">
          <img src="/assets/images/logo.svg" alt="Logo" width="30" height="24" class="d-inline-block align-text-top me-2">  
          <span class="fw-bold">Janu Prime</span>
        </div>
      </div>
    </nav>
  `;
}

// Rodapé para páginas de autenticação
export function getAuthFooter() {
  return `
    <footer class="auth-footer">
      <div class="container-fluid">
        <!-- Seção principal do rodapé -->
        <div class="row py-4">
          <!-- Coluna da empresa -->
          <div class="col-lg-4 col-md-6 mb-3">
            <div class="footer-brand">
              <div class="d-flex align-items-center mb-2">
                <img src="/assets/images/logo.svg" alt="Janu Prime" width="24" height="24" class="me-2">
                <h6 class="text-gradient mb-0">Janu Prime</h6>
              </div>
              <p class="text-muted small mb-2">
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
          
          <!-- Coluna de recursos -->
          <div class="col-lg-2 col-md-6 mb-3">
            <h6 class="footer-title mb-2">Recursos</h6>
            <ul class="footer-links">
              <li><a href="#" class="text-muted">Como Funciona</a></li>
              <li><a href="#" class="text-muted">Benefícios</a></li>
              <li><a href="#" class="text-muted">Preços</a></li>
              <li><a href="#" class="text-muted">API</a></li>
              <li><a href="#" class="text-muted">Integrações</a></li>
            </ul>
          </div>
          
          <!-- Coluna de suporte -->
          <div class="col-lg-2 col-md-6 mb-3">
            <h6 class="footer-title mb-2">Suporte</h6>
            <ul class="footer-links">
              <li><a href="#" class="text-muted">Central de Ajuda</a></li>
              <li><a href="#" class="text-muted">Documentação</a></li>
              <li><a href="#" class="text-muted">Tutoriais</a></li>
              <li><a href="#" class="text-muted">Contato</a></li>
              <li><a href="#" class="text-muted">Status</a></li>
            </ul>
          </div>
          
          <!-- Coluna de contato -->
          <div class="col-lg-2 col-md-6 mb-3">
            <h6 class="footer-title mb-2">Contato</h6>
            <div class="contact-info">
              <div class="contact-item mb-1">
                <i class="bi bi-envelope me-2 text-primary"></i>
                <span class="text-muted small">contato@januprime.com</span>
              </div>
              <div class="contact-item mb-1">
                <i class="bi bi-telephone me-2 text-primary"></i>
                <span class="text-muted small">(11) 99999-9999</span>
              </div>
              <div class="contact-item">
                <i class="bi bi-geo-alt me-2 text-primary"></i>
                <span class="text-muted small">São Paulo, SP</span>
              </div>
            </div>
          </div>
          
          <!-- Coluna de navegação rápida -->
          <div class="col-lg-2 col-md-6 mb-3">
            <h6 class="footer-title mb-2">Navegação</h6>
            <ul class="footer-links">
              <li><a href="#" onclick="showPage('login')" class="text-muted">Login</a></li>
              <li><a href="#" onclick="showPage('register')" class="text-muted">Cadastro</a></li>
              <li><a href="#" onclick="showPage('forgot-password')" class="text-muted">Recuperar Senha</a></li>
              <li><a href="#" class="text-muted">Sobre Nós</a></li>
              <li><a href="#" class="text-muted">Blog</a></li>
            </ul>
          </div>
        </div>
        
        <!-- Divisor -->
        <hr class="footer-divider">
        
        <!-- Seção inferior -->
        <div class="row py-2">
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

// Exportar funções para uso global
window.getAuthNavbar = getAuthNavbar;
window.getAuthFooter = getAuthFooter;
