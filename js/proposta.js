/* APEX MOTORS — checkout de proposta → atendimento no WhatsApp */

const INTENCOES = [
  ["comprar", ICONS.car, "Quero comprar", "Negociar condições e fechar negócio"],
  ["test-drive", ICONS.key, "Agendar test drive", "Dirigir antes de decidir"],
  ["avaliar", ICONS.swap, "Avaliar meu carro", "Vender ou usar na troca"],
];
const PAGAMENTOS = [
  ["avista", ICONS.bolt, "À vista", "PIX ou TED, com melhor condição"],
  ["financiamento", ICONS.card, "Financiamento", "Entrada a partir de 20%, até 60x"],
  ["consorcio", ICONS.doc, "Consórcio", "Carta contemplada"],
];
const STEPS = ["Interesse", "Seus dados", "Pagamento", "Revisão"];
const DRAFT_KEY = "apex:lead-draft";

const S = { step: 1, ids: [], intencao: "", pagamento: "", troca: false, cepOk: null };

const total = () => S.ids.reduce((s, id) => s + carById(id).preco, 0);
const val = (id) => ($("#" + id)?.value || "").trim();
const labelOf = (list, k) => (list.find((x) => x[0] === k) || [])[2] || "—";

/* ---------- Render auxiliares ---------- */
function renderStepper() {
  $("#stepper").innerHTML = STEPS.map((s, i) => {
    const n = i + 1;
    const cls = S.step === n ? "active" : S.step > n ? "done" : "";
    return `<div class="step-pill ${cls}"><i>${S.step > n ? ICONS.check : n}</i><span>${s}</span></div>`;
  }).join("");
}

function optCards(list, name, current) {
  return list.map(([k, icon, t, d]) => `
    <label class="opt-card"><input type="radio" name="${name}" value="${k}" ${current === k ? "checked" : ""}>
      <span>${icon}<b>${t}</b><small>${d}</small></span></label>`).join("");
}

function renderSummary() {
  const cars = S.ids.map(carById);
  const garageExtra = Garage.list().filter((id) => !S.ids.includes(id));
  const fin = STORE.financiamento;
  $("#summary").innerHTML = `
    <div class="summary-head"><h3>Resumo</h3><span class="chip">${cars.length} ${cars.length === 1 ? "veículo" : "veículos"}</span></div>
    <div class="summary-cars">
      ${cars.length ? cars.map((c) => `
        <div class="g-item">
          <img src="${carThumb(c)}" alt="">
          <div><b>${carName(c)}</b><small>${c.versao} · ${c.ano} · ${fmtKm(c.km)}</small><span class="price">${fmtBRL(c.preco)}</span></div>
          ${S.step < 5 ? `<button type="button" data-remove="${c.id}" aria-label="Remover ${carName(c)}">${ICONS.trash}</button>` : "<span></span>"}
        </div>`).join("") : `<div class="g-empty g-empty-sm">${ICONS.car}<p>Nenhum carro selecionado.</p></div>`}
    </div>
    ${S.step < 5 ? `
      ${garageExtra.length ? `<button type="button" class="add-more" data-add-garage>Adicionar ${garageExtra.length} da Minha Garagem</button>` : ""}
      <a class="add-more" href="estoque.html">Escolher ${cars.length ? "outro" : "um"} carro no estoque</a>` : ""}
    ${cars.length ? `
    <div class="summary-foot">
      <div class="ln"><span>Valor ${cars.length > 1 ? "total" : "à vista"}</span><b>${fmtBRL(total())}</b></div>
      <div class="ln"><span>Ou ${fin.prazoPadrao}x a partir de</span><b>${fmtBRL(parcela(total()))}</b></div>
    </div>` : ""}
    <div class="summary-trust">
      <div>${ICONS.lock}<span>Seus dados são criptografados e usados só para este atendimento.</span></div>
      <div>${ICONS.shield}<span>Carros com laudo cautelar aprovado e garantia Apex de 90 dias.</span></div>
      <div>${ICONS.whatsapp}<span>Resposta de um consultor em até 15 minutos no horário comercial.</span></div>
    </div>`;
}

