import { Pressable, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colores, estilos, tam } from '../estilos';

export default function Casilla({ marcada, onCambiar, texto }) {
  return (
    <Pressable
      onPress={() => onCambiar(!marcada)}
      accessibilityRole="checkbox"
      aria-checked={marcada}
      accessibilityLabel={texto}
      style={[estilos.fila, { gap: 10, marginTop: 12, alignItems: 'flex-start' }]}
    >
      <Ionicons name={marcada ? 'checkbox' : 'square-outline'} size={22} color={marcada ? colores.verde : colores.gris} />
      <Text style={{ flex: 1, fontSize: tam(14), color: colores.texto, lineHeight: 20 }}>{texto}</Text>
    </Pressable>
  );
}
