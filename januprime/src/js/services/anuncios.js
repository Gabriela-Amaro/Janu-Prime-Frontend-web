/**
 * Serviço de Anúncios
 * Gerencia operações CRUD para anúncios/promoções
 */
import { apiService } from "../config/api.js";
import { APP_CONFIG } from "../config/app.js";

class AnunciosService {
  constructor() {
    this.endpoint = APP_CONFIG.endpoints.anuncios;
  }

  /**
   * Listar todos os anúncios
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
      console.error("Erro ao listar anúncios:", error);
      throw error;
    }
  }

  /**
   * Obter anúncio por ID
   */
  async obter(id) {
    try {
      return await apiService.get(`${this.endpoint}${id}/`);
    } catch (error) {
      console.error("Erro ao obter anúncio:", error);
      throw error;
    }
  }

  /**
   * Criar novo anúncio
   * @param {Object} dados - Dados do anúncio { data_expiracao, imagem (File opcional) }
   */
  async criar(dados) {
    try {
      // Se houver imagem, usar FormData
      if (dados.imagem instanceof File) {
        const formData = new FormData();
        formData.append('data_expiracao', dados.data_expiracao);
        formData.append('imagem', dados.imagem);
        return await apiService.post(this.endpoint, formData);
      } else {
        // Sem imagem, usar JSON normal
        return await apiService.post(this.endpoint, dados);
      }
    } catch (error) {
      console.error("Erro ao criar anúncio:", error);
      throw error;
    }
  }

  /**
   * Atualizar anúncio existente
   * @param {Number} id - ID do anúncio
   * @param {Object} dados - Dados do anúncio { data_expiracao, imagem (File opcional) }
   */
  async atualizar(id, dados) {
    try {
      // Se houver imagem, usar FormData
      if (dados.imagem instanceof File) {
        const formData = new FormData();
        if (dados.data_expiracao) {
          formData.append('data_expiracao', dados.data_expiracao);
        }
        formData.append('imagem', dados.imagem);
        return await apiService.patch(`${this.endpoint}${id}/`, formData);
      } else {
        // Sem imagem, usar JSON normal
        return await apiService.patch(`${this.endpoint}${id}/`, dados);
      }
    } catch (error) {
      console.error("Erro ao atualizar anúncio:", error);
      throw error;
    }
  }

  /**
   * Remover anúncio
   */
  async remover(id) {
    try {
      return await apiService.delete(`${this.endpoint}${id}/`);
    } catch (error) {
      console.error("Erro ao remover anúncio:", error);
      throw error;
    }
  }

  /**
   * Alternar status ativo/inativo
   */
  async toggleAtivo(id, ativo) {
    try {
      return await apiService.patch(`${this.endpoint}${id}/`, { ativo });
    } catch (error) {
      console.error("Erro ao alterar status do anúncio:", error);
      throw error;
    }
  }
}

export const anunciosService = new AnunciosService();
