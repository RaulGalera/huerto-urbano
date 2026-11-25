import { calcularBeneficio, euros } from './calculos';
import { kilosPorCultivo } from './graficas';
import { numero, verFecha } from './util';
import { t } from './idioma';

export function escapar(texto) {
  return String(texto == null ? '' : texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function fila(texto, valor, clase) {
  return '<tr' + (clase ? ' class="' + clase + '"' : '') + '><td>' + escapar(texto) + '</td><td class="n">' + escapar(valor) + '</td></tr>';
}

export function htmlBalance(datos, config, temporada, nombre, fecha) {
  const c = calcularBeneficio(datos, config, temporada);
  const kilos = kilosPorCultivo(datos, temporada);
  const lineas = [
    fila(t('Venta a precio de mercado'), euros(c.ingresos)),
    fila(t('Agua') + ' (' + numero(c.litros, 0) + ' L)', euros(-c.agua)),
    fila(t('Gastos de las parcelas'), euros(-c.gastos)),
  ];
  if (c.impuestos > 0) lineas.push(fila(t('Impuestos') + ' (' + numero(config.impuestos, 0) + '%)', euros(-c.impuestos)));
  lineas.push(fila(t('Beneficio'), euros(c.beneficio), 'total'));

  const parcelas = c.porParcela.map((x) => fila(x.parcela.nombre, euros(x.beneficio))).join('');
  const cultivos = kilos.map((x) => fila(x.nombre, numero(x.valor) + ' kg')).join('');

  return (
    '<!doctype html><html><head><meta charset="utf-8"><title>' + escapar(t('Balance') + ' ' + temporada.nombre) + '</title>' +
    '<style>body{font-family:Arial,sans-serif;color:#1f2a1f;margin:32px}h1{color:#2e7d32;font-size:22px;margin:0}' +
    'h2{font-size:15px;margin:24px 0 8px}p{color:#666;font-size:12px;margin:4px 0}table{width:100%;border-collapse:collapse;font-size:13px}' +
    'td{padding:6px 0;border-bottom:1px solid #e3e8e3}.n{text-align:right}.total td{font-weight:bold;border-top:2px solid #2e7d32}</style></head><body>' +
    '<h1>Huerto Urbano - ' + escapar(t('Balance')) + '</h1>' +
    '<p>' + escapar(temporada.nombre) + ' (' + verFecha(temporada.inicio) + ' - ' + verFecha(temporada.fin) + ')</p>' +
    '<p>' + escapar(nombre) + ' - ' + escapar(t('Generado el')) + ' ' + verFecha(fecha) + '</p>' +
    '<h2>' + escapar(t('Beneficio de la temporada')) + '</h2><table>' + lineas.join('') + '</table>' +
    (parcelas ? '<h2>' + escapar(t('Por parcela')) + '</h2><table>' + parcelas + '</table>' : '') +
    (cultivos ? '<h2>' + escapar(t('Kilos por cultivo')) + '</h2><table>' + cultivos + '</table>' : '') +
    '</body></html>'
  );
}
