import { escapar, htmlBalance } from '../src/informe';

const datos = {
  temporadas: [{ id: 't1', nombre: 'Primavera <2026>', inicio: '2026-03-01', fin: '2026-06-30' }],
  parcelas: [{ id: 'p1', nombre: 'Bancal 1', gastos: '10' }],
  siembras: [{ id: 's1', cultivo: 'Tomate', parcelaId: 'p1', temporadaId: 't1', fecha: '2026-03-10' }],
  riegos: [{ id: 'r1', parcelaId: 'p1', fecha: '2026-04-01', litros: '1000' }],
  cosechas: [{ id: 'c1', siembraId: 's1', fecha: '2026-06-01', kilos: '20' }],
};
const config = { precios: { tomate: 2 }, precioAgua: 2, impuestos: 0 };

test('escapar quita los caracteres peligrosos', () => {
  expect(escapar('<a href="x">&\'</a>')).toBe('&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;');
});

test('el informe tiene el balance, las parcelas y los kilos', () => {
  const html = htmlBalance(datos, config, datos.temporadas[0], 'Raul', '2026-11-25');
  expect(html).toContain('Primavera &lt;2026&gt;');
  expect(html).toContain('01/03/2026 - 30/06/2026');
  expect(html).toContain('25/11/2026');
  expect(html).toContain('Bancal 1');
  expect(html).toContain('Tomate');
  expect(html).toContain('20,0 kg');
  expect(html).toContain('28,00 EUR');
  expect(html).not.toContain('<2026>');
});
