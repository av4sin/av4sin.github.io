---
layout: post
title: "Meshtastic: SNR, RSSI, Bluetooth, WiFi y la gran duda del \"internet por nodo\""
date: 2026-04-19
categories: [tecnico, redes, meshtastic]
tags: [meshtastic, lora, snr, rssi, wifi, bluetooth, internet, comunidad]
---

## Continuamos donde lo dejamos

Si en los posts anteriores estaba centrado en antenas, alcance y primeras pruebas reales, hoy toca una continuación natural: entender bien las métricas que más preguntas generan y aclarar una duda que sale siempre cuando entras en Meshtastic.

Las dos preguntas del día son estas:

- ¿Qué son exactamente **RSSI** y **SNR**?
- ¿Con WiFi en el nodo puedo tener internet desde otro nodo remoto, como si fuera un repetidor de datos?

Parece sencillo, pero aquí se mezclan conceptos de radio, red local y expectativas de uso. Y cuando se mezclan, es fácil hacerse un lío.

Así que vamos por partes, sin prisa y en castellano.

---

## Lo primero: RSSI y SNR no son lo mismo

Cuando miras un nodo en Meshtastic y ves valores de señal, normalmente aparecen estos dos:

- **RSSI**
- **SNR**

A veces se interpretan como si fueran dos maneras distintas de decir lo mismo. No lo son.

### RSSI: la intensidad bruta de lo que te llega

RSSI (Received Signal Strength Indicator) es la fuerza de señal que está recibiendo tu radio.

Dicho fácil: cuánta "energía" de radio llega a tu receptor.

Normalmente viene en dBm y es un número negativo. Ejemplos típicos:

- -70 dBm: señal fuerte
- -90 dBm: señal útil, pero floja
- -110 dBm: señal muy débil

Cuanto más cerca de 0, mejor (en términos de potencia recibida). Por eso -70 es mejor que -100.

### SNR: la señal comparada con el ruido

SNR (Signal to Noise Ratio) no mira solo fuerza, mira limpieza.

Compara la señal útil frente al ruido de fondo.

Aquí viene el punto importante:

- Puedes tener un RSSI aceptable, pero mal SNR si hay mucho ruido.
- Puedes tener RSSI flojo, pero aun decodificar bien si el SNR acompaña.

Por eso SNR es tan valioso para entender por qué a veces llega y a veces no.

---

## Rangos de SNR: el dato que más se pregunta

En LoRa/Meshtastic se suele hablar de un rango práctico de SNR alrededor de:

- **Superior**: alrededor de +20 (incluso algún pico algo mayor según condiciones)
- **Inferior teórico**: alrededor de -20

Una regla rápida y útil para campo:

- **SNR por encima de 0** suele ser una señal bastante buena.
- Entre 0 y negativo bajo, puede seguir funcionando, pero ya depende mucho de entorno, SF, interferencias y topografía.
- Muy cerca del límite inferior, la comunicación se vuelve inestable o directamente deja de ser usable.

No es una frontera matemática exacta para todos los casos, pero como referencia operativa funciona muy bien.

---

## ¿Dónde ves estos valores realmente?

Esto también crea confusión al principio.

Estos valores, tal y como se muestran en Meshtastic, vienen activados y se refieren a **cómo tu nodo recibe a otros nodos directos**.

Traducido:

- Si escuchas directamente a un nodo, puedes ver RSSI/SNR de ese enlace directo. También nos sirve para saber que es directo.
- Si un nodo te llega por saltos, no siempre veras "la foto completa" de todos los tramos directos desde tu interfaz local.

Parte de todo esto se intuye indirectamente revisando rutas y resultados de traceroute. Pero creo que así queda más claro, porque yo también me he hecho esa pregunta.

Por eso a veces parece que "faltan" metricas: no faltan, simplemente no todo enlace de toda la malla es un enlace directo de tu nodo.

