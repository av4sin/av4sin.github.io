---
layout: post 
title: "Operación TAK: Crónica de cómo monté una red táctica militar en una Raspberry Pi (y sobreviví a los certificados)" 
date: 2026-01-24
categories: [tecnico, redes, raspberrypi, tak, seguridad] 
tags: [takserver, atak, tailscale, ufw, linux, debian, subnet-routing, opsec]
---

## La obsesión del verano: Situational Awareness

Mis planes para este verano eran, sobre el papel, sencillos. Quería aprender. Quería entender cómo funcionan las redes de coordinación, cómo trazar rutas automáticas para llegar a lugares sin intervención humana y, sobre todo, quería dominar el ecosistema **TAK**.

Pero Linux tiene esa manía de convertir un "voy a instalar esto en un rato" en un fin de semana de leer logs y cuestionar tus decisiones vitales.

Antes de mancharnos las manos, entendamos qué estamos construyendo. **ATAK** (Android Team Awareness Kit) y su cerebro, **TAK Server**, no son juguetes. Es software desarrollado originalmente por el laboratorio de investigación de la Fuerza Aérea de EE. UU. Su propósito es el **SA (Situational Awareness)**: saber dónde estás tú, dónde está tu equipo (Blue Force Tracking) y dónde están las amenazas, todo en tiempo real, sobre mapas geoespaciales y con criptografía pesada.

Mi objetivo era ambicioso:

1. Montar un **TAK Server** central en casa.
2. Usar una humilde **Raspberry Pi 4B** que tenía cogiendo polvo.
3. Crear una red privada segura que saltara las restricciones (CGNAT) de mi operador.
4. Entender cada maldito paso, sin scripts mágicos que no sé qué hacen.

Spoiler: He quemado la misma tarjeta SD cinco veces, he peleado con firewalls que me bloquearon el acceso a mi propia habitación y he descubierto que la gestión de certificados SSL manual es el infierno en la tierra.

---

## El Hardware: Un gigante en cuerpo de niño

Para este proyecto he usado una **Raspberry Pi 4B**. Es hardware capaz, pero no nos engañemos: estamos intentando correr una suite de servidor Java empresarial en una placa del tamaño de una tarjeta de crédito.

* **Sistema Operativo:** Raspbian (Debian Bookworm), instalación limpia.
* **Almacenamiento:** Tarjeta SD (víctima de múltiples formateos).
* **Credenciales:** Usuario `pi`, contraseña `pi`.

> **Confesión de seguridad:** Sí, sé lo que pensáis. "¿Contraseña por defecto en un servidor de seguridad táctica?". Es como dejar la llave puesta en la puerta de un búnker. "Lo cambiaré luego", me dije. Spoiler: No lo he hecho. Vivimos al límite, pero vosotros, por favor, cambiadla.

El tipo de instalación es **Single Server**. Aunque la documentación dice que aguanta cientos de usuarios, en una Pi tenemos que ser cirujanos con los recursos. Si activamos todo, la RAM desaparece.

---

## FASE 1: Burocracia y Firmas Digitales

