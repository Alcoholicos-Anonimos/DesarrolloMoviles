import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Ionicons from '@react-native-vector-icons/ionicons';

import { Reporte, TipoDeReporte, EstadoReporte } from '../../src/tipos';
import { reportesService } from '../../src/servicios/reportes';
import { router } from 'expo-router';

// Función auxiliar para mapear el color y texto según el estado
const obtenerInfoEstado = (estado: EstadoReporte) => {
  switch (estado) {
    case 'asignado':
      return { label: 'Asignado', color: '#D97706' }; // Ámbar/Naranja
    case 'resuelto':
      return { label: 'Resuelto', color: '#16A34A' }; // Verde
    case 'rechazado':
      return { label: 'Rechazado', color: '#DC2626' }; // Rojo
    case 'en_revision':
      return { label: 'En revisión', color: '#3B82F6' }; // Azul
    case 'recibido':
    default:
      return { label: 'Recibido', color: '#9CA3AF' }; // Gris
  }
};

export default function ReclamoScreen() {
  const [reportes, setReportes] = useState<Reporte[]>([]);
  const [tipos, setTipos] = useState<TipoDeReporte[]>([]);
  const [cargando, setCargando] = useState(true);

  // Carga asíncrona desde la capa de servicios
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [respReportes, respTipos] = await Promise.all([
          reportesService.obtenerMisReportes(),
          reportesService.obtenerTipos(),
        ]);
        setReportes(respReportes.datos);
        setTipos(respTipos);
      } catch (error) {
        console.error('Error al cargar los reclamos:', error);
      } finally {
        setCargando(false);
      }
    };

    cargarDatos();
  }, []);

  // Función para obtener el tipo de reporte vinculado
  const obtenerTipo = (tipoId: string) => {
    return tipos.find((t) => t.id === tipoId);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Encabezado: Título y botón + */}
      <View style={styles.header}>
        <Text style={styles.titulo}>Mis reclamos</Text>
        <Pressable 
          style={({ pressed }) => [styles.botonAgregar, pressed && { opacity: 0.6 }]}
          onPress={() => console.log('Ir a crear reclamo')}
        >
          <Ionicons name="add" size={28} color="#FFFFFF" />
        </Pressable>
      </View>

      {/* Indicador de carga si la API / mock está respondiendo */}
      {cargando ? (
        <View style={styles.centro}>
          <ActivityIndicator size="large" color="#FFFFFF" />
        </View>
      ) : (
        <FlatList
          data={reportes}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listaContainer}
          ItemSeparatorComponent={() => <View style={styles.separador} />}
          renderItem={({ item }) => {
            const tipoInfo = obtenerTipo(item.tipoId);
            const estadoInfo = obtenerInfoEstado(item.estado);

            return (
              <Pressable 
                style={({ pressed }) => [styles.itemRow, pressed && { opacity: 0.7 }]}
                onPress={() =>
                  router.push({
                    pathname: '/[id]',
                    params: { id: item.id  },
                  })
                }
              >
                {/* Ícono dentro de cajita redondeada */}
                <View style={styles.iconoBox}>
                  <Ionicons 
                    name={(tipoInfo?.icono as any) || 'help-outline'} 
                    size={22} 
                    color={tipoInfo?.color || '#FFFFFF'} 
                  />
                </View>

                {/* Datos centrales: Título y Código */}
                <View style={styles.infoCentral}>
                  <Text style={styles.textoPrincipal} numberOfLines={1}>
                    {tipoInfo?.nombre || 'Reclamo'} - {item.direccion}
                  </Text>
                  <Text style={styles.textoCodigo}>{item.codigo}</Text>
                </View>

                {/* Badge / Etiqueta de estado a la derecha */}
                <View style={[styles.badgeEstado, { borderColor: estadoInfo.color + '40' }]}>
                  <Text style={[styles.textoBadge, { color: estadoInfo.color }]}>
                    {estadoInfo.label}
                  </Text>
                </View>
              </Pressable>
            );
          }}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
    paddingHorizontal: 20,
  },
  centro: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
  },
  titulo: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  botonAgregar: {
    padding: 6,
  },
  listaContainer: {
    paddingTop: 10,
  },
  separador: {
    height: 1,
    backgroundColor: '#262626',
    marginVertical: 4,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  iconoBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#1E1E1E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  infoCentral: {
    flex: 1,
    justifyContent: 'center',
  },
  textoPrincipal: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F3F4F6',
    marginBottom: 4,
  },
  textoCodigo: {
    fontSize: 13,
    color: '#9CA3AF',
  },
  badgeEstado: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    marginLeft: 10,
  },
  textoBadge: {
    fontSize: 13,
    fontWeight: '600',
  },
});