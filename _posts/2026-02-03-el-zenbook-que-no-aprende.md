---
layout: post
title: "El ZenBook que no aprende: tercera ronda de fallos en Fedora"
date: 2026-02-03
categories: [tecnico, linux, hardware]
tags: [fedora, asus, zenbook, troubleshooting, amd, gpu, snap, boot]
---

## Introducción: La calma antes de la tormenta

Hace unos días, publiqué dos posts sobre los problemas de arranque que estaba teniendo con mi ZenBook en Fedora. Primero, [el arranque lento por UEFI desactualizado](https://av4sin.github.io/blog/2026/01/30/zenbook-fedora-arranque-lento/), y luego [la vuelta de los fallos con la GPU AMD](https://av4sin.github.io/blog/2026/01/31/el-zenbook-que-vuelve-a-fallar/). Pensé que con las actualizaciones de firmware y los ajustes en GRUB, todo estaba solucionado. El sistema arrancaba rápido, la resolución era correcta, y KDE Plasma volaba. Pero claro, esto es Linux, y el ZenBook parece tener memoria selectiva. Hoy, 3 de febrero de 2026, me ha dado otra bofetada: vuelta a los errores, pantalla pequeña, lentitud extrema, y un arranque que parece eterno.

Como siempre, voy a documentar todo el proceso de troubleshooting en tiempo real, con la conversación que tuve conmigo mismo (o mejor dicho, con mi yo del futuro que lee esto). Porque, admitámoslo, cuando ves una cascada de errores rojos en pantalla, lo último que quieres es quedarte solo con el problema.

## El síntoma: GRUB, escape y caos

Empieza todo normal: enciendo el ZenBook, aparece el menú de GRUB. Pero hoy, en lugar de elegir la opción por defecto, pulso escape por error. Aparece la consola de GRUB, y ahí me quedo pillado. "¿Cuál de esas opciones tengo que escribir para volver a lo normal?", me pregunto. La respuesta: "continue", pero en esta versión de GRUB no está disponible. Pruebo "exit", y el sistema parece responder: aparece el logo de Fedora, pero luego... errores por doquier.

El UDC (USB Device Controller) se fastidia, servicios fallan, y el sistema inicia el apagado. Pero no, arranca, aunque pequeño y lento. "Eso, porque se tiene que terminar de actualizar", pienso. Pero no termina nunca. Reinicio, y vuelta al mismo lío.

## El diagnóstico: errores por un tubo

Una vez dentro (aunque a duras penas), abro la terminal y veo el historial de errores con:

```bash
journalctl -p 3 -xb
```

La lista es interminable, pero los culpables principales son:

1. **La GPU AMD falla catastróficamente**:
   ```bash
   amdgpu 0000:73:00.0: amdgpu: Fatal error during GPU init
   ```
   y
   ```bash
   probe with driver amdgpu failed with error -12
   ```
   Esto explica por qué todo se ve pequeño y lento: sin drivers gráficos, el sistema usa modo de emergencia con resolución básica.

2. **Snap causando ruido**:
   ```bash
   system: Failed to find and pin callout binary "/usr/libexec/snapd/snap-device-helper"
   ```
   Snap está instalado, pero busca archivos que no existen, ralentizando el arranque.

3. **Problemas con periféricos**:
   ```bash
   Bluetooth: hci0: Opcode 0x0c03 failed: -110
   ```
   el ratón va con lag
   ```bash
   event3 - YICHIP Trust GXT Wireless Mouse: client bug: event processing lagging behind by 110ms
   ```
   y el teclado virtual Maliit hace core dump.

4. **Otros fallos menores**: Workqueue de AMD reset falla, PCIe MP2 de AMD tiene error -95.

El sistema está funcionando a duras penas porque varios componentes fallan a la vez. Como digo en el diagnóstico: "el sistema está funcionando a duras penas porque hay varios órganos vitales fallando a la vez."

## Las soluciones intentadas: de lo básico a lo avanzado

Primero, lo obvio: actualizar todo.

```bash
sudo dnf update --refresh
sudo dnf autoremove
```

Pero el problema persiste.

Luego, regenerar la imagen de arranque:

```bash
sudo dracut --force
```

Esto tarda, pero al final, reinicio y... ¡no se arregla! El sistema arranca igual de lento, resolución incorrecta, velocidad horrible.

El problema parece ser una instalación corrupta. Para ello, intenté reinstalar el firmware de AMD:

```bash
sudo dnf reinstall amd-gpu-firmware
```

Después, forzar la regeneración de la imagen de arranque (otra vez, pero con calma):

```bash
sudo dracut --force
```

De nuevo tarda, pero cuando acaba, reinicio y... ¡se arregla! El sistema arranca normal, resolución correcta, velocidad más que decente.

Pero hay un detalle: Snap sigue causando problemas. Como no lo necesito tanto (solo para Spotify), decido borrarlo.

```bash
sudo dnf remove snapd
sudo rm -rf /var/lib/snapd
sudo rm -rf ~/snap
```

Ahora, ¿cómo instalar Spotify sin Snap? Flatpak al rescate. Ya está instalado, así que añado Flathub:

```bash
flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
flatpak install flathub com.spotify.Client
```

## Conclusión: ¿Por qué sigue pasando?

Estamos en Fedora 43 (Rawhide), una versión de desarrollo. El kernel actual puede tener fallos con hardware AMD reciente. Si el problema vuelve, probar un kernel anterior en GRUB o esperar actualizaciones upstream.

Referenciando mis posts anteriores: el UEFI desactualizado y los drivers AMD siguen siendo temas recurrentes. Parece que el ZenBook necesita "mimos" constantes. ¿Será el hardware? ¿O Fedora? De momento, con dracut y sin Snap, va mejor. Pero quién sabe qué traerá mañana.

Si tienes un ZenBook con Fedora y ves errores similares, revisa los logs y regenera initramfs. Y si usas Snap, piénsalo dos veces.

¡Que no te pase lo mismo!