function applyConditions() {
  const ctx = { intencao: S.intencao, pagamento: S.pagamento, troca: S.troca ? "sim" : "nao" };
  $$(".cond").forEach((el) => {
    const [k, v] = el.dataset.if.split("=");
    el.classList.toggle("show", ctx[k] === v);
  });
  const avaliar = S.intencao === "avaliar";
  $("#pagamentos").style.display = avaliar ? "none" : "";
  $("#troca-toggle-field").style.display = avaliar ? "none" : "";
  $("#no-car-hint").hidden = !(!S.ids.length && S.intencao && !avaliar);
  $(".fstep[data-step='3'] h2").textContent = avaliar ? "Seu carro" : "Pagamento e troca";
  $(".fstep[data-step='3'] > p").textContent = avaliar
    ? "Conte sobre o carro. Nossa equipe responde com a avaliação pelo WhatsApp."
    : "Conte como pretende pagar. O consultor monta a melhor condição a partir daqui.";
  updateFin();
}

function updateFin() {
  const t = total();
  if (!t || S.pagamento !== "financiamento") return;
  const ent = +onlyDigits(val("fin-entrada")) || 0;
  const pct = Math.min(95, (ent / t) * 100);
  const n = +val("fin-prazo");
  $("#fin-parcela").textContent = ent ? `${n}x ${fmtBRL(parcela(t, pct, n))}` : "—";
  $("#fin-taxa").innerHTML = `${Math.round(pct)}% de entrada<br>${String(STORE.financiamento.taxaMensal).replace(".", ",")}% a.m.`;
}

/* ---------- Validação ---------- */
function setField(id, ok) {
  const f = $("#" + id)?.closest(".field");
  if (!f) return ok;
  const err = $(".err", f);
  if (err) {
    err.dataset.msg ??= err.textContent;
    err.textContent = val(id) ? err.dataset.msg : "Campo obrigatório.";
  }
  f.classList.toggle("invalid", !ok);
  f.classList.toggle("valid", ok && !!val(id));
  return ok;
}
function visible(el) { return !!el.offsetParent; }

const RULES = {
  nome: (v) => v.split(/\s+/).filter((w) => w.length > 1).length >= 2,
  cpf: (v) => validCPF(v),
  nasc: (v) => {
    const m = v.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
    if (!m) return false;
    const d = new Date(+m[3], +m[2] - 1, +m[1]);
    if (d.getDate() !== +m[1] || d.getMonth() !== +m[2] - 1) return false;
    const age = (Date.now() - d) / 31557600000;
    return age >= 18 && age < 110;
  },
  tel: (v) => { const d = onlyDigits(v); return d.length === 11 && d[2] === "9"; },
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v),
  cep: (v) => onlyDigits(v).length === 8 && S.cepOk !== false,
  "td-data": (v) => !!v && new Date(v + "T12:00") > new Date(),
  "fin-entrada": (v) => (+onlyDigits(v) || 0) >= total() * 0.2,
  "tr-ano": (v) => +v >= 1950 && +v <= new Date().getFullYear() + 1,
};

function validateStep(n) {
  const step = $(`.fstep[data-step="${n}"]`);
  let ok = true;
  $$("[required]", step).forEach((el) => {
    if (!visible(el) || el.type === "checkbox") return;
    const rule = RULES[el.id];
    const good = rule ? rule(el.value.trim()) : !!el.value.trim();
    ok = setField(el.id, good) && ok;
  });
  if (n === 1) {
    if (!S.intencao) { toast("Escolha o que você procura", ICONS.close); return false; }
    if (S.intencao !== "avaliar" && !S.ids.length) { toast("Escolha pelo menos um carro", ICONS.close); return false; }
  }
  if (n === 3 && S.intencao !== "avaliar" && !S.pagamento) { toast("Escolha a forma de pagamento", ICONS.close); return false; }
  if (n === 4) {
    const lg = $("#lgpd").checked;
    $("#lgpd-wrap").classList.toggle("invalid", !lg);
    if (!lg) { toast("Aceite os termos de privacidade para enviar", ICONS.close); return false; }
  }
  if (!ok) {
    const first = $(".field.invalid", step);
    first?.scrollIntoView({ behavior: "smooth", block: "center" });
    $("input,select", first)?.focus({ preventScroll: true });
  }
  return ok;
}

