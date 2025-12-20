/**
 * Serviço de Estabelecimentos
 * Gerencia operações para estabelecimentos
 */
import { apiService } from "../config/api.js";
import { APP_CONFIG } from "../config/app.js";

class EstabelecimentosService {
  constructor() {
    this.endpoint = APP_CONFIG.endpoints.estabelecimentos;
  }

  /**
   * Listar estabelecimentos
   */
  async listar(filtros = {}) {
    try {
      let url = this.endpoint;
      const params = new URLSearchParams();

      if (filtros.ativo !== undefined) {
        params.append("ativo", filtros.ativo);
      }
      if (filtros.search) {
        params.append("search", filtros.search);
      }

      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      return await apiService.get(url);
    } catch (error) {
      console.error("Erro ao listar estabelecimentos:", error);
      throw error;
    }
  }

  /**
   * Obter estabelecimento por ID
   */
  async obter(id) {
    try {
      return await apiService.get(`${this.endpoint}${id}/`);
    } catch (error) {
      console.error("Erro ao obter estabelecimento:", error);
      throw error;
    }
  }

  /**
   * Obter estabelecimento do usuário logado
   * Retorna o estabelecimento associado ao administrador logado
   */
  async obterMeuEstabelecimento() {
    try {
      // Primeiro, buscar dados do usuário para obter o ID do estabelecimento
      const userData = await apiService.get(APP_CONFIG.authEndpoints.me);
      
      if (userData?.estabelecimento?.id) {
        return await this.obter(userData.estabelecimento.id);
      }
      
      throw new Error("Usuário não possui estabelecimento associado");
    } catch (error) {
      console.error("Erro ao obter estabelecimento do usuário:", error);
      throw error;
    }
  }

  /**
   * Atualizar estabelecimento
   */
  async atualizar(id, dados) {
    try {
      return await apiService.patch(`${this.endpoint}${id}/`, dados);
    } catch (error) {
      console.error("Erro ao atualizar estabelecimento:", error);
      throw error;
    }
  }

  /**
   * Atualizar estabelecimento com logotipo (usando FormData)
   * Envia apenas o logotipo para evitar problemas de serialização
   */
  async atualizarComLogotipo(id, logotipo) {
    try {
      const formData = new FormData();
      formData.append('logotipo', logotipo);
      
      return await apiService.patch(`${this.endpoint}${id}/`, formData);
    } catch (error) {
      console.error("Erro ao atualizar logotipo:", error);
      throw error;
    }
  }

  /**
   * Deletar estabelecimento
   */
  async deletar(id) {
    try {
      return await apiService.delete(`${this.endpoint}${id}/`);
    } catch (error) {
      console.error("Erro ao deletar estabelecimento:", error);
      throw error;
    }
  }
}

export const estabelecimentosService = new EstabelecimentosService();

