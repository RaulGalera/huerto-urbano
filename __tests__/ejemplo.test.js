import { crearDatosEjemplo } from '../src/ejemplo';
import { sinRegar } from '../src/avisos';

test('los datos de ejemplo no repiten riegos el mismo dia en la misma parcela', () => {
  const datos = crearDatosEjemplo('2026-11-26');
  const vistos = new Set();
  datos.riegos.forEach((r) => {
    const clave = r.parcelaId + r.fecha;
    expect(vistos.has(clave)).toBe(false);
    vistos.add(clave);
  });
});

test('en los datos de ejemplo solo una parcela necesita agua', () => {
  const datos = crearDatosEjemplo('2026-11-26');
  expect(sinRegar(datos, '2026-11-26').map((a) => a.parcela.nombre)).toEqual(['Bancal 2']);
});
