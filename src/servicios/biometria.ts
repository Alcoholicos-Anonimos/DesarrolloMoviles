import * as LocalAuthentication from 'expo-local-authentication';

// Acceso a la biometría del teléfono (huella, rostro) y al patrón/PIN del
// dispositivo, que el sistema ofrece como alternativa cuando se permite el fallback.
export const biometriaService = {
  // ¿Hay algún método de desbloqueo inscripto en el teléfono? Cubre huella,
  // rostro y también el patrón o PIN (SecurityLevel.SECRET), no solo biometría.
  hayDisponible: async (): Promise<boolean> => {
    try {
      const nivel = await LocalAuthentication.getEnrolledLevelAsync();
      return nivel !== LocalAuthentication.SecurityLevel.NONE;
    } catch {
      return false;
    }
  },

  // Pide confirmar identidad. Con disableDeviceFallback: false, si falla la
  // huella/rostro el sistema ofrece el patrón o PIN del teléfono.
  autenticar: async (mensaje: string): Promise<boolean> => {
    try {
      const resultado = await LocalAuthentication.authenticateAsync({
        promptMessage: mensaje,
        cancelLabel: 'Cancelar',
        disableDeviceFallback: false,
      });
      return resultado.success;
    } catch {
      return false;
    }
  },
};
