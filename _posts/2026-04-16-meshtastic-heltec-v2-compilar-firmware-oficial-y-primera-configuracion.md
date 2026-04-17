---
layout: post
title: "Heltec V2 y Meshtastic, segunda vuelta: compilar firmware oficial y configurar bien desde el principio"
date: 2026-04-16
categories: [tecnico, linux, hardware, meshtastic]
tags: [meshtastic, heltec, lora, esp32, platformio, firmware, bluetooth, android]
featured: true
pin: true
---

## Volver al principio (para hacerlo mejor)

Hay una cosa que he aprendido a fuerza de golpes en tecnología: una solución puede funcionar y, aun así, no ser la mejor solución.

El otro día publiqué cómo conseguí flashear mi **Heltec WiFi LoRa 32 V2** por CLI. Y no me arrepiento de ese post, porque cuenta exactamente lo que pasó: puerto, permisos, esptool, pruebas, errores y victoria final.

Pero, siendo honesto, ese enfoque era más una operación de rescate que una base de trabajo.

No estaba mal.

Solo que era **correr antes de andar**.

Si quiero entender de verdad Meshtastic, mantener el nodo con criterio y no depender de "a ver qué binario encuentro", tenía que volver a lo obvio: la documentación oficial.

Y ahí está el punto de inflexión.

---

## La referencia buena: documentación oficial de Meshtastic

La página clave que usé para rehacer todo el proceso fue esta:

