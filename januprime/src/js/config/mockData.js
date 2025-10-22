// Dados mockados para demonstração
export const mockData = {
  produtos: [
    { id: 1, nome: "Pizza Grande", descricao: "Qualquer sabor do cardápio", pontos: 2000, ativo: true },
    { id: 2, nome: "Refrigerante 2L", descricao: "Qualquer sabor", pontos: 500, ativo: true },
    { id: 3, nome: "Pizza Média", descricao: "Qualquer sabor do cardápio", pontos: 1500, ativo: false },
    { id: 4, nome: "Pizza Broto", descricao: "Pizza pequena para 1 pessoa", pontos: 800, ativo: true },
    { id: 5, nome: "Coca-Cola 350ml", descricao: "Lata de refrigerante", pontos: 300, ativo: true },
    { id: 6, nome: "Pizza Família", descricao: "Pizza grande para toda família", pontos: 3000, ativo: true },
    { id: 7, nome: "Água Mineral", descricao: "Garrafa de água 500ml", pontos: 200, ativo: true },
    { id: 8, nome: "Pizza Especial", descricao: "Pizza com ingredientes premium", pontos: 2500, ativo: true },
    { id: 9, nome: "Suco Natural", descricao: "Suco de frutas natural", pontos: 400, ativo: false },
    { id: 10, nome: "Pizza Doce", descricao: "Pizza de sobremesa", pontos: 1800, ativo: true },
    { id: 11, nome: "Cerveja 350ml", descricao: "Lata de cerveja", pontos: 600, ativo: true },
    { id: 12, nome: "Pizza Vegetariana", descricao: "Pizza sem carne", pontos: 2200, ativo: true }
  ],
  funcionarios: [
    { id: 1, nome: "Maria Santos", email: "maria@pizzariasaborlocal.com", cargo: "funcionario", ativo: true },
    { id: 2, nome: "Pedro Costa", email: "pedro@pizzariasaborlocal.com", cargo: "gerente", ativo: true }
  ],
  transacoes: [
    { id: 1, tipo: "credito", cliente: "Ana Silva", valor: 1500, pontos: 150, status: "aprovado", data: "2024-01-15" },
    { id: 2, tipo: "debito", cliente: "Carlos Lima", produto: "Pizza Grande", pontos: 2000, status: "pendente", data: "2024-01-14" },
    { id: 3, tipo: "credito", cliente: "Maria Santos", valor: 2500, pontos: 250, status: "pendente", data: "2024-01-16" },
    { id: 4, tipo: "debito", cliente: "João Oliveira", produto: "Refrigerante 2L", pontos: 500, status: "pendente", data: "2024-01-16" },
    { id: 5, tipo: "credito", cliente: "Pedro Costa", valor: 3200, pontos: 320, status: "pendente", data: "2024-01-17" },
    { id: 6, tipo: "debito", cliente: "Lucia Ferreira", produto: "Pizza Média", pontos: 1500, status: "pendente", data: "2024-01-17" }
  ],
  anuncios: [
    { id: 1, titulo: "Promoção Pizza Grande", descricao: "Pizza grande por apenas 2000 pontos!", ativo: true, dataInicio: "2025-01-01", dataFim: "2025-01-31" },
    { id: 2, titulo: "Desconto Refrigerante", descricao: "Refrigerante 2L com 20% de desconto em pontos", ativo: true, dataInicio: "2025-01-15", dataFim: "2025-02-15" },
    { id: 3, titulo: "Pizza Família Especial", descricao: "Pizza família com ingredientes premium", ativo: false, dataInicio: "2025-01-10", dataFim: "2025-01-20" },
    { id: 4, titulo: "Promoção de Verão", descricao: "Todas as pizzas com desconto especial", ativo: true, dataInicio: "2025-01-20", dataFim: "2025-03-20" },
    { id: 5, titulo: "Anúncio Expirado", descricao: "Este anúncio já expirou", ativo: true, dataInicio: "2024-12-01", dataFim: "2024-12-31" },
    { id: 6, titulo: "Promoção de Hoje", descricao: "Anúncio que começou hoje", ativo: true, dataInicio: new Date().toISOString().split('T')[0], dataFim: "2025-02-28" },
    { id: 7, titulo: "Anúncio da Semana", descricao: "Anúncio criado esta semana", ativo: true, dataInicio: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], dataFim: "2025-03-15" }
  ]
};
