import { useState } from 'react';
import { Pressable, ScrollView, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores, estiloChip, estilos } from '../estilos';
import { hoy, useDatos } from '../datos';
import { nombrePor, numero, ordenarPorFecha, temporadaActual, ultimoRiego } from '../util';
import { useCuenta } from '../cuenta';
import { calcularBeneficio, euros } from '../calculos';
import Tiempo from '../componentes/Tiempo';
import { estadoSiembra, nombreMes, paraSembrar } from '../cultivos';

const DIAS_AVISO_RIEGO = 3;

function Dato({ valor, texto }) {
  return (
    <View style={[estilos.tarjeta, { flex: 1, alignItems: 'center', paddingVertical: 12, marginBottom: 0 }]}>
      <Text style={{ fontSize: 24, fontWeight: '700', color: colores.verde }}>{valor}</Text>
      <Text style={[estilos.tarjetaTexto, { marginTop: 4 }]}>{texto}</Text>
    </View>
  );
}

function Linea({ texto, valor, color, negrita }) {
  return (
    <View style={[estilos.fila, { justifyContent: 'space-between', marginTop: 8 }]}>
      <Text style={{ fontSize: 14, color: colores.texto, fontWeight: negrita ? '700' : '400' }}>{texto}</Text>
      <Text style={{ fontSize: 14, color: color || colores.texto, fontWeight: negrita ? '700' : '600' }}>{valor}</Text>
    </View>
  );
}

