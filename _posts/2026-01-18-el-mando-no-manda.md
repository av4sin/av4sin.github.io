---
layout: post
title: "Construyendo un mando imposible: SuperTuxKart, joysticks y el límite del DigiSpark"
date: 2026-01-18
categories: [tecnico, hardware, linux]
tags: [fedora, arduino, digispark, joystick, supertuxkart, proyectos]
---

## El descubrimiento inesperado

Tras instalar Fedora en el portátil y dejarlo fino —tapa controlada, botones domesticados y KDE obediente— me dio por explorar un poco más allá de la terminal y las apps comunes que uso.

Y ahí apareció **SuperTuxKart**.

No podia creer lo bien que estaba hecho: fluido, divertido, competitivo y sorprendentemente adictivo. Bastaron dos carreras para que surgiera la idea peligrosa:

> *“¿Y si me hago mi propio mando?”*

No uno comprado. Uno **hecho con cables, placas y sufrimiento**.

---

## La idea: un joystick USB casero

El planteamiento parecía sencillo:

- Usar una **placa DigiSpark ATtiny85**
- Conectarle un **joystick analógico**
- Emular un **dispositivo HID USB**
- Usarlo directamente en Linux como mando para SuperTuxKart

Pequeño, barato, sin drivers y con USB nativo. Sobre el papel, perfecto.

Y al principio… funcionó.

---

## El primer problema: solo adelante o atrás

El joystick típico tiene dos ejes:

- **Eje X** → izquierda / derecha  
- **Eje Y** → adelante / atrás  

La teoría decía que podía leer ambos.

La realidad fue otra.

Solo conseguí leer **un eje correctamente**.

El resultado era tan absurdo como frustrante:

- Si asignaba el eje Y → podía **acelerar y frenar**
- Si asignaba el eje X → podía **girar**

Pero nunca ambas cosas a la vez.

Así que el mando funcionaba así:

- Aceleras → no giras  
- Giras → no aceleras  

Conducir en SuperTuxKart se convirtió en una experiencia existencial.

---

## La solución brillante (que tampoco funcionó)

Después de pelear con lecturas analógicas, rangos y limitaciones del ATtiny85, surgió una idea:

> *“Pues pongo dos joysticks.”*

- Uno solo para acelerar/frenar  
- Otro solo para girar  

Problema inmediato:  
el **DigiSpark no tiene pines suficientes**.

Entre:

- USB
- Alimentación
- Pines analógicos reales (que en realidad no lo son tanto)

La placa se quedaba corta muy rápido.

---

## El Frankenstein: Arduino + DigiSpark

Y entonces llegué a la fase peligrosa del proyecto:

> *“¿Y si uso un Arduino de intermediario?”*

La arquitectura mental era algo así: Joysticks → Arduino → Serial → DigiSpark → USB → PC


El Arduino leería tranquilamente los joysticks  
y el DigiSpark solo se encargaría de fingir ser un mando USB.

En mi cabeza era brillante.

En la práctica:

- Problemas de sincronización por serie  
- Latencia  
- Datos corruptos  
- El DigiSpark perdiendo paquetes  
- El juego leyendo valores erráticos  

A veces giraba solo.  
A veces aceleraba sin tocar nada.  
A veces no hacía absolutamente nada.

El mando había adquirido **vida propia**.

---

## El momento de aceptar la derrota

Después de horas de pruebas, cables cambiados, sketches reescritos y demasiados reinicios, quedó claro:

- El DigiSpark es increíble… **para lo que es**
- Pero no para manejar múltiples ejes analógicos en tiempo real
- Ni para actuar como puente fiable entre dispositivos

El proyecto no estaba mal planteado.

Simplemente había chocado contra los límites físicos del hardware.

---

## Conclusión: también se aprende cuando no funciona

El mando nunca llegó a ser usable en carrera real.

Pero el proyecto dejó varias lecciones claras:

- No todo lo pequeño sirve para todo  
- El USB HID parece fácil… hasta que no lo es  
- A veces un Arduino Pro Micro habría evitado todo el sufrimiento  
- Y sobre todo: **fallar también es avanzar**

SuperTuxKart sigue instalado.  
El joystick está guardado en un cajón.  
Y el DigiSpark me mira desde la mesa como diciendo:

> *“No era mi guerra, jefe.”*

Pero quién sabe.

Quizá este proyecto no murió.

Solo está… **suspendido en RAM**.

¡Nos vemos en el próximo log!
