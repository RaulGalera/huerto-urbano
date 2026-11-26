import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores, estilos } from '../estilos';
import Chips from '../componentes/Chips';
import { comparar, resumenTemporada } from '../estadisticas';
import { euros } from '../calculos';
import { numero, ordenarPorFecha } from '../util';
import { t } from '../idioma';

function formatear(tipo, v) {
  if (tipo === 'euros') return euros(v);
  if (tipo === 'kilos') return numero(v) + ' kg';
  if (tipo === 'litros') return numero(v, 0) + ' L';
  return String(v);
}

function Cambio({ fila }) {
  const color = fila.tono === 'bien' ? colores.verde : fila.tono === 'mal' ? colores.rojo : colores.gris;
  const fondo = fila.tono === 'bien' ? colores.verdeClaro : fila.tono === 'mal' ? colores.rojoClaro : colores.fondo;
  const sube = fila.ahora > fila.antes;
  const igual = fila.ahora === fila.antes || (fila.pct !== null && Math.abs(fila.pct) < 0.5);
  const texto = igual ? '=' : fila.pct === null ? t('nuevo') : (fila.pct > 0 ? '+' : '') + numero(fila.pct, 0) + '%';
  return (
    <View style={[estilos.fila, { gap: 2, backgroundColor: fondo, borderRadius: 12, paddingHorizontal: 8, height: 24 }]}>
      {!igual ? <Ionicons name={sube ? 'arrow-up' : 'arrow-down'} size={12} color={color} /> : null}
      <Text style={{ color, fontSize: 12, fontWeight: '700' }}>{texto}</Text>
    </View>
  );
}

export default function Comparar({ datos, config, onCerrar }) {
  const temporadas = ordenarPorFecha(datos.temporadas, 'inicio');
  const opciones = temporadas.map((x) => ({ id: x.id, texto: x.nombre }));
  const [idAntes, setAntes] = useState(temporadas[1] ? temporadas[1].id : null);
  const [idAhora, setAhora] = useState(temporadas[0] ? temporadas[0].id : null);
  const antes = temporadas.find((x) => x.id === idAntes);
  const ahora = temporadas.find((x) => x.id === idAhora);
  const rA = antes ? resumenTemporada(datos, config, antes) : null;
  const rB = ahora ? resumenTemporada(datos, config, ahora) : null;
  const filas = rA && rB ? comparar(rA, rB) : [];

  return (
    <Modal visible animationType="none" onRequestClose={onCerrar}>
      <ScrollView style={{ flex: 1, backgroundColor: colores.fondo }} contentContainerStyle={{ width: '100%', maxWidth: 900, alignSelf: 'center', padding: 16, paddingTop: 48, paddingBottom: 40 }}>
        <Pressable onPress={onCerrar} hitSlop={10} accessibilityRole="button" accessibilityLabel={t('Volver')} style={[estilos.fila, { marginBottom: 8, alignSelf: 'flex-start' }]}>
          <Ionicons name="chevron-back" size={18} color={colores.verde} />
          <Text style={{ color: colores.verde, fontSize: 14 }}>{t('Volver')}</Text>
        </Pressable>
        <Text style={estilos.titulo} accessibilityRole="header">
          {t('Comparar temporadas')}
        </Text>

        <Text style={[estilos.etiqueta, { marginTop: 0 }]}>{t('Antes')}</Text>
        <Chips opciones={opciones} valor={idAntes} onCambiar={setAntes} abajo={4} />
        <Text style={estilos.etiqueta}>{t('Despues')}</Text>
        <Chips opciones={opciones} valor={idAhora} onCambiar={setAhora} />

        {filas.length ? (
          <View style={[estilos.tarjeta, { paddingVertical: 4 }]}>
            {filas.map((f, i) => (
              <View key={f.clave} style={[estilos.fila, { justifyContent: 'space-between', paddingVertical: 12, borderTopWidth: i ? 1 : 0, borderColor: colores.borde }]}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: 12, color: colores.gris }}>{t(f.texto)}</Text>
                  <View style={[estilos.fila, { gap: 6, marginTop: 2 }]}>
                    <Text style={{ fontSize: 15, color: colores.gris }}>{formatear(f.tipo, f.antes)}</Text>
                    <Ionicons name="arrow-forward" size={14} color={colores.gris} />
                    <Text style={{ fontSize: 15, color: colores.texto, fontWeight: '700' }}>{formatear(f.tipo, f.ahora)}</Text>
                  </View>
                </View>
                <Cambio fila={f} />
              </View>
            ))}
          </View>
        ) : null}

        {rA && rB ? (
          <View style={estilos.tarjeta}>
            <Text style={[estilos.tarjetaTitulo, { marginBottom: 4 }]}>{t('Cultivo estrella')}</Text>
            {[
              [antes, rA],
              [ahora, rB],
            ].map(([tem, r]) => (
              <View key={tem.id} style={[estilos.fila, { justifyContent: 'space-between', marginTop: 8 }]}>
                <Text style={{ fontSize: 14, color: colores.gris, flex: 1 }} numberOfLines={1}>
                  {tem.nombre}
                </Text>
                <Text style={{ fontSize: 14, color: colores.texto, fontWeight: '600' }}>{r.mejor ? r.mejor.nombre + ' - ' + numero(r.mejor.valor) + ' kg' : t('Sin cosechas')}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {idAntes === idAhora ? <Text style={[estilos.tarjetaTexto, { textAlign: 'center' }]}>{t('Elige dos temporadas distintas para ver la diferencia.')}</Text> : null}
      </ScrollView>
    </Modal>
  );
}
