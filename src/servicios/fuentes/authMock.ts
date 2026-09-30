import { MOCK_CONTRASENAS, MOCK_USUARIOS } from '../../mocks/datos';
import { Usuario } from '../../tipos';
import { FuenteAuth } from './FuenteAuth';

// Fuente de autenticación con datos de prueba (hasta que la cátedra nos dé la API)

const esperar = () => new Promise((res) => setTimeout(res, 800)); // Latencia simulada

// Token inventado: la API real va a devolver uno propio
const crearToken = (usuarioId: string) => `mock-token-${usuarioId}-${Date.now()}`;

export const authMock: FuenteAuth = {
  iniciarSesion: async (email, contrasena) => {
    await esperar();

    const usuario = MOCK_USUARIOS.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (!usuario || MOCK_CONTRASENAS[usuario.id] !== contrasena) {
      throw new Error('Email o contraseña incorrectos.');
    }

    return { datos: { token: crearToken(usuario.id), usuario } };
  },

  registrarse: async (datos) => {
    await esperar();

    const email = datos.email.trim().toLowerCase();
    if (MOCK_USUARIOS.some((u) => u.email.toLowerCase() === email)) {
      throw new Error('Ya existe una cuenta con ese email.');
    }

    // Todo usuario nuevo es vecino. A operador lo pasa un admin
    const usuario: Usuario = {
      id: `usr-${Date.now()}`,
      nombre: datos.nombre.trim(),
      email,
      telefono: datos.telefono,
      rol: 'vecino',
      zonaId: null,
      avisosActivos: true,
      creadoEn: new Date().toISOString(),
    };

    MOCK_USUARIOS.push(usuario);
    MOCK_CONTRASENAS[usuario.id] = datos.contrasena;

    return { datos: { token: crearToken(usuario.id), usuario } };
  },
};