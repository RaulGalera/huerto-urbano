import { nombrePor, verFecha } from './util';
import { t } from './idioma';

const SEPARADOR = ';';

export function celda(valor) {
  const texto = valor === undefined || valor === null ? '' : String(valor);
  if (/[;"\r\n]/.test(texto)) return '"' + texto.replace(/"/g, '""') + '"';
  return texto;
}

export function tablaCsv(cabeceras, filas) {
  const lineas = [cabeceras, ...filas].map((f) => f.map(celda).join(SEPARADOR));
  return '\ufeff' + lineas.join('\r\n') + '\r\n';
}

function numeroCsv(n) {
  if (n === undefined || n === null || n === '') return '';
  const v = Number(n);
  return isNaN(v) ? '' : String(v).replace('.', ',');
}

function porFecha(lista) {
  return [...lista].sort((a, b) => (a.fecha < b.fecha ? -1 : a.fecha > b.fecha ? 1 : 0));
}

export function csvRiegos(datos) {
  return tablaCsv(
    [t('Fecha'), t('Parcela'), t('Litros'), t('Metodo')],
    porFecha(datos.riegos).map((r) => [verFecha(r.fecha), nombrePor(datos.parcelas, r.parcelaId), numeroCsv(r.litros), r.metodo ? t(r.metodo) : ''])
  );
}

export function csvCosechas(datos) {
  return tablaCsv(
    [t('Fecha'), t('Cultivo'), t('Parcela'), t('Temporada'), t('Kilos')],
    porFecha(datos.cosechas).map((c) => {
      const s = datos.siembras.find((x) => x.id === c.siembraId) || {};
      return [verFecha(c.fecha), s.cultivo || '', nombrePor(datos.parcelas, s.parcelaId), nombrePor(datos.temporadas, s.temporadaId), numeroCsv(c.kilos)];
    })
  );
}

export function csvSiembras(datos) {
  return tablaCsv(
    [t('Fecha'), t('Cultivo'), t('Parcela'), t('Temporada'), t('Plantas'), t('Notas')],
    porFecha(datos.siembras).map((s) => [verFecha(s.fecha), s.cultivo, nombrePor(datos.parcelas, s.parcelaId), nombrePor(datos.temporadas, s.temporadaId), numeroCsv(s.cantidad), s.notas || ''])
  );
}
