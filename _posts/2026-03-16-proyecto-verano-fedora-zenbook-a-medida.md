---
layout: post
title: "Proyecto de verano: hacer que Fedora y mi ZenBook sean uno"
date: 2026-03-16
categories: [tecnico, linux, hardware]
tags: [fedora, zenbook, kde, kernel, optimizacion, ryzen, oled, automatizacion]
---

## De usar Linux… a construir mi propio sistema

Aunque no me guste admitirlo, uno de los grandes “problemas” de Linux es no ser específico de máquina. Pero, en realidad, eso no es algo malo: si le quitáramos esa parte, el mundo actual sería completamente diferente y se reducirían las posibilidades de casi cualquier cosa (fácilmente en un 80%), teniendo en cuenta que en una enorme parte de sistemas del mundo Linux está detrás de todo.

Ahí es donde entra la gracia de este proyecto: adaptarlo a mí. Como quien le pone un colgante al retrovisor de un coche. Es el mismo coche para todos, pero cada uno lo usa y lo personaliza de forma distinta; y eso es de lo más bonito que hay en Linux y en todo lo que es open source.

Hoy me hicieron una propuesta tan ambiciosa como tentadora: dejar de “usar Linux” de forma genérica y empezar a construir una versión de Fedora realmente hecha para mi portátil.

La idea no es instalar cuatro herramientas y ya. La idea es otra:

> convertir mi Fedora en un sistema afinado para mi ASUS ZenBook 15 OLED, como si hardware y software fueran una sola pieza.

Con el equipo que tengo (Ryzen 7, 32 GB de RAM, SSD de 1 TB y Fedora 43 al día), este proyecto no solo es posible: tiene todo el sentido.

## Objetivo real del proyecto

Lo que busco para este verano es muy concreto:

- más autonomía en batería,
- menos temperatura y ruido,
- mejor respuesta del sistema,
- comportamiento totalmente predecible según mi forma de trabajar.

En resumen: pasar de un Linux correcto para todos a un Linux excelente para mi máquina.

## Plan maestro (versión verano 2026)

### 1) Auditoría completa del estado actual

Antes de tocar nada, toca medir:

- consumo en reposo y en carga,
- tiempos de arranque reales,
- servicios que sobran,
- comportamiento térmico y de suspensión.

Sin línea base no hay optimización seria, solo sensaciones.

### 2) Optimización energética y térmica

Primera capa de impacto real en portátil:

- perfilar `power-profiles-daemon`, `tlp` o `auto-cpufreq`,
- ajustar gobernador de CPU y límites de turbo en batería,
- revisar ASPM PCIe y dispositivos que despiertan de más,
- definir políticas diferentes para batería y cargador.

Aquí espero ganar autonomía sin romper el rendimiento cuando lo necesito.

### 3) Kernel y capa de bajo nivel

Aquí empieza la parte más seria:

- probar kernels optimizados (`linux-zen` / alternativas),
- evaluar compilación propia con opciones específicas para Ryzen,
- recortar componentes genéricos que no uso.

Objetivo: menos latencia, más consistencia y una base más ligera.

### 4) KDE Plasma y arranque

La experiencia diaria pasa por KDE, así que esta fase es clave:

- limpiar servicios de sesión innecesarios,
- revisar compositor y equilibrio entre calidad/latencia,
- reducir animaciones superfluas,
- atacar cuellos de botella con `systemd-analyze`.

Si esto sale bien, la sensación final tiene que ser de sistema “instantáneo”.

### 5) Integración hardware–software y automatización

La parte que convierte todo esto en un sistema personal de verdad:

- reglas para batería baja, enchufado y carga pesada,
- automatización de eventos (tapa, teclas especiales, perfiles),
- ajustes específicos para OLED (protección y confort),
- control fino de comportamiento de CPU/ventilación.

Con `systemd`, `udev` y scripts, el portátil debería adaptarse solo a cada contexto.

## ¿Proyecto progresivo o modo hardcore?

La respuesta corta: progresivo, pero con intención hardcore.

Voy a hacerlo por fases, con métricas y sin romper la estabilidad del día a día (ni el sistema, aunque eso lo veo complicado). Pero el objetivo final no cambia: construir una plataforma que se sienta mía de verdad, no una instalación estándar.

Si todo sale como espero, para final de verano tendré algo muy concreto: un Fedora más eficiente que antes, más rápido que el perfil por defecto y perfectamente alineado con cómo uso este ZenBook.

Y ya por último, para dejarlo todo con vista a futuro, crear un instalador con iso para que si algun día me cargo el sistema no tenga que repetir todo desde 0.

Empieza el proyecto. ¡Nos vemos en el próximo log!