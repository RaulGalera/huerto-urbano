import { useState } from 'react';
import { Alert, FlatList, Platform, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores, estilos } from '../estilos';
import { useDatos } from '../datos';
import Formulario from './Formulario';

function confirmar(mensaje, accion) {
  if (Platform.OS === 'web') {
    if (window.confirm(mensaje)) accion();
    return;
  }
  Alert.alert('Confirmar', mensaje, [
    { text: 'Cancelar', style: 'cancel' },
    { text: 'Borrar', style: 'destructive', onPress: accion },
  ]);
}

export default function ListaEditable({ tipo, titulo, icono, textoNuevo, tituloNuevo, tituloEditar, campos, nuevo, items, renderTitulo, renderTexto, renderDato, avisoBorrar, cabecera }) {
  const { guardar, borrar } = useDatos();
  const [editando, setEditando] = useState(null);

  return (
    <View style={estilos.pantalla}>
      <Text style={estilos.titulo}>{titulo}</Text>
      {cabecera}
      <FlatList
        data={items}
        keyExtractor={(x) => x.id}
        style={{ flex: 1 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 40 }}>
            <Ionicons name={(icono || 'leaf') + '-outline'} size={48} color={colores.borde} />
            <Text style={[estilos.vacio, { marginTop: 10 }]}>Todavia no hay nada. Pulsa el boton de abajo.</Text>
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
              {renderTexto(item).filter(Boolean).map((t, i) => (
                <Text key={i} style={estilos.tarjetaTexto}>{t}</Text>
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
                  confirmar(avisoBorrar || 'Seguro que quieres borrarlo?', () => {
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
