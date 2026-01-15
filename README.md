# 🌐 Mi Sitio Personal

Un sitio web personal moderno con página de inicio estilo Grayscale y blog basado en Jekyll Theme YAT.

## 📁 Estructura del Proyecto

```
├── index.html              # Página principal (Grayscale Theme)
├── juegos.html             # Portal de juegos (acceso oculto)
├── blog/                   # Páginas del blog
│   ├── index.html          # Inicio del blog
│   ├── about.html          # Sobre mí
│   ├── archives.html       # Archivo de posts
│   ├── categories.html     # Categorías
│   └── tags.html           # Etiquetas
├── _posts/                 # Posts del blog (Markdown)
├── games/                  # Juegos militares
├── css/                    # Estilos personalizados
│   └── grayscale.css       # Estilos de la página principal
├── js/                     # JavaScript
│   └── grayscale.js        # Scripts de la página principal
├── img/                    # Imágenes y assets
├── _config.yml             # Configuración de Jekyll
└── Gemfile                 # Dependencias Ruby
```

## ✨ Características

### Página Principal
- ✅ Diseño moderno y elegante estilo Grayscale
- ✅ Navegación con scroll suave
- ✅ Animaciones CSS
- ✅ Totalmente responsive
- ✅ Botón para acceder al blog
- ✅ Enlace discreto a los juegos

### Blog
- ✅ Tema Jekyll YAT con modo nocturno
- ✅ Categorías y etiquetas
- ✅ Archivo de posts
- ✅ Diseño moderno y limpio
- ✅ Soporte para Markdown
- ✅ Resaltado de sintaxis

### Juegos
- ✅ Portal de juegos militares educativos
- ✅ Sistema de puntuación
- ✅ Múltiples juegos disponibles

## 🚀 Desarrollo Local

### Requisitos
- Ruby >= 2.7
- Bundler

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/av4sin/av4sin.github.io.git
cd av4sin.github.io

# Instalar dependencias
bundle install

# Ejecutar servidor local
bundle exec jekyll serve
```

El sitio estará disponible en `http://localhost:4000`

## 📝 Crear un nuevo post

1. Crea un archivo en `_posts/` con el formato: `YYYY-MM-DD-titulo-del-post.md`
2. Añade el front matter:

```yaml
---
layout: post
title: "Título del Post"
date: 2026-01-15 10:00:00 -0500
categories: [Categoría]
tags: [tag1, tag2]
---

Tu contenido aquí...
```

## 🔗 Enlaces

- **Página Principal**: `https://av4sin.github.io`
- **Blog**: `https://av4sin.github.io/blog/`
- **Juegos**: `https://av4sin.github.io/juegos.html` (enlace oculto)

## 🎨 Personalización

### Colores
Edita `css/grayscale.css` para cambiar la paleta de colores:
- Color primario: `#1a1a2e`
- Color secundario: `#16213e`
- Color de acento: `#16a085`

### Configuración del Blog
Edita `_config.yml` para personalizar:
- Título y descripción
- Redes sociales
- Navegación
- Banner

## 📜 Licencia

Este proyecto está bajo la Licencia MIT.

## 🙏 Créditos

- [Grayscale Theme](https://github.com/jeromelachaud/grayscale-theme) - Inspiración para la página principal
- [Jekyll Theme YAT](https://github.com/jeffreytse/jekyll-theme-yat) - Tema del blog
- [Font Awesome](https://fontawesome.com/) - Iconos
- [Bootstrap](https://getbootstrap.com/) - Framework CSS
