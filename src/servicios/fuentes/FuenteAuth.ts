import { ApiRespuestaExitosa, NuevoUsuarioInput, Sesion } from '../../tipos';

// El "contrato": toda fuente de autenticación (mock o API) tiene que tener estas funciones.
// Si a una le falta alguna, TypeScript avisa.
export interface FuenteAuth {
  iniciarSesion: (email: string, contrasena: string) => Promise<ApiRespuestaExitosa<Sesion>>;
  registrarse: (datos: NuevoUsuarioInput) => Promise<ApiRespuestaExitosa<Sesion>>;
}