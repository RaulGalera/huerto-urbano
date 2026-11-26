# Cambios

Todos los cambios importantes de la app. Las fechas van en formato AAAA-MM-DD.

## [Sin publicar]

### Cambiado

- Precios reales: mayorista de Mercamadrid (Mercasa) y en origen del Ministerio de Agricultura, con su fuente y su fecha en la pantalla de admin. Los precios que el admin no habia tocado se actualizan solos.

## [1.0.0] - 2026-11-26

### Nuevo

- Rotacion de cultivos: al sembrar avisa si en esa parcela hubo la misma familia la temporada anterior.
- Plantas amigas y enemigas: al sembrar dice si el cultivo se lleva bien o mal con lo que ya hay en la parcela.
- La lluvia de los ultimos 3 dias cuenta como riego en las parcelas al aire libre (5 mm o mas).
- Exportar siembras, riegos y cosechas a Excel (CSV).
- Avisos de riego en el movil a las 9:00 si una parcela lleva 3 dias o mas sin regar.
- Comparar dos temporadas: kilos, agua, ingresos, gastos, beneficio y cultivo estrella.
- Panel de filtros por temporada, parcela, verdura y metodo de riego.
- Balance de la temporada en PDF.
- Guia de bienvenida de tres pasos.
- Modo oscuro y graficas en el inicio.

### Cambiado

- Riegos y cosechas empiezan filtrados por la temporada actual, igual que las siembras.
- Las fechas usan la hora del movil en vez de la hora UTC.
- La zona segura de la pantalla usa react-native-safe-area-context.

### Arreglado

- Mi cuenta ya no se cierra al cambiar el idioma o el tema.
- Los avisos de riego se quitan al cerrar sesion o borrar la cuenta.
- Los datos de ejemplo ya no repiten riegos el mismo dia.

## [0.9.0] - 2026-11-25

### Nuevo

- Temporadas, parcelas, siembras, riegos y cosechas con buscador.
- Calendario de cultivos con fecha de cosecha estimada y que sembrar cada mes.
- Prevision del tiempo con Open-Meteo y consejo de riego.
- Calculo del beneficio por temporada y por parcela.
- Usuarios con contrasena con sal, modo administrador y precios de mercado.
- Espanol e ingles.
- Privacidad y cumplimiento del RGPD: politica, aviso legal, exportar y borrar la cuenta.
- Copia de seguridad para exportar y restaurar los datos.
- Tests con Jest.
