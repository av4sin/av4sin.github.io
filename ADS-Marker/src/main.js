import './styles.css';

const csvPaths = {
  members: './members.csv',
  medals: './medals.csv',
  material: './material.csv',
  privileges: './privileges.csv',
};

const roleRules = [
  { minPoints: 0, label: 'Socio' },
  { minPoints: 40, label: 'Socio activo' },
  { minPoints: 90, label: 'Socio referente' },
  { minPoints: 150, label: 'Socio mentor' },
  { minPoints: 240, label: 'Socio coordinador' },
];

const cargoLabels = {
  presidente: 'Presidente',
  vicepresidente: 'Vicepresidente',
  tesorero: 'Tesorero',
  secretario: 'Secretario',
  vocal: 'Vocal',
};

const pointRules = [
  '10 puntos por asistencia verificada a una actividad',
  '20 puntos por completar una practica guiada',
  '30 puntos por ayudar a otra persona o documentar una solucion',
  '50 puntos por liderar una sesion o entregar una mejora util al proyecto',
  'Bonos puntuales por retos con QR, hardware, debugging o seguridad',
];

const levelRows = [
  ['Socio', '0-39 puntos', 'Acceso a retos basicos y perfil publico'],
  ['Socio activo', '40-89 puntos', 'Insignia visible y prioridad en material compartido'],
  ['Socio referente', '90-149 puntos', 'Reservas anticipadas y misiones exclusivas'],
  ['Socio mentor', '150-239 puntos', 'Poder de votar retos y proponer insignias'],
  ['Socio coordinador', '240+ puntos', 'Rol distinguido, carnet digital premium y privilegios comunitarios'],
];

const activityExamples = [
  'Sesion de hardware: se ganan puntos por montar, probar y documentar una configuracion con RPi4, router o switch.',
  'Reto Meshtastic: suben puntos quienes calibran antenas, comparan RSSI/SNR y dejan una guia reproducible.',
  'Laboratorio Flipper: misiones con Flipper Zero, tarjetas de desarrollo y tarjetas Wi-Fi para aprender sin coste economico.',
  'Ayuda entre socios: resolver dudas, revisar codigo o preparar una demo da puntos y desbloquea privilegios.',
];

const csvColumns = {
  members: ['usuario', 'medallas'],
  medals: ['id', 'evento', 'puntos', 'tipo', 'cargo', 'descripcion'],
  material: ['id', 'material', 'estado', 'ubicacion', 'notas'],
  privileges: ['id', 'privilegio', 'condicion', 'detalle'],
};

main().catch((error) => {
  console.error(error);
  document.querySelector('#app').innerHTML = renderError('No se pudo cargar la web. Revisa los CSV o ejecuta de nuevo.');
});

async function main() {
  const [members, medals, material, privileges] = await Promise.all([
    loadCsv(csvPaths.members),
    loadCsv(csvPaths.medals),
    loadCsv(csvPaths.material),
    loadCsv(csvPaths.privileges),
  ]);

  // Crear mapa de medallas para búsqueda rápida
  const medalMap = Object.fromEntries(medals.map((medal) => [medal.id, medal]));

  // Enriquecer miembros con datos de medallas
  const enrichedMembers = members.map((member) => ({
    ...member,
    medalIds: splitMedals(member.medallas),
    medalsData: splitMedals(member.medallas)
      .map((medalId) => medalMap[medalId])
      .filter(Boolean),
  }));

  // Calcular total de puntos (excluyendo ex-cargo)
  const totalPoints = enrichedMembers.reduce((sum, member) => {
    return sum + member.medalsData
      .filter((medal) => medal.tipo !== 'ex-cargo')
      .reduce((memberSum, medal) => memberSum + toNumber(medal.puntos), 0);
  }, 0);

  const totalMedals = enrichedMembers.reduce((sum, member) => sum + member.medalsData.length, 0);

  document.querySelector('#app').innerHTML = renderPage({
    members: enrichedMembers,
    medals,
    material,
    privileges,
    totalPoints,
    totalMedals,
  });
}

