/* APEX MOTORS — página inicial */
window.initPage = function () {
  /* Faixa de confiança */
  const trust = [
    [ICONS.shield, "Laudo cautelar", "100% dos carros aprovados"],
    [ICONS.card, "Financiamento", "Até 60x, aprovação no dia"],
    [ICONS.swap, "Seu carro na troca", "Avaliação em 30 minutos"],
    [ICONS.award, "Garantia Apex", "90 dias de motor e câmbio"],
    [ICONS.truck, "Entrega no Brasil", "Transporte em cegonha fechada"],
  ];
  $("#trust").innerHTML = trust.map(([i, b, s]) => `<div class="trust-item">${i}<div><b>${b}</b><small>${s}</small></div></div>`).join("");

  /* Categorias */
  $("#cats").innerHTML = CATEGORIES.map((c, i) => {
    const n = CARS.filter((x) => x.cat === c.id).length;
    return `
    <a class="cat-card reveal" href="estoque.html?cat=${c.id}" style="transition-delay:${i * 60}ms">
      <img src="${c.img}" alt="" loading="lazy">
      <span class="cat-num">${String(i + 1).padStart(2, "0")}</span>
      <span class="cat-count">${n} carros</span>
      <h3>${c.nome}</h3>
      <p>${c.desc}</p>
      <div class="cat-meta"><span>${c.ticket}</span><span class="cat-arrow">${ICONS.arrowR}</span></div>
    </a>`;
  }).join("");

  /* Vitrines: Novidades / Mais vendidos / Em alta */
  const railHTML = (id, eyebrow, title, cars, more) => `
    <div class="container">
      <div class="section-head reveal">
        <div>
          <span class="eyebrow">${eyebrow}</span>
          <h2 class="h-display h-section">${title}</h2>
        </div>
        <div class="section-head-actions">
          ${more}
          <div class="rail-nav">
            <button data-rail-prev="${id}" aria-label="Anteriores">${ICONS.arrowL}</button>
            <button data-rail-next="${id}" aria-label="Próximos">${ICONS.arrowR}</button>
          </div>
        </div>
      </div>
      <div class="rail" id="${id}">
        <div class="rail-track">${cars.map(carCard).join("")}</div>
        <div class="rail-progress"><span></span></div>
      </div>
    </div>`;

  $$("[data-rail]").forEach((sec) => {
    const tag = sec.dataset.rail;
    const cars = CARS.filter((c) => c.tags.includes(tag));
    sec.innerHTML = railHTML(`rail-${tag}`, sec.dataset.eyebrow, sec.dataset.title, cars,
      `<a class="link-arrow" href="estoque.html?tag=${tag}">Ver todos (${cars.length}) ${ICONS.arrowR}</a>`);
  });

  /* Vistos recentemente (histórico local do visitante) */
  const seen = store.get("apex:seen", []).map(carById).filter(Boolean);
  const recent = $("#recent");
  if (seen.length >= 2) {
    recent.hidden = false;
    recent.innerHTML = railHTML("rail-recent", "Continue de onde parou", "Vistos recentemente", seen,
      seen.length > 1 ? `<a class="link-arrow" href="comparar.html?ids=${seen.slice(0, 4).map((c) => c.id).join(",")}">Comparar ${ICONS.arrowR}</a>` : "");
  }

  /* FAQ */
  const faq = [
    ["Os carros têm garantia?", "Sim. Todo carro sai com a Garantia Apex de 90 dias para motor e câmbio, além da garantia de fábrica remanescente quando houver."],
    ["Como funciona o financiamento?", `Entrada a partir de 20% e prazo de até 60 meses, com os principais bancos do país. A análise de crédito sai no mesmo dia e a taxa de referência é de ${String(STORE.financiamento.taxaMensal).replace(".", ",")}% a.m.`],
    ["Vocês aceitam meu carro na troca?", "Aceitamos. A avaliação leva até 30 minutos, presencialmente ou por fotos no WhatsApp. Se o seu carro ainda estiver financiado, nós quitamos o saldo junto ao banco."],
    ["Entregam fora de Manaus?", "Sim, para todo o Brasil. O transporte é feito em caminhão fechado com seguro, e a transferência da documentação fica por nossa conta."],
    ["Posso fazer test drive?", "Pode. Agende pelo site ou WhatsApp e traga sua CNH válida. O test drive é acompanhado por um consultor."],
    ["Como sei que o carro está em ordem?", "Todos passam por laudo cautelar em empresa credenciada, conferência de histórico de revisões e consulta de multas, sinistro e restrições antes de entrar no estoque."],
  ];
  $("#faq-list").innerHTML = faq.map(([q, a], i) => `
    <details class="faq-item" ${i === 0 ? "open" : ""}>
      <summary>${q}<span class="plus" aria-hidden="true"></span></summary>
      <p>${a}</p>
    </details>`).join("");
  $("#faq-wa").href = waLink("Olá! Tenho uma dúvida sobre a compra na Apex Motors:");

  /* Dados estruturados (SEO): loja + perguntas frequentes */
  addJsonLd({
    "@context": "https://schema.org",
    "@type": "AutoDealer",
    name: STORE.nome,
    slogan: STORE.slogan,
    telephone: STORE.telefone,
    email: STORE.email,
    image: new URL("assets/brand/og-image.jpg", location.href).href,
    address: { "@type": "PostalAddress", streetAddress: STORE.endereco, addressLocality: "Manaus", addressRegion: "AM", postalCode: STORE.cep, addressCountry: "BR" },
    geo: { "@type": "GeoCoordinates", latitude: STORE.lat, longitude: STORE.lng },
    openingHours: ["Mo-Fr 09:00-19:00", "Sa 09:00-15:00"],
    sameAs: [igLink()],
  });
  addJsonLd({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
  });

  /* WhatsApp CTAs */
  $("#cta-wa-troca").href = waLink("Olá! Quero avaliar meu carro na troca. Segue: modelo, ano e km:");
  const enc = $("#cta-wa-encomenda");
  enc.href = waLink("Olá, Apex! Estou procurando um carro específico: ");
  enc.innerHTML = `${ICONS.whatsapp} Encomendar meu carro`;

  /* Instagram */
  $("#ig-avatar").href = igLink();
  $("#ig-avatar span").innerHTML = LOGO_MARK;
  $("#ig-handle").textContent = `@${STORE.instagram}`;
  const follow = $("#ig-follow");
  follow.href = igLink();
  follow.innerHTML = `${ICONS.instagram} Seguir no Instagram`;

  $("#reels").innerHTML = REELS.map((r, i) => `
    <a class="reel reveal" href="${igLink()}" target="_blank" rel="noopener" style="transition-delay:${i * 70}ms" aria-label="Assistir no Instagram: ${r.titulo}">
      ${r.video
        ? `<video src="${r.video}" poster="${r.poster}" muted loop playsinline preload="none"></video>`
        : `<img src="${r.poster}" alt="" loading="lazy">`}
      <div class="reel-top">
        <span class="reel-user"><i>${LOGO_MARK}</i>${STORE.instagram}</span>
        ${ICONS.instagram}
      </div>
      <span class="reel-play">${ICONS.play}</span>
      <div class="reel-bottom">
        <b>${r.titulo}</b>
        <small>${ICONS.eye} ${r.views} visualizações</small>
      </div>
    </a>`).join("");

  // Reels com vídeo: tocam no hover (desktop) ou quando aparecem na tela (mobile)
  const vids = $$("#reels video");
  const touch = matchMedia("(hover: none)").matches;
  vids.forEach((v) => {
    const card = v.closest(".reel");
    const play = () => { v.play().then(() => card.classList.add("playing")).catch(() => {}); };
    const stop = () => { v.pause(); card.classList.remove("playing"); };
    if (!touch) { card.addEventListener("mouseenter", play); card.addEventListener("mouseleave", stop); }
  });
  if (touch && vids.length && "IntersectionObserver" in window) {
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      const card = e.target.closest(".reel");
      if (e.intersectionRatio > 0.7) e.target.play().then(() => card.classList.add("playing")).catch(() => {});
      else { e.target.pause(); card.classList.remove("playing"); }
    }), { threshold: [0, 0.7] });
    vids.forEach((v) => io.observe(v));
  }

  /* Visite a loja */
  const { lat, lng } = STORE;
  const dest = encodeURIComponent(`${STORE.nome}, ${STORE.endereco}, ${STORE.cidade}`);
  const uber = `https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[latitude]=${lat}&dropoff[longitude]=${lng}&dropoff[nickname]=${encodeURIComponent(STORE.nome)}&dropoff[formatted_address]=${dest}`;
  $("#visit").innerHTML = `
    <div class="map-wrap reveal">
      <iframe title="Mapa — ${STORE.nome}" loading="lazy" referrerpolicy="no-referrer-when-downgrade"
        src="https://maps.google.com/maps?q=${lat},${lng}&z=15&hl=pt-BR&output=embed"></iframe>
      <div class="map-pin">
        <svg class="mk" viewBox="0 0 320 285" fill="#000" aria-hidden="true"><path d="M161 0 223 113 203 127 162 60 65 250 238 135 320 285 277 285 215 183 65 285 0 285Z"/></svg>
        <div><b>${STORE.nome} — Showroom</b><small>${STORE.endereco}, ${STORE.cidade}</small></div>
      </div>
    </div>
    <div class="visit-info reveal">
      <div>
        <span class="eyebrow">Endereço</span>
        <h3 class="h-display">Manaus · AM</h3>
      </div>
      <div class="info-row">${ICONS.pin}<div>${STORE.endereco}<small>${STORE.cidade} · CEP ${STORE.cep}</small></div></div>
      <div class="info-row">${ICONS.clock}<div>
        <table class="hours">${STORE.horario.map(([d, h]) => `<tr><td>${d}</td><td>${h}</td></tr>`).join("")}</table>
      </div></div>
      <div>
        <span class="eyebrow ride-title">Como chegar</span>
        <div class="ride-grid">
          <a class="ride uber" href="${uber}" target="_blank" rel="noopener"><i>Uber</i><div><b>Pedir Uber</b><small>Destino já preenchido</small></div></a>
          <a class="ride n99" href="https://99app.com/" target="_blank" rel="noopener"><i>99</i><div><b>Pedir 99</b><small>Abrir app da 99</small></div></a>
          <a class="ride waze" href="https://waze.com/ul?ll=${lat},${lng}&navigate=yes" target="_blank" rel="noopener"><i>${ICONS.nav}</i><div><b>Waze</b><small>Rota até a loja</small></div></a>
          <a class="ride gmaps" href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" target="_blank" rel="noopener"><i>${ICONS.pin}</i><div><b>Google Maps</b><small>Traçar rota</small></div></a>
        </div>
      </div>
      <a class="btn btn-wa btn-block" href="${waLink("Olá! Quero agendar uma visita ao showroom da Apex Motors.")}" target="_blank" rel="noopener">${ICONS.whatsapp} Agendar visita</a>
    </div>`;

  $("#mark-bg").innerHTML = LOGO_MARK.replace('class="logo-mark"', 'width="100%"');
};
