import json
from decimal import Decimal
from datetime import datetime
from django.contrib.auth import login , authenticate
from django.contrib.auth.models import User
from django.core.exceptions import ValidationError
from django.core.validators import validate_email
from django.db import transaction
from django.contrib.auth import get_user_model
from django.http import JsonResponse
from django.shortcuts import render, redirect
from django.urls import reverse
from django.contrib import messages
from decimal import Decimal
from django.db import transaction
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.decorators import login_required
from django.utils.http import url_has_allowed_host_and_scheme
from django.contrib.auth.decorators import user_passes_test
from .models import Produto, Pedido, ItemPedido
Usuario = get_user_model()
from django.core.mail import send_mail
from django.conf import settings
@login_required
def cadastrarusers(request):
    if request.method == "POST":
        email = request.POST.get("email")
        password = request.POST.get("password")
        confirmar = request.POST.get("confirmar")
        if password != confirmar:
            return render(request, "home/cadastraruser.html", {
                "sms": "As palavras-passe não coincidem!",
                "status": "of"
            })

        if Usuario.objects.filter(email=email).exists():
            return render(request, "home/cadastraruser.html", {
                "sms": "Este nome de utilizador já existe!",
                "status": "of"
            })

        usuario = Usuario.objects.create_user(
            username=email,
            email=email,
            password=password,
            is_superuser= True

        )

        return render(request, "home/cadastraruser.html", {
            "sms": "Utilizador cadastrado com sucesso!",
            "status": "ok"
        })

    return render(request, "home/cadastraruser.html")
def view_home(request):
    return render(request, "home/index.html")


def api_produtos(request):
    produtos = Produto.objects.all()
    pr = [
        {
            "id": p.id,
            "nome": p.nome,
            "preco": p.preco,
            "ml": p.ml,
            "imagem": p.img.url if p.img else "",
        }
        for p in produtos
    ]
    return JsonResponse(pr, safe=False)


def nos(request):
    return render(request, "home/quem_somos.html")


def historia(request):
    return render(request, "home/nossa_historia.html")


def missao(request):
    return render(request, "home/missao_valores.html")


def produto(request, categoria):
    pr = Produto.objects.filter(categoria=categoria)
    produtos = [
        {
            "id": p.id,
            "nome": p.nome,
            "preco": p.preco,
            "imagem": p.img.url if p.img else None,
        }
        for p in pr
    ]
    return JsonResponse(produtos, safe=False)

def enviar_email_pedido(pedido, total):
    itens = pedido.itens.select_related('produto')
 
    # Monta a lista de produtos (uma vez, dentro do for)
    produtos = ""
    for item in itens:
        produtos += (
            f"Produto: {item.produto.nome}\n"
            f"Quantidade: {item.quantidade}\n"
            f"Preço unitário: {item.preco} Kz\n"
            f"Subtotal: {item.subtotal} Kz\n"
            "----------------------------\n"
        )
 
    assunto = f"Confirmação do pedido {pedido.cod} | KShop"
 
    # Monta a mensagem completa UMA só vez, fora do for
    mensagem = (
        f"Olá, {pedido.user.username}!\n\n"
        "Obrigado por comprares na KShop Cosméticos.\n"
        "O teu pedido foi registado com sucesso.\n\n"
        "================================\n"
        "INFORMAÇÕES DO PEDIDO\n"
        "================================\n\n"
        f"Número do pedido: {pedido.cod}\n\n"
        "PRODUTOS:\n\n"
        f"{produtos}\n"
        f"TOTAL A PAGAR: {total} Kz\n\n"
        "OBS:Pagamantos apenas,depois de receber o Produto\n"
        "Para o levantamento do produto,é obrigatório a apresentação do Código de pedido\n"
        "Como deseja receber o produto o produto?Informe no Whatsapp\n"
        "Whatsapp- 932021316 \n"
        "Obrigado por escolheres a KShop!\n"
        "KShop Cosméticos"
    )
 
    send_mail(
        assunto,
        mensagem,
        settings.DEFAULT_FROM_EMAIL,
        [pedido.user.email],
    )
