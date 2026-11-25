import ListaEditable from '../componentes/ListaEditable';
import { hoy, useDatos } from '../datos';
import { colores } from '../estilos';
import { numero, temporadaActual, ultimoRiego } from '../util';

export function estadoRiego(dias) {
  if (dias === null) return { texto: 'Sin riegos', color: colores.rojo };
  if (dias <= 0) return { texto: 'Regada hoy', color: colores.verde };
  if (dias === 1) return { texto: 'Regada ayer', color: colores.verde };
  if (dias === 2) return { texto: 'Regada hace 2 dias', color: colores.verde };
  return { texto: dias + ' dias sin riego', color: dias === 3 ? colores.naranja : colores.rojo };
}

export default function Parcelas() {
  const { datos } = useDatos();
  const actual = temporadaActual(datos.temporadas, hoy());

  function cultivos(id) {
    if (!actual) return '';
    const lista = datos.siembras.filter((s) => s.parcelaId === id && s.temporadaId === actual.id).map((s) => s.cultivo);
    return lista.length ? 'Cultivos: ' + [...new Set(lista)].join(', ') : '';
  }
  const campos = [
    { clave: 'nombre', etiqueta: 'Nombre', tipo: 'texto', obligatorio: true, ejemplo: 'Ej: Bancal 1' },
    { clave: 'metros', etiqueta: 'Superficie (m2)', tipo: 'numero' },
    { clave: 'ubicacion', etiqueta: 'Ubicacion', tipo: 'texto', ejemplo: 'Ej: Terraza' },
    { clave: 'gastos', etiqueta: 'Gastos por temporada (EUR)', tipo: 'numero', ejemplo: 'Alquiler, IBI, abono, semillas...' },
    { clave: 'notas', etiqueta: 'Notas', tipo: 'largo' },
  ];

  return (
    <ListaEditable
      tipo="parcelas"
      icono="grid"
      titulo="Parcelas"
      textoNuevo="Nueva parcela"
      tituloEditar="Editar parcela"
      campos={campos}
      nuevo={() => ({ nombre: '', metros: '', ubicacion: '', gastos: '', notas: '' })}
      items={[...datos.parcelas].sort((a, b) => a.nombre.localeCompare(b.nombre))}
      renderTitulo={(p) => p.nombre}
      renderTexto={(p) => [[p.metros !== '' && p.metros !== undefined ? numero(p.metros, Number.isInteger(p.metros) ? 0 : 1) + ' m2' : '', p.ubicacion].filter(Boolean).join(' - '), cultivos(p.id)]}
      renderDato={(p) => estadoRiego(ultimoRiego(datos.riegos, p.id))}
      avisoBorrar="Se borraran tambien sus siembras, riegos y cosechas. Continuar?"
    />
  );
}
