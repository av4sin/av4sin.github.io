---
layout: post
title: "El día que la lié con la antena (y por fin entendí el coaxial)"
date: 2026-04-18
categories: [tecnico, hardware, meshtastic]
tags: [meshtastic, heltec, lora, antena, coaxial, atak, comunidad]
---

## Hoy tocó taller, no teoría

Si ayer estaba contento afinando antenas y cálculos, hoy me tocó la parte que nadie sube a Instagram: **romper algo por cabezón**.

La he liado con la antena.

De darle vueltas al conjunto, terminé forzando el latiguillo y partí justo la conexión. Resultado: soldador en mano, estaño y a rehacer la soldadura desde cero.

No fue bonito, pero fue útil.

---

## El momento en el que por fin lo entendí

Hoy fue cuando de verdad me hizo click cómo funciona una antena por dentro, sobre todo cuando hay cable coaxial de por medio.

En un coaxial hay dos partes que importan:

- En el **centro** va la señal.
- En el **exterior** va tierra (malla/blindaje).

Hasta que no te toca repararlo, esto suena a teoría. Cuando te toca abrir, pelar, preparar y soldar, deja de ser teoría y pasa a ser supervivencia.

Y aquí vino el detalle que me aclaró todo:

El conector tiene un **pequeño cilindro** por la parte donde se suelda. Ese punto es para la parte central del coaxial (la señal). El recubrimiento exterior, la malla/tierra, debe ir soldado al resto del conector (cuerpo/masa).

Si mezclas eso, o haces un falso contacto, no hay magia de firmware que lo arregle.

---

## Estrenando el nodo en ATAK

También hoy empecé a probar el nodo con ATAK y, la verdad, bastante contento.

El proceso fue sorprendentemente sencillo:

1. Descargar el módulo desde GitHub: [https://github.com/meshtastic/ATAK-Plugin](https://github.com/meshtastic/ATAK-Plugin/releases)
2. Instalarlo.
3. Habilitarlo en la app como cualquier otro módulo.

Y ya.

No he tocado muchas más configuraciones por ahora, porque he encontrado unos compañeros en la ciudad donde estoy que me están echando una mano muy buena para aprender todo lo nuevo.

Cuando tienes gente que ya pasó por donde estás pasando tú, avanzas el doble y te frustras la mitad.

---

## Comunidad, cobertura y primeras sorpresas

También descubrí que hay un canal de Telegram de la comunidad de Meshtastic en España, cosa que me parece oro puro para no ir solo.

Y aquí vino otra alegría grande:

Como mi nodo se conecta con los de estos compañeros, he llegado a ver nodos de otras ciudades e incluso de montañas del centro de la península.

Así que, de momento, muy contento con el desempeño.

Ahora mismo sigo haciendo pruebas de día y lo tengo subido al tejado, para ver qué tal se comporta en condiciones reales.

---

## Enlaces que descubrí hoy

Además de las pruebas en campo, hoy también me encontré con varios enlaces de la comunidad que me están viniendo de lujo para ubicar nodos y entender mejor cómo se está moviendo la malla:

- [https://mapa.meshtastic.es/](https://mapa.meshtastic.es/): es un mapa comunitario para visualizar nodos y actividad de la red de forma rápida. Va genial para hacerte una idea de qué zonas tienen más movimiento y dónde puede haber cobertura.
- [https://meshview.meshtastic.es/map](https://meshview.meshtastic.es/map): es una vista de mapa más orientada a inspeccionar detalles de los nodos que van apareciendo, cómo se enlazan y qué se está viendo en tiempo real.
- [https://malla.meshtastic.es/](https://malla.meshtastic.es/): es un portal de la comunidad en España con recursos y contexto sobre la red, muy útil para no ir a ciegas cuando estás empezando y quieres entender cómo está organizada la malla.
- [https://malla.meshtastic.es/traceroute-graph](https://malla.meshtastic.es/traceroute-graph): esta vista me ha gustado especialmente porque muestra muy bien la disposición y cómo se van conectando entre sí los nodos, es decir, que tan lejos puedes llegar conectandote a ciertos nodos.

Los he dejado aquí porque me parecen de esos recursos que te ahorran mucho tiempo cuando estás empezando y quieres ver contexto real, no solo teoría.

Esto acaba de empezar, pero hoy ya no fue solo cacharrear.

Hoy fue aprender tocando.

¡Nos vemos en el próximo log!