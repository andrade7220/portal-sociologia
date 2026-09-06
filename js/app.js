/**
 * PORTAL ACADÉMICO DE SOCIOLOGÍA - LÓGICA E INTERACTIVIDAD
 * Proyecto Formativo: Ingeniería en Sistemas
 */

document.addEventListener('DOMContentLoaded', () => {
  initThemeToggle();
  initMobileNav();
  initModuleRouting();
  initSearch();
  initTimelineFilter();
  initMatrixComparison();
  initAccordions();
  initQuiz();
});

/* ==========================================================================
   1. MODO OSCURO / CLARO (Theme Toggle)
   ========================================================================== */
function initThemeToggle() {
  const themeToggleBtn = document.getElementById('themeToggleBtn');
  const savedTheme = localStorage.getItem('sociology_theme') ||
    (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');

  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const currentTheme = document.documentElement.getAttribute('data-theme');
      const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', newTheme);
      localStorage.setItem('sociology_theme', newTheme);
      updateThemeIcon(newTheme);
    });
  }
}

function updateThemeIcon(theme) {
  const themeIcon = document.getElementById('themeIcon');
  if (!themeIcon) return;
  if (theme === 'dark') {
    themeIcon.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="12" cy="12" r="5"></circle>
        <line x1="12" y1="1" x2="12" y2="3"></line>
        <line x1="12" y1="21" x2="12" y2="23"></line>
        <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
        <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
        <line x1="1" y1="12" x2="3" y2="12"></line>
        <line x1="21" y1="12" x2="23" y2="12"></line>
        <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
        <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
      </svg>`;
  } else {
    themeIcon.innerHTML = `
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
      </svg>`;
  }
}

/* ==========================================================================
   2. NAVEGACIÓN MÓVIL (Hamburger Menu)
   ========================================================================== */
function initMobileNav() {
  const menuToggleBtn = document.getElementById('menuToggleBtn');
  const navMenu = document.getElementById('navMenu');
  const navLinks = document.querySelectorAll('.nav-link');

  if (menuToggleBtn && navMenu) {
    menuToggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('open');
      const isOpen = navMenu.classList.contains('open');
      menuToggleBtn.setAttribute('aria-expanded', isOpen);
    });

    // Cerrar al hacer click en cualquier enlace
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('open');
      });
    });
  }
}

/* ==========================================================================
   3. SISTEMA DE RUTAS Y VISTAS MODULARES (Paginación SPA)
   ========================================================================== */
const validModules = ['inicio', 'modulo1', 'modulo2', 'modulo3', 'modulo4', 'modulo5', 'evaluacion'];

function switchModule(targetId, updateHistory = true) {
  if (!validModules.includes(targetId)) {
    targetId = 'inicio';
  }

  // 1. Alternar visibilidad de secciones (solo una visible a la vez)
  validModules.forEach(id => {
    const sectionEl = document.getElementById(id);
    if (sectionEl) {
      if (id === targetId) {
        sectionEl.classList.add('active-view');
        sectionEl.style.display = 'block';
      } else {
        sectionEl.classList.remove('active-view');
        sectionEl.style.display = 'none';
      }
    }
  });

  // 2. Actualizar estado activo en los enlaces del navbar y atributo de módulo en el body
  document.body.setAttribute('data-active-module', targetId);
  const navLinks = document.querySelectorAll('.nav-link');
  navLinks.forEach(link => {
    link.classList.remove('active');
    if (link.getAttribute('href') === `#${targetId}`) {
      link.classList.add('active');
    }
  });

  // 3. Actualizar historial del navegador
  if (updateHistory && window.location.hash !== `#${targetId}`) {
    history.pushState({ module: targetId }, '', `#${targetId}`);
  }

  // 4. Scroll suave al inicio de la página para que no se vea como una sola página larga
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function initModuleRouting() {
  // Manejar clics en enlaces del nav principal
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const href = link.getAttribute('href');
      if (href && href.startsWith('#')) {
        const targetId = href.substring(1);
        switchModule(targetId);
      }
    });
  });

  // Manejar clics en el logo para volver a inicio
  const logoBrand = document.querySelector('.logo-brand');
  if (logoBrand) {
    logoBrand.addEventListener('click', (e) => {
      e.preventDefault();
      switchModule('inicio');
    });
  }

  // Manejar clics en botones de navegación ("Siguiente Módulo" / "Módulo Anterior") y enlaces
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('[data-target]');
    if (btn) {
      e.preventDefault();
      const targetId = btn.getAttribute('data-target');
      if (targetId) switchModule(targetId);
      return;
    }

    const anchor = e.target.closest('a[href^="#"]');
    if (anchor && !anchor.classList.contains('timeline-filter-btn') && !anchor.classList.contains('matrix-tab-btn')) {
      const href = anchor.getAttribute('href');
      const targetId = href.substring(1);
      if (validModules.includes(targetId)) {
        e.preventDefault();
        switchModule(targetId);
      }
    }
  });

  // Responder a navegación con botones Atrás y Adelante del navegador
  window.addEventListener('popstate', () => {
    const hash = window.location.hash.replace('#', '');
    switchModule(hash || 'inicio', false);
  });

  // Carga inicial según el hash de la URL o 'inicio'
  const initialHash = window.location.hash.replace('#', '');
  switchModule(initialHash || 'inicio', false);
}

