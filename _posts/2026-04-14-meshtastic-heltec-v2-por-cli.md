---
layout: post
title: "Operación Heltec V2: desplegar Meshtastic por CLI (sin flasher web)"
date: 2026-04-14
categories: [tecnico, linux, hardware, meshtastic]
tags: [meshtastic, heltec, lora, esp32, esptool, ttyusb0, dialout]
---

## De la teoría a la práctica (o por qué hoy me metí en otro lío)

Este post es el primero de una serie que iré escribiendo estos meses: mi iniciación (tardía, pero con ganas) a **LoRa** y a **Meshtastic**.

Lo gracioso es que esto lo descubrí *antes del apagón*, pero me quedé en modo “ya lo miraré”. Leía por encima, guardaba enlaces, veía vídeos, me decía que sí… y luego me iba a hacer cualquier otra cosa.

Hasta que el otro día dije: vale, basta. Vamos a probarlo de verdad.

### Vale, pero… ¿qué es LoRa y qué pinta Meshtastic aquí?

En mis palabras (sin vender humo):

- **LoRa** es radio pensada para llegar lejos gastando muy poca batería.
  - La trampa: no es para mandar vídeos ni fotos. Es para **mensajes pequeños** (y aun así, con paciencia).
  - No es WiFi, no es 4G, no es “me conecto y tengo internet”. Es otro juego.

- **Meshtastic** es el pegamento que hace que esto sea usable: un firmware + app/cliente que convierte estas placas en **nodos de una red mallada**.
  - Si hay varios nodos, no hace falta que todos se vean entre sí: unos pueden repetir a otros.
  - Lo que me enganchó: mensajería/telemetría “de andar por casa” sin depender de infraestructura.

Y hoy el objetivo era sencillo de decir y más pesado de ejecutar:

**meter Meshtastic en un Heltec WiFi LoRa 32 V2**, por CLI, sin flasher web.

Spoiler: el primer enemigo no fue el LoRa. Fue el puerto y los permisos. Linux y su sentido del humor peculiar.

Regla de oro (antes de empezar): antena LoRa conectada cuando toque transmitir. Aquí no jugamos con RF a pecho descubierto.

---

## El mapa (qué pieza es qué)

- El Heltec V2 es un **ESP32**.
- El USB suele ir por un microusb.
- En Linux eso termina apareciendo como un puerto serie tipo **`/dev/ttyUSB0`**.
- Para flashear, la herramienta que he usado yo es **`esptool`**.

Traducción rápida: si no existe `/dev/ttyUSB0`, no existe la placa para linux.

---

## El truco del PRG + RST (cuando no conecta)

Cuando `esptool` se queda en “connecting…” o no engancha a la primera, casi siempre es porque la placa no está en modo bootloader.

La secuencia que he hecho más de una y diez veces:

1. Conecta la placa por USB.
2. Mantén pulsado **PRG**.
3. Pulsa y suelta **RST**.
4. Suelta **PRG**.

Sí, parece teatro. Pero funciona.

---

## Preparación (herramientas)

Necesitaba dos cosas: el cliente de Meshtastic en el móvil y `esptool` para flashear.

```bash
pip install esptool
```

En mi caso saltó el típico aviso de dependencias por el entorno que ya tenía montado. Pero como acabó con un “Successfully installed …”, lo di por bueno y seguí adelante.

Y detalle importante: `esptool.py` aún funciona, pero ya avisa de que está deprecated. Mejor usar `esptool` directamente.

---

## El síntoma: no hay puerto (o aparece cuando le da la gana)

Primera comprobación:

```bash
ls /dev/ttyUSB*
```

Si te responde:

```text
ls: no se puede acceder a '/dev/ttyUSB*': No existe el fichero o el directorio
```

No es que tu nodo no funcione. Es que Linux no está viendo un puerto serie USB, que es lo que necesita para hablar con la placa y así flashear el firmware.

En mi caso, tras reconectar, apareció:

```text
/dev/ttyUSB0
```

Con eso ya tenía por donde empezar.

---

## El primer muro: `Permission denied`

El primer intento con `esptool` murio con el clasico:

```text
could not open port /dev/ttyUSB0: [Errno 13] Permission denied: '/dev/ttyUSB0'
Hint: Try to add user into dialout or uucp group.
```

Traducción: el puerto existe, pero yo no mando ahí.

La solución buena (la que deja el sistema bien) es meter tu usuario en `dialout`:

```bash
sudo usermod -aG dialout $USER
```

Y para no reiniciar sesión:

```bash
newgrp dialout
groups
```

Comprobación visual de que el puerto está en `dialout`:

```bash
ls -l /dev/ttyUSB0
```

---

## Borrado total (por si había fantasmas)

Antes de cargar nada, borré flash sin piedad. Total que podía haber que me sirviera (Esta vez tuve razón, no había nada valioso):

```bash
esptool --chip esp32 --port /dev/ttyUSB0 erase-flash
```

Si conecta, verás el “Connected to ESP32…”, y eso ya es media victoria.

---

## El firmware: dos caminos y una brújula

Aquí está la parte que más confunde y con lo que me pude tirar 30 minutos por lo menos: **qué archivo flashear y a qué dirección**.

### Crédito donde toca (y de dónde saqué los binarios)

Los ficheros que usé para el Heltec V2 los saqué de aquí:

https://github.com/psdurco/Meshtastic.2.5.22-Heltec-v2

Básicamente es un paquete ya compilado para Heltec V2 con los `.bin` listos. En mi caso, esto fue justo lo que necesitaba para dejarme de dar vueltas. (No os preocupéis que cuento la historia. Resulta que el nodo que tengo es un poco antiguo ya, es la V2 y meshtastic desde la version 2.6 incluida ha dejado de dar soporte al dispositivo. Pero esto hay que buscarle una solución que iré viendo más adelante.)