async function loadCsv(path) {
  const response = await fetch(path, { cache: 'no-store' });

  if (!response.ok) {
    throw new Error(`No se pudo leer ${path}`);
  }

  return parseCsv(await response.text());
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/).filter(Boolean);

  if (lines.length <= 1) {
    return [];
  }

  const headers = splitCsvRow(lines[0]).map((header) => header.trim());

  return lines.slice(1).map((line) => {
    const values = splitCsvRow(line);
    return headers.reduce((row, header, index) => {
      row[header] = values[index] ?? '';
      return row;
    }, {});
  });
}

function splitCsvRow(row) {
  const cells = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < row.length; index += 1) {
    const character = row[index];

    if (character === '"') {
      const nextCharacter = row[index + 1];

      if (inQuotes && nextCharacter === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }

      continue;
    }

    if (character === ',' && !inQuotes) {
      cells.push(current.trim());
      current = '';
      continue;
    }

    current += character;
  }

  cells.push(current.trim());
  return cells;
}

function renderPage({ members, medals, material, privileges, totalPoints, totalMedals }) {
  return `
    <header class="header">
      <div class="logo-container">
        <svg viewBox="0 0 200 240" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <filter id="shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="4" stdDeviation="8" flood-opacity="0.4" flood-color="#000000"/>
            </filter>
            <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" style="stop-color:#28AA96;stop-opacity:1" />
              <stop offset="100%" style="stop-color:#1E8B7A;stop-opacity:1" />
            </linearGradient>
          </defs>
          <path d="M 50 80 L 30 100 L 50 120" stroke="url(#grad)" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#shadow)"/>
          <line x1="65" y1="60" x2="85" y2="140" stroke="url(#grad)" stroke-width="5" stroke-linecap="round" filter="url(#shadow)"/>
          <text x="100" y="135" font-size="72" font-weight="bold" fill="#FFFFFF" text-anchor="middle" font-family="Arial, sans-serif" filter="url(#shadow)">ADS</text>
          <path d="M 150 80 L 170 100 L 150 120" stroke="url(#grad)" stroke-width="6" fill="none" stroke-linecap="round" stroke-linejoin="round" filter="url(#shadow)"/>
          <text x="100" y="195" font-size="10" fill="#28AA96" text-anchor="middle" font-family="Arial, sans-serif" filter="url(#shadow)">Asociación de Desarrollo</text>
          <text x="100" y="210" font-size="10" fill="#28AA96" text-anchor="middle" font-family="Arial, sans-serif" filter="url(#shadow)">Software</text>
        </svg>
      </div>
      <h1>ADS-Socios</h1>
    </header>

    <div class="page">
      <header class="hero">
        <div class="eyebrow">ADS · Asociacion de Desarrollo de Software</div>
        <h2>Sistema de Gamificación</h2>
        <p class="hero-copy">
          Web de socios hecha con HTML y JS, alimentada por CSV locales para puntos,
          medallas, material y privilegios. El rol se calcula a partir de los puntos o se asigna automáticamente por cargo.
        </p>
        <div class="hero-grid">
          ${statCard('Enfoque', 'HTML + JS')}
          ${statCard('Despliegue', 'GitHub Pages')}
          ${statCard('Socios', String(members.length))}
          ${statCard('Puntos', String(totalPoints))}
        </div>
      </header>

      <main class="content">
        ${panel('Sistema de puntos', `<p>El objetivo es premiar participacion real, ayuda mutua y contribuciones utiles sin depender de presupuesto economico.</p>${list(pointRules)}`)}
        ${panel('Niveles y recompensas', `<p>Los niveles se calculan por puntos y sirven para mostrar progreso de forma clara.</p>${list(levelRows.map(([name, range, reward]) => `${name} (${range}): ${reward}`))}`)}
        ${membersPanel(members, totalMedals)}
        ${catalogPanel('Medallas', medals, csvColumns.medals, 'Cada medalla representa una asistencia a un evento y se guarda como ID en el CSV de socios.')}
        ${catalogPanel('Material', material, csvColumns.material, 'Catalogo de recursos que se puede usar para misiones, prestamos y practicas.')}
        ${catalogPanel('Privilegios', privileges, csvColumns.privileges, 'Privilegios sin coste economico que la app puede mostrar o asignar por rol.')}
        ${panel('Ideas de actividad', list(activityExamples))}
        ${panel('Organizacion del proyecto', list([
          'Fundacion: reglas, niveles, login y primera version del ranking.',
          'Operacion: QR, medallas, carnet digital y panel de administracion.',
          'Escala: Discord, exportaciones, analitica y prestamo de material.',
        ]))}
      </main>
    </div>
  `;
}

