/* ==========================================================================
   APEX MOTORS — núcleo compartilhado (layout, garagem, cards, busca)
   ========================================================================== */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];

/* ---------- Ícones (traço 1.75, estilo Lucide) ---------- */
const sv = (d, extra = "") => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" ${extra}>${d}</svg>`;
const ICONS = {
  search: sv('<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>'),
  garage: sv('<path d="M3 21V9l9-6 9 6v12"/><path d="M7 21v-8h10v8"/><path d="M7 16h10"/>'),
  heart: sv('<path d="M19.5 12.6 12 20l-7.5-7.4A4.9 4.9 0 0 1 12 6.1a4.9 4.9 0 0 1 7.5 6.5Z"/>'),
  heartFill: sv('<path fill="currentColor" d="M19.5 12.6 12 20l-7.5-7.4A4.9 4.9 0 0 1 12 6.1a4.9 4.9 0 0 1 7.5 6.5Z"/>'),
  arrowR: sv('<path d="M5 12h14M13 6l6 6-6 6"/>'),
  arrowL: sv('<path d="M19 12H5M11 6l-6 6 6 6"/>'),
  arrowUR: sv('<path d="M7 17 17 7M8 7h9v9"/>'),
  close: sv('<path d="M18 6 6 18M6 6l12 12"/>'),
  menu: sv('<path d="M4 7h16M4 12h16M4 17h10"/>'),
  check: sv('<path d="m5 12 5 5L20 7"/>'),
  checkCircle: sv('<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>'),
  shield: sv('<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/><path d="m9 12 2 2 4-4"/>'),
  card: sv('<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h4"/>'),
  swap: sv('<path d="M7 4 3 8l4 4"/><path d="M3 8h13a4 4 0 0 1 4 4"/><path d="m17 20 4-4-4-4"/><path d="M21 16H8a4 4 0 0 1-4-4"/>'),
  truck: sv('<path d="M3 6h11v10H3zM14 10h4l3 3v3h-7"/><circle cx="7" cy="17.5" r="1.8"/><circle cx="17" cy="17.5" r="1.8"/>'),
  award: sv('<circle cx="12" cy="9" r="6"/><path d="m8.5 14-1.5 7 5-3 5 3-1.5-7"/>'),
  pin: sv('<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21Z"/><circle cx="12" cy="9.5" r="2.5"/>'),
  clock: sv('<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'),
  phone: sv('<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>'),
  mail: sv('<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>'),
  play: sv('<path fill="currentColor" stroke="none" d="M7 4.5v15l13-7.5z"/>'),
  eye: sv('<path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>'),
  filter: sv('<path d="M4 6h16M7 12h10M10 18h4"/>'),
  trash: sv('<path d="M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13"/>'),
  calendar: sv('<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>'),
  car: sv('<path d="M5 16H3v-4l2-5h11l3 5h2v4h-2"/><circle cx="7.5" cy="16.5" r="2"/><circle cx="16.5" cy="16.5" r="2"/><path d="M9.5 16.5h5M5 12h14"/>'),
  key: sv('<circle cx="7.5" cy="15.5" r="4"/><path d="m10.5 12.5 9-9M16 6l3 3M14 8l2 2"/>'),
  bolt: sv('<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>'),
  gauge: sv('<path d="M12 14l4-4"/><path d="M3.3 17a9 9 0 1 1 17.4 0"/>'),
  video: sv('<rect x="2" y="5" width="14" height="14" rx="2"/><path d="m16 10 6-3v10l-6-3"/>'),
  image: sv('<rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="10" r="2"/><path d="m21 16-5-5-9 9"/>'),
  user: sv('<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>'),
  lock: sv('<rect x="4" y="11" width="16" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>'),
  nav: sv('<path d="m3 11 18-8-8 18-2-8z"/>'),
  share: sv('<circle cx="18" cy="5" r="2.5"/><circle cx="6" cy="12" r="2.5"/><circle cx="18" cy="19" r="2.5"/><path d="m8.2 10.8 7.6-4.5M8.2 13.2l7.6 4.5"/>'),
  compare: sv('<rect x="3" y="4" width="7" height="16" rx="1.5"/><rect x="14" y="4" width="7" height="16" rx="1.5"/>'),
  doc: sv('<path d="M14 3H6v18h12V7z"/><path d="M14 3v4h4M9 13h6M9 17h6"/>'),
  whatsapp: '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.1-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5c.1-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5.7.3 1.3.5 1.7.6.7.2 1.4.2 1.9.1.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.1-.3-.2-.6-.3M12 21.8c-1.8 0-3.5-.5-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 0 1 12 2.2a9.8 9.8 0 0 1 9.8 9.8c0 5.4-4.4 9.8-9.8 9.8M20.5 3.5A11.8 11.8 0 0 0 1.9 17.7L.2 24l6.4-1.7A11.8 11.8 0 0 0 23.8 12c0-3.2-1.2-6.1-3.3-8.5"/></svg>',
  instagram: sv('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/>'),
  youtube: sv('<rect x="2" y="5" width="20" height="14" rx="4"/><path fill="currentColor" stroke="none" d="m10 9 5 3-5 3z"/>'),
  tiktok: sv('<path d="M15 3c.4 2.6 2 4 4.5 4.2v3.2a8 8 0 0 1-4.5-1.4v6.3A5.7 5.7 0 1 1 9.3 9.6v3.3a2.5 2.5 0 1 0 2.5 2.5V3z"/>'),
};

