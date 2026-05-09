const csvPaths = {
  members: ['./members.csv', '/members.csv'],
  medals: ['./medals.csv', '/medals.csv'],
  material: ['./material.csv', '/material.csv'],
  privileges: ['./privileges.csv', '/privileges.csv'],
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
  socio: 'Socio',
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

const appState = {
  selectedMemberId: null,
  selectedMedalId: null,
};

const pageKey = getPageKey();

let appData = null;
let appRoot = null;

main().catch((error) => {
  console.error(error);
  ensureAppRoot().innerHTML = renderError('No se pudo cargar la web. Revisa los CSV o ejecuta de nuevo.');
});

async function main() {
  if (pageKey === 'home') {
    renderApp();
    return;
  }

  const tasks = [];

  if (pageKey === 'socios') {
    tasks.push(loadCsv(csvPaths.members), loadCsv(csvPaths.medals));
  } else if (pageKey === 'medallas') {
    tasks.push(loadCsv(csvPaths.medals));
  } else if (pageKey === 'material') {
    tasks.push(loadCsv(csvPaths.material));
  } else if (pageKey === 'privilegios') {
    tasks.push(loadCsv(csvPaths.privileges));
  }

  const loaded = await Promise.all(tasks);
  let members = [];
  let medals = [];
  let material = [];
  let privileges = [];

  if (pageKey === 'socios') {
    [members, medals] = loaded;
  } else if (pageKey === 'medallas') {
    [medals] = loaded;
  } else if (pageKey === 'material') {
    [material] = loaded;
  } else if (pageKey === 'privilegios') {
    [privileges] = loaded;
  }

  if (pageKey === 'medallas') {
    appData = { medals };
    renderApp();
    return;
  }

  if (pageKey === 'material') {
    appData = { material };
    renderApp();
    return;
  }

  if (pageKey === 'privilegios') {
    appData = { privileges };
    renderApp();
    return;
  }

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

  const decoratedMembers = enrichedMembers.map((member) => {
    const points = member.medalsData
      .filter((medal) => medal.tipo !== 'ex-cargo')
      .reduce((memberSum, medal) => memberSum + toNumber(medal.puntos), 0);
    const cargoMedal = member.medalsData.find((medal) => medal.tipo === 'cargo');
    const role = cargoMedal ? cargoLabels[cargoMedal.cargo] : roleFromPoints(points);

    return {
      ...member,
      points,
      role,
      cargoLabel: cargoMedal ? cargoLabels[cargoMedal.cargo] || cargoMedal.cargo : '',
    };
  });

  // Calcular total de puntos (excluyendo ex-cargo)
  const totalPoints = decoratedMembers.reduce((sum, member) => sum + member.points, 0);

  const totalMedals = decoratedMembers.reduce((sum, member) => sum + member.medalsData.length, 0);

  const rankedMembers = [...decoratedMembers]
    .sort((left, right) => right.points - left.points || left.usuario.localeCompare(right.usuario));

  const membersById = new Map(rankedMembers.map((member) => [member.usuario, member]));
  const medalsById = new Map(medals.map((medal) => [medal.id, medal]));

  appData = {
    members: rankedMembers,
    medals,
    material,
    privileges,
    totalPoints,
    totalMedals,
    membersById,
    medalsById,
  };

  appState.selectedMemberId = rankedMembers[0]?.usuario ?? null;
  appState.selectedMedalId = rankedMembers[0]?.medalsData[0]?.id ?? null;

  ensureAppRoot().addEventListener('click', handleAppClick);
  renderApp();
}

function ensureAppRoot() {
  if (!appRoot) {
    appRoot = document.querySelector('#app');
  }

  return appRoot;
}

function getPageKey() {
  return document.body?.dataset.page
    || document.documentElement?.dataset.page
    || 'home';
}

function renderApp() {
  ensureAppRoot().innerHTML = renderPage(appData, appState, pageKey);
}

function scrollProfileIntoView() {
  const profileSection = document.querySelector('#profile-section');

  if (profileSection) {
    profileSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function handleAppClick(event) {
  const actionTarget = event.target.closest('[data-action]');

  if (!actionTarget || !appData) {
    return;
  }

  const action = actionTarget.dataset.action;

  if (action === 'select-member') {
    const memberId = actionTarget.dataset.memberId;
    const member = appData.membersById.get(memberId);

    if (!member) {
      return;
    }

    appState.selectedMemberId = memberId;
    appState.selectedMedalId = member.medalsData[0]?.id ?? null;
    renderApp();
    scrollProfileIntoView();
    return;
  }

  if (action === 'select-medal') {
    appState.selectedMedalId = actionTarget.dataset.medalId;
    renderApp();
    return;
  }

  if (action === 'select-random-medal') {
    const member = appData.membersById.get(appState.selectedMemberId);

    if (!member || !member.medalsData.length) {
      return;
    }

    const nextIndex = member.medalsData.findIndex((medal) => medal.id === appState.selectedMedalId);
    const resolvedIndex = nextIndex >= 0 ? (nextIndex + 1) % member.medalsData.length : 0;
    appState.selectedMedalId = member.medalsData[resolvedIndex].id;
    renderApp();
    scrollProfileIntoView();
    return;
  }

  if (action === 'jump-section') {
    const target = document.querySelector(`#${actionTarget.dataset.targetId}`);

    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }
}

async function loadCsv(paths) {
  const candidates = Array.isArray(paths) ? paths : [paths];

  for (const path of candidates) {
    try {
      const response = await fetch(path, { cache: 'no-store' });

      if (!response.ok) {
        continue;
      }

      return parseCsv(await response.text());
    } catch {
      // Probar siguiente ruta.
    }
  }

  throw new Error(`No se pudo leer ${candidates[0]}`);
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

function renderPage(data, state, currentPage) {
  if (currentPage === 'home') {
    return renderHomePage();
  }

  if (currentPage === 'medallas') {
    return renderMedallasPage(data.medals);
  }

  if (currentPage === 'material') {
    return renderMaterialPage(data.material);
  }

  if (currentPage === 'privilegios') {
    return renderPrivilegesPage(data.privileges);
  }

  return renderSociosPage(data, state);
}

function renderSociosPage({ members, medals, material, privileges, totalPoints, totalMedals }, state) {
  const selectedMember = members.find((member) => member.usuario === state.selectedMemberId) ?? members[0] ?? null;
  const selectedMedal = selectedMember?.medalsData.find((medal) => medal.id === state.selectedMedalId)
    ?? selectedMember?.medalsData[0]
    ?? null;
  const podiumMembers = members.slice(0, 3);
  const featuredMembers = members.slice(0, 8);

  return `
    <div class="page">
      <header class="hero">
        <div class="hero-brand">
          <img class="hero-logo" src="./public/logo.svg" alt="Logo de ADS" />
        </div>
        <div class="eyebrow">ADS · Asociacion de Desarrollo de Software</div>
        <h2>Podio de actividad y perfiles de socios</h2>
        ${renderPageTabs('socios')}
        <div class="hero-grid">
          ${statCard('Formato', 'Podio + perfiles')}
          ${statCard('Medallas', String(totalMedals))}
          ${statCard('Socios', String(members.length))}
          ${statCard('Puntos', String(totalPoints))}
        </div>
      </header>

      <main class="content">
        ${renderPodiumSection(podiumMembers)}
        ${renderProfileSection(selectedMember, selectedMedal)}
        ${renderRankingSection(featuredMembers)}
      </main>
    </div>
  `;
}

function renderHomePage() {
  return `
    <div class="page page-home">
      <header class="hero home-hero">
        <div class="hero-brand hero-brand-home">
          <img class="hero-logo hero-logo-home" src="./public/logo.svg" alt="Logo de ADS" />
        </div>
        <div class="eyebrow">ADS · Asociacion de Desarrollo de Software</div>
        <h2>Tablero principal</h2>
        <p class="hero-copy">
          Elige una sección para entrar en su página independiente. Cada área vive separada, sin mezclar el contenido del CSV en una sola pantalla.
        </p>
        ${renderPageTabs('home')}
      </header>
    </div>
  `;
}

function renderMedallasPage(medals) {
  return `
    <div class="page">
      <header class="hero">
        <div class="hero-brand">
          <img class="hero-logo" src="./public/logo.svg" alt="Logo de ADS" />
        </div>
        <div class="eyebrow">ADS · Asociacion de Desarrollo de Software</div>
        <h2>Medallas que se pueden conseguir</h2>
        <p class="hero-copy">Catálogo independiente de medallas disponibles, con iconos abstractos generados por ID.</p>
        ${renderPageTabs('medallas')}
      </header>

      <main class="content">
        ${renderMedalCatalogSection(medals)}
      </main>
    </div>
  `;
}

function renderMaterialPage(material) {
  return `
    <div class="page">
      <header class="hero">
        <div class="hero-brand">
          <img class="hero-logo" src="./public/logo.svg" alt="Logo de ADS" />
        </div>
        <div class="eyebrow">ADS · Asociacion de Desarrollo de Software</div>
        <h2>Material disponible</h2>
        <p class="hero-copy">Inventario separado para consultar el material sin mezclarlo con el resto de la pantalla principal.</p>
        ${renderPageTabs('material')}
      </header>

      <main class="content">
        ${renderMaterialSection(material)}
      </main>
    </div>
  `;
}

function renderPrivilegesPage(privileges) {
  return `
    <div class="page">
      <header class="hero">
        <div class="hero-brand">
          <img class="hero-logo" src="./public/logo.svg" alt="Logo de ADS" />
        </div>
        <div class="eyebrow">ADS · Asociacion de Desarrollo de Software</div>
        <h2>Privilegios obtenibles</h2>
        <p class="hero-copy">Lista independiente de privilegios que se desbloquean por puntos o por rol.</p>
        ${renderPageTabs('privilegios')}
      </header>

      <main class="content">
        ${renderPrivilegesSection(privileges)}
      </main>
    </div>
  `;
}

function renderMaterialSection(material) {
  return `
    <section class="panel compact-panel" id="material-section">
      <div class="section-heading">
        <div>
          <div class="eyebrow">Archivo</div>
          <h2>Material</h2>
        </div>
      </div>
      <div class="compact-list">
        ${material.length ? material.map((row) => `<div class="compact-item">${escapeHtml(`${row.material} · ${row.estado} · ${row.ubicacion}`)}</div>`).join('') : '<div class="compact-item empty-cell">Sin datos</div>'}
      </div>
    </section>
  `;
}

function renderPrivilegesSection(privileges) {
  return `
    <section class="panel compact-panel" id="privilegios-section">
      <div class="section-heading">
        <div>
          <div class="eyebrow">Archivo</div>
          <h2>Privilegios</h2>
        </div>
      </div>
      <div class="compact-list">
        ${privileges.length ? privileges.map((row) => `<div class="compact-item">${escapeHtml(`${row.privilegio} · ${row.condicion} · ${row.detalle}`)}</div>`).join('') : '<div class="compact-item empty-cell">Sin datos</div>'}
      </div>
    </section>
  `;
}

function renderPageTabs(currentPage) {
  const tabs = [
    { href: './socios.html', label: 'Socios', key: 'socios' },
    { href: './medallas.html', label: 'Medallas', key: 'medallas' },
    { href: './material.html', label: 'Material', key: 'material' },
    { href: './privilegios.html', label: 'Privilegios', key: 'privilegios' },
  ];

  return `
    <nav class="section-tabs" aria-label="Secciones principales">
      ${tabs.map((tab) => `<a class="section-tab ${currentPage === tab.key ? 'is-active' : ''}" href="${tab.href}">${tab.label}</a>`).join('')}
    </nav>
  `;
}

function renderPodiumSection(members) {
  const first = members[0] ?? null;
  const second = members[1] ?? null;
  const third = members[2] ?? null;

  return `
    <section class="panel podium-panel">
      <div class="section-heading">
        <div>
          <div class="eyebrow">Pódium</div>
          <h2>Socios más activos</h2>
        </div>
        <p>Haz clic en cualquier socio para abrir su perfil y revisar sus medallas.</p>
      </div>

      <div class="podium-stage">
        ${renderPodiumCard(second, 2)}
        ${renderPodiumCard(first, 1)}
        ${renderPodiumCard(third, 3)}
      </div>

      <div class="podium-base">
        ${members.slice(0, 6).map((member, index) => renderQuickMember(member, index + 1)).join('')}
      </div>
    </section>
  `;
}

function renderProfileSection(member, selectedMedal) {
  if (!member) {
    return `
      <section class="panel profile-panel" id="profile-section">
        <h2>Perfil</h2>
        <p>No hay ningun socio seleccionado.</p>
      </section>
    `;
  }

  return `
    <section class="panel profile-panel" id="profile-section">
      <div class="profile-header">
        <div class="profile-avatar">${memberInitials(member.usuario)}</div>
        <div>
          <div class="eyebrow">Perfil del socio</div>
          <h2>${escapeHtml(member.usuario)}</h2>
          <p>${escapeHtml(member.role)} · ${member.points} puntos · ${member.medalsData.length} medallas</p>
        </div>
        <button class="profile-action" data-action="select-random-medal">Siguiente medalla</button>
      </div>

      <div class="profile-metrics">
        ${statCard('Puntos', String(member.points))}
        ${statCard('Rol', member.role)}
        ${statCard('Medallas', String(member.medalsData.length))}
        ${statCard('Cargo', member.cargoLabel || 'Sin cargo actual')}
      </div>

      <div class="profile-body">
        <div>
          <h3>Medallas</h3>
          <div class="medal-grid">
            ${member.medalsData.map((medal) => renderMedalButton(medal, medal.id === selectedMedal?.id)).join('')}
          </div>
        </div>

        <aside class="medal-detail">
          ${selectedMedal ? renderMedalDetail(selectedMedal) : '<p class="muted">Toca una medalla para ver su info.</p>'}
        </aside>
      </div>
    </section>
  `;
}

function renderRankingSection(members) {
  return `
    <section class="panel ranking-panel">
      <div class="section-heading">
        <div>
          <div class="eyebrow">Ranking</div>
          <h2>Top de actividad</h2>
        </div>
        <p>Selecciona un socio para ver su perfil completo.</p>
      </div>

      <div class="ranking-grid">
        ${members.map((member, index) => renderRankingCard(member, index + 1)).join('')}
      </div>
    </section>
  `;
}

function renderArchiveSection(material, privileges) {
  return `
    <section class="archive-grid">
      ${renderCompactList('Material', material.slice(0, 6), (row) => `${row.material} · ${row.estado}`, 'material-section')}
      ${renderCompactList('Privilegios', privileges.slice(0, 6), (row) => `${row.privilegio} · ${row.condicion}`, 'privilegios-section')}
    </section>
  `;
}

function renderMedalCatalogSection(medals) {
  return `
    <section class="panel medal-catalog-panel" id="medallas-section">
      <div class="section-heading">
        <div>
          <div class="eyebrow">Catálogo</div>
          <h2>Medallas que se pueden conseguir</h2>
        </div>
        <p>Estas son las medallas disponibles.</p>
      </div>

      <div class="medal-catalog-grid">
        ${medals.map((medal) => renderMedalCatalogCard(medal)).join('')}
      </div>
    </section>
  `;
}

function renderMedalCatalogCard(medal) {
  const badgeType = medal.tipo === 'cargo'
    ? `Cargo · ${cargoLabels[medal.cargo] || medal.cargo}`
    : medal.tipo === 'ex-cargo'
      ? 'Histórico'
      : 'Normal';

  return `
    <article class="medal-catalog-card">
      <div class="medal-catalog-icon">${renderMedalShield(medal, false, 'catalog')}</div>
      <div class="medal-catalog-copy">
        <h3>${escapeHtml(medal.evento)}</h3>
        <p>${escapeHtml(medal.descripcion || '')}</p>
        <div class="detail-tags">
          <span>${escapeHtml(badgeType)}</span>
          <span>${escapeHtml(String(medal.puntos))} puntos</span>
          <span>${escapeHtml(medal.id)}</span>
        </div>
      </div>
    </article>
  `;
}

function renderCompactList(title, rows, mapper, sectionId) {
  return `
    <section class="panel compact-panel" id="${sectionId}">
      <div class="section-heading">
        <div>
          <div class="eyebrow">Archivo</div>
          <h2>${title}</h2>
        </div>
      </div>
      <div class="compact-list">
        ${rows.length ? rows.map((row) => `<div class="compact-item">${escapeHtml(mapper(row))}</div>`).join('') : '<div class="compact-item empty-cell">Sin datos</div>'}
      </div>
    </section>
  `;
}

function renderPodiumCard(member, position) {
  if (!member) {
    return `<article class="podium-card empty"><span>#${position}</span><strong>Vacante</strong></article>`;
  }

  return `
    <button class="podium-card podium-card-${position}" data-action="select-member" data-member-id="${escapeHtml(member.usuario)}">
      <span class="podium-rank">#${position}</span>
      <div class="podium-avatar">${memberInitials(member.usuario)}</div>
      <strong>${escapeHtml(member.usuario)}</strong>
      <p>${escapeHtml(member.role)}</p>
      <div class="podium-meta">
        <span>${member.points} pts</span>
        <span>${member.medalsData.length} medallas</span>
      </div>
    </button>
  `;
}

function renderQuickMember(member, position) {
  return `
    <button class="quick-member" data-action="select-member" data-member-id="${escapeHtml(member.usuario)}">
      <span>${position}</span>
      <strong>${escapeHtml(member.usuario)}</strong>
      <small>${member.points} pts</small>
    </button>
  `;
}

function renderRankingCard(member, position) {
  return `
    <button class="ranking-card" data-action="select-member" data-member-id="${escapeHtml(member.usuario)}">
      <span class="ranking-position">${position}</span>
      <div>
        <strong>${escapeHtml(member.usuario)}</strong>
        <p>${escapeHtml(member.role)}</p>
      </div>
      <div class="ranking-score">${member.points}</div>
    </button>
  `;
}

function renderMedalButton(medal, isSelected) {
  return `
    <button class="medal-button ${isSelected ? 'is-selected' : ''}" data-action="select-medal" data-medal-id="${escapeHtml(medal.id)}">
      ${renderMedalShield(medal, false, 'card')}
      <span class="medal-name">${escapeHtml(medal.evento)}</span>
      <small>${escapeHtml(medal.id)}</small>
    </button>
  `;
}

function renderMedalDetail(medal) {
  const badgeType = medal.tipo === 'cargo'
    ? `Cargo · ${cargoLabels[medal.cargo] || medal.cargo}`
    : medal.tipo === 'ex-cargo'
      ? 'Histórico'
      : 'Normal';

  return `
    <div class="detail-card">
      <div class="detail-preview">${renderMedalShield(medal, true, 'detail')}</div>
      <div class="detail-copy">
        <div class="eyebrow">Medalla seleccionada</div>
        <h3>${escapeHtml(medal.evento)}</h3>
        <p>${escapeHtml(medal.descripcion || '')}</p>
        <div class="detail-tags">
          <span>${escapeHtml(badgeType)}</span>
          <span>${escapeHtml(String(medal.puntos))} puntos</span>
          <span>${escapeHtml(medal.id)}</span>
        </div>
      </div>
    </div>
  `;
}

function renderMedalShield(medal, large = false, variant = 'default') {
  const seed = hashString(medal.id);
  const hue = seed % 360;
  const hue2 = (hue + 36 + (seed % 42)) % 360;
  const hue3 = (hue + 170 + (seed % 36)) % 360;
  const variantIndex = seed % 8;
  const sizeClass = large ? 'medal-svg large' : 'medal-svg';
  const gradientId = `${variant}-grad-${medal.id}`;
  const glowId = `${variant}-glow-${medal.id}`;
  const paletteShift = 18 + (seed % 22);
  const outerRing = 34 + (seed % 4);
  const mainShape = trianglePoints(seed, 50, 50, 16 + (seed % 7), 27 + ((seed >> 3) % 10), variantIndex);
  const innerShape = trianglePoints(seed >> 4, 50, 50, 9 + ((seed >> 2) % 4), 18 + ((seed >> 5) % 7), variantIndex + 1);
  const innerShape2 = trianglePoints(seed >> 8, 50, 50, 6 + ((seed >> 1) % 3), 11 + ((seed >> 6) % 5), variantIndex + 2);
  const dots = triangleNodes(mainShape);
  const center = [50 + ((seed >> 11) % 5) - 2, 50 + ((seed >> 13) % 5) - 2];
  const lineA = lineFromPoints(dots[0], dots[1]);
  const lineB = lineFromPoints(dots[1], dots[2]);
  const lineC = lineFromPoints(dots[2], dots[0]);
  const accentLine = lineFromPoints(center, dots[variantIndex % 3]);

  return `
    <svg class="${sizeClass}" viewBox="0 0 100 112" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Medalla ${escapeHtml(medal.evento)}">
      <defs>
        <linearGradient id="${gradientId}" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stop-color="hsl(${hue}, 74%, 64%)" />
          <stop offset="52%" stop-color="hsl(${hue2}, 82%, 56%)" />
          <stop offset="100%" stop-color="hsl(${hue3}, 66%, 40%)" />
        </linearGradient>
        <filter id="${glowId}" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="4" stdDeviation="5" flood-color="#000" flood-opacity="0.35" />
        </filter>
      </defs>
      <circle cx="50" cy="50" r="${outerRing}" fill="rgba(7, 13, 20, 0.12)" stroke="url(#${gradientId})" stroke-width="2.4" />
      <circle cx="50" cy="50" r="${outerRing - 7}" fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.08)" stroke-width="1.2" />
      <line x1="${lineA[0]}" y1="${lineA[1]}" x2="${lineA[2]}" y2="${lineA[3]}" stroke="rgba(255,255,255,0.26)" stroke-width="2" />
      <line x1="${lineB[0]}" y1="${lineB[1]}" x2="${lineB[2]}" y2="${lineB[3]}" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
      <line x1="${lineC[0]}" y1="${lineC[1]}" x2="${lineC[2]}" y2="${lineC[3]}" stroke="rgba(255,255,255,0.2)" stroke-width="2" />
      <path d="${mainShape}" fill="rgba(15, 23, 38, 0.58)" stroke="url(#${gradientId})" stroke-width="1.9" filter="url(#${glowId})" />
      <path d="${innerShape}" fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.2)" stroke-width="1.2" />
      <path d="${innerShape2}" fill="rgba(255,255,255,0.16)" />
      <line x1="${accentLine[0]}" y1="${accentLine[1]}" x2="${accentLine[2]}" y2="${accentLine[3]}" stroke="rgba(255,255,255,0.24)" stroke-width="1.8" />
      <circle cx="${dots[0][0]}" cy="${dots[0][1]}" r="3.6" fill="hsl(${hue2}, 86%, 66%)" />
      <circle cx="${dots[1][0]}" cy="${dots[1][1]}" r="3.3" fill="hsl(${hue3}, 84%, 68%)" />
      <circle cx="${dots[2][0]}" cy="${dots[2][1]}" r="3.1" fill="hsl(${hue}, 90%, 72%)" />
      <circle cx="${center[0]}" cy="${center[1]}" r="2.7" fill="rgba(255,255,255,0.75)" />
    </svg>
  `;
}

function trianglePoints(seed, cx, cy, minRadius, maxRadius, offset = 0) {
  return [0, 1, 2]
    .map((index) => {
      const angle = ((seed >> (index * 6)) % 360 + offset * 17 + index * 21) % 360;
      const radius = minRadius + ((seed >> (index * 5 + 3)) % Math.max(1, maxRadius - minRadius));
      const x = cx + Math.cos((angle * Math.PI) / 180) * radius;
      const y = cy + Math.sin((angle * Math.PI) / 180) * radius;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');
}

function triangleNodes(pointsString) {
  return pointsString
    .split(' ')
    .map((pair) => pair.split(',').map((value) => Number(value)));
}

function lineFromPoints(start, end) {
  return [start[0].toFixed(1), start[1].toFixed(1), end[0].toFixed(1), end[1].toFixed(1)];
}

function memberInitials(value) {
  const clean = String(value || '').trim();
  if (!clean) {
    return 'ADS';
  }

  return clean
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part.slice(0, 1).toUpperCase())
    .join('') || clean.slice(0, 2).toUpperCase();
}

function hashString(value) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = ((hash << 5) - hash + value.charCodeAt(index)) | 0;
  }
  return Math.abs(hash);
}

function membersPanel() {
  return '';
}

function catalogPanel() {
  return '';
}

function panel() {
  return '';
}

function renderError(message) {
  return `
    <div class="page">
      <section class="panel">
        <h1>ADS</h1>
        <p>${message}</p>
      </section>
    </div>
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