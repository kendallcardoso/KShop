from django.db import models

# Create your models here.
class Produto(models.Model):
    nome = models.CharField(max_length=200, blank=True, null=True)
    quantidade = models.IntegerField(blank=True,null=True)
    preco = models.DecimalField(    max_digits=15,decimal_places=2)
    categoria = models.CharField(max_length=200, blank=True, null=True)
    img = models.ImageField(upload_to="produtos/",blank=True,null=True)
    ml = models.CharField(max_length=50,blank=True,null=True)
    class Meta():
        verbose_name = "Produto"
        verbose_name_plural="Produtos"
    def __str__(self):
        return self.nome
from django.contrib.auth.models import User

class Pedido(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    criado_em = models.DateTimeField(auto_now_add=True)
    estado = models.BooleanField(default=True)
    cod = models.CharField(max_length=100 , blank=True ,null=True)
    class Meta():
            verbose_name = "Pedido"
            verbose_name_plural="Pedidos"
    def __str__(self):
        return self.cod
        
    @property
    def total(self):
        return sum(item.subtotal for item in self.itens.all())
class ItemPedido(models.Model):
    pedido = models.ForeignKey(
        Pedido,
        on_delete=models.CASCADE,
        related_name='itens'
    )

    produto = models.ForeignKey(
        Produto,
        on_delete=models.PROTECT
    )

    quantidade = models.PositiveIntegerField(default=1)

    preco = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )
    @property
    def subtotal(self):
        return self.preco * self.quantidade

    def __str__(self):
        return f"{self.produto.nome} - {self.quantidade}"
