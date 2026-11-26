import { aguaPorMes, aguaPorParcela, beneficioPorTemporada, kilosPorCultivo, kilosPorMes, resumenAgua } from '../src/graficas';

const datos = {
  temporadas: [
    { id: 't2', nombre: 'Otono', inicio: '2026-09-01', fin: '2026-12-31' },
    { id: 't1', nombre: 'Primavera', inicio: '2026-03-01', fin: '2026-06-30' },
  ],
  parcelas: [
    { id: 'p1', nombre: 'Bancal 1', gastos: 0, metros: '4' },
    { id: 'p2', nombre: 'Macetas', gastos: 0 },
  ],
  siembras: [
    { id: 's1', cultivo: 'Tomate', parcelaId: 'p1', temporadaId: 't1' },
    { id: 's2', cultivo: 'tomate ', parcelaId: 'p2', temporadaId: 't1' },
    { id: 's3', cultivo: 'Lechuga', parcelaId: 'p2', temporadaId: 't2' },
  ],
  riegos: [
    { id: 'r1', parcelaId: 'p1', fecha: '2026-04-01', litros: 10 },
    { id: 'r2', parcelaId: 'p2', fecha: '2026-04-02', litros: 3 },
    { id: 'r3', parcelaId: 'p2', fecha: '2026-10-02', litros: 5 },
  ],
  cosechas: [
    { id: 'c1', siembraId: 's1', fecha: '2026-05-10', kilos: 2 },
    { id: 'c2', siembraId: 's2', fecha: '2026-06-01', kilos: 1.5 },
    { id: 'c3', siembraId: 's1', fecha: '2026-06-20', kilos: 1 },
    { id: 'c4', siembraId: 's3', fecha: '2026-10-20', kilos: 4 },
  ],
};
const config = { precios: { tomate: 2, lechuga: 1 }, precioAgua: 0, impuestos: 0 };
const primavera = datos.temporadas[1];

test('kilos por cultivo junta nombres iguales', () => {
  expect(kilosPorCultivo(datos, primavera)).toEqual([{ nombre: 'Tomate', valor: 4.5 }]);
});

test('kilos por mes en orden', () => {
  expect(kilosPorMes(datos, primavera)).toEqual([
    { clave: '2026-05', mes: 5, valor: 2 },
    { clave: '2026-06', mes: 6, valor: 2.5 },
  ]);
});

test('agua por parcela solo cuenta los riegos de la temporada', () => {
  expect(aguaPorParcela(datos, primavera)).toEqual([
    { nombre: 'Bancal 1', valor: 10, porMetro: 2.5 },
    { nombre: 'Macetas', valor: 3, porMetro: null },
  ]);
});

test('beneficio por temporada ordenado por fecha', () => {
  const r = beneficioPorTemporada(datos, config);
  expect(r.map((x) => x.nombre)).toEqual(['Primavera', 'Otono']);
  expect(r[0].valor).toBeCloseTo(9);
  expect(r[1].valor).toBeCloseTo(4);
});

test('agua por mes y litros por metro cuadrado', () => {
  expect(aguaPorMes(datos)).toEqual([
    { clave: '2026-04', mes: 4, valor: 13 },
    { clave: '2026-10', mes: 10, valor: 5 },
  ]);
  const filas = aguaPorParcela(datos, primavera);
  expect(filas[0]).toEqual({ nombre: 'Bancal 1', valor: 10, porMetro: 2.5 });
  expect(filas[1].porMetro).toBeNull();
});

test('resumen del agua con su coste', () => {
  expect(resumenAgua(datos, { precioAgua: 2 }, null)).toEqual({ litros: 18, riegos: 3, coste: 0.036 });
  expect(resumenAgua(datos, { precioAgua: 2 }, primavera).litros).toBe(13);
});
