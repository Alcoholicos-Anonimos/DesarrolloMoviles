import { FuenteAuth } from './fuentes/FuenteAuth';
import { authMock } from './fuentes/authMock';
// Cuando llegue la API:
// import { authApi } from './fuentes/authApi';

// Acá se elige de dónde salen los datos. Para pasar a la API se cambia solo esta línea.
export const authService: FuenteAuth = authMock;