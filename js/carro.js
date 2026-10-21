/* APEX MOTORS — página do veículo */
window.initPage = function () {
  const root = $("#pdp-root");
  const id = new URLSearchParams(location.search).get("id");
  const c = carById(id);

  if (!c) {
    root.innerHTML = `<section class="section"><div class="container not-found">
      <span class="eyebrow">Erro 404</span>
      <h1 class="h-display h-section">Carro não encontrado</h1>
      <p class="lead">Ele pode ter sido vendido. Veja o estoque atualizado.</p>
      <a class="btn btn-primary" href="estoque.html">Ver estoque</a></div></section>`;
    return;
  }

  const cat = catById(c.cat);
  const name = carName(c);
  const reservado = c.status === "reservado";
  const fin = STORE.financiamento;
  document.title = `${name} ${c.versao} ${c.ano} — Apex Motors`;
  const desc = `${name} ${c.versao} ${c.ano}, ${fmtKm(c.km)}, ${c.cv} cv. ${c.destaque} ${fmtBRL(c.preco)} na Apex Motors, Manaus.`;
  document.querySelector('meta[name="description"]').content = desc;
  document.querySelector('meta[property="og:title"]').content = `${name} ${c.versao} ${c.ano} — Apex Motors`;
  document.querySelector('meta[property="og:description"]').content = desc;
  document.querySelector('meta[property="og:image"]').content = new URL(carImg(c), location.href).href;
  addJsonLd({
    "@context": "https://schema.org",
    "@type": "Car",
    name: `${name} ${c.versao}`,
    brand: { "@type": "Brand", name: c.marca },
    model: c.modelo,
    vehicleModelDate: String(c.ano),
    mileageFromOdometer: { "@type": "QuantitativeValue", value: c.km, unitCode: "KMT" },
    fuelType: FILTER_LABELS.combustivel[c.combustivel],
    vehicleTransmission: FILTER_LABELS.cambio[c.cambio],
    driveWheelConfiguration: FILTER_LABELS.tracao[c.tracao],
    color: c.cor,
    vehicleEngine: { "@type": "EngineSpecification", name: c.motor, enginePower: { "@type": "QuantitativeValue", value: c.cv, unitText: "cv" } },
    image: new URL(carImg(c), location.href).href,
    description: c.destaque,
    offers: {
      "@type": "Offer",
      price: c.preco,
      priceCurrency: "BRL",
      availability: reservado ? "https://schema.org/LimitedAvailability" : "https://schema.org/InStock",
      seller: { "@type": "AutoDealer", name: STORE.nome },
    },
  });

  // Barras de telemetria: relativas ao estoque
  const max = (k) => Math.max(...CARS.map((x) => x[k]));
  const min = (k) => Math.min(...CARS.map((x) => x[k]));
  const pct = (k, inv) => inv ? (max(k) - c[k]) / (max(k) - min(k)) : c[k] / max(k);
  const tm = [
    ["0-100 km/h", fmtSec(c.zeroCem).replace(" s", ""), "segundos", pct("zeroCem", true)],
    ["Potência", fmtNum(c.cv), "cv", pct("cv")],
    ["Torque", c.torque.toFixed(1).replace(".", ","), "kgfm", pct("torque")],
    ["Vel. máxima", c.velMax, "km/h", pct("velMax")],
  ];

  const waMsg = `Olá, Apex Motors! Tenho interesse no *${name} ${c.versao}* (${c.ano}, ${fmtKm(c.km)}) anunciado por ${fmtBRL(c.preco)}.\n${location.href}`;
  const tags = [];
  if (reservado) tags.push('<span class="tag tag-res">Reservado</span>');
  else if (c.tags.includes("novidade")) tags.push('<span class="tag tag-new">Novidade</span>');
  const fav = Garage.has(c.id);
  const credit = PHOTO_CREDITS[c.id];

  root.innerHTML = `
  <div class="container">
    <nav class="crumbs page-crumbs" aria-label="Você está em">
      <a href="index.html">Início</a><span>/</span><a href="estoque.html">Estoque</a><span>/</span>
      <a href="estoque.html?cat=${cat.id}">${cat.nome}</a><span>/</span><span>${name}</span>
    </nav>

    <div class="pdp">
      <div class="pdp-media">
        <div class="media-stage" id="stage">
          <img src="${carImg(c)}" alt="${name} ${c.versao}" fetchpriority="high">
          ${tags.length ? `<div class="car-tags">${tags.join("")}</div>` : ""}
          <button class="fav-btn ${fav ? "on" : ""}" data-fav="${c.id}" aria-label="Salvar na Minha Garagem" aria-pressed="${fav}">${fav ? ICONS.heartFill : ICONS.heart}</button>
        </div>
        <div class="media-tabs" role="tablist">
          <button class="media-tab active" role="tab" data-media="foto" aria-selected="true"><img src="${carThumb(c)}" alt="">Foto</button>
          <button class="media-tab" role="tab" data-media="video" aria-selected="false"><span class="vthumb">${ICONS.play}</span>Vídeo</button>
        </div>
        ${credit ? `<p class="media-credit">Foto ilustrativa: <a href="https://commons.wikimedia.org/wiki/File:${encodeURIComponent(credit)}" target="_blank" rel="noopener">Wikimedia Commons</a> (CC)</p>` : ""}
      </div>

      <div class="pdp-info">
        <span class="car-brand">${c.marca} · ${cat.nome}</span>
        <h1>${c.modelo}</h1>
        <p class="version">${c.versao}</p>
        <div class="pdp-chips">
          <span class="chip">${c.ano}</span>
          <span class="chip">${fmtKm(c.km)}</span>
          <span class="chip">${FILTER_LABELS.cambio[c.cambio]}</span>
          <span class="chip">${c.cor}</span>
          <span class="chip ok">${ICONS.shield}Laudo cautelar aprovado</span>
        </div>

        <div class="price-box">
          <span class="lbl">${reservado ? "Reservado · aceitamos fila de espera" : "Preço à vista"}</span>
          <div class="val">${fmtBRL(c.preco)}</div>
          <div class="inst">ou entrada de <b>${fmtBRL(c.preco * fin.entradaPadrao / 100)}</b> + ${fin.prazoPadrao}x de <b>${fmtBRL(parcela(c.preco))}</b></div>
          <div class="pdp-ctas">
            <a class="btn btn-primary" href="proposta.html?id=${c.id}&intencao=comprar">${reservado ? "Entrar na fila de espera" : "Tenho interesse"} ${ICONS.arrowR}</a>
            <div class="row">
              <a class="btn btn-outline" href="proposta.html?id=${c.id}&intencao=test-drive">${ICONS.key} Test drive</a>
              <a class="btn btn-wa" href="${waLink(waMsg)}" target="_blank" rel="noopener">${ICONS.whatsapp} WhatsApp</a>
            </div>
            <div class="pdp-tools">
              <button class="btn btn-ghost" data-fav="${c.id}" data-label>${fav ? ICONS.heartFill : ICONS.heart} ${fav ? "Na sua garagem" : "Salvar na garagem"}</button>
              <a class="btn btn-ghost" href="comparar.html?ids=${c.id}">${ICONS.compare} Comparar</a>
              <button class="btn btn-ghost" id="share-btn">${ICONS.share} Compartilhar</button>
            </div>
          </div>
        </div>

        <div class="telemetry" id="telemetry">
          ${tm.map(([l, v, u, p]) => `<div class="tm"><small>${l}</small><b>${v}</b><span>${u}</span><div class="bar"><i data-w="${Math.max(0.08, p) * 100}"></i></div></div>`).join("")}
        </div>

        <div class="pdp-note">${ICONS.shield}<span>${c.destaque} Garantia Apex de 90 dias para motor e câmbio, e documentação conferida (sem multas, sinistro ou restrições).</span></div>
      </div>
    </div>

    <div class="pdp-sections">
      <div class="panel reveal">
        <h3>Ficha técnica</h3>
        <table class="spec-table">
          <tr><th>Motor</th><td>${c.motor}</td></tr>
          <tr><th>Potência</th><td>${c.cv} cv</td></tr>
          <tr><th>Torque</th><td>${c.torque.toFixed(1).replace(".", ",")} kgfm</td></tr>
          <tr><th>0-100 km/h</th><td>${fmtSec(c.zeroCem)}</td></tr>
          <tr><th>Velocidade máxima</th><td>${c.velMax} km/h</td></tr>
          <tr><th>Câmbio</th><td>${FILTER_LABELS.cambio[c.cambio]}</td></tr>
          <tr><th>Tração</th><td>${FILTER_LABELS.tracao[c.tracao]}</td></tr>
          <tr><th>Combustível</th><td>${FILTER_LABELS.combustivel[c.combustivel]}</td></tr>
          <tr><th>Ano / Quilometragem</th><td>${c.ano} · ${fmtKm(c.km)}</td></tr>
          <tr><th>Cor</th><td>${c.cor}</td></tr>
        </table>
      </div>

      <div class="panel reveal">
        <h3>Destaques e opcionais</h3>
        <p class="desc">${c.destaque}</p>
        <ul class="opc">${c.opcionais.map((o) => `<li>${ICONS.checkCircle}${o}</li>`).join("")}</ul>
      </div>

      <div class="panel reveal" id="simulador">
        <h3>Simule o financiamento</h3>
        <div class="sim">
          <div class="sim-row">
            <label for="sim-entrada">Entrada <b id="sim-entrada-v"></b></label>
            <input type="range" id="sim-entrada" min="20" max="80" step="5" value="${fin.entradaPadrao}">
          </div>
          <div class="sim-row">
            <label for="sim-prazo">Prazo <b id="sim-prazo-v"></b></label>
            <input type="range" id="sim-prazo" min="12" max="60" step="12" value="${fin.prazoPadrao}">
          </div>
          <div class="sim-result">
            <div><small>Parcelas estimadas</small><b id="sim-parcela"></b></div>
            <div class="sm" id="sim-meta"></div>
          </div>
          <a class="btn btn-primary btn-block" id="sim-go">Quero esta condição ${ICONS.arrowR}</a>
          <p class="fine">Simulação ilustrativa com taxa de ${String(fin.taxaMensal).replace(".", ",")}% a.m. (Tabela Price). Sujeita à análise de crédito; valores finais e CET informados pelo banco.</p>
        </div>
      </div>

      <div class="panel reveal">
        <h3>Seu carro vale como entrada</h3>
        <p class="desc">Avaliamos seu carro na hora. O valor entra como parte do pagamento e você sai dirigindo o ${c.modelo}.</p>
        <ul class="opc">
          <li>${ICONS.checkCircle}Avaliação gratuita, sem compromisso</li>
          <li>${ICONS.checkCircle}Quitamos o financiamento do seu carro atual</li>
          <li>${ICONS.checkCircle}Aceitamos carros, motos e utilitários</li>
        </ul>
        <a class="btn btn-outline btn-block panel-cta" href="proposta.html?id=${c.id}&intencao=comprar&pagamento=troca">${ICONS.swap} Incluir meu carro na troca</a>
      </div>
    </div>

    <div class="steps-strip reveal">
      <div class="st"><i>01</i><b>Proposta online</b><p>Envie seus dados e a forma de pagamento em 2 minutos.</p></div>
      <div class="st"><i>02</i><b>Atendimento no WhatsApp</b><p>Um consultor dá continuidade com tudo já preenchido.</p></div>
      <div class="st"><i>03</i><b>Crédito e avaliação</b><p>Análise de crédito e avaliação da troca no mesmo dia.</p></div>
      <div class="st"><i>04</i><b>Entrega</b><p>Retire no showroom ou receba em casa com transporte fechado.</p></div>
    </div>
  </div>

  <section class="section-tight divider">
    <div class="container">
      <div class="section-head">
        <div><span class="eyebrow">Da mesma categoria</span><h2 class="h-display h-section">Você também<br>vai gostar</h2></div>
        <div class="section-head-actions">
          <a class="link-arrow" href="estoque.html?cat=${cat.id}">Ver ${cat.curto.toLowerCase()} ${ICONS.arrowR}</a>
          <div class="rail-nav"><button data-rail-prev="rail-sim" aria-label="Anteriores">${ICONS.arrowL}</button><button data-rail-next="rail-sim" aria-label="Próximos">${ICONS.arrowR}</button></div>
        </div>
      </div>
      <div class="rail" id="rail-sim">
        <div class="rail-track">${CARS.filter((x) => x.cat === c.cat && x.id !== c.id).concat(CARS.filter((x) => x.cat !== c.cat && Math.abs(x.preco - c.preco) / c.preco < 0.25)).slice(0, 8).map(carCard).join("")}</div>
        <div class="rail-progress"><span></span></div>
      </div>
    </div>
  </section>

  <div class="pdp-sticky">
    <div class="p"><small>${c.marca} ${c.modelo}</small><b>${fmtBRL(c.preco)}</b></div>
    <a class="btn btn-wa" href="${waLink(waMsg)}" target="_blank" rel="noopener" aria-label="WhatsApp">${ICONS.whatsapp}</a>
    <a class="btn btn-primary" href="proposta.html?id=${c.id}&intencao=comprar">Tenho interesse</a>
  </div>`;
  document.body.classList.add("has-sticky");

  $("#share-btn").addEventListener("click", () => shareLink(`${name} ${c.versao} — Apex Motors`));

  /* Foto / Vídeo */
  const stage = $("#stage");
  const photoHTML = stage.innerHTML;
  $$(".media-tab").forEach((t) => t.addEventListener("click", () => {
    $$(".media-tab").forEach((x) => { x.classList.toggle("active", x === t); x.setAttribute("aria-selected", x === t); });
    if (t.dataset.media === "foto") { stage.innerHTML = photoHTML; return; }
    stage.innerHTML = c.video
      ? `<video src="${c.video}" poster="${carImg(c)}" controls autoplay muted playsinline></video>`
      : `<div class="video-empty"><div>${ICONS.video}<b>Vídeo walkaround exclusivo</b>
          <p>Um consultor grava um vídeo deste ${c.modelo} — motor ligado, interior e detalhes — e envia no seu WhatsApp em minutos.</p>
          <a class="btn btn-wa" target="_blank" rel="noopener" href="${waLink(`Olá! Pode me enviar um vídeo do ${name} ${c.versao} (${c.ano})?`)}">${ICONS.whatsapp} Pedir vídeo agora</a></div></div>`;
  }));

  /* Telemetria animada */
  const io = new IntersectionObserver((es) => es.forEach((e) => {
    if (!e.isIntersecting) return;
    $$("#telemetry .bar i").forEach((i) => (i.style.width = i.dataset.w + "%"));
    io.disconnect();
  }));
  io.observe($("#telemetry"));

  /* Simulador */
  const ent = $("#sim-entrada");
  const pz = $("#sim-prazo");
  const upd = () => {
    const e = +ent.value, n = +pz.value;
    $("#sim-entrada-v").textContent = `${e}% · ${fmtBRL(c.preco * e / 100)}`;
    $("#sim-prazo-v").textContent = `${n} meses`;
    $("#sim-parcela").textContent = `${n}x ${fmtBRL(parcela(c.preco, e, n))}`;
    $("#sim-meta").innerHTML = `Financiado<br><b>${fmtBRL(c.preco * (1 - e / 100))}</b>`;
    $("#sim-go").href = `proposta.html?id=${c.id}&intencao=comprar&pagamento=financiamento&entrada=${e}&prazo=${n}`;
  };
  ent.addEventListener("input", upd);
  pz.addEventListener("input", upd);
  upd();

  /* Histórico de vistos (usado como "relevância" futura) */
  const seen = store.get("apex:seen", []).filter((x) => x !== c.id);
  store.set("apex:seen", [c.id, ...seen].slice(0, 12));
};
