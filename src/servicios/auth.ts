import { ApiRespuestaExitosa, Sesion } from '../tipos';
import { MOCK_CONTRASENAS, MOCK_USUARIOS } from '../mocks/datos';

export const authService = {
  // Valida email y contraseña (simulando una petición a la API)
  iniciarSesion: async (
    email: string,
    contrasena: string
  ): Promise<ApiRespuestaExitosa<Sesion>> => {
    await new Promise((res) => setTimeout(res, 800)); // Latencia

    const usuario = MOCK_USUARIOS.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!usuario || MOCK_CONTRASENAS[usuario.id] !== contrasena) {
      throw new Error('Email o contraseña incorrectos.');
    }

    // Token inventado: (la API real va a devolver uno propio)
    const token = `mock-token-${usuario.id}-${Date.now()}`;

    return { datos: { token, usuario } };
  },
};