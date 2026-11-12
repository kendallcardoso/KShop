const lista = document.getElementById("lista-produtos");
const quantidade = document.getElementById("carrinho-qtd");
const painel = document.getElementById("carrinho");
const overlay = document.getElementById("overlay");
const carrinho_itens = document.getElementById("carrinho-itens");
const totalEl = document.getElementById("carrinho-total");

// ---------- Estado (carrega o que ficou guardado) ----------
let carrinho = [];

try {
  carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
} catch (erro) {
  carrinho = [];
}

function guardarCarrinho() {
  try {
    localStorage.setItem("carrinho", JSON.stringify(carrinho));
  } catch (erro) {
    console.warn("Não foi possível guardar o carrinho", erro);
  }
}

// ---------- Utilitários ----------
function formatarKz(valor) {
  return Number(valor).toLocaleString("pt-AO", { style: "currency", currency: "AOA" });
}

function criarBotao(texto, classe, aoClicar) {
  const botao = document.createElement("button");
  botao.type = "button";
  botao.textContent = texto;
  if (classe) botao.className = classe;
  botao.addEventListener("click", aoClicar);
  return botao;
}

// ---------- Painel do carrinho ----------
function abrirCarrinho() {
  painel.classList.add("aberto");
  overlay.classList.add("aberto");
  painel.setAttribute("aria-hidden", "false");
}

function fecharCarrinho() {
  painel.classList.remove("aberto");
  overlay.classList.remove("aberto");
  painel.setAttribute("aria-hidden", "true");
}

document.getElementById("abrir-carrinho").addEventListener("click", abrirCarrinho);
document.getElementById("fechar-carrinho").addEventListener("click", fecharCarrinho);
overlay.addEventListener("click", fecharCarrinho);
document.addEventListener("keydown", evento => {
  if (evento.key === "Escape") fecharCarrinho();
});

// ---------- Contador do ícone ----------
const atualizarquantidade = () => {
  const qtd = carrinho.reduce((soma, ele) => soma + ele.qtd, 0);
  quantidade.textContent = qtd;
};

// ---------- Desenhar os itens ----------
function renderizarCarrinho() {
  carrinho_itens.textContent = "";

  if (carrinho.length === 0) {
    const vazio = document.createElement("li");
    vazio.className = "carrinho-vazio";
    vazio.textContent = "O carrinho está vazio.";
    carrinho_itens.appendChild(vazio);
  }

  carrinho.forEach(item => {
    const li = document.createElement("li");
    li.className = "item-carrinho";

    const nome = document.createElement("span");
    nome.className = "item-nome";
    nome.textContent = item.nome;

    const preco = document.createElement("span");
    preco.className = "item-preco";
    preco.textContent = formatarKz(Number(item.preco) * item.qtd);

    const qtd = document.createElement("span");
    qtd.className = "item-qtd";
    qtd.textContent = item.qtd;

    const controlos = document.createElement("div");
    controlos.className = "item-controlos";
    controlos.append(
      criarBotao("−", "", () => alterarQtd(item.id, -1)),
      qtd,
      criarBotao("+", "", () => alterarQtd(item.id, 1)),
      criarBotao("Remover", "btn-remover", () => removerItem(item.id))
    );

    li.append(nome, preco, controlos);
    carrinho_itens.appendChild(li);
  });

  const total = carrinho.reduce((soma, i) => soma + Number(i.preco) * i.qtd, 0);
  totalEl.textContent = formatarKz(total);
}

// Atualiza tudo de uma vez depois de qualquer mudança
function atualizarTudo() {
  guardarCarrinho();
  atualizarquantidade();
  renderizarCarrinho();
}

// ---------- Ações do carrinho ----------
function alterarQtd(id, delta) {
  const item = carrinho.find(i => i.id === id);
  if (!item) return;

  item.qtd += delta;
  if (item.qtd <= 0) {
    carrinho = carrinho.filter(i => i.id !== id);
  }

  atualizarTudo();
}

function removerItem(id) {
  carrinho = carrinho.filter(i => i.id !== id);
  atualizarTudo();
}

let toastTimeout;

