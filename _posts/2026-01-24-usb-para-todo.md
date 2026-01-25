---
layout: post
title: "El USB que mentía: luchando con hardware inestable y el infierno del I/O"
date: 2026-01-24
categories: [tecnico, linux]
tags: [openwrt, usb, storage, troubleshooting, dmesg, ext4]
---

## Crónica de un desastre anunciado

Como comenté en el registro anterior, intentar meter Tailscale en un router con 12M de flash es una misión suicida. La solución técnica era obvia: almacenamiento externo. Un pendrive de 16GB, un puerto USB y un punto de montaje. Parecía el paso más sencillo de toda la infraestructura del **Tak Server**, pero terminó siendo una guerra de guerrillas contra el kernel de OpenWrt.

Este es el registro de por qué nunca debes confiar en un pendrive "que funcionaba en el portátil".

## El síntoma: El rechazo del sistema

El plan era montar el USB en `/mnt/usb` para alojar los binarios pesados. Pero al primer intento, el sistema escupió el primer error:

```bash
mount /dev/sda1 /mnt/usb
# NTFS signature is missing.
# Failed to mount '/dev/sda1': Invalid argument

```

El router estaba convencido de que la partición era NTFS, pero era incapaz de leerla. Intenté forzar el montaje al dispositivo completo (`/dev/sda`) y el error fue aún más críptico: el volumen estaba "abierto exclusivamente" pero el punto de montaje no existía.

Mi sistema se estaba convirtiendo, otra vez, en ese Frankenstein de configuraciones rotas que tanto odio.

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

1. **Identidad múltiple:** El USB tenía restos de una tabla NTFS antigua, pero OpenWrt detectaba un EXT4 corrupto por debajo.
2. **Inestabilidad eléctrica:** El dispositivo pasaba de informar 15GB a 4GB de forma aleatoria. En estos routers, el puerto USB a veces no entrega el amperaje necesario, provocando reconexiones constantes.
3. **Journaling corrupto:** El sistema de transacciones (JBD2) estaba muerto. El USB era un pisapapeles que el kernel intentaba montar y desmontar en un bucle infinito.

## La purga: Vuelta a los básicos

Aprendí con la migración a Fedora que intentar arreglar algo sucio solo genera más suciedad. No iba a intentar reparar el journal desde el router. Había que aplicar "tierra quemada".

Me llevé el USB a una estación de trabajo Linux para una reconstrucción total. Nada de herramientas gráficas; limpieza desde la terminal:

```bash
# Eliminación de firmas y tablas antiguas
wipefs -a /dev/sdX
parted /dev/sdX mklabel msdos
parted /dev/sdX mkpart primary ext4 1MiB 100%

# Formateo puro (Sin compatibilidad con Windows, solo rendimiento)
mkfs.ext4 -L ROUTER_USB /dev/sdX1

```

## El regreso al router

Con el USB "domado" y formateado en EXT4 limpio, volví al escenario de batalla. Esta vez, el montaje fue silencioso. Como debe ser.

```bash
mount /dev/sda1 /mnt/usb
df -h
# /dev/sda1       14.6G   24M   13.8G   1% /mnt/usb

```

Por fin, el espacio necesario para que Tailscale respire. Sin este paso, el post anterior sobre el despliegue del túnel habría sido imposible. No era un problema de software, era un problema de cimientos.

## Lecciones para el "yo" del futuro

1. **Dmesg siempre tiene razón:** Si el log dice que hay errores de buffer, deja de probar comandos de `mount`. El hardware está fallando.
2. **NTFS no tiene sitio aquí:** En un entorno de red Linux (OpenWrt), meter capas de compatibilidad con Windows es buscarse problemas de permisos y estabilidad.
3. **El hardware es caprichoso:** Un USB que parece sano en un PC puede ser una pesadilla en un router con recursos limitados.

Con el almacenamiento estable, la base para el **Tak Server** y el **Subnet Routing** está lista. El router ya no es un juguete; es un servidor de red con espacio para crecer.

¡Nos vemos en el siguiente log!