/* Monograma da logo (o "A" da Apex), vetorizado para ficar nítido em qualquer tamanho */
const LOGO_MARK = `<svg class="logo-mark" viewBox="0 0 320 285" fill="currentColor" aria-hidden="true"><path d="M161 0 223 113 203 127 162 60 65 250 238 135 320 285 277 285 215 183 65 285 0 285Z"/></svg>`;
const LOGO = `<a href="index.html" class="logo" aria-label="Apex Motors — página inicial">${LOGO_MARK}<span class="logo-type"><b>APEX</b><span>MOTORS</span></span></a>`;

/* ---------- Formatação ---------- */
const fmtBRL = (n) => n.toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const fmtNum = (n) => n.toLocaleString("pt-BR");
const fmtKm = (n) => (n === 0 ? "0 km" : `${fmtNum(n)} km`);
const fmtSec = (n) => `${n.toFixed(1).replace(".", ",")} s`;
const fmtPriceShort = (n) => (n >= 1e6 ? `R$ ${(n / 1e6).toFixed(2).replace(".", ",").replace(/,?0+$/, "")} mi` : `R$ ${Math.round(n / 1000)} mil`);

const carImg = (c) => `assets/img/cars/${c.id}.webp`;
const carThumb = (c) => `assets/img/cars/${c.id}-sm.webp`;
const carName = (c) => `${c.marca} ${c.modelo}`;
const carById = (id) => CARS.find((c) => c.id === id);
const catById = (id) => CATEGORIES.find((c) => c.id === id);
const carUrl = (c) => `carro.html?id=${c.id}`;

/* Tabela Price */
function parcela(valor, entradaPct = STORE.financiamento.entradaPadrao, meses = STORE.financiamento.prazoPadrao, taxa = STORE.financiamento.taxaMensal) {
  const pv = valor * (1 - entradaPct / 100);
  const i = taxa / 100;
  return pv * i / (1 - Math.pow(1 + i, -meses));
}

const waLink = (msg) => `https://wa.me/${STORE.whatsapp}?text=${encodeURIComponent(msg)}`;
const igLink = () => `https://instagram.com/${STORE.instagram}`;

/* ---------- Armazenamento seguro ---------- */
const store = {
  get(k, def) { try { const v = localStorage.getItem(k); return v ? JSON.parse(v) : def; } catch { return def; } },
  set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* modo privado */ } },
};

