/* APEX MOTORS — estoque com filtros facetados (estado sincronizado na URL) */

const GROUPS = [
  { key: "cat", title: "Categoria", opts: CATEGORIES.map((c) => [c.id, c.nome]), test: (c, v) => c.cat === v },
  { key: "marca", title: "Marca", opts: [...new Set(CARS.map((c) => c.marca))].sort().map((m) => [m, m]), test: (c, v) => c.marca === v },
  { key: "tracao", title: "Tração", opts: Object.entries(FILTER_LABELS.tracao), test: (c, v) => c.tracao === v },
  { key: "zero", title: "0-100 km/h", opts: [["lt4", "Menos de 4 s"], ["4-5", "De 4 a 5 s"], ["gt5", "Mais de 5 s"]],
    test: (c, v) => (v === "lt4" ? c.zeroCem < 4 : v === "4-5" ? c.zeroCem >= 4 && c.zeroCem <= 5 : c.zeroCem > 5) },
  { key: "pot", title: "Potência", opts: [["ate400", "Até 400 cv"], ["400-600", "400 a 600 cv"], ["600", "Acima de 600 cv"]],
    test: (c, v) => (v === "ate400" ? c.cv < 400 : v === "400-600" ? c.cv >= 400 && c.cv <= 600 : c.cv > 600) },
  { key: "cambio", title: "Câmbio", opts: Object.entries(FILTER_LABELS.cambio), test: (c, v) => c.cambio === v },
  { key: "comb", title: "Combustível", opts: Object.entries(FILTER_LABELS.combustivel), test: (c, v) => c.combustivel === v },
];
const PRICE_STEPS = [0, 300000, 500000, 800000, 1000000, 2000000, 5000000];
const TAG_TITLES = { novidade: "Novidades", "mais-vendido": "Mais vendidos", "em-alta": "Em alta" };

const state = { q: "", tag: "", sort: "relevancia", min: 0, max: 0, ano: 0 };
GROUPS.forEach((g) => (state[g.key] = []));

function readURL() {
  const p = new URLSearchParams(location.search);
  state.q = p.get("q") || "";
  state.tag = p.get("tag") || "";
  state.sort = p.get("sort") || "relevancia";
  state.min = +p.get("min") || 0;
  state.max = +p.get("max") || 0;
  state.ano = +p.get("ano") || 0;
  GROUPS.forEach((g) => (state[g.key] = (p.get(g.key) || "").split(",").filter(Boolean)));
}
function writeURL() {
  const p = new URLSearchParams();
  if (state.q) p.set("q", state.q);
  if (state.tag) p.set("tag", state.tag);
  GROUPS.forEach((g) => state[g.key].length && p.set(g.key, state[g.key].join(",")));
  if (state.min) p.set("min", state.min);
  if (state.max) p.set("max", state.max);
  if (state.ano) p.set("ano", state.ano);
  if (state.sort !== "relevancia") p.set("sort", state.sort);
  history.replaceState(null, "", `${location.pathname}${p.toString() ? "?" + p : ""}`);
}

/* Filtra; `skip` ignora um grupo (para calcular contagens facetadas) */
function filtered(skip) {
  let list = state.q ? searchCars(state.q) : CARS.slice();
  if (state.tag) list = list.filter((c) => c.tags.includes(state.tag));
  if (state.min) list = list.filter((c) => c.preco >= state.min);
  if (state.max) list = list.filter((c) => c.preco <= state.max);
  if (state.ano) list = list.filter((c) => c.ano >= state.ano);
  GROUPS.forEach((g) => {
    if (g.key === skip || !state[g.key].length) return;
    list = list.filter((c) => state[g.key].some((v) => g.test(c, v)));
  });
  return list;
}

function sortList(list) {
  const s = state.sort;
  const score = (c) => (c.status === "reservado" ? -10 : 0) + c.tags.length * 2 + (c.tags.includes("novidade") ? 1 : 0);
  const fns = {
    relevancia: (a, b) => score(b) - score(a),
    "preco-asc": (a, b) => a.preco - b.preco,
    "preco-desc": (a, b) => b.preco - a.preco,
    potencia: (a, b) => b.cv - a.cv,
    zero: (a, b) => a.zeroCem - b.zeroCem,
    ano: (a, b) => b.ano - a.ano,
    km: (a, b) => a.km - b.km,
  };
  return list.sort(fns[s] || fns.relevancia);
}

function renderFilters() {
  const groups = GROUPS.map((g) => {
    const base = filtered(g.key);
    return `
    <div class="f-group">
      <h4>${g.title}${state[g.key].length ? `<button class="a-clear a-clear-sm" data-clear="${g.key}">Limpar</button>` : ""}</h4>
      ${g.opts.map(([v, label]) => {
        const n = base.filter((c) => g.test(c, v)).length;
        const on = state[g.key].includes(v);
        return `<label class="f-opt ${!n && !on ? "disabled" : ""}"><input type="checkbox" data-g="${g.key}" value="${v}" ${on ? "checked" : ""}><span>${label}</span><span class="n">${n}</span></label>`;
      }).join("")}
    </div>`;
  }).join("");

  const opt = (v, sel, lbl) => `<option value="${v}" ${+sel === v ? "selected" : ""}>${lbl}</option>`;
  const years = [...new Set(CARS.map((c) => c.ano))].sort((a, b) => b - a);
  $("#filter-groups").innerHTML = `
    <div class="f-group">
      <h4>Preço</h4>
      <div class="f-range">
        <select class="select" id="f-min" aria-label="Preço mínimo">${opt(0, state.min, "Mínimo")}${PRICE_STEPS.slice(1, -1).map((v) => opt(v, state.min, fmtPriceShort(v))).join("")}</select>
        <select class="select" id="f-max" aria-label="Preço máximo">${opt(0, state.max, "Máximo")}${PRICE_STEPS.slice(1).map((v) => opt(v, state.max, fmtPriceShort(v))).join("")}</select>
      </div>
    </div>
    ${groups}
    <div class="f-group">
      <h4>Ano a partir de</h4>
      <select class="select" id="f-ano" aria-label="Ano mínimo">${opt(0, state.ano, "Qualquer ano")}${years.map((y) => opt(y, state.ano, y)).join("")}</select>
    </div>`;
}

