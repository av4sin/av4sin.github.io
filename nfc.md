---
layout: page
title: Objeto encontrado
description: Página de contacto rápido para recuperar un objeto perdido
permalink: /nfc/
---

<div class="lost-found-card">
  <p class="lost-found-lead"><i class="fas fa-hand-holding-heart"></i> Gracias por escanear este tag NFC.</p>
  <p>Este objeto tiene dueño. Si lo has encontrado, te agradecería mucho que me avises para recuperarlo.</p>

  <div class="lost-found-item" id="lost-item-box" hidden>
    <strong>Objeto:</strong> <span id="lost-item-name"></span>
  </div>

  <h2>Contacto rápido</h2>
  <div class="lost-found-actions">
    {% if site.social.email %}
    <a class="lost-found-btn" href="mailto:{{ site.social.email }}?subject=He%20encontrado%20tu%20objeto&body=Hola%2C%20he%20encontrado%20tu%20objeto.%20Te%20escribo%20desde%20la%20p%C3%A1gina%20NFC.">
      <i class="fas fa-envelope"></i> Escribir por email
    </a>
    {% endif %}
    {% if site.social.linkedin %}
    <a class="lost-found-btn lost-found-btn-secondary" href="https://linkedin.com/in/{{ site.social.linkedin }}" target="_blank" rel="noopener noreferrer">
      <i class="fab fa-linkedin"></i> Mensaje por LinkedIn
    </a>
    {% endif %}
  </div>

  <ul class="lost-found-steps">
    <li>Indícame dónde lo encontraste.</li>
    <li>Si puedes, envía una foto para identificarlo.</li>
    <li>Acordamos un punto de entrega seguro.</li>
  </ul>

  <p class="lost-found-note">Gracias por la ayuda 🙌</p>
</div>

<script>
  (function() {
    const params = new URLSearchParams(window.location.search);
    const item = params.get('item');
    if (!item) return;

    const itemName = item.trim();
    if (!itemName) return;

    const itemBox = document.getElementById('lost-item-box');
    const itemNameEl = document.getElementById('lost-item-name');
    itemNameEl.textContent = itemName;
    itemBox.hidden = false;
  })();
</script>