/* ==========================================================================
   4. BUSCADOR RÁPIDO INTERACTIVO
   ========================================================================== */
const searchableContent = [
  { title: 'Conocimiento Científico vs. Sentido Común', section: 'modulo1', desc: 'Racionalidad, objetividad, contrastación empírica frente a prenociones.' },
  { title: 'Clasificación de las Ciencias y Comte', section: 'modulo1', desc: 'Jerarquía comtiana y ubicación de la Sociología como Física Social en la cúspide.' },
  { title: 'Disciplinas Sociales Principales', section: 'modulo1', desc: 'Economía, Derecho, Historia, Antropología, Ciencia Política y Demografía.' },
  { title: 'Definición Multiperspectiva de Sociología', section: 'modulo2', desc: 'Conceptos de Comte, Durkheim, Weber, Marx, Bourdieu (habitus) y Giddens.' },
  { title: 'Objeto de Estudio y Hechos Sociales', section: 'modulo2', desc: 'Exterioridad, coercitividad y generalidad en el análisis colectivo.' },
  { title: 'Niveles de Análisis: Micro y Macro', section: 'modulo2', desc: 'Interacciones interindividuales cotidianas frente a grandes estructuras sistémicas.' },
  { title: 'La Ilustración (Siglo XVIII)', section: 'modulo3', desc: 'Razón secular, método científico y superación del dogma teológico en la génesis sociológica.' },
  { title: 'La Revolución Francesa (1789-1799)', section: 'modulo3', desc: 'Quiebre del modelo feudal, surgimiento del Estado-República y necesidad de nuevo orden social.' },
  { title: 'La Revolución Industrial (S. XVIII-XIX)', section: 'modulo3', desc: 'Tecnología a vapor, polarización burguesía-proletariado y éxodo urbano masivo.' },
  { title: 'Auguste Comte y la Ley de los Tres Estados', section: 'modulo4', desc: 'Estado teológico, metafísico y positivo o científico.' },
  { title: 'Émile Durkheim y los Hechos Sociales', section: 'modulo4', desc: 'Tratar los hechos sociales como cosas: exterioridad y coacción.' },
  { title: 'Karl Marx: Materialismo y Lucha de Clases', section: 'modulo4', desc: 'Burguesía vs. proletariado, infraestructura, superestructura y plusvalía.' },
  { title: 'Max Weber: Sociología Comprensiva', section: 'modulo4', desc: 'Verstehen, acción social, tipos ideales y dominación racional-legal.' },
  { title: 'Herbert Spencer y Henri de Saint-Simon', section: 'modulo4', desc: 'Fisiología social, tecnocracia y darwinismo social orgánico.' },
  { title: 'Estructural Funcionalismo y Esquema AGIL', section: 'modulo5', desc: 'Talcott Parsons: Adaptación, Metas, Integración y Latencia.' },
  { title: 'Teoría del Conflicto y Teoría Crítica', section: 'modulo5', desc: 'Disputa de poder, Escuela de Frankfurt y crítica a la industria cultural.' },
  { title: 'Tipos Ideales de Acción Social (Weber)', section: 'modulo5', desc: 'Racional con arreglo a fines, a valores, afectiva y tradicional.' },
  { title: 'Quiz de Autoevaluación', section: 'evaluacion', desc: 'Cuestionario interactivo con retroalimentación inmediata sobre todos los módulos.' }
];

