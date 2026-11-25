import { precioDe } from './precios';

export function calcularBeneficio(datos, config, temporada) {
  const vacio = { ingresos: 0, agua: 0, litros: 0, gastos: 0, impuestos: 0, bruto: 0, beneficio: 0, porParcela: [], sinPrecio: [] };
  if (!temporada) return vacio;

  const siembras = datos.siembras.filter((s) => s.temporadaId === temporada.id);
  const riegos = datos.riegos.filter((r) => r.fecha >= temporada.inicio && r.fecha <= temporada.fin);
  const parcelasUsadas = new Set(siembras.map((s) => s.parcelaId));
  riegos.forEach((r) => parcelasUsadas.add(r.parcelaId));
  const sinPrecio = new Set();

  const porParcela = datos.parcelas
    .filter((p) => parcelasUsadas.has(p.id))
    .map((p) => {
      let ingresos = 0;
      siembras
        .filter((s) => s.parcelaId === p.id)
        .forEach((s) => {
          const precio = precioDe(config, s.cultivo);
          const kilos = datos.cosechas.filter((c) => c.siembraId === s.id).reduce((a, c) => a + (Number(c.kilos) || 0), 0);
          if (precio === null) {
            if (kilos > 0) sinPrecio.add(s.cultivo.trim());
          } else {
            ingresos += kilos * precio;
          }
        });
      const litros = riegos.filter((r) => r.parcelaId === p.id).reduce((a, r) => a + (Number(r.litros) || 0), 0);
      const agua = (litros / 1000) * (Number(config.precioAgua) || 0);
      const gastos = Number(p.gastos) || 0;
      return { parcela: p, ingresos, litros, agua, gastos, beneficio: ingresos - agua - gastos };
    });

  const ingresos = porParcela.reduce((a, x) => a + x.ingresos, 0);
  const agua = porParcela.reduce((a, x) => a + x.agua, 0);
  const litros = porParcela.reduce((a, x) => a + x.litros, 0);
  const gastos = porParcela.reduce((a, x) => a + x.gastos, 0);
  const bruto = ingresos - agua - gastos;
  const impuestos = bruto > 0 ? (bruto * (Number(config.impuestos) || 0)) / 100 : 0;

  return { ingresos, agua, litros, gastos, impuestos, bruto, beneficio: bruto - impuestos, porParcela, sinPrecio: [...sinPrecio] };
}

export function euros(n) {
  const v = Number(n) || 0;
  return (v < 0 ? '-' : '') + Math.abs(v).toFixed(2).replace('.', ',') + ' EUR';
}
