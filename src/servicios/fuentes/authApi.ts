import { api } from '../../../api/clienteHttp';
import { NuevoUsuarioInput } from '../../tipos';
import { FuenteAuth } from './FuenteAuth';

export const authApi: FuenteAuth = {
  async iniciarSesion(email, contrasena) {
    const resp = await api.post('/auth/ingreso', { email, contrasena });
    //console.error(resp);
    return resp.data;
  },

  async registrarse(datos: NuevoUsuarioInput) {
    const resp = await api.post('/auth/registro', datos);
    return resp.data;
  },
};