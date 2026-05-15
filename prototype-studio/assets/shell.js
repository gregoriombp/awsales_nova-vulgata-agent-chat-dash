/* prototype-studio · shell.js
 * Renderiza o shell compartilhado (banner protótipo + sidebar + topbar)
 * em todos os protótipos. Mantém estado de colapso da sidebar em localStorage.
 *
 * Uso no HTML do protótipo:
 *
 *   <body>
 *     <div id="proto-shell"
 *          data-active="integracoes"
 *          data-org="Fyntra Tecnologia"
 *          data-org-logo="F"
 *          data-user="Guilherme Graham"
 *          data-user-initials="PG"
 *          data-user-role="Administrador"
 *          data-breadcrumb="Fontes / Integrações">
 *     </div>
 *     <main class="page-content"> ... conteúdo aqui ... </main>
 *     <script src="../assets/shell.js"></script>
 *   </body>
 *
 * Slugs aceitos em data-active: dashboard, insights,
 * agent-studio, aprovacoes, disparos, memory-base, aops, library,
 * tools, canais, integracoes, conversations, playground, history, settings.
 */

(function () {
  const SHELL_STORAGE_KEY = 'prototype-studio.sidebar.collapsed';

  // Nav igual à do app real (Greg) — components/Sidebar.tsx
  // `comingSoon: true` => item aparece cinza, não-clicável (protótipo ainda não pronto).
  const NAV = [
    {
      items: [
        { slug: 'dashboard', label: 'Dashboard',     icon: '📊', href: '#', comingSoon: true },
        { slug: 'insights',  label: 'Insights',      icon: '⚡', href: '#', comingSoon: true },
      ]
    },
    {
      label: 'Agentes',
      items: [
        { slug: 'agent-studio', label: 'Agent studio', icon: '🤖', href: '#', comingSoon: true },
        { slug: 'aprovacoes',   label: 'Aprovações',   icon: '✅', href: '#', comingSoon: true },
        { slug: 'disparos',     label: 'Disparos',     icon: '📤', href: '#', comingSoon: true },
      ]
    },
    {
      label: 'Fontes',
      items: [
        { slug: 'memory-base', label: 'Memory base', icon: '🧠', href: '#', comingSoon: true },
        { slug: 'aops',        label: 'AOPs',        icon: '📋', href: '#', comingSoon: true },
        { slug: 'library',     label: 'Biblioteca',  icon: '📚', href: '#', comingSoon: true },
        { slug: 'canais',      label: 'Canais',      icon: '🗣',  href: 'canais.html' },
        { slug: 'integracoes', label: 'Integrações', icon: '🔌', href: 'integracoes.html' },
        { slug: 'tools',       label: 'Habilidades', icon: '🔧', href: 'habilidades.html' },
      ]
    },
    {
      label: 'Acompanhamento',
      items: [
        { slug: 'conversations', label: 'Conversas',     icon: '💬', href: '#', comingSoon: true },
        { slug: 'playground',    label: 'Playground',    icon: '🛝', href: '#', comingSoon: true },
        { slug: 'history',       label: 'Histórico',     icon: '🕓', href: '#', comingSoon: true },
      ]
    },
    {
      items: [
        { slug: 'settings', label: 'Configurações', icon: '⚙', href: 'team-funcoes-config.html' },
      ]
    },
  ];

  // Demo screens — lista de protótipo→href usada pelo demo-nav (jumping fora-de-produto)
  const DEMO_SCREENS = [
    { group: 'Fontes',     label: '🗣 Canais',         href: 'canais.html' },
    { group: 'Fontes',     label: '🔌 Integrações',   href: 'integracoes.html' },
    { group: 'Fontes',     label: '🔧 Habilidades',   href: 'habilidades.html' },
    { group: 'Settings',   label: '👥 Team & Funções', href: 'team-funcoes-config.html' },
    { group: 'Settings',   label: '💰 Financeiro',     href: 'financeiro.html' },
    { group: 'Onboarding', label: '🚀 Primeiro acesso', href: 'primeiro-login.html' },
    { group: 'Index',      label: '🏛 Studio · Home',  href: '../index.html' },
  ];

  function renderShell() {
    const mount = document.getElementById('proto-shell');
    if (!mount) {
      console.warn('[shell.js] elemento #proto-shell não encontrado — shell não renderizado.');
      return;
    }

    const layout = mount.dataset.layout || 'full'; // 'full' | 'centered'
    const active = mount.dataset.active || '';
    const org = mount.dataset.org || 'Fyntra Tecnologia';
    const orgLogo = mount.dataset.orgLogo || org.charAt(0).toUpperCase();
    const userName = mount.dataset.user || 'Guilherme Graham';
    const userInitials = mount.dataset.userInitials || 'PG';
    const userRole = mount.dataset.userRole || 'Administrador';
    const breadcrumb = mount.dataset.breadcrumb || '';

    // Banner topo + demo nav
    const banner = `<div class="proto-banner" aria-label="Indicador de protótipo"></div>`;
    const demoNav = `
      <nav class="demo-nav" id="demoNav" aria-label="Navegação entre telas do protótipo">
        ${renderDemoNav()}
      </nav>
    `;

    // Sidebar
    const sidebar = `
      <aside class="sidebar" aria-label="Navegação principal do Studio">
        <button class="sidebar-collapse-btn" id="sidebarToggle" title="Recolher/expandir sidebar" aria-label="Recolher sidebar">‹</button>

        <div class="sidebar-org" title="Trocar organização">
          <div class="logo">${escapeHtml(orgLogo)}</div>
          <div class="label">
            <div class="name">${escapeHtml(org)}</div>
            <div class="subtitle">Organização</div>
          </div>
          <span class="chevron">▾</span>
        </div>

        ${NAV.map(section => `
          <div class="sidebar-section">
            ${section.label ? `<div class="sidebar-section-label">${section.label}</div>` : ''}
            ${section.items.map(item => {
              const activeCls = item.slug === active ? 'active' : '';
              const csCls = item.comingSoon ? 'coming-soon' : '';
              const titleAttr = item.comingSoon
                ? `${item.label} · em construção`
                : item.label;
              if (item.comingSoon) {
                return `
                  <span class="sidebar-item ${csCls}" data-slug="${item.slug}" title="${titleAttr}" aria-disabled="true">
                    <span class="icon" aria-hidden="true">${item.icon}</span>
                    <span class="label">${item.label}</span>
                    <span class="soon-badge">em breve</span>
                  </span>
                `;
              }
              return `
                <a class="sidebar-item ${activeCls}" href="${item.href}" data-slug="${item.slug}" title="${titleAttr}">
                  <span class="icon" aria-hidden="true">${item.icon}</span>
                  <span class="label">${item.label}</span>
                  ${item.count ? `<span class="count">${item.count}</span>` : ''}
                </a>
              `;
            }).join('')}
          </div>
        `).join('')}

        <div class="sidebar-user-wrap">
          <button type="button" class="sidebar-user" id="sidebarUserBtn" title="Abrir menu da conta" aria-haspopup="menu" aria-expanded="false">
            <span class="avatar">${escapeHtml(userInitials)}</span>
            <span class="info">
              <span class="name">${escapeHtml(userName)}</span>
              <span class="role">${escapeHtml(userRole)}</span>
            </span>
            <span class="chevron">▾</span>
          </button>
          <div class="sidebar-user-menu" id="sidebarUserMenu" role="menu" hidden>
            <button type="button" role="menuitem" data-action="profile" class="user-menu-item">
              <span class="icon" aria-hidden="true">👤</span>
              <span>Meu perfil</span>
            </button>
            <button type="button" role="menuitem" data-action="switch-org" class="user-menu-item">
              <span class="icon" aria-hidden="true">🔁</span>
              <span>Trocar organização</span>
            </button>
            <button type="button" role="menuitem" data-action="settings" class="user-menu-item">
              <span class="icon" aria-hidden="true">⚙</span>
              <span>Configurações</span>
            </button>
            <div class="user-menu-divider"></div>
            <button type="button" role="menuitem" data-action="logout" class="user-menu-item danger">
              <span class="icon" aria-hidden="true">🚪</span>
              <span>Sair</span>
            </button>
          </div>
        </div>
      </aside>
    `;

    // Topbar
    const topbar = `
      <header class="topbar">
        <div class="breadcrumb" id="breadcrumb">${breadcrumb || '<span class="muted">—</span>'}</div>
        <div class="actions">
          <button class="icon-btn" title="Buscar (Cmd+K)" aria-label="Buscar">🔍</button>
          <button class="icon-btn badge" title="Notificações" aria-label="Notificações">🔔</button>
          <button class="icon-btn" title="Ajuda" aria-label="Ajuda">❓</button>
        </div>
      </header>
    `;

    // Captura conteúdo existente como NODE (não string) pra preservar event listeners
    // que o script inline da página já colou antes do shell rodar.
    const contentNode = takeExistingContentNode();

    // Layout centrado (signup / onboarding antes do produto) — sem sidebar nem topbar
    if (layout === 'centered') {
      mount.outerHTML = `
        ${banner}
        ${demoNav}
        <div class="app-shell centered" id="appShell">
          <main class="main centered">
            <div class="page-content" id="pageContent"></div>
          </main>
        </div>
      `;
      injectContentNode(contentNode);
      return;
    }

    // Layout full (produto autenticado)
    mount.outerHTML = `
      ${banner}
      ${demoNav}
      <div class="app-shell" id="appShell">
        ${sidebar}
        <main class="main">
          ${topbar}
          <div class="page-content" id="pageContent"></div>
        </main>
      </div>
    `;
    injectContentNode(contentNode);

    // Restaura estado de colapso
    if (localStorage.getItem(SHELL_STORAGE_KEY) === '1') {
      document.getElementById('appShell').classList.add('sidebar-collapsed');
      document.getElementById('sidebarToggle').textContent = '›';
    }

    // Wire toggle + menu de perfil
    document.getElementById('sidebarToggle').addEventListener('click', toggleSidebar);
    wireUserMenu();
  }

  function wireUserMenu() {
    const btn = document.getElementById('sidebarUserBtn');
    const menu = document.getElementById('sidebarUserMenu');
    if (!btn || !menu) return;

    function openMenu() {
      menu.hidden = false;
      btn.setAttribute('aria-expanded', 'true');
      setTimeout(() => document.addEventListener('click', outsideClick), 0);
      document.addEventListener('keydown', escClose);
    }
    function closeMenu() {
      menu.hidden = true;
      btn.setAttribute('aria-expanded', 'false');
      document.removeEventListener('click', outsideClick);
      document.removeEventListener('keydown', escClose);
    }
    function outsideClick(e) {
      if (!menu.contains(e.target) && !btn.contains(e.target)) closeMenu();
    }
    function escClose(e) {
      if (e.key === 'Escape') closeMenu();
    }

    btn.addEventListener('click', e => {
      e.stopPropagation();
      if (menu.hidden) openMenu();
      else closeMenu();
    });

    menu.addEventListener('click', e => {
      const item = e.target.closest('[data-action]');
      if (!item) return;
      closeMenu();
      handleUserMenuAction(item.dataset.action);
    });
  }

  function handleUserMenuAction(action) {
    switch (action) {
      case 'profile':
        // Stub — protótipo não tem tela de "Meu perfil" ainda
        alert('"Meu perfil" — protótipo ainda não tem essa tela.');
        return;
      case 'switch-org':
        alert('Seletor de organização — protótipo ainda não tem essa tela.\nPor enquanto a org é fixa (Fyntra Tecnologia).');
        return;
      case 'settings':
        window.location.href = 'team-funcoes-config.html';
        return;
      case 'logout':
        logoutUser();
        return;
    }
  }

  function logoutUser() {
    if (!confirm('Sair da sua conta?\n\nVocê será desconectado e levado pra tela de acesso.')) return;
    // Limpa o que é específico de sessão (não apaga toda a memória do protótipo —
    // canais conectados, integrações etc. ficam pra próxima sessão simular continuidade).
    try {
      localStorage.removeItem(SHELL_STORAGE_KEY);
      sessionStorage.clear();
    } catch (e) { /* ignore */ }
    // Redireciona pra fluxo de primeiro acesso (não temos tela de login separada — w1-a serve como porta).
    window.location.href = 'primeiro-login.html#w1-a';
  }

  function renderDemoNav() {
    let html = '';
    let currentGroup = '';
    DEMO_SCREENS.forEach(s => {
      if (s.group !== currentGroup) {
        html += `<span class="group-label">${s.group}</span>`;
        currentGroup = s.group;
      }
      const isActive = location.pathname.endsWith(s.href.split('#')[0]) && s.href !== '../index.html';
      html += `<button onclick="window.location.href='${s.href}'" class="${isActive ? 'active' : ''}">${s.label}</button>`;
    });
    return html;
  }

  function takeExistingContentNode() {
    // Pega o conteúdo do <main class="page-content"> ou <div id="content"> como
    // DocumentFragment (move os nós reais — preserva event listeners colados via JS).
    const existingMain = document.querySelector('main.page-content, #content, .page-content');
    const fragment = document.createDocumentFragment();
    if (existingMain) {
      while (existingMain.firstChild) fragment.appendChild(existingMain.firstChild);
      existingMain.remove();
      return fragment;
    }
    const placeholder = document.createElement('p');
    placeholder.className = 'muted center';
    placeholder.innerHTML = 'Conteúdo do protótipo vem aqui (envolva em <code>&lt;main class="page-content"&gt;</code> antes do shell).';
    fragment.appendChild(placeholder);
    return fragment;
  }

  function injectContentNode(fragment) {
    const target = document.getElementById('pageContent');
    if (target && fragment) target.appendChild(fragment);
  }

  function toggleSidebar() {
    const shell = document.getElementById('appShell');
    const btn = document.getElementById('sidebarToggle');
    shell.classList.toggle('sidebar-collapsed');
    const collapsed = shell.classList.contains('sidebar-collapsed');
    localStorage.setItem(SHELL_STORAGE_KEY, collapsed ? '1' : '0');
    btn.textContent = collapsed ? '›' : '‹';
    btn.setAttribute('aria-label', collapsed ? 'Expandir sidebar' : 'Recolher sidebar');
  }

  function escapeHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;' }[c]));
  }

  // Esc fecha modal global
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-mask.show').forEach(m => m.classList.remove('show'));
    }
  });

  // Boot
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderShell);
  } else {
    renderShell();
  }
})();
