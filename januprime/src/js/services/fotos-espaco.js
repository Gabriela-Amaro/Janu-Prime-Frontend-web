/**
 * Serviço de Fotos do Espaço
 * Gerencia operações CRUD para fotos do estabelecimento
 */
import { apiService } from "../config/api.js";

class FotosEspacoService {
  constructor() {
    this.endpoint = "/fotos-espaco/";
  }

  /**
   * Listar todas as fotos do estabelecimento
   */
  async listar() {
    try {
      return await apiService.get(this.endpoint);
    } catch (error) {
      console.error("Erro ao listar fotos:", error);
      throw error;
    }
  }

  /**
   * Obter foto por ID
   */
  async obter(id) {
    try {
      return await apiService.get(`${this.endpoint}${id}/`);
    } catch (error) {
      console.error("Erro ao obter foto:", error);
      throw error;
    }
  }

  /**
   * Criar nova foto (upload)
   */
  async criar(foto) {
    try {
      const formData = new FormData();
      formData.append('foto', foto);
      
      return await apiService.post(this.endpoint, formData);
    } catch (error) {
      console.error("Erro ao criar foto:", error);
      throw error;
    }
  }

  /**
   * Remover foto
   */
  async remover(id) {
    try {
      return await apiService.delete(`${this.endpoint}${id}/`);
    } catch (error) {
      console.error("Erro ao remover foto:", error);
      throw error;
    }
  }
}

export const fotosEspacoService = new FotosEspacoService();
