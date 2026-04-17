---
layout: post
title: "El factor invisible: antenas LoRa, cálculos y por qué no todo es software"
date: 2026-04-17
categories: [tecnico, hardware, meshtastic]
tags: [meshtastic, heltec, lora, antena, rf, radiofrecuencia, cálculos, diy]
---

## Cuando la culpa no es del firmware

Hace nada alcancé un hito que parecía lejano: conseguí conectar mi nodo Heltec V2 con otros **11 nodos** en la zona. Estaban ahí, mandando mensajes, compartiendo telemetría, funcionando como debería. Y yo ahí, en el escritorio, viendo cómo la malla se formaba en mi pantalla.

Fue...emocionante.

Pero luego vino la parte incómoda: noté que mientras algunos nodos reportaban alcances de varios kilómetros (algunos decían tener cobertura en pueblos vecinos), el mío parecía quedarse corto. Transmitía, recibía, pero no llegaba tan lejos como esperaba. Realmente sólo hablaba con uno en la cima de una colina que hacía de puente con el resto.

Y me preguntaba: ¿es el firmware? ¿la región? ¿la configuración de potencia?

La respuesta, después de un rato de investigación, fue sorprendentemente simple:

**Probablemente fuera la antena.**

No me había parado a pensar en ello. Había puesto el nodo en marcha, lo había configurado, había visto funcionar el protocolo LoRa... pero la antena que llevaba era la que venía por defecto en el Heltec V2. Pequeña, hecha de no se sabe muy bien qué, sin mucho amor incorporado.

Y resulta que en radiofrecuencia, **la antena no es un accesorio. Es la mitad de tu juego.**

---

## Radiofrecuencia: lo que conocía e ignoraba hace una semana

Lo primero que descubrí es que una buena antena para LoRa no es cosa trivial. No es como cambiar un cable. Es un componente que:

- Define cuánta energía radiada sale (o entra) en la dirección que importa.
- Afecta directamente al alcance y a la calidad de la señal.
- Tiene que estar ajustada a la frecuencia que usas.

Sí había trabajado anteriormente con RF pero era en el proyecto rpiTx, es decir transmitir con una raspberry. Cosa la cual se hacía enganchando un hilo a uno de los pines GPIO. Por consiguiente, antena antena no era.

En mi caso, España usa la banda **EU868** para LoRa. Eso significa que la frecuencia central anda en torno a **868 MHz** (técnicamente, el rango es 863–870 MHz, pero digamos 868 de referencia).

Y una antena para 868 MHz **no es lo mismo** que una para 2.4 GHz (WiFi) o para 433 MHz (otros protocolos).

La longitud importa. Literalmente.

---

## Longitud de onda y la regla de la física

Aquí es donde entran las matemáticas, pero no desesperes: es simple, lo prometo.

La relación es:

$$\text{Longitud de onda} = \frac{c}{f}$$

Donde:
- $c$ = velocidad de la luz = 300.000.000 metros por segundo = 3 · 10⁸ m/s
- $f$ = frecuencia en Hz.

Para 868 MHz (868.000.000 Hz):

$$\lambda = \frac{300.000.000}{868.000.000} \approx 0,346 \text{ metros} = 34,6 \text{ cm}$$

Eso es la **longitud de onda completa**.

Ahora bien, las antenas que más ves en LoRa son de **media onda** (λ/2) o de **cuarta onda** (λ/4):

- **Media onda**: $34,6 \div 2 = 17,3 \text{ cm}$ (más directiva, mejor ganancia)
- **Cuarta onda**: $34,6 \div 4 = 8,65 \text{ cm}$ (más omnidireccional, más fácil de ajustar)

En la práctica, para cortar una antena de cuarto de onda no se usa exactamente $\lambda/4$, sino:

$$L = \left(\frac{\lambda}{4}\right) \times k$$