/* ---------- Revisão e mensagem ---------- */
function data() {
  const end = [val("rua"), val("num")].filter(Boolean).join(", ");
  const loc = [val("bairro"), [val("cidade"), val("uf").toUpperCase()].filter(Boolean).join("/")].filter(Boolean).join(" — ");
  return {
    nome: val("nome"), cpf: val("cpf"), nasc: val("nasc"), tel: val("tel"), email: val("email"),
    endereco: [end, loc, val("cep") && `CEP ${val("cep")}`].filter(Boolean).join(" · "),
  };
}

function renderReview() {
  const d = data();
  const cars = S.ids.map(carById);
  const dl = (rows) => `<dl>${rows.filter((r) => r[1]).map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join("")}</dl>`;
  const block = (title, step, rows) => `<div class="review-block"><h4>${title}<button type="button" data-goto="${step}">Editar</button></h4>${dl(rows)}</div>`;
  const pay = [];
  if (S.intencao !== "avaliar") {
    pay.push(["Forma", labelOf(PAGAMENTOS, S.pagamento)]);
    if (S.pagamento === "financiamento") pay.push(["Entrada", val("fin-entrada")], ["Prazo", `${val("fin-prazo")} meses`], ["Parcela est.", $("#fin-parcela").textContent], ["Renda", val("renda")]);
  }
  if (S.troca || S.intencao === "avaliar") pay.push(["Carro na troca", `${val("tr-modelo")} ${val("tr-ano")}`], ["Km", val("tr-km") && `${val("tr-km")} km`], ["Situação", val("tr-quit")]);
  pay.push(["Contato", val("contato-horario")], ["Observações", val("obs")]);

  $("#review").innerHTML =
    block("Interesse", 1, [
      ["Objetivo", labelOf(INTENCOES, S.intencao)],
      ...cars.map((c, i) => [`Veículo ${cars.length > 1 ? i + 1 : ""}`, `${carName(c)} ${c.ano} · ${fmtBRL(c.preco)}`]),
      ...(S.intencao === "test-drive" ? [["Test drive", `${new Date(val("td-data") + "T12:00").toLocaleDateString("pt-BR")} · ${val("td-hora")}`]] : []),
    ]) +
    block("Seus dados", 2, [["Nome", d.nome], ["CPF", d.cpf], ["Nascimento", d.nasc], ["WhatsApp", d.tel], ["E-mail", d.email], ["Endereço", d.endereco]]) +
    block(S.intencao === "avaliar" ? "Seu carro" : "Pagamento", 3, pay);
}

function buildMessage(proto) {
  const d = data();
  const cars = S.ids.map(carById);
  const L = [];
  L.push(`*NOVA PROPOSTA — APEX MOTORS*`, `Protocolo: *${proto}*`, "");
  L.push(`*Objetivo:* ${labelOf(INTENCOES, S.intencao)}`);
  if (cars.length) {
    L.push(`*Veículo${cars.length > 1 ? "s" : ""}:*`);
    cars.forEach((c) => L.push(`• ${carName(c)} ${c.versao} — ${c.ano} · ${fmtKm(c.km)} — ${fmtBRL(c.preco)}`));
    if (cars.length > 1) L.push(`Total: ${fmtBRL(total())}`);
  }
  if (S.intencao === "test-drive") L.push(`*Test drive:* ${new Date(val("td-data") + "T12:00").toLocaleDateString("pt-BR")} · ${val("td-hora")} · CNH: ${val("cnh")}`);
  L.push("", "*Cliente*", `Nome: ${d.nome}`, `CPF: ${d.cpf}`, `Nascimento: ${d.nasc}`, `WhatsApp: ${d.tel}`, `E-mail: ${d.email}`, `Endereço: ${d.endereco}`);
  if (S.intencao !== "avaliar") {
    L.push("", `*Pagamento:* ${labelOf(PAGAMENTOS, S.pagamento)}`);
    if (S.pagamento === "financiamento") L.push(`Entrada: ${val("fin-entrada")} · ${val("fin-prazo")}x (estimativa ${$("#fin-parcela").textContent})`, val("renda") ? `Renda: ${val("renda")}` : "");
  }
  if (S.troca || S.intencao === "avaliar") L.push("", `*Carro na troca:* ${val("tr-modelo")} ${val("tr-ano")}${val("tr-km") ? ` · ${val("tr-km")} km` : ""}${val("tr-placa") ? ` · final ${val("tr-placa")}` : ""} · ${val("tr-quit")}`);
  L.push("", `*Melhor horário:* ${val("contato-horario")}`);
  if (val("origem")) L.push(`*Origem:* ${val("origem")}`);
  if (val("obs")) L.push(`*Obs.:* ${val("obs")}`);
  L.push("", "_Enviado pelo site da Apex Motors_");
  return L.filter((x, i, a) => !(x === "" && a[i - 1] === "")).join("\n");
}