def finalizar(request):
    if request.method != "POST":
        return JsonResponse({"erro": "método inválido"}, status=405)

    if not request.user.is_authenticated:
        return JsonResponse(
            {"erro": "nao_autenticado", "login_url": f"{reverse('login')}?next=/"},
            status=401,
        )

    try:
        dados = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"erro": "JSON inválido"}, status=400)

    if not isinstance(dados, list) or not dados:
        return JsonResponse({"erro": "carrinho vazio ou inválido"}, status=400)

    try:
        with transaction.atomic():
            ano =  datetime.now().year
            codigo =f"PD-NV-{ano}"
            pedido = Pedido.objects.create(user=request.user , cod=codigo) 
            pedido.cod = f"{codigo}-{pedido.id}"
            pedido.save()
            total = Decimal("0")

            for i in dados:
                produto_obj = Produto.objects.get(id=i["id"])
                qtd = int(i["qtd"])

                if qtd <= 0:
                    raise ValueError("quantidade inválida")

                ItemPedido.objects.create(
                    pedido=pedido,
                    produto=produto_obj,
                    quantidade=qtd,
                    preco=produto_obj.preco,
                )
                total += Decimal(produto_obj.preco) * qtd

    except (Produto.DoesNotExist, KeyError, ValueError, TypeError):
        return JsonResponse({"erro": "dados inválidos"}, status=400)
    email_enviado = False

    try:
        if pedido.user.email:
            enviar_email_pedido(pedido, total)
            email_enviado = True

    except Exception as erro:
        print("Erro ao enviar email:", erro)

    return JsonResponse(
        {
            "ok": True,
            "pedido_id": pedido.id,
            "total": str(total),
            "email": request.user.email,
        }
    )
    

def api_notificacoes(request):
    if not request.user.is_authenticated:
        return JsonResponse({"erro": "nao_autenticado"}, status=401)

    pedidos = (
        Pedido.objects.filter(user=request.user, estado=True)
        .prefetch_related("itens__produto")
        .order_by("-criado_em")
    )

    dados = []
    for p in pedidos:
        itens = list(p.itens.all())
        dados.append(
            {
                "id": p.id,
                "cod":p.cod,
                "data": p.criado_em.strftime("%d/%m/%Y %H:%M"),
                "itens": [
                    {"nome": i.produto.nome, "quantidade": i.quantidade} for i in itens
                ],
                "total": str(sum(i.preco * i.quantidade for i in itens)),
            }
        )

    return JsonResponse({"pedidos": dados, "total": len(dados)})


def cancelar_pedido(request, pedido_id):
    if request.method != "POST":
        return JsonResponse({"erro": "método inválido"}, status=405)

    if not request.user.is_authenticated:
        return JsonResponse({"erro": "nao_autenticado"}, status=401)

    atualizados = Pedido.objects.filter(
        id=pedido_id, user=request.user, estado=True
    ).update(estado=False)

    if atualizados == 0:
        return JsonResponse({"erro": "pedido não encontrado"}, status=404)

    return JsonResponse({"ok": True})

def cadastro(request):
    next_url = request.POST.get("next") or request.GET.get("next") or "/"
    contexto = {"next": next_url}

    def erro_resposta(msg):
        contexto["erro"] = msg
        return render(request, "registration/cadastro.html", contexto)

    if request.method != "POST":
        return render(request, "registration/cadastro.html", contexto)

    email = request.POST.get("email", "").strip().lower()
    senha = request.POST.get("password", "")
    senha2 = request.POST.get("password2", "")

    if not email or not senha:
        return erro_resposta("Preenche o email e a palavra-passe.")

    try:
        validate_email(email)
    except ValidationError:
        return erro_resposta("Email inválido.")

    if senha != senha2:
        return erro_resposta("As palavras-passe não coincidem.")

    if len(senha) < 8:
        return erro_resposta("A palavra-passe deve ter pelo menos 8 caracteres.")

    if User.objects.filter(username=email).exists():
        return erro_resposta("Já existe uma conta com esse email.")

    user = User.objects.create_user(username=email, email=email, password=senha)
    login(request, user)

    if not url_has_allowed_host_and_scheme(next_url, allowed_hosts={request.get_host()}):
        next_url = "/"
    return redirect(next_url)
