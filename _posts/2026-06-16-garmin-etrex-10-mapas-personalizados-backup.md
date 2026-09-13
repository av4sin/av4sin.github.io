---
layout: post
title: "Garmin eTrex 10: del mapa plano al mapa personalizado, sin miedo a tocar el dispositivo"
date: 2026-06-16
categories: [tecnico, garmin, gps]
tags: [garmin, etrex10, gps, mapas, custommaps, backup]
---

## Un GPS que me encanta, pero con un detalle que me sacaba de quicio

Tengo un **Garmin eTrex 10** y, sinceramente, me parece un aparato estupendo. Es duro, simple, consume poco y hace exactamente lo que se le pide. No intenta ser un móvil, no intenta ser una tableta, no pretende tener mil cosas que nadie usa. Es un GPS de los de verdad: lo enciendes, esperas un poco, y sabes dónde estás.

Pero había una cosa que me molestaba bastante desde el primer día: **el mapa de fábrica**.

Lo que traía el mío era, básicamente, un mapa plano. Un contorno de la península ibérica, algunas ciudades grandes (claro, sólo el nombre y un punto) y poco más. Para orientarte en una emergencia vale. Para mirar algo rápido también. Pero para usarlo con gusto, para caminar con cierta tranquilidad o para llevarte un mapa que de verdad te diga algo, se queda muy corto.

Y ahí fue donde empecé a mirar más allá.

---

## La investigación que cambia el juego

Hace años, investigando el tema, descubrí que estos Garmin no están condenados a vivir con el mapa que traen de fábrica. Se pueden cargar **mapas personalizados**.

La idea, sobre el papel, es preciosa. Tú preparas tu mapa, lo adaptas a la zona que necesitas, lo metes al dispositivo y listo. Sin depender de lo que Garmin decidió meter de serie.

La realidad, como casi siempre, es menos romántica.

El problema principal es el tamaño... El mapa que cabe en el dispositivo es ridículamente pequeño si lo comparas con cualquier mapa actual. El archivo que me he encontrado como límite práctico ronda los **8 MiB**, es decir, **8.388.608 bytes**. En otras palabras: no cabe un país entero, ni mucho menos un conjunto grande de mapas. Cabe una porción. Y solo una porción razonable. Esto es porque la memoria interna que tiene es apenas unos megas más grande, y todavía no hemos contado track actual, rutas, waypoints...

Eso obliga a pensar distinto.

No vale con decir "voy a meter todos los mapas y ya está". No. Tienes que seleccionar, recortar, ordenar y decidir qué quieres llevar encima. Y si quieres cambiar de zona, tienes que reemplazar lo que hay.