function initSearch() {
  const openSearchBtn = document.getElementById('openSearchBtn');
  const closeSearchBtn = document.getElementById('closeSearchBtn');
  const searchModal = document.getElementById('searchModal');
  const searchInput = document.getElementById('searchInput');
  const searchResults = document.getElementById('searchResults');

  if (!openSearchBtn || !searchModal) return;

  function openModal() {
    searchModal.classList.add('active');
    searchInput.value = '';
    renderSearchResults('');
    setTimeout(() => searchInput.focus(), 50);
  }

  function closeModal() {
    searchModal.classList.remove('active');
  }

  openSearchBtn.addEventListener('click', openModal);
  if (closeSearchBtn) closeSearchBtn.addEventListener('click', closeModal);

  searchModal.addEventListener('click', (e) => {
    if (e.target === searchModal) closeModal();
  });

  // Atajo de teclado Ctrl+K
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (searchModal.classList.contains('active')) closeModal();
      else openModal();
    }
    if (e.key === 'Escape' && searchModal.classList.contains('active')) {
      closeModal();
    }
  });

  searchInput.addEventListener('input', (e) => {
    renderSearchResults(e.target.value.trim().toLowerCase());
  });

  function renderSearchResults(query) {
    if (!searchResults) return;
    if (!query) {
      searchResults.innerHTML = '<p style="padding: 1rem; color: var(--text-light); text-align: center; font-size: 0.9rem;">Escribe un término (ej: "Marx", "AGIL", "Comte", "Ciencia") para buscar.</p>';
      return;
    }

    const filtered = searchableContent.filter(item =>
      item.title.toLowerCase().includes(query) ||
      item.desc.toLowerCase().includes(query)
    );

    if (filtered.length === 0) {
      searchResults.innerHTML = '<p style="padding: 1rem; color: var(--text-light); text-align: center; font-size: 0.9rem;">No se encontraron resultados para "' + query + '".</p>';
      return;
    }

    searchResults.innerHTML = filtered.map(item => `
      <a href="#${item.section}" class="search-result-item" onclick="document.getElementById('searchModal').classList.remove('active')">
        <h5>${item.title}</h5>
        <p>${item.desc}</p>
      </a>
    `).join('');
  }
}

/* ==========================================================================
   5. COMPONENTE INTERACTIVO 1: FILTRADO DE LÍNEA DE TIEMPO
   ========================================================================== */
function initTimelineFilter() {
  const filterBtns = document.querySelectorAll('.timeline-filter-btn');
  const timelineItems = document.querySelectorAll('.timeline-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');

      timelineItems.forEach(item => {
        const itemEra = item.getAttribute('data-era');
        if (filter === 'all' || itemEra === filter) {
          item.style.display = 'block';
          setTimeout(() => { item.style.opacity = '1'; }, 10);
        } else {
          item.style.opacity = '0';
          setTimeout(() => { item.style.display = 'none'; }, 200);
        }
      });
    });
  });
}

/* ==========================================================================
   6. COMPONENTE INTERACTIVO 2: MATRIZ COMPARATIVA Y ACORDEONES
   ========================================================================== */
