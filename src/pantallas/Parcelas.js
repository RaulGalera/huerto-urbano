import ListaEditable from '../componentes/ListaEditable';
import { hoy, useDatos } from '../datos';
import { colores } from '../estilos';
import { numero, temporadaActual } from '../util';
import { ultimaAgua } from '../avisos';
import { t } from '../idioma';

export function estadoRiego(agua) {
  if (!agua) return { texto: t('Sin riegos'), color: colores.rojo };
  const dias = agua.dias;
  if (agua.lluvia && dias <= 2) return { texto: dias === 1 ? t('Llovio ayer') : t('Llovio hace') + ' ' + dias + ' ' + t('dias'), color: colores.verde };
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
    {
      clave: 'aireLibre',
      etiqueta: t('Le cae la lluvia'),
      tipo: 'chips',
      defecto: 'si',
      opciones: [
        { valor: 'si', texto: t('Si, al aire libre') },
        { valor: 'no', texto: t('No, esta cubierta') },
      ],
    },
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
      nuevo={() => ({ nombre: '', metros: '', ubicacion: '', aireLibre: 'si', gastos: '', notas: '' })}
      items={[...datos.parcelas].sort((a, b) => a.nombre.localeCompare(b.nombre))}
      renderTitulo={(p) => p.nombre}
      renderTexto={(p) => [[p.metros !== '' && p.metros !== undefined ? numero(p.metros, Number.isInteger(p.metros) ? 0 : 1) + ' m2' : '', p.ubicacion].filter(Boolean).join(' - '), cultivos(p.id)]}
      renderDato={(p) => estadoRiego(ultimaAgua(datos, p, hoy()))}
      avisoBorrar={t('Se borraran tambien sus siembras, riegos y cosechas. Continuar?')}
    />
  );
}