### Opción A (quirúrgica): tres archivos, tres direcciones

Si tienes:

- `bootloader.bin`
- `partitions.bin`
- `firmware.bin` (o `firmware.factory.bin` según el paquete)

El esquema típico es:

```text
bootloader.bin   → 0x1000
partitions.bin   → 0x8000
firmware.bin     → 0x10000
```

En comandos:

```bash
esptool --chip esp32 --port /dev/ttyUSB0 write-flash 0x1000 bootloader.bin
esptool --chip esp32 --port /dev/ttyUSB0 write-flash 0x8000 partitions.bin
esptool --chip esp32 --port /dev/ttyUSB0 write-flash 0x10000 firmware.bin
```

Esto funciona muy bien cuando el paquete viene “separado” con esas piezas claras.

### Opción B (martillo percutor): `firmware.factory.bin` a `0x0`

En el paquete para Heltec V2 que os comentaba antes, viene un archivo clave:

- `firmware.factory.bin`

Ese archivo suele ser un “todo en uno” y se escribe desde el inicio:

```bash
esptool --chip esp32 --port /dev/ttyUSB0 --baud 921600 write-flash 0x0 firmware.factory.bin
```

¿Por qué esta opción es tan buena cuando estás atascado?

- Porque reduce el número de variables: **un archivo, una dirección**.
- Si has probado cosas raras antes, el “factory” suele dejar el tablero en un estado consistente.

Si ves que a `921600` va inestable, baja a `115200` y sacrifica velocidad por fiabilidad:

```bash
esptool --chip esp32 --port /dev/ttyUSB0 --baud 115200 write-flash 0x0 firmware.factory.bin
```

### Explicación de los números baud

Cuando pones `--baud 921600` o `--baud 115200`, lo que estás diciendo es: **"a esta velocidad quiero hablar por el puerto serie"**.

- `115200` = más lento, pero normalmente más estable.
- `921600` = mucho más rápido, pero más sensible a cables reguleros, puertos USB tiquismiquis o interferencias.

No tiene nada que ver con el LoRa en sí (ni con el alcance, ni con la radio). Esto es solo la **autopista USB entre tu PC y el ESP32** mientras flasheas.

Regla práctica de campo:

- Si todo va fino: usa `921600` y tardas menos.
- Si ves cortes, errores raros o se queda colgado: baja a `115200` y listo.

Importante: la velocidad la tienen que entender ambos lados en ese momento (tu herramienta y el chip). Si no van sincronizados, salen jeroglíficos o directamente falla la comunicación.


---

## Señales de vida (y falsas alarmas)

### “El puerto está ocupado”

Si el error dice que el puerto está *busy*, hay que buscar quién lo tiene agarrado. Eso, claro, al toquetear tanto porque no llegue aquí a la primera, el puerto se me había ocupado. Un intento para solucionarlo puede ser ver quien lo usa:

```bash
lsof /dev/ttyUSB0
```

(Si sale algún proceso, ahí tienes al culpable.)

y después ver el log de mensajes:

```bash
sudo dmesg | tail -n 20
```

Ahí se ve el relato del kernel: desconexión, reconexión, y el driver atando el USB a `ttyUSB0`.

---

## Post‑operación

Aquí aprendí una lección rápida: **`esptool` no trae comando `monitor`**.

Si quieres consola serie, necesitas otra herramienta (y en mi caso ni `screen` ni `picocom` estaban instalados).

Opciones típicas:

- `screen /dev/ttyUSB0 115200`
- `picocom -b 115200 /dev/ttyUSB0`
- `minicom -D /dev/ttyUSB0 -b 115200`

La gracia es que esto ya no es “flasheo”; esto es *escuchar la radio*.

El tema viene con que claro, yo había estado flasheando pero hasta que no hice justo el procedimiento que os comparto, no hubo manera si quiera de encender la pantalla. Por eso quería ver el monitor y si me daba errores.

---

## Checklist final (lo que me funcionó)

- Puerto visible: `ls /dev/ttyUSB*` → aparece `/dev/ttyUSB0`.
- Permisos arreglados: usuario en `dialout` + sesión actualizada (`newgrp dialout` o re-login).
- Borrado total: `esptool ... erase-flash`.
- Flasheo consistente:
  - o bien **tres binarios** (0x1000/0x8000/0x10000),
  - o bien **factory a 0x0** (mi opción favorita cuando el objetivo es “revivir y dejar estable”).

---

## Lecciones aprendidas

Si algo me llevo de este primer choque con LoRa/Meshtastic es lo mismo de siempre: el problema no suele ser lo "complicado", sino lo básico.

- Si no hay `/dev/ttyUSB0`, no hay magia: cable, puerto, driver, o simplemente reconectar.
- Si hay `/dev/ttyUSB0` pero hay `Permission denied`, el sistema te está diciendo: "vale, te veo, pero no te dejo".
- El ritual **PRG + RST** no es folklore: es la diferencia entre un flasheo que arranca y un "connecting..." infinito.
- Y el `.factory.bin` es el comodín cuando quieres dejarte de microgestionar direcciones.

## Conclusión del día

Hoy no fue “instalar un firmware”.
Hoy fue: localizar puerto, conseguir permisos, borrar y escribir con método.

La victoria no fue que `esptool` escribiese bytes.
La victoria fue ver el **Connected to ESP32** sin protestas y terminar con **Hash verified**.

Siguiente misión (ya fuera de este parte): enlazar el nodo desde el cliente/serial o por Bluetooth y comprobar que entra en red.

¡Nos vemos en el próximo log!