const mostrarToast = (produto) => {
  // reutiliza o mesmo elemento, para cliques seguidos não empilharem avisos
  let toast = document.getElementById("toast-carrinho");

  if (!toast) {
    toast = document.createElement("div");
    toast.id = "toast-carrinho";
    toast.innerHTML = `
      <img id="toast-img" alt="">
      <span id="toast-texto"></span>
    `;
    document.body.appendChild(toast);
  }

  const img = document.getElementById("toast-img");
  const texto = document.getElementById("toast-texto");

  // textContent evita problemas com caracteres especiais no nome
  texto.textContent = `${produto.nome || "Produto"} adicionado ao carrinho`;

  if (produto.img) {
    img.src = produto.img;
    img.hidden = false;
  } else {
    img.hidden = true;
  }

  // reinicia a animação e o temporizador se já estiver visível
  toast.classList.remove("toast-visivel");
  void toast.offsetWidth;
  toast.classList.add("toast-visivel");

  clearTimeout(toastTimeout);
  toastTimeout = setTimeout(() => {
    toast.classList.remove("toast-visivel");
  }, 2000);
};

const addcarrinho = (produto) => {
  const existe = carrinho.find(e => e.id === produto.id);

  if (existe) {
    existe.qtd += 1;
  } else {
    carrinho.push({ ...produto, qtd: 1 });
  }

  atualizarTudo();
  mostrarToast(produto);
};

// ---------- Produtos ----------
fetch("/api/produtos/")
  .then(resposta => {
    if (!resposta.ok) throw new Error("Erro " + resposta.status);
    return resposta.json();
  })
  .then(dados => {
    dados.forEach(produto => {
      const card = document.createElement("article");
      card.className = "card-produto";

      const imagem = document.createElement("img");
      imagem.className = "img-produto";
      imagem.src = produto.imagem || "/static/img/sem-imagem.png";
      imagem.alt = produto.nome;
      imagem.loading = "lazy";

      const titulo = document.createElement("h3");
      titulo.textContent = produto.nome;

      const preco = document.createElement("p");
      preco.className = "preco";
      preco.textContent = formatarKz(produto.preco);

      card.dataset.id = produto.id;

      const ml = document.createElement("p");
      ml.className = "ml";
      ml.textContent = produto.ml + " (ml)";

      const botao = document.createElement("button");
      botao.textContent = "Adicionar ao carrinho";
      botao.addEventListener("click", () => addcarrinho(produto));

      card.append(imagem, titulo, preco, ml, botao);
      lista.appendChild(card);
    });
  })
  .catch(erro => {
    console.error("Falha ao carregar produtos:", erro);
    lista.textContent = "Não foi possível carregar os produtos.";
  });

// ---------- Arranque ----------
atualizarquantidade();
renderizarCarrinho();

// ---------- Carrossel do hero ----------
const INTERVALO = 7000; // tempo entre trocas, em milissegundos

const heroEl = document.getElementById("hero");
const heroImg = document.getElementById("hero-img");
const heroTitulo = document.getElementById("hero-titulo");
const heroDescricao = document.getElementById("hero-descricao");
const heroBotao = document.querySelector(".hero-texto .btn-hero");
const pontosEl = document.getElementById("hero-pontos");
const elementosHero = [heroImg, heroTitulo, heroDescricao, heroBotao];

let indiceSlide = 0;
let timer = null;
let aTrocar = false;

// pré-carrega as imagens para não piscar na troca
SLIDES.forEach(slide => {
  const pre = new Image();
  pre.src = slide.img;
});

function animar(elemento, classe, atraso) {
  elemento.classList.remove("entrar", "sair");
  elemento.style.animationDelay = atraso + "s";
  void elemento.offsetWidth; // reinicia a animação
  elemento.classList.add(classe);
}

const pontos = SLIDES.map((_, i) => {
  const ponto = document.createElement("button");
  ponto.type = "button";
  ponto.className = "ponto" + (i === 0 ? " ativo" : "");
  ponto.setAttribute("aria-label", "Ver perfume " + (i + 1));
  ponto.addEventListener("click", () => {
    irPara(i);
    iniciarTimer();
  });
  pontosEl.appendChild(ponto);
  return ponto;
});

function irPara(novo) {
  if (aTrocar || novo === indiceSlide) return;
  aTrocar = true;

  elementosHero.forEach(el => animar(el, "sair", 0));

  setTimeout(() => {
    indiceSlide = novo;
    const slide = SLIDES[novo];

    heroImg.src = slide.img;
    heroTitulo.textContent = slide.titulo;
    heroDescricao.textContent = slide.texto;
    heroEl.style.setProperty("--hero-bg", slide.cor);
    pontos.forEach((p, i) => p.classList.toggle("ativo", i === novo));

    elementosHero.forEach((el, i) => animar(el, "entrar", i * 0.12));

    setTimeout(() => { aTrocar = false; }, 1100);
  }, 600);
}

