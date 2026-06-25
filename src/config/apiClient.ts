import axios from 'axios';

// Creamos la instancia con la URL base apuntando a la variable de entorno
const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000',
  headers: {

  },
});


apiClient.interceptors.request.use(
  (config) => {
    // Buscamos el token que guardamos en el AuthContext
    const token = localStorage.getItem('token_asislab');
    const guest = localStorage.getItem("guest_session_id")

    // Si el token existe, lo metemos en la cabecera Authorization
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (!token && guest) {
      config.headers["X-Guest-Session"] = guest;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default apiClient;