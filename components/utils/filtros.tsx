import Ionicons from "@react-native-vector-icons/ionicons";
import { useEffect, useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useColorScheme } from "@/hooks/use-color-scheme";
import {
  espaciados,
  obtenerColores,
  pesosFuente,
  radios,
  tamaniosIconos,
  tipografia,
} from "@/styles/theme";

/* ------------------------------------------------------------------ */
/* Tipos                                                               */
/* ------------------------------------------------------------------ */

export interface OpcionFiltro {
  valor: string;
  etiqueta: string;
}

/**
 * Describe un grupo de filtros (ej: Zona, Estado, Tipo).
 * `clave` es la propiedad del objeto de filtros que controla.
 */
export interface CampoFiltro<T> {
  clave: keyof T;
  etiqueta: string;
  opciones: OpcionFiltro[];
  /** Texto de la opción que limpia el filtro (valor null). Ej: "Todas las zonas" */
  textoTodos?: string;
}

/* ------------------------------------------------------------------ */
/* Botón para el encabezado (con indicador de filtros activos)         */
/* ------------------------------------------------------------------ */

interface BotonFiltrosProps {
  onPress: () => void;
  hayFiltrosActivos: boolean;
}

export function BotonFiltros({ onPress, hayFiltrosActivos }: BotonFiltrosProps) {
  const colorScheme = useColorScheme();
  const tema = colorScheme === "dark" ? "dark" : "light";
  const colores = obtenerColores(tema);

  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      accessibilityLabel={
        hayFiltrosActivos ? "Filtros (hay filtros activos)" : "Filtros"
      }
    >
      <Ionicons
        name={hayFiltrosActivos ? "options" : "options-outline"}
        size={tamaniosIconos.grande}
        color={colores.texto}
      />
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* Modal de filtros                                                    */
/* ------------------------------------------------------------------ */

interface ModalFiltrosProps<T extends object> {
  visible: boolean;
  /** Filtros aplicados actualmente */
  filtros: T;
  /** Vista por defecto; "Restablecer" vuelve a esta */
  valoresPorDefecto: T;
  /** Qué grupos de filtros mostrar */
  campos: CampoFiltro<T>[];
  titulo?: string;
  onAplicar: (filtros: T) => void;
  onCerrar: () => void;
}

export function ModalFiltros<T extends object>({
  visible,
  filtros,
  valoresPorDefecto,
  campos,
  titulo = "Filtros",
  onAplicar,
  onCerrar,
}: ModalFiltrosProps<T>) {
  const colorScheme = useColorScheme();
  const tema = colorScheme === "dark" ? "dark" : "light";
  const colores = obtenerColores(tema);
  const styles = crearStyles(tema);
  const insets = useSafeAreaInsets();

  // Borrador: los cambios no se aplican hasta tocar "Aplicar"
  const [borrador, setBorrador] = useState<T>(filtros);

  // Cada vez que se abre, arranca desde los filtros vigentes
  useEffect(() => {
    if (visible) setBorrador(filtros);
  }, [visible, filtros]);

  const elegir = (clave: keyof T, valor: string | null) =>
    setBorrador((previo) => ({ ...previo, [clave]: valor }));

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCerrar}
    >
      <Pressable
        style={styles.fondo}
        onPress={onCerrar}
        accessibilityLabel="Cerrar filtros"
      />

      <View style={[styles.hoja, { paddingBottom: insets.bottom + espaciados.grande }]}>
        <View style={styles.encabezado}>
          <Text style={styles.titulo}>{titulo}</Text>
          <Pressable onPress={onCerrar} hitSlop={8} accessibilityLabel="Cerrar">
            <Ionicons name="close" size={tamaniosIconos.grande} color={colores.texto} />
          </Pressable>
        </View>

        <ScrollView contentContainerStyle={styles.contenido}>
          {campos.map((campo) => {
            const seleccionado = borrador[campo.clave] as string | null;

            return (
              <View key={String(campo.clave)} style={styles.grupo}>
                <Text style={styles.etiquetaGrupo}>{campo.etiqueta}</Text>
                <View style={styles.opciones}>
                  {campo.textoTodos && (
                    <Chip
                      texto={campo.textoTodos}
                      activo={seleccionado === null}
                      onPress={() => elegir(campo.clave, null)}
                      styles={styles}
                    />
                  )}
                  {campo.opciones.map((opcion) => (
                    <Chip
                      key={opcion.valor}
                      texto={opcion.etiqueta}
                      activo={seleccionado === opcion.valor}
                      onPress={() => elegir(campo.clave, opcion.valor)}
                      styles={styles}
                    />
                  ))}
                </View>
              </View>
            );
          })}
        </ScrollView>

        <View style={styles.filaBotones}>
          <Pressable
            style={({ pressed }) => [styles.botonSecundario, pressed && styles.presionado]}
            onPress={() => setBorrador(valoresPorDefecto)}
          >
            <Text style={styles.textoBotonSecundario}>Restablecer</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.botonPrimario, pressed && styles.presionado]}
            onPress={() => onAplicar(borrador)}
          >
            <Text style={styles.textoBotonPrimario}>Aplicar</Text>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

