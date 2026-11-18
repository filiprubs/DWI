const API_URL = "https://api.groq.com/openai/v1/chat/completions";
const API_KEY = localStorage.getItem("groq_key") || prompt("Cole sua chave da Groq:");
localStorage.setItem("groq_key", $API_KEY);
const MODEL = "openai/gpt-oss-20b";

const areaMensagens = document.getElementById("mensagens");
const textoVazio    = document.getElementById("vazio");
const form          = document.getElementById("form");
const campo         = document.getElementById("campo");
const btnEnviar     = document.getElementById("btn-enviar");
const btnNova       = document.getElementById("btn-nova");
const btnMenu       = document.getElementById("btn-menu");
const fundo         = document.getElementById("fundo");
const lateral       = document.getElementById("lateral");
const lista         = document.getElementById("lista");
const listaVazia    = document.getElementById("lista-vazia");

const CHAVE_STORAGE = "chat-llm-conversas";

const PROMPT_SISTEMA = {
  role: "system",
  content: "VocÃª Ã© um assistente prestativo. Responda em portuguÃªs do Brasil, de forma clara e objetiva."
};

let conversas = carregarConversas();
let atual = criarConversa();
let aguardando = false;

function carregarConversas() {
  try {
    const texto = localStorage.getItem(CHAVE_STORAGE);
    return texto ? JSON.parse(texto) : [];
  } catch (erro) {
    console.error("NÃ£o foi possÃ­vel ler as conversas salvas:", erro);
    return [];
  }
}

function salvarConversas() {
  try {
    localStorage.setItem(CHAVE_STORAGE, JSON.stringify(conversas));
  } catch (erro) {
    console.error("NÃ£o foi possÃ­vel salvar as conversas:", erro);
  }
}

function criarConversa() {
  return { id: String(Date.now()), titulo: "Nova conversa", mensagens: [] };
}

function gerarTitulo(texto) {
  const limpo = texto.replace(/\s+/g, " ").trim();
  return limpo.length > 40 ? limpo.slice(0, 40) + "â€¦" : limpo;
}

function adicionarBalao(texto, tipo) {
  textoVazio.hidden = true;

  const balao = document.createElement("div");
  balao.className = `balao ${tipo}`;
  balao.textContent = texto;

  areaMensagens.appendChild(balao);
  rolarParaFim();
  return balao;
}

function mostrarCarregando() {
  const balao = document.createElement("div");
  balao.className = "balao ia carregando";
  balao.innerHTML = "<span></span><span></span><span></span>";
  areaMensagens.appendChild(balao);
  rolarParaFim();
  return balao;
}

function rolarParaFim() {
  areaMensagens.scrollTop = areaMensagens.scrollHeight;
}

function definirAguardando(valor) {
  aguardando = valor;
  campo.disabled = valor;
  btnEnviar.disabled = valor;
  lateral.classList.toggle("bloqueada", valor);
  if (!valor) campo.focus();
}

function ajustarAltura() {
  campo.style.height = "auto";
  campo.style.height = campo.scrollHeight + "px";
}

function mostrarConversa() {
  areaMensagens.querySelectorAll(".balao").forEach((el) => el.remove());

  textoVazio.hidden = atual.mensagens.length > 0;

  for (const msg of atual.mensagens) {
    adicionarBalao(msg.content, msg.role === "user" ? "usuario" : "ia");
  }
  rolarParaFim();
}

function renderizarLista() {
  lista.innerHTML = "";
  listaVazia.hidden = conversas.length > 0;

  for (const conversa of conversas) {
    const item = document.createElement("li");
    if (conversa.id === atual.id) item.classList.add("ativa");

    const btnAbrir = document.createElement("button");
    btnAbrir.type = "button";
    btnAbrir.className = "item";
    btnAbrir.textContent = conversa.titulo;
    btnAbrir.title = conversa.titulo;
    btnAbrir.addEventListener("click", () => abrirConversa(conversa.id));

    const btnExcluir = document.createElement("button");
    btnExcluir.type = "button";
    btnExcluir.className = "excluir";
    btnExcluir.textContent = "Ã—";
    btnExcluir.setAttribute("aria-label", `Excluir conversa: ${conversa.titulo}`);
    btnExcluir.addEventListener("click", () => excluirConversa(conversa.id));

    item.append(btnAbrir, btnExcluir);
    lista.appendChild(item);
  }
}