const theoriesData = {
  positivismo: {
    title: 'Positivismo Clásico',
    founder: 'Auguste Comte (1798-1857)',
    objeto: 'Leyes invariables del orden (estática social) y del progreso (dinámica social).',
    metodo: 'Método científico empírico, observación sistemática, experimentación y contrastación de hechos verificables.',
    tesis: 'El único conocimiento auténtico y válido es el científico. La sociedad pasa por tres estados evolutivos (Teológico, Metafísico y Positivo).',
    conceptos: ['Física Social', 'Ley de los Tres Estados', 'Orden y Progreso', 'Ciencia Positiva'],
    criticas: 'Postura reduccionista que equipara la sociedad a fenómenos biológicos y asume una fe ciega en el progreso lineal.'
  },
  materialismo: {
    title: 'Materialismo Histórico',
    founder: 'Karl Marx (1818-1883) & Friedrich Engels',
    objeto: 'Modos de producción, relaciones de producción y lucha de clases como motor histórico.',
    metodo: 'Dialéctica materialista: análisis de contradicciones económicas y materiales de la existencia.',
    tesis: 'La infraestructura económica (fuerzas productivas + relaciones de producción) condiciona la superestructura ideológica, jurídica y política. La historia es la historia de la lucha de clases.',
    conceptos: ['Lucha de Clases', 'Infraestructura y Superestructura', 'Plusvalía', 'Alienación'],
    criticas: 'Se le acusa en sus versiones ortodoxas de determinismo económico excesivo y subestimar factores culturales o religiosos.'
  },
  funcionalismo: {
    title: 'Estructural Funcionalismo',
    founder: 'Émile Durkheim, Herbert Spencer, Talcott Parsons',
    objeto: 'Estructuras sociales e instituciones orientadas al mantenimiento del orden y la estabilidad.',
    metodo: 'Análisis funcional de las instituciones y tratamiento de los hechos sociales como cosas externas.',
    tesis: 'La sociedad es un sistema autorregulado donde cada elemento (familia, educación, religión) cumple una función indispensable para el equilibrio sistémico.',
    conceptos: ['Hecho Social', 'Esquema AGIL', 'Solidaridad Orgánica', 'Anomia', 'Roles y Estatus'],
    criticas: 'Visión conservadora que naturaliza el statu quo, tiene dificultades para explicar el cambio revolucionario y trata al individuo como títere.'
  },
  conflicto: {
    title: 'Teoría del Conflicto Social',
    founder: 'Karl Marx, Max Weber, Lewis Coser, Ralf Dahrendorf',
    objeto: 'Disputa por recursos escasos, poder, prestigio y asimetrías de dominación.',
    metodo: 'Análisis crítico-estructural de la distribución asimétrica de autoridad e intereses antagónicos.',
    tesis: 'El conflicto no es una anomalía o patología, sino un proceso intrínseco y constitutivo de la sociedad humana que genera transformación histórica.',
    conceptos: ['Estratificación', 'Dominación', 'Poder Asimétrico', 'Grupos de Interés'],
    criticas: 'Puede sobredimensionar la confrontación y pasar por alto los amplios consensos y solidaridades que mantienen cohesionadas las comunidades.'
  },
  critica: {
    title: 'Teoría Crítica (Escuela de Frankfurt)',
    founder: 'Max Horkheimer, Theodor Adorno, Herbert Marcuse, Jürgen Habermas',
    objeto: 'Razón instrumental, industria cultural, dominación técnica y alienación de masas.',
    metodo: 'Crítica dialéctica interdisciplinaria (filosofía, psicoanálisis, sociología).',
    tesis: 'La Ilustración derivó en una razón calculadora que emancipa técnicamente pero domina psicológicamente al individuo mediante el consumo y la cultura masificada.',
    conceptos: ['Industria Cultural', 'Razón Instrumental', 'Hombre Unidimensional', 'Acción Comunicativa'],
    criticas: 'Tono excesivamente pesimista respecto al papel de la tecnología y distanciamiento de la verificación empírica estricta.'
  },
  comprensiva: {
    title: 'Sociología Comprensiva',
    founder: 'Max Weber (1864-1920)',
    objeto: 'La Acción Social: conducta individual con sentido y significado subjetivo orientada hacia otros.',
    metodo: 'Verstehen (comprensión empática interpretativa) mediante la construcción de Tipos Ideales.',
    tesis: 'La sociedad se constituye por los sentidos que los actores otorgan a sus prácticas. La modernidad occidental se caracteriza por un proceso de racionalización y desencantamiento del mundo.',
    conceptos: ['Verstehen', 'Tipos Ideales', 'Ética Protestante', 'Burocracia', 'Tipos de Dominación'],
    criticas: 'Dificultad para formular leyes generales universales debido al énfasis subjetivista e interpretativo.'
  }
};