/* ---------- Minha Garagem (favoritos) ---------- */
const Garage = {
  key: "apex:garage",
  list() { return store.get(this.key, []).filter((id) => carById(id)); },
  has(id) { return this.list().includes(id); },
  toggle(id) {
    const l = this.list();
    const on = !l.includes(id);
    store.set(this.key, on ? [...l, id] : l.filter((x) => x !== id));
    document.dispatchEvent(new CustomEvent("garage:change"));
    toast(on ? "Adicionado à Minha Garagem" : "Removido da garagem", on ? ICONS.check : ICONS.trash);
    return on;
  },
  clear() { store.set(this.key, []); document.dispatchEvent(new CustomEvent("garage:change")); },
};

/* ---------- Card de carro ---------- */
function carCard(c) {
  const fav = Garage.has(c.id);
  const tags = [];
  if (c.status === "reservado") tags.push('<span class="tag tag-res">Reservado</span>');
  else if (c.tags.includes("novidade")) tags.push('<span class="tag tag-new">Novidade</span>');
  return `
  <article class="car-card">
    <div class="car-media">
      <img src="${carThumb(c)}" alt="${carName(c)} ${c.versao}" loading="lazy" decoding="async" width="640" height="400">
      ${tags.length ? `<div class="car-tags">${tags.join("")}</div>` : ""}
      <button class="fav-btn ${fav ? "on" : ""}" data-fav="${c.id}" aria-label="${fav ? "Remover da" : "Salvar na"} Minha Garagem" aria-pressed="${fav}">${fav ? ICONS.heartFill : ICONS.heart}</button>
      <div class="car-specs-overlay"><span><b>${c.cv}</b> cv</span><span>0-100 <b>${fmtSec(c.zeroCem)}</b></span></div>
    </div>
    <div class="car-body">
      <span class="car-brand">${c.marca}</span>
      <h3 class="car-title">${c.modelo}</h3>
      <span class="car-version">${c.versao}</span>
      <div class="car-meta">
        <span class="chip">${c.ano}</span>
        <span class="chip">${fmtKm(c.km)}</span>
        <span class="chip">${FILTER_LABELS.cambio[c.cambio].split(" /")[0]}</span>
      </div>
      <div class="car-foot">
        <div class="car-price">
          <small>${c.status === "reservado" ? "RESERVADO" : "À VISTA"}</small>
          <b>${fmtBRL(c.preco)}</b>
          <div class="inst">ou ${STORE.financiamento.prazoPadrao}x ${fmtBRL(parcela(c.preco))}</div>
        </div>
        <span class="car-go">${ICONS.arrowUR}</span>
      </div>
    </div>
    <a class="stretch" href="${carUrl(c)}" aria-label="Ver ${carName(c)}"></a>
  </article>`;
}

/* Delegação global: botões de favoritar em qualquer lugar */
document.addEventListener("click", (e) => {
  const b = e.target.closest("[data-fav]");
  if (!b) return;
  e.preventDefault();
  e.stopPropagation();
  Garage.toggle(b.dataset.fav);
});
document.addEventListener("garage:change", () => {
  $$("[data-fav]").forEach((b) => {
    const on = Garage.has(b.dataset.fav);
    b.classList.toggle("on", on);
    b.setAttribute("aria-pressed", on);
    if (b.classList.contains("fav-btn")) b.innerHTML = on ? ICONS.heartFill : ICONS.heart;
    else if (b.dataset.label !== undefined) b.innerHTML = `${on ? ICONS.heartFill : ICONS.heart} ${on ? "Na sua garagem" : "Salvar na garagem"}`;
  });
  renderGarage();
});

/* ---------- Toast ---------- */
let toastTimer;
function toast(msg, icon = ICONS.check) {
  let t = $(".toast");
  if (!t) { t = document.createElement("div"); t.className = "toast"; t.setAttribute("role", "status"); document.body.appendChild(t); }
  t.innerHTML = `${icon}<span>${msg}</span>`;
  requestAnimationFrame(() => t.classList.add("show"));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2400);
}

