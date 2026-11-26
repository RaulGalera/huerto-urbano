import { t } from './idioma';

export function fechaLocal(d = new Date()) {
  const dos = (n) => String(n).padStart(2, '0');
  return d.getFullYear() + '-' + dos(d.getMonth() + 1) + '-' + dos(d.getDate());
}

export function nombrePor(lista, id, campo = 'nombre') {
  const x = lista.find((e) => e.id === id);
  return x ? x[campo] : t('Sin asignar');
}

export function diasDesde(fecha) {
  if (!fecha) return null;
  const a = new Date(fecha + 'T00:00:00');
  const b = new Date(fechaLocal() + 'T00:00:00');
  return Math.round((b - a) / 86400000);
}

export function ordenarPorFecha(lista, campo = 'fecha') {
  return [...lista].sort((a, b) => String(b[campo]).localeCompare(String(a[campo])));
}

export function verFecha(iso) {
  if (!iso || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) return iso || '';
  const [a, m, d] = iso.split('-');
  return d + '/' + m + '/' + a;
}

export function leerFecha(texto) {
  const r = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(texto).trim());
  if (!r) return null;
  const d = Number(r[1]);
  const m = Number(r[2]);
  const a = Number(r[3]);
  const f = new Date(Date.UTC(a, m - 1, d));
  if (f.getUTCDate() !== d || f.getUTCMonth() !== m - 1) return null;
  return f.toISOString().slice(0, 10);
}

export function numero(n, decimales = 1) {
  return Number(n || 0).toFixed(decimales).replace('.', ',');
}

export function textoSiembra(s, parcelas) {
  return s.cultivo + ' - ' + nombrePor(parcelas, s.parcelaId);
}

export function ultimoRiego(riegos, parcelaId) {
  const r = ordenarPorFecha(riegos.filter((x) => x.parcelaId === parcelaId))[0];
  return r ? diasDesde(r.fecha) : null;
}

export function temporadaActual(temporadas, hoy) {
  return temporadas.find((x) => x.inicio <= hoy && hoy <= x.fin);
}

export function diasDelMes(anio, mes) {
  const primero = new Date(Date.UTC(anio, mes, 1)).getUTCDay();
  const huecos = (primero + 6) % 7;
  const total = new Date(Date.UTC(anio, mes + 1, 0)).getUTCDate();
  const celdas = [];
  for (let i = 0; i < huecos; i++) celdas.push(null);
  for (let d = 1; d <= total; d++) celdas.push(d);
  while (celdas.length % 7 !== 0) celdas.push(null);
  return celdas;
}

export function claveCultivo(nombre) {
  return String(nombre || '').trim().toLowerCase();
}

export function cultivosDe(siembras) {
  const vistos = {};
  siembras.forEach((s) => {
    const k = claveCultivo(s.cultivo);
    if (k && !vistos[k]) vistos[k] = s.cultivo.trim().charAt(0).toUpperCase() + s.cultivo.trim().slice(1);
  });
  return Object.keys(vistos)
    .sort((a, b) => a.localeCompare(b))
    .map((k) => ({ id: k, texto: vistos[k] }));
}
