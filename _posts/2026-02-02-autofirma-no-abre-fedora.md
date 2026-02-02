---
layout: post
title: "AutoFirma no abre en Fedora: La odisea de Java 25 y un portátil rebelde"
date: 2026-02-02
categories: [tecnico, linux, java]
tags: [fedora, autofirma, java, firma-electronica]
---

## El problema que empezó con un clic frustrado

Ahí estaba yo, intentando firmar un documento electrónico con AutoFirma en mi Fedora 43, cuando de repente: nada. El programa se instala sin problemas con `sudo dnf install ./autofirma.rpm`, pero al ejecutarlo desde el menú o terminal, no pasa absolutamente nada. Ni ventana, ni error visible, ni siquiera un pitido de protesta. Solo silencio digital. Como si el software hubiera decidido irse de vacaciones sin avisar.

Primero pensé lo obvio: permisos, SELinux, o algún paquete roto. Probé ejecutar `autofirma` desde terminal y ahí salió el primer indicio: un log que revelaba la verdad oculta.

## El log que lo cambió todo: Java 25 y la GUI muerta

Al lanzar `autofirma` en terminal, apareció esto:

```
feb 02, 2026 6:30:15 P. M. es.gob.afirma.standalone.ProxyUtil setProxySettings
INFORMACIÓN: No se usara proxy para las conexiones HTTP
...
Version de Java: 25.0.2
...
ADVERTENCIA: No se puede crear el entorno grafico. Se tratar la peticion como una llamada por consola
```

¡Bingo! Ahí estaba el culpable: **Java 25.0.2**. AutoFirma 1.8.3, esa herramienta del gobierno español para firma electrónica, no es compatible con Java moderno. A partir de Java 21 (y definitivamente con 25), la interfaz gráfica se niega a abrir y el programa entra en modo consola, mostrando ayuda de comandos en vez de ventanas.

El problema era Java demasiado nuevo y un programa demaiado viejo.

## La búsqueda de la versión mágica: Java 11, 17... ¿cuál funciona?

Sabiendo que Java 25 era el villano, probé instalar Java 11, el recomendado históricamente para AutoFirma:

```bash
sudo dnf install java-11-openjdk
sudo alternatives --config java
```

Pero en Fedora 43, el paquete exacto no estaba disponible. Busqué alternativas: `
``bash
sudo dnf search openjdk | grep 17
``` 
Tampoco dio resultados claros. Bueno directamente ninguno. Al final, recurrí a descargar Java 17 directamente de Oracle (openjdk-17.0.2):

```bash
wget https://download.java.net/java/GA/jdk17.0.2/dfd4a8d0985749f896bed50d7138ee7f/8/GPL/openjdk-17.0.2_linux-x64_bin.tar.gz
sudo mkdir -p /usr/lib/jvm
sudo tar -xvf openjdk-17.0.2_linux-x64_bin.tar.gz -C /usr/lib/jvm
```

Luego, integrarlo en el sistema con alternatives:

```bash
sudo alternatives --install /usr/bin/java java /usr/lib/jvm/jdk-17.0.2/bin/java 1700
sudo alternatives --install /usr/bin/javac javac /usr/lib/jvm/jdk-17.0.2/bin/javac 1700
sudo alternatives --config java
```

Elegí la opción 2 (Java 17). Pero sorpresa: `java -version` daba "permiso denegado". Los permisos del directorio estaban mal. Arreglé con:

```bash
sudo chmod -R a+rX /usr/lib/jvm/jdk-17.0.2
```

Y ahí estaba: Java 17 funcionando. Ahora `autofirma` abría perfectamente con su interfaz gráfica.

## Lecciones aprendidas: Compatibilidad, no asumas

Esta odisea me recordó que en Linux, especialmente con software gubernamental como AutoFirma, la compatibilidad es clave. Java evoluciona rápido, pero nuestras herramientas se quedan atrás.

Si te pasa lo mismo:
- Revisa `java -version` en el log de AutoFirma.
- Instala Java 17 si usas versiones modernas.

¡Nos vemos en el siguiente log!