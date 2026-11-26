import { useState } from 'react';
import { Modal, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores, estiloChip, estilos, tam } from '../estilos';
import { leerFecha, verFecha } from '../util';
import SelectorFecha from './SelectorFecha';
import { t } from '../idioma';

function Desplegable({ opciones, valor, onCambio }) {
  const [abierto, setAbierto] = useState(false);
  const elegida = opciones.find((o) => o.valor === valor);
  if (opciones.length === 0) {
    return <Text style={estilos.tarjetaTexto}>{t('No hay opciones. Crea primero el dato necesario.')}</Text>;
  }
  return (
    <View>
      <Pressable accessibilityRole="button" style={[estilos.input, estilos.fila, { justifyContent: 'space-between' }]} onPress={() => setAbierto(!abierto)}>
        <Text style={{ fontSize: tam(15), color: elegida ? colores.texto : colores.gris }}>{elegida ? elegida.texto : t('Elegir')}</Text>
        <Ionicons name={abierto ? 'chevron-up' : 'chevron-down'} size={18} color={colores.gris} />
      </Pressable>
      {abierto ? (
        <View style={{ backgroundColor: colores.superficie, borderWidth: 1, borderColor: colores.borde, borderRadius: 8, marginTop: 4 }}>
          {opciones.map((o) => (
            <Pressable accessibilityRole="button"
              key={o.valor}
              onPress={() => {
                onCambio(o.valor);
                setAbierto(false);
              }}
              style={{ paddingVertical: 12, paddingHorizontal: 12, backgroundColor: o.valor === valor ? colores.verdeClaro : 'transparent' }}
            >
              <Text style={{ color: colores.texto }}>{o.texto}</Text>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function Chips({ opciones, valor, onCambio }) {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {opciones.map((o) => {
        const e = estiloChip(o.valor === valor);
        return (
          <Pressable accessibilityRole="button" aria-selected={o.valor === valor} key={o.valor} style={e.caja} onPress={() => onCambio(o.valor)}>
            <Text style={e.texto}>{o.texto}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

function prepararInicial(campos, inicial) {
  const v = { ...inicial };
  campos.forEach((c) => {
    if ((v[c.clave] === undefined || v[c.clave] === null) && c.defecto !== undefined) v[c.clave] = c.defecto;
    if (c.tipo === 'fecha') v[c.clave] = verFecha(v[c.clave]);
    if (c.tipo === 'numero' && v[c.clave] !== undefined && v[c.clave] !== '') v[c.clave] = String(v[c.clave]).replace('.', ',');
  });
  return v;
}

export default function Formulario({ titulo, campos, inicial, onGuardar, onCerrar, onBorrar, ayuda }) {
  const [valores, setValores] = useState(() => prepararInicial(campos, inicial));
  const [error, setError] = useState('');

  function cambiar(clave, valor) {
    setValores((v) => ({ ...v, [clave]: valor }));
    setError('');
  }

  function enviar() {
    const limpio = { ...valores };
    for (const c of campos) {
      const v = valores[c.clave];
      const vacio = v === undefined || v === null || String(v).trim() === '';
      if (c.obligatorio && vacio) {
        setError(t('Falta rellenar:') + ' ' + c.etiqueta);
        return;
      }
      if (vacio) continue;
      if (c.tipo === 'numero') {
        const n = Number(String(v).replace(',', '.'));
        if (isNaN(n) || n < 0) {
          setError(c.etiqueta + ' ' + t('tiene que ser un numero'));
          return;
        }
        limpio[c.clave] = n;
      }
      if (c.tipo === 'fecha') {
        const f = leerFecha(v);
        if (!f) {
          setError(c.etiqueta + ' ' + t('tiene que ser una fecha DD/MM/AAAA'));
          return;
        }
        limpio[c.clave] = f;
      }
    }
    onGuardar(limpio);
  }

  const consejos = (ayuda ? ayuda(valores) : []).map((a, i) => (
    <View
      key={i}
      style={[estilos.fila, { gap: 10, alignItems: 'flex-start', marginTop: 14, padding: 12, borderRadius: 10, backgroundColor: a.tono === 'mal' ? colores.rojoClaro : colores.verdeClaro }]}
    >
      <Ionicons name={a.tono === 'mal' ? 'warning-outline' : 'happy-outline'} size={18} color={a.tono === 'mal' ? colores.rojo : colores.verde} />
      <Text style={{ flex: 1, fontSize: tam(14), lineHeight: 20, color: colores.texto }}>{a.texto}</Text>
    </View>
  ));

  return (
    <Modal visible animationType="none" onRequestClose={onCerrar}>
      <ScrollView style={{ flex: 1, backgroundColor: colores.fondo }} contentContainerStyle={{ width: '100%', maxWidth: 900, alignSelf: 'center', padding: 16, paddingTop: 48 }}>
        <Pressable accessibilityRole="button" onPress={onCerrar} hitSlop={10} style={[estilos.fila, { marginBottom: 8, alignSelf: 'flex-start' }]}>
          <Ionicons name="chevron-back" size={18} color={colores.verde} />
          <Text style={{ color: colores.verde, fontSize: tam(14) }}>{t('Volver')}</Text>
        </Pressable>
        <Text style={[estilos.titulo, { marginBottom: 4 }]} accessibilityRole="header">{titulo}</Text>
        {campos.map((c) => (
          <View key={c.clave}>
            <Text style={estilos.etiqueta}>
              {c.etiqueta}
              {c.obligatorio ? ' *' : ''}
            </Text>
            {c.tipo === 'desplegable' ? (
              <Desplegable opciones={c.opciones} valor={valores[c.clave]} onCambio={(v) => cambiar(c.clave, v)} />
            ) : c.tipo === 'fecha' ? (
              <SelectorFecha valor={valores[c.clave]} onCambio={(v) => cambiar(c.clave, v)} />
            ) : c.tipo === 'chips' ? (
              <Chips opciones={c.opciones} valor={valores[c.clave]} onCambio={(v) => cambiar(c.clave, v)} />
            ) : (
              <TextInput
                accessibilityLabel={c.etiqueta}
                style={[estilos.input, c.tipo === 'largo' ? { height: 96, paddingTop: 12, textAlignVertical: 'top' } : null]}
                value={valores[c.clave] === undefined || valores[c.clave] === null ? '' : String(valores[c.clave])}
                onChangeText={(v) => cambiar(c.clave, v)}
                keyboardType={c.tipo === 'numero' ? 'decimal-pad' : c.tipo === 'fecha' ? 'numbers-and-punctuation' : 'default'}
                placeholder={c.tipo === 'fecha' ? t('DD/MM/AAAA') : c.ejemplo || ''}
                placeholderTextColor={colores.gris}
                multiline={c.tipo === 'largo'}
              />
            )}
            {c.ayudaAqui ? consejos : null}
          </View>
        ))}
        {campos.some((c) => c.ayudaAqui) ? null : consejos}
        {error ? <Text style={{ color: colores.rojo, marginTop: 14 }}>{error}</Text> : null}
        <Pressable accessibilityRole="button" style={[estilos.boton, { marginTop: 30 }]} onPress={enviar}>
          <Text style={estilos.botonTexto}>{t('Guardar')}</Text>
        </Pressable>
        <Pressable accessibilityRole="button" style={[estilos.botonSecundario, { marginTop: 12 }]} onPress={onCerrar}>
          <Text style={estilos.botonSecundarioTexto}>{t('Cancelar')}</Text>
        </Pressable>
        {onBorrar ? (
          <Pressable accessibilityRole="button" style={[estilos.fila, { marginTop: 20, justifyContent: 'center', padding: 8, gap: 6 }]} onPress={onBorrar}>
            <Ionicons name="trash-outline" size={18} color={colores.rojo} />
            <Text style={{ color: colores.rojo, fontWeight: '600' }}>{t('Borrar')}</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </Modal>
  );
}
