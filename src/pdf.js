import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Directory, File, Paths } from 'expo-file-system';

export function nombrePdf(titulo, fecha) {
  const limpio = titulo
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
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

async function guardarEnLaApp(base64, nombre) {
  const carpeta = new Directory(Paths.document, 'informes');
  if (!carpeta.exists) carpeta.create();
  const destino = new File(carpeta, nombre);
  if (destino.exists) destino.delete();
  destino.create();
  await destino.write(base64, { encoding: 'base64' });
  return destino;
}

export async function descargarPdf(html, nombre) {
  if (Platform.OS === 'web') {
    imprimirWeb(html);
    return 'web';
  }
  const { base64 } = await Print.printToFileAsync({ html, base64: true });
  const destino = await guardarEnLaApp(base64, nombre);
  try {
    await destino.preview();
    return 'abierto';
  } catch (e) {
    await Sharing.shareAsync(destino.uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf' });
    return 'compartido';
  }
}
