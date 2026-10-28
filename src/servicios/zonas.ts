
import { ApiRespuestaExitosa, Cuadrilla, Zona } from '../tipos';

import { api } from '@/api/clienteHttp';


export const zonasService = {

  listarZonas: async (): Promise<ApiRespuestaExitosa<Zona[]>> => {
    const respuesta = await api.get("zonas");
    return respuesta.data;
  },

  listarCuadrillas: async (): Promise<ApiRespuestaExitosa<Cuadrilla[]>> => {
    const resp = await api.get("cuadrillas");
    return resp.data;
  },
}