function initMatrixComparison() {
  const tabBtns = document.querySelectorAll('.matrix-tab-btn');
  const displayCard = document.getElementById('matrixDisplayCard');

  if (!displayCard || tabBtns.length === 0) return;

  function renderTheory(theoryKey) {
    const data = theoriesData[theoryKey];
    if (!data) return;

    displayCard.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 1rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-subtle); padding-bottom: 1rem;">
        <div>
          <span class="badge-tag" style="margin-bottom: 0.5rem;">Enfoque Teórico</span>
          <h3 style="margin-bottom: 0.25rem;">${data.title}</h3>
          <p style="margin: 0; color: var(--accent-primary); font-weight: 600;">Exponente clave: ${data.founder}</p>
        </div>
      </div>

      <div class="grid-2" style="margin-bottom: 1.5rem;">
        <div>
          <h4 style="color: var(--accent-secondary); font-size: 1rem; margin-bottom: 0.4rem;">🎯 Objeto de Estudio</h4>
          <p style="font-size: 0.93rem;">${data.objeto}</p>
        </div>
        <div>
          <h4 style="color: var(--accent-indigo); font-size: 1rem; margin-bottom: 0.4rem;">🔬 Metodología</h4>
          <p style="font-size: 0.93rem;">${data.metodo}</p>
        </div>
      </div>

      <div style="background: var(--bg-tertiary); padding: 1.25rem; border-radius: var(--radius-md); border-left: 4px solid var(--accent-primary); margin-bottom: 1.5rem;">
        <h4 style="font-size: 1rem; margin-bottom: 0.35rem;">💡 Postulado Central</h4>
        <p style="margin: 0; font-size: 0.94rem;">${data.tesis}</p>
      </div>

      <div style="margin-bottom: 1.25rem;">
        <h4 style="font-size: 0.95rem; margin-bottom: 0.5rem; color: var(--text-light); text-transform: uppercase; letter-spacing: 0.04em;">Categorías y Conceptos Clave:</h4>
        <div style="display: flex; flex-wrap: wrap; gap: 8px;">
          ${data.conceptos.map(c => `<span class="code-badge">${c}</span>`).join('')}
        </div>
      </div>

      <div style="background: var(--bg-primary); padding: 1rem; border-radius: var(--radius-sm); border: 1px dashed var(--border-strong);">
        <strong style="color: var(--error); font-size: 0.88rem;">⚠️ Crítica Académica:</strong>
        <p style="margin: 0; font-size: 0.88rem; color: var(--text-muted);">${data.criticas}</p>
      </div>
    `;
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const key = btn.getAttribute('data-theory');
      renderTheory(key);
    });
  });

  // Render inicial
  renderTheory('positivismo');
}

/* Acordeones Interactivos */
function initAccordions() {
  const accordionHeaders = document.querySelectorAll('.accordion-header');

  accordionHeaders.forEach(header => {
    header.addEventListener('click', () => {
      const parentItem = header.parentElement;
      const content = header.nextElementSibling;
      const isActive = parentItem.classList.contains('active');

      // Cerrar otros acordeones dentro del mismo grupo
      const siblingGroup = parentItem.parentElement;
      if (siblingGroup) {
        siblingGroup.querySelectorAll('.accordion-item').forEach(item => {
          if (item !== parentItem) {
            item.classList.remove('active');
            const siblingContent = item.querySelector('.accordion-content');
            if (siblingContent) siblingContent.style.maxHeight = null;
          }
        });
      }

      if (!isActive) {
        parentItem.classList.add('active');
        content.style.maxHeight = content.scrollHeight + 30 + 'px';
      } else {
        parentItem.classList.remove('active');
        content.style.maxHeight = null;
      }
    });
  });
}

/* ==========================================================================
   7. COMPONENTE INTERACTIVO 3: QUIZ FORMATIVO DE EVALUACIÓN
   ========================================================================== */
const quizQuestions = [
  {
    question: '1. ¿Cuál es la diferencia primordial entre el conocimiento científico y el sentido común?',
    options: [
      'El sentido común es siempre erróneo y carece de utilidad en la vida diaria.',
      'El conocimiento científico es metódico, analítico, verificable y busca contrastar hipótesis empíricamente; el sentido común es intuitivo e inmediato.',
      'El conocimiento científico se fundamenta exclusivamente en la tradición religiosa.',
      'Ambos utilizan exactamente el mismo rigor metodológico pero con distintos nombres.'
    ],
    correct: 1,
    explanation: 'El conocimiento científico exige contrastación empírica, metodología rigurosa y sistematicidad, superando los prejuicios y la inmediatez del sentido común.'
  },
  {
    question: '2. En la pirámide jerárquica de las ciencias formulada por Auguste Comte, ¿qué lugar ocupa la Sociología ("Física Social")?',
    options: [
      'En la base, pues es la ciencia más simple y elemental.',
      'En un nivel intermedio entre la física y la química inorgánica.',
      'En la cúspide, al abordar los fenómenos más complejos y depender de las ciencias precedentes.',
      'Fue excluida por Comte de su clasificación positivista.'
    ],
    correct: 2,
    explanation: 'Comte situó a la Sociología en la cúspide de su jerarquía (sobre matemáticas, astronomía, física, química y biología) por tratar los fenómenos de mayor complejidad.'
  },
  {
    question: '3. Según la célebre regla metodológica de Émile Durkheim, ¿cómo deben ser tratados los hechos sociales?',
    options: [
      'Como simples opiniones individuales sin repercusión externa.',
      'Como "cosas", reconociendo sus cualidades de exterioridad, coercitividad y generalidad.',
      'Como construcciones netamente biológicas heredadas genéticamente.',
      'Como expresiones exclusivas del inconsciente freudiano.'
    ],
    correct: 1,
    explanation: 'Durkheim estipuló que los hechos sociales deben estudiarse con objetividad científica como "cosas", existiendo con anterioridad al individuo y ejerciendo presión sobre su conducta.'
  },
  {
    question: '4. ¿Qué tres grandes acontecimientos sociohistóricos propiciaron de manera determinante el surgimiento de la Sociología?',
    options: [
      'La caída del Imperio Romano, la peste negra y el Renacimiento.',
      'La Primera Guerra Mundial, la Revolución Rusa y la Guerra Fría.',
      'La Ilustración (racionalismo secular), la Revolución Francesa (quiebre del orden feudal) y la Revolución Industrial (capitalismo fabril y proletariado).',
      'El descubrimiento de América y las guerras religiosas del siglo XVII.'
    ],
    correct: 2,
    explanation: 'La confluencia del pensamiento racional ilustrado, la refundación política tras la Revolución Francesa y la profunda convulsión laboral y urbana de la Revolución Industrial crearon la imperiosa necesidad de una ciencia de la sociedad.'
  },
  {
    question: '5. Durante la Revolución Industrial, ¿cuál fue la principal transformación social que demandó una explicación científica sistemática?',
    options: [
      'El fortalecimiento exclusivo de los gremios agrícolas medievales.',
      'La polarización entre la burguesía (dueños de los medios de producción) y el proletariado (obreros asalariados), junto al éxodo rural masivo y el hacinamiento urbano.',
      'El retorno al trueque comunitario primitivo sin comercio.',
      'La pacificación absoluta del trabajo sin protestas obreras.'
    ],
    correct: 1,
    explanation: 'La mecanización fabril a vapor concentró a miles de trabajadores en las ciudades industriales bajo condiciones de precariedad y largas jornadas, originando tensiones de clase inéditas que la sociología se propuso estudiar.'
  },
  {
    question: '6. ¿Cuáles son los tres estados sucesivos del pensamiento según la Ley formulada por Auguste Comte?',
    options: [
      'Antiguo, Medieval y Contemporáneo.',
      'Teológico (fuerzas sobrenaturales), Metafísico (fuerzas abstractas) y Positivo (observación de leyes naturales).',
      'Primitivo, Esclavista y Capitalista.',
      'Mágico, Mítico y Psicológico.'
    ],
    correct: 1,
    explanation: 'La Ley de los Tres Estados de Comte describe la evolución del intelecto humano: primero buscando explicaciones en lo divino (teológico), luego en abstracciones metafísicas y finalmente en leyes científicas invariables (positivo).'
  },
  {
    question: '7. Para el Materialismo Histórico de Karl Marx y Friedrich Engels, ¿cuál es el motor que impulsa la transformación histórica?',
    options: [
      'El acuerdo voluntario y armonioso de todas las clases.',
      'La lucha de clases entre sectores antagónicos (como burguesía vs. proletariado) producto de contradicciones materiales.',
      'La predestinación divina y los valores teológicos compartidos.',
      'El simple azar biológico y la selección natural de Spencer.'
    ],
    correct: 1,
    explanation: 'En el Manifiesto Comunista, Marx afirma: "La historia de todas las sociedades hasta el día de hoy es la historia de las luchas de clases", originada por tensiones en los modos de producción.'
  },
  {
    question: '8. En el funcionalismo de Talcott Parsons, ¿qué representan las siglas del esquema AGIL?',
    options: [
      'Acción, Grupo, Institución y Liderazgo.',
      'Adaptación, Goal Attainment (Metas), Integración y Latencia (Mantenimiento de patrones).',
      'Autoridad, Gobierno, Industria y Legitimidad.',
      'Alienación, Ganancia, Interés y Lucro.'
    ],
    correct: 1,
    explanation: 'El modelo AGIL sintetiza los cuatro imperativos funcionales indispensables para que cualquier sistema social conserve su estabilidad y equilibrio.'
  },
  {
    question: '9. ¿Cuál es un ejemplo de "Acción Racional con Arreglo a Fines" según la tipología ideal de Max Weber?',
    options: [
      'Un estudiante que planifica un cronograma y estudia para maximizar su calificación mediante un cálculo riguroso de costo-beneficio.',
      'Una persona que reacciona furiosa propinando un golpe a una mesa por un impulso incontrolable.',
      'Un capitán que decide hundirse con su barco por estricto código de honor militar sin importar el costo.',
      'Persignarse antes de comer únicamente por una costumbre ancestral de la familia.'
    ],
    correct: 0,
    explanation: 'La acción racional con arreglo a fines se determina por expectativas sobre el comportamiento de objetos o personas, utilizando dichas expectativas como condiciones o medios para lograr metas racionalmente sopesadas.'
  }
];

function initQuiz() {
  const questionNumberEl = document.getElementById('quizQuestionNumber');
  const questionTextEl = document.getElementById('quizQuestionText');
  const optionsListEl = document.getElementById('quizOptionsList');
  const feedbackCardEl = document.getElementById('quizFeedbackCard');
  const nextBtn = document.getElementById('quizNextBtn');
  const progressBarEl = document.getElementById('quizProgressBar');
  const quizActiveView = document.getElementById('quizActiveView');
  const quizResultView = document.getElementById('quizResultView');
  const quizScoreEl = document.getElementById('quizScoreNumber');
  const quizFeedbackSummary = document.getElementById('quizFeedbackSummary');
  const quizRestartBtn = document.getElementById('quizRestartBtn');

  if (!questionTextEl) return;

  let currentQuestionIndex = 0;
  let score = 0;
  let answered = false;

  function loadQuestion(index) {
    answered = false;
    const q = quizQuestions[index];
    questionNumberEl.textContent = `Pregunta ${index + 1} de ${quizQuestions.length}`;
    questionTextEl.textContent = q.question;

    // Actualizar barra de progreso
    const progressPercent = ((index + 1) / quizQuestions.length) * 100;
    progressBarEl.style.width = `${progressPercent}%`;

    // Ocultar feedback y deshabilitar siguiente
    feedbackCardEl.className = 'quiz-feedback-card';
    feedbackCardEl.innerHTML = '';
    nextBtn.disabled = true;
    nextBtn.textContent = index === quizQuestions.length - 1 ? 'Finalizar Evaluación' : 'Siguiente Pregunta';

    // Opciones
    optionsListEl.innerHTML = q.options.map((opt, i) => `
      <button class="quiz-option-btn" data-index="${i}">
        <span>${opt}</span>
        <span class="option-icon"></span>
      </button>
    `).join('');

    const optionBtns = optionsListEl.querySelectorAll('.quiz-option-btn');
    optionBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        if (answered) return;
        answered = true;
        const selectedIndex = parseInt(btn.getAttribute('data-index'), 10);
        handleAnswer(selectedIndex, q, optionBtns);
      });
    });
  }

  function handleAnswer(selectedIdx, questionObj, optionBtns) {
    const isCorrect = selectedIdx === questionObj.correct;

    if (isCorrect) {
      score++;
      optionBtns[selectedIdx].classList.add('correct');
      feedbackCardEl.className = 'quiz-feedback-card show correct-feedback';
      feedbackCardEl.innerHTML = `<strong>¡Respuesta Correcta!</strong><br>${questionObj.explanation}`;
    } else {
      optionBtns[selectedIdx].classList.add('incorrect');
      optionBtns[questionObj.correct].classList.add('correct');
      feedbackCardEl.className = 'quiz-feedback-card show incorrect-feedback';
      feedbackCardEl.innerHTML = `<strong>Respuesta Incorrecta.</strong><br>${questionObj.explanation}`;
    }

    optionBtns.forEach(b => b.disabled = true);
    nextBtn.disabled = false;
  }

  nextBtn.addEventListener('click', () => {
    if (currentQuestionIndex < quizQuestions.length - 1) {
      currentQuestionIndex++;
      loadQuestion(currentQuestionIndex);
    } else {
      showResults();
    }
  });

  function showResults() {
    quizActiveView.style.display = 'none';
    quizResultView.style.display = 'block';

    const percentage = Math.round((score / quizQuestions.length) * 100);
    quizScoreEl.textContent = `${percentage}%`;

    let feedbackMsg = '';
    if (percentage >= 90) {
      feedbackMsg = '🏆 <strong>¡Desempeño Sobresaliente!</strong> Posees una comprensión profunda y rigurosa de los fundamentos epistemológicos, históricos y teóricos de la Sociología.';
    } else if (percentage >= 70) {
      feedbackMsg = '👏 <strong>¡Buen Desempeño!</strong> Demuestras un manejo sólido de los conceptos principales. Te sugerimos repasar los módulos en los que tuviste dudas para afianzar al 100% tu nota.';
    } else {
      feedbackMsg = '📖 <strong>Oportunidad de Refuerzo:</strong> Te recomendamos revisar con atención los Cuadros Comparativos, la Línea de Tiempo y los perfiles de los pensadores antes de volver a intentarlo.';
    }

    quizFeedbackSummary.innerHTML = `
      <p style="font-size: 1.1rem; margin-bottom: 0.5rem;">Acertaste <strong>${score}</strong> de <strong>${quizQuestions.length}</strong> preguntas evaluadas.</p>
      <div style="background: var(--bg-tertiary); padding: 1.25rem; border-radius: var(--radius-md); border: 1px solid var(--border-subtle); margin: 1rem 0;">
        ${feedbackMsg}
      </div>
    `;

    const celebrationGif = document.getElementById('quizCelebrationGif');
    if (celebrationGif) {
      if (percentage >= 70) {
        celebrationGif.style.display = 'block';
      } else {
        celebrationGif.style.display = 'none';
      }
    }
  }

  if (quizRestartBtn) {
    quizRestartBtn.addEventListener('click', () => {
      score = 0;
      currentQuestionIndex = 0;
      quizResultView.style.display = 'none';
      const celebrationGif = document.getElementById('quizCelebrationGif');
      if (celebrationGif) celebrationGif.style.display = 'none';
      quizActiveView.style.display = 'block';
      loadQuestion(0);
    });
  }

  // Carga de la primera pregunta
  loadQuestion(0);
}
