---
layout: post
title: "El botón del pánico: Cuando Fedora decide apagar por las malas (y cómo domar a acpid)"
date: 2026-01-15
categories: [tecnico, linux]
tags: [fedora, kde, plasma, acpid, troubleshooting, logind, zenbook]
---

## El menú fantasma y el mensaje de "Root"

Si en el post anterior hablaba de cómo mi portátil se negaba a dormir, ahora la historia va de todo lo contrario: mi Fedora tenía demasiada prisa por irse a la cama.

Tras solucionar el tema de la tapa, me di cuenta de un comportamiento errático. Al pulsar el botón físico de encendido, esperaba que **KDE Plasma** desplegara su elegante menú preguntándome si quería reiniciar, suspender o apagar. En su lugar, el sistema me soltaba un bofetón en la terminal:

`Broadcast message from root@Golf-Mike-Bravo: The system will power off now.`

Sin avisar, sin confirmar y cerrando todas mis ventanas de golpe. El botón de encendido se había convertido en un botón de ejecución inmediata.

---

## Investigando el "Golpe de Estado" de Root

Lo primero que uno piensa es: *"Configuré mal KDE"*. Pero al entrar en **Administración de Energía**, la opción de "Preguntar qué hacer" estaba marcada. ¿Por qué el sistema me ignoraba?

La respuesta estaba en las capas profundas de Linux. Resulta que en el arranque de este sistema (que ha pasado por mil cambios y configuraciones), había dos jefes intentando mandar sobre el mismo botón:

1. **KDE Plasma (PowerDevil):** El jefe amable que quiere preguntarte qué prefieres.
2. **acpid:** El jefe de la vieja escuela que, en cuanto detecta que tocas el botón, lanza un script de apagado forzoso sin mirar atrás.

---

## La Solución: Poner orden en la jerarquía

Para recuperar el control y que el menú de KDE volviera a aparecer, tuve que aplicar una "limpieza de servicios" en tres pasos:

### 1. Neutralizar al intermediario (acpid)

En sistemas modernos, `acpid` suele entrar en conflicto con los servicios actuales de gestión de energía. El mensaje de "Broadcast from root" era su firma. La solución fue detenerlo y, lo más importante, desactivar su *socket* (el oído que escucha el botón):

```bash
sudo systemctl stop acpid.socket
sudo systemctl disable acpid.socket
sudo systemctl stop acpid
sudo systemctl disable acpid
```

### 2. Obligar a Systemd a "hacerse el sordo"

Incluso sin `acpid`, el propio corazón del sistema (`systemd-logind`) a veces intenta gestionar el botón por su cuenta. Para que la señal llegue limpia a KDE, edité de nuevo mi viejo amigo `/etc/systemd/logind.conf`:

```ini
[Login]
# Le decimos que ignore el botón para que KDE pueda capturarlo
HandlePowerKey=ignore
PowerKeyIgnoreInhibited=no
```

### 3. El toque final en KDE

Con el camino despejado, solo quedaba asegurar que KDE estuviera listo para recibir la pelota. En **Configuración del sistema > Atajos**, eliminé cualquier atajo de teclado que estuviera asignado a "Apagar", dejando que fuera el módulo de **Energía** el único encargado de mostrar el diálogo.

---

## Conclusión: El arte de simplificar

Nuevamente, la lección es la misma: **menos es más**. El problema no era que faltara configuración, sino que sobraba un servicio antiguo (`acpid`) haciendo ruido.

Ahora, cuando pulso el botón, mi Fedora se detiene, me mira y me pregunta qué quiero hacer. He pasado de un apagado estilo "tirar del cable" a una transición elegante. Mi "Golf-Mike-Bravo" está, por fin, totalmente domado.

¡Nos vemos en el próximo log!