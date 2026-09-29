import Ionicons from "@react-native-vector-icons/ionicons";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { bandejaService } from "@/src/servicios/bandeja";
import { Reporte, TipoDeReporte } from "@/src/tipos";
import { distanciaEnMetros, formatearDistancia } from "@/src/utilidades/geo";
import {
  espaciados,
  obtenerColores,
  pesosFuente,
  radios,
  tipografia,
} from "@/styles/theme";
import { HojaInferior } from "./HojaInferior";

type Candidato = { reporte: Reporte; metros: number };

type Props = {
  reporte: Reporte | null; // el que se va a marcar como duplicado (null = cerrado)
  tipos: TipoDeReporte[];
  operadorId: string;
  onCerrar: () => void;
  onListo: () => void;
};

export function ModalDuplicado({ reporte, tipos, operadorId, onCerrar, onListo }: Props) {
  const colorScheme = useColorScheme();
  const tema = colorScheme === "dark" ? "dark" : "light";
  const colores = obtenerColores(tema);
  const styles = crearStyles(tema);

  const [candidatos, setCandidatos] = useState<Candidato[]>([]);
  const [cargando, setCargando] = useState(false);
  const [guardandoId, setGuardandoId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Busca posibles "originales": misma zona, que no sean este ni otro duplicado.
  // Los más cercanos primero.
  useEffect(() => {
    if (!reporte) return;
    setError(null);
    setCargando(true);
    bandejaService
      .listar({ zonaId: reporte.zonaId, estado: null, tipoId: null })
      .then((resp) => {
        const lista = resp.datos
          .filter((r) => r.id !== reporte.id && r.duplicadoDe === null)
          .map((r) => ({
            reporte: r,
            metros: distanciaEnMetros(reporte.coordenadas, r.coordenadas),
          }))
          .sort((a, b) => a.metros - b.metros);
        setCandidatos(lista);
      })
      .catch(() => setError("No pudimos cargar los reportes."))
      .finally(() => setCargando(false));
  }, [reporte]);

  const marcar = async (original: Reporte) => {
    if (!reporte) return;
    setError(null);
    setGuardandoId(original.id);
    try {
      await bandejaService.marcarDuplicado(reporte.id, original.id, operadorId);
      onListo();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos marcar el duplicado.");
    } finally {
      setGuardandoId(null);
    }
  };

  // Es una acción importante: pedimos confirmación
  const confirmar = (original: Reporte) => {
    if (!reporte) return;
    Alert.alert(
      "Marcar como duplicado",
      `¿${reporte.codigo} es el mismo problema que ${original.codigo}? El reporte va a quedar Rechazado.`,
      [
        { text: "Cancelar", style: "cancel" },
        { text: "Sí, es duplicado", onPress: () => marcar(original) },
      ]
    );
  };

  return (
    <HojaInferior
      visible={reporte !== null}
      titulo="¿Duplicado de cuál?"
      subtitulo={reporte ? `${reporte.codigo} - ${reporte.direccion}` : undefined}
      onCerrar={onCerrar}
    >
      {cargando ? (
        <ActivityIndicator style={styles.espacio} />
      ) : (
        <ScrollView contentContainerStyle={styles.lista}>
          {candidatos.length === 0 && !error && (
            <Text style={styles.textoVacio}>No hay otros reportes en esta zona.</Text>
          )}

          {candidatos.map(({ reporte: r, metros }) => {
            const tipo = tipos.find((t) => t.id === r.tipoId);
            const mismoTipo = r.tipoId === reporte?.tipoId;
            return (
              <Pressable
                key={r.id}
                onPress={() => confirmar(r)}
                disabled={guardandoId !== null}
                style={({ pressed }) => [styles.fila, pressed && styles.presionado]}
              >
                <View style={styles.textosFila}>
                  <Text style={styles.nombre} numberOfLines={1}>
                    {tipo?.nombre ?? "Reporte"} - {r.direccion}
                  </Text>
                  <Text style={styles.detalle}>
                    {r.codigo} · a {formatearDistancia(metros)}
                    {mismoTipo ? " · mismo tipo" : ""}
                  </Text>
                </View>
                {guardandoId === r.id ? (
                  <ActivityIndicator />
                ) : (
                  <Ionicons name="chevron-forward" size={20} color={colores.textoSecundario} />
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
      paddingVertical: espaciados.pequeno,
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: radios.medio,
      gap: espaciados.medio,
    },
    presionado: { opacity: 0.6 },
    textosFila: { flex: 1, gap: 2 },
    nombre: { ...tipografia.texto, fontWeight: pesosFuente.medio, color: colores.texto },
    detalle: { ...tipografia.textoPequeno, color: colores.textoSecundario },
    textoVacio: { ...tipografia.texto, color: colores.textoSecundario, textAlign: "center" },
    textoError: { ...tipografia.textoSecundario, color: colores.textoPeligro, textAlign: "center" },
  });
};
