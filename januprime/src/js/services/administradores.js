/**
 * Serviço de Administradores
 * Gerencia operações para administradores/funcionários
 */
import { apiService } from "../config/api.js";
import { APP_CONFIG } from "../config/app.js";

class AdministradoresService {
  constructor() {
    this.endpoint = APP_CONFIG.endpoints.administradores;
  }

  /**
   * Listar administradores
   */
  async listar(filtros = {}) {
    try {
      let url = this.endpoint;
      const params = new URLSearchParams();

      if (filtros.search) {
        params.append("search", filtros.search);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      return await apiService.get(url);
    } catch (error) {
      console.error("Erro ao listar administradores:", error);
      throw error;
    }
  }

  /**
   * Obter administrador por ID
   */
  async obter(id) {
    try {
      return await apiService.get(`${this.endpoint}${id}/`);
    } catch (error) {
      console.error("Erro ao obter administrador:", error);
      throw error;
    }
  }

  /**
   * Criar novo administrador/funcionário
   */
  async criar(dados) {
    try {
      return await apiService.post(`${this.endpoint}cadastro/`, dados);
    } catch (error) {
      console.error("Erro ao criar administrador:", error);
      throw error;
    }
  }

  /**
   * Atualizar administrador existente
   */
  async atualizar(id, dados) {
    try {
      return await apiService.patch(`${this.endpoint}${id}/`, dados);
    } catch (error) {
      console.error("Erro ao atualizar administrador:", error);
      throw error;
    }
  }

  /**
   * Deletar administrador
   */
  async deletar(id) {
    try {
      return await apiService.delete(`${this.endpoint}${id}/`);
    } catch (error) {
      console.error("Erro ao deletar administrador:", error);
      throw error;
    }
  }
}

export const administradoresService = new AdministradoresService();



