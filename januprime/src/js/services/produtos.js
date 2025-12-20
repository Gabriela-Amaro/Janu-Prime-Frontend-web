/**
 * Serviço de Produtos
 * Gerencia operações CRUD para produtos do estabelecimento
 */
import { apiService } from "../config/api.js";
import { APP_CONFIG } from "../config/app.js";

class ProdutosService {
  constructor() {
    this.endpoint = APP_CONFIG.endpoints.produtos;
  }

  /**
   * Listar todos os produtos do estabelecimento
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
      console.error("Erro ao listar produtos:", error);
      throw error;
    }
  }

  /**
   * Obter produto por ID
   */
  async obter(id) {
    try {
      return await apiService.get(`${this.endpoint}${id}/`);
    } catch (error) {
      console.error("Erro ao obter produto:", error);
      throw error;
    }
  }

  /**
   * Criar novo produto
   */
  async criar(dados) {
    try {
      return await apiService.post(this.endpoint, dados);
    } catch (error) {
      console.error("Erro ao criar produto:", error);
      throw error;
    }
  }

  /**
   * Criar novo produto com imagem (usando FormData)
   */
  async criarComImagem(dados, imagem) {
    try {
      const formData = new FormData();
      
      // Adicionar campos do produto
      Object.keys(dados).forEach(key => {
        if (dados[key] !== undefined && dados[key] !== null) {
          formData.append(key, dados[key]);
        }
      });
      
      // Adicionar imagem se existir
      if (imagem) {
        formData.append('imagem', imagem);
      }
      
      return await apiService.post(this.endpoint, formData);
    } catch (error) {
      console.error("Erro ao criar produto com imagem:", error);
      throw error;
    }
  }

  /**
   * Atualizar produto existente
   */
  async atualizar(id, dados) {
    try {
      return await apiService.patch(`${this.endpoint}${id}/`, dados);
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      throw error;
    }
  }

  /**
   * Atualizar produto existente com imagem (usando FormData)
   */
  async atualizarComImagem(id, dados, imagem) {
    try {
      const formData = new FormData();
      
      // Adicionar campos do produto
      Object.keys(dados).forEach(key => {
        if (dados[key] !== undefined && dados[key] !== null) {
          formData.append(key, dados[key]);
        }
      });
      
      // Adicionar imagem se existir
      if (imagem) {
        formData.append('imagem', imagem);
      }
      
      return await apiService.patch(`${this.endpoint}${id}/`, formData);
    } catch (error) {
      console.error("Erro ao atualizar produto com imagem:", error);
      throw error;
    }
  }

  /**
   * Remover produto
   */
  async remover(id) {
    try {
      return await apiService.delete(`${this.endpoint}${id}/`);
    } catch (error) {
      console.error("Erro ao remover produto:", error);
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
      console.error("Erro ao alterar status do produto:", error);
      throw error;
    }
  }
}

export const produtosService = new ProdutosService();