function membersPanel(members, totalMedals) {
  const rows = members.length
    ? members.map((member) => {
        // Calcular puntos excluyendo ex-cargo
        const pointsSum = member.medalsData
          .filter((medal) => medal.tipo !== 'ex-cargo')
          .reduce((sum, medal) => sum + toNumber(medal.puntos), 0);

        // Buscar si hay una medalla de cargo (actual)
        const cargoMedal = member.medalsData.find((medal) => medal.tipo === 'cargo');
        const role = cargoMedal ? cargoLabels[cargoMedal.cargo] : roleFromPoints(pointsSum);

        const medalsList = member.medalIds.join(', ');

        return `
          <tr>
            <td>${escapeHtml(member.usuario || '')}</td>
            <td>${pointsSum}</td>
            <td>${escapeHtml(role)}</td>
            <td>${escapeHtml(medalsList)}</td>
          </tr>
        `;
      }).join('')
    : `<tr><td colSpan="4" class="empty-cell">No hay datos en members.csv. Añade filas para ver el panel.</td></tr>`;

  return `
    <section class="panel two-column">
      <div>
        <h2>CSV local de socios</h2>
        <p>La aplicacion lee el CSV sin servicios externos. El rol se calcula a partir de puntos de medallas o por cargo de junta directiva.</p>
        <div class="stats-row">
          <div class="mini-stat"><span>Socios</span><strong>${members.length}</strong></div>
          <div class="mini-stat"><span>Medallas</span><strong>${totalMedals}</strong></div>
          <div class="mini-stat"><span>Estado</span><strong>${members.length ? 'CSV cargado' : 'Sin datos'}</strong></div>
        </div>
        <div class="table-wrap">
          <table class="members-table">
            <thead>
              <tr>
                <th>usuario</th>
                <th>puntos</th>
                <th>rol</th>
                <th>medallas</th>
              </tr>
            </thead>
            <tbody>${rows}</tbody>
          </table>
        </div>
      </div>
      <div>
        <h3>Como se calcula el rol</h3>
        <div class="timeline">
          ${roleRules.map((rule) => `<div class="timeline-item">${rule.minPoints}+ puntos: ${rule.label}</div>`).join('')}
        </div>
        <div class="chips">
          ${['Puntos', 'Medallas', 'Material', 'Privilegios', 'Socios'].map((item) => `<span class="chip">${item}</span>`).join('')}
        </div>
      </div>
    </section>
  `;
}

function catalogPanel(title, rows, columns, intro) {
  const bodyRows = rows.length
    ? rows.map((row) => `<tr>${columns.map((column) => `<td>${escapeHtml(row[column] || '')}</td>`).join('')}</tr>`).join('')
    : `<tr><td colSpan="${columns.length}" class="empty-cell">No hay datos en ${title.toLowerCase()}.</td></tr>`;

  return `
    <section class="panel">
      <h2>${title}</h2>
      <p>${intro}</p>
      <div class="table-wrap">
        <table class="members-table">
          <thead>
            <tr>${columns.map((column) => `<th>${column}</th>`).join('')}</tr>
          </thead>
          <tbody>${bodyRows}</tbody>
        </table>
      </div>
    </section>
  `;
}

function panel(title, innerHtml) {
  return `
    <section class="panel">
      <h2>${title}</h2>
      ${innerHtml}
    </section>
  `;
}

function statCard(label, value) {
  return `
    <article class="stat-card">
      <span>${label}</span>
      <strong>${value}</strong>
    </article>
  `;
}

function list(items) {
  return `<ul class="list">${items.map((item) => `<li>${item}</li>`).join('')}</ul>`;
}

function splitMedals(value) {
  return String(value || '')
    .split(';')
    .map((item) => item.trim())
    .filter(Boolean);
}

function roleFromPoints(points) {
  return [...roleRules]
    .sort((left, right) => right.minPoints - left.minPoints)
    .find((rule) => points >= rule.minPoints)?.label ?? 'Socio';
}

function toNumber(value) {
  return Number(String(value).replace(',', '.')) || 0;
}

function escapeHtml(value) {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function renderError(message) {
  return `
    <div class="page">
      <section class="panel">
        <h1>ADS-Socios</h1>
        <p>${message}</p>
      </section>
    </div>
  `;
}