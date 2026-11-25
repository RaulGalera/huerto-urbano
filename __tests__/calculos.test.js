import { calcularBeneficio, euros } from '../src/calculos';

const temporada = { id: 't1', nombre: 'Primavera', inicio: '2026-03-01', fin: '2026-08-31' };

function datosBase() {
  return {
    temporadas: [temporada],
    parcelas: [
      { id: 'p1', nombre: 'Bancal 1', gastos: 10 },
      { id: 'p2', nombre: 'Bancal 2', gastos: 5 },
      { id: 'p3', nombre: 'Sin usar', gastos: 100 },
    ],
    siembras: [
      { id: 's1', cultivo: 'Tomate', parcelaId: 'p1', temporadaId: 't1', fecha: '2026-03-10' },
      { id: 's2', cultivo: 'Lechugas', parcelaId: 'p2', temporadaId: 't1', fecha: '2026-03-15' },
    ],
    riegos: [
      { id: 'r1', parcelaId: 'p1', fecha: '2026-04-01', litros: 500 },
      { id: 'r2', parcelaId: 'p2', fecha: '2026-04-02', litros: 500 },
      { id: 'r3', parcelaId: 'p1', fecha: '2025-12-01', litros: 9999 },
    ],
    cosechas: [
      { id: 'c1', siembraId: 's1', fecha: '2026-06-01', kilos: 10 },
      { id: 'c2', siembraId: 's2', fecha: '2026-05-01', kilos: 4 },
    ],
  };
}

const config = { precioAgua: 2, impuestos: 0, precios: { tomate: 2, lechuga: 1.5 } };

test('calcula ingresos, agua, gastos y beneficio de la temporada', () => {
  const r = calcularBeneficio(datosBase(), config, temporada);
  expect(r.ingresos).toBeCloseTo(26);
  expect(r.litros).toBe(1000);
  expect(r.agua).toBeCloseTo(2);
  expect(r.gastos).toBe(15);
  expect(r.beneficio).toBeCloseTo(9);
});

test('no cuenta riegos fuera de la temporada ni parcelas sin uso', () => {
  const r = calcularBeneficio(datosBase(), config, temporada);
  expect(r.porParcela.map((x) => x.parcela.id)).toEqual(['p1', 'p2']);
});

test('reparte el beneficio por parcela', () => {
  const r = calcularBeneficio(datosBase(), config, temporada);
  const p1 = r.porParcela.find((x) => x.parcela.id === 'p1');
  expect(p1.ingresos).toBeCloseTo(20);
  expect(p1.agua).toBeCloseTo(1);
  expect(p1.beneficio).toBeCloseTo(9);
});

test('aplica impuestos solo si hay beneficio', () => {
  const conImpuestos = { ...config, impuestos: 20 };
  expect(calcularBeneficio(datosBase(), conImpuestos, temporada).impuestos).toBeCloseTo(1.8);
  const caro = { ...conImpuestos, precios: { tomate: 0.1, lechuga: 0.1 } };
  const r = calcularBeneficio(datosBase(), caro, temporada);
  expect(r.impuestos).toBe(0);
  expect(r.beneficio).toBeLessThan(0);
});

test('avisa de cultivos sin precio', () => {
  const datos = datosBase();
  datos.siembras[1].cultivo = 'Kiwano';
  const r = calcularBeneficio(datos, config, temporada);
  expect(r.sinPrecio).toEqual(['Kiwano']);
  expect(r.ingresos).toBeCloseTo(20);
});

test('sin temporada devuelve todo a cero', () => {
  expect(calcularBeneficio(datosBase(), config, null).beneficio).toBe(0);
});

test('formatea euros con coma', () => {
  expect(euros(12.5)).toBe('12,50 EUR');
  expect(euros(-3)).toBe('-3,00 EUR');
});
