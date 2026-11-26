import ListaEditable from '../componentes/ListaEditable';
import { hoy, useDatos } from '../datos';
import { claveCultivo, cultivosDe, nombrePor, numero, ordenarPorFecha, temporadaActual, textoSiembra, verFecha } from '../util';
import { t } from '../idioma';

export default function Cosechas() {
  const { datos } = useDatos();
  const campos = [
    { clave: 'siembraId', etiqueta: t('Siembra'), tipo: 'desplegable', obligatorio: true, opciones: ordenarPorFecha(datos.siembras).map((s) => ({ valor: s.id, texto: textoSiembra(s, datos.parcelas) })) },
    { clave: 'fecha', etiqueta: t('Fecha'), tipo: 'fecha', obligatorio: true },
    { clave: 'kilos', etiqueta: t('Kilos'), tipo: 'numero', obligatorio: true },
    { clave: 'notas', etiqueta: t('Notas'), tipo: 'largo' },
  ];

  function siembra(c) {
    return datos.siembras.find((x) => x.id === c.siembraId);
  }

  const temporadas = ordenarPorFecha(datos.temporadas, 'inicio');
  const actual = temporadaActual(datos.temporadas, hoy());
  const cosechadas = datos.siembras.filter((s) => datos.cosechas.some((c) => c.siembraId === s.id));
  const filtros = [
    { clave: 'verdura', titulo: t('Verdura'), opciones: cultivosDe(cosechadas), aplica: (c, id) => siembra(c) && claveCultivo(siembra(c).cultivo) === id },
    { clave: 'parcela', titulo: t('Parcela'), opciones: datos.parcelas.map((p) => ({ id: p.id, texto: p.nombre })), aplica: (c, id) => siembra(c) && siembra(c).parcelaId === id },
    { clave: 'temporada', titulo: t('Temporada'), opciones: temporadas.map((x) => ({ id: x.id, texto: x.nombre })), defecto: actual ? actual.id : 'todas', aplica: (c, id) => siembra(c) && siembra(c).temporadaId === id },
  ];
  function resumen(lista) {
    const kilos = lista.reduce((a, c) => a + (Number(c.kilos) || 0), 0);
    return lista.length + ' ' + t(lista.length === 1 ? 'cosecha' : 'cosechas') + ' - ' + numero(kilos) + ' ' + t('kg en total');
  }

  return (
    <ListaEditable
      tipo="cosechas"
      icono="basket"
      titulo={t('Cosechas')}
      textoNuevo={t('Nueva cosecha')}
      tituloEditar={t('Editar cosecha')}
      campos={campos}
      nuevo={() => ({ siembraId: undefined, fecha: hoy(), kilos: '', notas: '' })}
      filtros={filtros}
      resumen={resumen}
      items={ordenarPorFecha(datos.cosechas)}
      renderTitulo={(c) => (siembra(c) ? siembra(c).cultivo : t('Siembra borrada')) + ' - ' + numero(c.kilos) + ' kg'}
      renderTexto={(c) => [(siembra(c) ? nombrePor(datos.parcelas, siembra(c).parcelaId) + ' - ' : '') + verFecha(c.fecha)]}
    />
  );
}
