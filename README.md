# Mi Sitio Personal

Sitio web personal con página de presentación, blog y juegos educativos militares.

## 🌐 URL

**https://av4sin.github.io**

## 📁 Estructura del Proyecto

```
.
├── assets/                    # Recursos de la página principal
│   ├── css/                   # Estilos
│   │   ├── grayscale.css      # Landing page
│   │   └── blog.css           # Blog
│   ├── js/                    # Scripts
│   │   └── grayscale.js       # Animaciones y efectos
│   └── img/                   # Imágenes
│       └── backgrounds/       # Fondos SVG
│
├── blog/                      # Páginas del blog
│   ├── index.html             # Home del blog
│   ├── archives.html          # Archivo por fecha
│   ├── categories.html        # Por categorías
│   ├── tags.html              # Por etiquetas
│   └── about.html             # Sobre mí
│
├── games/                     # Juegos educativos militares
│   ├── css/                   # Estilos de juegos
│   ├── js/                    # Scripts de juegos
│   ├── img/                   # Imágenes y rangos
│   ├── juegos.html            # Portal principal
│   └── *.html                 # Juegos individuales
│
├── _layouts/                  # Plantillas Jekyll
├── _includes/                 # Componentes reutilizables
├── _posts/                    # Artículos del blog
├── _data/                     # Datos YAML
│
├── index.html                 # Landing page principal
├── 404.html                   # Página de error
├── _config.yml                # Configuración Jekyll
├── Gemfile                    # Dependencias Ruby
└── README.md                  # Este archivo
```

## 🚀 Secciones

### Página Principal (/)
Landing page estilo Grayscale con:
- Header con efecto typing
- Sección "Sobre Mí"
- Proyectos destacados
- Contacto

### Blog (/blog/)
Blog con Jekyll featuring:
- Artículos por categoría y tags
- Sistema de comentarios (Utterances)
- Modo oscuro
- Diseño responsivo

### Juegos (/games/juegos.html)
Portal de juegos educativos sobre rangos militares:
- Trivia militar
- Juego de memoria
- Identificación de rangos
- Simuladores

## 🛠️ Tecnologías

- **Jekyll** - Generador de sitios estáticos
- **Bootstrap 3** - Framework CSS (landing)
- **Font Awesome** - Iconos
- **Highlight.js** - Syntax highlighting
- **Utterances** - Comentarios basados en GitHub Issues

## 📝 Desarrollo Local

```bash
# Instalar dependencias
bundle install

# Ejecutar servidor local
bundle exec jekyll serve

# Acceder en http://localhost:4000
```

## 🚢 Despliegue

Push a la rama main despliega automáticamente en GitHub Pages.

```bash
git add .
git commit -m "Update"
git push
```

---

© 2026 Gonzalo Mondragón Báscones (av4sin)
