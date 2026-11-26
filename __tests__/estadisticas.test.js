import { cambio, comparar, resumenTemporada } from '../src/estadisticas';

const datos = {
  temporadas: [
    { id: 't1', nombre: 'Primavera', inicio: '2026-03-01', fin: '2026-06-30' },
    { id: 't2', nombre: 'Otono', inicio: '2026-09-01', fin: '2026-12-31' },
  ],
  parcelas: [{ id: 'p1', nombre: 'Bancal 1', gastos: '10' }],
  siembras: [
    { id: 's1', cultivo: 'Tomate', parcelaId: 'p1', temporadaId: 't1' },
    { id: 's2', cultivo: 'Lechuga', parcelaId: 'p1', temporadaId: 't2' },
    { id: 's3', cultivo: 'Ajo', parcelaId: 'p1', temporadaId: 't2' },
  ],
  riegos: [
    { id: 'r1', parcelaId: 'p1', fecha: '2026-04-01', litros: '1000' },
    { id: 'r2', parcelaId: 'p1', fecha: '2026-10-01', litros: '500' },
  ],
  cosechas: [
    { id: 'c1', siembraId: 's1', fecha: '2026-06-01', kilos: '20' },
    { id: 'c2', siembraId: 's2', fecha: '2026-11-01', kilos: '4' },
    { id: 'c3', siembraId: 's3', fecha: '2026-12-01', kilos: '6' },
  ],
};
const config = { precios: { tomate: 2, lechuga: 1, ajo: 3 }, precioAgua: 2, impuestos: 0 };

test('resume una temporada', () => {
  const r = resumenTemporada(datos, config, datos.temporadas[0]);
  expect(r).toMatchObject({ siembras: 1, kilos: 20, litros: 1000, ingresos: 40, gastos: 12, beneficio: 28 });
  expect(r.mejor.nombre).toBe('Tomate');
});

test('calcula el cambio en porcentaje', () => {
  expect(cambio(20, 10)).toBe(-50);
  expect(cambio(0, 10)).toBeNull();
});

test('marca si cada cambio es bueno o malo', () => {
  const a = resumenTemporada(datos, config, datos.temporadas[0]);
  const b = resumenTemporada(datos, config, datos.temporadas[1]);
  const filas = Object.fromEntries(comparar(a, b).map((f) => [f.clave, f]));
  expect(filas.kilos.tono).toBe('mal');
  expect(filas.litros.tono).toBe('bien');
  expect(filas.siembras.tono).toBe('bien');
});
