const cat = document.getElementById("categoria")

cat.addEventListener("change", (evt) => {
    // remove o select de tamanho anterior, se existir
    const antigo = document.getElementById("campo-tamanho")
    if (antigo) antigo.remove()

    if (cat.value == "perfume") {
        const campo = document.createElement("div")
        campo.className = "campo"
        campo.id = "campo-tamanho"

        const label = document.createElement("label")
        label.setAttribute("for", "tamanho")
        label.textContent = "Tamanho"

        const select = document.createElement("select")
        select.name = "tamanho"
        select.id = "tamanho"
        select.required = true

        const opcaoInicial = document.createElement("option")
        opcaoInicial.value = ""
        opcaoInicial.textContent = "Selecione o tamanho"
        opcaoInicial.selected = true
        opcaoInicial.disabled = true
        select.appendChild(opcaoInicial)

        const tamanhos = ["25ml", "35ml", "50ml", "100ml"]
        tamanhos.forEach((t) => {
            const op = document.createElement("option")
            op.value = t
            op.textContent = t
            select.appendChild(op)
        })

        campo.appendChild(label)
        campo.appendChild(select)

        // insere logo a seguir ao campo da categoria
        cat.parentElement.insertAdjacentElement("afterend", campo)
    }
})