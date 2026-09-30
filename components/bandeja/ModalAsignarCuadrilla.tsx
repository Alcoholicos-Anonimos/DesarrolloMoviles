import Ionicons from "@react-native-vector-icons/ionicons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { bandejaService } from "@/src/servicios/bandeja";
import { Cuadrilla, Reporte } from "@/src/tipos";
import {
  espaciados,
  obtenerColores,
  pesosFuente,
  radios,
  tipografia,
  tamaniosIconos,
} from "@/styles/theme";
import { HojaInferior } from "./HojaInferior";

type Props = {
  reporte: Reporte | null; // null = panel cerrado
  operadorId: string;
  onCerrar: () => void;
  onListo: () => void; // se llama después de asignar, para recargar la bandeja
};

export function ModalAsignarCuadrilla({ reporte, operadorId, onCerrar, onListo }: Props) {
  const colorScheme = useColorScheme();
  const tema = colorScheme === "dark" ? "dark" : "light";
  const colores = obtenerColores(tema);
  const styles = crearStyles(tema);

  const [cuadrillas, setCuadrillas] = useState<Cuadrilla[]>([]);
  const [cargando, setCargando] = useState(false);
  const [guardandoId, setGuardandoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Cada vez que se abre para un reporte, trae las cuadrillas activas de SU zona
  useEffect(() => {
    if (!reporte) return;
    setError(null);
    setCargando(true);
    bandejaService
      .obtenerCuadrillas(reporte.zonaId)
      .then(setCuadrillas)
      .catch(() => setError("No pudimos cargar las cuadrillas."))
      .finally(() => setCargando(false));
  }, [reporte]);

  const asignar = async (cuadrilla: Cuadrilla) => {
    if (!reporte) return;
    setError(null);
    setGuardandoId(cuadrilla.id);
    try {
      await bandejaService.asignarCuadrilla(reporte.id, cuadrilla.id, operadorId);
      onListo();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos asignar la cuadrilla.");
    } finally {
      setGuardandoId(null);
    }
  };

  return (
    <HojaInferior
      visible={reporte !== null}
      titulo="Asignar cuadrilla"
      subtitulo={reporte ? `${reporte.codigo} - ${reporte.direccion}` : undefined}
      onCerrar={onCerrar}
    >
      {cargando ? (
        <ActivityIndicator style={styles.espacio} />
      ) : (
        <ScrollView contentContainerStyle={styles.lista}>
          {cuadrillas.length === 0 && !error && (
            <Text style={styles.textoVacio}>No hay cuadrillas activas en esta zona.</Text>
          )}

          {cuadrillas.map((c) => {
            const esLaActual = reporte?.cuadrillaId === c.id;
            return (
              <Pressable
                key={c.id}
                onPress={() => asignar(c)}
                disabled={guardandoId !== null}
                style={({ pressed }) => [
                  styles.fila,
                  esLaActual && styles.filaActual,
                  pressed && styles.presionado,
                ]}
              >
                <View style={styles.textosFila}>
                  <Text style={styles.nombre}>{c.nombre}</Text>
                  <Text style={styles.especialidad}>{c.especialidad}</Text>
                </View>
                {guardandoId === c.id ? (
                  <ActivityIndicator />
                ) : esLaActual ? (
                  <Ionicons name="checkmark-circle" size={tamaniosIconos.medio} color={colores.texto} />
                ) : (
                  <Ionicons name="chevron-forward" size={tamaniosIconos.medio} color={colores.textoSecundario} />
                )}
              </Pressable>
            );
          })}

          {error && <Text style={styles.textoError}>{error}</Text>}
        </ScrollView>
      )}
    </HojaInferior>
  );
}

const crearStyles = (tema: "light" | "dark") => {
  const colores = obtenerColores(tema);

  return StyleSheet.create({
    espacio: { marginVertical: espaciados.enorme },
    lista: { gap: espaciados.pequeno, paddingBottom: espaciados.grande },
    fila: {
      flexDirection: "row",
      alignItems: "center",
      minHeight: 56,
      paddingHorizontal: espaciados.medio,
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: radios.medio,
      gap: espaciados.medio,
    },
    filaActual: { backgroundColor: colores.superficie },
    presionado: { opacity: 0.6 },
    textosFila: { flex: 1, gap: 2 },
    nombre: { ...tipografia.texto, fontWeight: pesosFuente.medio, color: colores.texto },
    especialidad: { ...tipografia.textoPequeno, color: colores.textoSecundario },
    textoVacio: { ...tipografia.texto, color: colores.textoSecundario, textAlign: "center" },
    textoError: { ...tipografia.textoSecundario, color: colores.textoPeligro, textAlign: "center" },
  });
};