A diferencia de un `apt install apache2`, TAK Server es software controlado. Tienes que ir a [TAK.gov](https://tak.gov/products/tak-server), registrarte y descargar el `.deb` (`takserver_x.x_RELEASEXX_all.deb`).

Pero aquí empieza la primera lección: **La cadena de confianza**.
En el software de defensa (y debería ser así en todo), no instalas nada ciegamente. Me bajé el paquete y su firma GPG.

```bash
gpg --verify takserver_x.x_RELEASEXX_all.deb.sig

```

Si el terminal no te devuelve un `Good signature`, ese archivo no toca mi disco duro. Es la diferencia entre ser un usuario y ser un administrador responsable.

---

## FASE 2: Preparando el Kernel (O por qué Linux es paranoico)

Aquí es donde la mayoría de tutoriales fallan. Te dicen "pon esto en este archivo", pero no te dicen por qué.

El TAK Server es una bestia Java que funciona abriendo cientos, a veces miles, de *sockets* (conexiones) simultáneas. Linux, por defecto, trata a cualquier proceso como un posible programa malicioso que intenta colapsar el sistema abriendo demasiados archivos, así que le pone un límite bajo (normalmente 1024).

Si no levantamos ese límite, cuando conectemos 5 móviles, el servidor empezará a matar conexiones legítimas.

Editamos `/etc/security/limits.conf`:

```bash
sudo nano /etc/security/limits.conf

```

Y le decimos al Kernel que se relaje con nosotros:

```text
* hard nofile 32768
* soft nofile 32768
root hard nofile 32768
root soft nofile 32768

```

Con esto, permitimos hasta 32.768 ficheros abiertos. Ahora el servidor puede respirar.

### La Tiranía de Java

Otro punto de dolor. TAK Server exige **Java 17**. Ni la 11 (demasiado vieja), ni la 21 (demasiado nueva, rompe dependencias).

```bash
java -version

```

Si no ves `openjdk version "17..."`, tienes un problema. Tuve que usar `update-alternatives` para obligar al sistema a ignorar otras versiones instaladas. Sin esto, el servicio intenta arrancar, encuentra una JVM incompatible y muere en silencio sin dejar log.

---

## FASE 3: Instalación y la Dieta de la Pi

Lanzamos la instalación:

```bash
sudo apt install ./takserver_x.x_RELEASEXX_all.deb

```

El terminal escupe líneas sobre PostgreSQL y usuarios `tak`. Todo parece bien. Pero aquí tomé una decisión crítica revisando la documentación técnica.

El servicio por defecto (`takserver`) carga todos los plugins: análisis de vídeo, IA, integración con drones... La Raspberry Pi 4 tiene 4GB de RAM. Si arrancas eso, el sistema entra en *swap* y muere.

La solución está en los scripts de `systemd`:

```bash
# Habilitamos SOLO el núcleo del servidor
sudo systemctl enable takserver-noplugins

```

Al usar `takserver-noplugins`, cargamos solo la mensajería y la base de datos. Perdemos funciones avanzadas que no vamos a usar, pero ganamos un sistema que no se cuelga.

También instalé `xmllint`:

```bash
sudo apt install xmllint libxml2-utils

```

Porque creedme, vais a editar XMLs, y un solo error de sintaxis en el `CoreConfig.xml` hará que el servidor no arranque. `xmllint` es vuestro corrector ortográfico.

---

## FASE 4: Certificados (El descenso a la locura)

TAK opera bajo una filosofía **Zero Trust**. No hay "usuario y contraseña" simples. La autenticación es mutua mediante certificados SSL.

* El servidor debe probar que es él.
* El cliente debe probar que es él.
* Ambos deben confiar en la misma Autoridad (CA).

Si pensabas editar los archivos de configuración a mano, olvídalo. Es como cortar el cesped con un cortauñas. Fui a la carpeta de herramientas:

```bash
cd /opt/tak/certs/

```

### 1. Convertirse en la Autoridad

Creamos nuestra propia CA raíz. A partir de ahora, nosotros somos la ley en esta red.
`sudo ./makeRootCa.sh --ca-name "MiTakServerCA"`

### 2. Identidad del Servidor

Firmamos el certificado para la máquina local.
`sudo ./makeCert.sh server takserver`

### 3. El seguro de vida (Hardware Backup)

Aquí tuve un momento de claridad. He trabajado con Raspberries lo suficiente para saber que las tarjetas SD se corrompen si las miras mal. Si mi SD muere mañana, pierdo la CA. Si pierdo la CA, **tengo que reconfigurar manualmente todos y cada uno de los móviles de la red**, porque sus certificados ya no valdrán.

Conecté un pendrive **EMTEC T250** y ejecuté el comando del miedo:

```bash
sudo cp /opt/tak/certs/files/* /media/pi/EMTEC\ T250/certs

```

Ahora tengo las llaves criptográficas en frío. Si la Pi arde, puedo levantar otra instancia con la misma identidad. Haced backups físicos, es la única forma de dormir tranquilo.

---

## FASE 5: Setup Visual y la Paciencia

Arrancamos:

```bash
sudo systemctl start takserver-noplugins

```

Aquí entra en juego la paciencia. Java en arquitectura ARM tarda en "calentar". No intentéis conectaros al segundo 1. Mirad los logs como si fuera Matrix:

```bash
tail -f /opt/tak/logs/takserver-messaging.log

```

Hasta que no veas que el flujo se calma, no toques nada. Luego, vamos a la web de setup: `https://<IP-DE-LA-PI>:8443/setup`.

Esta interfaz es una bendición. Configura la base de datos PostgreSQL automáticamente y crea el usuario **Administrador**. Sin esto, tendríamos que estar picando sentencias SQL a mano.

---

## FASE 6: UFW (O cómo casi me quedo fuera)

Un servidor militar (o casi) no puede estar desnudo en la red. Necesitamos un muro. Usé **UFW** (Uncomplicated Firewall), pero cuidado: configurar un firewall por SSH es como desactivar una bomba por teléfono. Un error y cortas tu propia conexión.

La secuencia sagrada que usé:

1. **Denegar todo por defecto:** `sudo ufw default deny incoming`. (Paranoia total).
2. **Permitir salida:** `sudo ufw default allow outgoing`.
3. **EL SALVAVIDAS:** `sudo ufw allow ssh`. Si olvidas esto y activas el firewall, has perdido la Raspberry.
4. **Puertos TAK:**
* `8089`: El puerto SSL donde los móviles envían coordenadas.
* `8443`: La administración web.


5. **Activar:** `sudo ufw enable`.

Ahora la Pi es una caja negra que solo habla cuando se le pregunta en el puerto correcto.

---

## FASE 7: Tailscale y el Enrutamiento (Subnet Router)

Todo funcionaba en casa. Pero TAK es para salir fuera. ¿Cómo conecto mi móvil en 4G a la Raspberry de mi salón?
Mi operador usa **CGNAT**. Comparto IP pública con medio barrio. Abrir puertos en el router es inútil.

La solución mágica: **Tailscale**.
Pero no quería una VPN simple. Quería que mi Raspberry fuera un **Router de Subred**.

### El truco del Kernel: `ip_forward`

Por defecto, Linux es egoísta. Si le llega un paquete que no es para él, lo tira. Necesitamos que actúe como un router: "Ah, esto es para la impresora, yo se lo paso".

Intenté hacerlo con `sysctl -w`, pero al reiniciar se perdía. La forma definitiva es editar `/etc/sysctl.conf`:

```bash
echo "net.ipv4.ip_forward=1" | sudo tee -a /etc/sysctl.conf
sudo sysctl -p

```

### Anunciando las rutas

Al levantar Tailscale, usamos este comando clave:

```bash
sudo tailscale up --advertise-routes=192.168.1.0/24 --accept-routes

```

¿Qué hace esto? Le dice a la red Tailscale: *"Oye, si alguien quiere hablar con la red 192.168.1.X (mi casa), enviádmelo a mí"*.
Ahora, desde mi móvil en la montaña, puedo hacer ping a mi PC de sobremesa en casa. Es brujería de redes moderna.

---

## FASE 8: La Conexión Final (ATAK-CIV)

Todo el trabajo duro nos lleva a este momento.

1. En la web Admin (puerto 8443), creo un usuario `Tango-01`.
2. Descargo su **Data Package** (zip).
3. Lo paso al móvil Android y abro **ATAK**.
4. Importo el **Truststore** (para que el móvil confíe en mi CA casera) y el **Certificado de Cliente** (para que el servidor sepa quién soy).

> **Dato Crítico:** Al importar el certificado, te pedirá una contraseña. Por defecto, los scripts de TAK usan **`atakatak`**. Me costó tres intentos fallidos y rebuscar en foros oscuros recordar esto. No es `atallack`, ni `password`. Es `atakatak`.

Configuro la IP del servidor apuntando a la IP de Tailscale (`100.x.x.x`), puerto `8089`.

Pulso conectar.
El indicador pasa de rojo a naranja... y finalmente, **VERDE**.

---

## Resumen de la Batalla

He pasado de tener una Raspberry Pi cogiendo polvo a tener un nodo de coordinación táctica con redundancia de certificados y enrutamiento avanzado VPN.

Aquí el resumen para los valientes:

| Problema | Solución Técnica | Razón |
| --- | --- | --- |
| **Colapso por conexiones** | `limits.conf` (nofile 32768) | Evitar el error "Too many open files". |
| **Consumo RAM excesivo** | `takserver-noplugins` | La RPi 4 no aguanta la suite completa. |
| **Pérdida de datos (CA)** | `cp` a USB Externo | Los certificados son irrecuperables. |
| **CGNAT / Acceso Remoto** | Tailscale + `ip_forward=1` | Saltarse el bloqueo del ISP. |
| **Contraseña Certs** | `atakatak` | El secreto mejor guardado de la instalación. |

### Lo que he aprendido

Que el conflicto suele ser el origen del problema. Ya sea una versión de Java peleando con el instalador, o un firewall peleando con SSH.
He aprendido que **leer los logs dice más verdad que cualquier tutorial**. Y sobre todo, he aprendido que cuando ves ese punto verde en el mapa, indicando que tu sistema está vivo y escuchando, todo el sufrimiento con la terminal vale la pena.

Ahora, si me disculpáis, voy a intentar automatizar rutas. Pero esa es otra historia.

¡Nos vemos en otro log!
