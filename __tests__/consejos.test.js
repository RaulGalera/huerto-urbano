import { consejosSiembra, familiaDe, relacion, repiteFamilia, temporadaAnterior, vecinas } from '../src/consejos';

const datos = {
  temporadas: [
    { id: 't1', nombre: 'Primavera', inicio: '2026-03-01', fin: '2026-08-31' },
    { id: 't2', nombre: 'Otono', inicio: '2026-09-01', fin: '2027-02-28' },
  ],
  parcelas: [{ id: 'p1', nombre: 'Bancal 1' }, { id: 'p2', nombre: 'Bancal 2' }],
  siembras: [
    { id: 's1', cultivo: 'Pimiento', parcelaId: 'p1', temporadaId: 't1' },
    { id: 's2', cultivo: 'Judia verde', parcelaId: 'p2', temporadaId: 't1' },
    { id: 's3', cultivo: 'Cebolla', parcelaId: 'p1', temporadaId: 't2' },
    { id: 's4', cultivo: 'Lechuga', parcelaId: 'p1', temporadaId: 't2' },
  ],
};

test('familias y relaciones entre cultivos', () => {
  expect(familiaDe('Tomates')).toBe('solanaceas');
  expect(familiaDe('Kiwi')).toBeNull();
  expect(relacion('tomate', 'Lechugas')).toBe('amiga');
  expect(relacion('Patata', 'tomate')).toBe('enemiga');
  expect(relacion('tomate', 'fresa')).toBeNull();
  expect(relacion('tomate', 'tomate')).toBeNull();
});

test('temporada anterior por fecha de inicio', () => {
  expect(temporadaAnterior(datos.temporadas, 't2').id).toBe('t1');
  expect(temporadaAnterior(datos.temporadas, 't1')).toBeNull();
});

test('avisa si se repite familia en la misma parcela', () => {
  const r = repiteFamilia(datos, { cultivo: 'Tomate', parcelaId: 'p1', temporadaId: 't2' });
  expect(r).toEqual({ familia: 'solanaceas', temporada: 'Primavera', cultivos: ['Pimiento'] });
  expect(repiteFamilia(datos, { cultivo: 'Tomate', parcelaId: 'p2', temporadaId: 't2' })).toBeNull();
  expect(repiteFamilia(datos, { cultivo: 'Zanahoria', parcelaId: 'p1', temporadaId: 't2' })).toBeNull();
});

test('vecinas amigas y enemigas en la misma parcela y temporada', () => {
  expect(vecinas(datos, { cultivo: 'Tomate', parcelaId: 'p1', temporadaId: 't2' })).toEqual({ amigas: ['Cebolla', 'Lechuga'], enemigas: [] });
  expect(vecinas(datos, { cultivo: 'Guisante', parcelaId: 'p1', temporadaId: 't2' })).toEqual({ amigas: [], enemigas: ['Cebolla'] });
  expect(vecinas(datos, { id: 's3', cultivo: 'Cebolla', parcelaId: 'p1', temporadaId: 't2' }).amigas).toEqual([]);
});

test('consejos para el formulario', () => {
  const c = consejosSiembra(datos, { cultivo: 'Tomate', parcelaId: 'p1', temporadaId: 't2' });
  expect(c.map((x) => x.tono)).toEqual(['mal', 'bien']);
  expect(c[0].texto).toBe('Rotacion: en esta parcela hubo Pimiento (solanaceas) en Primavera. Mejor cambiar de familia para no cansar la tierra.');
  expect(c[1].texto).toBe('Se lleva bien con Cebolla, Lechuga, que ya estan en esta parcela.');
  expect(consejosSiembra(datos, { cultivo: '', parcelaId: 'p1' })).toEqual([]);
});