Ahí es donde empezó mi proyecto. ([https://github.com/av4sin/garmin-map-extract](https://github.com/av4sin/garmin-map-extract))

---

## El problema real no era el mapa: era el proceso

Cuando trabajas con un Garmin de este estilo, el problema no es solo el archivo en sí. El problema es todo lo que rodea a ese archivo.

Hay que saber:

- Qué fichero es el que realmente usa el equipo como mapa.
- Cómo está organizada la memoria cuando conectas el GPS por USB.
- Qué carpetas hay que respetar para no romper tracks, rutas o waypoints.
- Qué partes puedes sustituir con seguridad y cuáles no conviene tocar a ciegas.
- Cómo hacer copia de seguridad antes de hacer cualquier cambio.

Porque una cosa es querer un mapa mejor y otra muy distinta es llevarte por delante tus datos de navegación por tocar el sitio equivocado.

Mi idea fue precisamente esa: **automatizar la parte peligrosa y repetitiva**.

---

## Qué hace el proyecto que he creado

El proyecto parte de una idea simple: si ya tengo los mapas extraídos, no quiero andar copiando y pegando archivos a mano cada vez.

Quiero una herramienta que haga esto:

1. Lea los mapas disponibles.
2. Genere una lista entendible, con identificadores claros, como si fueran los de un catálogo del IGN.
3. Me deje seleccionar el mapa que quiero cargar en el Garmin.
4. Haga una copia de seguridad completa del dispositivo en una carpeta temporal dentro de **/tmp**.
5. Sustituya los ficheros necesarios en el GPS.
6. Deje el equipo listo para desconectar sin tener que rezar demasiado.

Eso, traducido a lenguaje normal, significa que ya no tengo que recordar a mano qué archivo había que cambiar, ni dónde estaba cada cosa, ni qué carpeta era la importante.

El proyecto hace de puente entre dos mundos:

- el del mapa extraído y preparado en el ordenador,
- y el del Garmin montado como almacenamiento USB, esperando que le pongas justo lo que necesita.

---

## La anatomia del Garmin cuando lo conectas

Cuando conectas el eTrex 10 al ordenador, el dispositivo suele presentarse como una unidad de almacenamiento con una estructura bastante clara. No es magia. Es una carpeta con una organización muy concreta.

La base, simplificando bastante, suele parecerse a esto:

```text
/
└── Garmin/
    ├── GarminDevice.xml
    ├── gmapbmap.img
    ├── GPX/
    │   ├── Current/
    │   └── Archive/
```

No todos los modelos muestran exactamente lo mismo, pero esta idea te sirve para entender el juego.

### `GarminDevice.xml`

Este fichero es importante porque identifica el dispositivo. Suele contener información del equipo, su estructura interna y metadatos que ayudan al software a reconocer qué hay conectado.

No es un fichero para editar alegremente. Es de los que conviene **preservar** en cualquier backup serio.

### `gmapbmap.img`

Este suele ser el mapa base que trae el equipo. Es el equivalente al mapa plano que yo veía de serie: un fondo muy simple, con contornos y poco más.

En mi caso, esta es una de las piezas clave porque es la que termina sustituyéndose o reemplazándose por el mapa personalizado que quiero cargar.

### `GPX/`

Aquí viven los datos que de verdad no quieres perder:

- waypoints,
- tracks,
- rutas,
- y, según el caso, historiales o capturas de actividad.

La carpeta `GPX` es la parte del dispositivo que más sentido tiene proteger antes de hacer nada raro.

### `GPX/Current/`

Aquí suele estar la traza actual o la información más reciente de uso. Si el dispositivo se usa de verdad, esta carpeta importa.

---

## Qué ficheros hay que cambiar de verdad

Si quieres entender el corazón del proceso, te lo resumo sin adornos:

- El mapa principal vive en el fichero de mapa `.img` que el equipo usa como referencia.
- Los datos de usuario viven en `GPX/`.
- La identidad del dispositivo se guarda en `GarminDevice.xml`.
- La copia de seguridad debe recoger toda la estructura, no solo el mapa.

En otras palabras: **no basta con cambiar un archivo y ya está**.

Si solo sustituyes el mapa, bien, tendrás el mapa nuevo. Pero si no guardas el resto, en el peor caso puedes perder tracks, rutas, puntos guardados o la posibilidad de volver atrás con rapidez.

Por eso el proyecto no se limita a copiar un fichero bonito. Lo que hace es trabajar con el conjunto completo y actuar con cuidado.

---

## El paso a paso del flujo

Lo interesante del proyecto no es solo que funcione. Es que intenta hacerlo de una forma que se pueda repetir sin pensar demasiado.

### 1. Enumerar los mapas disponibles

Primero parte de los mapas extraídos que ya tengo preparados en el ordenador.

En vez de darles nombres feos o rutas imposibles de recordar, el proyecto genera una lista clara con un identificador legible. La idea es que seleccionar un mapa se parezca más a elegir una entrada de catálogo que a pelearte con un directorio lleno de nombres largos y ambiguos.

### 2. Elegir el mapa que quiero cargar

Una vez que veo la lista, selecciono el mapa que me interesa para la salida concreta.

Hoy puedo querer una zona. Mañana otra. Y pasado, otra distinta. No necesito tenerlas todas dentro del Garmin a la vez, porque el límite de tamaño no lo permite.

### 3. Crear una copia de seguridad completa

Antes de tocar nada, el proyecto hace una copia del dispositivo entero en **/tmp**.

Esto me parece importante por dos razones:

- porque si algo sale mal, puedo volver atras,
- y porque `/tmp` es un sitio temporal, rapido y perfecto para una copia de trabajo mientras estoy haciendo el cambio.

No es un archivo histórico para guardar durante semanas. Es una red de seguridad inmediata.

### 4. Sustituir los archivos necesarios

Con la copia hecha, el proyecto reemplaza los ficheros que hacen falta en el Garmin.

Normalmente eso significa tocar el archivo de mapa y respetar el resto de la estructura. No hay que inventarse carpetas raras ni mover cosas porque sí. Garmin suele agradecer que le dejen su organización interna tranquila.

### 5. Dejarlo todo listo para desconectar

El último paso es el más aburrido, pero también el más importante: asegurarse de que el equipo se quede coherente y que la unidad se pueda expulsar sin corromper nada.

En un dispositivo de este tipo, una mala desconexión no suele ser espectacular. Simplemente te deja con un problema que luego cuesta más tiempo diagnosticar que resolver.

---

## El límite de 8 MiB: la pieza que obliga a pensar

Quiero insistir en esto porque es la clave de todo el asunto.

El Garmin eTrex 10 no está pensado para llevar encima un mapa gordo y olvidarte del resto. El espacio es muy pequeño. Con el mapa base que trae de fábrica ya se ve la limitación, y cuando intentas meter mapas personalizados, el límite de **8 MiB** te obliga a ser muy selectivo.

Eso tiene una consecuencia directa: no puedes pensar en términos de "biblioteca de mapas" dentro del aparato. Tienes que pensar en términos de **mapa de trabajo**.

Hoy este. Mañana otro.

Y sinceramente, para este tipo de GPS, tiene sentido.

---

## Lo que me gusta de este enfoque

Lo mejor de todo esto no es solo tener un mapa más útil.

Lo mejor es que convierte un proceso que era manual, repetitivo y fácil de romper en algo mucho más claro.

Ya no tengo que recordar si el fichero era este o aquel. Ya no tengo que navegar por las carpetas a mano cada vez. Ya no tengo que preocuparme por si he olvidado copiar algo importante antes de tocar el GPS.

Y sobre todo, no tengo que asumir que el dispositivo es una caja negra inexplicable. No lo es.

Es una estructura de ficheros concreta, con una lógica bastante razonable una vez la entiendes.

---

## Lo que aprendió la versión más vieja de mí mismo

Si hace años me hubieran explicado esto de forma ordenada, me habría ahorrado bastante tiempo.

Por eso me gusta tanto documentarlo ahora: porque en cuanto entiendes que el mapa, los datos de usuario y la copia de seguridad son cosas distintas, todo deja de parecer un truco raro.

No hay misterio.

Hay carpetas.
Hay ficheros.
Hay un límite de tamaño muy pequeño.
Y hay una forma limpia de trabajar con todo eso sin cargarte el GPS por accidente.

---

## Para terminar

Mi Garmin eTrex 10 sigue gustándome mucho. Precisamente por eso me empeñé en arreglar la parte que menos me convencía.

El mapa de fábrica estaba bien para salir del paso, pero yo quería algo más útil. Investigando descubrí que se podía hacer mejor. Y de esa necesidad salió un proyecto que me quita trabajo repetitivo, me deja seleccionar mapas por identificador, me hace copia de seguridad del dispositivo entero en `/tmp` y me permite sustituir lo justo sin andar improvisando.

No es el tipo de proyecto que deslumbra en una presentación. Pero es el tipo de proyecto que te hace la vida más fácil cada vez que enchufas el GPS.

¡Nos vemos en el próximo log!