---
layout: post 
title: "Operación TAK: De cero a Red Táctica en una Raspberry Pi (La Guía Definitiva)" 
date: 2026-01-25 
categories: [tecnico, redes, raspberrypi, tak, seguridad] 
tags: [takserver, atak, tailscale, ufw, linux, debian, subnet-routing, certificados]
---

## Introducción: ¿Qué demonios es eso de TAK?

Mis planes para este verano eran, sobre el papel, sencillos. Quería aprender. Quería entender cómo funcionan las redes de coordinación, cómo trazar rutas automáticas para llegar a lugares sin intervención humana y, sobre todo, quería dominar el ecosistema **TAK**.

Antes de entrar en la terminal y empezar a escribir código, hay que entender qué estamos montando. **ATAK** (Android Team Awareness Kit) y su contraparte de servidor, **TAK Server**, no son "otra app de mapas".

Originalmente, las siglas significaban **Tactical Awareness Kit**. Es software de grado militar desarrollado por el laboratorio de investigación de la Fuerza Aérea de EE.UU. Su propósito es el **SA (Situational Awareness)**: saber dónde estás tú, dónde están tus amigos (Blue Force Tracking) y dónde están los peligros, todo en tiempo real, sobre mapas geoespaciales complejos, con chat encriptado y transferencia de archivos.

Recientemente, se liberó la versión civil (**CIV**), cambiando "Tactical" por "Team". Es la misma bestia, pero accesible para nosotros.

Mi objetivo era ambicioso:

1. Montar un **TAK Server** central en casa.
2. Usar una humilde **Raspberry Pi 4B** como cerebro.
3. Crear una red privada segura que saltara las restricciones de mi operador de internet.
4. Controlarlo todo estrictamente desde Linux.

Spoiler: He tenido que quemar una tarjeta SD minimo 5 veces, he peleado con firewalls que me echaron de mi propia máquina y he descubierto que el enrutamiento en Linux es un arte oscuro. Si quieres replicar esto, prepárate un café largo. Empezamos.

---

## El Hardware y el Pecado Original

Para este proyecto he usado una **Raspberry Pi 4B**. Es hardware suficiente, pero no le sobra nada para lo que vamos a hacer.

* **Sistema Operativo:** Raspbian (Debian Bookworm), instalación limpia.
* **Almacenamiento:** Tarjeta SD (que sufrió lo indecible).
* **Credenciales:** Usuario `pi`, contraseña `pi`.

> **Nota de seguridad:** Sé lo que estáis pensando. "¿Contraseña por defecto en un servidor táctico?". Sí. "Cosa que hay que cambiar", me dije el primer día. No lo he hecho. De momento, vivimos al límite. **No hagáis esto en producción real.**

El tipo de instalación que vamos a realizar es un **Single Server**. Teóricamente aguanta 500 usuarios, pero en una Raspberry Pi, si metemos 500 usuarios concurrentes, la CPU se derretirá. Nuestro objetivo es una escuadra pequeña, funcional y ágil.

---

## FASE 1: La Burocracia y los Cimientos

A diferencia de instalar un servidor web normal (`apt install nginx`), TAK Server es software controlado.

### 1. Conseguir el "Paquete"

