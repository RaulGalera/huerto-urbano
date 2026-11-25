import { useState } from 'react';
import { Alert, FlatList, Platform, Pressable, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores, estilos } from '../estilos';
import { useDatos } from '../datos';
import Formulario from './Formulario';
import { filtrar } from '../copia';
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

export default function ListaEditable({ tipo, titulo, icono, textoNuevo, tituloNuevo, tituloEditar, campos, nuevo, items, renderTitulo, renderTexto, renderDato, avisoBorrar, cabecera }) {
  const { guardar, borrar } = useDatos();
  const [editando, setEditando] = useState(null);
  const [busqueda, setBusqueda] = useState('');
  const visibles = filtrar(items, busqueda, (x) => [renderTitulo(x), ...renderTexto(x)].filter(Boolean).join(' '));

  return (
    <View style={estilos.pantalla}>
      <Text style={estilos.titulo}>{titulo}</Text>
      {cabecera}
      {items.length > 3 ? (
        <View style={[estilos.fila, estilos.input, { gap: 8, marginBottom: 12 }]}>
          <Ionicons name="search" size={18} color={colores.gris} />
          <TextInput
            style={{ flex: 1, height: 42, fontSize: 15, color: colores.texto, outlineStyle: 'none' }}
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
      ) : null}
      <FlatList
        data={visibles}
        keyExtractor={(x) => x.id}
        style={{ flex: 1 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Ionicons name={(icono || 'leaf') + '-outline'} size={48} color={colores.borde} />
            <Text style={[estilos.vacio, { marginTop: 10 }]}>{t(items.length ? 'No hay resultados para esa busqueda.' : 'Todavia no hay nada. Pulsa el boton de abajo.')}</Text>
          </View>
        }
        renderItem={({ item }) => {
          const dato = renderDato ? renderDato(item) : null;
          return (
            <Pressable style={estilos.tarjeta} onPress={() => setEditando(item)}>
              <View style={[estilos.fila, { justifyContent: 'space-between', alignItems: 'flex-start' }]}>
                <Text style={[estilos.tarjetaTitulo, { flex: 1 }]}>{renderTitulo(item)}</Text>
                {dato ? <Text style={{ fontSize: 11, fontWeight: '600', color: dato.color, marginLeft: 8 }}>{dato.texto}</Text> : null}
              </View>
              {renderTexto(item).filter(Boolean).map((linea, i) => (
                <Text key={i} style={estilos.tarjetaTexto}>{linea}</Text>
              ))}
            </Pressable>
          );
        }}
      />
      <Pressable style={[estilos.boton, { marginVertical: 16 }]} onPress={() => setEditando(nuevo())}>
        <View style={[estilos.fila, { gap: 6 }]}>
          <Ionicons name="add" size={20} color={colores.blanco} />
          <Text style={estilos.botonTexto}>{textoNuevo}</Text>
        </View>
      </Pressable>
      {editando ? (
        <Formulario
          titulo={editando.id ? tituloEditar : tituloNuevo || textoNuevo}
          campos={campos}
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