/* ---------- Navegação ---------- */
function go(n) {
  S.step = n;
  $$(".fstep").forEach((s) => s.classList.toggle("active", +s.dataset.step === n));
  $("#back").style.visibility = n === 1 ? "hidden" : "";
  $("#form-nav").style.display = n === 5 ? "none" : "";
  const next = $("#next");
  next.className = n === 4 ? "btn btn-wa" : "btn btn-primary";
  next.innerHTML = n === 4 ? `${ICONS.whatsapp} Enviar e abrir WhatsApp` : `Continuar ${ICONS.arrowR}`;
  if (n === 4) renderReview();
  renderStepper();
  renderSummary();
  $("#stepper").scrollIntoView({ behavior: "smooth", block: "nearest" });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function submit() {
  const now = new Date();
  const proto = `APX-${String(now.getFullYear()).slice(2)}${String(now.getMonth() + 1).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
  const msg = buildMessage(proto);
  const link = waLink(msg);
  // Guarda localmente (no projeto real: enviar para CRM / planilha / e-mail)
  store.set("apex:leads", [{ proto, at: now.toISOString(), intencao: S.intencao, ids: S.ids, nome: val("nome") }, ...store.get("apex:leads", [])].slice(0, 20));
  try { localStorage.removeItem(DRAFT_KEY); } catch {}
  window.open(link, "_blank", "noopener");
  $("#success").innerHTML = `
    <div class="check">${ICONS.check}</div>
    <h2 class="h-display">Proposta enviada</h2>
    <span class="proto">PROTOCOLO ${proto}</span>
    <p>Abrimos o WhatsApp com sua proposta completa. Se não abriu, toque no botão abaixo. Um consultor da Apex responde em até 15 minutos no horário comercial.</p>
    <div class="row">
      <a class="btn btn-wa" href="${link}" target="_blank" rel="noopener">${ICONS.whatsapp} Abrir WhatsApp</a>
      <a class="btn btn-outline" href="estoque.html">Continuar navegando</a>
    </div>`;
  go(5);
}

/* ---------- Rascunho (não perde o que digitou) ---------- */
function saveDraft() {
  const f = {};
  $$("#form input, #form select, #form textarea").forEach((el) => {
    if (!el.id || el.type === "radio" || el.id === "lgpd") return;
    f[el.id] = el.type === "checkbox" ? el.checked : el.value;
  });
  store.set(DRAFT_KEY, f);
}
function loadDraft() {
  const f = store.get(DRAFT_KEY, null);
  if (!f) return;
  Object.entries(f).forEach(([id, v]) => {
    const el = $("#" + id);
    if (!el) return;
    if (el.type === "checkbox") el.checked = v; else if (v) el.value = v;
  });
  S.troca = !!f["troca-toggle"];
}

/* ---------- CEP (ViaCEP) ---------- */
async function lookupCEP() {
  const cep = onlyDigits(val("cep"));
  if (cep.length !== 8) return;
  const wrap = $("#cep").closest(".input-wrap");
  wrap.classList.add("loading");
  try {
    const r = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    const j = await r.json();
    if (j.erro) { S.cepOk = false; }
    else {
      S.cepOk = true;
      $("#rua").value = j.logradouro || $("#rua").value;
      $("#bairro").value = j.bairro || $("#bairro").value;
      $("#cidade").value = j.localidade || "";
      $("#uf").value = j.uf || "";
      if (j.logradouro) $("#num").focus();
    }
  } catch { S.cepOk = null; /* sem internet: não bloqueia */ }
  wrap.classList.remove("loading");
  setField("cep", RULES.cep(val("cep")));
  saveDraft();
}

/* ---------- Boot ---------- */
window.initPage = function () {
  const p = new URLSearchParams(location.search);
  S.ids = [...new Set([p.get("id"), ...(p.get("ids") || "").split(",")].filter((id) => id && carById(id)))];
  S.intencao = p.get("intencao") || (S.ids.length ? "comprar" : "");
  const pg = p.get("pagamento");
  if (pg === "troca") S.troca = true;
  else if (pg) S.pagamento = pg;

  loadDraft();
  if (pg === "troca") S.troca = true;
  $("#troca-toggle").checked = S.troca;

  $("#intencoes").innerHTML = optCards(INTENCOES, "intencao", S.intencao);
  $("#pagamentos").innerHTML = optCards(PAGAMENTOS, "pagamento", S.pagamento);

  const tomorrow = new Date(Date.now() + 864e5).toISOString().slice(0, 10);
  $("#td-data").min = tomorrow;

  // Pré-preenche o financiamento vindo do simulador
  if (total()) {
    const ent = +p.get("entrada") || STORE.financiamento.entradaPadrao;
    if (!val("fin-entrada") || p.get("entrada")) $("#fin-entrada").value = fmtBRL(Math.round(total() * ent / 100));
    if (p.get("prazo")) $("#fin-prazo").value = p.get("prazo");
  }

  // Máscaras
  $$("[data-mask]").forEach((el) => el.addEventListener("input", () => {
    const pos = el.value.length;
    el.value = mask[el.dataset.mask](el.value);
    if (el.selectionStart === pos) el.setSelectionRange(el.value.length, el.value.length);
  }));

  // Validação ao sair do campo
  $("#form").addEventListener("focusout", (e) => {
    const el = e.target;
    if (!el.required || !el.value) return;
    if (el.id === "cep") return;
    setField(el.id, RULES[el.id] ? RULES[el.id](el.value.trim()) : true);
  });
  $("#cep").addEventListener("input", () => { S.cepOk = null; if (onlyDigits(val("cep")).length === 8) lookupCEP(); });

  $("#form").addEventListener("change", (e) => {
    const t = e.target;
    if (t.name === "intencao") S.intencao = t.value;
    if (t.name === "pagamento") S.pagamento = t.value;
    if (t.id === "troca-toggle") S.troca = t.checked;
    if (t.id === "lgpd") $("#lgpd-wrap").classList.remove("invalid");
    applyConditions();
    saveDraft();
  });
  $("#form").addEventListener("input", () => { updateFin(); saveDraft(); });

  $("#form").addEventListener("submit", (e) => {
    e.preventDefault();
    if (!validateStep(S.step)) return;
    if (S.step === 4) submit();
    else go(S.step + 1);
  });
  $("#back").addEventListener("click", () => go(Math.max(1, S.step - 1)));

  document.addEventListener("click", (e) => {
    const rm = e.target.closest("[data-remove]");
    const gt = e.target.closest("[data-goto]");
    if (rm) { S.ids = S.ids.filter((x) => x !== rm.dataset.remove); renderSummary(); applyConditions(); if (S.step === 4) renderReview(); }
    if (gt) go(+gt.dataset.goto);
    if (e.target.closest("[data-add-garage]")) {
      S.ids = [...new Set([...S.ids, ...Garage.list()])];
      if (!S.intencao) { S.intencao = "comprar"; $("#intencoes").innerHTML = optCards(INTENCOES, "intencao", S.intencao); }
      renderSummary(); applyConditions();
      toast("Carros da garagem adicionados");
    }
  });
  document.addEventListener("garage:change", renderSummary);

  applyConditions();
  go(1);
};