function proximo() {
  irPara((indiceSlide + 1) % SLIDES.length);
}

function iniciarTimer() {
  clearInterval(timer);
  if (SLIDES.length > 1) {
    timer = setInterval(proximo, INTERVALO);
  }
}

// pára quando o rato está em cima do hero
heroEl.addEventListener("mouseenter", () => clearInterval(timer));
heroEl.addEventListener("mouseleave", iniciarTimer);

// entrada bonita logo ao abrir a página
elementosHero.forEach((el, i) => animar(el, "entrar", i * 0.12));
heroEl.style.setProperty("--hero-bg", SLIDES[0].cor);
iniciarTimer();

// ---------- Submenus ----------
const menus = document.querySelectorAll(".menu-dropdown");

function fecharSubmenus() {
  menus.forEach(menu => {
    menu.removeAttribute("open");
  });
}

// Fechar os outros submenus ao abrir um
menus.forEach(menu => {
  menu.addEventListener("toggle", () => {
    if (menu.open) {
      menus.forEach(outroMenu => {
        if (outroMenu !== menu) {
          outroMenu.removeAttribute("open");
        }
      });
    }
  });
});

// Fechar ao clicar fora
document.addEventListener("click", evento => {
  const clicouDentro = [...menus].some(menu => menu.contains(evento.target));
  if (!clicouDentro) {
    fecharSubmenus();
  }
});

// Fechar ao pressionar Escape
document.addEventListener("keydown", evento => {
  if (evento.key === "Escape") {
    fecharSubmenus();
  }
});

// ---------- Produtos por categoria ----------
function renderizarProdutos(p) {
  const divprodutos = document.getElementById("lista-produtos");
  divprodutos.innerHTML = "";

  p.forEach(produto => {
    const card = document.createElement("article");
    card.className = "card-produto";

    const imagem = document.createElement("img");
    imagem.className = "img-produto";
    imagem.src = produto.imagem || "/static/img/sem-imagem.png";
    imagem.alt = produto.nome;
    imagem.loading = "lazy";

    const titulo = document.createElement("h3");
    titulo.textContent = produto.nome;

    const preco = document.createElement("p");
    preco.className = "preco";
    preco.textContent = formatarKz(produto.preco);

    const botao = document.createElement("button");
    botao.textContent = "Adicionar ao carrinho";
    botao.addEventListener("click", () => addcarrinho(produto));

    card.append(imagem, titulo, preco, botao);
    lista.appendChild(card);
  });
}

const esperar = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function CarregarProduto(categoria) {
  const spinner = document.getElementById("spinner");
  const container = document.getElementById("lista-produtos");

  spinner.style.display = "block";
  container.innerHTML = "";

  try {
    const carregar = await fetch(`/produto/${categoria}`);
    if (!carregar.ok) {
      throw new Error("Erro na requisição");
    }
    const produtos = await carregar.json();
    await esperar(1000);
    renderizarProdutos(produtos);
  } catch (error) {
    console.error(error);
  } finally {
    spinner.style.display = "none";
  }
}

const btncat = document.querySelectorAll(".perfume");
for (const btn of btncat) {
  btn.addEventListener("click", () => {
    CarregarProduto(btn.dataset.categoria);
    const menu = btn.closest("details");
    if (menu) {
      menu.removeAttribute("open");
    }
  });
}

// ---------- Finalizar compra ----------
async function finalizar(carrinho) {

    const csrftoken = document.querySelector('meta[name="csrf-token"]').content;

    const spinner = document.getElementById("spinner");
    const btnFinalizar = document.getElementById("finalizar");

    try {

        // Mostrar spinner
        spinner.style.display = "block";

        // Impedir novos cliques durante o processamento
        btnFinalizar.disabled = true;

        console.log("Carrinho enviado:", carrinho);
        console.log("JSON:", JSON.stringify(carrinho));

        const resposta = await fetch("/finalizar/compra", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": csrftoken,
            },
            body: JSON.stringify(carrinho),
        });

        if (resposta.status === 401) {
            const dados = await resposta.json();

            window.location.href = dados.login_url;
            return;
        }

        if (!resposta.ok) {
            throw new Error("Erro ao submeter o carrinho");
        }

        const dados = await resposta.json();

        console.log("Pedido criado com sucesso", dados);

        // Limpar carrinho depois da confirmação do servidor
        carrinho.length = 0;

        atualizarTudo();
        fecharCarrinho();

        window.location.href = "/";

    } catch (error) {

        console.error("Erro ao finalizar compra:", error);

    } finally {

        // Esconder spinner
        spinner.style.display = "none";

        // Reativar botão
        btnFinalizar.disabled = false;
    }
}

