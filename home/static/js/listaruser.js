const eliminar = document.getElementsByClassName("btn-eliminar")
const editar = document.getElementsByClassName("btn-editar")
function apagar(id){
        async function eliminar(id) {
            const csrftoken = document.querySelector('meta[name="csrf-token"]').content;
            try {
                const resposta = await fetch("/apagar/user",{
                    method: "POST",
                    headers:{
                        "Content-Type": "aplication/json",
                        "X-CSRF-Token":csrftoken,
                    },
                    body:JSON.stringify(id)
                });

                 
            } catch (error) {
                console.log(error)
            }
        }
    nao.addEventListener("click",()=>{
        
    })
}
function mostrarmodal(email,id) {
  // remove um modal anterior, se existir
  const antigo = document.getElementById("modal-eliminar");
  if (antigo) antigo.remove();

  const modal = document.createElement("div");
  modal.id = "modal-eliminar";
  modal.className = "modal-overlay";

  modal.innerHTML = `
    <div class="modal-caixa">
      <h3>Eliminar utilizador</h3>
      <p>Tem a certeza que deseja eliminar este utilizador? \n${ email }</p>
      <div class="modal-botoes">
        <button type="button" class="modal-btn modal-btn-nao" id="nao">Não</button>
        <button type="button" class="modal-btn modal-btn-sim" data-id="${id}" id="sim">Sim</button>
      </div>
    </div>
  `;

    document.body.appendChild(modal);
    document.getElementById("sim").addEventListener("click", ()=>{
    apagar(id , modal)
  }) 
    document.getElementById("nao").addEventListener("click",()=>{
        modal.remove()
    })
}
async function apagar(id , modal){
        const csrftoken = document.querySelector('meta[name="csrf-token"]').content;
       try {
            const resposta = await fetch("/apagar/user", {
                method:"POST",
                headers:{
                    "Content-type":"application/json",
                    "X-CSRFToken":csrftoken
                },
                body:JSON.stringify(id)
            })
            if (!resposta.ok){
                throw new Error("Erro ao iliminar")
            }
            const dados = await resposta.json()
            console.log(dados)
            modal.remove()
            location.reload()
       } catch (error) {
            console.log(error)
       }
    }
for ( const btn of eliminar){
    btn.addEventListener("click",(evt)=>{
       const id = parseInt(btn.dataset.id)
       const email = btn.dataset.user
        mostrarmodal(email, id)
    })
}
async function modaleditar(id) {
  const csrftoken = document.querySelector('meta[name="csrf-token"]').content;

  try {
    const resposta = await fetch("/users/editar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-CSRFToken": csrftoken,
      },
      body: JSON.stringify(id),
    });

    if (!resposta.ok) throw new Error("Erro " + resposta.status);

    const dados = await resposta.json();
    const { ok, User } = dados;
    if (!ok) throw new Error("Resposta inválida");

    // aceita tanto objeto como lista com um elemento
    const u = Array.isArray(User) ? User[0] : User;
    abrirModalEditar(u);
  } catch (erro) {
    console.error(erro);
  }
}

function abrirModalEditar(u) {
  const antigo = document.getElementById("modal-editar");
  if (antigo) antigo.remove();

  const modal = document.createElement("div");
  modal.id = "modal-editar";
  modal.className = "modal-overlay";

  modal.innerHTML = `
    <div class="modal-caixa modal-form">
      <h3>Editar utilizador</h3>

      <label class="campo">
        <span>Email</span>
        <input type="email" id="edit-email">
      </label>

      <label class="campo-check">
        <input type="checkbox" id="edit-is-staff">
        <span>Administrador (is_staff)</span>
      </label>

      <label class="campo-check">
        <input type="checkbox" id="edit-is-active">
        <span>Ativo (is_active)</span>
      </label>
        <p class="erro-form" id="edit-erro"></p>

            <div class="modal-botoes">
            ...
        </div>
      <div class="modal-botoes">
        <button type="button" class="modal-btn modal-btn-nao" id="edit-cancelar">Cancelar</button>
        <button type="button" class="modal-btn modal-btn-guardar" id="edit-guardar">Guardar</button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
  document.getElementById("edit-email").value = u.email || "";
  document.getElementById("edit-is-staff").checked = !!u.is_staff;
  document.getElementById("edit-is-active").checked = !!u.is_active;
  document.getElementById("edit-guardar").addEventListener("click",()=>{

  })
  document.getElementById("edit-cancelar").addEventListener("click",()=>modal.remove())
  document.getElementById("edit-guardar").addEventListener("click", () => {
  const erro = document.getElementById("edit-erro");
  const email = document.getElementById("edit-email").value.trim();
  const isStaff = document.getElementById("edit-is-staff").checked;
  const isActive = document.getElementById("edit-is-active").checked;

  erro.textContent = "";

  // 1. email obrigatório
  if (email === "") {
    erro.textContent = "O email é obrigatório.";
    return;
  }

  // 2. tamanho máximo
  if (email.length > 254) {
    erro.textContent = "O email é demasiado longo.";
    return;
  }

  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!regexEmail.test(email)) {
    erro.textContent = "Introduza um email válido.";
    return;
  }


  const semAlteracoes =
    email === (u.email || "") &&
    isStaff === !!u.is_staff &&
    isActive === !!u.is_active;

  if (semAlteracoes) {
    erro.textContent = "Não fez nenhuma alteração.";
    return;
  }

  if (u.is_staff && !isStaff) {
    if (!confirm("Vai remover as permissões de administrador. Continuar?")) return;
  }

 
  const dadosNovos = { id: u.id, email: email, is_staff: isStaff, is_active: isActive };
  console.log(dadosNovos);
});
}
for (const btneditar of editar){
    btneditar.addEventListener("click",()=>{
        const id = parseInt(btneditar.dataset.iduser)
        modaleditar(id)
    })
}