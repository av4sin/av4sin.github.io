---
layout: post
title: "Cómo construí mi sitio web personal desde cero"
date: 2025-01-15 15:00:00 -0500
categories: [Proyectos, Tutorial]
tags: [web, desarrollo, github-pages, jekyll, grayscale, portfolio]
pin: true
---

## La historia detrás de este sitio

Hoy quiero compartir el proceso de creación de este sitio web personal. Desde la idea inicial hasta el resultado final, paso a paso.

## 🎯 Objetivos

Antes de escribir una sola línea de código, definí qué quería lograr:

1. **Página de inicio impactante** - Primera impresión profesional
2. **Blog funcional** - Para compartir conocimiento
3. **Sección de proyectos** - Mostrar mi trabajo
4. **Fácil de mantener** - Sin complicaciones técnicas
5. **Totalmente gratuito** - Sin costos de hosting

## 🛠️ Stack Tecnológico

### Frontend (Página Principal)
- **HTML5** - Estructura semántica
- **CSS3** - Estilos modernos con variables CSS
- **JavaScript** - Interactividad y animaciones
- **Bootstrap 3** - Sistema de grid responsive

### Blog
- **Jekyll** - Generador de sitios estáticos
- **Jekyll Theme YAT** - Tema elegante con modo oscuro
- **Markdown** - Para escribir posts fácilmente
- **Liquid** - Templating engine

### Hosting & Deployment
- **GitHub Pages** - Hosting gratuito
- **GitHub Actions** - CI/CD automático
- **Utterances** - Sistema de comentarios

## 📐 Arquitectura

```
📁 Mi Sitio
├── 🏠 index.html          # Página principal (Grayscale)
├── 📝 blog/               # Páginas del blog
│   ├── index.html         # Lista de posts
│   ├── about.html         # Sobre mí
│   └── projects.html      # Proyectos
├── 📚 _posts/             # Artículos en Markdown
├── 🎨 css/                # Estilos
├── ⚡ js/                  # JavaScript
├── 📊 _data/              # Datos estructurados
└── ⚙️ _config.yml          # Configuración
```

## ✨ Características Destacadas

### 1. Efecto de Typing
El header tiene un efecto de máquina de escribir que cicla entre diferentes roles:

```javascript
const words = [
    "Desarrollador Web",
    "Creador de Contenido",
    "Apasionado por la Tecnología"
];
```

### 2. Animaciones en Scroll
Los elementos aparecen con animaciones suaves usando Intersection Observer:

```javascript
const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
        }
    });
});
```

### 3. Tema Oscuro Nativo
Todo el sitio usa una paleta de colores oscura cuidadosamente seleccionada:

```css
:root {
    --primary-dark: #1a1a2e;
    --secondary-dark: #16213e;
    --accent: #16a085;
}
```

### 4. Comentarios con GitHub
Usando Utterances, los comentarios se almacenan como issues de GitHub - ¡sin base de datos!

## 📈 Métricas de Performance

El sitio está optimizado para velocidad:

| Métrica | Puntuación |
|---------|------------|
| Performance | 95+ |
| Accesibilidad | 90+ |
| Mejores Prácticas | 100 |
| SEO | 100 |

## 🔮 Próximos Pasos

Algunas mejoras que planeo implementar:

- [ ] Búsqueda de posts
- [ ] Newsletter subscription
- [ ] Más proyectos destacados
- [ ] Internacionalización (i18n)

## 💡 Lecciones Aprendidas

1. **Menos es más** - Un diseño limpio siempre gana
2. **Mobile first** - La mayoría de visitas son móviles
3. **Performance importa** - Cada milisegundo cuenta
4. **Documenta todo** - Tu yo del futuro te lo agradecerá

## 🙏 Recursos Utilizados

- [Grayscale Theme](https://github.com/jeromelachaud/grayscale-theme)
- [Jekyll Theme YAT](https://github.com/jeffreytse/jekyll-theme-yat)
- [Font Awesome](https://fontawesome.com/)
- [Google Fonts](https://fonts.google.com/)
- [Utterances](https://utteranc.es/)

---

¿Tienes preguntas sobre cómo implementar algo similar? ¡Déjame un comentario abajo!

**Happy coding! 🚀**
