---
layout: post
title: "Cuando Linux dijo no: USB, permisos y el día que tres placas casi me ganan"
date: 2026-01-18
categories: [tecnico, hardware, linux]
tags: [fedora, arduino, digispark, usb, udev, linux, permisos, ch340]
---

## Cuando el problema no es el código

Hoy, después del experimento del [mando imposible](https://av4sin.github.io/blog/2026/01/18/el-mando-no-manda/), os cuento la odisea de conectar Arduino a un Frankestein de SO.

Spoiler: no es facil.

El hardware funcionaba.  
El código compilaba.  
Los sketches se subían… a veces.

Pero Linux tenía otros planes.

---

## El primer aviso: micronucleus y una librería fantasma

Todo empezó al intentar subir código al DigiSpark:

```

error while loading shared libraries:
libusb-0.1.so.4: cannot open shared object file

````

El error era claro para quien lleva tiempo en Linux:

El cargador **micronucleus** depende de una versión antigua de libusb:

- `libusb-0.1`
- obsoleta
- retirada de la mayoría de sistemas modernos
- pero todavía usada por hardware muy antiguo

Fedora, correctamente, **no la instala por defecto**.

La solución fue simple:

```bash
sudo dnf install libusb-compat-0.1
````

Y comprobar:

```bash
ldconfig -p | grep libusb-0.1
```

Cuando apareció:

```
/lib64/libusb-0.1.so.4
```

el DigiSpark volvió a respirar.

---

## “Plug in device now…”

El siguiente susto fue psicológico. (No he subido muchos sketches a mi digispark (aun...))

Tras compilar:

```
Running Digispark Uploader...
Plug in device now... (will timeout in 60 seconds)
```

Parecía congelado.

Pero no lo estaba.

### Así funciona realmente el DigiSpark

El ATtiny85 **no tiene USB nativo real**.

Usa:

* V-USB
* software timing
* sin reloj dedicado
* sin controlador USB físico

Eso implica:

* El bootloader solo escucha durante unos segundos
* Si conectas antes → no detecta nada
* Si conectas después → funciona

Por eso el orden es crítico:

1. Desconectado
2. Pulsar “Subir”
3. Cuando lo pide → conectar

No es opcional.
Es física.

---

## El DigiSpark sí estaba ahí

Linux lo confirmó:
```bash
lsusb
```
Con lo que aparece:
```
16d0:0753 Digistump DigiSpark
```

Eso significaba algo importante:

* El USB funcionaba
* No había problema de drivers
* No había problema de kernel

El DigiSpark **no usa `/dev/tty`**.

Es un **dispositivo HID**, igual que:

* teclados
* ratones
* gamepads

Por eso:

* No aparece como puerto serie
* No necesita permisos
* No existe `/dev/ttyUSB0`

Y aquí vino una confusión clave.

---

## HID no es Serial (y Linux lo deja muy claro)

Mientras el DigiSpark aparecía como joystick automáticamente:

```bash
/dev/input/js0
```

el Arduino Nano y el Arduino Uno funcionaban de forma completamente distinta.

---

## Entra el Arduino Nano (CH340)

Al conectar el Nano apareció esto:

```
1a86:7523 QinHeng Electronics CH340
```

El famoso chip oriental USB–Serial.

Este **sí crea un dispositivo serie**:

```
/dev/ttyUSB0
```

Pero Linux lo protege.

Por defecto pertenece a:

```
root:dialout
```

Y si tu usuario no está en ese grupo:

```
Permission denied
```

Aunque el cable esté bien.
Aunque el sketch compile.
Aunque el Arduino esté perfecto.

No es Arduino.
Es Linux haciendo su trabajo.

---

## La solución estándar

```bash
sudo usermod -aG dialout $USER
```

Cerrar sesión.
Volver a entrar.

Desde ese momento:

```
/dev/ttyUSB0
```

queda accesible sin sudo.

---

## Pero luego apareció otro distinto

Tras subir el codigo compilado al arduino nano, sorpesa, no se sube. 
En ese momento el IDE de arduino decide desconectar el nano cada vez que intento subir el codigo.

Podría haber invertido 1 hora en solucionarlo. Sí.
¿Lo hice? No. ([Y menos mal...](https://av4sin.github.io/blog/2026/01/18/el-mando-no-manda/))

Cuando conecté mi otro Arduino:

```
2341:0043 Arduino Uno R3
```

Este ya no usa CH340.

Usa **CDC ACM**, el estándar USB oficial.

Linux lo expone como:

```
/dev/ttyACM0
```

Mismo concepto.

Distinto dispositivo.

Mismos permisos.

Otro punto de confusión habitual:

* Nano → ttyUSB
* Uno → ttyACM

Y si eliges el puerto incorrecto:

```
avrdude: ser_open(): permission denied
```

aunque tengas permisos en el otro.

---

## La solución “como con el Nano”

En lugar de usar grupos, se puede hacer permanente con **udev**.

Ejemplo para Arduino Uno:

```text
SUBSYSTEM=="tty",
ATTRS{idVendor}=="2341",
ATTRS{idProduct}=="0043",
MODE="0666"
```

Guardado en:

```
/etc/udev/rules.d/50-arduino-uno.rules
```

Tras recargar:

```bash
sudo udevadm control --reload-rules
sudo udevadm trigger
```

Linux deja de preguntar.

El dispositivo pasa a ser accesible para cualquier usuario.

Exactamente igual que el Nano.

---

## Resumen técnico real de todo lo ocurrido

Durante este proyecto convivieron **tres mundos USB distintos**:

| Dispositivo          | Tipo USB   | Archivo          |
| -------------------- | ---------- | ---------------- |
| DigiSpark            | HID        | `/dev/input/js0` |
| Arduino Nano (CH340) | USB–Serial | `/dev/ttyUSB0`   |
| Arduino Uno          | CDC ACM    | `/dev/ttyACM0`   |

Cada uno:

* usa drivers distintos
* crea nodos distintos
* requiere permisos distintos
* y falla de formas completamente diferentes

El error no estaba en el código.
Ni en el IDE.
Ni en Fedora.

Estaba en **mezclar dispositivos USB que Linux trata como cosas totalmente distintas**.

---

## Lo que realmente aprendí

* HID no implica Serial
* USB no es “un puerto”, es una jerarquía entera
* udev es tan poderoso como invisible
* El 90 % de los errores de Arduino en Linux **no son Arduino**
* Y leer `lsusb` dice más verdad que cualquier IDE

Al final solo hacía falta entender **qué estaba pasando realmente por debajo**.

Porque cuando sabes qué dispositivo eres…

Dejas de pelear contra linux y luchas con el.

¡Nos vemos en el siguiente log!
