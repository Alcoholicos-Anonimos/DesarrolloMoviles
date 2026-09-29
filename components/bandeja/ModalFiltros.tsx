import Ionicons from "@react-native-vector-icons/ionicons";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { FiltrosBandeja } from "@/src/servicios/bandeja";
import { EstadoReporte, TipoDeReporte, Zona } from "@/src/tipos";
import {
  espaciados,
  obtenerColores,
  pesosFuente,
  radios,
  tipografia,
} from "@/styles/theme";

const ESTADOS: { valor: EstadoReporte; etiqueta: string }[] = [
  { valor: "recibido", etiqueta: "Recibido" },
  { valor: "en_revision", etiqueta: "En revisión" },
  { valor: "asignado", etiqueta: "Asignado" },
  { valor: "resuelto", etiqueta: "Resuelto" },
  { valor: "rechazado", etiqueta: "Rechazado" },
];

type Props = {
  visible: boolean;
  filtros: FiltrosBandeja;
  zonaPorDefecto: string | null;
  tipos: TipoDeReporte[];
  zonas: Zona[];
  onAplicar: (filtros: FiltrosBandeja) => void;
  onCerrar: () => void;
};

export function ModalFiltros({
  visible,
  filtros,
  zonaPorDefecto,
  tipos,
  zonas,
  onAplicar,
  onCerrar,
}: Props) {
  const colorScheme = useColorScheme();
  const tema = colorScheme === "dark" ? "dark" : "light";
  const colores = obtenerColores(tema);
  const styles = crearStyles(tema);

  // Copia de trabajo: los cambios se aplican recién al tocar "Aplicar"
  const [borrador, setBorrador] = useState<FiltrosBandeja>(filtros);

  useEffect(() => {
    if (visible) setBorrador(filtros);
  }, [visible, filtros]);

  const limpiar = () =>
    setBorrador({ zonaId: zonaPorDefecto, estado: null, tipoId: null });

  const chip = (clave: string, etiqueta: string, activo: boolean, onPress: () => void) => (
    <Pressable
      key={clave}
      onPress={onPress}
      style={[styles.chip, activo && styles.chipActivo]}
      accessibilityState={{ selected: activo }}
    >
      <Text style={[styles.textoChip, activo && styles.textoChipActivo]}>{etiqueta}</Text>
    </Pressable>
  );

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onCerrar}>
      <View style={styles.contenedor}>
        {/* Tocar afuera cierra el panel */}
        <Pressable style={StyleSheet.absoluteFill} onPress={onCerrar} />

        <View style={styles.hoja}>
          <View style={styles.encabezado}>
            <Text style={styles.titulo}>Filtros</Text>
            <Pressable onPress={onCerrar} hitSlop={8} accessibilityLabel="Cerrar filtros">
              <Ionicons name="close" size={26} color={colores.texto} />
            </Pressable>
          </View>

          <ScrollView contentContainerStyle={styles.cuerpo}>
            <Text style={styles.seccion}>Estado</Text>
            <View style={styles.chips}>
              {chip("estado-todos", "Todos", borrador.estado === null, () =>
                setBorrador({ ...borrador, estado: null })
              )}
              {ESTADOS.map((e) =>
                chip(e.valor, e.etiqueta, borrador.estado === e.valor, () =>
                  setBorrador({ ...borrador, estado: e.valor })
                )
              )}
            </View>

            <Text style={styles.seccion}>Tipo</Text>
            <View style={styles.chips}>
              {chip("tipo-todos", "Todos", borrador.tipoId === null, () =>
                setBorrador({ ...borrador, tipoId: null })
              )}
              {tipos.map((t) =>
                chip(t.id, t.nombre, borrador.tipoId === t.id, () =>
                  setBorrador({ ...borrador, tipoId: t.id })
                )
              )}
            </View>

            <Text style={styles.seccion}>Zona</Text>
            <View style={styles.chips}>
              {chip("zona-todas", "Todas", borrador.zonaId === null, () =>
                setBorrador({ ...borrador, zonaId: null })
              )}
              {zonas.map((z) =>
                chip(z.id, z.nombre, borrador.zonaId === z.id, () =>
                  setBorrador({ ...borrador, zonaId: z.id })
                )
              )}
            </View>
          </ScrollView>

          <View style={styles.filaBotones}>
            <Pressable style={styles.botonSecundario} onPress={limpiar}>
              <Text style={styles.textoBotonSecundario}>Limpiar</Text>
            </Pressable>
            <Pressable style={styles.botonPrimario} onPress={() => onAplicar(borrador)}>
              <Text style={styles.textoBotonPrimario}>Aplicar</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const crearStyles = (tema: "light" | "dark") => {
  const colores = obtenerColores(tema);

  return StyleSheet.create({
    contenedor: {
      flex: 1,
      justifyContent: "flex-end",
      backgroundColor: colores.fondoModal,
    },
    hoja: {
      backgroundColor: colores.fondo,
      borderTopLeftRadius: radios.grande,
      borderTopRightRadius: radios.grande,
      padding: espaciados.extraGrande,
      maxHeight: "80%",
      gap: espaciados.grande,
    },
    encabezado: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    titulo: { ...tipografia.titulo, color: colores.texto },
    cuerpo: { gap: espaciados.medio },
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
    filaBotones: { flexDirection: "row", gap: espaciados.pequeno },
    botonSecundario: {
      flex: 1,
      minHeight: 48,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: radios.redondo,
    },
    textoBotonSecundario: {
      ...tipografia.texto,
      fontWeight: pesosFuente.medio,
      color: colores.texto,
    },
    botonPrimario: {
      flex: 1,
      minHeight: 48,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colores.primario,
      borderRadius: radios.redondo,
    },
    textoBotonPrimario: {
      ...tipografia.texto,
      fontWeight: pesosFuente.medio,
      color: colores.blanco,
    },
  });
};