Donde $k$ es el **factor de acortamiento**. Para cobre en aire, suele estar entre **0,95 y 0,98**.

Eso deja la longitud real de corte para 868 MHz aproximadamente entre:

- **8,22 cm** (si $k = 0,95$)
- **8,47 cm** (si $k = 0,98$)

Estas no son números mágicos. Son límites de la física ondulatoria. Si tu antena tiene la longitud correcta, resuena. Si no, pierde eficiencia. Puede llegar a perder muchos dB (decibelios), que en radiofrecuencia es como perder potencia de transmisión.

---

## Tipos de antena (la taxonomía rápida)

Navegando por el mundo LoRa, encontré que hay esencialmente algunos tipos principales:

![Esquema comparativo de antenas monopolo, dipolo y Yagi para LoRa]({{ '/assets/img/posts/2026-04-17-antenas-lora-guia/antenas-lora-tipos.svg' | relative_url }})

*Ilustración 1. Comparativa visual simplificada de patrones y geometrías típicas en LoRa (elaboración propia).* 

### 1) **Antena dipolo de cuarta onda (Monopolo)**

Es lo más simple: un trozo de alambre (o cable) de unos 8,65 cm perpendicular a la placa.

**Ventajas:**
- Barata o gratis (es alambre).
- Funciona.
- Fácil de hacer.

**Desventajas:**
- Necesita un plano de tierra (la placa sirve).
- Patrón de radiación omnidireccional pero con nulos (puntos donde no irradia).
- Si no está exactamente a 90°, pierde eficiencia.

### 2) **Antena Dipolo de media onda (Dipolo simétrico)**

Dos brazos de ~8,65 cm cada uno, separados 180°, alimentados en el centro.

**Ventajas:**
- Patrón más limpio.
- No requiere plano de tierra explícito.
- Ganancia consistente en todas direcciones (plano horizontal).

**Desventajas:**
- Un poco más complicada de hacer bien (hay que alimentarla en el centro).
- Más material.

### 3) **Antena Yagi (directiva)**

La que ves en los techos de las casas apuntando a la estación de TV. Tiene un reflector, un dipolo (excitador) y directores.

![Diagrama simplificado de los elementos de una antena Yagi-Uda]({{ '/assets/img/posts/2026-04-17-antenas-lora-guia/yagi-elementos.svg' | relative_url }})

*Ilustración 2. Partes principales de una antena Yagi-Uda y dirección de máxima radiación (elaboración propia).* 

**Ventajas:**
- Ganancia alta en una dirección específica.
- Buena para alcance a larga distancia si sabes hacia dónde apuntar.

**Desventajas:**
- Compleja de construir bien.
- Tienes que orientarla. No es omnidireccional.
- Para un nodo "fijo" que quiere hablar en todas direcciones, es overkill.

### 4) **Antena helicoidal (Helical)**

Un resorte de alambre enrollado. Se usa mucho en satélites.

**Ventajas:**
- Ganancia buena.
- Patrón interesante.

**Desventajas:**
- Precisión en los giros.
- Tienes que calcular bien el diámetro del helicoide.

### 5) **Antena de cuadro (Loop)**

Un cuadrado o círculo de alambre. Simple pero efectiva.

**Ventajas:**
- Pequeña.
- Ganancia decente.

**Desventajas:**
- Patrón de radiación con nulos (perpendicular al plano del cuadro no hay señal).

---

## La antena actual (y por qué no basta)

![Pinout de la Heltec WiFi LoRa 32 V2.1]({{ '/assets/img/posts/2026-04-17-antenas-lora-guia/Heltec-WIFI-LoRa-32_v2.1_pinout.png' | relative_url }})

*Ilustración 3. Pinout de la Heltec WiFi LoRa 32 V2.1. Fuente: Heltec Automation (imagen de referencia del fabricante).* 

La **Heltec WiFi LoRa 32 V2 no trae una antena LoRa integrada en la PCB**. Lo habitual en este modelo es usar:

