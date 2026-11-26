import ListaEditable from '../componentes/ListaEditable';
import { hoy, useDatos } from '../datos';
import { colores } from '../estilos';
import { nombrePor, numero, ordenarPorFecha, verFecha } from '../util';
import { t } from '../idioma';

export default function Riegos() {
  const { datos } = useDatos();
  const temporadas = ordenarPorFecha(datos.temporadas, 'inicio');
  const filtros = [
    { clave: 'parcela', titulo: t('Parcela'), opciones: datos.parcelas.map((p) => ({ id: p.id, texto: p.nombre })), aplica: (r, id) => r.parcelaId === id },
    {
      clave: 'temporada',
      titulo: t('Temporada'),
      opciones: temporadas.map((x) => ({ id: x.id, texto: x.nombre })),
      aplica: (r, id) => {
        const x = temporadas.find((y) => y.id === id);
        return r.fecha >= x.inicio && r.fecha <= x.fin;
      },
    },
    { clave: 'metodo', titulo: t('Metodo'), opciones: ['Manguera', 'Regadera', 'Goteo'].map((m) => ({ id: m, texto: t(m) })), aplica: (r, id) => r.metodo === id },
  ];
  function resumen(lista) {
    const litros = lista.reduce((a, r) => a + (Number(r.litros) || 0), 0);
    return lista.length + ' ' + t(lista.length === 1 ? 'riego' : 'riegos') + ' - ' + numero(litros, 0) + ' ' + t('litros en total');
  }
  const campos = [
    { clave: 'parcelaId', etiqueta: t('Parcela'), tipo: 'desplegable', obligatorio: true, opciones: datos.parcelas.map((p) => ({ valor: p.id, texto: p.nombre })) },
    { clave: 'fecha', etiqueta: t('Fecha'), tipo: 'fecha', obligatorio: true },
    { clave: 'litros', etiqueta: t('Litros'), tipo: 'numero' },
    {
      clave: 'metodo',
      etiqueta: t('Metodo'),
      tipo: 'chips',
      opciones: [
        { valor: 'Manguera', texto: t('Manguera') },
        { valor: 'Regadera', texto: t('Regadera') },
        { valor: 'Goteo', texto: t('Goteo') },
      ],
    },
  ];
  return (
    <ListaEditable
      tipo="riegos"
      icono="water"
      titulo={t('Riegos')}
      textoNuevo={t('Registrar riego')}
      tituloEditar={t('Editar riego')}
      campos={campos}
      filtros={filtros}
      resumen={resumen}
      nuevo={(f) => ({ parcelaId: f.parcela !== 'todas' ? f.parcela : datos.parcelas.length === 1 ? datos.parcelas[0].id : undefined, fecha: hoy(), litros: '', metodo: 'Manguera' })}
      items={ordenarPorFecha(datos.riegos)}
      renderTitulo={(r) => nombrePor(datos.parcelas, r.parcelaId)}
      renderTexto={(r) => [verFecha(r.fecha) + (r.litros !== '' && r.litros !== undefined ? ' - ' + numero(r.litros, Number.isInteger(r.litros) ? 0 : 1) + ' ' + t('litros') : '')]}
      renderDato={(r) => (r.metodo ? { texto: t(r.metodo), color: colores.gris } : null)}
    />
  );
}
