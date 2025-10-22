import { debounce } from '../utils/debounce.js';
import { showNotification } from '../utils/notifications.js';
import { getMainFooter } from '../components/main-footer.js';

export function getMetricasContent() {
  return `
    <div class="container-fluid">
      <div class="row mb-4">
        <div class="col-12">
          <h1 class="text-gradient mb-0">Métricas da Empresa</h1>
          <p class="text-muted">Acompanhe o desempenho do seu estabelecimento</p>
        </div>
      </div>
      
      <!-- Filtro Inteligente -->
      <div class="row mb-4">
        <div class="col-12">
          <div class="card">
            <div class="card-header">
              <h6 class="m-0 font-weight-bold text-primary">
                <i class="bi bi-funnel me-2"></i>Filtro Inteligente
              </h6>
            </div>
            <div class="card-body">
              <div class="row">
                <div class="col-md-3">
                  <label for="filtroPeriodo" class="form-label">Período</label>
                  <div class="dropdown">
                    <select class="form-select" id="filtroPeriodo" onchange="atualizarMetricas()">
                      <option value="hoje">Hoje</option>
                      <option value="semana" selected>Esta Semana</option>
                      <option value="mes">Este Mês</option>
                      <option value="trimestre">Este Trimestre</option>
                      <option value="ano">Este Ano</option>
                      <option value="personalizado">Personalizado</option>
                    </select>
                    <i class="bi bi-chevron-down dropdown-icon"></i>
                  </div>
                </div>
                <div class="col-md-3">
                  <label for="filtroTipoMetrica" class="form-label">Tipo de Métrica</label>
                  <div class="dropdown">
                    <select class="form-select" id="filtroTipoMetrica" onchange="atualizarMetricas()">
                      <option value="todas" selected>Todas</option>
                      <option value="transacoes">Transações</option>
                      <option value="clientes">Clientes</option>
                      <option value="produtos">Produtos</option>
                      <option value="faturamento">Faturamento</option>
                    </select>
                    <i class="bi bi-chevron-down dropdown-icon"></i>
                  </div>
                </div>
                <div class="col-md-3">
                  <label for="filtroComparacao" class="form-label">Comparar com</label>
                  <div class="dropdown">
                    <select class="form-select" id="filtroComparacao" onchange="atualizarMetricas()">
                      <option value="nenhuma">Nenhuma</option>
                      <option value="periodo_anterior">Período Anterior</option>
                      <option value="ano_anterior">Ano Anterior</option>
                      <option value="meta">Meta Estabelecida</option>
                    </select>
                    <i class="bi bi-chevron-down dropdown-icon"></i>
                  </div>
                </div>
                <div class="col-md-3">
                  <label for="filtroAgrupamento" class="form-label">Agrupar por</label>
                  <div class="dropdown">
                    <select class="form-select" id="filtroAgrupamento" onchange="atualizarMetricas()">
                      <option value="dia">Dia</option>
                      <option value="semana" selected>Semana</option>
                      <option value="mes">Mês</option>
                      <option value="trimestre">Trimestre</option>
                    </select>
                    <i class="bi bi-chevron-down dropdown-icon"></i>
                  </div>
                </div>
              </div>
              
              <!-- Filtros personalizados (aparece quando selecionado) -->
              <div class="row mt-3" id="filtrosPersonalizados" style="display: none;">
                <div class="col-md-6">
                  <label for="dataInicio" class="form-label">Data de Início</label>
                  <input type="date" class="form-control" id="dataInicio">
                </div>
                <div class="col-md-6">
                  <label for="dataFim" class="form-label">Data de Fim</label>
                  <input type="date" class="form-control" id="dataFim">
                </div>
              </div>
              
              <div class="row mt-3">
                <div class="col-12">
                  <button class="btn btn-outline-secondary me-2" onclick="limparFiltrosMetricas()">
                    <i class="bi bi-arrow-clockwise me-1"></i>Limpar Filtros
                  </button>
                  <button class="btn btn-outline-primary me-2" onclick="exportarMetricas()">
                    <i class="bi bi-download me-1"></i>Exportar
                  </button>
                  <button class="btn btn-outline-info" onclick="gerarRelatorio()">
                    <i class="bi bi-file-earmark-text me-1"></i>Gerar Relatório
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Cards de métricas principais -->
      <div class="row mb-4">
        <div class="col-xl-3 col-md-6 mb-4">
          <div class="card border-left-primary">
            <div class="card-body">
              <div class="row no-gutters align-items-center">
                <div class="col mr-2">
                  <div class="text-xs font-weight-bold text-primary text-uppercase mb-1">
                    Total de Clientes
                  </div>
                  <div class="h5 mb-0 font-weight-bold text-gray-800">1,247</div>
                  <div class="text-xs text-success">
                    <i class="bi bi-arrow-up"></i> 12% este mês
                  </div>
                </div>
                <div class="col-auto">
                  <i class="bi bi-people fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-xl-3 col-md-6 mb-4">
          <div class="card border-left-success">
            <div class="card-body">
              <div class="row no-gutters align-items-center">
                <div class="col mr-2">
                  <div class="text-xs font-weight-bold text-success text-uppercase mb-1">
                    Pontos Acumulados
                  </div>
                  <div class="h5 mb-0 font-weight-bold text-gray-800">45,230</div>
                  <div class="text-xs text-success">
                    <i class="bi bi-arrow-up"></i> 8% este mês
                  </div>
                </div>
                <div class="col-auto">
                  <i class="bi bi-star fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-xl-3 col-md-6 mb-4">
          <div class="card border-left-info">
            <div class="card-body">
              <div class="row no-gutters align-items-center">
                <div class="col mr-2">
                  <div class="text-xs font-weight-bold text-info text-uppercase mb-1">
                    Resgates Realizados
                  </div>
                  <div class="h5 mb-0 font-weight-bold text-gray-800">89</div>
                  <div class="text-xs text-success">
                    <i class="bi bi-arrow-up"></i> 15% este mês
                  </div>
                </div>
                <div class="col-auto">
                  <i class="bi bi-gift fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        <div class="col-xl-3 col-md-6 mb-4">
          <div class="card border-left-warning">
            <div class="card-body">
              <div class="row no-gutters align-items-center">
                <div class="col mr-2">
                  <div class="text-xs font-weight-bold text-warning text-uppercase mb-1">
                    Faturamento
                  </div>
                  <div class="h5 mb-0 font-weight-bold text-gray-800">R$ 12,450</div>
                  <div class="text-xs text-success">
                    <i class="bi bi-arrow-up"></i> 5% este mês
                  </div>
                </div>
                <div class="col-auto">
                  <i class="bi bi-currency-dollar fa-2x text-gray-300"></i>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- Gráficos -->
      <div class="row">
        <div class="col-lg-8">
          <div class="card">
            <div class="card-header">
              <h6 class="m-0 font-weight-bold text-primary">Transações por Mês</h6>
            </div>
            <div class="card-body">
              <canvas id="transacoesChart" width="400" height="200"></canvas>
            </div>
          </div>
        </div>
        
        <div class="col-lg-4">
          <div class="card">
            <div class="card-header">
              <h6 class="m-0 font-weight-bold text-primary">Produtos Mais Resgatados</h6>
            </div>
            <div class="card-body">
              <canvas id="produtosChart" width="400" height="200"></canvas>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    ${getMainFooter()}
  `;
}

