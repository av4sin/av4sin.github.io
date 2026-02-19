---
layout: post
title: "Cuando el ZenBook no arranca: Fedora, UEFI y el mito del portátil lento"
date: 2026-01-30
categories: [tecnico, linux, hardware]
tags: [fedora, asus, troubleshooting, kde, uefi, rendimiento]
---

## El síntoma: portátil nuevo, arranque viejo

ZenBook 15, recién sacado de la caja. Fedora 43 instalado desde el mismo USB que en otro equipo idéntico. El resultado: arranque lento, animaciones a trompicones, aplicaciones que tardan en abrirse. El hardware es el mismo, el sistema operativo también. ¿Por qué este va peor?

La única diferencia: he reutilizado la carpeta `/home` completa, con todos los archivos y configuraciones de la instalación anterior. Esto, que parece inofensivo, puede arrastrar problemas de versiones anteriores.

## El diagnóstico: la trampa de /home

Lo primero que uno piensa es que el problema está en Fedora, en el hardware, o en alguna configuración del sistema. Pero tras comparar con el otro ZenBook, la conclusión es clara: el culpable está en lo que arrastro en `/home`. Esta carpeta no solo contiene documentos y archivos personales, sino también configuraciones ocultas que pueden no encajar con la nueva instalación.

Lo habitual en estos casos:
- Cachés y configuraciones de KDE Plasma (`~/.config`, `~/.cache`, `~/.local`) que pueden venir de versiones anteriores y no encajan bien con Plasma 6, causando tirones en las animaciones.
- Indexadores como `baloo_file` y `tracker-miner` que saturan la CPU tras reinstalar, indexando archivos que ya no existen o están en rutas diferentes.
- Flatpak reparando permisos y tardando en optimizarse, especialmente si hay aplicaciones que dependen de permisos heredados.
- SELinux sin reetiquetar tras copiar datos, lo que puede causar denegaciones de acceso y lentitud en el acceso a archivos.
- Firmware y microcódigo sin actualizar, lo que afecta al rendimiento general del sistema.

Estos elementos, heredados de la instalación anterior, pueden hacer que un sistema nuevo se comporte como uno viejo y sobrecargado.

## Pruebas y falsas soluciones

Empecé probando lo clásico: renombrar cachés y configs de KDE para forzar regeneración.

```bash
flatpak repair
sudo restorecon -Rv /home
sudo fwupdmgr refresh && sudo fwupdmgr update
top
systemd-analyze blame
```

El sistema mejoró algo en fluidez, pero el arranque seguía siendo lento y las aplicaciones no respondían como deberían.

Al inspeccionar con `top` apareció otro sospechoso: `gdb` consumiendo CPU, lanzado por ABRT (Automatic Bug Reporting Tool). Para detener y limpiar ABRT ejecuté:

```bash
sudo systemctl stop abrtd && sudo systemctl disable abrtd
systemctl --user mask abrt-applet.service
sudo rm -rf /var/spool/abrt/*
```

Eso mejoró la fluidez general, pero no tocó el problema del arranque.

Intenté también desactivar esperas de TPM y puertos serie en GRUB, blacklistear módulos y regenerar initramfs, pero nada cambió drásticamente. El cuello de botella persistía.

## El cuello de botella real: UEFI

El punto clave llegó al analizar los tiempos de arranque. Para ello ejecuté los siguientes comandos:

```bash
systemd-analyze
systemd-analyze blame
```

El sistema se quedaba esperando dispositivos que no existen (TPM, puertos serie, USB fantasma), pero sobre todo, el firmware UEFI estaba cinco versiones por detrás de lo que Asus ofrece para este modelo.

La salida exacta de `systemd-analyze` fue:

```
Startup finished in 4.084s (firmware) + 28.903s (loader) + 9.624s (kernel) + 1min 6.855s (initrd) + 40.961s (userspace) = 2min 30.429s 
graphical.target reached after 40.960s in userspace.
```

Esto significa que el arranque tomaba más de dos minutos, con el initrd (la imagen de arranque del kernel) tardando más de un minuto solo en cargar. Comparado con el otro ZenBook, que arrancaba en segundos, era evidente que algo fundamental fallaba.

La diferencia entre un portátil que arranca en diez segundos y uno que tarda más de un minuto puede estar en el firmware. El UEFI controla cómo se inicializa el hardware, y una versión desactualizada puede causar que el sistema espere respuestas de componentes que no responden correctamente, o que no optimice el arranque para el hardware específico.

