import { createContext, ReactNode, useCallback, useContext, useEffect, useState } from "react";
import { Alert } from "react-native";
import { authService } from "../servicios/auth";
import { biometriaService } from "../servicios/biometria";
import { sesionService } from "../servicios/sesion";
import { NuevoUsuarioInput, Usuario } from "../tipos";

type AuthContextValor = {
  usuario: Usuario | null;
  cargandoSesion: boolean;
  iniciarSesion: (email: string, contrasena: string) => Promise<Usuario>;
  registrarse: (datos: NuevoUsuarioInput) => Promise<Usuario>;
  cerrarSesion: () => Promise<void>;
  // Ingreso con huella, rostro o patrón/PIN del teléfono
  biometriaHabilitada: boolean;
  biometriaDisponible: boolean;
  habilitarBiometria: (email: string, contrasena: string) => Promise<boolean>;
  iniciarSesionBiometrica: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextValor | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);
  const [biometriaHabilitada, setBiometriaHabilitada] = useState(false);
  const [biometriaDisponible, setBiometriaDisponible] = useState(false);

  // Limpia por completo la configuración biométrica (flag + credenciales)
  const limpiarBiometria = useCallback(async () => {
    await Promise.all([
      sesionService.guardarBiometria(false),
      sesionService.borrarCredenciales(),
    ]);
    setBiometriaHabilitada(false);
  }, []);

  // Usa las credenciales guardadas para obtener una sesión nueva del server
  const loginConCredencialesGuardadas = useCallback(async (): Promise<boolean> => {
    const credenciales = await sesionService.obtenerCredenciales();
    if (!credenciales) return false;
    try {
      const respuesta = await authService.iniciarSesion(
        credenciales.email,
        credenciales.contrasena
      );
      await sesionService.guardar(respuesta.datos);
      setUsuario(respuesta.datos.usuario);
      return true;
    } catch {
      // Server rechazó las credenciales (cambió la contraseña):
      // limpiamos todo y volvemos al login por contraseña.
      await limpiarBiometria();
      return false;
    }
  }, [limpiarBiometria]);

  // Al abrir la app: ¿había una sesión guardada o credenciales biométricas?
  useEffect(() => {
    const arrancar = async () => {
      try {
        const [sesion, habilitada, disponible, credenciales] = await Promise.all([
          sesionService.obtener(),
          sesionService.obtenerBiometria(),
          biometriaService.hayDisponible(),
          sesionService.obtenerCredenciales(),
        ]);
        setBiometriaDisponible(disponible);

        // Sin biometría disponible en el sistema: limpiar todo y seguir
        if (!disponible) {
          if (habilitada) {
            await limpiarBiometria();
          }
          setUsuario(sesion?.usuario ?? null);
          return;
        }

        if (habilitada && (sesion || credenciales)) {
          setBiometriaHabilitada(true);
          // Para entrar hay que confirmar la identidad
          const ok = await biometriaService.autenticar("Ingresá a tu cuenta");
          if (ok) {
            if (sesion) {
              setUsuario(sesion.usuario);
            } else {
              // No hay sesión (se cerró): relanzamos el login con las
              // credenciales guardadas para obtener una sesión nueva.
              await loginConCredencialesGuardadas();
            }
          }
          // Si cancela o falla, queda sin usuario: se entra con contraseña
          // o reintentando desde el botón de ingreso biométrico.
          return;
        }

        // Flag activo pero sin sesión ni credenciales: no sirve, limpiar
        if (habilitada) {
          await limpiarBiometria();
        }

        setUsuario(sesion?.usuario ?? null);
      } finally {
        setCargandoSesion(false);
      }
    };

    arrancar();
  }, [limpiarBiometria, loginConCredencialesGuardadas]);

  // Después del primer login con contraseña:
  // - Si la biometría no está activa, ofrece activarla.
  // - Si ya está activa, actualiza las credenciales guardadas para que el
  //   ingreso biométrico use siempre la última cuenta con la que se ingresó.
  const ofrecerOActualizarBiometria = async (email: string, contrasena: string) => {
    if (!biometriaDisponible) return;
    if (biometriaHabilitada) {
      await sesionService.guardarCredenciales({ email, contrasena });
      return;
    }
    Alert.alert(
      "Ingreso rápido",
      "¿Querés activar el ingreso con huella, rostro o el patrón de tu teléfono?",
      [
        { text: "Ahora no", style: "cancel" },
        { text: "Activar", onPress: () => { habilitarBiometria(email, contrasena); } },
      ],
    );
  };

  const iniciarSesion = async (email: string, contrasena: string) => {
    const respuesta = await authService.iniciarSesion(email, contrasena);
    await sesionService.guardar(respuesta.datos);
    setUsuario(respuesta.datos.usuario);
    await ofrecerOActualizarBiometria(email, contrasena);
    return respuesta.datos.usuario;
  };

  // Registrarse deja la sesión iniciada, igual que iniciarSesion
  const registrarse = async (datos: NuevoUsuarioInput) => {
    const respuesta = await authService.registrarse(datos);
    await sesionService.guardar(respuesta.datos);
    setUsuario(respuesta.datos.usuario);
    await ofrecerOActualizarBiometria(datos.email, datos.contrasena);
    return respuesta.datos.usuario;
  };

  // Cierra la sesión: borra SOLO el token/usuario. No borra las credenciales
  // biométricas ni el flag, para que el ingreso con huella siga funcionando.
  const cerrarSesion = async () => {
    await sesionService.borrar();
    setUsuario(null);
  };

  // Activa el ingreso biométrico: pide confirmar identidad y guarda las
  // credenciales cifradas + el flag, para poder relanzar el login después.
  const habilitarBiometria = async (
    email: string,
    contrasena: string
  ): Promise<boolean> => {
    const ok = await biometriaService.autenticar("Activá el ingreso rápido");
    if (!ok) return false;
    await Promise.all([
      sesionService.guardarCredenciales({ email, contrasena }),
      sesionService.guardarBiometria(true),
    ]);
    setBiometriaHabilitada(true);
    return true;
  };

  // Entra con biometría: si hay sesión guardada la restaura; si no hay
  // sesión (se cerró), relanza el login con las credenciales guardadas.
  const iniciarSesionBiometrica = async (): Promise<boolean> => {
    const ok = await biometriaService.autenticar("Ingresá a tu cuenta");
    if (!ok) return false;

    const sesion = await sesionService.obtener();
    if (sesion) {
      setUsuario(sesion.usuario);
      return true;
    }

    return loginConCredencialesGuardadas();
  };

  return (
    <AuthContext.Provider
      value={{
        usuario,
        cargandoSesion,
        iniciarSesion,
        registrarse,
        cerrarSesion,
        biometriaHabilitada,
        biometriaDisponible,
        habilitarBiometria,
        iniciarSesionBiometrica,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Hook para usar el contexto desde cualquier pantalla
export function useAuth() {
  const contexto = useContext(AuthContext);
  if (!contexto) {
    throw new Error("useAuth tiene que usarse dentro de <AuthProvider>");
  }
  return contexto;
}
