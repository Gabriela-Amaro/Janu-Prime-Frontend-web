// Configuração global da aplicação
export const APP_CONFIG = {
  apiUrl: "http://localhost:8000/api",
  // apiUrl: "/api",  // Relativo - funciona em dev e prod
  authEndpoints: {
    login: "/auth/token/",
    refresh: "/auth/token/refresh/",
    logout: "/auth/logout/",
    me: "/me/",
  },
  endpoints: {
    produtos: "/produtos/",
    ticketsDebito: "/tickets/debito/",
    ticketsCredito: "/tickets/credito/",
    anuncios: "/anuncios/",
    administradores: "/administradores/",
    estabelecimentos: "/estabelecimentos/",
  },
};
