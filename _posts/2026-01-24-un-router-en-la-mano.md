---
layout: post
title: "Negociando con el hierro: Tailscale en un router de 128MB y el muro del espacio"
date: 2026-01-26
categories: [tecnico, redes]
tags: [openwrt, tailscale, cgnat, networking, troubleshooting]
---

## El siguiente frente de batalla

Tras conseguir que mi servidor TAK funcione, el siguiente problema me esperaba en la esquina de la mesa: el router **GL-AR300M**. 

El objetivo era integrar este pequeño nodo en mi red para dar soporte al **Tak Server**. Si el servidor cae o si el CGNAT del operador decide que hoy no me deja pasar, necesito una puerta trasera. Una forma de entrar en mi casa sin pedir permiso al ISP. Tailscale era la respuesta lógica. O eso creía yo antes de chocarme con la realidad del hardware limitado.

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

Incluso la RAM temporal estaba colapsada. El router estaba respirando con un solo pulmón. Me di cuenta de que no podía seguir por la vía rápida. Si quería que este nodo viviera para ver el amanecer, tenía que externalizar el almacenamiento.

## La solución: El bypass del USB

No iba a usar *extroot* ni complicarme con particiones lógicas que pudieran corromperse al primer apagón. Necesitaba algo quirúrgico. Usar un USB solo como almacén de binarios y sockets.

Tras una pelea con el kernel para que reconociera el sistema de archivos del USB (una historia que daría para otro post lleno de logs de error), conseguí montarlo en `/mnt/usb`.

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

Tras autorizar el dispositivo en el panel de control, apareció la magia: una IP 100.x.x.x respondiendo pings. El router ya no era una isla invisible tras el CGNAT.

## Por qué esto importa para el Tak Server

Este post no es solo por el placer de hackear un router viejo. Es por **redundancia**.
En mi infraestructura, el **Tak Server** es el corazón. Pero si el túnel principal falla, este router es mi "botón del pánico". A través de él, puedo saltar por SSH al servidor, diagnosticar y arreglar el desastre sin tener que estar físicamente allí. Es el cordón umbilical que me permite dormir tranquilo.

## Lecciones aprendidas

Nuevamente, la lección es que **nada es gratis en el hardware antiguo**. En sistemas modernos como Fedora nos hemos acostumbrado a que el espacio no importe, pero en OpenWrt, cada byte se gana.

He pasado de un router ciego a tener una puerta trasera segura y cifrada. No ha sido elegante, ha sido una lucha contra los límites de la física y el software, pero funciona.

Esta es otra huella en mi bitácora. Si alguna vez te quedas sin espacio en un router y necesitas desesperadamente un túnel, ya sabes que el USB es tu único aliado.

¡Nos vemos en el próximo log!