Si quieres hilar esto con la parte de posicion y rutas, lo exlico luego en el apartado de [Posición del nodo](#posicion-del-nodo-el-ajuste-que-casi-nadie-toca-al-principio).

---

## Pregunta real que lancé a la comunidad

La resumo porque la pregunta fue un poco larga:

"No he tocado aún el tema WiFi/red. ¿Lo tenéis por Bluetooth o por WiFi? Si es WiFi, ¿el nodo crea su propia red o se conecta a la red de casa? ¿Puedo entrar desde varios dispositivos? Y si activo algo de proxy/redirección, ¿podría tener internet en un nodo remoto a través de otro nodo que sí tiene router?"

Vamos por partes.

### 1) Bluetooth o WiFi para administrar el nodo

Para la mayoría de uso diario en móvil, **Bluetooth** suele ser lo más cómodo:

- Emparejas
- Abres app
- Configuras
- Listo

Básicamente como un smartwatch, y sin depender de tener red cerca.

WiFi entra mas bien cuando quieres:

- Acceder vía web UI
- Administrar más cómodo desde PC
- Dejar un nodo fijo con acceso de red local

### 2) En WiFi, el nodo es uno más

Por lo que saqué en resumen, la configuración de primeras te deja poner el nodo como un host más de tu LAN, pero con IP local asignada desde tu servidor DHCP que suele estar en el router principal.
Posiblemente haya alguna manera de crear su propia network para situaciones en las que no haya un wifi cerca, pero no he llegado a revisarlo aún. Si encuentro respuesta a esto, os comentaré en próximos logs.

### 3) La gran pregunta: ¿internet a través de la malla LoRa?

Aquí es donde conviene ajustar expectativas para no frustrarse.

Si tienes:

- Nodo A en un sitio fijo conectado por WiFi a un router con internet
- Nodo B contigo, lejos, enlazado por Meshtastic

Mi pregunta esta mañana era si B puede navegar por internet usando A como salida.

En términos prácticos generales de Meshtastic: **NO**. Si te interesa el porqué operativo y técnico, luego lo conecto con [Buenas prácticas de malla](#buenas-practicas-de-malla-esto-me-evito-meter-ruido-sin-querer).

De todas formas los motivos principales son:

- LoRa tiene **ancho de banda muy bajo** para tráfico IP normal.
- Hay límites regulatorios y de duty cycle.
- La red está pensada para mensajería/telemetría ligera, no para navegar, streaming ni uso de internet convencional.
- Las opciones de proxy/redirección existentes no convierten la malla en un "router de internet" usable como lo entendemos en WiFi o 4G/5G.

Entonces, ¿para qué sirve?

Sirve para lo que hace muy bien:

- Mensajes de texto
- Posición/telemetría
- Coordinación de nodos en escenarios sin cobertura móvil o con infraestructura limitada (ATAK)

Y eso, bien montado, ya es una barbaridad de útil.

Pongamonos en situación, somos un equipo operativo "Golf" y nos despliegan en un campo de maniobras donde no hay una sóla onda de cobertura móvil. Tenemos un equipo táctico, que sabe usar ATAK de lujo, con todas sus configuraciones, marcadores, IDs, grupos... Pero que falla aquí, la comunicación, obviamente. Pues bien, con estos nodos, uno cada componente de "Golf" pueden intercambiar sus mensajes, posiciones y demás info que precisen, además estando toda encriptada y sin necesidad de salir de ATAK. 

No obstante está por ver que tan seguro resulta frente a un enemigo que conoce esto, ya que no dejan de ser señales de radio que pueden o bien ser intervenidas, o trianguladas o inhibidas. 

De ahí sale otra pregunta, ¿Entonces de que sirve conectar el nodo a internet?

Pues nos sirve para poder hacer o un gateway MQTT, de lo que hablaré en otro momento, o simplemente para subir los datos e info del nodo a internet y poderlo ver desde webs como [Malla](https://malla.meshtastic.es)

---

## Regla mental para no liarte

Cuando dudes, usa esta frase:

**Meshtastic es para "más comunicación resistente".**

Con eso en la cabeza, todo cuadra:

- RSSI te dice cuánta señal te llega.
- SNR te dice qur tan limpia llega.
- Bluetooth/WiFi son vías de administración del nodo.
- La malla LoRa conecta nodos para tráfico ligero y robusto, no para reemplazar una conexión de datos convencional.

---

## Consejos para principiantes (y errores que conviene evitar)

Esta parte me parece clave, sobre todo cuando estás empezando y te pueden las ganas de tocar todo en cinco minutos.

Está sacado de la web de [Meshtastic España](https://meshtastic.es) pero explicado para que sea sencillo.

### 1) Regla de oro de hardware: nunca enciendas sin antena

No enciendas el dispositivo si no tiene antena conectada.

La razón es simple: la energía RF necesita salida. Si no la tiene, esa energía se refleja y puedes terminar dañando la etapa de radio. Y cuando eso pasa, no suele haber arreglo de software: puedes dejar el módulo inutilizable.

### 2) No cambies opciones por curiosidad sin entender su impacto

Tocar por tocar puede degradar tu experiencia y la de toda la malla. Hay ajustes que conviene evitar hasta tener claro lo que estás haciendo:

- Subir los hops muy por encima de 3-4. Normalmente no hace falta y puede empeorar rutas.
- Activar modo Router sin coordinación previa con la comunidad.
- Bajar demasiado los intervalos de telemetría, que generan tráfico innecesario.
- Usar RangeTest en red compartida, porque mete mucho ruido y carga de mensajes.

Si tienes duda, suele ser mejor quedarse en modos tipo CLIENT o CLIENT_MUTE mientras aprendes el comportamiento real de tu zona.

### 3) Empieza simple y escala después

Un enfoque que suele funcionar:

- Arrancar con hardware sencillo (Como en mi caso, heltec v2).
- Dejar equipos más complejos para cuando ya controles RF, configuración y diagnóstico básico.

No es por limitarse: es para construir base sin frustrarte ni multiplicar variables. No querrás resolver integrales sin saber sumar.

### 4) Si no ves nodos al principio, no entres en pánico

Es muy habitual. Meshtastic dentro de edificios suele rendir peor o mucho peor de lo que esperamos. Lo he comprobado en los 5 días que llevo en este mundo, en el interior, apenas detecta un nodo a 500 metros y con una señal horrible.

Buenas ideas para esta fase:

- Acercar el nodo a ventana, balcón o exterior para probar.
- Revisar antena y montaje, porque ahí se gana o se pierde muchísimo. [Revisa el post de antenas](/blog/2026/04/17/meshtastic-heltec-v2-antenas-lora-guia-completa/)
- Hacer pruebas cortas con dos nodos cerca primero, para validar que todo funciona. Recomiendo buscar grupos de la zona.

### 5) Experimenta, pero paso a paso

Probar potencia, ubicaciones y ajustes forma parte del aprendizaje. Hazlo de forma progresiva, tomando notas y cambiando una variable cada vez. Si cambias todo de golpe, luego no sabrás qué mejoró y qué rompió.

### 6) Apóyate en la comunidad y en las guías

Cuando algo no cuadra, preguntar ahorra horas.

- En España tienes comunidad activa en Telegram (por ejemplo, @meshtastic_esp).
- También hay muchísima información útil en r/meshtastic.
- Y la documentación oficial de Meshtastic sigue siendo referencia obligada.

Además, merece la pena revisar guías de buenas prácticas de la comunidad para confirmar que tu configuración no perjudica al resto de nodos.

### 7) MQTT no es obligatorio para empezar

MQTT es útil, pero no es requisito para comunicarte por la malla LoRa.

De hecho, al principio suele ser mejor centrarse en entender bien radio, enlaces directos, hops y comportamiento de la red local. Luego ya tiene sentido meter MQTT para observación, integraciones y monitorización (mapas, vista de red, etc.). Lo de no saturar la red lo dejo mejor resumido a continuación:

---

## Buenas prácticas de malla (esto me evitó meter ruido sin querer)

Hay una idea que me cambió la forma de configurar mi nodo y ver Meshtastic: en una red descentralizada, cada ajuste individual afecta al resto.

En LoRa, además, hay tres límites físicos que conviene tener presentes todo el rato:

- Un nodo no puede transmitir y recibir al mismo tiempo.
- Un nodo solo puede decodificar un mensaje cada vez.
- Si el canal está ocupado, el nodo espera para evitar colisiones.

Con esas tres reglas, se entiende por qué poner todo al máximo casi siempre empeora la red.

### Hops: menos suele ser más

Lo que mejor me está funcionando y lo que más repite la comunidad:

- Mantener **3 hops** por defecto en la mayoría de casos.
- Subir a **4** solo si tiene sentido por topología y nodo bien conectado.
- Ir a **5** como excepción (bordes de malla o casos concretos).

Pasarse de ahí hace que los mensajes den demasiadas vueltas, aparezcan rutas redundantes y aumente la congestión para todos.

### Rol del nodo: no todo tiene que ser router

Otra trampa típica de principiante es pensar que si reenvío todo, ayudo más. No siempre.

Guía rápida que me parece sensata:

- **CLIENT_MUTE** para la mayoría de nodos personales, móviles o en interior.
- **CLIENT** para nodos exteriores con buena visibilidad de radio que realmente aportan cobertura.
- **ROUTER / ROUTER_LATE** solo con planificación y coordinación con gente de la zona.
- **CLIENT_BASE** para casos concretos de nodos de tejado/azotea.

No pasa nada por no expandir la malla con un nodo personal. Un CLIENT_MUTE bien configurado también ayuda porque evita tráfico innecesario. La idea completa está repartida entre [Pregunta real de comunidad](#pregunta-real-de-comunidad-y-respuesta-larga-como-prometi) y [Buenas prácticas de malla](#buenas-practicas-de-malla-esto-me-evito-meter-ruido-sin-querer).

### Intervalos automáticos: donde más se gana rendimiento

Gran parte del tráfico de una malla suele venir de broadcasts periódicos, no de mensajes humanos. Ajustar intervalos cambia mucho el comportamiento.

Valores prudentes que ge visto como referencia en mallas con bastante actividad:

- **Device metrics update interval**: 43200 (12 h)
- **NodeInfo broadcast interval**: 86400 (24 h)
- **Position broadcast interval (nodo fijo)**: 86400 (24 h)
- **Position broadcast interval (nodo móvil)**: 1800 (30 min) o más

Para nodos fijos, además hay que dejar solo los flags de posición realmente útiles para recortar carga. No es necesario enviar la posición cada 15 minutos si está anclado al tejado de una casa.

Y si tienes telemetría de entorno (temperatura, humedad, etc.) pero no la necesitas de verdad, mejor desactivarla o subir mucho el intervalo.

### Regla final de convivencia

Si dudas entre dos ajustes, elige el que genere menos emisiones y menos reenvíos innecesarios. En Meshtastic, optimizar para todos casi siempre mejora también tu propia experiencia. Esta es la misma lógica que aplico a continuación con las posiciones: reportar solo cuando aporta valor.

---

## Posición del nodo: el ajuste que casi nadie toca al principio

Esto lo descubrí tarde, y ahora me parece de las cosas más importantes para que la red tenga sentido cuando miras mapa, nodos cercanos o rutas.

Igual que cuidar el nombre del nodo ayuda a identificarlo, definir bien su posición evita confusiones y mejora cómo interpretas la malla.

Ruta rápida en la app:

- Entra en **Radio configuration**
- Abre **Position**

A partir de aquí cambia mucho según si tu nodo es fijo o móvil.

### Nodo fijo (tejado, azotea, campo, etc.)

Si ese nodo no se va a mover, lo más limpio es dejar una posición fija manual.

Valores que he visto que recomiendan y están funcionando como base:

- **Position broadcast interval**: 43200 (12 horas)
- **Smart position enabled**: NO
- **Use fixed position**: SÍ
- **Latitude / Longitude / Altitude**: los datos reales de donde está instalado

La lógica es simple: como el nodo no cambia de sitio, no hace falta estar mandando posición cada poco. Pero sí conviene enviarla de vez en cuando para que nodos nuevos sepan dónde está.

### Nodo móvil (en mochila, coche o encima)

Aquí interesa justo lo contrario: reportar cambios reales sin inundar la red.

Si tu dispositivo tiene GPS integrado:

- **Position broadcast interval**: 1800 (30 min) o más
- **Smart position enabled**: SÍ //Significa que si detecta que te mueves, coge tu nueva posición.
- **Smart broadcast minimum distance**: 500 m
- **Smart broadcast minimum interval**: igual que el broadcast interval (1800 o más)
- **GPS mode**: ENABLED (si hay GPS)
- **GPS update interval**: 120 s o más, según consumo/precisión que quieras

Si tu nodo no tiene GPS, en ese campo déjalo como **NOT_PRESENT**.

### Truco útil: usar la ubicación del móvil

Si no llevas GPS en el nodo, hay una opción que ayuda mucho cuando vas en movilidad con el teléfono.

En la lista de dispositivos, al conectar, aparece una opción tipo **Provide phone location to mesh**. Al activarla, el móvil comparte su posición con la malla a través del nodo.

Para empezar es una solución muy práctica: simplifica hardware y te deja probar flujo real de posición sin complicarte desde el día uno.

### Regla práctica para no saturar

En posición, mi regla ya es esta: reportar cuando aporta valor, no por defecto cada minuto.

Si no te mueves, intervalo largo. Si te mueves, smart position y distancia mínima razonable. Así mantienes información útil sin meter tráfico innecesario. Si dudas entre un nodo fijo y uno móvil, vuelve a [Buenas prácticas de malla](#buenas-practicas-de-malla-esto-me-evito-meter-ruido-sin-querer) porque ahí está la lógica general.

---

## Cierre

Este post me lo guardo también como referencia personal, porque son justo esas dudas que vuelven una y otra vez cuando llevas días de pruebas y te aparecen siglas por todos lados.

Si te sirve una versión ultra corta para recordar en campo:

- RSSI = fuerza bruta.
- SNR = calidad frente a ruido.
- SNR > 0 = normalmente buena señal.
- SNR práctico suele moverse entre aprox -20 y +20.
- Esas métricas son especialmente útiles en enlaces directos.
- WiFi/Bluetooth = gestión del nodo.
- Meshtastic no es internet móvil por radio LoRa.

De todas formas todavía queda mucho por cacharrear.

¡Nos vemos en el próximo log!