export default function Resumen({ onPerfil }) {
  const { datos, guardar } = useDatos();
  const { usuario, config, esAdmin } = useCuenta();
  const temporadas = ordenarPorFecha(datos.temporadas, 'inicio');
  const actual = temporadaActual(temporadas, hoy());
  const [elegidaGuardada, setElegida] = useState(null);
  const elegida = temporadas.some((t) => t.id === elegidaGuardada) ? elegidaGuardada : actual ? actual.id : temporadas[0] ? temporadas[0].id : null;

  const siembras = datos.siembras.filter((s) => s.temporadaId === elegida);
  const cosechas = datos.cosechas.filter((c) => siembras.some((s) => s.id === c.siembraId));
  const totalKilos = cosechas.reduce((a, c) => a + (Number(c.kilos) || 0), 0);
  const listas = siembras.filter((s) => {
    const e = estadoSiembra(s, datos.cosechas, hoy());
    return e && e.lista;
  });
  const proximas = siembras
    .map((s) => ({ s, e: estadoSiembra(s, datos.cosechas, hoy()) }))
    .filter((x) => x.e && !x.e.cosechada && x.e.faltan > 0 && x.e.faltan <= 14)
    .sort((a, b) => a.e.faltan - b.e.faltan);
  const mes = Number(hoy().slice(5, 7));
  const sembrarAhora = paraSembrar(mes);
  const cuentas = calcularBeneficio(datos, config, datos.temporadas.find((t) => t.id === elegida));

  const porCultivo = {};
  cosechas.forEach((c) => {
    const s = siembras.find((x) => x.id === c.siembraId);
    const nombre = s.cultivo.trim();
    const k = nombre.toLowerCase();
    if (!porCultivo[k]) porCultivo[k] = { nombre, kilos: 0 };
    porCultivo[k].kilos += Number(c.kilos) || 0;
  });
  const ranking = Object.values(porCultivo).sort((a, b) => b.kilos - a.kilos);
  const maximo = ranking.length && ranking[0].kilos > 0 ? ranking[0].kilos : 1;

  const avisos = datos.parcelas
    .map((p) => ({ parcela: p, dias: ultimoRiego(datos.riegos, p.id) }))
    .filter((a) => a.dias === null || a.dias >= DIAS_AVISO_RIEGO);

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingHorizontal: 16, paddingTop: 24, paddingBottom: 30 }}>
      <View style={[estilos.fila, { justifyContent: 'space-between', marginBottom: 12 }]}>
        <View>
          <Text style={[estilos.titulo, { marginBottom: 0 }]}>Mi huerto</Text>
          <Text style={estilos.tarjetaTexto}>Hola, {usuario ? usuario.nombre : ''}</Text>
        </View>
        <Pressable onPress={onPerfil} hitSlop={10} style={[estilos.fila, { gap: 4 }]}>
          {esAdmin ? (
            <View style={{ backgroundColor: colores.naranja, borderRadius: 10, paddingHorizontal: 8, paddingVertical: 2 }}>
              <Text style={{ color: colores.blanco, fontSize: 11, fontWeight: '700' }}>ADMIN</Text>
            </View>
          ) : null}
          <Ionicons name="person-circle-outline" size={34} color={colores.verde} />
        </Pressable>
      </View>

      <Text style={[estilos.etiqueta, { marginTop: 0 }]}>Temporada</Text>
      {temporadas.length === 0 ? (
        <Text style={estilos.tarjetaTexto}>Crea una temporada en la pestana Temp. para ver el resumen.</Text>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          {temporadas.map((t) => {
            const e = estiloChip(t.id === elegida);
            return (
              <Pressable key={t.id} style={e.caja} onPress={() => setElegida(t.id)}>
                <Text style={e.texto}>{t.nombre}</Text>
              </Pressable>
            );
          })}
        </ScrollView>
      )}

      {avisos.length > 0 ? (
        <View style={{ backgroundColor: colores.rojoClaro, borderRadius: 10, padding: 14, marginTop: 18, flexDirection: 'row' }}>
          <Ionicons name="alert-circle" size={22} color={colores.rojo} style={{ marginRight: 12 }} />
          <View style={{ flex: 1 }}>
            <Text style={{ color: colores.rojo, fontWeight: '600', fontSize: 14, marginBottom: 6 }}>
              Parcelas sin regar ({DIAS_AVISO_RIEGO} dias o mas)
            </Text>
            {avisos.map((a) => (
              <View key={a.parcela.id} style={[estilos.fila, { justifyContent: 'space-between', marginTop: 6 }]}>
                <Text style={{ color: colores.texto, fontSize: 14, flex: 1 }}>
                  {a.parcela.nombre} - {a.dias === null ? 'nunca regada' : a.dias + ' dias sin riego'}
                </Text>
                <Pressable
                  onPress={() => guardar('riegos', { parcelaId: a.parcela.id, fecha: hoy(), litros: '', metodo: 'Manguera' })}
                  style={[estilos.fila, { gap: 4, backgroundColor: colores.blanco, borderRadius: 14, paddingVertical: 4, paddingHorizontal: 10, borderWidth: 1, borderColor: colores.borde }]}
                >
                  <Ionicons name="water" size={14} color={colores.verde} />
                  <Text style={{ color: colores.verde, fontSize: 12, fontWeight: '600' }}>Regar hoy</Text>
                </Pressable>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <Tiempo ciudad={datos.ajustes && datos.ajustes.ciudad} />

      <View style={{ flexDirection: 'row', gap: 6, marginTop: 16 }}>
        <Dato valor={datos.parcelas.length} texto="Parcelas" />
        <Dato valor={siembras.length} texto="Siembras" />
        <Dato valor={numero(totalKilos)} texto="Kilos totales" />
      </View>

      <View style={[estilos.tarjeta, { marginTop: 16 }]}>
        <View style={[estilos.fila, { gap: 8, marginBottom: 4 }]}>
          <Ionicons name="calendar-outline" size={20} color={colores.verde} />
          <Text style={{ fontSize: 16, fontWeight: '600', color: colores.texto }}>Calendario del huerto</Text>
        </View>
        {listas.length > 0 ? (
          listas.map((s) => (
            <View key={s.id} style={[estilos.fila, { gap: 6, marginTop: 8 }]}>
              <Ionicons name="checkmark-circle" size={18} color={colores.verde} />
              <Text style={{ color: colores.texto, fontSize: 14 }}>
                {s.cultivo} ({nombrePor(datos.parcelas, s.parcelaId)}) lista para cosechar
              </Text>
            </View>
          ))
        ) : (
          <Text style={estilos.tarjetaTexto}>Ninguna siembra pendiente de cosechar.</Text>
        )}
        {proximas.map((x) => (
          <View key={x.s.id} style={[estilos.fila, { gap: 6, marginTop: 8 }]}>
            <Ionicons name="time-outline" size={18} color={colores.naranja} />
            <Text style={{ color: colores.texto, fontSize: 14 }}>
              {x.s.cultivo} en {x.e.faltan} {x.e.faltan === 1 ? 'dia' : 'dias'}
            </Text>
          </View>
        ))}
        <Text style={[estilos.etiqueta, { marginTop: 14 }]}>Para sembrar en {nombreMes(mes)}</Text>
        <Text style={{ color: colores.texto, fontSize: 14, textTransform: 'capitalize' }}>{sembrarAhora.join(', ')}</Text>
      </View>

      <View style={[estilos.tarjeta, { paddingBottom: 20 }]}>
        <Text style={{ fontSize: 16, fontWeight: '600', color: colores.texto, marginBottom: 8 }}>Kilos por cultivo</Text>
        {ranking.length === 0 ? (
          <Text style={estilos.tarjetaTexto}>Aun no hay cosechas en esta temporada.</Text>
        ) : (
          ranking.map((r) => (
            <View key={r.nombre} style={[estilos.fila, { marginTop: 14 }]}>
              <Text style={{ width: 90, fontSize: 13, color: colores.texto }} numberOfLines={1}>{r.nombre}</Text>
              <View style={{ flex: 1, height: 20, backgroundColor: colores.verdeClaro, borderRadius: 4 }}>
                <View style={{ height: 20, width: (r.kilos / maximo) * 100 + '%', backgroundColor: colores.verde, borderRadius: 4 }} />
              </View>
              <Text style={{ width: 60, textAlign: 'right', fontSize: 13, fontWeight: '600', color: colores.texto }}>{numero(r.kilos)} kg</Text>
            </View>
          ))
        )}
      </View>

      {elegida ? (
        <View style={[estilos.tarjeta, { paddingBottom: 18 }]}>
          <View style={[estilos.fila, { gap: 8, marginBottom: 4 }]}>
            <Ionicons name="cash-outline" size={20} color={colores.verde} />
            <Text style={{ fontSize: 16, fontWeight: '600', color: colores.texto }}>Beneficio de la temporada</Text>
          </View>
          <Linea texto="Venta a precio de mercado" valor={euros(cuentas.ingresos)} color={colores.verde} />
          <Linea texto={'Agua (' + numero(cuentas.litros, 0) + ' L)'} valor={euros(-cuentas.agua)} color={colores.rojo} />
          <Linea texto="Gastos de las parcelas" valor={euros(-cuentas.gastos)} color={colores.rojo} />
          {cuentas.impuestos > 0 ? (
            <Linea texto={'Impuestos (' + numero(config.impuestos, 0) + '%)'} valor={euros(-cuentas.impuestos)} color={colores.rojo} />
          ) : null}
          <View style={{ height: 1, backgroundColor: colores.borde, marginTop: 10 }} />
          <Linea texto="Beneficio" valor={euros(cuentas.beneficio)} color={cuentas.beneficio >= 0 ? colores.verde : colores.rojo} negrita />
          {cuentas.porParcela.length > 0 ? (
            <View style={{ marginTop: 14 }}>
              <Text style={[estilos.etiqueta, { marginTop: 0 }]}>Por parcela</Text>
              {cuentas.porParcela.map((x) => (
                <Linea key={x.parcela.id} texto={x.parcela.nombre} valor={euros(x.beneficio)} color={x.beneficio >= 0 ? colores.verde : colores.rojo} />
              ))}
            </View>
          ) : null}
          {cuentas.sinPrecio.length > 0 ? (
            <Text style={[estilos.tarjetaTexto, { color: colores.naranja, marginTop: 12 }]}>
              Sin precio de mercado: {cuentas.sinPrecio.join(', ')}. {esAdmin ? 'Anadelo en el modo admin.' : 'Pide al administrador que lo anada.'}
            </Text>
          ) : null}
        </View>
      ) : null}
    </ScrollView>
  );
}
