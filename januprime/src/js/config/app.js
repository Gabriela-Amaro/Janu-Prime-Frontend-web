// Configuração global da aplicação
export const APP_CONFIG = {
  apiUrl: "http://localhost:8000/api", // URL base da API
  authEndpoints: {
    login: "/auth/token/",
    refresh: "/auth/token/refresh/",
    logout: "/auth/logout/",
    me: "/me/",
  },
};
