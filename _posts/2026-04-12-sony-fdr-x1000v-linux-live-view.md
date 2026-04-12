---
layout: post
title: "Intentar sacar el Live View por WiFi de una Sony FDR-X1000V en Linux"
date: 2026-04-12
categories: [tecnico, linux, hardware]
tags: [sony, fdr-x1000v, wifi, live-view, vlc, ffplay, atak, ffmpeg]
---

## Hoy tocó frente nuevo: la Sony FDR-X1000V

La misión parecía fácil:

**"Tengo una Sony FDR-X1000V, tiene WiFi y quiero ver lo que transmite desde Linux"**.

Spoiler: no es una webcam plug and play. Pero se puede, y cuando entiendes el truco, sale.

---

## El primer bloqueo: ¿a qué IP me conecto?

Primero revisé red con `ifconfig` y esto fue lo importante:

- interfaz activa: `wlp115s0f4u1`
- IP: `192.168.122.151`

Conclusión rápida: **sí estaba en la red de la cámara**.

En esta FDR-X1000V el punto de acceso iba en `192.168.122.x`, y la cámara era:

- `192.168.122.1`

Así que primera lección del día: en este modelo no me tocó `10.5.5.x`, me tocó `192.168.122.1`.

---

## Fase 1: confirmar el mapa con `dd.xml`

Conectado al WiFi de la Sony, me puse a investigar y descubrí:

```bash
curl http://192.168.122.1:64321/dd.xml
```

Y ahí salió todo el tesoro:

- API base: `http://192.168.122.1:8080/sony`
- servicio cámara: `http://192.168.122.1:8080/sony/camera`
- live view: `http://192.168.122.1:8080/liveview/liveviewstream`

Con eso ya no hay adivinanzas: tienes IP, puerto y endpoint reales.

---

## Fase 2: despertar el stream (si no, no hay vídeo)

En estas Sony no basta con abrir la URL del vídeo. Primero hay que lanzarle un `startLiveview`:

```bash
curl -X POST http://192.168.122.1:8080/sony/camera \
-d '{
	"method": "startLiveview",
	"params": [],
	"id": 1,
	"version": "1.0"
}'
```

Si responde bien, la cámara está emitiendo.

---

## Fase 3: VLC pensando infinito, `ffplay` al rescate

Aquí vino el clásico: `curl` bien, todo parece funcionar, pero VLC se quedaba pensando unos segundos, minutos.... eternamente.

El motivo: el flujo de Sony no siempre le gusta a VLC tal cual viene (MJPEG + headers).

Pruebas:

```bash
vlc http://192.168.122.1:8080/liveview/liveviewstream
```

No había manera de hacerlo funcionar.

Con `ffplay`, en cambio, entró a la primera:

```bash
ffplay -i http://192.168.122.1:8080/liveview/liveviewstream
```

Y para bajar latencia es añadirle un par de parámetros:

```bash
ffplay -fflags nobuffer -flags low_delay -i http://192.168.122.1:8080/liveview/liveviewstream
```

---

## Fase 4: script rápido para no repetir comandos

Para no hacer `curl` + `ffplay` a mano cada vez me he preparado este pequeño script:

```bash
#!/usr/bin/env bash
curl -s -X POST http://192.168.122.1:8080/sony/camera \
-d '{"method":"startLiveview","params":[],"id":1,"version":"1.0"}' > /dev/null

ffplay -fflags nobuffer -flags low_delay -i http://192.168.122.1:8080/liveview/liveviewstream
```

---

## Fase 5: llevarlo a ATAK

Aquí estaba el **objetivo final real** del experimento: verlo dentro de ATAK.

Como ATAK suele llevarse mejor con H.264/MPEG-TS o RTSP, toca traducir stream en Linux con `ffmpeg`.

Ejemplo directo por UDP al Android:

```bash
ffmpeg -i http://192.168.122.1:8080/liveview/liveviewstream \
-c:v libx264 -preset ultrafast -tune zerolatency \
-f mpegts udp://IP_DE_TU_ANDROID:1234
```

En ATAK, en el reproductor de vídeo, añadir fuente UDP al puerto `1234`.

En laboratorio funciona, pero en mi caso práctico fue demasiado lento e ineficaz: latencia alta, estabilidad pobre y rendimiento insuficiente para algo operativo de verdad.

Así que, después de probarlo, decidí desistir de esta vía para uso real.

---

## Problemas típicos que pueden aparecer

- **No responde `dd.xml`** → no estás realmente en la red de la cámara.
- **`startLiveview` responde pero no hay imagen** → la cámara dejó de emitir por timeout; relanza y abre rápido.
- **VLC se queda colgado** → probar `ffplay` directamente.
- **ATAK no ve nada** → problema de rutas/red entre Linux y Android.
- **ATAK se ve pero va mal** → latencia y degradación por transcodificación/retransmisión.

---

## Conclusión del día

La pregunta era “¿a qué IP me conecto?” y aquí quedó resuelta:

- cámara: `192.168.122.1`
- discovery: `http://192.168.122.1:64321/dd.xml`
- API: `http://192.168.122.1:8080/sony/camera`
- vídeo: `http://192.168.122.1:8080/liveview/liveviewstream`

Hoy no fue enchufar y listo. Y desde luego tampoco ver la imagen desde el navegador como esperaba inicialmente.
Hoy fue hablar el idioma de Sony: discovery, API, trigger y luego player.

Y aunque el objetivo final era ATAK, esta implementación concreta no me sirve en un entorno real por lo lenta y poco eficaz que resulta.

¡Nos vemos en el próximo log!