function abrirConversa(id) {
  if (aguardando) return;

  const encontrada = conversas.find((c) => c.id === id);
  if (!encontrada) return;

  atual = encontrada;
  mostrarConversa();
  renderizarLista();
  fecharMenu();
  campo.focus();
}

function novaConversa() {
  if (aguardando) return;

  atual = criarConversa();
  mostrarConversa();
  renderizarLista();
  fecharMenu();
  campo.value = "";
  ajustarAltura();
  campo.focus();
}

function excluirConversa(id) {
  if (aguardando) return;
  if (!confirm("Excluir esta conversa?")) return;

  conversas = conversas.filter((c) => c.id !== id);
  salvarConversas();

  if (atual.id === id) {
    novaConversa();
  } else {
    renderizarLista();
  }
}

function fecharMenu() { document.body.classList.remove("menu-aberto"); }
function alternarMenu() { document.body.classList.toggle("menu-aberto"); }

async function chamarApi(mensagens) {

  const chave = API_KEY.trim();

  if (!chave || chave === "COLE_SUA_CHAVE_AQUI") {
    throw new Error("VocÃª ainda nÃ£o colocou sua chave de API no arquivo config.js.");
  }
  if (API_URL.includes("groq.com") && !chave.startsWith("gsk_")) {
    throw new Error("Essa chave nÃ£o parece ser da Groq (ela deve comeÃ§ar com gsk_). Gere uma em console.groq.com/keys.");
  }

  const resposta = await fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${chave}`
    },
    body: JSON.stringify({
      model: MODEL,
      messages: mensagens
    })
  });

  if (!resposta.ok) {
    let detalhe = "";
    try {
      const corpo = await resposta.json();
      detalhe = corpo.error?.message || "";
    } catch (e) {

    }
    const base = descreverErroHttp(resposta.status);
    throw new Error(detalhe ? `${base}\nDetalhe da API: ${detalhe}` : base);
  }

  const dados = await resposta.json();
  const texto = dados.choices?.[0]?.message?.content;

  if (!texto) {
    throw new Error("A API respondeu em um formato inesperado.");
  }
  return texto;
}

function descreverErroHttp(status) {
  if (status === 401) return "Chave de API invÃ¡lida. Confira o arquivo config.js.";
  if (status === 404) return "Modelo ou endereÃ§o da API nÃ£o encontrado. Confira o config.js.";
  if (status === 429) return "Limite de requisiÃ§Ãµes atingido. Aguarde um pouco e tente de novo.";
  if (status >= 500)  return "O servidor da API estÃ¡ com problemas. Tente novamente em instantes.";
  return `Erro na comunicaÃ§Ã£o com a API (cÃ³digo ${status}).`;
}

async function enviarMensagem(texto) {

  adicionarBalao(texto, "usuario");
  atual.mensagens.push({ role: "user", content: texto });

  definirAguardando(true);
  const indicador = mostrarCarregando();

  try {

    const respostaIA = await chamarApi([PROMPT_SISTEMA, ...atual.mensagens]);

    atual.mensagens.push({ role: "assistant", content: respostaIA });
    indicador.remove();
    adicionarBalao(respostaIA, "ia");

    if (atual.mensagens.length === 2) {
      atual.titulo = gerarTitulo(texto);
    }
    conversas = conversas.filter((c) => c.id !== atual.id);
    conversas.unshift(atual);
    salvarConversas();
    renderizarLista();

  } catch (erro) {
    console.error("Erro:", erro);

    atual.mensagens.pop();
    indicador.remove();

    const mensagemErro = erro instanceof TypeError
      ? "NÃ£o foi possÃ­vel conectar. Verifique sua internet e tente de novo."
      : erro.message;

    adicionarBalao(mensagemErro, "erro");

  } finally {
    definirAguardando(false);
  }
}

form.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const texto = campo.value.trim();
  if (!texto || aguardando) return;

  campo.value = "";
  ajustarAltura();
  enviarMensagem(texto);
});

campo.addEventListener("keydown", (evento) => {
  if (evento.key === "Enter" && !evento.shiftKey) {
    evento.preventDefault();
    form.requestSubmit();
  }
});

campo.addEventListener("input", ajustarAltura);

btnNova.addEventListener("click", novaConversa);
btnMenu.addEventListener("click", alternarMenu);
fundo.addEventListener("click", fecharMenu);

renderizarLista();
mostrarConversa();
