import { sesionService } from '@/src/servicios/sesion';
import axios from 'axios';
export const api = axios.create({
 baseURL: process.env.EXPO_PUBLIC_API_URL ,
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