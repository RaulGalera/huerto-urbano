import { useState } from 'react';
import ListaEditable from '../componentes/ListaEditable';
import { hoy, useDatos } from '../datos';
import Chips from '../componentes/Chips';
import { claveCultivo, cultivosDe, nombrePor, numero, ordenarPorFecha, temporadaActual, verFecha } from '../util';
import { estadoSiembra } from '../cultivos';
import { colores } from '../estilos';
import { t } from '../idioma';

export default function Siembras() {
  const { datos } = useDatos();
  const actual = temporadaActual(datos.temporadas, hoy());
  const [filtroGuardado, setFiltro] = useState(null);
  const filtro = filtroGuardado === 'todas' || datos.temporadas.some((t) => t.id === filtroGuardado) ? filtroGuardado : actual ? actual.id : 'todas';
  const temporadas = ordenarPorFecha(datos.temporadas, 'inicio');
  const [verdura, setVerdura] = useState('todas');

  const campos = [
    { clave: 'cultivo', etiqueta: t('Cultivo'), tipo: 'texto', obligatorio: true, ejemplo: t('Ej: Tomate') },
    { clave: 'parcelaId', etiqueta: t('Parcela'), tipo: 'desplegable', obligatorio: true, opciones: datos.parcelas.map((p) => ({ valor: p.id, texto: p.nombre })) },
    { clave: 'temporadaId', etiqueta: t('Temporada'), tipo: 'desplegable', obligatorio: true, opciones: temporadas.map((t) => ({ valor: t.id, texto: t.nombre })) },
    { clave: 'fecha', etiqueta: t('Fecha de siembra'), tipo: 'fecha', obligatorio: true },
    { clave: 'cantidad', etiqueta: t('Plantas o semillas'), tipo: 'numero' },
    { clave: 'notas', etiqueta: t('Notas'), tipo: 'largo' },
  ];

  const filtros = [...temporadas.map((t) => ({ id: t.id, texto: t.nombre })), { id: 'todas', texto: t('Todas') }];
  const deTemporada = filtro === 'todas' ? datos.siembras : datos.siembras.filter((s) => s.temporadaId === filtro);
  const verduras = cultivosDe(deTemporada);
  const verduraActiva = verduras.some((v) => v.id === verdura) ? verdura : 'todas';
  const items = ordenarPorFecha(verduraActiva === 'todas' ? deTemporada : deTemporada.filter((s) => claveCultivo(s.cultivo) === verduraActiva));

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

  const cabecera = (
    <>
      <Chips opciones={filtros} valor={filtro} onCambiar={setFiltro} abajo={verduras.length > 1 ? 8 : 14} />
      {verduras.length > 1 ? <Chips opciones={[{ id: 'todas', texto: t('Todas las verduras') }, ...verduras]} valor={verduraActiva} onCambiar={setVerdura} /> : null}
    </>
  );

  return (
    <ListaEditable
      tipo="siembras"
      icono="leaf"
      titulo={t('Siembras')}
      textoNuevo={t('Nueva siembra')}
      tituloEditar={t('Editar siembra')}
      campos={campos}
      cabecera={cabecera}
      nuevo={() => ({
        cultivo: '',
        parcelaId: datos.parcelas.length === 1 ? datos.parcelas[0].id : undefined,
        temporadaId: filtro !== 'todas' ? filtro : actual ? actual.id : undefined,
        fecha: hoy(),
        cantidad: '',
        notas: '',
      })}
      items={items}
      renderTitulo={(s) => s.cultivo}
      renderTexto={(s) => [
        [nombrePor(datos.parcelas, s.parcelaId), verFecha(s.fecha), s.cantidad ? s.cantidad + ' ' + t('plantas') : ''].filter(Boolean).join(' - '),
        cosechaEstimada(s),
        cosechado(s.id),
      ]}
      renderDato={estimacion}
      avisoBorrar={t('Se borraran tambien sus cosechas. Continuar?')}
    />
  );
}
