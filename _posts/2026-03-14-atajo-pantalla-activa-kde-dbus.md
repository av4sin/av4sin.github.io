---
layout: post
title: "Crear un atajo para mantener la pantalla activa en KDE Plasma investigando DBus"
date: 2026-03-14
categories: [tecnico, linux, kde]
tags: [kde, plasma, dbus, powerdevil, qdbus6, systemd]
---

## Lo que parecía un atajo fácil

En **KDE Plasma** hay una opción muy útil dentro del widget de batería: **mantener la pantalla activa**. Es perfecta para esos momentos en los que estás leyendo documentación, vigilando instalaciones o dejando procesos largos en marcha y no quieres que la pantalla se apague ni que el equipo entre en suspensión por inactividad.

Mi objetivo era simple: crear un atajo de teclado para activar y desactivar esa opción sin depender del widget.

Spoiler: lo que parecía trivial acabó siendo una pequeña sesión de ingeniería inversa con **DBus**.

## Primer intento: tirar de la API clásica de PowerDevil

Lo primero fue probar directamente contra el servicio de energía de KDE, **PowerDevil**. Cosa que parecía sencilla segñun un usuario de StackOverflow. Empecé con esto:

```bash
qdbus org.kde.Solid.PowerManagement /org/kde/Solid/PowerManagement/Actions/DPMSControl org.kde.Solid.PowerManagement.Actions.DPMSControl.toggle
```

Resultado:

```text
Error: org.freedesktop.DBus.Error.UnknownObject
No such object path '/org/kde/Solid/PowerManagement/Actions/DPMSControl'
```

Eso ya olía a versiones antiguas y comandos desactualizados. El post era de hace 2 años. Probé entonces con métodos que históricamente se usaban para inhibiciones:

```bash
qdbus6 org.kde.Solid.PowerManagement /org/kde/Solid/PowerManagement org.kde.Solid.PowerManagement.clearInhibitions
```

Y devolvió:

```text
Error: org.freedesktop.DBus.Error.UnknownMethod
No such method 'clearInhibitions'
```

Luego intenté:

```bash
qdbus6 org.kde.Solid.PowerManagement /org/kde/Solid/PowerManagement org.kde.Solid.PowerManagement.beginSuppressingSleep
qdbus6 org.kde.Solid.PowerManagement /org/kde/Solid/PowerManagement org.kde.Solid.PowerManagement.stopSuppressingSleep
```

Mismo desenlace: método inexistente.

Conclusión rápida: en versiones modernas de **KDE Plasma**, esa interfaz ya no está donde estaba.

## Segundo paso: mirar qué hace KDE de verdad

Cuando la documentación no cuadra con la realidad, toca observar el tráfico real. Así que me puse a espiar DBus mientras activaba manualmente “mantener pantalla activa” desde el widget de batería:

```bash
dbus-monitor "interface='org.freedesktop.PowerManagement.Inhibit'"
```

Al activar la opción apareció:

```text
method call sender=:1.47 -> destination=org.freedesktop.PowerManagement.Inhibit
member=Inhibit
string "org.kde.plasmashell"
string "La miniaplicación de la batería ha activado la supresión de la suspensión y del bloqueo de pantalla"
```

Y ahí cayó la ficha: el widget no está usando la API interna de PowerDevil para esto, sino la interfaz estándar de Freedesktop:

```text
org.freedesktop.PowerManagement.Inhibit
```

## Reproducirlo desde terminal

Con esa pista, ya podía replicar exactamente el comportamiento.

Activar inhibidor:

```bash
qdbus6 org.freedesktop.PowerManagement.Inhibit \
/org/freedesktop/PowerManagement/Inhibit \
org.freedesktop.PowerManagement.Inhibit.Inhibit \
"atajo" "Pantalla siempre activa"
```

Salida:

```text
9
```

Ese número es el **ID del inhibidor**. Para desactivarlo:

```bash
qdbus6 org.freedesktop.PowerManagement.Inhibit \
/org/freedesktop/PowerManagement/Inhibit \
org.freedesktop.PowerManagement.Inhibit.UnInhibit \
9
```

## Ver qué inhibidores siguen activos

También se puede inspeccionar el estado general con `systemd`:

```bash
systemd-inhibit --list
```

Salida típica:

```text
WHO                    UID  USER   PID  COMM            WHAT
ModemManager           0    root   1061 ModemManager    sleep
NetworkManager         0    root   1159 NetworkManager  sleep
UPower                 0    root   983  upowerd         sleep
Bloqueador de pantalla 1000 user   1815 kwin_wayland    sleep
PowerDevil             1000 user   2162 org_kde_powerde handle-power-key
```

Muy útil para entender quién está bloqueando suspensión, apagado o acciones relacionadas con inactividad.

## Conclusión

Esta mini investigación deja varias cosas claras:

- KDE cada vez delega más en interfaces estándar de **Freedesktop**.
- Algunas APIs antiguas de **PowerDevil** ya no están disponibles.
- El control real de estas inhibiciones pasa por **DBus** y encaja con el ecosistema de **systemd**.

Con herramientas como `qdbus6`, `dbus-monitor` y `systemd-inhibit` puedes entender qué hace realmente el escritorio por debajo y montar tus propios scripts o atajos con mucha más precisión.

Y sí: misión cumplida. Ya se puede crear un atajo para “mantener la pantalla activa” sin depender del clic en el widget de batería.

El atajo puede ser algo como esto:

```bash
#!/bin/bash

FILE="/tmp/kde_inhibit_id"

if [ -f "$FILE" ]; then
	ID=$(cat "$FILE")
	qdbus6 org.freedesktop.PowerManagement.Inhibit \
	/org/freedesktop/PowerManagement/Inhibit \
	org.freedesktop.PowerManagement.Inhibit.UnInhibit $ID
	rm "$FILE"
else
	ID=$(qdbus6 org.freedesktop.PowerManagement.Inhibit \
	/org/freedesktop/PowerManagement/Inhibit \
	org.freedesktop.PowerManagement.Inhibit.Inhibit \
	"atajo" "Pantalla siempre activa")
	echo "$ID" > "$FILE"
fi
```

Basta con meterlo en la carpeta `.config`, guardarlo como un `.sh`, darle permisos de ejecución y luego asignarlo a un atajo de teclado desde la configuración del sistema.

¡Nos vemos en el próximo log!