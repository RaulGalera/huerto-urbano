import ListaEditable from '../componentes/ListaEditable';
import { hoy, useDatos } from '../datos';
import { colores } from '../estilos';
import { numero, temporadaActual, ultimoRiego } from '../util';
import { t } from '../idioma';

export function estadoRiego(dias) {
  if (dias === null) return { texto: t('Sin riegos'), color: colores.rojo };
  if (dias <= 0) return { texto: t('Regada hoy'), color: colores.verde };
  if (dias === 1) return { texto: t('Regada ayer'), color: colores.verde };
  if (dias === 2) return { texto: t('Regada hace 2 dias'), color: colores.verde };
  return { texto: dias + ' ' + t('dias sin riego'), color: dias === 3 ? colores.naranja : colores.rojo };
}

export default function Parcelas() {
  const { datos } = useDatos();
  const actual = temporadaActual(datos.temporadas, hoy());

  function cultivos(id) {
    if (!actual) return '';
    const lista = datos.siembras.filter((s) => s.parcelaId === id && s.temporadaId === actual.id).map((s) => s.cultivo);
    return lista.length ? t('Cultivos:') + ' ' + [...new Set(lista)].join(', ') : '';
  }
  const campos = [
    { clave: 'nombre', etiqueta: t('Nombre'), tipo: 'texto', obligatorio: true, ejemplo: t('Ej: Bancal 1') },
    { clave: 'metros', etiqueta: t('Superficie (m2)'), tipo: 'numero' },
    { clave: 'ubicacion', etiqueta: t('Ubicacion'), tipo: 'texto', ejemplo: t('Ej: Terraza') },
    { clave: 'gastos', etiqueta: t('Gastos por temporada (EUR)'), tipo: 'numero', ejemplo: t('Alquiler, IBI, abono, semillas...') },
    { clave: 'notas', etiqueta: t('Notas'), tipo: 'largo' },
  ];

  return (
    <ListaEditable
      tipo="parcelas"
      icono="grid"
      titulo={t('Parcelas')}
      textoNuevo={t('Nueva parcela')}
      tituloEditar={t('Editar parcela')}
      campos={campos}
      nuevo={() => ({ nombre: '', metros: '', ubicacion: '', gastos: '', notas: '' })}
      items={[...datos.parcelas].sort((a, b) => a.nombre.localeCompare(b.nombre))}
      renderTitulo={(p) => p.nombre}
      renderTexto={(p) => [[p.metros !== '' && p.metros !== undefined ? numero(p.metros, Number.isInteger(p.metros) ? 0 : 1) + ' m2' : '', p.ubicacion].filter(Boolean).join(' - '), cultivos(p.id)]}
      renderDato={(p) => estadoRiego(ultimoRiego(datos.riegos, p.id))}
      avisoBorrar={t('Se borraran tambien sus siembras, riegos y cosechas. Continuar?')}
    />
  );
}
