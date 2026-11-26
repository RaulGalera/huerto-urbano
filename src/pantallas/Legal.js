import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores, estilos, tam } from '../estilos';
import { textosLegales, VERSION_LEGAL } from '../legal';
import { idioma, t } from '../idioma';
import { verFecha } from '../util';

export default function Legal({ onCerrar }) {
  return (
    <Modal visible animationType="none" onRequestClose={onCerrar}>
      <ScrollView style={{ flex: 1, backgroundColor: colores.fondo }} contentContainerStyle={{ width: '100%', maxWidth: 900, alignSelf: 'center', padding: 16, paddingTop: 48, paddingBottom: 40 }}>
        <Pressable onPress={onCerrar} hitSlop={10} accessibilityRole="button" accessibilityLabel={t('Volver')} style={[estilos.fila, { marginBottom: 8, alignSelf: 'flex-start' }]}>
          <Ionicons name="chevron-back" size={18} color={colores.verde} />
          <Text style={{ color: colores.verde, fontSize: tam(14) }}>{t('Volver')}</Text>
        </Pressable>
        <Text style={estilos.titulo} accessibilityRole="header">{t('Privacidad y aviso legal')}</Text>
        <Text style={[estilos.tarjetaTexto, { marginBottom: 12 }]}>
          {t('Version del')} {verFecha(VERSION_LEGAL)}
        </Text>
        {textosLegales(idioma()).map((s) => (
          <View key={s.titulo} style={estilos.tarjeta}>
            <Text style={[estilos.tarjetaTitulo, { marginBottom: 6 }]} accessibilityRole="header">{s.titulo}</Text>
            {s.parrafos.map((p, i) => (
              <Text key={i} style={{ fontSize: tam(14), color: colores.texto, lineHeight: 20, marginTop: 6 }}>
                {p}
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </Modal>
  );
}