// Função para aplicar filtros automaticamente
export function atualizarMetricas() {
  const periodo = document.getElementById('filtroPeriodo')?.value || '';
  const tipoMetrica = document.getElementById('filtroTipoMetrica')?.value || '';
  const comparacao = document.getElementById('filtroComparacao')?.value || '';
  const agrupamento = document.getElementById('filtroAgrupamento')?.value || '';
  
  // Mostrar/ocultar filtros personalizados
  const filtrosPersonalizados = document.getElementById('filtrosPersonalizados');
  if (filtrosPersonalizados) {
    filtrosPersonalizados.style.display = periodo === 'personalizado' ? 'block' : 'none';
  }
  
  // Aplicar filtros automaticamente
  aplicarFiltrosMetricasAuto();
}

// Função para aplicar filtros automaticamente
export function aplicarFiltrosMetricasAuto() {
  const periodo = document.getElementById('filtroPeriodo')?.value || '';
  const tipoMetrica = document.getElementById('filtroTipoMetrica')?.value || '';
  const comparacao = document.getElementById('filtroComparacao')?.value || '';
  const agrupamento = document.getElementById('filtroAgrupamento')?.value || '';
  const dataInicio = document.getElementById('dataInicio')?.value || '';
  const dataFim = document.getElementById('dataFim')?.value || '';
  
  console.log('Aplicando filtros de métricas automaticamente:', { 
    periodo, tipoMetrica, comparacao, agrupamento, dataInicio, dataFim 
  });
  
  // Aqui você pode implementar a lógica para atualizar os gráficos e métricas
  // Por enquanto, apenas mostra uma notificação
  showNotification('Métricas atualizadas automaticamente!', 'info');
}

// Função para limpar todos os filtros
export function limparFiltrosMetricas() {
  const periodoSelect = document.getElementById('filtroPeriodo');
  const tipoMetricaSelect = document.getElementById('filtroTipoMetrica');
  const comparacaoSelect = document.getElementById('filtroComparacao');
  const agrupamentoSelect = document.getElementById('filtroAgrupamento');
  const dataInicioInput = document.getElementById('dataInicio');
  const dataFimInput = document.getElementById('dataFim');
  
  if (periodoSelect) periodoSelect.value = 'semana';
  if (tipoMetricaSelect) tipoMetricaSelect.value = 'todas';
  if (comparacaoSelect) comparacaoSelect.value = 'nenhuma';
  if (agrupamentoSelect) agrupamentoSelect.value = 'semana';
  if (dataInicioInput) dataInicioInput.value = '';
  if (dataFimInput) dataFimInput.value = '';
  
  // Ocultar filtros personalizados
  const filtrosPersonalizados = document.getElementById('filtrosPersonalizados');
  if (filtrosPersonalizados) {
    filtrosPersonalizados.style.display = 'none';
  }
  
  aplicarFiltrosMetricasAuto();
}

// Função original mantida para compatibilidade
export function aplicarFiltrosMetricas() {
  aplicarFiltrosMetricasAuto();
}

export function exportarMetricas() {
  console.log('Exportando métricas...');
  showNotification('Métricas exportadas com sucesso!', 'success');
}

export function gerarRelatorio() {
  console.log('Gerando relatório...');
  showNotification('Relatório gerado com sucesso!', 'success');
}
