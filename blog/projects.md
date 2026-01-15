---
layout: page
title: Proyectos
permalink: /blog/projects.html
---

<div class="projects-page">

## Mis Proyectos

Una colección de proyectos personales, experimentos y contribuciones.

---

### Juegos Militares Educativos

<div class="project-detail">
<span class="project-status status-completed">Completado</span>

Una suite de juegos educativos interactivos para aprender sobre rangos militares, estrategia y más.

**Características:**
- 10+ juegos diferentes
- Sistema de puntuación y rangos
- Interfaz responsive
- PWA (Progressive Web App)

**Tecnologías:** JavaScript, HTML5, CSS3, Service Workers

[Ver Demo]({{ site.baseurl }}/juegos.html) | [Codigo](https://github.com/av4sin/av4sin.github.io)
</div>

---

### Blog Personal

<div class="project-detail">
<span class="project-status status-completed">Completado</span>

Blog técnico con artículos sobre desarrollo, tecnología y aprendizajes.

**Características:**
- Tema oscuro elegante
- Categorías y tags
- Comentarios con Utterances
- Búsqueda de artículos

**Tecnologías:** Jekyll, GitHub Pages, YAML, Markdown

[Ver Blog]({{ site.baseurl }}/blog/) | [Codigo](https://github.com/av4sin/av4sin.github.io)
</div>

---

### Sitio Web Personal

<div class="project-detail">
<span class="project-status status-completed">Completado</span>

Página de inicio personal con diseño moderno estilo Grayscale.

**Características:**
- Diseño responsive
- Animaciones fluidas
- Efecto de typing
- Navegación suave

**Tecnologías:** HTML5, CSS3, JavaScript, Bootstrap

[Ver Sitio]({{ site.baseurl }}/) | [Codigo](https://github.com/av4sin/av4sin.github.io)
</div>

---

### Proximos Proyectos

<div class="project-detail">
<span class="project-status status-progress">En Desarrollo</span>

Algunos proyectos en los que estoy trabajando actualmente:

- **API REST con Node.js** - Backend para gestión de datos
- **App Móvil con React Native** - Aplicación multiplataforma
- **Dashboard Analytics** - Visualización de datos en tiempo real

Tienes alguna idea o propuesta? [Contactame](mailto:{{ site.social.email }})
</div>

---

## Estadisticas

| Métrica | Valor |
|---------|-------|
| Proyectos Completados | 3 |
| En Desarrollo | 3 |
| Líneas de Código | 10,000+ |
| Commits | 100+ |

---

## Contribuciones Open Source

Creo en el poder del codigo abierto. Todos mis proyectos estan disponibles en GitHub.

[Ver mi perfil de GitHub](https://github.com/{{ site.social.github }})

</div>

<style>
.projects-page {
    max-width: 800px;
    margin: 0 auto;
}

.project-detail {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    padding: 25px;
    margin: 20px 0;
    border-left: 4px solid #16a085;
}

.project-status {
    display: inline-block;
    padding: 5px 15px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;
    margin-bottom: 15px;
}

.status-completed {
    background: rgba(22, 160, 133, 0.2);
    color: #16a085;
}

.status-progress {
    background: rgba(241, 196, 15, 0.2);
    color: #f1c40f;
}

.project-detail a {
    color: #16a085;
    margin-right: 15px;
}

.project-detail a:hover {
    color: #1abc9c;
}
</style>
