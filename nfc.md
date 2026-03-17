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

  <h2>Datos del hallazgo</h2>
  <form id="lost-found-form" class="lost-found-form">
    <div class="lost-found-form-grid">
      <div class="lost-found-field">
        <label for="found-date">Fecha</label>
        <input id="found-date" name="found-date" type="date" required>
      </div>
      <div class="lost-found-field">
        <label for="found-time">Hora</label>
        <input id="found-time" name="found-time" type="time" required>
      </div>
      <div class="lost-found-field">
        <label for="found-day">Día</label>
        <input id="found-day" name="found-day" type="text" required>
      </div>
    </div>

    <div class="lost-found-field">
      <label for="found-location">Ubicación</label>
      <input id="found-location" name="found-location" type="text" placeholder="Ej: Estación de bus de León" required>
    </div>

    <div class="lost-found-field">
      <label for="found-message">Mensaje adicional (opcional)</label>
      <textarea id="found-message" name="found-message" rows="3" placeholder="Ej: Lo tiene el personal de seguridad"></textarea>
    </div>

    <div class="lost-found-actions">
      {% if site.social.email %}
      <button type="submit" class="lost-found-btn">
        <i class="fas fa-envelope"></i> Enviar datos por email
      </button>
      {% endif %}
      {% if site.social.linkedin %}
      <a class="lost-found-btn lost-found-btn-secondary" href="https://linkedin.com/in/{{ site.social.linkedin }}" target="_blank" rel="noopener noreferrer">
        <i class="fab fa-linkedin"></i> Mensaje por LinkedIn
      </a>
      {% endif %}
    </div>
  </form>

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
    const item = (params.get('item') || '').trim();
    const itemName = item || 'No especificado';

    const itemBox = document.getElementById('lost-item-box');
    const itemNameEl = document.getElementById('lost-item-name');
    if (itemBox && itemNameEl) {
      itemNameEl.textContent = itemName;
      itemBox.hidden = false;
    }

    const form = document.getElementById('lost-found-form');
    const dateInput = document.getElementById('found-date');
    const timeInput = document.getElementById('found-time');
    const dayInput = document.getElementById('found-day');
    const locationInput = document.getElementById('found-location');
    const messageInput = document.getElementById('found-message');

    if (!form || !dateInput || !timeInput || !dayInput || !locationInput || !messageInput) {
      return;
    }

    function pad(number) {
      return String(number).padStart(2, '0');
    }

    function currentDateValue(date) {
      return date.getFullYear() + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate());
    }

    function currentTimeValue(date) {
      return pad(date.getHours()) + ':' + pad(date.getMinutes());
    }

    function dayLabel(dateValue) {
      if (!dateValue) {
        return '';
      }

      const parsedDate = new Date(dateValue + 'T00:00:00');
      if (Number.isNaN(parsedDate.getTime())) {
        return '';
      }

      const dayName = parsedDate.toLocaleDateString('es-ES', { weekday: 'long' });
      return dayName.charAt(0).toUpperCase() + dayName.slice(1);
    }

    const now = new Date();
    dateInput.value = currentDateValue(now);
    timeInput.value = currentTimeValue(now);
    dayInput.value = dayLabel(dateInput.value);

    dateInput.addEventListener('change', function() {
      const calculatedDay = dayLabel(dateInput.value);
      if (calculatedDay) {
        dayInput.value = calculatedDay;
      }
    });

    form.addEventListener('submit', function(event) {
      event.preventDefault();

      const foundDate = dateInput.value.trim();
      const foundTime = timeInput.value.trim();
      const foundDay = dayInput.value.trim();
      const foundLocation = locationInput.value.trim();
      const foundMessage = messageInput.value.trim();

      if (!foundLocation) {
        locationInput.focus();
        return;
      }

      const subject = 'He encontrado tu objeto (' + itemName + ')';
      const lines = [
        'Hola,',
        '',
        'He encontrado un objeto con tu tag NFC.',
        '',
        'Objeto: ' + itemName,
        'Fecha: ' + (foundDate || '-'),
        'Hora: ' + (foundTime || '-'),
        'Día: ' + (foundDay || '-'),
        'Ubicación: ' + foundLocation,
        foundMessage ? 'Mensaje: ' + foundMessage : '',
        '',
        'Te escribo desde la página NFC.'
      ].filter(Boolean);

      window.location.href = 'mailto:{{ site.social.email }}?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(lines.join('\n'));
    });
  })();
</script>