Debes ir a [TAK.gov](https://tak.gov/products/tak-server), registrarte y descargar el instalador. Buscamos el archivo `.deb`:
`takserver_x.x_RELEASEXX_all.deb`.

**La importancia de la firma GPG:**
En el mundo de la seguridad, la confianza es nula. Descargué también las firmas. Verificar que el paquete no ha sido alterado no es opcional, es obligatorio.

```bash
gpg --verify takserver_x.x_RELEASEXX_all.deb.sig

```

Si la firma es correcta, procedemos.

### 2. Preparando el terreno (Límites TCP)

TAK Server es una aplicación Java masiva que abre cientos de conexiones (sockets) simultáneas. La configuración por defecto de Linux está pensada para proteger el sistema, no para servir mapas a alta velocidad. Si no cambiamos esto, el servidor colapsará con errores de "Too many open files".

Editamos `/etc/security/limits.conf`:

```bash
sudo nano /etc/security/limits.conf

```

Y añadimos al final:

```text
* hard nofile 32768
* soft nofile 32768
root hard nofile 32768
root soft nofile 32768

```

### 3. La Tiranía de Java

Aquí perdí tiempo la primera vez. TAK Server es extremadamente exigente con la versión de Java. La documentación actual pide **Java 17**. Ni la 8, ni la 11, ni la 21.

Verificamos qué tenemos:

```bash
java -version

```

Si no ves `openjdk version "17..."`, instálalo. Si tienes varias versiones, usa `update-alternatives` para fijar la 17 como predeterminada. Sin esto, el servicio ni siquiera arrancará.

---

## FASE 2: Instalación y la Elección del Servicio

Lanzamos la instalación:

```bash
sudo apt install ./takserver_x.x_RELEASEXX_all.deb

```

El terminal escupirá líneas durante un buen rato instalando dependencias de base de datos (PostgreSQL) y configurando usuarios.

Para evitar dolores de cabeza futuros con archivos de configuración XML (que son la columna vertebral de TAK), instalé herramientas de depuración:

```bash
sudo apt install xmllint libxml2-utils

```

Si alguna vez el servidor no arranca por un error de sintaxis en un XML, `xmllint` te dirá exactamente dónde te falta cerrar una etiqueta.

### El secreto de la Raspberry: `takserver-noplugins`

Aquí está la clave del éxito en hardware limitado. Por defecto, TAK intenta cargar todos los plugins habidos y por haber. En una Raspberry Pi 4, eso se come la RAM.

Revisando mi historial, veréis que tomé la decisión consciente de usar la versión ligera del servicio:

```bash
# Habilitamos el servicio sin plugins
sudo systemctl enable takserver-noplugins

```

Esto mantiene el núcleo táctico funcionando sin la sobrecarga innecesaria.

---

## FASE 3: Criptografía y Certificados (El núcleo del dolor)

TAK opera bajo una filosofía de **Zero Trust**. Todo va cifrado con SSL mutuo.

* El servidor tiene certificado.
* El cliente tiene certificado.
* Ambos deben confiar en una Autoridad de Certificación (CA) común.

Muchos tutoriales te dicen que edites el `CoreConfig.xml` a mano. **Error.** No toques el Core. Usa los scripts proporcionados.

Navegamos a la carpeta de la muerte:

```bash
cd /opt/tak/certs/

```

### La generación

1. **Root CA:** Creamos la autoridad que firmará todo.
`sudo ./makeRootCa.sh --ca-name "MiTakServerCA"`
2. **Server Cert:** Creamos la identidad del servidor.
`sudo ./makeCert.sh server takserver`

Al terminar, el sistema genera archivos `.jks` (Java KeyStore) y `.p12`.

### La Paranoia del Backup Físico

Aquí tuve un momento de lucidez (o miedo). Ya había quemado una tarjeta SD antes con Raspbian. Si la SD muere ahora, pierdo la CA. Si pierdo la CA, todos los móviles conectados dejarán de funcionar y tendré que reconfigurar todo desde cero.

Conecté mi pendrive **EMTEC T250** y ejecuté el salvavidas:

```bash
sudo cp /opt/tak/certs/files/* /media/pi/EMTEC\ T250/certs

```

Ahora, las llaves del reino están en hardware físico, fuera de la Raspberry. Haced copias de seguridad, amigos.

---

## FASE 4: El Primer Arranque y la Configuración Visual

Llegó el momento de la verdad. Arrancamos el servicio ligero:

```bash
sudo systemctl start takserver-noplugins

```

**Paciencia Táctica:**
Java es lento al arrancar en arquitectura ARM. No funciona al instante. Monitoricé los logs para ver cuándo estaba realmente vivo:

```bash
tail -f /opt/tak/logs/takserver-messaging.log

```

Solo cuando el log dejó de escupir inicializaciones y se quedó "a la escucha", supe que podíamos seguir.

### La interfaz `/setup`

Accedemos vía navegador web (desde otro PC en la red) a `https://<IP-DE-LA-PI>:8443/setup`.
Aceptamos la advertencia de seguridad (el certificado es autofirmado, es normal) y seguimos el asistente.

Esta interfaz configura la base de datos PostgreSQL automáticamente y, lo más importante, nos permite crear el usuario **Administrador**.

---

## FASE 5: Fortificando la Posición (UFW)

Un servidor táctico abierto a internet es un blanco. Decidí activar el firewall **UFW** (Uncomplicated Firewall).

Aquí sudé frío. Configurar un firewall por SSH remoto es peligroso: si te equivocas, te bloqueas a ti mismo y pierdes el control de la Raspberry para siempre.

Esta es la secuencia exacta que extraje de mi historial para hacerlo sin morir en el intento:

1. Instalar y verificar estado (estaba inactivo):
```bash
sudo apt install ufw
sudo ufw status

```


2. **La Regla de Oro:** Bloquear todo lo entrante por defecto.
```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing

```


3. **EL SALVAVIDAS (SSH):** Antes de activar nada, permitir el puerto 22.
```bash
sudo ufw allow ssh

```


4. Abrir los puertos de TAK:
```bash
sudo ufw allow 8089  # Puerto de Streaming (donde conectan los móviles)
sudo ufw allow 8443  # Puerto de Administración Web

```


5. Activar los escudos:
```bash
sudo ufw enable

```



Ahora, `sudo ufw status` muestra una fortaleza. Solo entra lo que nosotros queremos.

---

## FASE 6: Verificación de Supervivencia

¿Realmente está escuchando? Usé `ss` y `curl` para interrogar al sistema:

```bash
# Ver qué procesos Java están escuchando y en qué puertos
sudo ss -tulpn | grep java

# Intentar una conexión local a la web de administración
curl -k https://localhost:8443

```

Ver los puertos 8089 y 8443 en la lista de `ss` fue la confirmación de que el servidor estaba operativo a nivel de red.

---

## FASE 7: El Muro del CGNAT y la Magia de Tailscale

Tenía el servidor funcionando en mi WiFi. Pero mi objetivo era usar esto en el campo, con 4G.
Aquí surgió el problema: Mi proveedor de internet usa **CGNAT**. No tengo IP pública real. Abrir puertos en el router es inútil porque comparto IP con medio vecindario.

La solución: **Tailscale**.
Tailscale crea una red Mesh privada basada en WireGuard. Es mágica.

### Nivel Pro: El Subnet Router

No me conformé con instalar Tailscale para acceder a la Raspberry. Quería que la Raspberry actuara como **puerta de enlace** a toda mi red local (impresoras, otros servidores, cámaras) cuando estoy fuera.

1. **Habilitar el reenvío de IP en el Kernel:**
Linux, por seguridad, no pasa paquetes de una interfaz a otra. Hay que obligarlo.
Intenté editarlo al vuelo, pero para que sea persistente hay que tocar `/etc/sysctl.conf`:
```bash
echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

```


2. **Levantar Tailscale anunciando rutas:**
Este comando es la joya de la corona de la instalación:
```bash
sudo tailscale up --advertise-routes=192.168.1.0/24 --accept-routes

```


¿Qué hace esto? Le dice a la red Tailscale: *"Si alguien (mi móvil en 4G) quiere acceder a algo en el rango 192.168.1.X, enviadme el tráfico a mí (la Raspberry), que yo me encargo"*.
3. Verificamos:
```bash
tailscale status

```



Ahora, mi Raspberry no es solo un servidor TAK; es mi router VPN personal de acceso global.

---

## FASE 8: Conectando el Cliente (ATAK-CIV)

Con la infraestructura lista, toca configurar el cliente (Android).

1. Desde la web admin (`puerto 8443`), creamos un usuario (ej. `Tango01`).
2. Descargamos su **Data Package** (zip).
3. Transferimos el zip al móvil.
4. Abrimos **ATAK**.
5. Importamos el **Truststore** (para confiar en el servidor) y el **Certificado de Cliente** (para identificarnos).
> **Dato vital:** La contraseña por defecto de los certificados generados es **`atallack`**. No la olvidéis.



Configuramos la conexión en ATAK apuntando a la **IP de Tailscale** de la Raspberry (`100.x.y.z`) al puerto **8089** (SSL).

Unos segundos de tensión... y el indicador de conexión se pone en **VERDE**.

---

## Resumen de la Batalla (Cheat Sheet)

Para los que queráis los datos técnicos rápidos, aquí está el resumen de la configuración ganadora:

| Componente | Configuración | ¿Por qué? |
| --- | --- | --- |
| **Servicio** | `takserver-noplugins` | La RPi 4 no tiene RAM para los plugins completos. |
| **Java** | OpenJDK 17 | Versión obligatoria. Otras fallan silenciosamente. |
| **Firewall** | UFW (Allow 22, 8089, 8443) | Seguridad básica. SSH siempre primero. |
| **VPN** | Tailscale + Subnet Router | Para saltarse el CGNAT y acceder a la LAN. |
| **Kernel** | `ip_forward=1` | Necesario para que funcione el enrutamiento VPN. |
| **Puertos** | 8089 (Stream), 8443 (Admin) | No confundir con 8446 (WebTAK). |

## Conclusiones Reales

He aprendido que:

1. **La persistencia paga:** Copiar los certificados a un USB físico me salvó de la ansiedad de la corrupción de datos.
2. **Tailscale es brujería:** Convertir una instalación doméstica bloqueada por CGNAT en un nodo accesible globalmente con un solo comando (`advertise-routes`) es impresionante.
3. **No hay que temer a los tochos de texto:** La interfaz web ayuda, pero la verdad siempre está en los logs (`tail -f`).

Ahora tengo un sistema capaz de coordinar equipos, marcar objetivos y seguir rutas en tiempo real, corriendo en una placa del tamaño de una tarjeta de crédito.

¿El siguiente paso? Automatizar la ingesta de rutas y ver si puedo conectar sensores externos. Pero esa... esa es otra historia.

¡Nos vemos en el siguiente log!