/* Status da loja no fuso de Manaus (UTC-4): aberto/fechado em tempo real */
const HOURS = { 0: null, 1: [9, 19], 2: [9, 19], 3: [9, 19], 4: [9, 19], 5: [9, 19], 6: [9, 15] };
const DAY_NAMES = ["domingo", "segunda", "terça", "quarta", "quinta", "sexta", "sábado"];
function storeStatus() {
  const now = new Date(Date.now() - 4 * 3600e3);
  const d = now.getUTCDay();
  const h = now.getUTCHours() + now.getUTCMinutes() / 60;
  const today = HOURS[d];
  if (today && h >= today[0] && h < today[1]) return { open: true, label: `Aberto agora · fecha às ${today[1]}h` };
  for (let i = 0; i < 7; i++) {
    const nd = (d + i) % 7;
    const hrs = HOURS[nd];
    if (!hrs || (i === 0 && h >= hrs[0])) continue;
    return { open: false, label: `Fechado · abre ${i === 0 ? "hoje" : i === 1 ? "amanhã" : DAY_NAMES[nd]} às ${hrs[0]}h` };
  }
  return { open: false, label: "Fechado" };
}

/* ==========================================================================
   LAYOUT (header, navegação, garagem, footer, WhatsApp flutuante)
   ========================================================================== */
