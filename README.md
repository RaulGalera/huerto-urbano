# Huerto Urbano

App multiplataforma para gestionar un huerto urbano: parcelas, siembras, riegos y cosechas organizadas por temporadas, con prevision del tiempo, calendario de cultivos y calculo del beneficio de cada temporada.

Proyecto final de 2 DAM. Hecha con React Native y Expo: un solo codigo para Android, iOS y web (escritorio desde el navegador).

![Expo SDK](https://img.shields.io/badge/Expo_SDK-58-000020)
![React Native](https://img.shields.io/badge/React_Native-0.88-61DAFB)
![Tests](https://img.shields.io/badge/tests-52_pasan-2E7D32)
![Idiomas](https://img.shields.io/badge/idiomas-ES_|_EN-informational)

## Indice

- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Puesta en marcha](#puesta-en-marcha)
- [Scripts](#scripts)
- [Tests](#tests)
- [Arquitectura](#arquitectura)
- [Modelo de datos](#modelo-de-datos)
- [Calculo del beneficio](#calculo-del-beneficio)
- [Idiomas](#idiomas)
- [Privacidad, ley y accesibilidad](#privacidad-ley-y-accesibilidad)
- [Seguridad](#seguridad)
- [Hoja de ruta](#hoja-de-ruta)
- [Convenciones del proyecto](#convenciones-del-proyecto)

## Funcionalidades

Gestion del huerto

- Temporadas con fecha de inicio y fin. Cada temporada muestra sus siembras, kilos y beneficio para poder compararlas.
- Parcelas con superficie, ubicacion, gastos por temporada y estado del riego.
- Siembras con cultivo, parcela, temporada, fecha y cantidad. Fecha de cosecha estimada segun el cultivo.
- Riegos con litros y metodo (manguera, regadera o goteo).
- Cosechas con kilos por siembra.
- Buscador en todas las listas (sin distinguir mayusculas ni tildes) y panel de filtros combinables por temporada, parcela, verdura y metodo de riego, con los filtros activos visibles y faciles de quitar.

Pantalla de inicio

- Aviso de parcelas sin regar desde hace 3 dias o mas, con boton "Regar hoy".
- Tiempo de los proximos 3 dias con Open-Meteo y consejo de riego (lluvia, calor o helada).
- Calendario del huerto: siembras listas para cosechar, proximas cosechas y que sembrar este mes.
- Graficas: kilos por cultivo y por mes, agua por parcela y beneficio por temporada.
- Beneficio de la temporada, total y por parcela, descargable en PDF.

Cuentas

- Registro e inicio de sesion locales. Cada usuario ve solo sus datos.
- Guia de bienvenida de tres pasos la primera vez que se entra.
- Idioma elegible al registrarse (espanol por defecto o ingles) y cambiable despues.
- Modo oscuro: como el movil, claro u oscuro.
- Mi cuenta: cambiar nombre, contrasena, idioma y ubicacion, copia de seguridad (exportar y restaurar), privacidad y borrar la cuenta.

Modo admin

- Estadisticas de toda la app.
- Precios de mercado por cultivo, precio del agua y porcentaje de impuestos.
- Gestion de usuarios (dar o quitar admin, borrar).
- Cargar un huerto de ejemplo para hacer demostraciones.

## Tecnologias

| Area | Tecnologia |
| --- | --- |
| Framework | React Native 0.88 con Expo SDK 58 |
| Lenguaje | JavaScript (React 19, hooks y Context) |
| Persistencia | AsyncStorage (localStorage en web) |
| Tiempo | API de Open-Meteo, modelo AROME de Meteo-France (gratis y sin clave) |
| Ubicacion | expo-location |
| Iconos | @expo/vector-icons (Ionicons) |
| PDF | expo-print y expo-sharing |
| Tests | Jest con jest-expo y Testing Library |

No usa librerias de navegacion: las pestanas y los modales estan hechos a mano para que la app sea ligera y facil de seguir.

## Puesta en marcha

Requisitos: Node.js 20 o superior y la app Expo Go en el movil (o Android Studio con un emulador).

```bash
git clone https://github.com/RaulGalera/huerto-urbano.git
cd huerto-urbano
npm install
npx expo start
```

- Movil por Wi-Fi: escanear el QR con Expo Go.
- Movil por cable: `adb reverse tcp:8081 tcp:8081` y abrir `exp://127.0.0.1:8081` en Expo Go.
- Web o escritorio: pulsar `w` en la terminal o ejecutar `npm run web`.

La primera vez se crea un administrador: usuario `admin`, contrasena `admin123`. Hay que cambiarla desde Mi cuenta.

## Scripts

| Comando | Que hace |
| --- | --- |
| `npm start` | Arranca Expo |
| `npm run android` | Abre la app en Android |
| `npm run ios` | Abre la app en iOS |
| `npm run web` | Abre la app en el navegador |
| `npm test` | Ejecuta los tests |

## Tests

```bash
npm test
```

52 tests en `__tests__/` que cubren: pantallas (bienvenida, graficas, filtros, login y registro) con Testing Library, informe PDF, calculo del beneficio, fechas y utilidades, calendario de cultivos, consejo de riego y prevision combinada, contrasenas con sal, SHA-256, copia de seguridad, buscador, filtros y graficas.

## Arquitectura

```
App.js                    Sesion, idioma, pestanas y navegacion
src/
  cuenta.js               Usuarios, sesion, config de precios, borrado de cuenta
  datos.js                Datos de cada usuario (guardar, borrar, reemplazar)
  claves.js               Contrasenas con sal y migracion de las antiguas
  calculos.js             Beneficio por temporada y por parcela
  precios.js              Precios de mercado por defecto
  cultivos.js             Dias hasta cosecha y meses de siembra
  tiempo.js               Prevision de Open-Meteo y consejo de riego
  ubicacion.js            GPS con expo-location
  copia.js                Exportar y restaurar datos, filtro del buscador
  idioma.js               Textos en espanol e ingles
  legal.js                Privacidad, aviso legal, condiciones, accesibilidad
  util.js                 Fechas, numeros y ayudas varias
  componentes/            ListaEditable, Formulario, Chips, Casilla, SelectorFecha, Tiempo
  pantallas/              Resumen, Parcelas, Siembras, Riegos, Cosechas, Temporadas,
                          Login, Perfil, Admin, Legal
__tests__/                Tests de Jest
docs/                     Documentacion (cumplimiento legal)
```

El estado se reparte en dos Context de React:

- `CuentaProvider` (src/cuenta.js): lista de usuarios, sesion activa y configuracion global de precios.
- `DatosProvider` (src/datos.js): datos del huerto del usuario con sesion, guardados con la clave `huerto_datos_<idUsuario>`.

La logica que se puede probar (calculos, fechas, tiempo, claves, copia) esta en modulos sin React, separada de las pantallas.

## Modelo de datos

```
Usuario     id, usuario, nombre, clave, sal, v, rol (admin | usuario), idioma, creado, legal
Temporada   id, nombre, inicio, fin
Parcela     id, nombre, metros, ubicacion, gastos, notas
Siembra     id, cultivo, parcelaId, temporadaId, fecha, cantidad, notas
Riego       id, parcelaId, fecha, litros, metodo
Cosecha     id, siembraId, fecha, kilos, notas
```

Las fechas se guardan en ISO (AAAA-MM-DD) y se muestran como DD/MM/AAAA. Al borrar una parcela, siembra o temporada se borra en cascada lo que depende de ella.

## Calculo del beneficio

```
beneficio = kilos x precio de mercado
          - litros / 1000 x precio del agua
          - gastos de las parcelas usadas en la temporada
          - impuestos (porcentaje sobre el beneficio positivo)
```

Esta en `src/calculos.js`. Los precios los pone el administrador.

## Idiomas

Espanol (por defecto) e ingles. Los textos estan en `src/idioma.js`: la clave es el texto en espanol y la traduccion va en el bloque `en`. Para anadir un idioma basta con anadir un bloque nuevo y su entrada en `IDIOMAS`. Si falta una traduccion se ve el texto en espanol.

## Privacidad, ley y accesibilidad

La app esta pensada para cumplir el RGPD, la LOPDGDD, la LSSI, la Ley 11/2023 de accesibilidad y las normas de Google Play:

- Edad minima de 14 anos y aceptacion de la politica de privacidad al registrarse, guardando version y fecha.
- Politica de privacidad, aviso legal, condiciones y accesibilidad dentro de la app, a dos toques como mucho.
- Derechos del usuario desde la app: ver, corregir, exportar y borrar sus datos.
- El GPS solo se pide cuando el usuario pulsa el boton.
- Sin publicidad, sin analitica y sin SDK de terceros.
- Botones con nombre para lectores de pantalla (WCAG 2.1 AA).

El detalle y lo que tiene que cumplir el servidor esta en [docs/cumplimiento-legal.md](docs/cumplimiento-legal.md). Para publicar en Google Play falta una pagina web para pedir el borrado de la cuenta; de momento se pide por email.

## Seguridad

- Contrasenas con sal aleatoria de 16 bytes y 2000 vueltas de SHA-256. Las cuentas con el formato antiguo se migran solas al iniciar sesion.
- El repositorio no contiene claves ni secretos. Los ficheros `.env` estan en `.gitignore`.
- Open-Meteo no necesita clave y solo recibe coordenadas, nunca datos del usuario.

## Hoja de ruta

- API REST en AWS (region de la UE) para sincronizar los datos entre dispositivos, con HTTPS, datos cifrados, autenticacion con token y endpoints para exportar y borrar la cuenta. Los requisitos estan en `docs/cumplimiento-legal.md`.
- Formulas de beneficio definitivas.
- Notificaciones de riego.

## Convenciones del proyecto

- Codigo en espanol, sin comentarios, sin acentos ni caracteres especiales en codigo y textos de la app.
- Un commit por cada mejora, con mensaje corto en espanol.
- Antes de subir: `npm test` tiene que pasar entero.

## Autor

Raul Galera, 2 DAM.
