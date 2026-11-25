import { diasDelMes } from '../src/util';

test('noviembre de 2026 empieza en domingo y tiene 30 dias', () => {
  const celdas = diasDelMes(2026, 10);
  expect(celdas.slice(0, 7)).toEqual([null, null, null, null, null, null, 1]);
  expect(celdas.filter(Boolean).length).toBe(30);
  expect(celdas.length % 7).toBe(0);
});

test('febrero de 2028 es bisiesto', () => {
  expect(diasDelMes(2028, 1).filter(Boolean).length).toBe(29);
});
