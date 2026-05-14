---
layout: post
title: "Meshtastic otra vez: Heltec V3, flasheo desde terminal y usando la utilidad real de este blog"
date: 2026-05-14
categories: [meshtastic, tecnico, linux, hardware]
tags: [meshtastic, heltec, heltec-v3, esp32-s3, firmware, terminal, lora, linux]
featured: true
pin: true
---

## Volver al mismo sitio para entender mejor donde estoy

No me di cuenta el dia que flashee por primera vez el firmware del **Heltec V3**. Hice lo de siempre: conectar, descargar, probar, seguir adelante y dar por hecho que ya lo tenia controlado.

Hoy, al volver a flashearlo, me he dado cuenta de algo que parece obvio pero que no siempre se ve cuando uno esta metido en la faena: no pude recurrir a mi propia guia.

A mi blog.

Y precisamente ahi esta una de las razones por las que existe este sitio. No solo para contar cosas. No solo para ordenar ideas. Tambien para servir de apuntes de futuro. Para que, cuando vuelva a tropezar con el mismo problema, no tenga que reconstruirlo todo desde cero.

Este post nace de esa idea.

Y tambien de una conclusion bastante practica: **flashear un Heltec V3 desde terminal es mucho mas facil de lo que parecia con el V2.1**.

---

## Lo que me paso realmente

La historia es simple. Tenia el Heltec V3 ya preparado, pero queria repetir el proceso desde cero para dejarlo limpio y volver a entender bien cada paso.

En ese momento me di cuenta de que ya no recordaba con total seguridad el flujo exacto. Y cuando uno trabaja con firmware, radio y placas ESP32, improvisar no suele ser buena idea.

Asi que hice lo logico: volvi a la documentacion oficial.

La referencia que me sirvio de verdad fue la documentacion de Meshtastic para dispositivos ESP32. Ahí dejan claro algo importante: para este tipo de placas, el metodo por CLI es el proceso manual, mientras que el web flasher es el camino mas rapido para mucha gente.

Las dos opciones son validas.

Pero si lo que quieres es entender lo que estas haciendo, el de terminal te da mas control y mas claridad.

---

## Antes de descargar nada: elegir bien el dispositivo

Este paso parece una tonteria, pero no lo es.

Cuando vas a descargar firmware estable desde el repositorio de **meshtastic/firmware** en GitHub, no basta con bajar el primer archivo que veas. Primero tienes que elegir el tipo de dispositivo correcto.

En el caso del **Heltec V3**, el paquete correcto es el que corresponde a **ESP32-S3**.

Y aqui esta una de las claves que conviene grabarse a fuego: **Heltec V3 no es lo mismo que otras Heltec ni que la V2.1**. Aunque por fuera parezcan primos cercanos, por dentro no comparten exactamente el mismo camino de firmware.

Si eliges mal la arquitectura, puedes acabar descargando un binario que no corresponde con tu placa. Y eso significa perder tiempo, dudar de si el problema es tuyo o de la placa, y volver a empezar.

Por eso el orden correcto es este:

1. Entrar en la pagina de descargas de Meshtastic.
2. Elegir la version estable.
3. Ir al release de GitHub.
4. Buscar los assets.
5. Seleccionar el firmware de **ESP32-S3**.
6. Descargar, descomprimir y flashear.

Parece un circuito largo.

En realidad, es bastante directo.

---

## Lo que hice yo con la version estable

En la version estable que estaba usando, la referencia era la **2.7.15**. Una vez descargado el paquete correcto, el flujo es muy limpio.

El archivo que buscas dentro del paquete descomprimido es algo parecido a esto:

```bash
firmware-heltec-v3-2.7.15.XXXXXX.bin
```

Ese `XXXXXX` puede variar segun el build concreto, asi que lo importante no es memorizar exactamente el sufijo, sino entender la estructura del nombre.

La parte importante es esta:

- `firmware-heltec-v3` indica que es para tu placa.
- `2.7.15` indica la version.
- `XXXXXX` identifica el build concreto.

Ese detalle te evita muchas confusiones cuando estas dentro de la carpeta y ves varios archivos parecidos.

---

## Flashear desde terminal, paso a paso

Una vez que has descargado y descomprimido el paquete correcto, el proceso en terminal es bastante simple.

Primero te colocas dentro de la carpeta donde quedo descomprimido el firmware:

```bash
cd firmware-esp32s3-2.7.15.xxxxxx/
```

El nombre exacto de la carpeta puede cambiar segun la version y el paquete que hayas descargado, pero la idea es esa: entrar en el directorio del firmware ya descomprimido.

Despues ejecutas el script de instalacion:

```bash
./device-install.sh -f firmware-heltec-v3-2.7.15.XXXXXX.bin
```

Y ya esta.

Ese comando es el corazon del proceso. No hay misterio adicional. No hay que compilar nada. No hay que entrar en PlatformIO. No hay que reconstruir todo el arbol de build. Simplemente le dices al script que quieres instalar ese binario concreto en esa placa concreta.

Si por cualquier motivo el script no tuviera permisos de ejecucion, la solucion es la de siempre:

```bash
chmod +x device-install.sh
```

Despues repites el comando anterior y sigues adelante.

---

## Por que esto me parece mas facil que con la V2.1

Con el Heltec V2.1 llego un punto en el que el proceso me parecia mas artesanal. Habia que hilar mas fino, leer mas, probar mas cosas y entender mejor que estaba haciendo cada herramienta.

Con el V3, en cambio, el camino me ha parecido bastante mas claro.

Y no porque el hardware sea magico, sino porque el flujo esta mejor encajado:

- eliges la arquitectura correcta,
- descargas el paquete estable,
- descomprimes,
- ejecutas el script,
- y listo.

Eso reduce mucho la friccion mental.

Cuando una guia te deja el proceso tan directo, es mas facil repetirlo meses despues sin tener que volver a leer media internet.

Y precisamente por eso este blog tiene sentido.

---

## Lo que aprendi al volver a hacerlo

La leccion mas importante no es tecnica. Es de metodo.

Si documentas bien lo que haces, vuelves mas rapido al punto donde empezaste a entender el problema. Y si no lo documentas, cada repeticion te obliga a reconstruir la historia desde el principio.

Eso es exactamente lo que me paso aqui.

Tenia el conocimiento, pero no lo tenia fuera de mi cabeza.
Y cuando lo necesitaba de verdad, mi cabeza no era el mejor sitio para buscarlo.

Por eso me gusta pensar que un blog tecnico no sirve solo para enseñar a otros.

Tambien sirve para rescatarte a ti mismo dentro de unos meses.

---

## Resumen practico

Si quieres quedarte con lo esencial, seria esto:

1. Para un **Heltec V3**, el firmware correcto es el de **ESP32-S3**.
2. Antes de descargar, elige bien el dispositivo en el release estable de Meshtastic.
3. Descomprime el paquete.
4. Entra en la carpeta del firmware.
5. Ejecuta:

```bash
./device-install.sh -f firmware-heltec-v3-2.7.15.XXXXXX.bin
```

6. Si todo ha ido bien, ya puedes usar el dispositivo con normalidad y seguir con la configuracion de Meshtastic.

Es un proceso mas corto de lo que parece cuando lo explicas con calma.

---

## Cierre

Hoy he vuelto a flashear el Heltec V3 y, al mismo tiempo, he vuelto a entender por que este blog existe.

No para guardar notas bonitas, sino para dejar un camino claro para la proxima vez.

Porque la proxima vez va a llegar.

Y cuando llegue, mejor que yo mismo tenga ya escrito donde estaba el atajo.

¡Nos vemos en el próximo log!