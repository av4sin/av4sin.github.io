---
layout: post
title: "Negociando con la red: Tailscale en un router de 128MB y el muro del espacio"
date: 2026-01-22
categories: [tecnico, redes]
tags: [openwrt, tailscale, networking, troubleshooting, storage, usb]
---

## El siguiente frente de batalla

Tras conseguir que mi [servidor TAK funcionase](https://av4sin.github.io/blog/2026/01/20/tak-server-install/), el siguiente problema me esperaba en la esquina de la mesa: el router **GL-AR300M**. 

La idea no nació de una necesidad crítica, sino de esas ganas de liarse con proyectos nuevos. Quería un router que me diera acceso directo a la red creada por Tailscale. De esta forma, podría acceder a mi servidor TAK desde cualquier ciudad con cualquier dispositivo conectado a ese router, sin tener que pasar por el proceso de registro en la web de Tailscale ni instalar clientes en cada aparato. Sería mi llave maestra para entrar en la red local de mi casa y gestionar mi Raspberry Pi de forma remota.

## La dictadura de los 128MB

Instalar software moderno en un router con CPU MIPS y 128MB de RAM es como intentar meter un motor de Tesla en un Seat Panda. No hay sitio para florituras.

El primer bofetón me lo dio el sistema de archivos de OpenWrt. Ejecuté un `df -h` y la realidad fue insultante:

```bash
Filesystem      Size  Used Avail Use%
/overlay        12M   11M   1M    92%

```

Un mega libre. Eso es todo lo que tenía para maniobrar. Intentar un `opkg install tailscale` era, directamente, un suicidio asistido para la memoria flash del router.

## El error del principiante: El archivo fantasma

Como ya me pasó en la migración de Kali a Fedora, la impaciencia fue mi peor enemiga. Descargué el binario estático de Tailscale en `/tmp` y traté de descomprimirlo.

```bash
tar: write error: No space left on device

```

Incluso la RAM temporal estaba colapsada. El router estaba respirando con un solo pulmón. Me di cuenta de que no podía seguir por la vía rápida. Si quería que este nodo viviera para ver el amanecer, tenía que externalizar el almacenamiento, algo que documenté a fondo en el [siguiente post](https://av4sin.github.io/blog/2026/01/24/usb-para-todo/).

## La solución: El bypass del USB

No iba a usar *extroot* ni complicarme con particiones lógicas que pudieran corromperse al primer apagón. Necesitaba algo quirúrgico. [Usar un USB](https://av4sin.github.io/blog/2026/01/24/usb-para-todo/) solo como almacén de binarios y sockets.

Tras una pelea con el kernel para que reconociera el sistema de archivos del USB, conseguí montarlo en `/mnt/usb`.

### Ejecución manual

Nada de servicios automáticos. Tuve que lanzar el demonio a mano, diciéndole exactamente dónde guardar su estado para no tocar la preciada flash del router:

```bash
/mnt/usb/tailscale/tailscaled \
  --state=/mnt/usb/tailscale/tailscaled.state \
  --socket=/tmp/tailscaled.sock &

```

### El enlace con la 'tailnet'

Con el demonio vivo, tocaba el apretón de manos con la red:

```bash
/mnt/usb/tailscale/tailscale --socket=/tmp/tailscaled.sock up

```

Tras autorizar el dispositivo en el panel de control, apareció la magia: una IP 100.x.x.x respondiendo pings. El router ya no era una isla invisible.

## Por qué esto era una buena idea (y por qué falló)

Este router no era solo una puerta de enlace para el [servidor TAK](https://av4sin.github.io/blog/2026/01/20/tak-server-install/), sino para **todos los dispositivos de mi casa**. La idea era sólida, pero la ejecución se topó con la obsolescencia.

A pesar de tener el túnel arriba, el router no funcionó bien. Las versiones de los paquetes que manejaba eran demasiado antiguas y, por más que lo intenté, no logré conectarme ni siquiera a la Raspberry Pi por SSH. Tras consultarlo, la conclusión fue clara: **faltaba otro router para hacer el puente en mi casa**. Es un tema que tengo pendiente investigar más a fondo, ya que en su momento confié en que la configuración final de mi Tak Server en la RPi solventaría el problema.

## Lecciones aprendidas

Nuevamente, la lección es que **nada es gratis en el hardware antiguo**. He pasado de un router ciego a tener una puerta trasera, aunque sea a medias. No ha sido elegante, ha sido una lucha contra los límites de la física y el software.

Esta es otra huella en mi hisorial. La teoría era perfecta; la práctica me enseñó que la topología de red es un monstruo mucho más complejo.

¡Nos vemos en el próximo log!