/* ------------------------------------------------------------------ */
/* Chip de opción                                                      */
/* ------------------------------------------------------------------ */

interface ChipProps {
  texto: string;
  activo: boolean;
  onPress: () => void;
  styles: ReturnType<typeof crearStyles>;
}

function Chip({ texto, activo, onPress, styles }: ChipProps) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityState={{ selected: activo }}
      style={[styles.chip, activo && styles.chipActivo]}
    >
      <Text style={[styles.textoChip, activo && styles.textoChipActivo]}>
        {texto}
      </Text>
    </Pressable>
  );
}

/* ------------------------------------------------------------------ */
/* Estilos                                                             */
/* ------------------------------------------------------------------ */

const crearStyles = (colorScheme: "light" | "dark") => {
  const colores = obtenerColores(colorScheme);

  return StyleSheet.create({
    fondo: {
      flex: 1,
      backgroundColor: "rgba(0,0,0,0.4)",
    },
    hoja: {
      backgroundColor: colores.fondo,
      borderTopLeftRadius: radios.medio,
      borderTopRightRadius: radios.medio,
      paddingHorizontal: espaciados.extraGrande,
      paddingTop: espaciados.grande,
      maxHeight: "80%",
      gap: espaciados.grande,
    },
    encabezado: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    titulo: {
      ...tipografia.titulo,
      color: colores.texto,
    },
    contenido: {
      gap: espaciados.extraGrande,
    },
    grupo: {
      gap: espaciados.pequeno,
    },
    etiquetaGrupo: {
      ...tipografia.tituloSeccion,
      color: colores.texto,
    },
    opciones: {
      flexDirection: "row",
      flexWrap: "wrap",
      gap: espaciados.pequeno,
    },
    chip: {
      minHeight: 40,
      justifyContent: "center",
      paddingHorizontal: espaciados.medio,
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: radios.redondo,
      backgroundColor: colores.superficie,
    },
    chipActivo: {
      backgroundColor: colores.primario,
      borderColor: colores.primario,
    },
    textoChip: {
      ...tipografia.textoSecundario,
      color: colores.texto,
    },
    textoChipActivo: {
      color: colores.blanco,
      fontWeight: pesosFuente.seminegrita,
    },
    filaBotones: {
      flexDirection: "row",
      gap: espaciados.pequeno,
    },
    botonSecundario: {
      flex: 1,
      minHeight: 44,
      justifyContent: "center",
      alignItems: "center",
      borderWidth: 1,
      borderColor: colores.borde,
      borderRadius: radios.pequeno,
    },
    textoBotonSecundario: {
      ...tipografia.texto,
      fontWeight: pesosFuente.medio,
      color: colores.texto,
    },
    botonPrimario: {
      flex: 1,
      minHeight: 44,
      justifyContent: "center",
      alignItems: "center",
      backgroundColor: colores.primario,
      borderRadius: radios.pequeno,
    },
    textoBotonPrimario: {
      ...tipografia.texto,
      fontWeight: pesosFuente.medio,
      color: colores.blanco,
    },
    presionado: { opacity: 0.6 },
  });
};
