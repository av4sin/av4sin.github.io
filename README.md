# av4sin.github.io

Sitio web personal de Gonzalo Mondragon Bascones (av4sin).

Soluciones, ideas y proyectos de informatica. Un espacio para compartir y dejar huella.

## URL

https://av4sin.github.io

## Estructura

```
.
├── assets/          # CSS, JS, imagenes del sitio
├── blog/            # Paginas del blog (Jekyll)
├── games/           # Juegos educativos (oculto)
├── _layouts/        # Plantillas Jekyll
├── _posts/          # Articulos del blog
├── _data/           # Datos YAML
└── index.html       # Landing page
```

## Secciones

- `/` - Pagina principal
- `/blog/` - Blog con tutoriales y proyectos

## Desarrollo Local

```bash
bundle install
bundle exec jekyll serve
# http://localhost:4000
```

## Publicar en el Blog

### Crear un nuevo articulo

1. Crea un archivo en `_posts/` con el formato:
   ```
   YYYY-MM-DD-titulo-del-articulo.md
   ```
   Ejemplo: `2026-01-15-mi-primer-post.md`

2. Añade el front matter al inicio del archivo:
   ```yaml
   ---
   layout: post
   title: "Titulo del articulo"
   date: 2026-01-15
   categories: [categoria1, categoria2]
   tags: [tag1, tag2, tag3]
   ---
   ```

3. Escribe el contenido en Markdown debajo del front matter.

### Ejemplo completo

```markdown
---
layout: post
title: "Como configurar Raspberry Pi"
date: 2026-01-15
categories: [tutoriales, raspberry-pi]
tags: [linux, raspberry, iot]
---

Introduccion del articulo. Primer parrafo sin titulo.

## Formatos de texto

Texto normal, **negrita**, *cursiva*, ***negrita y cursiva***.

Texto ~~tachado~~ y `codigo en linea`.

> Esto es una cita o blockquote.
> Puede tener varias lineas.

## Listas

Lista sin orden:
- Elemento 1
- Elemento 2
  - Subelemento 2.1
  - Subelemento 2.2
- Elemento 3

Lista ordenada:
1. Primero
2. Segundo
3. Tercero

## Enlaces e imagenes

[Texto del enlace](https://ejemplo.com)

![Texto alternativo](/assets/img/imagen.png)

Imagen con tamaño usando HTML:
<img src="/assets/img/imagen.png" alt="descripcion" width="300">

## Codigo

Codigo en linea: `variable = 42`

Bloque de codigo con sintaxis:

\```python
def saludar(nombre):
    return f"Hola, {nombre}"

print(saludar("mundo"))
\```

\```bash
sudo apt update
sudo apt install python3
\```

\```c
#include <stdio.h>

int main() {
    printf("Hola mundo\n");
    return 0;
}
\```

## Tablas

| Columna 1 | Columna 2 | Columna 3 |
|-----------|-----------|-----------|
| Celda 1   | Celda 2   | Celda 3   |
| Celda 4   | Celda 5   | Celda 6   |

Alineacion:

| Izquierda | Centro | Derecha |
|:----------|:------:|--------:|
| texto     | texto  | texto   |

## HTML incrustado

<div style="background: #1a1a2e; padding: 20px; border-radius: 10px;">
  <p style="color: #16a085;">Esto es HTML dentro del Markdown.</p>
</div>

<details>
<summary>Click para expandir</summary>

Contenido oculto que se muestra al hacer click.

- Punto 1
- Punto 2

</details>

<kbd>Ctrl</kbd> + <kbd>C</kbd> para copiar.

## Separadores

Linea horizontal:

---

## Notas y avisos

> **Nota:** Informacion importante.

> **Aviso:** Ten cuidado con esto.

## Conclusion

Texto final del articulo.
```

### Opciones del front matter

| Campo | Descripcion | Obligatorio |
|-------|-------------|-------------|
| `layout` | Siempre `post` | Si |
| `title` | Titulo del articulo | Si |
| `date` | Fecha (YYYY-MM-DD) | Si |
| `categories` | Lista de categorias | No |
| `tags` | Lista de tags | No |
| `comments` | `true` o `false` (default: true) | No |

### Publicar

```bash
git add _posts/YYYY-MM-DD-titulo.md
git commit -m "Nuevo articulo: titulo"
git push
```

GitHub Pages compilara y publicara automaticamente.

## Licencia

Este proyecto esta bajo la Licencia MIT.

```
MIT License

Copyright (c) 2026 Gonzalo Mondragon Bascones (av4sin)

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

av4sin - Gonzalo Mondragon Bascones - 2026
