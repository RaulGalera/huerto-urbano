import { celda, csvCosechas, csvRiegos, csvSiembras, tablaCsv } from '../src/csv';

const datos = {
  temporadas: [{ id: 't1', nombre: 'Primavera' }],
  parcelas: [{ id: 'p1', nombre: 'Bancal 1' }],
  siembras: [{ id: 's1', cultivo: 'Tomate', parcelaId: 'p1', temporadaId: 't1', fecha: '2026-03-10', cantidad: 10, notas: 'Con "compost"; bien' }],
  riegos: [
    { id: 'r2', parcelaId: 'p1', fecha: '2026-04-02', litros: 12.5, metodo: 'Goteo' },
    { id: 'r1', parcelaId: 'p1', fecha: '2026-04-01', litros: 10, metodo: 'Manguera' },
  ],
  cosechas: [{ id: 'c1', siembraId: 's1', fecha: '2026-06-01', kilos: 4.2 }],
};

test('escapa las celdas con punto y coma o comillas', () => {
  expect(celda('hola')).toBe('hola');
  expect(celda('a;b')).toBe('"a;b"');
  expect(celda('dijo "si"')).toBe('"dijo ""si"""');
  expect(celda(undefined)).toBe('');
});

test('la tabla lleva BOM para que Excel lea bien el texto', () => {
  expect(tablaCsv(['A', 'B'], [[1, 2]])).toBe('\ufeffA;B\r\n1;2\r\n');
});

test('riegos ordenados por fecha con coma decimal', () => {
  const lineas = csvRiegos(datos).replace('\ufeff', '').trim().split('\r\n');
  expect(lineas).toEqual(['Fecha;Parcela;Litros;Metodo', '01/04/2026;Bancal 1;10;Manguera', '02/04/2026;Bancal 1;12,5;Goteo']);
});

test('cosechas y siembras con su parcela y temporada', () => {
  expect(csvCosechas(datos)).toContain('01/06/2026;Tomate;Bancal 1;Primavera;4,2');
  expect(csvSiembras(datos)).toContain('10/03/2026;Tomate;Bancal 1;Primavera;10;"Con ""compost""; bien"');
});
