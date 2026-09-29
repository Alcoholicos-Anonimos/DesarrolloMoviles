import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { bandejaService } from "@/src/servicios/bandeja";
import { EstadoReporte, Reporte } from "@/src/tipos";
import {
  espaciados,
  obtenerColores,
  pesosFuente,
  radios,
  tipografia,
} from "@/styles/theme";
import { HojaInferior } from "./HojaInferior";

const ESTADOS: { valor: EstadoReporte; etiqueta: string }[] = [
  { valor: "recibido", etiqueta: "Recibido" },
  { valor: "en_revision", etiqueta: "En revisión" },
  { valor: "asignado", etiqueta: "Asignado" },
  { valor: "resuelto", etiqueta: "Resuelto" },
  { valor: "rechazado", etiqueta: "Rechazado" },
];

type Props = {
  reporte: Reporte | null; // null = panel cerrado
  operadorId: string;
  onCerrar: () => void;
  onListo: () => void;
};

export function ModalCambiarEstado({ reporte, operadorId, onCerrar, onListo }: Props) {
  const colorScheme = useColorScheme();
  const tema = colorScheme === "dark" ? "dark" : "light";
  const colores = obtenerColores(tema);
  const styles = crearStyles(tema);

  const [nuevoEstado, setNuevoEstado] = useState<EstadoReporte | null>(null);
  const [comentario, setComentario] = useState("");
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Al abrir para otro reporte, arrancamos de cero
  useEffect(() => {
    setNuevoEstado(null);
    setComentario("");
    setError(null);
  }, [reporte]);

  const guardar = async () => {
    if (!reporte) return;
    if (!nuevoEstado) {
      setError("Elegí el nuevo estado.");
      return;
    }
    if (!comentario.trim()) {
      setError("Escribí un comentario explicando el cambio.");
      return;
    }
    setError(null);
    setGuardando(true);
    try {
      await bandejaService.cambiarEstado(reporte.id, nuevoEstado, comentario, operadorId);
      onListo();
    } catch (e) {
      setError(e instanceof Error ? e.message : "No pudimos cambiar el estado.");
    } finally {
      setGuardando(false);
    }
  };

  // El rechazo lo lee el vecino: la consigna pide que diga por qué
  const placeholder =
    nuevoEstado === "rechazado"
      ? "Explicá por qué se rechaza. El vecino lo va a leer."
      : "Contá qué se hizo o por qué cambia el estado.";

  return (
    <HojaInferior
      visible={reporte !== null}
      titulo="Cambiar estado"
      subtitulo={reporte ? `${reporte.codigo} - ${reporte.direccion}` : undefined}
      onCerrar={onCerrar}
    >
      <ScrollView contentContainerStyle={styles.cuerpo} keyboardShouldPersistTaps="handled">
        <Text style={styles.seccion}>Nuevo estado</Text>
        <View style={styles.chips}>
          {ESTADOS.filter((e) => e.valor !== reporte?.estado).map((e) => {
            const activo = nuevoEstado === e.valor;
            return (
              <Pressable
                key={e.valor}
                onPress={() => {
                  setNuevoEstado(e.valor);
                  setError(null);
                }}
                style={[styles.chip, activo && styles.chipActivo]}
                accessibilityState={{ selected: activo }}
              >
                <Text style={[styles.textoChip, activo && styles.textoChipActivo]}>
                  {e.etiqueta}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <Text style={styles.seccion}>Comentario (obligatorio)</Text>
        <TextInput
          style={styles.input}
          value={comentario}
          onChangeText={(t) => {
            setComentario(t);
            setError(null);
          }}
          placeholder={placeholder}
          placeholderTextColor={colores.textoSuave}
          multiline
          textAlignVertical="top"
          editable={!guardando}
        />

        {error && <Text style={styles.textoError}>{error}</Text>}

        <Pressable
          onPress={guardar}
          disabled={guardando}
          style={({ pressed }) => [styles.boton, (pressed || guardando) && styles.presionado]}
        >
          {guardando ? (
            <ActivityIndicator color={colores.blanco} />
          ) : (
            <Text style={styles.textoBoton}>Guardar</Text>
          )}
        </Pressable>
      </ScrollView>
    </HojaInferior>
  );
}

const crearStyles = (tema: "light" | "dark") => {
  const colores = obtenerColores(tema);

  return StyleSheet.create({
    cuerpo: { gap: espaciados.medio, paddingBottom: espaciados.grande },
    seccion: { ...tipografia.tituloSeccion, color: colores.texto },
    chips: { flexDirection: "row", flexWrap: "wrap", gap: espaciados.pequeno },
    chip: {
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: radios.redondo,
      paddingVertical: 10,
      paddingHorizontal: espaciados.grande,
    },
    chipActivo: { backgroundColor: colores.primario, borderColor: colores.primario },
    textoChip: { ...tipografia.texto, color: colores.texto },
    textoChipActivo: { color: colores.blanco, fontWeight: pesosFuente.medio },
    input: {
      ...tipografia.texto,
      color: colores.texto,
      minHeight: 100,
      borderWidth: 1,
      borderColor: colores.borde,
      backgroundColor: colores.superficie,
      borderRadius: radios.pequeno,
      padding: espaciados.medio,
    },
    textoError: { ...tipografia.textoSecundario, color: colores.textoPeligro },
    boton: {
      minHeight: 48,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colores.primario,
      borderRadius: radios.redondo,
    },
    presionado: { opacity: 0.7 },
    textoBoton: { ...tipografia.texto, fontWeight: pesosFuente.medio, color: colores.blanco },
  });
};