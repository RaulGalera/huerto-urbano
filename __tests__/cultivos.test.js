import { estadoSiembra, fechaCosecha, infoCultivo, paraSembrar } from '../src/cultivos';

test('calcula la fecha de cosecha estimada', () => {
  expect(infoCultivo('Tomates').dias).toBe(80);
  expect(fechaCosecha({ cultivo: 'Rabano', fecha: '2026-01-01' })).toBe('2026-01-31');
  expect(fechaCosecha({ cultivo: 'Kiwano', fecha: '2026-01-01' })).toBeNull();
});

test('marca la siembra como lista solo si no se ha cosechado', () => {
  const s = { id: 's1', cultivo: 'Rabano', fecha: '2026-01-01' };
  expect(estadoSiembra(s, [], '2026-01-20')).toMatchObject({ faltan: 11, lista: false });
  expect(estadoSiembra(s, [], '2026-02-05').lista).toBe(true);
  expect(estadoSiembra(s, [{ siembraId: 's1' }], '2026-02-05').lista).toBe(false);
});

test('dice que se puede sembrar cada mes', () => {
  expect(paraSembrar(11)).toContain('ajo');
  expect(paraSembrar(7)).not.toContain('tomate');
});
