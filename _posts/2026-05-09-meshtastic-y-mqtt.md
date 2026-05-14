---
layout: post
title: "Continuación con Meshtastic: MQTT, qué es y cómo integrarlo"
date: 2026-05-09
categories: [meshtastic, iot, tecnico]
tags: [meshtastic, mqtt, iot, privacidad, server]
---

## Retomando Meshtastic

Hace no mucho tiempo como bien sabeis empecé a jugar con Meshtastic. Lo que me gustó fue la simplicidad: nodos LoRa que forman una red malla, mensajes simples entre dispositivos y la posibilidad de integrarlo con más servicios. En este post retomo ese hilo y me centro en una pieza que suele aparecer cuando uno quiere «hacer cosas» con datos: MQTT.

Voy a intentar ser lo más claro y didáctico posible: explicar qué es MQTT, por qué se usa en IoT, y después cómo encaja (y se puede aprovechar) en un despliegue con Meshtastic. También comentaré por qué no es obligatorio depender del servidor que la comunidad pone a disposición y cómo tener control propio aporta privacidad y resiliencia.

---

## ¿Qué es MQTT? Una explicación sin tecnicismos inútiles

MQTT (Message Queuing Telemetry Transport) es un protocolo de mensajería ligero diseñado para conectar sensores, actuadores y aplicaciones en entornos con recursos limitados o redes inestables. Sus ideas clave son:

- Publicar/Suscribir (pub/sub): los dispositivos «publican» mensajes en un tópico y otros «se suscriben» a esos tópicos para recibirlos. No hace falta que publicador y suscriptor estén conectados al mismo tiempo.
- Broker central: hay un intermediario (broker) que recibe, filtra y distribuye mensajes. Ejemplos populares: Mosquitto (ligero, muy usado), HiveMQ (comercial), EMQX.
- Ligero y eficiente: diseñado para poco consumo de ancho de banda y CPU; por eso es tan usado en IoT.

Conceptos prácticos:

- Tópicos: cadenas jerárquicas como `sensores/puerta/entrada` o `meshtastic/nodo/123/rx`.
- QoS (Quality of Service): niveles 0, 1 y 2 que controlan la garantía de entrega.
- Retained messages: mensajes que el broker recuerda y entrega a nuevos suscriptores.
- Last Will: un mensaje que el broker publica si un cliente se desconecta de forma inesperada.

Si eres de los que prefieren analogías, piensa en MQTT como una oficina de correos: los remitentes dejan cartas (publican) en buzones (tópicos) y los destinatarios se inscriben para recibir correspondencia de ciertos buzones.

---

## ¿Por qué MQTT en IoT? Ventajas y casos de uso

- Desacoplamiento: los dispositivos no necesitan conocer direcciones IP o detalles unos de otros; solo usan tópicos.
- Eficiencia: ideal para baterías y redes con latencia o pérdida.
- Escalabilidad: un broker bien configurado permite crecer desde unas pocas hasta miles de conexiones.
- Integración: existen clientes MQTT en prácticamente cualquier lenguaje (Python, Node.js, C, Java), y un amplio número de plataformas (Home Assistant, Node-RED) lo tienen ya de serie.

Casos prácticos: leer sensores, telemetría de dispositivos, integración con dashboards, puentes entre protocolos (MQTT <-> HTTP, MQTT <-> WebSocket), y acciones remotas (comandos a actuadores).

---

## MQTT y Meshtastic: ¿qué sentido tiene juntarlos?

Meshtastic provee comunicación entre dispositivos LoRa en una malla. Eso resuelve el transporte «radio». MQTT ocupa la capa de integración: permite que los mensajes recibidos por un nodo o un gateway entren en el ecosistema habitual de IoT (dashboards, bases de datos, automatizaciones).

Utilidades concretas:

- Centralizar telemetría: recibir mensajes de todos los nodos en un `broker` y almacenarlos o visualizar en tiempo real.
- Puente a Internet: un gateway conectado a Internet puede publicar lo que llega por LoRa al broker y permitir que aplicaciones interactúen con la red mesh.
- Automatizaciones y control remoto: un `publish` a un tópico concreto puede hacer que un nodo realice una acción (si el nodo y el firmware lo soportan).

En resumen: Meshtastic cubre el transporte local / malla; MQTT facilita la integración con el mundo de servicios y aplicaciones. En general el internet.

---

## ¿Cómo se configura? Opciones y ejemplos prácticos