@user_passes_test(
    lambda u: u.is_superuser,
    login_url='loginadmin'
)
def adminpage(request):
    ativos = Pedido.objects.filter(
        estado=True
    ).select_related(
        'user'
    ).prefetch_related(
        'itens__produto'
    )
    
    return render(request, 'home/adminpage.html', {
        "pedidos_ativos": ativos
    })
@login_required
def cadastrarprodutos(request):
    if request.method == "POST":

        nome = request.POST.get("nome")
        preco = request.POST.get("preco")
        quantidade = request.POST.get("quantidade")
        categoria = request.POST.get("categoria")
        
        imagem = request.FILES.get("imagem")
        descricao = request.POST.get("descricao")
        ml = request.POST.get("tamanho")
        print(ml)
        existe = Produto.objects.filter(nome = nome,ml = ml,categoria = categoria)
        if not existe:
            Produto.objects.create(nome = nome,preco=preco,quantidade=quantidade,ml=ml,img=imagem,categoria=categoria)
            return render(request,"home/cadastrarp.html",{"sms":f"Produto {nome} cadastrado com sucesso"})
        return render(request,"home/cadastrarp.html",{"sms":f"Produto {nome} á se ecotra cadastrado"})

    return render(request, "home/cadastrarp.html")
@login_required
def listarprod(request):
    pr = Produto.objects.all()
    return render(request,"home/listar.html",{"pr":pr})
@user_passes_test(
    lambda u: u.is_superuser,
    login_url='loginadmin'
)
@login_required
def listarusers(request):
    U = User.objects.all()
    return render(request,"home/listaruser.html",{"users":U})

def loginAdmin(request):
    if request.user.is_authenticated and request.user.is_superuser:
        return redirect('adminpage')

    if request.method == 'POST':

        username = request.POST.get('username')
        password = request.POST.get('password')

        user = authenticate(
            request,
            username=username,
            password=password
        )

        if user is not None:

            if user.is_superuser:
                login(request, user)
                return redirect('adminpage')

            else:
                messages.error(
                    request,
                    'Não tens permissão para aceder ao painel administrativo.'
                )

        else:
            messages.error(
                request,
                'Username ou password incorretos.'
            )

    return render(request, 'home/loginadmin.html')
def apagaruser(request):
    if request.method== "POST":
        id = int(json.loads(request.body))
        u = User.objects.filter(id= id)
        if not u:
            return JsonResponse({"Utilizador não encontrado"})
        u.delete()
        return JsonResponse({f"sms":"Ulizador {id} apagado com sucesso!"})
    return JsonResponse("Erro")
@login_required
def editaru(request):
    if request.method !="POST":
        return JsonResponse({"sms":"erro, metodo errado"})
    id = int(json.loads(request.body))
    existe = User.objects.get(id=id)
    if not existe:
        return JsonResponse({"sms":"user não encontrado"})
    return JsonResponse({"ok":True, "User":{
        "id":existe.id,
        "email":existe.email,
        "is_ative":existe.is_active,
        "is_staff":existe.is_staff
    }})

#### CLAUDE
import json
from decimal import Decimal, InvalidOperation
from functools import wraps

from django.http import JsonResponse
from django.views.decorators.http import require_POST
from PIL import Image

from .models import Produto


