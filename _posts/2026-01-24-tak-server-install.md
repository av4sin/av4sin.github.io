---
layout: post
title: "Operación TAK: Montando un servidor táctico en Raspberry Pi (Guía de Supervivencia)"
date: 2026-01-24
categories: [tecnico, redes, raspberrypi, tak]
tags: [takserver, atak, tailscale, linux, debian, seguridad, certificados]
---

## El verano de la obsesión táctica

Mis planes para este verano eran, sobre el papel, sencillos. Quería aprender. Quería entender cómo funcionan las redes tácticas, cómo trazar rutas automáticas y, sobre todo, quería dominar el ecosistema **TAK** (Tactical Awareness Kit).

Mi objetivo final: un rastreador casero compatible con TAK, todo controlado desde Linux, y una red privada para coordinarlo todo.

Si no sabes qué es TAK, imagina Google Maps, pero con esteroides, diseñado originalmente para militares, y ahora disponible para civiles que nos gusta complicarnos la vida. Permite ver la posición de tu equipo en tiempo real, chat, compartir archivos y marcar objetivos.

Hoy os voy a contar la primera parte de esta odisea: **La instalación del TAK Server**.

Spoiler: He quemado una tarjeta SD, he peleado con Java y he descubierto que mi router es mi peor enemigo.

---

## El Hardware: La vieja confiable (y un pecado de seguridad)

Para este proyecto he desempolvado mi **Raspberry Pi 4B**.

* **SO:** Raspbian (Debian Bullseye/Bookworm).
* **Instalación:** "A lo bruto". Quemé la imagen oficial en la SD y a correr.
* **Credenciales:** Usuario `pi`, contraseña `pi`.

> **Nota de seguridad:** Sí, sé que dejar el usuario por defecto es invitar a que me hackeen. "Cosa que hay que cambiar", me dije. No lo he hecho. Si mi servidor cae mañana, ya sabéis por qué. De momento, vivimos al límite.

El objetivo de la instalación es un **Single Server** capaz de manejar, teóricamente, hasta 500 usuarios (aunque la Pi sudará tinta si llegamos a eso).

---

## FASE 1: La Burocracia (Conseguir el Software)

A diferencia de `apt install nginx`, el TAK Server no está en los repositorios públicos. Tienes que ir a la fuente oficial.

