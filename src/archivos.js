import { Platform, Share } from 'react-native';
import * as Sharing from 'expo-sharing';
import { Directory, File, Paths } from 'expo-file-system';

function descargarEnWeb(texto, nombre, tipo) {
  const url = URL.createObjectURL(new Blob([texto], { type: tipo }));
  const a = document.createElement('a');
  a.href = url;
  a.download = nombre;
  a.click();
  URL.revokeObjectURL(url);
}

export async function compartirTexto(texto, nombre, tipo) {
  if (Platform.OS === 'web') {
    descargarEnWeb(texto, nombre, tipo);
    return 'descargado';
  }
  try {
    const carpeta = new Directory(Paths.document, 'exportes');
    if (!carpeta.exists) carpeta.create();
    const destino = new File(carpeta, nombre);
    if (destino.exists) destino.delete();
    destino.create();
    destino.write(texto);
    await Sharing.shareAsync(destino.uri, { mimeType: tipo, dialogTitle: nombre });
    return 'compartido';
  } catch (e) {
    await Share.share({ title: nombre, message: texto });
    return 'texto';
  }
}