def staff_json(view):
    @wraps(view)
    def wrapper(request, *args, **kwargs):
        if not request.user.is_authenticated or not request.user.is_staff:
            return JsonResponse({"ok": False, "mensagem": "Sem permissão"}, status=403)
        return view(request, *args, **kwargs)
    return wrapper


def ler_json(request):
    try:
        return json.loads(request.body)
    except (ValueError, TypeError):
        return None


def erro(mensagem, status=400):
    return JsonResponse({"ok": False, "mensagem": mensagem}, status=status)


@require_POST
@staff_json
def obter_produto(request):
    dados = ler_json(request)
    produto_id = dados.get("id") if isinstance(dados, dict) else dados

    if not isinstance(produto_id, int) or isinstance(produto_id, bool):
        return erro("ID inválido")

    p = Produto.objects.filter(id=produto_id).first()
    if not p:
        return erro("Produto não encontrado", 404)

    return JsonResponse({
        "ok": True,
        "Produto": {
            "id": p.id,
            "nome": p.nome or "",
            "quantidade": p.quantidade,            # int ou None
            "preco": float(p.preco),               # Decimal não é serializável
            "categoria": p.categoria or "",
            "ml": p.ml or "",
            "img": p.img.url if p.img else "",     # só a URL, nunca o objeto
        },
    })


@require_POST
@staff_json
def atualizar_produto(request):
    # vem como FormData (multipart), por isso usa request.POST e request.FILES
    try:
        produto_id = int(request.POST.get("id", ""))
    except ValueError:
        return erro("ID inválido")

    nome = request.POST.get("nome", "").strip()
    categoria = request.POST.get("categoria", "").strip()
    ml = request.POST.get("ml", "").strip()
    preco_txt = request.POST.get("preco", "").strip()
    quantidade_txt = request.POST.get("quantidade", "").strip()

    if not nome:
        return erro("O nome é obrigatório.")
    if len(nome) > 200:
        return erro("O nome é demasiado longo.")
    if len(categoria) > 200:
        return erro("A categoria é demasiado longa.")
    if len(ml) > 50:
        return erro("O campo ml é demasiado longo.")

    try:
        preco = Decimal(preco_txt).quantize(Decimal("0.01"))
    except (InvalidOperation, ValueError):
        return erro("Preço inválido.")
    if preco <= 0 or preco >= Decimal("10000000000000"):   # 15 dígitos, 2 decimais
        return erro("Preço fora do limite permitido.")

    if quantidade_txt == "":
        quantidade = None
    else:
        try:
            quantidade = int(quantidade_txt)
        except ValueError:
            return erro("A quantidade tem de ser um número inteiro.")
        if quantidade < 0:
            return erro("A quantidade não pode ser negativa.")

    p = Produto.objects.filter(id=produto_id).first()
    if not p:
        return erro("Produto não encontrado", 404)

    # imagem nova (opcional)
    img = request.FILES.get("img")
    if img:
        if img.size > 2 * 1024 * 1024:
            return erro("A imagem não pode ter mais de 2 MB.")
        try:
            Image.open(img).verify()   # confirma que é mesmo uma imagem
            img.seek(0)
        except Exception:
            return erro("O ficheiro enviado não é uma imagem válida.")
        p.img = img

    p.nome = nome
    p.categoria = categoria or None
    p.ml = ml or None
    p.preco = preco
    p.quantidade = quantidade
    p.save()

    return JsonResponse({"ok": True, "mensagem": "Produto atualizado"})


@require_POST
@staff_json
def apagar_produto(request):
    dados = ler_json(request)
    produto_id = dados.get("id") if isinstance(dados, dict) else None

    if not isinstance(produto_id, int) or isinstance(produto_id, bool):
        return erro("ID inválido")

    p = Produto.objects.filter(id=produto_id).first()
    if not p:
        return erro("Produto não encontrado", 404)

    p.delete()
    return JsonResponse({"ok": True, "mensagem": f"Produto {produto_id} apagado"})