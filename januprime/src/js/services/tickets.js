/**
 * Serviço de Tickets
 * Gerencia operações para tickets de débito e crédito
 */
import { apiService } from "../config/api.js";
import { APP_CONFIG } from "../config/app.js";

class TicketsService {
  constructor() {
    this.endpointDebito = APP_CONFIG.endpoints.ticketsDebito;
    this.endpointCredito = APP_CONFIG.endpoints.ticketsCredito;
  }

  /**
   * Listar tickets de débito
   */
  async listarDebito(filtros = {}) {
    try {
      let url = this.endpointDebito;
      const params = new URLSearchParams();

      if (filtros.status) {
        params.append("status", filtros.status);
      }
      if (filtros.search) {
        params.append("search", filtros.search);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      return await apiService.get(url);
    } catch (error) {
      console.error("Erro ao listar tickets débito:", error);
      throw error;
    }
  }

  /**
   * Listar tickets de crédito
   */
  async listarCredito(filtros = {}) {
    try {
      let url = this.endpointCredito;
      const params = new URLSearchParams();

      if (filtros.status) {
        params.append("status", filtros.status);
      }
      if (filtros.search) {
        params.append("search", filtros.search);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      return await apiService.get(url);
    } catch (error) {
      console.error("Erro ao listar tickets crédito:", error);
      throw error;
    }
  }

  /**
   * Listar todos os tickets (débito + crédito)
   */
  async listarTodos(filtros = {}) {
    try {
      const [debitos, creditos] = await Promise.all([
        this.listarDebito(filtros),
        this.listarCredito(filtros),
      ]);

      // Combinar e ordenar por data
      const todos = [
        ...debitos.map((t) => ({ ...t, tipo: "debito" })),
        ...creditos.map((t) => ({ ...t, tipo: "credito" })),
      ].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return todos;
    } catch (error) {
      console.error("Erro ao listar todos os tickets:", error);
      throw error;
    }
  }

  /**
   * Obter ticket de débito por ID
   */
  async obterDebito(id) {
    try {
      return await apiService.get(`${this.endpointDebito}${id}/`);
    } catch (error) {
      console.error("Erro ao obter ticket débito:", error);
      throw error;
    }
  }

  /**
   * Obter ticket de crédito por ID
   */
  async obterCredito(id) {
    try {
      return await apiService.get(`${this.endpointCredito}${id}/`);
    } catch (error) {
      console.error("Erro ao obter ticket crédito:", error);
      throw error;
    }
  }

  // ========== AÇÕES PARA TICKETS DE DÉBITO ==========

  /**
   * Aprovar ticket de débito (POST /tickets/debito/{id}/aprovar/)
   */
  async aprovarDebito(id) {
    try {
      return await apiService.post(`${this.endpointDebito}${id}/aprovar/`, {});
    } catch (error) {
      console.error("Erro ao aprovar ticket:", error);
      throw error;
    }
  }

  /**
   * Recusar ticket de débito (POST /tickets/debito/{id}/recusar/)
   */
  async recusarDebito(id) {
    try {
      return await apiService.post(`${this.endpointDebito}${id}/recusar/`, {});
    } catch (error) {
      console.error("Erro ao recusar ticket:", error);
      throw error;
    }
  }

  /**
   * Cancelar ticket de débito - apenas cliente (POST /tickets/debito/{id}/cancelar/)
   */
  async cancelarDebito(id) {
    try {
      return await apiService.post(`${this.endpointDebito}${id}/cancelar/`, {});
    } catch (error) {
      console.error("Erro ao cancelar ticket:", error);
      throw error;
    }
  }

  /**
   * Concluir ticket de débito - apenas cliente (POST /tickets/debito/{id}/concluir/)
   */
  async concluirDebito(id) {
    try {
      return await apiService.post(`${this.endpointDebito}${id}/concluir/`, {});
    } catch (error) {
      console.error("Erro ao concluir ticket:", error);
      throw error;
    }
  }

  // ========== AÇÕES PARA TICKETS DE CRÉDITO ==========

  /**
   * Aprovar ticket de crédito (POST /tickets/credito/{id}/aprovar/)
   */
  async aprovarCredito(id) {
    try {
      return await apiService.post(`${this.endpointCredito}${id}/aprovar/`, {});
    } catch (error) {
      console.error("Erro ao aprovar ticket:", error);
      throw error;
    }
  }

  /**
   * Recusar ticket de crédito (POST /tickets/credito/{id}/recusar/)
   */
  async recusarCredito(id, motivo = "") {
    try {
      return await apiService.post(`${this.endpointCredito}${id}/recusar/`, { motivo });
    } catch (error) {
      console.error("Erro ao recusar ticket:", error);
      throw error;
    }
  }

  /**
   * Cancelar ticket de crédito - apenas cliente (POST /tickets/credito/{id}/cancelar/)
   */
  async cancelarCredito(id) {
    try {
      return await apiService.post(`${this.endpointCredito}${id}/cancelar/`, {});
    } catch (error) {
      console.error("Erro ao cancelar ticket:", error);
      throw error;
    }
  }
}

export const ticketsService = new TicketsService();
