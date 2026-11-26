# Huerto Urbano

App multiplataforma para gestionar un huerto urbano: parcelas, siembras, riegos y cosechas organizadas por temporadas, con prevision del tiempo, calendario de cultivos y calculo del beneficio de cada temporada.

Proyecto final de 2 DAM. Hecha con React Native y Expo: un solo codigo para Android, iOS y web (escritorio desde el navegador).

[![Tests](https://github.com/RaulGalera/huerto-urbano/actions/workflows/tests.yml/badge.svg)](https://github.com/RaulGalera/huerto-urbano/actions/workflows/tests.yml)
![Expo SDK](https://img.shields.io/badge/Expo_SDK-58-000020)
![React Native](https://img.shields.io/badge/React_Native-0.88-61DAFB)
![Plataformas](https://img.shields.io/badge/plataformas-Android_|_iOS_|_Web-2E7D32)
![Idiomas](https://img.shields.io/badge/idiomas-ES_|_EN-informational)

<p align="center">
  <img src="docs/capturas/inicio.png" width="230" alt="Pantalla de inicio" />
  <img src="docs/capturas/consejos.png" width="230" alt="Nueva siembra con consejos" />
  <img src="docs/capturas/oscuro.png" width="230" alt="Modo oscuro" />
</p>

## Indice

- [Prueba rapida](#prueba-rapida)
- [Funcionalidades](#funcionalidades)
- [Capturas](#capturas)
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

## Prueba rapida

1. Arranca la app (ver [Puesta en marcha](#puesta-en-marcha)).
2. Entra con el usuario `admin` y la contrasena `admin123`.
3. En Mi cuenta pulsa "Cargar datos de ejemplo": se crea un huerto con dos temporadas, cuatro parcelas, siembras, riegos y cosechas.

## Funcionalidades

Gestion del huerto

- Temporadas con fecha de inicio y fin. Cada temporada muestra sus siembras, kilos y beneficio, y una pantalla compara dos temporadas: siembras, kilos, agua, ingresos, gastos, beneficio y cultivo estrella, con el cambio en porcentaje.
- Parcelas con superficie, ubicacion, gastos por temporada y estado del riego.
- Siembras con cultivo, parcela, temporada, fecha y cantidad. Fecha de cosecha estimada segun el cultivo.
- Al sembrar avisa de la rotacion de cultivos (si en esa parcela hubo la misma familia la temporada anterior) y de las plantas amigas y enemigas que ya hay en la parcela.
- Riegos con litros y metodo (manguera, regadera o goteo). Si llueve 5 mm o mas cuenta como riego en las parcelas al aire libre.
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
- Avisos de riego en el movil: si una parcela lleva 3 dias o mas sin regar te llega una notificacion a las 9:00. Se activan en Mi cuenta y tienen un boton para probarlos.
- Mi cuenta: cambiar nombre, contrasena, idioma, apariencia, avisos y ubicacion, exportar siembras, riegos y cosechas a Excel (CSV), copia de seguridad (exportar y restaurar), privacidad y borrar la cuenta.

Modo admin

- Estadisticas de toda la app.
- Precios de mercado por cultivo, precio del agua y porcentaje de impuestos.
- Gestion de usuarios (dar o quitar admin, borrar).
- Cargar un huerto de ejemplo para hacer demostraciones.

## Capturas

| Inicio | Graficas y beneficio | Comparar temporadas |
| :---: | :---: | :---: |
| <img src="docs/capturas/inicio.png" width="220" alt="Inicio" /> | <img src="docs/capturas/graficas.png" width="220" alt="Graficas" /> | <img src="docs/capturas/comparar.png" width="220" alt="Comparar temporadas" /> |
| **Nueva siembra con consejos** | **Filtros** | **Modo oscuro** |
| <img src="docs/capturas/consejos.png" width="220" alt="Consejos al sembrar" /> | <img src="docs/capturas/filtros.png" width="220" alt="Filtros" /> | <img src="docs/capturas/oscuro.png" width="220" alt="Modo oscuro" /> |

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
| Avisos | expo-notifications (notificaciones locales) |
| Zona segura | react-native-safe-area-context |
| Tests | Jest con jest-expo y Testing Library |

No usa librerias de navegacion: las pestanas y los modales estan hechos a mano para que la app sea ligera y facil de seguir.

## Puesta en marcha

Requisitos: Node.js 22 (ver `.nvmrc`) y la app Expo Go en el movil (o Android Studio con un emulador).

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

GitHub Actions ejecuta los tests en cada push y en cada pull request (`.github/workflows/tests.yml`).

80 tests en `__tests__/` que cubren: pantallas (bienvenida, graficas, filtros, comparar temporadas, login, registro y avisos de riego) con Testing Library, avisos de riego programados, informe PDF, calculo del beneficio, fechas y utilidades, calendario de cultivos, consejo de riego y prevision combinada, contrasenas con sal, SHA-256, copia de seguridad, buscador, filtros, graficas, datos de ejemplo, rotacion y plantas amigas, lluvia como riego y exportar a CSV.

## Arquitectura

```
App.js                    Sesion, idioma, pestanas y navegacion
src/
  cuenta.js               Usuarios, sesion, config de precios, borrado de cuenta
  datos.js                Datos de cada usuario (guardar, borrar, reemplazar)
  claves.js               Contrasenas con sal y migracion de las antiguas
  sha256.js               SHA-256 en JavaScript para las contrasenas
  calculos.js             Beneficio por temporada y por parcela
  estadisticas.js         Resumen y comparacion de temporadas
  graficas.js             Datos de las graficas del inicio
  informe.js              HTML del balance para el PDF
  pdf.js                  Crear y abrir el PDF
  ejemplo.js              Huerto de ejemplo para demostraciones
  precios.js              Precios de mercado por defecto
  cultivos.js             Dias hasta cosecha, meses de siembra y familia
  consejos.js             Rotacion de cultivos y plantas amigas y enemigas
  csv.js                  Exportar siembras, riegos y cosechas a CSV
  archivos.js             Descargar o compartir archivos
  tiempo.js               Prevision de Open-Meteo, lluvia de los ultimos dias y consejo de riego
  ubicacion.js            GPS con expo-location
  copia.js                Exportar y restaurar datos, filtro del buscador
  avisos.js               Avisos de riego programados en el movil
  idioma.js               Textos en espanol e ingles
  legal.js                Privacidad, aviso legal, condiciones, accesibilidad
  util.js                 Fechas, numeros y ayudas varias
  componentes/            ListaEditable, Formulario, Filtros, Chips, Casilla, SelectorFecha,
                          Tiempo, Graficas, Bienvenida
  pantallas/              Resumen, Parcelas, Siembras, Riegos, Cosechas, Temporadas,
                          Comparar, Login, Perfil, Admin, Legal
__tests__/                Tests de Jest
docs/                     Documentacion (cumplimiento legal) y capturas
.github/workflows/        Tests automaticos con GitHub Actions
```

El estado se reparte en dos Context de React:

- `CuentaProvider` (src/cuenta.js): lista de usuarios, sesion activa y configuracion global de precios.
- `DatosProvider` (src/datos.js): datos del huerto del usuario con sesion, guardados con la clave `huerto_datos_<idUsuario>`.

La logica que se puede probar (calculos, fechas, tiempo, claves, copia) esta en modulos sin React, separada de las pantallas.

## Modelo de datos

```
Usuario     id, usuario, nombre, clave, sal, v, rol (admin | usuario), idioma, tema, avisos, bienvenida, creado, legal
Temporada   id, nombre, inicio, fin
Parcela     id, nombre, metros, ubicacion, aireLibre (si | no), gastos, notas
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
- Fotos en siembras y cosechas.
- Recordatorio de siembra segun el calendario de cultivos.

## Convenciones del proyecto

- Codigo en espanol, sin comentarios, sin acentos ni caracteres especiales en codigo y textos de la app.
- Un commit por cada mejora, con mensaje corto en espanol.
- Antes de subir: `npm test` tiene que pasar entero.
- Los cambios de cada version se apuntan en [CHANGELOG.md](CHANGELOG.md).