function renderLayout() {
  const page = document.body.dataset.page;
  const params = new URLSearchParams(location.search);
  const activeCat = params.get("cat");

  const header = `
  <div class="topbar">
    <div class="container">
      <div class="topbar-left">
        <span class="${storeStatus().open ? "" : "closed"}"><i class="dot"></i>${storeStatus().label}</span>
        <span class="hide-sm">${STORE.endereco}, ${STORE.cidade}</span>
      </div>
      <div class="topbar-right">
        <a href="tel:${STORE.telefone.replace(/\D/g, "")}">${STORE.telefone}</a>
        <a href="${igLink()}" target="_blank" rel="noopener">@${STORE.instagram}</a>
      </div>
    </div>
  </div>
  <div class="header-main">
    <div class="container">
      <div class="header-brand">
        <button class="icon-btn menu-toggle" data-open="menu" aria-label="Abrir menu">${ICONS.menu}</button>
        ${LOGO}
      </div>
      <form class="search" role="search" action="estoque.html" autocomplete="off">
        <label class="search-field">
          ${ICONS.search}
          <span class="sr-only">Buscar veículos</span>
          <input type="search" name="q" placeholder="Buscar por marca, modelo ou categoria…" value="${page === "estoque" ? (params.get("q") || "").replace(/"/g, "") : ""}">
          <kbd>/</kbd>
        </label>
        <div class="search-results" role="listbox"></div>
      </form>
      <div class="header-actions">
        <button class="icon-btn" data-open="garage" aria-label="Minha Garagem">
          ${ICONS.garage}
          <span class="lbl">Minha Garagem<small>Carros salvos</small></span>
          <span class="badge" data-garage-count></span>
        </button>
        <a class="btn btn-wa header-wa" href="${waLink("Olá, Apex Motors! Vim pelo site e gostaria de atendimento.")}" target="_blank" rel="noopener">${ICONS.whatsapp}<span>WhatsApp</span></a>
      </div>
    </div>
  </div>
  <nav class="nav-cats" aria-label="Categorias">
    <div class="container">
      <a href="estoque.html" class="${page === "estoque" && !activeCat ? "active hl" : "hl"}">Estoque completo</a>
      <span class="sep"></span>
      ${CATEGORIES.map((c) => `<a href="estoque.html?cat=${c.id}" class="${activeCat === c.id ? "active" : ""}" title="${c.nome}"><span class="nav-full">${c.curto === "Muscle" ? "American Muscle" : c.curto === "Super" ? "Super Esportivos" : c.curto === "Elétricos" ? "Electric Performance" : c.curto}</span><span class="nav-short">${c.curto}</span></a>`).join("")}
      <span class="sep"></span>
      <a href="proposta.html?intencao=avaliar">Avalie seu carro</a>
      <a href="index.html#visite">A loja</a>
    </div>
  </nav>`;

  const hdr = document.createElement("header");
  hdr.className = "site-header";
  hdr.innerHTML = header;
  document.body.prepend(hdr);

  // Drawers
  const overlay = document.createElement("div");
  overlay.innerHTML = `
  <div class="scrim" data-close></div>
  <aside class="drawer" id="garage" aria-label="Minha Garagem" aria-hidden="true">
    <div class="drawer-head">
      <div><h3>Minha Garagem</h3><p>Seus carros salvos para comparar e negociar.</p></div>
      <button class="close-btn" data-close aria-label="Fechar">${ICONS.close}</button>
    </div>
    <div class="drawer-body" data-garage-list></div>
    <div class="drawer-foot" data-garage-foot></div>
  </aside>
  <aside class="drawer left" id="menu" aria-label="Menu" aria-hidden="true">
    <div class="drawer-head">${LOGO}<button class="close-btn" data-close aria-label="Fechar">${ICONS.close}</button></div>
    <div class="drawer-body mobile-nav">
      <a href="estoque.html">Estoque completo <small>${CARS.length}</small></a>
      ${CATEGORIES.map((c) => `<a href="estoque.html?cat=${c.id}">${c.nome} <small>${CARS.filter((x) => x.cat === c.id).length}</small></a>`).join("")}
      <a href="comparar.html">Comparar carros ${ICONS.arrowR}</a>
      <a href="proposta.html?intencao=avaliar">Avalie seu carro ${ICONS.arrowR}</a>
      <a href="index.html#visite">Visite a loja ${ICONS.arrowR}</a>
    </div>
    <div class="drawer-foot">
      <a class="btn btn-wa btn-block" href="${waLink("Olá, Apex Motors! Vim pelo site e gostaria de atendimento.")}" target="_blank" rel="noopener">${ICONS.whatsapp} Falar no WhatsApp</a>
    </div>
  </aside>
  <a class="wa-float" href="${waLink("Olá, Apex Motors! Vim pelo site e gostaria de atendimento.")}" target="_blank" rel="noopener" aria-label="Falar no WhatsApp">${ICONS.whatsapp}<span>Fale conosco</span></a>`;
  document.body.append(...overlay.children);

  // Footer
  const ftr = document.createElement("footer");
  ftr.className = "site-footer";
  ftr.innerHTML = `
  <div class="container">
    <div class="footer-grid">
      <div class="footer-brand">
        ${LOGO}
        <p>Curadoria de esportivos, superesportivos e SUVs de alta performance em Manaus. Todos os carros com laudo cautelar e procedência verificada.</p>
        <div class="socials">
          <a href="${igLink()}" target="_blank" rel="noopener" aria-label="Instagram">${ICONS.instagram}</a>
          <a href="${waLink("Olá, Apex Motors!")}" target="_blank" rel="noopener" aria-label="WhatsApp">${ICONS.whatsapp}</a>
        </div>
      </div>
      <div>
        <h4>Categorias</h4>
        <ul>${CATEGORIES.map((c) => `<li><a href="estoque.html?cat=${c.id}">${c.nome}</a></li>`).join("")}</ul>
      </div>
      <div>
        <h4>Serviços</h4>
        <ul>
          <li><a href="estoque.html">Estoque completo</a></li>
          <li><a href="proposta.html?intencao=avaliar">Avaliação para troca</a></li>
          <li><a href="proposta.html?intencao=comprar">Financiamento</a></li>
          <li><a href="proposta.html?intencao=test-drive">Agendar test drive</a></li>
          <li><a href="comparar.html">Comparar carros</a></li>
          <li><a href="#" data-open="garage">Minha Garagem</a></li>
        </ul>
      </div>
      <div>
        <h4>Contato</h4>
        <ul>
          <li><a href="https://www.google.com/maps/dir/?api=1&destination=${STORE.lat},${STORE.lng}" target="_blank" rel="noopener">${STORE.endereco}<br>${STORE.cidade} · ${STORE.cep}</a></li>
          <li><a href="tel:${STORE.telefone.replace(/\D/g, "")}">${STORE.telefone}</a></li>
          <li><a href="${waLink("Olá, Apex Motors!")}" target="_blank" rel="noopener">WhatsApp ${STORE.whatsappLabel}</a></li>
          <li><a href="mailto:${STORE.email}">${STORE.email}</a></li>
        </ul>
      </div>
    </div>
    <div class="footer-bottom">
      <span>© ${new Date().getFullYear()} Apex Motors · CNPJ ${STORE.cnpj} · Preços e condições sujeitos a alteração sem aviso. · <a href="privacidade.html">Política de Privacidade</a></span>
      <span>Fotos dos veículos: <a href="https://commons.wikimedia.org" target="_blank" rel="noopener">Wikimedia Commons</a> (CC). Projeto demonstrativo.</span>
    </div>
  </div>`;
  document.body.append(ftr);

  // Abrir/fechar drawers
  const open = (id) => {
    $(".scrim").classList.add("open");
    const d = $("#" + id);
    d.classList.add("open");
    d.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
    lastFocus = document.activeElement;
    setTimeout(() => $(".close-btn", d)?.focus({ preventScroll: true }), 50);
  };
  const close = () => {
    const opened = $$(".drawer.open, .filters.open");
    if (!opened.length) return;
    opened.forEach((d) => { d.classList.remove("open"); d.setAttribute("aria-hidden", "true"); });
    $(".scrim").classList.remove("open");
    document.body.style.overflow = "";
    lastFocus?.focus?.({ preventScroll: true });
  };
  let lastFocus = null;
  window.ApexUI = { open, close };
  document.addEventListener("click", (e) => {
    const o = e.target.closest("[data-open]");
    if (o) { e.preventDefault(); open(o.dataset.open); return; }
    if (e.target.closest("[data-close]")) close();
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") close(); });

  renderGarage();
  initSearch();
  initCookies();
}

/* ---------- Dados estruturados (schema.org) ---------- */
function addJsonLd(obj) {
  const s = document.createElement("script");
  s.type = "application/ld+json";
  s.textContent = JSON.stringify(obj);
  document.head.appendChild(s);
}

/* ---------- Aviso de cookies (LGPD) ---------- */
function initCookies() {
  if (store.get("apex:cookies", false)) return;
  const bar = document.createElement("div");
  bar.className = "cookie-bar";
  bar.setAttribute("role", "region");
  bar.setAttribute("aria-label", "Aviso de cookies");
  bar.innerHTML = `<p>Usamos cookies essenciais e de medição para melhorar sua experiência. Saiba mais na <a class="u-link" href="privacidade.html">Política de Privacidade</a>.</p><button class="btn btn-primary btn-sm">Entendi</button>`;
  $("button", bar).addEventListener("click", () => { store.set("apex:cookies", true); bar.remove(); });
  document.body.appendChild(bar);
}

/* ---------- Compartilhar (Web Share API ou copiar link) ---------- */
async function shareLink(title, url = location.href) {
  if (navigator.share) {
    try { await navigator.share({ title, url }); } catch { /* cancelado */ }
    return;
  }
  try { await navigator.clipboard.writeText(url); toast("Link copiado"); }
  catch { prompt("Copie o link:", url); }
}

function renderGarage() {
  const ids = Garage.list();
  $$("[data-garage-count]").forEach((b) => { b.textContent = ids.length || ""; b.dataset.n = ids.length; });
  const list = $("[data-garage-list]");
  const foot = $("[data-garage-foot]");
  if (!list) return;
  if (!ids.length) {
    list.innerHTML = `<div class="g-empty">${ICONS.garage}<p><b>Sua garagem está vazia.</b><br>Salve os carros que mais gostou para comparar e negociar depois.</p></div>`;
    foot.innerHTML = `<a href="estoque.html" class="btn btn-outline btn-block">Explorar estoque</a>`;
    return;
  }
  const cars = ids.map(carById);
  list.innerHTML = cars.map((c) => `
    <div class="g-item">
      <a href="${carUrl(c)}"><img src="${carThumb(c)}" alt="${carName(c)}" loading="lazy"></a>
      <a href="${carUrl(c)}"><b>${carName(c)}</b><small>${c.versao} · ${c.ano}</small><span class="price">${fmtBRL(c.preco)}</span></a>
      <button data-fav="${c.id}" aria-label="Remover ${carName(c)}">${ICONS.trash}</button>
    </div>`).join("");
  foot.innerHTML = `
    <div class="g-total"><span>${cars.length} ${cars.length > 1 ? "veículos salvos" : "veículo salvo"}</span><b>${fmtBRL(cars.reduce((s, c) => s + c.preco, 0))}</b></div>
    <a href="proposta.html?ids=${ids.join(",")}" class="btn btn-primary btn-block">Solicitar proposta ${ICONS.arrowR}</a>
    ${cars.length > 1 ? `<a href="comparar.html?ids=${ids.slice(0, 4).join(",")}" class="btn btn-outline btn-block">${ICONS.compare} Comparar ${Math.min(cars.length, 4)} carros</a>` : ""}
    <a class="btn btn-wa btn-block" target="_blank" rel="noopener" href="${waLink("Olá! Tenho interesse nestes carros da Apex Motors:\n" + cars.map((c) => `• ${carName(c)} ${c.versao} ${c.ano} — ${fmtBRL(c.preco)}`).join("\n"))}">${ICONS.whatsapp} Enviar lista no WhatsApp</a>`;
}

/* ---------- Busca com sugestões ---------- */
const norm = (s) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
function searchCars(q) {
  const terms = norm(q).split(/\s+/).filter(Boolean);
  if (!terms.length) return [];
  return CARS.filter((c) => {
    const hay = norm(`${c.marca} ${c.modelo} ${c.versao} ${c.ano} ${c.motor} ${catById(c.cat).nome} ${c.combustivel} ${c.cor}`);
    return terms.every((t) => hay.includes(t));
  });
}
function initSearch() {
  const form = $(".search");
  const input = $("input", form);
  const box = $(".search-results", form);
  let idx = -1;
  const render = () => {
    const q = input.value.trim();
    if (q.length < 2) { box.classList.remove("open"); return; }
    const res = searchCars(q);
    idx = -1;
    box.innerHTML = res.length
      ? res.slice(0, 6).map((c) => `<a class="sr-item" role="option" href="${carUrl(c)}"><img src="${carThumb(c)}" alt=""><span><b>${carName(c)}</b><small>${c.versao} · ${c.ano}</small></span><span class="price">${fmtPriceShort(c.preco)}</span></a>`).join("") +
        `<a class="sr-all" href="estoque.html?q=${encodeURIComponent(q)}">Ver ${res.length} resultado${res.length > 1 ? "s" : ""} no estoque</a>`
      : `<div class="sr-empty">Nenhum carro encontrado para “${q.replace(/</g, "&lt;")}”.<br><a class="u-link" href="${waLink(`Olá! Procuro um ${q}. Vocês conseguem encontrar para mim?`)}" target="_blank" rel="noopener">Peça para a Apex encontrar para você</a></div>`;
    box.classList.add("open");
  };
  input.addEventListener("input", render);
  input.addEventListener("focus", render);
  input.addEventListener("keydown", (e) => {
    const items = $$(".sr-item", box);
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      idx = (idx + (e.key === "ArrowDown" ? 1 : -1) + items.length) % items.length;
      items.forEach((it, i) => it.classList.toggle("active", i === idx));
    } else if (e.key === "Enter" && idx >= 0 && items[idx]) {
      e.preventDefault();
      location.href = items[idx].href;
    }
  });
  document.addEventListener("click", (e) => { if (!form.contains(e.target)) box.classList.remove("open"); });
  input.addEventListener("keydown", (e) => { if (e.key === "Escape") { box.classList.remove("open"); input.blur(); } });
  document.addEventListener("keydown", (e) => {
    if (e.key === "/" && !/input|textarea|select/i.test(document.activeElement.tagName)) { e.preventDefault(); input.focus(); }
  });
}

/* ---------- Carrosséis ---------- */
function initRails() {
  $$(".rail").forEach((rail) => {
    const track = $(".rail-track", rail);
    const id = rail.id;
    const prev = $(`[data-rail-prev="${id}"]`);
    const next = $(`[data-rail-next="${id}"]`);
    const bar = $(".rail-progress span", rail);
    const step = () => track.clientWidth * 0.9;
    const update = () => {
      const max = track.scrollWidth - track.clientWidth;
      const p = max > 0 ? track.scrollLeft / max : 0;
      const vis = track.scrollWidth ? track.clientWidth / track.scrollWidth : 1;
      if (bar) { bar.style.width = `${vis * 100}%`; bar.style.transform = `translateX(${p * (1 / vis - 1) * 100}%)`; }
      if (prev) prev.disabled = track.scrollLeft < 4;
      if (next) next.disabled = track.scrollLeft > max - 4;
    };
    prev?.addEventListener("click", () => track.scrollBy({ left: -step(), behavior: "smooth" }));
    next?.addEventListener("click", () => track.scrollBy({ left: step(), behavior: "smooth" }));
    track.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();
  });
}

/* ---------- Revelação ao rolar ---------- */
function initReveal() {
  const els = $$(".reveal");
  if (!("IntersectionObserver" in window)) { els.forEach((e) => e.classList.add("in")); return; }
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
  }, { rootMargin: "0px 0px -8% 0px" });
  els.forEach((e) => io.observe(e));
}

