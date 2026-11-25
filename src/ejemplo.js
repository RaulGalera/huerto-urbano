function dia(base, desplazamiento) {
  const d = new Date(base + 'T00:00:00Z');
  d.setUTCDate(d.getUTCDate() + desplazamiento);
  return d.toISOString().slice(0, 10);
}

export function crearDatosEjemplo(hoy) {
  let n = 0;
  const id = () => 'ej' + Date.now().toString(36) + (n++).toString(36);

  const actual = { id: id(), nombre: 'Temporada actual', inicio: dia(hoy, -90), fin: dia(hoy, 60) };
  const anterior = { id: id(), nombre: 'Temporada anterior', inicio: dia(hoy, -270), fin: dia(hoy, -91) };

  const parcelas = [
    { id: id(), nombre: 'Bancal 1', metros: 6, ubicacion: 'Patio trasero', gastos: 6, notas: 'Tierra con compost' },
    { id: id(), nombre: 'Bancal 2', metros: 8, ubicacion: 'Patio trasero', gastos: 2, notas: '' },
    { id: id(), nombre: 'Mesa de cultivo', metros: 2, ubicacion: 'Terraza', gastos: 3, notas: '' },
    { id: id(), nombre: 'Macetas', metros: 1, ubicacion: 'Balcon', gastos: 2, notas: '' },
  ];
  const [b1, b2, mesa, macetas] = parcelas;

  const siembras = [
    { id: id(), cultivo: 'Tomate', parcelaId: b1.id, temporadaId: actual.id, fecha: dia(hoy, -80), cantidad: 10, notas: 'Variedad cherry' },
    { id: id(), cultivo: 'Pimiento', parcelaId: b1.id, temporadaId: actual.id, fecha: dia(hoy, -75), cantidad: 6, notas: '' },
    { id: id(), cultivo: 'Calabacin', parcelaId: b2.id, temporadaId: actual.id, fecha: dia(hoy, -70), cantidad: 4, notas: '' },
    { id: id(), cultivo: 'Lechuga', parcelaId: mesa.id, temporadaId: actual.id, fecha: dia(hoy, -60), cantidad: 12, notas: '' },
    { id: id(), cultivo: 'Fresa', parcelaId: macetas.id, temporadaId: actual.id, fecha: dia(hoy, -85), cantidad: 8, notas: '' },
    { id: id(), cultivo: 'Cebolla', parcelaId: b2.id, temporadaId: anterior.id, fecha: dia(hoy, -250), cantidad: 30, notas: '' },
    { id: id(), cultivo: 'Habas', parcelaId: b1.id, temporadaId: anterior.id, fecha: dia(hoy, -240), cantidad: 20, notas: '' },
  ];
  const [tomate, pimiento, calabacin, lechuga, fresa, cebolla, habas] = siembras;

  const cosechas = [
    [tomate, -30, 3.5], [tomate, -18, 6], [tomate, -6, 4.2],
    [pimiento, -20, 1.8], [pimiento, -8, 1.4],
    [calabacin, -25, 3], [calabacin, -12, 2.5],
    [lechuga, -15, 1.2], [lechuga, -3, 1.6],
    [fresa, -10, 0.9],
    [cebolla, -120, 6.5], [habas, -130, 4],
  ].map(([s, d, kilos]) => ({ id: id(), siembraId: s.id, fecha: dia(hoy, d), kilos, notas: '' }));

  const riegos = [];
  const plan = [
    [b1, 2, 10, 'Goteo', 0],
    [b2, 3, 12, 'Manguera', 4],
    [mesa, 2, 5, 'Regadera', 1],
    [macetas, 1, 3, 'Regadera', 0],
  ];
  plan.forEach(([p, cada, litros, metodo, ultimo]) => {
    for (let d = -84; d <= -ultimo; d += cada) {
      riegos.push({ id: id(), parcelaId: p.id, fecha: dia(hoy, d), litros, metodo });
    }
    riegos.push({ id: id(), parcelaId: p.id, fecha: dia(hoy, -ultimo), litros, metodo });
  });

  return { temporadas: [actual, anterior], parcelas, siembras, riegos, cosechas };
}
