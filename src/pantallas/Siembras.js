import ListaEditable from '../componentes/ListaEditable';
import { hoy, useDatos } from '../datos';
import { claveCultivo, cultivosDe, nombrePor, numero, ordenarPorFecha, temporadaActual, verFecha } from '../util';
import { estadoSiembra } from '../cultivos';
import { consejosSiembra } from '../consejos';
import { colores } from '../estilos';
import { t } from '../idioma';

export default function Siembras() {
  const { datos } = useDatos();
  const actual = temporadaActual(datos.temporadas, hoy());
  const temporadas = ordenarPorFecha(datos.temporadas, 'inicio');

  const campos = [
    { clave: 'cultivo', etiqueta: t('Cultivo'), tipo: 'texto', obligatorio: true, ejemplo: t('Ej: Tomate') },
    { clave: 'parcelaId', etiqueta: t('Parcela'), tipo: 'desplegable', obligatorio: true, opciones: datos.parcelas.map((p) => ({ valor: p.id, texto: p.nombre })) },
    { clave: 'temporadaId', etiqueta: t('Temporada'), tipo: 'desplegable', obligatorio: true, opciones: temporadas.map((x) => ({ valor: x.id, texto: x.nombre })), ayudaAqui: true },
    { clave: 'fecha', etiqueta: t('Fecha de siembra'), tipo: 'fecha', obligatorio: true },
    { clave: 'cantidad', etiqueta: t('Plantas o semillas'), tipo: 'numero' },
    { clave: 'notas', etiqueta: t('Notas'), tipo: 'largo' },
  ];

  const filtros = [
    { clave: 'temporada', titulo: t('Temporada'), opciones: temporadas.map((x) => ({ id: x.id, texto: x.nombre })), defecto: actual ? actual.id : 'todas', aplica: (s, id) => s.temporadaId === id },
    { clave: 'parcela', titulo: t('Parcela'), opciones: datos.parcelas.map((p) => ({ id: p.id, texto: p.nombre })), aplica: (s, id) => s.parcelaId === id },
    { clave: 'verdura', titulo: t('Verdura'), opciones: cultivosDe(datos.siembras), aplica: (s, id) => claveCultivo(s.cultivo) === id },
  ];

  function estimacion(s) {
    const e = estadoSiembra(s, datos.cosechas, hoy());
    if (!e) return null;
    if (e.lista) return { texto: t('Lista para cosechar'), color: colores.verde };
    if (e.faltan > 0 && !e.cosechada) return { texto: t('Cosecha en') + ' ' + e.faltan + ' ' + t(e.faltan === 1 ? 'dia' : 'dias'), color: colores.naranja };
    return null;
  }

  function cosechaEstimada(s) {
    const e = estadoSiembra(s, datos.cosechas, hoy());
    return e ? t('Cosecha estimada:') + ' ' + verFecha(e.fecha) : t('Cultivo sin fecha de cosecha conocida');
  }

  function cosechado(id) {
    const lista = datos.cosechas.filter((c) => c.siembraId === id);
    if (!lista.length) return t('Sin cosechas');
    const kilos = lista.reduce((a, c) => a + (Number(c.kilos) || 0), 0);
    return lista.length + ' ' + t(lista.length === 1 ? 'cosecha' : 'cosechas') + ' - ' + numero(kilos) + ' kg';
  }

  return (
    <ListaEditable
      tipo="siembras"
      icono="leaf"
      titulo={t('Siembras')}
      textoNuevo={t('Nueva siembra')}
      tituloEditar={t('Editar siembra')}
      campos={campos}
      ayuda={(v) => consejosSiembra(datos, v)}
      filtros={filtros}
      resumen={(lista) => lista.length + ' ' + t(lista.length === 1 ? 'siembra' : 'siembras')}
      nuevo={(f) => ({
        cultivo: '',
        parcelaId: f.parcela !== 'todas' ? f.parcela : datos.parcelas.length === 1 ? datos.parcelas[0].id : undefined,
        temporadaId: f.temporada !== 'todas' ? f.temporada : actual ? actual.id : undefined,
        fecha: hoy(),
        cantidad: '',
        notas: '',
      })}
      items={ordenarPorFecha(datos.siembras)}
      renderTitulo={(s) => s.cultivo}
      renderTexto={(s) => [
        [nombrePor(datos.parcelas, s.parcelaId), verFecha(s.fecha), s.cantidad ? s.cantidad + ' ' + t('plantas') : ''].filter(Boolean).join(' - '),
        cosechaEstimada(s) + ' - ' + cosechado(s.id),
      ]}
      renderDato={estimacion}
      avisoBorrar={t('Se borraran tambien sus cosechas. Continuar?')}
    />
  );
}
