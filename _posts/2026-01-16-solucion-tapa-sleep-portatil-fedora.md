---
layout: post
title: "Domando la tapa del portátil en Fedora: El arte de no rendirse cuando al cerrarla no se suspende"
date: 2026-01-16
categories: [tecnico, linux]
tags: [fedora, zenbook, tlp, powerdevil, troubleshooting]
featured: true
pin: true
---

## De la teoría a la práctica (o por qué mi portátil no quería dormir)

En el post anterior hablaba de la necesidad de documentar para no olvidar. Pues bien, lo que hoy escribo es el motivo que me incentivó a crear todo esto. 

Empezar con Fedora 43 parecía el plan perfecto. Hardware moderno, un Ryzen potente y la promesa de una estabilidad envidiable. Pero Linux tiene un sentido del humor peculiar: a veces, las cosas más sencillas, como cerrar la tapa y que el portátil se duerma, se convierten en una odisea de logs, servicios en conflicto y sudo.

Este es el registro de cómo pasé de tener un portátil que se quedaba encendido dentro de la mochila a tener una máquina optimizada a nivel extremo.

---

## El síntoma: El insomnio del bicho

Cerraba la tapa. El monitor externo se apagaba. Pero el ventilador seguía girando. El log de `systemd-logind` confirmaba mis sospechas: el sistema detectaba el cierre (`Lid closed`), pero alguien estaba bloqueando la orden de suspensión.

Tras investigar, descubrí al culpable: **PowerDevil**. El gestor de energía de KDE Plasma 6 se había vuelto "posesivo". Tenía un inhibidor que impedía que el sistema operativo tomara el mando. Y lo peor: si intentaba quitar a PowerDevil de la ecuación, perdía el icono de la batería y el control del brillo. 

Estaba atrapado entre tener un icono funcional o un portátil que no se fundiera en su propia funda.

---

## La solución: El equilibrio de poderes

Después de varias horas de "prueba y error" (más error que prueba), la solución no fue borrar servicios, sino poner orden en la jerarquía del sistema. Aquí está la receta que me salvó la vida:

### 1. El "Bypass" de Systemd
Obligamos al sistema a ignorar cualquier bloqueo de aplicaciones externas. Editamos `/etc/systemd/logind.conf` y nos aseguramos de que el sistema mande sobre la tapa, incluso si hay un monitor externo conectado (*docked*):

```ini
[Login]
HandleLidSwitch=suspend
HandleLidSwitchExternalPower=suspend
HandleLidSwitchDocked=suspend
LidSwitchIgnoreInhibited=yes
```

### 2. Resetear PowerDevil

A veces, los archivos de configuración arrastran basura de instalaciones previas (ese "Frankenstein" de Kali que mencioné antes). Borré la configuración antigua y forcé una limpia:

```bash
# Limpiar y reconfigurar
rm ~/.config/powerdevilrc
systemctl --user restart plasma-powerdevil.service
```

### 3. Optimizando el Ryzen: El driver "AMD P-State"

Pero ya que estaba abriendo el capó, no iba a dejar el motor de serie. Activé el driver **AMD P-State EPP**, que permite que el procesador ajuste su energía núcleo por núcleo de forma casi instantánea.

Para ello, añadí `amd_pstate=active` a los parámetros del kernel en el GRUB y configuré **TLP** para gestionar los perfiles. Un paso crítico aquí fue "enmascarar" el gestor por defecto de Fedora para evitar conflictos:

```bash
sudo systemctl mask power-profiles-daemon
```

---

## Cuidando el hardware: El umbral de carga

Lo último fue un toque de cariño a la batería. Como paso muchas horas con el portátil conectado al monitor, configuré umbrales de carga en `/etc/tlp.conf` para evitar que las celdas sufran estando siempre al 100%:

```ini
START_CHARGE_THRESH_BAT0=75
STOP_CHARGE_THRESH_BAT0=80
```

Ahora, mi batería deja de cargar al 80%. Es un ajuste que hará que, dentro de tres años, mi portátil siga teniendo una autonomía decente.

---

## Lecciones aprendidas

Si algo he sacado en claro de este proceso es que **el conflicto suele ser el origen del problema**. En Linux, a menudo tienes dos o tres programas intentando hacer lo mismo, y el resultado es que nadie hace nada (como en la vida misma).

He pasado de un sistema que "se rompía" a cada paso, a uno donde cada pieza sabe cuál es su sitio:

* **TLP** gestiona los voltajes.
* **AMD P-State** gestiona los núcleos.
* **Systemd** gestiona la tapa.
* **KDE** simplemente me lo muestra todo bonito en la barra.

Esta es mi nueva huella digital. Si alguna vez tu portátil se niega a dormir, ya sabes dónde encontrar la respuesta.

¡Nos vemos en el próximo log!