En mi caso, la solución fue buscar el modelo exacto en la web de Asus, descargar el fichero de actualización y seguir el [procedimiento oficial](https://www.asus.com/support/faq/1008859/). Copiar el archivo a un USB, extraerlo (muy importante, porque a la primera se me olvidó y falló), entrar en la BIOS pulsando ESC durante el arranque y luego "Enter Setup", y lanzar la actualización desde el menú de herramientas. Nada más.

Tras actualizar el UEFI, el ZenBook arrancó como debe: rápido, sin esperas innecesarias, y con Fedora funcionando igual de fluido que en el otro equipo idéntico. Ninguna configuración de /home, ni cambios en GRUB, ni limpieza de servicios puede sustituir una actualización de firmware cuando el cuello de botella está ahí.

---

## Actualización (2026-01-31): el ZenBook vuelve a fallar

Tras la actualización de UEFI todo parecía solucionado, pero al día siguiente el equipo volvió a mostrar tirones y problemas de resolución. El diagnóstico apuntó a la GPU integrada (AMD) y al panel OLED: Fedora necesitaba un kernel más moderno y firmware de AMD para manejar correctamente la pantalla (resolución y 120Hz).

Medidas aplicadas:
- Actualizar el kernel y paquetes.

```bash
sudo dnf upgrade --refresh
```

- Instalar/controlar drivers `amdgpu` (paquete/firmware).

```bash
sudo dnf install xorg-x11-drv-amdgpu
```

- Desactivar PSR en casos problemáticos (añadir `amdgpu.dcdebugmask=0x10` a la línea de arranque) y regenerar GRUB.

```bash
# editar /etc/default/grub y añadir amdgpu.dcdebugmask=0x10 a GRUB_CMDLINE_LINUX
sudo grub2-mkconfig -o /boot/grub2/grub.cfg
```

Resultado: tras ajustar kernel/driver/GRUB la pantalla recuperó 120Hz y los tirones desaparecieron. Fue una solución parcial pero necesaria para estabilizar el sistema.

---

## Actualización (2026-02-03): tercera ronda y limpieza final

El problema volvió a reaparecer con errores de `amdgpu` durante la inicialización (mensajes tipo "Fatal error during GPU init") y fallos secundarios (Snap, periféricos). Las acciones que ayudaron fueron:

- Reinstalar firmware de AMD y regenerar initramfs.

```bash
sudo dnf reinstall <firmware-paquete>
sudo dracut --force
```
- Eliminar snapd si no es necesario y usar flatpak como alternativa.

```bash
sudo dnf remove snapd
sudo rm -rf /var/lib/snapd
rm -rf ~/snap
# instalar Spotify (ejemplo) vía Flatpak
flatpak remote-add --if-not-exists flathub https://dl.flathub.org/repo/flathub.flatpakrepo
flatpak install flathub com.spotify.Client
```

Esas operaciones dejaron el sistema usable, pero el fallo volvía de vez en cuando: indicio de un problema más profundo a nivel de firmware/firmware específico del fabricante.

---

## Resolución final (resultado definitivo)

Después de probar todas las opciones anteriores sin éxito, y tras investigar a fondo, encontré que el problema real era el firmware de la tarjeta gráfica proporcionado por Asus. Curiosamente, la utilidad oficial de actualización de Asus solo permite instalar esos ficheros desde Windows; por eso tuve que **reinstalar Windows temporalmente** para ejecutar el actualizador de Asus y aplicar el firmware correcto.

Tras instalar el firmware de GPU desde Windows, volví a borrar Windows y reinstalé **Fedora**. Desde entonces el portátil funciona correctamente: arranque rápido, pantalla a 120Hz y sin ningún problema.

---

## Recomendación final

Si tienes un equipo moderno con GPU integrada (especialmente paneles OLED o hardware muy nuevo), considera que algunas actualizaciones críticas solo las facilita el fabricante y pueden requerir herramientas que no siempre están disponibles en Linux. Antes de decidirte por reinstalar todo, revisa firmware (UEFI y GPU) y, si es necesario, utiliza temporalmente las herramientas del fabricante para aplicar actualizaciones de bajo nivel.

¡Nos vemos en el siguiente log!
