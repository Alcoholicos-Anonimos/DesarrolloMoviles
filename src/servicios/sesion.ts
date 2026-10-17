import * as SecureStore from 'expo-secure-store';
import { Sesion } from '../tipos';

// Nombre con el que se guarda en la "caja fuerte" del celular
const CLAVE_SESION = 'sesion';

// Si el vecino activó el ingreso con huella/rostro/patrón
const CLAVE_BIOMETRIA = 'biometriaHabilitada';

// Credenciales (email + contraseña) cifradas, necesarias para relanzar el
// login biométrico cuando no hay sesión guardada (p. ej. tras cerrar sesión)
const CLAVE_CREDENCIALES = 'credencialesBiometricas';

export interface CredencialesGuardadas {
  email: string;
  contrasena: string;
}

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

  // Cierra la sesión: borra SOLO el token/usuario guardado.
  // No borra las credenciales biométricas ni el flag, para que el ingreso
  // con huella siga funcionando después de cerrar sesión.
  borrar: async (): Promise<void> => {
    await SecureStore.deleteItemAsync(CLAVE_SESION);
  },

  // Activa o desactiva el ingreso biométrico
  guardarBiometria: async (habilitada: boolean): Promise<void> => {
    if (habilitada) {
      await SecureStore.setItemAsync(CLAVE_BIOMETRIA, 'true');
    } else {
      await SecureStore.deleteItemAsync(CLAVE_BIOMETRIA);
    }
  },

  // ¿El vecino activó el ingreso biométrico?
  obtenerBiometria: async (): Promise<boolean> => {
    const valor = await SecureStore.getItemAsync(CLAVE_BIOMETRIA);
    return valor === 'true';
  },

  // Guarda las credenciales cifradas para poder relanzar el login biométrico
  guardarCredenciales: async (credenciales: CredencialesGuardadas): Promise<void> => {
    await SecureStore.setItemAsync(CLAVE_CREDENCIALES, JSON.stringify(credenciales));
  },

  // Devuelve las credenciales guardadas, o null si no hay ninguna
  obtenerCredenciales: async (): Promise<CredencialesGuardadas | null> => {
    const texto = await SecureStore.getItemAsync(CLAVE_CREDENCIALES);
    if (!texto) return null;
    try {
      return JSON.parse(texto) as CredencialesGuardadas;
    } catch {
      return null;
    }
  },

  // Borra las credenciales guardadas (si el server las rechaza, o si el
  // usuario desactiva la biometría)
  borrarCredenciales: async (): Promise<void> => {
    await SecureStore.deleteItemAsync(CLAVE_CREDENCIALES);
  },
};