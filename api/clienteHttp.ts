import { sesionService } from '@/src/servicios/sesion';
import axios from 'axios';
export const api = axios.create({
 baseURL:"http://192.168.12.104:3000/" , ///<-- ACA PONGA LA IP DE SU COMPU, PUERTO 3000
   //process.env.EXPO_PUBLIC_API_URL
 timeout: 10_000,
 headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const sesion = await sesionService.obtener();

  if (sesion?.token) {
    config.headers.Authorization = `Bearer ${sesion.token}`;
  }

  return config;
  });