import { ApiRespuestaExitosa, Usuario } from '../tipos';
import { MOCK_CONTRASENAS, MOCK_USUARIOS } from '../mocks/datos';

export const authService = {
    iniciarSesion: async (
    email: string,
    contrasena: string
  ): Promise<ApiRespuestaExitosa<Usuario>> => {
    await new Promise((res) => setTimeout(res, 800)); // Latencia

    const usuario = MOCK_USUARIOS.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!usuario || MOCK_CONTRASENAS[usuario.id] !== contrasena) {
      throw new Error('Email o contraseña incorrectos.');
    }

    return { datos: usuario };
  },
};