import { useState } from 'react';
import { Modal, Pressable, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores, estilos } from '../estilos';
import { diasDelMes, leerFecha, verFecha } from '../util';

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
const SEMANA = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];

function hoyIso() {
  return new Date().toISOString().slice(0, 10);
}

function aIso(anio, mes, dia) {
  return anio + '-' + String(mes + 1).padStart(2, '0') + '-' + String(dia).padStart(2, '0');
}

function Calendario({ inicial, onElegir, onCerrar }) {
  const base = inicial || hoyIso();
  const [anio, setAnio] = useState(Number(base.slice(0, 4)));
  const [mes, setMes] = useState(Number(base.slice(5, 7)) - 1);
  const hoy = hoyIso();

  function mover(n) {
    const m = mes + n;
    setAnio(anio + Math.floor(m / 12));
    setMes(((m % 12) + 12) % 12);
  }

  const celdas = diasDelMes(anio, mes);
  const filas = [];
  for (let i = 0; i < celdas.length; i += 7) filas.push(celdas.slice(i, i + 7));

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onCerrar}>
      <Pressable style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 20 }} onPress={onCerrar}>
        <Pressable style={{ backgroundColor: colores.blanco, borderRadius: 14, padding: 16, width: '100%', maxWidth: 380, alignSelf: 'center' }} onPress={() => {}}>
          <View style={[estilos.fila, { justifyContent: 'space-between', marginBottom: 12 }]}>
            <Pressable onPress={() => mover(-1)} hitSlop={10} style={{ padding: 4 }}>
              <Ionicons name="chevron-back" size={22} color={colores.verde} />
            </Pressable>
            <Text style={{ fontSize: 16, fontWeight: '700', color: colores.texto }}>
              {MESES[mes]} {anio}
            </Text>
            <Pressable onPress={() => mover(1)} hitSlop={10} style={{ padding: 4 }}>
              <Ionicons name="chevron-forward" size={22} color={colores.verde} />
            </Pressable>
          </View>
          <View style={{ flexDirection: 'row' }}>
            {SEMANA.map((d) => (
              <Text key={d} style={{ flex: 1, textAlign: 'center', fontSize: 12, color: colores.gris, marginBottom: 6 }}>
                {d}
              </Text>
            ))}
          </View>
          {filas.map((fila, i) => (
            <View key={i} style={{ flexDirection: 'row' }}>
              {fila.map((d, j) => {
                if (!d) return <View key={j} style={{ flex: 1, height: 40 }} />;
                const iso = aIso(anio, mes, d);
                const elegido = iso === inicial;
                const esHoy = iso === hoy;
                return (
                  <Pressable key={j} onPress={() => onElegir(iso)} style={{ flex: 1, height: 40, alignItems: 'center', justifyContent: 'center' }}>
                    <View
                      style={{
                        width: 34,
                        height: 34,
                        borderRadius: 17,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: elegido ? colores.verde : 'transparent',
                        borderWidth: esHoy && !elegido ? 1 : 0,
                        borderColor: colores.verde,
                      }}
                    >
                      <Text style={{ color: elegido ? colores.blanco : colores.texto, fontWeight: elegido || esHoy ? '700' : '400' }}>{d}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}
          <View style={[estilos.fila, { justifyContent: 'space-between', marginTop: 12 }]}>
            <Pressable onPress={() => onElegir(hoy)} style={{ padding: 8 }}>
              <Text style={{ color: colores.verde, fontWeight: '600' }}>Hoy</Text>
            </Pressable>
            <Pressable onPress={onCerrar} style={{ padding: 8 }}>
              <Text style={{ color: colores.gris, fontWeight: '600' }}>Cerrar</Text>
            </Pressable>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export default function SelectorFecha({ valor, onCambio }) {
  const [abierto, setAbierto] = useState(false);
  const iso = leerFecha(valor || '');
  return (
    <View>
      <Pressable style={[estilos.input, estilos.fila, { justifyContent: 'space-between' }]} onPress={() => setAbierto(true)}>
        <Text style={{ fontSize: 15, color: valor ? colores.texto : colores.gris }}>{valor || 'Elegir fecha'}</Text>
        <Ionicons name="calendar-outline" size={20} color={colores.verde} />
      </Pressable>
      {abierto ? (
        <Calendario
          inicial={iso}
          onCerrar={() => setAbierto(false)}
          onElegir={(f) => {
            onCambio(verFecha(f));
            setAbierto(false);
          }}
        />
      ) : null}
    </View>
  );
}