- conector **IPEX (U.FL)**, o
- una **antena externa** incluida en el kit.

Esa antena de serie suele ser una **whip barata de 868 MHz**. Funciona, pero:

- La impedancia no está optimizada.
- El factor de calidad es bajo (mucha pérdida).
- No está encapsulada contra la corrosión o el entorno.
- Competencia directa: si la placa se calienta, la antena "ve" ese calor.

En resumen: funciona, pero no es lo mejor que puedes hacer.

---

## Calculadora de cobertura (y mi descubrimiento del día)

Cuando empecé a buscar herramientas para predecir alcances de RF, encontré esto:

[https://www.ve2dbe.com/rmonline_s.asp](https://www.ve2dbe.com/rmonline_s.asp)

Es una página hecha por **VE2DBE** (un radioaficionado, asumo). Tiene una calculadora de **radio de cobertura** que es increíblemente útil para entender qué alcance puedes esperar. Metes:

- Frecuencia (MHz).
- Potencia de transmisión (dBm o watts).
- Ganancia de antena (dBi).
- Sensibilidad del receptor.
- Pérdidas en cables y conectores.

Y te da una estimación del **radio de cobertura** potencial en kilómetros, teniendo en cuenta los modelos de propagación de RF.

Esa herramienta es muy buena para entender qué esperar de tu nodo. Puedes meter diferentes valores de ganancia de antena (2 dBi para la que viene de serie, vs. 5 dBi si haces una mejor) y ver cómo cambia el alcance teórico.

Para calcular las **dimensiones exactas** de una antena para EU868 (868,5 MHz), necesitas hacer los cálculos que expliqué antes:

- **Cuarta onda**: 8,62 cm.
- **Media onda dipolo**: 17,25 cm (total).

Pero la herramienta de VE2DBE te ayuda a ver el **impacto real** que tendrán esas antenas mejores en tu cobertura.

---

## Haciendo una antena casera (la parte divertida)

Después de trastear un poco, decidí probar hacer una antena casera. Nada complicado, solo una de cuarta onda para sustituir la antena de serie.

### Materiales:

- Cable de cobre desnudo (o estaño de soldar) de ~1,5 mm de diámetro.
- Conector SMA hembra o conector que sea compatible con el Heltec.
- Tubo de PVC o cartón (opcional, para proteger).
- Estaño para soldar.

### Pasos:

1. **Corta un trozo de entre 8,2 y 8,5 cm** de cable para 868 MHz (según factor de acortamiento y materiales). Luego ajusta fino recortando décimas si puedes medir.

2. **Pela un extremo** del cable unos 5 mm para dejar cobre al descubierto.

3. **Suelda ese extremo al pin central del conector SMA**. Aquí necesitas un soldador decente y pulso firme.

4. **Dobla el cable** en un ángulo de 90° respecto a la placa del nodo, para que quede perpendicular.

5. **Protege la soldadura** con un poco de epoxi o pegamento termofusible si te preocupa que se rompa.

6. **(Opcional) Envuelve el cable en tubo PVC** si quieres protegerlo de la lluvia o el polvo. Pero sabe que añade una capa dieléctrica que puede cambiar la resonancia ligeramente.

7. **Prueba**. Conecta al Heltec, mira si el RSSI (Received Signal Strength Indicator) mejora con nodos cercanos.

---

## Factor de acortamiento (la trampa que te puede tender)

Si enrollas la antena, o la pones dentro de un tubo de plástico, o la rodea de material dieléctrico (aislante), la longitud de onda "efectiva" se acorta.

Eso se llama **factor de acortamiento o velocity factor**. Para cable de cobre desnudo en el aire es ~0,95 (es decir, 5% más corta). Para tubo PVC, puede ser más (0,85–0,90).

Alguna calculadora **ya te lo ajusta automáticamente**. Es uno de los detalles que las hace tan útiles.

Si quieres hacer una antena enrollada (helicoidal o espiral), el factor es importante. De lo contrario, construyes una antena para 868 MHz y en realidad resuena en 750 MHz.

---

## Ganancia y directividad (los términos que suenan raro)

Cuando lees sobre antenas, ves números como "2 dBi" o "5 dBd". Eso es **ganancia**.

- **dBi** = decibelios respecto a una antena isotrópica (teórica, que radia igual en todas direcciones).
- **dBd** = decibelios respecto a un dipolo.

Una **cuarta onda monopolo** típicamente tiene una ganancia de ~2–3 dBi.
Una **media onda dipolo** anda por los 2–2,15 dBi.

No parece mucho, pero en RF, **3 dB = el doble de potencia** (aproximadamente). Eso no se traduce en el doble de distancia: en condiciones ideales, el alcance suele crecer en torno a **$\sqrt{2}$**, es decir, aproximadamente **1,4x** (un 30-40% más).

---

## Lo que cambié (y qué observé)

Hice una antena casera de cuarta onda, bien soldada, con una longitud inicial dentro del rango práctico (~8,2 a 8,5 cm para 868 MHz en cobre al aire). La conecté al Heltec.

Resultado:

- Señal RSSI mejora unos 2–3 dBm con nodos cercanos (no es gigantesco, pero es notable).
- El alcance se sintió más estable (menos "saltos" en la calidad).
- Algunos nodos que antes apenas se oían, ahora vienen más claros.

No transformó mi nodo en una antena de largo alcance. Pero sí le dio un empujón. Y lo más importante: **aprendí que hay margen de mejora**, que no es solo software ni configuración de radio.

---

## Recomendaciones (sin ser experto, pero siendo honesto)

Si estás empezando con Meshtastic y Heltec V2 como yo:

1. **Prueba primero con la antena de serie.** No gastes dinero aún. Mira qué alcance tienes.

2. **Si tienes acceso a una herramienta de medición (como un analizador de espectro o un SWR meter), úsala.** Eso te dice si tu antena resuena en la frecuencia correcta. Pero entiendo que no todos tenemos esas herramientas. Yo mismo no la tengo.

3. **Haz una antena casera de cuarta onda.** Es barata, funciona y es un buen punto de partida.

4. **Si luego te sientes aventurero**, intenta una **media onda dipolo** o incluso una **Yagi** si tienes paciencia y quieres optimizar una dirección específica.

5. **Usa la calculadora online** de VE2DBE. No hay excusa para no conocer hasta donde llega realmente.

6. **Documenta.** Mide tu antena, anota las frecuencias, prueba. Eso es lo que quiero hacer yo en próximos logs.

---

## Conclusión (y por qué esto importa)

Cuando empecé con Meshtastic, pensaba que era un problema de software y configuración. Tenía razón a medias.

Pero hay **capas debajo**: el firmware, la radio SX1276, la placa, los componentes pasivos... y **la antena**.

La antena es el interfaz entre el nodo y el éter. Es lo que convierte tus bits en ondas, y las ondas de otros nodos en bits que puedas entender.

Ignorarla es como tener un megáfono roto.

Así que la próxima vez que alguien te diga "cambié el firmware y de repente tengo mejor alcance", pregunta también por la antena. Apuesto a que hay una historia ahí.

En el siguiente log quiero hacer pruebas de campo real: medir RSSI a diferentes distancias, cambiar antenas, y documentar los resultados. Porque todo esto es bonito en teoría, pero lo interesante viene en la práctica.

P.d.: Estoy iniciandome en el mundo de la tecnología LoRa, las radiofrecuencias y similar, si he cometido algún error ponte en contacto conmigo y buscamos una solución. Intento compartir todo lo que voy aprendiendo tal cual lo aprendo, por ello puede contener errores. No obstante disculpas de antemano.

¡Nos vemos en el próximo log!