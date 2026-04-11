---
layout: post
title: "Contra la transparencia del panel en KDE Plasma"
date: 2026-04-11
categories: [tecnico, linux, kde]
tags: [kde, plasma, panel, transparencia, temas, linux]
---

## Historia de una tarde: yo, KDE y una transparencia intransparente

Hoy tocó sesión de trinchera con una pregunta aparentemente simple:

**"¿Cómo cambio el color del panel en KDE Plasma?"**

Lo típico: parece una tontería, abres ajustes, mueves un par de opciones y a correr. Pues no. Acabó siendo una mini expedición por temas, `colors`, `plasmarc`, `metadata.json`, cachés y herencia de assets.

Spoiler: lo que quería realmente no era color. Era **transparencia**.

---

## Primera fase: el camino bonito (que no era mi objetivo)

Lo primero arranqué por el botón gordo oficial:

- Cambiar esquema de colores en `Preferencias del Sistema → Aspecto → Colores`
- Cambiar solo estilo de Plasma en `Aspecto → Estilo de Plasma`
- Tocar color de acento para paneles
- Jugar con opacidad desde el modo edición del panel (`Adaptativo`, `Opaco`, `Translúcido`)

Todo correcto... para quien quiere cambiar estética general sin pelearse mucho. Y aún así, el cambio....no cambiaba que se diga

Pero yo ya me veía en modo cirujano, mirando archivos del sistema, porque sí, linux está claro que no es de botón gordo. Puede quizás que sea eso entre tantas otras cosas lo que lo hace tan bonito.

---

## Segunda fase: meter las manos en ~~la masa~~ los archivos

Primero revisé el contenido de:

```bash
cat /usr/share/plasma/desktoptheme/breeze-dark/colors
```

Y ahí estaba la tentación de simplemente tocar `BackgroundNormal` en `[Colors:Window]`.

Sí, eso cambia color. Pero para transparencia real, **no basta**.

En Plasma el panel no es solo “un color”; también depende de cómo esté dibujado su fondo en los recursos del tema (`widgets/panel-background.svgz` o herencia del tema base).

En resumen: puedes cambiar RGB todo lo que quieras, que si el fondo vectorial va opaco, se verá opaco.

---

## Tercera fase: descubrir la herencia de Breeze Dark

Cuando hice:

```bash
ls /usr/share/plasma/desktoptheme/breeze-dark
```

salió solo esto:

- `colors`
- `metadata.json`
- `plasmarc`

Sin carpeta `widgets`.

Eso explica parte del drama: Breeze Dark hereda elementos gráficos del tema base (`default`/`breeze` según la instalación), así que no siempre estás editando donde crees. Y esa siempre siempre siempre es la fuente de todos los problemas.

---

## Cuarta fase: el clásico “no aparece en el selector”

Monté un tema local* en `~/.local/share/plasma/desktoptheme/...` y no salía en ajustes.

*No cunda el pánico, hacerlo es tan sencillo como ejecutar este comando:

```bash
mkdir -p ~/.local/share/plasma/desktoptheme/mi-tema-personalizado
cp -r /usr/share/plasma/desktoptheme/breeze-dark/* ~/.local/share/plasma/desktoptheme/mi-tema-personalizado/
```
Aquí hubo una lección importante: si `metadata.json` está mal formado o con `Id` conflictivo, Plasma lo ignora en el selector aunque tú jurarías que está “todo bien”.

Comprobación por terminal:

```bash
kpackagetool5 --list --type Plasma/Theme
```

Resultado: aparecía el tema en listado, pero también mensajes de metadata inválida. O sea, detectable a medias.

```bash
❯ kpackagetool5 --list --type Plasma/Theme

kf.package: Invalid metadata for package structure "Plasma/Theme"
Package type "Plasma/Theme" not found
Listando tipos de servicios: Plasma/Theme en /home/av4sin/.local/share/
Ant-Dark
Layan
breeze-transparente 
```

La respuesta del porqué me pasó esto, pues muy sencilla, está justo al principio de esta fase, copiar y pegar directamente todo, y esperar que aparezca por arte de magia. 

---

## Lo que sí me funcionó para avanzar

Crear un tema local con identidad propia. Para ello hice estos pasos con lo que ya tenía

1. Crear un `metadata.json` válido, con `Id` único y `Name` distinto.
```json
{
    "KPackageStructure": "Plasma/Theme",
    "KPlugin": {
        "Id": "mi-tema-personalizado",
        "Name": "Mi tema personalizado",
        "ServiceTypes": [
            "Plasma/Theme"
        ],
        "Version": "1.0"
    },
    "X-Plasma-API": "5.0"
}
```
2. Limpiar caché y reiniciar shell:

```bash
kbuildsycoca5 --noincremental
plasmashell --replace & disown
```

3. En los ajustes, ir a `Aspecto → Estilo de Plasma`, seleccionar "Mi tema personalizado" y aplicar los cambios.

4. En el panel, poner opacidad en `Translúcido` desde modo edición.

Si aún así se ve muy sólido, ahí ya toca pelear con fondo del panel (SVG heredado o tema diseñado para transparencia real).

---

## Conclusión de la batalla

La moraleja de hoy es simple:

- Si quieres **color**, con `colors` vas bien.
- Si quieres **transparencia de verdad**, entras en terreno de tema gráfico + opacidad + contraste + herencia.
- Y si quieres paz mental, probablemente compense usar un tema ya pensado para blur/transparencia o tirar de herramientas como Panel Colorizer, aunque para mi caso no se ajustaba a lo que buscaba.

Me quedo con lo de siempre: en Linux casi todo se puede tocar, pero no siempre en la primera capa que parece lógica.

Hoy no era “cambiar un color”.
Hoy era otra escaramuza con Plasma.

¡Nos vemos en el próximo log!