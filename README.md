# Huerto Urbano

App para gestionar un huerto urbano: parcelas, siembras, riegos y cosechas organizadas por temporadas, con calculo del beneficio de cada temporada.
Hecha con React Native y Expo. Funciona en movil (Expo Go), en web y en escritorio desde el navegador.

## Como arrancarla

1. Instalar Node.js 20 o superior.
2. En esta carpeta: `npm install`
3. `npx expo start`
   - Movil: escanear el QR con Expo Go, o por cable con `adb reverse tcp:8081 tcp:8081` y abrir `exp://127.0.0.1:8081` en Expo Go.
   - Web / escritorio: pulsar `w` o ejecutar `npm run web`.

## Tests

`npm test` ejecuta los tests de Jest de la carpeta __tests__: beneficio, fechas, precios, calendario de cultivos, consejo de riego y cifrado.

## Usuarios

- Cada usuario se registra con nombre, usuario y contrasena. Las contrasenas se guardan cifradas (SHA-256).
- Cada usuario tiene sus propios datos.
- La primera vez se crea un administrador: usuario `admin`, contrasena `admin123`. Conviene cambiarla desde Mi cuenta.

## Modo admin

Desde el icono de usuario de Inicio, los administradores ven ademas:

- Estadisticas de toda la app (usuarios, parcelas, kilos y agua de todos).
- Precios de mercado por cultivo (EUR/kg), precio del agua y porcentaje de impuestos.
- Gestion de usuarios: dar o quitar admin y borrar usuarios.
- Cargar un huerto de ejemplo para ensenar la app o borrar sus datos.

## Beneficio

Beneficio = kilos cosechados x precio de mercado - agua de los riegos - gastos de las parcelas - impuestos.
El calculo esta en src/calculos.js.

## Que hace cada pantalla

- Inicio: temporada a elegir, aviso de parcelas sin regar con boton Regar hoy, tiempo de 3 dias con consejo de riego, totales, calendario del huerto (siembras listas para cosechar y que sembrar este mes), kilos por cultivo y beneficio.
- Parcelas: alta, edicion y borrado. Muestra el estado del riego, los cultivos de la temporada actual y los gastos por temporada.
- Siembras: cultivo, parcela, temporada, fecha y cantidad. Filtro por temporada, fecha de cosecha estimada y kilos cosechados de cada siembra.
- Riegos: parcela, fecha, litros y metodo. Filtro por parcela y litros totales.
- Cosechas: siembra, fecha y kilos.
- Temporadas: nombre y fechas de inicio y fin.

Las fechas se eligen con un calendario y se muestran como DD/MM/AAAA. Para editar o borrar un registro, se pulsa sobre su tarjeta.
La ciudad del huerto se elige en Mi cuenta y se usa para el tiempo.

Los datos se guardan en el propio dispositivo con AsyncStorage (en web, en el almacenamiento del navegador).

## Estructura

- App.js: sesion, pestanas y navegacion.
- src/cuenta.js: usuarios, sesion y configuracion de precios.
- src/datos.js: guardado y carga de los datos de cada usuario.
- src/calculos.js: calculo del beneficio.
- src/precios.js: precios de mercado por defecto.
- src/cultivos.js: dias hasta la cosecha y meses de siembra de cada cultivo.
- src/tiempo.js: prevision del tiempo y consejo de riego con Open-Meteo (gratis y sin clave).
- src/componentes: lista editable y formulario reutilizables.
- src/pantallas: una pantalla por cada apartado, mas Login, Perfil y Admin.