function renderChips() {
  const chips = [];
  if (state.q) chips.push(["q", "", `Busca: “${state.q}”`]);
  if (state.tag) chips.push(["tag", "", TAG_TITLES[state.tag] || state.tag]);
  GROUPS.forEach((g) => state[g.key].forEach((v) => chips.push([g.key, v, g.opts.find((o) => o[0] === v)?.[1] || v])));
  if (state.min) chips.push(["min", "", `A partir de ${fmtPriceShort(state.min)}`]);
  if (state.max) chips.push(["max", "", `Até ${fmtPriceShort(state.max)}`]);
  if (state.ano) chips.push(["ano", "", `${state.ano} ou mais novo`]);
  $("#chips").innerHTML = chips.length
    ? chips.map(([k, v, l]) => `<span class="a-chip">${l}<button data-rm="${k}" data-v="${v}" aria-label="Remover filtro ${l}">${ICONS.close}</button></span>`).join("") + `<button class="a-clear" data-clear-all>Limpar tudo</button>`
    : "";
}

function renderHeader() {
  const cat = state.cat.length === 1 ? catById(state.cat[0]) : null;
  const title = cat ? cat.nome : state.tag ? TAG_TITLES[state.tag] : state.q ? `Resultados para “${state.q}”` : "Estoque completo";
  $("#title").textContent = title;
  $("#crumb").textContent = title;
  $("#subtitle").textContent = cat ? `${cat.desc} Ticket médio: ${cat.ticket}.` : "Todos os carros com laudo cautelar aprovado, revisados e prontos para entrega.";
  document.title = `${title} — Apex Motors`;
  $("#pills").innerHTML =
    `<a class="pill ${!state.cat.length ? "active" : ""}" href="#" data-pill="">Todos<small>${CARS.length}</small></a>` +
    CATEGORIES.map((c) => `<a class="pill ${state.cat.length === 1 && state.cat[0] === c.id ? "active" : ""}" href="#" data-pill="${c.id}">${c.nome}<small>${CARS.filter((x) => x.cat === c.id).length}</small></a>`).join("");
}

function render() {
  const list = sortList(filtered());
  $("#count").innerHTML = `<b>${list.length}</b> ${list.length === 1 ? "veículo encontrado" : "veículos encontrados"}`;
  $("#apply-btn").textContent = `Ver ${list.length} resultado${list.length === 1 ? "" : "s"}`;
  $("#sort").value = state.sort;
  $("#grid").innerHTML = list.length
    ? list.map(carCard).join("")
    : `<div class="empty-state"><h3>Nenhum carro com esses filtros</h3><p>Tente remover algum filtro, ou peça para a Apex encontrar o carro certo para você.</p>
       <div class="empty-actions"><button class="btn btn-outline" data-clear-all>Limpar filtros</button>
       <a class="btn btn-wa" target="_blank" rel="noopener" href="${waLink("Olá! Não encontrei no site o carro que procuro. Vocês conseguem encontrar para mim?")}">${ICONS.whatsapp} Encomendar pelo WhatsApp</a></div></div>`;
  renderFilters();
  renderChips();
  renderHeader();
  writeURL();
}

function clearAll() {
  GROUPS.forEach((g) => (state[g.key] = []));
  Object.assign(state, { q: "", tag: "", min: 0, max: 0, ano: 0 });
  const si = $(".search input");
  if (si) si.value = "";
}

window.initPage = function () {
  readURL();
  $(".filters-head .close-btn").innerHTML = ICONS.close;

  document.addEventListener("change", (e) => {
    const t = e.target;
    if (t.dataset.g) {
      const arr = state[t.dataset.g];
      state[t.dataset.g] = t.checked ? [...arr, t.value] : arr.filter((v) => v !== t.value);
    } else if (t.id === "f-min") state.min = +t.value;
    else if (t.id === "f-max") state.max = +t.value;
    else if (t.id === "f-ano") state.ano = +t.value;
    else if (t.id === "sort") state.sort = t.value;
    else return;
    render();
  });

  document.addEventListener("click", (e) => {
    const rm = e.target.closest("[data-rm]");
    const cg = e.target.closest("[data-clear]");
    const pill = e.target.closest("[data-pill]");
    if (rm) {
      const k = rm.dataset.rm;
      if (["q", "tag"].includes(k)) { state[k] = ""; if (k === "q") $(".search input").value = ""; }
      else if (["min", "max", "ano"].includes(k)) state[k] = 0;
      else state[k] = state[k].filter((v) => v !== rm.dataset.v);
      render();
    } else if (cg) { e.preventDefault(); state[cg.dataset.clear] = []; render(); }
    else if (e.target.closest("[data-clear-all]")) { clearAll(); render(); }
    else if (pill) { e.preventDefault(); state.cat = pill.dataset.pill ? [pill.dataset.pill] : []; render(); }
  });

  // A busca do header filtra ao vivo nesta página
  const si = $(".search input");
  si.addEventListener("input", () => { state.q = si.value.trim(); render(); });
  $(".search").addEventListener("submit", (e) => { e.preventDefault(); $(".search-results").classList.remove("open"); });

  render();
};
