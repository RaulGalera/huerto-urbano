import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores, estiloChip, estilos } from '../estilos';
import { t } from '../idioma';

export function valoresFiltros(filtros, elegidos) {
  const valores = {};
  filtros.forEach((f) => {
    const v = elegidos[f.clave] !== undefined ? elegidos[f.clave] : f.defecto;
    valores[f.clave] = f.opciones.some((o) => o.id === v) ? v : 'todas';
  });
  return valores;
}

export function aplicarFiltros(items, filtros, valores) {
  return items.filter((x) => filtros.every((f) => valores[f.clave] === 'todas' || f.aplica(x, valores[f.clave])));
}

export function Pastillas({ filtros, valores, onQuitar }) {
  const activos = filtros.filter((f) => valores[f.clave] !== 'todas');
  if (!activos.length) return null;
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginBottom: 10 }} contentContainerStyle={{ gap: 6 }}>
      {activos.map((f) => {
        const o = f.opciones.find((x) => x.id === valores[f.clave]);
        return (
          <Pressable
            key={f.clave}
            onPress={() => onQuitar(f.clave)}
            accessibilityRole="button"
            accessibilityLabel={t('Quitar filtro') + ' ' + o.texto}
            style={[estilos.fila, { gap: 4, height: 28, paddingLeft: 10, paddingRight: 6, borderRadius: 14, backgroundColor: colores.verdeClaro }]}
          >
            <Text style={{ fontSize: 12, color: colores.verde, fontWeight: '600' }}>{o.texto}</Text>
            <Ionicons name="close" size={14} color={colores.verde} />
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function BotonFiltros({ cuantos, onPress }) {
  const activo = cuantos > 0;
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={t('Filtros')}
      style={{ width: 44, height: 44, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center', borderColor: activo ? colores.verde : colores.borde, backgroundColor: activo ? colores.verdeClaro : colores.superficie }}
    >
      <Ionicons name="options-outline" size={20} color={activo ? colores.verde : colores.texto} />
      {activo ? (
        <View style={{ position: 'absolute', top: -5, right: -5, minWidth: 18, height: 18, borderRadius: 9, backgroundColor: colores.verde, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 4 }}>
          <Text style={{ color: colores.blanco, fontSize: 11, fontWeight: '700' }}>{cuantos}</Text>
        </View>
      ) : null}
    </Pressable>
  );
}

export default function PanelFiltros({ filtros, valores, total, onCambiar, onLimpiar, onCerrar }) {
  return (
    <Modal visible transparent animationType="slide" onRequestClose={onCerrar}>
      <Pressable style={{ flex: 1, backgroundColor: colores.sombra }} onPress={onCerrar} accessibilityLabel={t('Cerrar')} />
      <View style={{ backgroundColor: colores.superficie, borderTopLeftRadius: 18, borderTopRightRadius: 18, paddingHorizontal: 20, paddingTop: 10, paddingBottom: 24, maxHeight: '80%', width: '100%', maxWidth: 900, alignSelf: 'center' }}>
        <View style={{ width: 40, height: 4, borderRadius: 2, backgroundColor: colores.borde, alignSelf: 'center', marginBottom: 14 }} />
        <View style={[estilos.fila, { justifyContent: 'space-between', marginBottom: 4 }]}>
          <Text style={{ fontSize: 18, fontWeight: '700', color: colores.texto }} accessibilityRole="header">{t('Filtros')}</Text>
          <Pressable onPress={onLimpiar} hitSlop={10} accessibilityRole="button">
            <Text style={{ color: colores.verde, fontWeight: '600', fontSize: 14 }}>{t('Limpiar')}</Text>
          </Pressable>
        </View>
        <ScrollView style={{ flexGrow: 0 }}>
          {filtros.map((f) => (
            <View key={f.clave}>
              <Text style={[estilos.etiqueta, { marginTop: 16, marginBottom: 8 }]}>{f.titulo}</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {[{ id: 'todas', texto: t('Todas') }, ...f.opciones].map((o) => {
                  const e = estiloChip(valores[f.clave] === o.id);
                  return (
                    <Pressable key={o.id} style={e.caja} onPress={() => onCambiar(f.clave, o.id)} accessibilityRole="radio" accessibilityState={{ selected: valores[f.clave] === o.id }}>
                      <Text style={e.texto}>{o.texto}</Text>
                    </Pressable>
                  );
                })}
              </View>
            </View>
          ))}
        </ScrollView>
        <Pressable style={[estilos.boton, { marginTop: 22 }]} onPress={onCerrar}>
          <Text style={estilos.botonTexto}>
            {t('Ver')} {total} {t(total === 1 ? 'resultado' : 'resultados')}
          </Text>
        </Pressable>
      </View>
    </Modal>
  );
}