/* ---------- Máscaras / validações (usadas no checkout) ---------- */
const onlyDigits = (s) => s.replace(/\D/g, "");
const mask = {
  cpf: (v) => onlyDigits(v).slice(0, 11).replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d)/, "$1.$2").replace(/(\d{3})(\d{1,2})$/, "$1-$2"),
  cep: (v) => onlyDigits(v).slice(0, 8).replace(/(\d{5})(\d)/, "$1-$2"),
  phone: (v) => {
    const d = onlyDigits(v).slice(0, 11);
    if (d.length <= 2) return d.length ? `(${d}` : "";
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  },
  date: (v) => onlyDigits(v).slice(0, 8).replace(/(\d{2})(\d)/, "$1/$2").replace(/(\d{2})(\d)/, "$1/$2"),
  money: (v) => { const d = onlyDigits(v); return d ? fmtBRL(+d) : ""; },
  km: (v) => { const d = onlyDigits(v).slice(0, 7); return d ? fmtNum(+d) : ""; },
};
function validCPF(v) {
  const c = onlyDigits(v);
  if (c.length !== 11 || /^(\d)\1+$/.test(c)) return false;
  const dv = (len) => { let s = 0; for (let i = 0; i < len; i++) s += +c[i] * (len + 1 - i); const r = (s * 10) % 11; return r === 10 ? 0 : r; };
  return dv(9) === +c[9] && dv(10) === +c[10];
}

/* ---------- Boot ---------- */
document.addEventListener("DOMContentLoaded", () => {
  renderLayout();
  $$("[data-icon]").forEach((el) => el.insertAdjacentHTML("afterbegin", ICONS[el.dataset.icon]));
  $$("[data-arrow]").forEach((el) => el.insertAdjacentHTML("beforeend", ICONS.arrowR));
  // cada página expõe window.initPage
  if (typeof window.initPage === "function") window.initPage();
  initRails();
  initReveal();
});
