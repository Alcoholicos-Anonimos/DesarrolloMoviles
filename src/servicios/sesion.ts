import * as SecureStore from 'expo-secure-store';
import { Sesion } from '../tipos';

// Nombre con el que se guarda en la "caja fuerte" del celular
const CLAVE_SESION = 'sesion';

export const sesionService = {
  // Guarda token + usuario cifrados en el dispositivo
  guardar: async (sesion: Sesion): Promise<void> => {
    await SecureStore.setItemAsync(CLAVE_SESION, JSON.stringify(sesion));
  },

  // Devuelve la sesión guardada, o null si no hay ninguna
  obtener: async (): Promise<Sesion | null> => {
    const texto = await SecureStore.getItemAsync(CLAVE_SESION);
    if (!texto) return null;
    try {
      return JSON.parse(texto) as Sesion;
    } catch {
      return null; // si el dato está corrupto, lo tratamos como "sin sesión"
    }
  },

  // Cierra la sesión: borra lo guardado
  borrar: async (): Promise<void> => {
    await SecureStore.deleteItemAsync(CLAVE_SESION);
  },
};