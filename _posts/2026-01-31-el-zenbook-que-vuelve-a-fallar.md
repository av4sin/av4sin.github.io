---
layout: post
title: "El ZenBook que vuelve a fallar: cuando la solución de ayer no basta"
date: 2026-01-31
categories: [tecnico, linux, hardware]
tags: [fedora, asus, zenbook, troubleshooting, amd, rendimiento]
---

## Día 2: La venganza del ZenBook (o cómo el lag me dio una bofetada matutina)

Ayer, con el corazón en un puño y el teclado temblando, apliqué esa solución mágica del firmware UEFI. ¡Funciono! El ZenBook arrancó como un cohete, Fedora volaba, y pensé: "Por fin, la paz". Pero claro, esto es Linux, y Linux nunca te deja tranquilo. Hoy por la mañana, al encenderlo... ¡pum! De vuelta al infierno de los tirones. ¿Qué pasó? ¿Se enfadó el kernel conmigo? ¿O es que el portátil tiene memoria selectiva y "olvida" las soluciones?

Total, que me tocó ponerme el casco de guerra otra vez. Porque, admitámoslo, tener un portátil que va "a trompicones" (como dicen los expertos) es como conducir un coche con frenos de tambor: frustrante, peligroso para la paciencia y, sinceramente, un poco ridículo en un equipo que cuesta un riñón.

## El diagnóstico: vuelta a las trincheras

Primero, lo básico. ¿Es culpa de algún proceso glotón? Abrí la terminal y lancé `top`. El CPU bailaba al 100%, la SWAP llena. Recursos agotados, el sospechoso habitual.

Luego, los drivers de vídeo. `lspci | grep -i vga` confirmó AMD integrada. Nada de NVIDIA.

¿Wayland vs. X11? Fedora adora Wayland, pero a veces es caprichoso. Podría haber probado cambiar a X11, pero fui directo a lo técnico.

Y las extensiones de KDE Plasma: desactivé todas, nada cambió. Al menos eliminé sospechosos.

Ah, y el disco: SSD, no HDD, así que no era eso.

## El giro: es un Asus Zenbook 15 OLED

Después de dar mil vueltas, probando de todo y sintiéndome como un detective en una novela negra, se me ocurrió revisar la resolución de pantalla. ¿Por qué? Porque me di cuenta de que antes todo se veía más grande, con tamaños normales, pero ahora era enano, casi necesitando una lupa para leer. ¡Qué raro! Fui a Configuración -> Monitores, y ahí estaba el problema real: la resolución era una que jamás había visto, algo como 2920x1200 aunque no recuerdo bien, y la pantalla estaba limitada a 60Hz. ¡Mi pantalla OLED es de 120Hz! Y lo peor: no salía el desplegable típico para cambiar la tasa de refresco. Nada, bloqueado.

¡Ah, el modelo! Un Zenbook 15 OLED, esa joya que monta Ryzen 7 potente. Debería volar, pero no. Problema específico: los Ryzen recientes (series 7000/8000) necesitan kernel actualizado y firmware para manejar el panel OLED a través de la integrada AMD.

¡Misterio resuelto! Los Ryzen recientes necesitan kernel actualizado y firmware para manejar el panel OLED.

### Paso 1: Actualización profunda del kernel

AMD pone todo en el kernel. Si Fedora tiene meses, no reconoce la GPU. `sudo dnf upgrade --refresh` y reiniciar. Elegí el kernel más alto en GRUB.

### Paso 2: Firmware de AMD ausente

Fedora no instala todo. `sudo dnf install xorg-x11-drv-amdgpu`. Eso despierta a la bestia Radeon.

### Paso 3: El truco del Panel OLED

Los Zenbook OLED tienen PSR (Panel Self Refresh), que ahorra energía pero causa tirones si falla. Desactivarlo: editar `/etc/default/grub`, añadir `amdgpu.dcdebugmask=0x10` a GRUB_CMDLINE_LINUX, guardar, y `sudo grub2-mkconfig -o /boot/grub2/grub.cfg`. Reiniciar.

Comprobación: `glxinfo | grep "OpenGL renderer"`. Si dice "AMD Radeon...", ¡victoria! Configuración -> Monitores y ¡120Hz al alcance!

Si no, kernel mainline, pero este GRUB suele ser la llave.

## Conclusión: la batalla continúa

Al final, tras editar GRUB y reiniciar, el ZenBook recuperó el control. La pantalla OLED ahora acepta 120Hz, y los tirones son historia. Pero qué ironía: ayer funcionó, hoy no. Linux es así, un amante voluble. Si tu Zenbook va lento, no desesperes; compara con equipos similares, actualiza firmware, kernel, y juega con GRUB. La solución está en lo técnico, no en tirar todo por la borda (aunque yo en un momento de desesperación casi reinstalo TODO).

¡Nos vemos en el siguiente log!