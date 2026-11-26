import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Directory, File, Paths } from 'expo-file-system';

const CLAVE_CARPETA = 'huerto_carpeta_pdf';

export function nombrePdf(titulo, fecha) {
  const limpio = titulo
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return (limpio || 'balance') + '-' + fecha + '.pdf';
}

function imprimirWeb(html) {
  const marco = document.createElement('iframe');
  marco.style.position = 'fixed';
  marco.style.width = '0';
  marco.style.height = '0';
  marco.style.border = '0';
  document.body.appendChild(marco);
  const doc = marco.contentWindow.document;
  doc.open();
  doc.write(html);
  doc.close();
  setTimeout(() => {
    marco.contentWindow.focus();
    marco.contentWindow.print();
    setTimeout(() => marco.remove(), 1000);
  }, 200);
}

async function carpetaGuardada() {
  try {
    const uri = await AsyncStorage.getItem(CLAVE_CARPETA);
    return uri ? new Directory(uri) : null;
  } catch (e) {
    return null;
  }
}

async function guardarEn(carpeta, nombre, bytes) {
  const destino = carpeta.createFile(nombre, 'application/pdf');
  await destino.write(bytes);
}

async function guardarAndroid(origen, nombre) {
  const bytes = await origen.bytes();
  const anterior = await carpetaGuardada();
  if (anterior) {
    try {
      await guardarEn(anterior, nombre, bytes);
      return 'guardado';
    } catch (e) {
      await AsyncStorage.removeItem(CLAVE_CARPETA);
    }
  }
  let carpeta;
  try {
    carpeta = await Directory.pickDirectoryAsync();
  } catch (e) {
    return 'cancelado';
  }
  if (!carpeta) return 'cancelado';
  await guardarEn(carpeta, nombre, bytes);
  await AsyncStorage.setItem(CLAVE_CARPETA, carpeta.uri);
  return 'guardado';
}

export async function descargarPdf(html, nombre) {
  if (Platform.OS === 'web') {
    imprimirWeb(html);
    return 'web';
  }
  const { uri } = await Print.printToFileAsync({ html });
  const origen = new File(uri);
  if (Platform.OS === 'android') return guardarAndroid(origen, nombre);
  const copia = new File(Paths.document, nombre);
  if (copia.exists) copia.delete();
  origen.copy(copia);
  await Sharing.shareAsync(copia.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
  return 'compartido';
}