[https://meshtastic.org/docs/development/firmware/build/](https://meshtastic.org/docs/development/firmware/build/)

Lo que explica, resumido y traducido a lenguaje de campo, es bastante claro:

- Meshtastic se desarrolla y compila con **PlatformIO**.
- El flujo sano es:
  - instalar herramientas,
  - clonar el repositorio oficial,
  - actualizar submódulos,
  - elegir entorno de placa,
  - compilar,
  - subir firmware.

Esto cambia por completo la película.

Pasas de "flashear lo que haya" a **controlar lo que estás construyendo**.

Y para una placa como la Heltec V2, que ya no siempre aparece en los caminos más cómodos (web flasher, assets listos en según qué versiones), esto no es un detalle: es la diferencia entre depender de terceros o poder mantenerte por tu cuenta.

---

## Antes de tocar nada: por qué repetir el flasheo

Tomé la decisión de volver a flashear desde cero por una razón simple: quería dejar el nodo en la última versión que puedo gestionar de forma consistente **compilándola yo mismo**.

No por obsesión de "tener lo último".

Por estabilidad.

Con el método anterior, el nodo funcionaba, pero la primera conexión con el móvil era caprichosa:

- cortes intermitentes,
- emparejamientos que parecían hechos pero no quedaban finos,
- reinicios al tocar según qué ajustes (por ejemplo, la parte de red/canales en algunos intentos).

Con el flujo de compilación + carga controlada, ese comportamiento raro, de momento, desapareció.

No voy a vender milagros. Esto es radio, firmware y cacharreo: siempre puede fallar algo.

Pero el salto de fiabilidad se nota.

---

## Preparar entorno de compilación (la forma correcta)

Seguí literalmente la guía oficial de build. No obstante, como me gusta dejar un buen log, aquí la adjunto:

### 1) Instalar herramientas base

- Git
- PlatformIO

Si trabajas con Visual Studio Code, ya sabes instalar extensiones: es buscar PlatformIO desde el propio VS Code y darle a instalar.

### 2) Clonar el firmware oficial

```bash
git clone https://github.com/meshtastic/firmware.git
cd firmware
git submodule update --init
```

El detalle de submódulos es importante. Si te saltas eso, luego llegan errores raros que parecen magia negra y no lo son.

### 3) Mantener el repo al día

Cuando vuelvas días después y quieras recompilar:

```bash
cd firmware
git pull --recurse-submodules
```

Con esto actualizas código principal y submódulos en el mismo paso.

---

## Build en VS Code con PlatformIO

Con el repositorio clonado:

1. Abres la carpeta `firmware` en VS Code.
2. Esperas la primera inicialización de PlatformIO (puede tardar bastante la primera vez).
3. Abres la paleta de comandos: `Ctrl + Shift + P`
4. Ejecutas `PlatformIO: Pick Project Environment` y eliges el entorno de tu placa. Después descubrí que abajo también sale.
5. Ejecutas `PlatformIO: Build`. Que de nuevo abajo aparecen dos botones, uno para este paso, que compila y otro para subirlo.
6. Con la placa conectada, ejecutas `PlatformIO: Upload`.

Aquí ya no estás jugando a adivinar offsets de binarios sueltos: estás usando el flujo nativo del proyecto.

Y eso, cuando algo falla, te da trazabilidad real para depurar.

---

## Sobre Heltec V2, soporte y la parte incómoda

También consulté la documentación del fabricante para la placa:

[https://resource.heltec.cn/download/WiFi_LoRa_32](https://resource.heltec.cn/download/WiFi_LoRa_32)

Esto me ayudó a confirmar detalles de hardware, referencias y contexto del modelo.

Ahora, el tema importante: en el ecosistema Meshtastic actual hay modelos muy bien soportados en rutas "oficiales de usuario final" y otros que se van quedando fuera de la parte más cómoda.

Por eso en la documentación también aparece la parte de:

- hardware custom,
- variantes privadas (`PRIVATE_HW`),
- y politica de aceptacion de modelos.

Traducción: que algo no esté en el web flasher no significa que no puedas trabajar con ello. Significa que, en muchos casos, te toca ser más autosuficiente: compilar, probar y mantener. Como es el caso.

No es peor. Es otro nivel de responsabilidad.

---

## Primera conexión con el móvil (esta vez sin drama)

Después del reflasheo con el flujo de compilación, rehice la configuración inicial del nodo apoyándome en la guía de la comunidad Meshtastic en castellano:

https://meshtastic.es/docs/guias-basicas/configuracion-inicial

Y aquí noté la diferencia: conexión más estable y menos "se me reinicia justo cuando voy a guardar".

### Clientes oficiales disponibles

- Android: https://play.google.com/store/apps/details?id=com.geeksville.mesh
- Web: https://client.meshtastic.org/
- CLI Python: https://meshtastic.org/docs/software/python/cli/

Recomendación habitual (y que comparto): configuración inicial desde Android o CLI, porque suelen exponer más ajustes finos.

### Emparejado Bluetooth inicial

Proceso básico:

1. Ir a ajustes Bluetooth del móvil.
2. Emparejar con un dispositivo tipo `Meshtastic_XXXX`.
3. Introducir PIN:
  - si hay pantalla, suele mostrarse ahí,
   - si no hay pantalla, por defecto suele ser `123456`.
4. Abrir la app de Meshtastic y conectar al nodo emparejado.

Indicadores de nube en la app:

- nube tachada: desconectado,
- nube con check: conectado,
- nube con flecha arriba: conectado pero dormido o fuera de rango.

---

## Configuración inicial recomendada (España)

Esta parte es la que más impacto tiene en si vas a hablar con alguien o vas a estar solo en el vacío.

### Identidad del nodo

En `Radio configuration` -> `User`:

- nombre largo (hasta 39 caracteres),
- nombre corto/acrónimo (4 caracteres).

### LoRa: parámetros clave

En `Radio configuration` -> `LoRa`, revisar:

- `Modem Preset`:
  - `MEDIUM_FAST` (muy usado en España)
  - o `LONG_FAST` (muy extendido por defecto)
- `Region (frequency plan)`: `European Union 868MHz`
- `Hop limit`: <= 4
- `Override Duty Cycle`: NO
- `Override frequency (MHz)`: `869.525`

Aquí no hay mucho debate: si región/preset no coincide con el resto de nodos, no hay red compartida que valga.

### Canales públicos en España

Según la guía, los canales más habituales son:

- `MediumFast` o `LongFast` (canal base según preset)
- `Iberia`
- canal de provincia (sin espacios ni acentos)

Clave por defecto usada en canales públicos en España:

- PSK: `AQ==`

Enlaces utiles de ejemplo:

- Canales principales: https://meshtastic.org/e/#CgsSAQEoATABOgIIDwoREgEBGgZJYmVyaWEoATABOgASFAgBEAQ4A0ADSAFQG2gBwAYByAYB
- Canal León: https://meshtastic.org/e/?add=true#Cg0SAQEaBExlb24oATABEgwIAUADSAHABgDIBgE

No obstante, si os vais a esta web: [https://meshtastic.es/docs/generador-configuracion/?preset=MediumFast&iberia=true&test=false&bots=false&regional=true&region=Leon](https://meshtastic.es/docs/generador-configuracion/?preset=MediumFast&iberia=true&test=false&bots=false&regional=true&region=Leon)
O simplemente a esta, podéis conseguir un QR para hacer una configuración en base a unos presets comunes: [https://meshtastic.es/docs/generador-configuracion/](https://meshtastic.es/docs/generador-configuracion/)

Importante: al aplicar ciertos perfiles de canales/telemetría puedes estar aceptando precisión de ubicación aproximada (por ejemplo, alrededor de 700 m según configuración). Conviene revisarlo conscientemente en cada nodo.

---

## Lo que cambió respecto al post anterior

No reniego de lo anterior: me sirvió para levantar el equipo y entender la capa física del problema (USB, permisos, bootloader, flasheo).

Pero este flujo nuevo me parece mejor por cuatro motivos:

- Trabajas con el **código fuente oficial** y su sistema de build.
- Puedes actualizar con método, no con improvisación.
- Reduces inconsistencias entre firmware y configuraciones iniciales.
- Te prepara para el siguiente paso natural: personalizar y depurar de verdad.

En resumen: antes aprendí a arrancar el coche puenteando cables. Ahora he empezado a usar llave, manual y mantenimiento.

---

## Conclusión

Si estás empezando con Meshtastic y una Heltec V2, mi recomendación después de esta segunda vuelta es clara:

- usa el post anterior como guía de emergencias,
- pero construye tu base de trabajo sobre la documentación oficial y compilación propia.

El cambio no es solo técnico. También mental.

Pasas de pelearte con síntomas a entender el sistema.

Y cuando entiendes el sistema, dejas de depender de la suerte.

En el siguiente log quiero centrarme en pruebas reales de alcance y comportamiento de la malla con diferentes presets en entorno urbano. Ahí es donde empieza lo divertido de verdad.

¡Nos vemos en el próximo log!