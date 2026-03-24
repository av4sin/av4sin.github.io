---
layout: post
title: "Los comentarios en el codigo: entre la pereza y la memoria"
date: 2026-03-24
categories: [reflexiones, programacion]
tags: [codigo, comentarios, documentacion, aprendizaje, habitos]
featured: false
pin: false
---

## Escribir para el yo del futuro

Hay una verdad incomoda que todos los que programamos conocemos, aunque no siempre queramos admitirla: **el codigo que hoy entiendo perfectamente, dentro de dos meses me parecera escrito por otra persona**.

Y esa otra persona, muchas veces, soy yo mismo en modo caos, con prisa, sin contexto y preguntandome por que tome cierta decision absurda en una funcion aparentemente inocente.

Por eso los comentarios importan.

---

## El comentario no sustituye al buen codigo

No, comentar no significa justificar nombres malos, funciones gigantes o logica enrevesada.

Primero va el codigo limpio. Primero va la claridad en la estructura, en los nombres, en el flujo.

Pero incluso cuando el codigo esta bien escrito, hay cosas que no se ven solo leyendo instrucciones:

- El **por que** de una decision
- La limitacion externa que obliga a hacerlo asi
- El comportamiento raro de una libreria
- El "esto se hace aqui por compatibilidad" que nadie recordara en tres semanas

Ese contexto, si no se escribe, se pierde.

---

## He pagado el precio de no comentar

Me ha pasado muchas veces: resolver algo dificil, dejarlo funcionando, y seguir adelante.

Semanas despues vuelvo, leo mi propio codigo y no entiendo la mitad de las decisiones. Empiezo a tocar cosas, rompo algo que antes funcionaba, y acabo perdiendo una tarde entera reconstruyendo una idea que ya habia tenido.

No es falta de nivel. Es falta de rastro.

Y un comentario bien puesto, de dos lineas, te puede ahorrar horas.

---

## Mi compromiso para estos meses

A lo largo de estos meses voy a intentar comentar toda la web: no por rellenar, sino por dejar contexto util, porque ha sido un proyecto que he cogido con mucho entusiasmo y no quiero que quede en una infraestructura unicamente funcional sino modular, adaptable, versátil.

Quiero que cada archivo, cada script y cada apaño tenga al menos una explicacion clara cuando haya una decision que no sea obvia.

No voy a comentar lo evidente (o si...). No voy a escribir novelas encima del codigo. Pero si voy a documentar mejor el "por que" de las cosas.

Porque programar no es solo hacer que funcione hoy.
Tambien es hacer que se entienda mañana.

---

## Una pequeña disciplina que cambia mucho

Los comentarios no son glamour. No salen en demos. No impresionan a nadie en un video de 30 segundos.

Pero son una de esas pequenas disciplinas que marcan diferencia con el tiempo:

- Reducen errores al volver a tocar codigo antiguo
- Facilitan compartir proyectos con otros
- Aceleran el mantenimiento
- Evitan repetir investigacion ya hecha

Asi que este post me sirve como recordatorio publico: si en algun momento vuelvo al modo "ya lo documentare luego", aqui queda escrito que no.

Y si me olvido, que esto me lo recuerde.

¡Nos vemos en el siguiente log!