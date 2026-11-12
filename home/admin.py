from django.contrib import admin
from .models import Produto,Pedido,ItemPedido
# Register your models here.
admin.site.register(Produto)
admin.site.register(Pedido)
admin.site.register(ItemPedido)
from django.contrib import admin
from .models import Produto, Pedido, ItemPedido


class ItemInline(admin.TabularInline):
    model = ItemPedido
    extra = 0

class PedidoAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "criado_em", "estado")
    list_editable = ("estado",)
    inlines = [ItemInline]


