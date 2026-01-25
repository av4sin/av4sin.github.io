---
layout: post
title: "El USB que mentía: de errores de I/O a la conquista del extroot"
date: 2026-01-24
categories: [tecnico, redes, linux]
tags: [openwrt, usb, storage, troubleshooting, dmesg, ext4, extroot]
---

## Crónica de un desastre anunciado

Como comenté en el registro anterior, intentar meter Tailscale en un router con 12M de flash es una misión imposible. La solución técnica era obvia: almacenamiento externo. Un pendrive de 16GB, un puerto USB y un punto de montaje. Parecía el paso más sencillo de toda la infraestructura del [Tak Server](https://av4sin.github.io/blog/2026/01/20/tak-server-install/), pero terminó siendo una guerra de guerrillas contra el kernel de OpenWrt.

Este es el registro de por qué nunca debes confiar en un pendrive "que funcionaba en el portátil".

## El síntoma: El rechazo del sistema

El plan inicial era montar el USB en `/mnt/usb` para alojar los binarios pesados. Pero al primer intento, el sistema escupió el primer error:

```bash
mount /dev/sda1 /mnt/usb
# NTFS signature is missing.
# Failed to mount '/dev/sda1': Invalid argument

```

El router estaba convencido de que la partición era NTFS, pero era incapaz de leerla. Intenté forzar el montaje al dispositivo completo (`/dev/sda`) y el error fue aún más críptico: el volumen estaba "abierto exclusivamente" pero el punto de montaje no existía. Mi sistema se estaba convirtiendo, otra vez, en ese Frankenstein de configuraciones rotas que tanto odio.

## La verdad está en el `dmesg`

En Linux, cuando el nivel superior miente, hay que bajar al sótano. El log del kernel (`dmesg`) no tiene filtros ni adornos. Lo que encontré fue una carnicería de errores de entrada/salida:

```bash
dmesg | grep sd
# EXT4-fs (sda1): mounted filesystem with ordered data mode
# Buffer I/O error on dev sda1
# JBD2: Error -5 detected when updating journal superblock
# sd 0:0:0:0: [sda] 7864320 512-byte logical blocks: (4.03 GB)

```

**Diagnóstico de campo:**

1. **Identidad múltiple:** Restos de NTFS sobre un EXT4 corrupto.
2. **Inestabilidad eléctrica:** El dispositivo bailaba entre los 15GB y los 4GB. En estos routers, el amperaje del USB es el talón de Aquiles.
3. **Journaling corrupto:** El sistema JBD2 estaba muerto. Un bucle infinito de montajes fallidos.

## La purga: Tierra quemada

Aprendí con la [migración a Fedora](https://av4sin.github.io/blog/2026/01/15/por-que-este-blog/) que intentar arreglar algo sucio solo genera más suciedad. Me llevé el USB a mi estación de trabajo Linux para una reconstrucción total desde la terminal:

```bash
wipefs -a /dev/sdX
parted /dev/sdX mklabel msdos
parted /dev/sdX mkpart primary ext4 1MiB 100%
mkfs.ext4 -L ROUTER_USB /dev/sdX1

```

---

## El siguiente nivel: Convertir el USB en almacenamiento interno (extroot)

Hasta aquí, el USB funcionaba. Se montaba en `/mnt/usb`, podía escribir y copiar binarios. Pero seguía siendo **solo un pendrive**. El sistema base del router continuaba viviendo en su memoria flash interna, asfixiado. Instalar paquetes grandes seguía siendo una utopía.

La única solución real en OpenWrt se llama **extroot**. No es un montaje normal; es un reemplazo del sistema de archivos raíz.

### ¿Qué es realmente extroot?

OpenWrt usa una parte escribible llamada **overlay** montada sobre `/`. Suele tener unos ridículos 8 o 16 MB. Extroot permite mover ese overlay al USB y hacer creer al sistema que ese dispositivo **es su disco interno**. Tras el cambio, el router deja de usar su flash salvo para arrancar.

### Preparación y Módulos

Para que el router entienda qué es un "disco duro", necesité los módulos mínimos:

```bash
opkg update
opkg install block-mount kmod-usb-storage kmod-fs-ext4 e2fsprogs

```

### Clonando el sistema

El paso crítico: clonar el overlay interno actual al USB manteniendo permisos y rutas. No basta con un `cp`, hay que ser precisos:

```bash
mount /dev/sda1 /mnt/usb
tar -C /overlay -cvf - . | tar -C /mnt/usb -xvf -

```

### Configuración del punto de no retorno

Editamos el fstab (`vi /etc/config/fstab`) para que el sistema sepa quién manda ahora. La entrada debe apuntar específicamente al overlay:

```text
config mount
        option target '/overlay'
        option uuid 'TU-UUID-AQUÍ'
        option fstype 'ext4'
        option enabled '1'

```

Activamos el servicio y cruzamos los dedos:

```bash
/etc/init.d/fstab enable
reboot

```

## Momento de la verdad

Tras el arranque, el comando `df -h` devolvió la cifra de la victoria:
`/dev/sda1   14.6G   100M   13.8G   1% /`

Ese `/` ya no es la flash interna. Es el USB. El router ahora tiene gigabytes de sobra.

### Consecuencias inmediatas

* `opkg install` deja de ser un juego de azar.
* Tailscale cabe sin trucos ni hacks de binarios comprimidos.
* Los logs ya no son una amenaza para la estabilidad.
* El GL-AR300M deja de ser un juguete para convertirse en un pequeño servidor Linux.

## Lecciones para el "yo" del futuro

1. **Dmesg siempre tiene razón:** Si el log dice errores de buffer, el hardware está fallando.
2. **El USB es el disco, no un accesorio:** Con extroot, si quitas el pendrive en caliente, el sistema colapsa.
3. **Calidad sobre cantidad:** Usa USBs estables. Un fallo en el almacenamiento es un fallo en el corazón del router.

Con el almacenamiento estable y el espacio conquistado, la base para el [proyecto de Tailscale](https://av4sin.github.io/blog/2026/01/22/un-router-en-la-mano/) está por fin lista.

¡Nos vemos en el siguiente log!
