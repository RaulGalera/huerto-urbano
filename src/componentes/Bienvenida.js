import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores, estilos } from '../estilos';
import { t } from '../idioma';

export const PASOS = [
  { icono: 'calendar', titulo: 'Crea una temporada', texto: 'Empieza en la pestana Temp. con las fechas de la temporada y anade tus parcelas.' },
  { icono: 'leaf', titulo: 'Apunta lo que haces', texto: 'Guarda siembras, riegos y cosechas. Pulsa una tarjeta para editarla o borrarla.' },
  { icono: 'home', titulo: 'Mira el inicio', texto: 'Ahi tienes los avisos de riego, el tiempo, las graficas y el beneficio de la temporada.' },
];

export default function Bienvenida({ onFin }) {
  const [paso, setPaso] = useState(0);
  const actual = PASOS[paso];
  const ultimo = paso === PASOS.length - 1;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onFin}>
      <View style={{ flex: 1, backgroundColor: colores.sombra, justifyContent: 'center', padding: 24 }}>
        <View style={[estilos.tarjeta, { width: '100%', maxWidth: 420, alignSelf: 'center', alignItems: 'center', padding: 24, marginBottom: 0 }]}>
          <View style={{ width: 64, height: 64, borderRadius: 32, backgroundColor: colores.verdeClaro, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
            <Ionicons name={actual.icono} size={30} color={colores.verde} />
          </View>
          <Text style={[estilos.tarjetaTitulo, { fontSize: 18, textAlign: 'center' }]} accessibilityRole="header">{t(actual.titulo)}</Text>
          <Text style={[estilos.tarjetaTexto, { textAlign: 'center', fontSize: 14, lineHeight: 20, marginTop: 8 }]}>{t(actual.texto)}</Text>
          <View style={[estilos.fila, { gap: 6, marginTop: 18 }]}>
            {PASOS.map((x, i) => (
              <View key={x.titulo} style={{ width: i === paso ? 18 : 8, height: 8, borderRadius: 4, backgroundColor: i === paso ? colores.verde : colores.borde }} />
            ))}
          </View>
          <View style={[estilos.fila, { gap: 10, marginTop: 20, alignSelf: 'stretch' }]}>
            {!ultimo ? (
              <Pressable style={[estilos.botonSecundario, { flex: 1 }]} onPress={onFin} accessibilityRole="button">
                <Text style={estilos.botonSecundarioTexto}>{t('Saltar')}</Text>
              </Pressable>
            ) : null}
            <Pressable style={[estilos.boton, { flex: 1 }]} onPress={() => (ultimo ? onFin() : setPaso(paso + 1))} accessibilityRole="button">
              <Text style={estilos.botonTexto}>{t(ultimo ? 'Empezar' : 'Siguiente')}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
