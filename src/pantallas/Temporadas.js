import ListaEditable from '../componentes/ListaEditable';
import { hoy, useDatos } from '../datos';
import { colores } from '../estilos';
import { numero, ordenarPorFecha, verFecha } from '../util';
import { useCuenta } from '../cuenta';
import { calcularBeneficio, euros } from '../calculos';
import { t } from '../idioma';

export default function Temporadas() {
  const { datos } = useDatos();
  const { config } = useCuenta();

  function balance(tem) {
    const ids = datos.siembras.filter((s) => s.temporadaId === tem.id).map((s) => s.id);
    const kilos = datos.cosechas.filter((c) => ids.includes(c.siembraId)).reduce((a, c) => a + (Number(c.kilos) || 0), 0);
    if (!ids.length) return null;
    return ids.length + ' ' + t(ids.length === 1 ? 'siembra' : 'siembras') + ' - ' + numero(kilos) + ' kg - ' + euros(calcularBeneficio(datos, config, tem).beneficio);
  }
  const f = hoy();
  const campos = [
    { clave: 'nombre', etiqueta: t('Nombre'), tipo: 'texto', obligatorio: true, ejemplo: t('Ej: Primavera 2026') },
    { clave: 'inicio', etiqueta: t('Fecha de inicio'), tipo: 'fecha', obligatorio: true },
    { clave: 'fin', etiqueta: t('Fecha de fin'), tipo: 'fecha', obligatorio: true },
  ];
  return (
    <ListaEditable
      tipo="temporadas"
      icono="calendar"
      titulo={t('Temporadas')}
      textoNuevo={t('Nueva temporada')}
      tituloEditar={t('Editar temporada')}
      campos={campos}
      nuevo={() => ({ nombre: '', inicio: '', fin: '' })}
      items={ordenarPorFecha(datos.temporadas, 'inicio')}
      renderTitulo={(tem) => tem.nombre}
      renderTexto={(tem) => [verFecha(tem.inicio) + ' - ' + verFecha(tem.fin), balance(tem)]}
      renderDato={(tem) => (tem.inicio <= f && f <= tem.fin ? { texto: t('Actual'), color: colores.verde } : null)}
      avisoBorrar={t('Se borraran tambien las siembras y cosechas de esta temporada. Continuar?')}
    />
  );
}
