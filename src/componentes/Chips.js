import { Pressable, ScrollView, Text } from 'react-native';
import { estiloChip } from '../estilos';

export default function Chips({ opciones, valor, onCambiar, abajo = 14 }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ flexGrow: 0, marginBottom: abajo }} contentContainerStyle={{ gap: 8 }}>
      {opciones.map((f) => {
        const e = estiloChip(f.id === valor);
        return (
          <Pressable key={f.id} style={e.caja} onPress={() => onCambiar(f.id)}>
            <Text style={e.texto}>{f.texto}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