Hay varias formas de llevar mensajes de Meshtastic a MQTT. Aquí explico las más comunes, de la más simple a la más controlada.

1) Usar un bridge/servidor ya hecho por la comunidad

- Existen proyectos y servicios que actúan como puente entre Meshtastic y MQTT. Son cómodos porque ya vienen con la lógica de transformación de mensajes y los tópicos estandarizados.
- Ventaja: plug-and-play. Desventaja: dependes de terceros (privacidad, disponibilidad, límites).

2) Ejecutar tu propio broker MQTT (recomendado si valoras control)

- Instalar Mosquitto en una Raspberry Pi o VPS es rápido y te da control total.

Instalación mínima (Debian/Ubuntu):

```bash
sudo apt install -y mosquitto mosquitto-clients
sudo systemctl enable --now mosquitto
```

Crear un usuario seguro:

```bash
sudo mosquitto_passwd -c /etc/mosquitto/passwd usuario
```

Luego en `/etc/mosquitto/conf.d/auth.conf` añade:

```
allow_anonymous false
password_file /etc/mosquitto/passwd
```

Ejemplo mínimo de `mosquitto.conf` para pruebas:

```
listener 1883
allow_anonymous false
password_file /etc/mosquitto/passwd
persistence true
```

3) Implementar un bridge propio (ligero y flexible)

- Si quieres control total sobre cómo se mapean mensajes Meshtastic→MQTT, una buena opción es ejecutar un pequeño servicio que haga de puente:
  - Se conecta a Meshtastic (por ejemplo vía USB/serial o usando la API del gateway)
  - Traduce los mensajes al esquema de tópicos que elijas
  - Publica en tu broker MQTT con `paho-mqtt` (Python) o equivalente

Patrón de tópicos sugerido (ejemplo):

- `meshtastic/nodos/<nodeid>/rx` → mensajes recibidos del nodo
- `meshtastic/nodos/<nodeid>/tx` → mensajes enviados hacia el nodo
- `meshtastic/gateway/status` → estado del gateway (conexión, IP, uptime)

Beneficio: control de formato, filtros, seguridad y enriquecimiento (añadir timestamp, ubicación, etc.).

---

## ¿Por qué no depender únicamente del servidor comunitario en español?

La comunidad suele ofrecer servidores y servicios compartidos para facilitar la incorporación. Son estupendos para empezar rápido, pero tienen limitaciones:

- Privacidad: tus mensajes pueden pasar por infraestructura de terceros.
- Disponibilidad: si el servicio cae, tu integración externa se queda sin fuente.
- Personalización: puede que no ofrezcan el esquema de tópicos o el enriquecimiento de datos que necesitas.

Ventajas de auto-hospedar:

- Control total sobre retención de datos y acceso.
- Posibilidad de filtros personalizados, reglas y persistencia local.
- Integración con tu stack (dashboards, bases, backups, HA).

Si lo que quieres es experimentar rápido, el servidor comunitario está bien. Si tu prioridad es privacidad, continuidad u opciones de personalización, montar tu propio broker y/o bridge es la mejor opción.

---

## Ejemplo de flujo simple (sin entrar en código específico de Meshtastic)

1. Un nodo Meshtastic envía un mensaje radio a la malla.
2. Un gateway (un dispositivo conectado via USB o un nodo con acceso a Internet) recibe ese mensaje.
3. El gateway procesa el mensaje y publica en `meshtastic/nodos/<nodeid>/rx` en tu broker MQTT local.
4. Aplicaciones suscritas (dashboard, logger, reglas de automatización) reaccionan: almacenan, muestran en pantalla o disparan acciones.

Con este patrón tienes desacople: puedes cambiar el dashboard sin tocar la red LoRa, o añadir componentes nuevos que se suscriben a los tópicos que te interesen.

---

## Consejos prácticos y consideraciones finales

- Empieza simple: monta Mosquitto localmente y usa un único tópico para probar.
- Añade autenticación y, si te expones a Internet, TLS.
- Normaliza la estructura de tópicos desde el principio para evitar confusión.
- Documenta cómo traduces campos Meshtastic → payload MQTT (por ejemplo: `from`, `to`, `rssi`, `snr`, `payload`).
- Piensa en retención: guardar todos los mensajes durante meses puede llenar tu disco rápido.


Eso es lo que sé hasta ahora, en el siguiente post, cuando termine de configurar mi propio server, os cuento paso a paso como configurar todo.

¡Nos vemos en el próximo log!