/* APEX MOTORS — comparador lado a lado (até 4 carros, estado na URL) */
const MAX_COMPARE = 4;

/* Linhas da tabela: [rótulo, valor formatado, valor numérico p/ destaque, melhor = "max" | "min"] */
const ROWS = [
  ["Preço à vista", (c) => fmtBRL(c.preco), (c) => c.preco, "min"],
  [`Parcela (${STORE.financiamento.prazoPadrao}x)`, (c) => fmtBRL(parcela(c.preco)), (c) => c.preco, "min"],
  ["Ano", (c) => c.ano, (c) => c.ano, "max"],
  ["Quilometragem", (c) => fmtKm(c.km), (c) => c.km, "min"],
  ["Potência", (c) => `${c.cv} cv`, (c) => c.cv, "max"],
  ["Torque", (c) => `${c.torque.toFixed(1).replace(".", ",")} kgfm`, (c) => c.torque, "max"],
  ["0-100 km/h", (c) => fmtSec(c.zeroCem), (c) => c.zeroCem, "min"],
  ["Velocidade máxima", (c) => `${c.velMax} km/h`, (c) => c.velMax, "max"],
  ["Motor", (c) => c.motor],
  ["Câmbio", (c) => FILTER_LABELS.cambio[c.cambio]],
  ["Tração", (c) => FILTER_LABELS.tracao[c.tracao]],
  ["Combustível", (c) => FILTER_LABELS.combustivel[c.combustivel]],
  ["Cor", (c) => c.cor],
  ["Categoria", (c) => catById(c.cat).nome],
];

let ids = [];

function sync() {
  history.replaceState(null, "", ids.length ? `?ids=${ids.join(",")}` : location.pathname);
}

function render() {
  const root = $("#compare");
  const cars = ids.map(carById);
  const options = CARS.filter((c) => !ids.includes(c.id))
    .map((c) => `<option value="${c.id}">${carName(c)} ${c.versao} · ${c.ano}</option>`).join("");
  const picker = `
    <label class="compare-pick">
      <span class="sr-only">Adicionar carro à comparação</span>
      <select class="select" id="add-car" ${cars.length >= MAX_COMPARE ? "disabled" : ""}>
        <option value="">${cars.length >= MAX_COMPARE ? "Limite de 4 carros" : "Adicionar um carro…"}</option>${options}
      </select>
    </label>`;

  if (cars.length < 2) {
    const garage = Garage.list().filter((id) => !ids.includes(id));
    root.innerHTML = `
      <div class="compare-empty">
        ${ICONS.swap}
        <h2>${cars.length ? "Escolha mais um carro" : "Monte sua comparação"}</h2>
        <p>${cars.length ? `Você está comparando o <b>${carName(cars[0])}</b>. Adicione pelo menos mais um.` : "Escolha dois ou mais carros para ver a ficha técnica lado a lado."}</p>
        ${picker}
        ${garage.length >= 1 ? `<button class="btn btn-outline" data-use-garage>${ICONS.garage} Usar os ${garage.length} da Minha Garagem</button>` : ""}
      </div>`;
    return;
  }

  const best = (getNum, dir) => {
    const vals = cars.map(getNum);
    const target = dir === "max" ? Math.max(...vals) : Math.min(...vals);
    return vals.map((v) => v === target && vals.filter((x) => x === target).length < vals.length);
  };

  root.innerHTML = `
    <div class="compare-bar">
      <span class="count"><b>${cars.length}</b> carros na comparação</span>
      <div class="compare-actions">${picker}<button class="btn btn-outline btn-sm" data-share>${ICONS.share} Compartilhar</button></div>
    </div>
    <div class="compare-scroll">
      <table class="compare-table">
        <thead>
          <tr>
            <th scope="col" class="sticky-col"><span class="sr-only">Característica</span></th>
            ${cars.map((c) => `
              <th scope="col">
                <div class="cmp-head">
                  <button class="cmp-remove" data-remove="${c.id}" aria-label="Remover ${carName(c)}">${ICONS.close}</button>
                  <a href="${carUrl(c)}"><img src="${carThumb(c)}" alt="${carName(c)}" loading="lazy"></a>
                  <span class="car-brand">${c.marca}</span>
                  <a class="cmp-name" href="${carUrl(c)}">${c.modelo}</a>
                  <span class="car-version">${c.versao}</span>
                </div>
              </th>`).join("")}
          </tr>
        </thead>
        <tbody>
          ${ROWS.map(([label, fmt, num, dir]) => {
            const flags = num ? best(num, dir) : [];
            return `<tr><th scope="row" class="sticky-col">${label}</th>${cars.map((c, i) => `<td class="${flags[i] ? "best" : ""}">${fmt(c)}</td>`).join("")}</tr>`;
          }).join("")}
          <tr class="cmp-cta"><th scope="row" class="sticky-col"></th>${cars.map((c) => `
            <td><a class="btn btn-primary btn-sm btn-block" href="proposta.html?id=${c.id}&intencao=comprar">Tenho interesse</a></td>`).join("")}</tr>
        </tbody>
      </table>
    </div>
    <div class="compare-foot">
      <a class="btn btn-primary" href="proposta.html?ids=${ids.join(",")}">Pedir proposta dos ${cars.length} ${ICONS.arrowR}</a>
      <a class="btn btn-wa" target="_blank" rel="noopener" href="${waLink(`Olá! Estou comparando estes carros e quero ajuda para escolher:\n${cars.map((c) => `• ${carName(c)} ${c.versao} ${c.ano} — ${fmtBRL(c.preco)}`).join("\n")}`)}">${ICONS.whatsapp} Ajuda de um consultor</a>
    </div>`;
}

window.initPage = function () {
  const p = new URLSearchParams(location.search);
  ids = [...new Set((p.get("ids") || "").split(",").filter((id) => carById(id)))].slice(0, MAX_COMPARE);
  if (!ids.length) ids = Garage.list().slice(0, MAX_COMPARE);
  if (ids.length === 1 && Garage.list().length > 1) ids = [...new Set([...ids, ...Garage.list()])].slice(0, MAX_COMPARE);

  document.addEventListener("change", (e) => {
    if (e.target.id !== "add-car" || !e.target.value) return;
    ids = [...ids, e.target.value].slice(0, MAX_COMPARE);
    sync(); render();
  });
  document.addEventListener("click", async (e) => {
    const rm = e.target.closest("[data-remove]");
    if (rm) { ids = ids.filter((x) => x !== rm.dataset.remove); sync(); render(); return; }
    if (e.target.closest("[data-use-garage]")) { ids = [...new Set([...ids, ...Garage.list()])].slice(0, MAX_COMPARE); sync(); render(); return; }
    if (e.target.closest("[data-share]")) shareLink("Comparação de carros — Apex Motors");
  });
  sync();
  render();
};
