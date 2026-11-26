import { calcularBeneficio } from './calculos';
import { kilosPorCultivo } from './graficas';

export function resumenTemporada(datos, config, temporada) {
  const siembras = datos.siembras.filter((s) => s.temporadaId === temporada.id);
  const ids = new Set(siembras.map((s) => s.id));
  const kilos = datos.cosechas.filter((c) => ids.has(c.siembraId)).reduce((a, c) => a + (Number(c.kilos) || 0), 0);
  const cuentas = calcularBeneficio(datos, config, temporada);
  const cultivos = kilosPorCultivo(datos, temporada);
  return {
    siembras: siembras.length,
    kilos,
    litros: cuentas.litros,
    ingresos: cuentas.ingresos,
    gastos: cuentas.gastos + cuentas.agua,
    beneficio: cuentas.beneficio,
    mejor: cultivos.length ? cultivos[0] : null,
  };
}

export function cambio(antes, ahora) {
  if (!antes) return null;
  return ((ahora - antes) / Math.abs(antes)) * 100;
}

export const METRICAS = [
  { clave: 'siembras', texto: 'Siembras', tipo: 'numero', subeEsBueno: true },
  { clave: 'kilos', texto: 'Kilos cosechados', tipo: 'kilos', subeEsBueno: true },
  { clave: 'litros', texto: 'Agua usada', tipo: 'litros', subeEsBueno: false },
  { clave: 'ingresos', texto: 'Ingresos', tipo: 'euros', subeEsBueno: true },
  { clave: 'gastos', texto: 'Gastos y agua', tipo: 'euros', subeEsBueno: false },
  { clave: 'beneficio', texto: 'Beneficio', tipo: 'euros', subeEsBueno: true },
];

export function comparar(antes, ahora) {
  return METRICAS.map((m) => {
    const pct = cambio(antes[m.clave], ahora[m.clave]);
    let tono = 'igual';
    if (pct === null && ahora[m.clave] !== antes[m.clave]) tono = ahora[m.clave] > antes[m.clave] === m.subeEsBueno ? 'bien' : 'mal';
    else if (pct !== null && Math.abs(pct) >= 0.5) tono = pct > 0 === m.subeEsBueno ? 'bien' : 'mal';
    return { ...m, antes: antes[m.clave], ahora: ahora[m.clave], pct, tono };
  });
}
