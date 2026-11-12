const btneditar = document.getElementsByClassName("btn-editar");
const btneliminar = document.getElementsByClassName("btn-eliminar");

for (const editar of btneditar) {
  editar.addEventListener("click", () => {
    const id = parseInt(editar.dataset.id);
    abrirmodaleditar(id);
  });
}

for (const eliminar of btneliminar) {
  eliminar.addEventListener("click", () => {
    const id = parseInt(eliminar.dataset.id);
    abrirmodaldeletar(id);
  });
}

// ---------- EDITAR ----------
async function abrirmodaleditar(id) {
  const csrftoken = document.querySelector('meta[name="csrf-token"]').content;

  try {
    const resposta = await fetch("/produtos/editar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify(id),
    });

    if (!resposta.ok) throw new Error("Erro " + resposta.status);

    const dados = await resposta.json();
    const { ok, Produto } = dados;
    if (!ok) throw new Error("Resposta inválida");

    montarmodaleditar(Produto);
  } catch (erro) {
    console.error(erro);
  }
}

function montarmodaleditar(p) {
  const antigo = document.getElementById("modal-editar");
  if (antigo) antigo.remove();

  const modal = document.createElement("div");
  modal.id = "modal-editar";
  modal.className = "modal-overlay";

  modal.innerHTML = `
    <div class="modal-caixa modal-form">
      <h3>Editar produto</h3>

      <label class="campo">
        <span>Nome</span>
        <input type="text" id="edit-nome" maxlength="200">
      </label>

      <div class="campo-linha">
        <label class="campo">
          <span>Categoria</span>
          <input type="text" id="edit-categoria" maxlength="200">
        </label>
        <label class="campo">
          <span>ML</span>
          <input type="text" id="edit-ml" maxlength="50">
        </label>
      </div>

      <div class="campo-linha">
        <label class="campo">
          <span>Preço (Kz)</span>
          <input type="number" id="edit-preco" min="0" step="0.01">
        </label>
        <label class="campo">
          <span>Quantidade</span>
          <input type="number" id="edit-quantidade" min="0" step="1">
        </label>
      </div>

      <div class="campo">
        <span>Imagem</span>
        <div class="img-area">
          <img id="edit-img-preview" class="img-preview" alt="Pré-visualização" hidden>
          <input type="file" id="edit-img" accept="image/*">
        </div>
      </div>

      <p class="erro-form" id="edit-erro"></p>

      <div class="modal-botoes">
        <button type="button" class="modal-btn modal-btn-nao" id="edit-cancelar">Cancelar</button>
        <button type="button" class="modal-btn modal-btn-guardar" id="edit-guardar">Guardar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // preencher por JS evita problemas com aspas e caracteres especiais
  document.getElementById("edit-nome").value = p.nome || "";
  document.getElementById("edit-categoria").value = p.categoria || "";
  document.getElementById("edit-ml").value = p.ml || "";
  document.getElementById("edit-preco").value = p.preco ?? "";
  document.getElementById("edit-quantidade").value = p.quantidade ?? "";

  const preview = document.getElementById("edit-img-preview");
  const inputImg = document.getElementById("edit-img");

  if (p.img) {
    preview.src = p.img;
    preview.hidden = false;
  }

  // mostrar a imagem nova escolhida
  inputImg.addEventListener("change", () => {
    const ficheiro = inputImg.files[0];
    if (ficheiro) {
      preview.src = URL.createObjectURL(ficheiro);
      preview.hidden = false;
    }
  });

  document.getElementById("edit-cancelar").addEventListener("click", () => {
    modal.remove();
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });

  document.getElementById("edit-guardar").addEventListener("click", () => {
    const erro = document.getElementById("edit-erro");
    const nome = document.getElementById("edit-nome").value.trim();
    const categoria = document.getElementById("edit-categoria").value.trim();
    const ml = document.getElementById("edit-ml").value.trim();
    const precoTxt = document.getElementById("edit-preco").value.trim();
    const quantidadeTxt = document.getElementById("edit-quantidade").value.trim();
    const ficheiro = inputImg.files[0];

    erro.textContent = "";

    if (nome === "") {
      erro.textContent = "O nome é obrigatório.";
      return;
    }
    if (nome.length > 200) {
      erro.textContent = "O nome é demasiado longo.";
      return;
    }

    const preco = parseFloat(precoTxt);
    if (isNaN(preco) || preco <= 0) {
      erro.textContent = "Introduza um preço válido, maior que zero.";
      return;
    }

    if (quantidadeTxt !== "") {
      const quantidade = Number(quantidadeTxt);
      if (!Number.isInteger(quantidade) || quantidade < 0) {
        erro.textContent = "A quantidade tem de ser um inteiro, 0 ou mais.";
        return;
      }
    }

    if (ficheiro) {
      if (!ficheiro.type.startsWith("image/")) {
        erro.textContent = "O ficheiro tem de ser uma imagem.";
        return;
      }
      if (ficheiro.size > 2 * 1024 * 1024) {
        erro.textContent = "A imagem não pode ter mais de 2 MB.";
        return;
      }
    }

    const semAlteracoes =
      nome === (p.nome || "") &&
      categoria === (p.categoria || "") &&
      ml === (p.ml || "") &&
      preco === Number(p.preco) &&
      quantidadeTxt === String(p.quantidade ?? "") &&
      !ficheiro;
    if (semAlteracoes) {
      erro.textContent = "Não fez nenhuma alteração.";
      return;
    }

    const fd = new FormData();
    fd.append("id", p.id);
    fd.append("nome", nome);
    fd.append("categoria", categoria);
    fd.append("ml", ml);
    fd.append("preco", precoTxt);
    fd.append("quantidade", quantidadeTxt);
    if (ficheiro) fd.append("img", ficheiro);

    guardarproduto(fd);
  });
}

async function guardarproduto(fd) {
  const csrftoken = document.querySelector('meta[name="csrf-token"]').content;
  const erro = document.getElementById("edit-erro");

  try {
    // com FormData NÃO se define Content-Type: o navegador põe o boundary sozinho
    const resposta = await fetch("/produtos/atualizar/", {
      method: "POST",
      headers: { "X-CSRFToken": csrftoken },
      body: fd,
    });

    const dados = await resposta.json();

    if (!resposta.ok || !dados.ok) {
      erro.textContent = dados.mensagem || "Erro ao guardar.";
      return;
    }

    location.reload();
  } catch (e) {
    console.error(e);
    erro.textContent = "Erro de ligação ao servidor.";
  }
}

// ---------- ELIMINAR ----------
function abrirmodaldeletar(id) {
  const antigo = document.getElementById("modal-eliminar");
  if (antigo) antigo.remove();

  const botao = document.querySelector(`.btn-eliminar[data-id="${id}"]`);
  const nome = botao ? botao.dataset.nome : "";

  const modal = document.createElement("div");
  modal.id = "modal-eliminar";
  modal.className = "modal-overlay";

  modal.innerHTML = `
    <div class="modal-caixa">
      <h3>Eliminar produto</h3>
      <p>Tem a certeza que deseja eliminar este produto?</p>
      <p><strong id="eliminar-nome"></strong></p>
      <div class="modal-botoes">
        <button type="button" class="modal-btn modal-btn-nao" id="nao">Não</button>
        <button type="button" class="modal-btn modal-btn-sim" id="sim">Sim</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  document.getElementById("eliminar-nome").textContent = nome || "";

  document.getElementById("nao").addEventListener("click", () => {
    modal.remove();
  });

  modal.addEventListener("click", (e) => {
    if (e.target === modal) modal.remove();
  });

  document.getElementById("sim").addEventListener("click", () => {
    apagar(id, modal);
  });
}

async function apagar(id, modal) {
  const csrftoken = document.querySelector('meta[name="csrf-token"]').content;

  try {
    const resposta = await fetch("/produtos/apagar/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify({ id: id }),
    });

    if (!resposta.ok) throw new Error("Erro " + resposta.status);

    const dados = await resposta.json();
    console.log(dados);

    modal.remove();
    const botao = document.querySelector(`.btn-eliminar[data-id="${id}"]`);
    if (botao) botao.closest("tr").remove();
  } catch (erro) {
    console.error(erro);
  }
}