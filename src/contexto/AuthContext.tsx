import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { authService } from "../servicios/auth";
import { sesionService } from "../servicios/sesion";
import { Usuario } from "../tipos";

type AuthContextValor = {
  usuario: Usuario | null;
  cargandoSesion: boolean;
  iniciarSesion: (email: string, contrasena: string) => Promise<Usuario>;
  cerrarSesion: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValor | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [cargandoSesion, setCargandoSesion] = useState(true);

  // Al abrir la app: ¿había una sesión guardada?
  useEffect(() => {
    sesionService
      .obtener()
      .then((sesion) => setUsuario(sesion?.usuario ?? null))
      .finally(() => setCargandoSesion(false));
  }, []);

  const iniciarSesion = async (email: string, contrasena: string) => {
    const respuesta = await authService.iniciarSesion(email, contrasena);
    await sesionService.guardar(respuesta.datos);
    setUsuario(respuesta.datos.usuario);
    return respuesta.datos.usuario;
  };

  const cerrarSesion = async () => {
    await sesionService.borrar();
    setUsuario(null);
  };

  return (
    <AuthContext.Provider
      value={{ usuario, cargandoSesion, iniciarSesion, cerrarSesion }}
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