import { useState } from 'react';
import { Alert, FlatList, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores, estilos, tam } from '../estilos';
import { useDatos } from '../datos';
import Formulario from './Formulario';
import { filtrar } from '../copia';
import PanelFiltros, { aplicarFiltros, BotonFiltros, Pastillas, valoresFiltros } from './Filtros';
import { t } from '../idioma';

function confirmar(mensaje, accion) {
  if (Platform.OS === 'web') {
    if (window.confirm(mensaje)) accion();
    return;
  }
  Alert.alert(t('Confirmar'), mensaje, [
    { text: t('Cancelar'), style: 'cancel' },
    { text: t('Borrar'), style: 'destructive', onPress: accion },
  ]);
}

export default function ListaEditable({ tipo, titulo, icono, textoNuevo, tituloNuevo, tituloEditar, campos, nuevo, items, renderTitulo, renderTexto, renderDato, avisoBorrar, filtros = [], resumen, accion, ayuda }) {
  const { guardar, borrar } = useDatos();
  const [editando, setEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const [elegidos, setElegidos] = useState({});
  const [panel, setPanel] = useState(false);
  const usables = filtros.filter((f) => f.opciones.length > 1);
  const valores = valoresFiltros(filtros, elegidos);
  const activos = usables.filter((f) => valores[f.clave] !== 'todas').length;
  const filtrados = aplicarFiltros(items, usables, valores);
  const visibles = filtrar(filtrados, busqueda, (x) => [renderTitulo(x), ...renderTexto(x)].filter(Boolean).join(' '));
  const verBarra = items.length > 3 || usables.length > 0;

  function cambiar(clave, id) {
    setElegidos({ ...elegidos, [clave]: id });
  }

  function limpiar() {
    const vacios = {};
    usables.forEach((f) => (vacios[f.clave] = 'todas'));
    setElegidos(vacios);
  }

  return (
    <View style={estilos.pantalla}>
      <View style={[estilos.fila, { justifyContent: 'space-between', marginBottom: 14 }]}>
        <Text style={[estilos.titulo, { marginBottom: 0 }]} accessibilityRole="header">{titulo}</Text>
        {accion}
      </View>
      {verBarra ? (
        <View style={[estilos.fila, { gap: 8, marginBottom: 10 }]}>
          <View style={[estilos.fila, estilos.input, { flex: 1, gap: 8, height: 44 }]}>
            <Ionicons name="search" size={18} color={colores.gris} />
            <TextInput
              style={{ flex: 1, height: 40, fontSize: tam(15), color: colores.texto, outlineStyle: 'none' }}
              value={busqueda}
              onChangeText={setBusqueda}
              accessibilityLabel={t('Buscar')}
              placeholder={t('Buscar')}
              placeholderTextColor={colores.gris}
            />
            {busqueda ? (
              <Pressable onPress={() => setBusqueda('')} hitSlop={10} accessibilityRole="button" accessibilityLabel={t('Borrar busqueda')}>
                <Ionicons name="close-circle" size={18} color={colores.gris} />
              </Pressable>
            ) : null}
          </View>
          {usables.length ? <BotonFiltros cuantos={activos} onPress={() => setPanel(true)} /> : null}
        </View>
      ) : null}
      <Pastillas filtros={usables} valores={valores} onQuitar={(clave) => cambiar(clave, 'todas')} />
      {resumen && visibles.length ? <Text style={[estilos.tarjetaTexto, { marginTop: 0, marginBottom: 10 }]}>{resumen(visibles)}</Text> : null}
      <FlatList
        data={visibles}
        keyExtractor={(x) => x.id}
        style={{ flex: 1 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Ionicons name={(icono || 'leaf') + '-outline'} size={48} color={colores.borde} />
            <Text style={[estilos.vacio, { marginTop: 10 }]}>{t(items.length ? 'No hay resultados con estos filtros.' : 'Todavia no hay nada. Pulsa el boton de abajo.')}</Text>
          </View>
        }
        renderItem={({ item }) => {
          const dato = renderDato ? renderDato(item) : null;
          return (
            <Pressable accessibilityRole="button" style={estilos.tarjeta} onPress={() => setEditando(item)}>
              <View style={[estilos.fila, { justifyContent: 'space-between', alignItems: 'flex-start' }]}>
                <Text style={[estilos.tarjetaTitulo, { flex: 1 }]}>{renderTitulo(item)}</Text>
                {dato ? <Text style={{ fontSize: tam(11), fontWeight: '600', color: dato.color, marginLeft: 8 }}>{dato.texto}</Text> : null}
              </View>
              {renderTexto(item).filter(Boolean).map((linea, i) => (
                <Text key={i} style={estilos.tarjetaTexto}>{linea}</Text>
              ))}
            </Pressable>
          );
        }}
      />
      <Pressable accessibilityRole="button" style={[estilos.boton, { marginVertical: 16 }]} onPress={() => setEditando(nuevo(valores))}>
        <View style={[estilos.fila, { gap: 6 }]}>
          <Ionicons name="add" size={20} color={colores.blanco} />
          <Text style={estilos.botonTexto}>{textoNuevo}</Text>
        </View>
      </Pressable>
      {panel ? <PanelFiltros filtros={usables} valores={valores} total={visibles.length} onCambiar={cambiar} onLimpiar={limpiar} onCerrar={() => setPanel(false)} /> : null}
      {editando ? (
        <Formulario
          titulo={editando.id ? tituloEditar : tituloNuevo || textoNuevo}
          campos={campos}
          ayuda={ayuda}
          inicial={editando}
          onCerrar={() => setEditando(null)}
          onGuardar={(v) => {
            guardar(tipo, v);
            setEditando(null);
          }}
          onBorrar={
            editando.id
              ? () =>
                  confirmar(avisoBorrar || t('Seguro que quieres borrarlo?'), () => {
                    borrar(tipo, editando.id);
                    setEditando(null);
                  })
              : null
          }
        />
      ) : null}
    </View>
  );
}
