---
layout: post
title: "De un reel de Instagram a mi propio código: Creando una pecera ASCII en Java"
date: 2026-02-26
categories: [proyectos, java, desarrollo]
tags: [ascii, pecera, programacion, maven, github, oop]
---

## La inspiración menos pensada

A veces las mejores ideas surgen cuando menos te lo esperas. Hoy estaba en uno de esos momentos de relajación pura, haciendo *scroll* infinito por Instagram, cuando de repente un vídeo me frenó en seco. Alguien había creado un proyecto chulísimo: una pecera animada directamente en la terminal, renderizada completamente en formato ASCII. 

Me quedé embobado viendo cómo los pececitos de texto nadaban de un lado a otro de la pantalla. Me gustó tanto la idea que automáticamente cerré la aplicación (que ya hacía falta) y me puse a buscar información sobre cómo replicarlo o instalarlo en mi equipo.

## La decepción de lo fácil

No tardé mucho en encontrar una aplicación que hacía exactamente eso. Era súper fácil de instalar en Fedora, un par de comandos y listo, ya tenía mi terminal convertida en un acuario. Pero, para ser sincero, la magia duró poco.

Por un lado, estéticamente no me llamaba tanto la atención como la que había visto en Instagram. Le faltaba ese "algo", ese toque especial. Por otro lado, y esto fue lo que más me pesó: **no aprendí absolutamente nada instalándola**. Fue un simple *plug and play* que me dejó con una sensación de vacío. Yo no quería solo *tener* una pecera en la terminal, quería *entender* cómo funcionaba y, sobre todo, quería ser capaz de construirla yo mismo, por algo nos caracterizamos los ingenieros.

## Manos a la obra: Aplicando lo aprendido

Ahí fue cuando se me encendió la bombilla. En la carrera, me paso el día absorbiendo conceptos y rompiéndome la cabeza con prácticas, así que pensé: ¿por qué no usar ese buen conocimiento que estoy adquiriendo y hacerla yo mismo?

Me puse a pensar en la arquitectura del proyecto. Una pecera no es más que un espacio delimitado donde conviven distintas entidades: peces de diferentes tipos, burbujas que suben a la superficie, algas que se mueven con la corriente... Todas estas figuras tienen comportamientos propios pero también interactúan entre ellas y con su entorno. 

La respuesta estaba clara: **Programación Orientada a Objetos**. Y si hablamos de POO y de lo que mejor domino ahora mismo gracias a la carrera, la elección del lenguaje caía por su propio peso. **Java era la mejor opción**.

## El primer commit de muchos

No quise dejar que la motivación se enfriara, así que ya me he puesto manos a la obra. 

Lo primero ha sido preparar el terreno:
- He creado el repositorio (ya lo tenéis disponible en mi perfil de GitHub para los curiosos: [AcuASCII](https://github.com/av4sin/AcuASCII)).
- He inicializado el proyecto utilizando **Maven**, porque a estas alturas de la vida uno ya sabe que gestionar dependencias y compilar a mano es un dolor de cabeza que es mejor evitar para trabajar más cómodo.
- He empezado a diseñar la jerarquía de clases. Ya tengo creadas las clases base desde las cuales heredarán el resto de objetos, como los distintos tipos de peces o la decoración.

Esto es solo el principio. Mi idea es tomarme este proyecto como un pequeño laboratorio personal donde aplicar patrones de diseño, pulir mi manejo de Java y, sobre todo, divertirme viendo cómo un montón de caracteres cobran vida en mi terminal de Fedora.

Según vaya avanzando y añadiendo funcionalidades (o peleándome con los bugs, que seguro que los habrá), iré haciendo *logs* y publicando nuevas entradas por aquí, como ya llevo haciendo un tiempo. 

¡Nos vemos en el próximo log!