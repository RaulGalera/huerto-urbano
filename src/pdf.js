import { Platform } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';

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

export async function compartirPdf(html, titulo) {
  if (Platform.OS === 'web') {
    imprimirWeb(html);
    return;
  }
  const { uri } = await Print.printToFileAsync({ html });
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, { mimeType: 'application/pdf', UTI: 'com.adobe.pdf', dialogTitle: titulo });
  } else {
    await Print.printAsync({ uri });
  }
}