1.  Registrarse en [TAK.gov](https://tak.gov/products/tak-server).
2.  Navegar a la sección de descargas.
3.  Descargar el instalador `.deb`. El archivo se verá algo así: `takserver_x.x_RELEASEXX_all.deb`.

### La importancia de la firma GPG
En este mundillo, la paranoia es una virtud. Antes de instalar nada, hay que verificar que lo que hemos bajado no ha sido manipulado.

Descarga también el archivo de firma y la clave pública. Luego, en la terminal:

```bash
# Importar la clave pública de TAK
gpg --import TAK-Product-Signing-Key.asc

# Verificar el paquete
gpg --verify takserver_x.x_RELEASEXX_all.deb.sig takserver_x.x_RELEASEXX_all.deb

```

Si la respuesta es `Good signature`, podemos respirar tranquilos. Si dice `BAD signature`, borra el archivo y corre.

---

## FASE 2: Preparando el terreno (Prerrequisitos)

Aquí es donde Linux empieza a ponerse exigente. El TAK Server es una bestia escrita en Java que abre muchas conexiones simultáneas. La configuración por defecto de Linux le parece "insultantemente baja".

### 1. Ajustando los límites de TCP

Tenemos que editar los límites del sistema. Si no hacemos esto, el servidor colapsará bajo carga.

```bash
sudo nano /etc/security/limits.conf

```

Añadimos estas líneas al final del archivo. No preguntes, solo hazlo:

```text
* hard nofile 32768
* soft nofile 32768
root hard nofile 32768
root soft nofile 32768

```

Guardamos (`Ctrl+O`) y salimos (`Ctrl+X`).

### 2. La pesadilla de Java

TAK Server es muy "especialito" con Java. Necesita una versión específica. La documentación actual pide **Java 17**. Ni la 11, ni la 21. La 17.

Instalamos la versión correcta:

```bash
sudo apt update
sudo apt install openjdk-17-jdk

```

Y ahora, el paso crucial. Verificar qué versión está usando el sistema por defecto:

```bash
java -version

```

Debería salir algo como:

```text
openjdk version "17.0.x" ...
OpenJDK Runtime Environment ...

```

Si te sale otra versión, tienes que cambiarla manualmente con `update-alternatives`:

```bash
sudo update-alternatives --config java

```

*(Selecciona el número que corresponda a java-17).*

### 3. La base de datos

TAK Server necesita PostgreSQL. Asegúrate de instalarlo y habilitarlo. El instalador del `.deb` suele encargarse de las dependencias, pero nunca está de más asegurarse:

```bash
sudo apt install postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql

```

---

## FASE 3: La Instalación (El momento de la verdad)

Con el terreno preparado, lanzamos el instalador.

```bash
sudo apt install ./takserver_x.x_RELEASEXX_all.deb

```

La terminal escupirá cientos de líneas. Verás scripts de post-instalación, creación de usuarios `tak`, y configuraciones de base de datos.

Si todo acaba sin errores rojos... **felicidades, tienes un servidor instalado, pero completamente inútil.**

Ahora empieza lo difícil: **Los Certificados**.

---

## FASE 4: El laberinto de los Certificados (Donde lloran los valientes)

TAK se basa en una arquitectura de confianza cero. Todo va cifrado. El servidor necesita un certificado, y cada cliente (tu móvil) necesita otro firmado por el servidor.

Mi mayor punto de conflicto fue entender esto: **No toques el core**. No edites los archivos XML de configuración a mano si no quieres sufrir.

Vamos a la carpeta de herramientas de certificados:

```bash
cd /opt/tak/certs/

```

### 1. Crear la Autoridad de Certificación (Root CA)

Primero, nos convertimos en la autoridad.

```bash
sudo ./makeRootCa.sh --ca-name "MiTakServerCA"

```

*(Te pedirá datos como país, estado, organización... rellénalo con calma).*

### 2. Crear el certificado del Servidor

Ahora firmamos el certificado para el propio servidor (localhost).

```bash
sudo ./makeCert.sh server takserver

```

Una vez hecho esto, el script te dirá que ha generado los archivos `takserver.jks` (Java KeyStore) y `truststore.jks`.

### 3. El reinicio de fe

Ahora que los certificados base están creados, reiniciamos el servicio para que Java los cargue.

```bash
sudo systemctl restart takserver

```

**Aquí viene un consejo de oro:** Espera.
Java es lento. La Raspberry Pi no es un superordenador. Dale 2 o 3 minutos antes de intentar conectarte. Mira los logs para asegurarte de que no está ardiendo:

```bash
tail -f /opt/tak/logs/takserver-core.log

```

Si ves mensajes de `INFO` fluyendo y no ves `STACK TRACE` gigantescos, vas bien.

---

## FASE 5: La configuración visual (`/setup`)

Aquí es donde la documentación antigua te dice que edites XMLs infernales. La documentación moderna (y mi experiencia) dice: usa la web.

Abre tu navegador (en tu PC conectado a la misma red) y ve a:

`https://<IP-DE-TU-RASPBERRY>:8443/setup`

**Ojo:** Tu navegador te gritará. *"Sitio no seguro"*. Es normal. Estás usando certificados autofirmados que acabamos de crear. Acepta el riesgo y continúa.

Esta interfaz web es una bendición. Te permite:

1. Configurar la base de datos automáticamente.
2. Establecer el puerto de conexión.
3. Crear el usuario **Administrador**.

Sigue los pasos. Es "Siguiente, Siguiente, Aceptar". Cuando termine, el servidor estará realmente desplegado.

---

## FASE 6: Creando usuarios y entendiendo los puertos

Ahora accedemos al panel de administración real:

`https://<IP-DE-TU-RASPBERRY>:8443`

Entras con el usuario administrador que acabas de crear. Aquí es donde gestionamos la "misión".

### El caos de los puertos

Es vital entender qué hace cada puerto para no volverse loco:

| Puerto | Protocolo | Descripción |
| --- | --- | --- |
| **8443** | TCP (HTTPS) | **Panel de Administración**. Solo para configurar y crear usuarios. |
| **8446** | TCP (HTTPS) | **WebTAK**. Interfaz táctica ligera para ver el mapa desde el navegador. |
| **8089** | TCP (SSL) | **Streaming**. Aquí es donde se conectan los móviles (ATAK) para enviar datos. |

### Creando los usuarios de campo

En el menú de "User Management" o "Mandar Tarea", creamos las cuentas. Ejemplo: `Usuario1`.

Al crear un usuario, el servidor genera un paquete de certificados para él. Esto es lo que necesitamos para el móvil.

Descarga el **Data Package** o el archivo `.zip` del usuario. Dentro encontrarás:

* `Usuario1.p12` (Certificado de identidad).
* `truststore-root.p12` (Para confiar en el servidor).

> **Dato:** La contraseña por defecto de estos certificados suele ser **`atallack`**. Grábatelo a fuego.

---

## FASE 7: Conectando el móvil (ATAK-CIV)

1. Instala **ATAK-CIV** desde la Play Store o F-Droid.
2. Pásate los archivos `.p12` al móvil (por USB, Drive, etc).
3. En ATAK: Ajustes -> Cuentas y Servidores -> Añadir Servidor.
4. IP: La IP de tu Raspberry.
5. Puerto: **8089**.
6. Activa "Use Authentication".
7. Carga el **Truststore** y el **Client Certificate**.
8. Contraseña: `atallack`.

Si todo va bien, el indicador del servidor en ATAK se pondrá en **VERDE**.

---

## FASE 8: El muro del CGNAT y la salvación llamada Tailscale

Todo funcionaba de maravilla en mi red WiFi. Pero claro, la idea es usar esto en el campo, con 4G.

Intenté abrir los puertos en mi router (8089, 8443).
**Resultado:** Fracaso absoluto.
Mi compañía usa **CGNAT** (Carrier Grade NAT). Básicamente, no tengo una IP pública real. Comparto IP con medio vecindario. Abrir puertos es imposible.

### La solución: Tailscale

Descubrí **Tailscale** y fue como ver la luz.

Es una VPN "Mesh" basada en WireGuard. No necesitas abrir puertos. Crea una red virtual donde tus dispositivos se ven como si estuvieran en la misma LAN, estén donde estén.

**Paso 1: Instalar en la Raspberry**

```bash
curl -fsSL [https://tailscale.com/install.sh](https://tailscale.com/install.sh) | sh
sudo tailscale up

```

Te dará una URL. Entra, loguéate con Google/Microsoft y listo. Tu Pi ahora tiene una IP del tipo `100.x.y.z`.

**Paso 2: Instalar en el móvil**
Bajas la app de Tailscale, te logueas con la misma cuenta y activas el interruptor.

**Paso 3: Reconfigurar ATAK**
En el móvil, cambias la IP del servidor en ATAK por la **IP de Tailscale** de la Raspberry (`100.x.y.z`).

Mágicamente, funciona. Desde 4G, desde el WiFi del vecino, desde la Antártida. Sin abrir ni un solo puerto en el router.

---

## FASE FINAL: Persistencia

No queremos tener que arrancar servicios a mano cada vez que se vaya la luz.

```bash
# Habilitar TAK Server al inicio
sudo systemctl enable takserver

# Tailscale ya se habilita solo por defecto, pero por si acaso:
sudo systemctl enable tailscaled

```

---

## Resumen técnico real de la instalación

Para los que venís buscando el dato rápido, esto es lo que ha quedado montado:

| Componente | Configuración | Notas Críticas |
| --- | --- | --- |
| **Dispositivo** | RPi 4B 4GB | Usuario `pi` (No me juzguéis) |
| **Java** | OpenJDK 17 | **No usar v11 ni v8**. Verificar con `java -version`. |
| **Setup Inicial** | `/setup` vía Web | Puerto 8443. Ahorra editar XMLs. |
| **Certificados** | Scripts en `/opt/tak/certs` | Contraseña por defecto: `atallack`. |
| **Acceso Remoto** | Tailscale | Salta CGNAT y Firewalls. IP rango `100.x`. |
| **Puerto Cliente** | 8089 (SSL) | Donde apunta la app ATAK. |

## Lo que realmente aprendí

* **Java es el jefe:** El 90% de los errores de instalación son por tener la versión incorrecta de Java o no definir el `JAVA_HOME`.
* **No toques el Core:** Los archivos de configuración de TAK son frágiles. Usa los scripts y la web de setup siempre que puedas.
* **Tailscale es brujería:** En el buen sentido. Ha convertido una configuración de red imposible en algo trivial.
* **Paciencia con el Boot:** Un servidor Java en una Raspberry Pi tarda en arrancar. Si no conecta al segundo 1, espera al segundo 60.

Ahora tengo un servidor táctico funcional, accesible desde cualquier lugar del mundo. El siguiente paso será configurar la automatización de rutas, pero esa... esa es otra historia.

¡Nos vemos en el siguiente log!