const finalizarvenda = document.getElementById("finalizar");
finalizarvenda.addEventListener("click", () => {
  if (carrinho.length === 0) {
    carrinho_itens.innerHTML = "";
    const vazio = document.createElement("li");
    vazio.className = "carrinho-vazio";
    vazio.textContent = "O carrinho está vazio.";
    carrinho_itens.appendChild(vazio);
    return;
  }

  finalizar(carrinho);
});

// ---------- Pedidos ativos (sino) ----------
const painelNotif = document.getElementById("painel-notif");
const notifQtd = document.getElementById("notificacao-qtd");
const notifLista = document.getElementById("notif-lista");
const btnNotif = document.getElementById("abrir-notificacoes");

function definirNotificacoes(n) {
  if (!notifQtd) return;
  notifQtd.textContent = n;
  notifQtd.hidden = n <= 0;
}

function renderizarPedidos(pedidos) {
  notifLista.textContent = "";

  if (pedidos.length === 0) {
    const vazio = document.createElement("li");
    vazio.className = "notif-vazio";
    vazio.textContent = "Sem pedidos ativos.";
    notifLista.appendChild(vazio);
    return;
  }

  pedidos.forEach(p => {
    const li = document.createElement("li");
    li.className = "notif-item";

    const titulo = document.createElement("strong");
    titulo.textContent = "Pedido " + p.cod;

    const itens = document.createElement("p");
    itens.textContent = p.itens.map(i => i.quantidade + "x " + i.nome).join(", ");

    const total = document.createElement("p");
    total.textContent = "Total: " + formatarKz(p.total);

    const data = document.createElement("small");
    data.textContent = p.data;

    const btnCancelar = criarBotao("Cancelar pedido", "btn-remover", () => cancelarPedido(p.id));

    li.append(titulo, itens, total, data, btnCancelar);
    notifLista.appendChild(li);
  });
}

function carregarNotificacoes() {
  return fetch("/api/notificacoes/")
    .then(resposta => {
      if (!resposta.ok) throw new Error("Erro " + resposta.status);
      return resposta.json();
    })
    .then(dados => {
      renderizarPedidos(dados.pedidos);
      definirNotificacoes(dados.total);
    })
    .catch(erro => console.error("Falha ao carregar pedidos:", erro));
}

function cancelarPedido(id) {
  if (!confirm("Precione OK para cancelar o pedido")) return;

  const csrftoken = document.querySelector('meta[name="csrf-token"]').content;

  fetch("/api/pedidos/" + id + "/cancelar/", {
    method: "POST",
    headers: { "X-CSRFToken": csrftoken },
  })
    .then(resposta => {
      if (!resposta.ok) throw new Error("Erro " + resposta.status);
      return resposta.json();
    })
    .then(() => carregarNotificacoes())
    .catch(erro => console.error("Falha ao cancelar:", erro));
}

function abrirNotificacoes() {
  painelNotif.classList.add("aberto");
  overlay.classList.add("aberto");
  painelNotif.setAttribute("aria-hidden", "false");
  carregarNotificacoes();
}

function fecharNotificacoes() {
  painelNotif.classList.remove("aberto");
  overlay.classList.remove("aberto");
  painelNotif.setAttribute("aria-hidden", "true");
}

// só existe quando há sessão
if (btnNotif && painelNotif) {
  btnNotif.addEventListener("click", abrirNotificacoes);
  document.getElementById("fechar-notificacoes").addEventListener("click", fecharNotificacoes);
  overlay.addEventListener("click", fecharNotificacoes);
  document.addEventListener("keydown", evento => {
    if (evento.key === "Escape") fecharNotificacoes();
  });

  carregarNotificacoes(); // número inicial do badge
}