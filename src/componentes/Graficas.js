import { useState } from 'react';
import { Text, View } from 'react-native';
import { colores, estilos } from '../estilos';
import { idioma, t } from '../idioma';
import { numero } from '../util';
import { euros } from '../calculos';
import { aguaPorParcela, beneficioPorTemporada, kilosPorCultivo, kilosPorMes, MESES_CORTOS } from '../graficas';
import Chips from './Chips';

function Barras({ filas, formato }) {
  const maximo = Math.max(...filas.map((f) => Math.abs(f.valor)), 1);
  return filas.map((f) => (
    <View key={f.nombre} style={{ marginTop: 12 }} accessible accessibilityLabel={f.nombre + ': ' + formato(f.valor)}>
      <View style={[estilos.fila, { justifyContent: 'space-between', marginBottom: 4 }]}>
        <Text style={{ flex: 1, fontSize: 13, color: colores.texto }} numberOfLines={1}>
          {f.nombre}
        </Text>
        <Text style={{ fontSize: 13, fontWeight: '600', color: f.valor < 0 ? colores.rojo : colores.texto }}>{formato(f.valor)}</Text>
      </View>
      <View style={{ height: 10, backgroundColor: colores.verdeClaro, borderRadius: 5 }}>
        <View style={{ height: 10, width: (Math.abs(f.valor) / maximo) * 100 + '%', backgroundColor: f.valor < 0 ? colores.rojo : colores.verde, borderRadius: 5 }} />
      </View>
    </View>
  ));
}

function Columnas({ filas }) {
  const maximo = Math.max(...filas.map((f) => f.valor), 1);
  const meses = MESES_CORTOS[idioma()] || MESES_CORTOS.es;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end', height: 150, marginTop: 14, gap: 6 }}>
      {filas.map((f) => (
        <View key={f.clave} style={{ flex: 1, alignItems: 'center' }} accessible accessibilityLabel={meses[f.mes - 1] + ': ' + numero(f.valor) + ' kg'}>
          <Text style={{ fontSize: 11, color: colores.texto, marginBottom: 4 }}>{numero(f.valor)}</Text>
          <View style={{ width: '70%', maxWidth: 36, height: Math.max((f.valor / maximo) * 100, 2), backgroundColor: colores.verde, borderRadius: 4 }} />
          <Text style={{ fontSize: 11, color: colores.gris, marginTop: 4 }}>{meses[f.mes - 1]}</Text>
        </View>
      ))}
    </View>
  );
}

export default function Graficas({ datos, config, temporada }) {
  const [tipo, setTipo] = useState('cultivo');
  const opciones = [
    { id: 'cultivo', texto: t('Kilos por cultivo') },
    { id: 'mes', texto: t('Kilos por mes') },
    { id: 'agua', texto: t('Agua por parcela') },
    { id: 'beneficio', texto: t('Beneficio por temporada') },
  ];
  let contenido = null;
  let vacio = false;
  if (tipo === 'mes') {
    const filas = kilosPorMes(datos, temporada);
    vacio = !filas.length;
    contenido = <Columnas filas={filas} />;
  } else {
    const filas = tipo === 'cultivo' ? kilosPorCultivo(datos, temporada) : tipo === 'agua' ? aguaPorParcela(datos, temporada) : beneficioPorTemporada(datos, config);
    const formato = tipo === 'cultivo' ? (v) => numero(v) + ' kg' : tipo === 'agua' ? (v) => numero(v, 0) + ' L' : (v) => euros(v);
    vacio = !filas.length;
    contenido = <Barras filas={filas} formato={formato} />;
  }
  return (
    <View style={[estilos.tarjeta, { paddingBottom: 18 }]}>
      <Text style={{ fontSize: 16, fontWeight: '600', color: colores.texto, marginBottom: 10 }}>{t('Graficas')}</Text>
      <Chips opciones={opciones} valor={tipo} onCambiar={setTipo} abajo={0} />
      {vacio ? <Text style={[estilos.tarjetaTexto, { marginTop: 12 }]}>{t('Sin datos para esta grafica.')}</Text> : contenido}
    </View>
  );
}
