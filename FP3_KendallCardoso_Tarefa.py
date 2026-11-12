#Ex 1-Classe Estudante
class Estudante:
    def __init__(self,nome,numeroMatricula,curso,idade):
        self.nome= nome
        self.numerodematricula = numeroMatricula
        self.curso = curso
        self.idade = idade
    def apresentar(self):
        print(f"Nome:{self.nome}")
        print(f"Numero de Matricula:{self.numerodematricula}")
        print(f"Curso:{self.curso}")
        print(f"Idade:{self.idade}")
    def estudar(self):
        print(f"O estudante {self.nome} está estudando!")
#Criando Obj
e1 = Estudante("Kendall Cardoso",11306625,"Engenharia Informática", 22)
e2 = Estudante("Ricardo Manuel", 11306626, "Enfermagem",23)
e3 = Estudante("Ariela Bumba",11306626,"Contabilidade e Gestão",20)
#Chamando os Metodos
print("------------Estudante 1---------------")
e1.apresentar()
e1.estudar()
print("------------Estudante 2---------------")
e2.apresentar()
e2.estudar()
print("------------Estudante 3---------------")
e3.apresentar()
e3.estudar()

#Ex2 -Classe Produto

class Produto:
    def __init__(self,nome,codigo,preco,quantidade):
        self.nome = nome
        self.codigo = codigo
        self.preco = preco
        self.quantidade = int(quantidade)
    def apresentar_produto(self):
        print(f"Nome do Produto: {self.nome}")
        print(f"Preço: {self.preco}")
        print(f"Código: {self.codigo}")
        print(f"Quantidade em Stock: {self.quantidade}")
    def calcular_valor_stock(self):
        print(f"Valor Total do stock: {self.preco * self.quantidade} Kz")
    def repor_stock(self,quantidade):
        self.qntd = int(quantidade)
        self.quantidade += self.qntd
        print(f"Stock  '{self.nome}',atualizado com sucesso")
        print(f"Quantidade: {self.quantidade}")
#Criar Obj
p1 = Produto("Laptop", 112025,250000,10)
p2 = Produto("Teclado Wirless",101924,7500,20)
#Chamar Metodos
print("-----------Produto 1-----------")
p1.apresentar_produto()
p1.calcular_valor_stock()
p1.repor_stock(1)
print("-----------Produto 2-----------")
p2.apresentar_produto()
p2.calcular_valor_stock()
p2.repor_stock(3)

#Ex3 - Classe ContaBancaria

class ContaBancaria:
    def __init__(self,titular,numeroDaconta,saldo):
        self.titular = titular
        self.numeroConta = numeroDaconta
        self.saldo = saldo
    def consultar_saldo(self):
        print(f"Saldo atual: {self.saldo} Kz")
    def depositar(self,valor):
        self.valor = int(valor)
        self.saldo += self.valor
        print(f"Valor Depositado: {self.valor} Kz")
    def levantar(self,valor):
        self.vlr = int(valor)
        if self.saldo >= self.vlr:
            self.saldo -= self.vlr
            print(f"Valor retirado: {self.vlr} Kz")
        else:
            print("Saldo Insuficiente,tente um valor mais abaixo")
#Criar obj
c1 = ContaBancaria("Kendall Cardoso",110022,20000)
c2 = ContaBancaria("Ricardo Manuel",120123,30000)
print("-----------ContaBancaria 1---------------")
c1.consultar_saldo()
c1.depositar(10000)
c1.levantar(29000)
c1.consultar_saldo()
print("-----------ContaBancaria 2---------------")
c2.consultar_saldo()
c2.depositar(1000)
c2.levantar(2000)
c2.consultar_saldo()
class Funcionario:
    def __init__(self,nome,numeroIdentificacao,cargo,salario):
        self.nome = nome
        self.identificacao = numeroIdentificacao
        self.cargo = cargo
        self.salario = salario
    def apresentar_dados(self):
        print(f"Nome: {self.nome}")
        print(f"Nº de Identificação: {self.identificacao}")
        print(f"Cargo: {self.cargo}")
        print(f"Salario: {self.salario} (kz)")
    def aumentar_salario(self,valorempercentagem):
        self.vlr = (valorempercentagem/100)*self.salario
        self.salario += self.vlr
        print(f"Recebeu um aumento de {valorempercentagem}%")
    def calcular_salario_anual(self):
        print(f"O Trabalhador {self.nome} receberá ao todo no ano: {self.salario*12} (Kz)")

#Criando obj
t1 = Funcionario("Kendall Cardoso",11306625, "Técnico de Redes",150700)
t2 = Funcionario("Manuel Ricardo", 12315615, "Técnico de Hardware",100000)
t3 = Funcionario("Miguel João", 9898950, "Contabilista",10000)
print("-------------Funcionário 1 --------------")
t1.apresentar_dados()
t1.calcular_salario_anual()
print("-------------Funcionário 2 --------------")
t2.apresentar_dados()
t2.calcular_salario_anual()
print("-------------Funcionário 3 --------------")
t3.apresentar_dados()
t3.calcular_salario_anual()
t3.aumentar_salario(10)
t3.calcular_salario_anual()


class Livro:
    def __init__(self,autor, isbn,estado):
        self.autor = autor
        self.isbn = isbn
        self.estado = estado
    def emprestar(self):
        if self.estado == "Disponivel":
            print(f"Livro {self.isbn} emprestado")
            self.estado = "Emprestado"
        else:
            print(f"Livro {self.isbn} já se encontra emprestado")
    def devolver(self):
        if self.estado == "Emprestado":
            print(f"Livro {self.isbn} devolvido")
            self.estado = "Disponivel"
        else:
            print(f"Livro {self.isbn} já se encontra devolvido")
    def apresentar_livro(self):
        print(f"Autor: {self.autor}")
        print(f"ISBN: {self.isbn}")
        print(f"Estado: {self.estado}")

#Criar obj 

lv1 = Livro("Kendall J","077-GG","Disponivel")
lv2 = Livro("Cardoso J","088-GG","Disponivel")
lv3 = Livro("Ricardo J","099-GG","Disponivel")
lv4 = Livro("Antônio","1010-GG","Disponivel")

print("-------------Livro 1---------------")
lv1.apresentar_livro()
print("-------------Livro 2---------------")
lv2.apresentar_livro()
print("-------------Livro 3---------------")
lv3.apresentar_livro()
print("-------------Livro 4---------------")
lv4.apresentar_livro()
print("-------------Livro 1 emprestar---------------")
lv1.emprestar()
lv1.apresentar_livro()
print("-------------Livro 2 emprestar---------------")
lv2.emprestar()
lv2.apresentar_livro()
print("-------------Livro 1 emprestar estando já emprestado---------------")
lv1.emprestar()
print("-------------Livro 1 devolver---------------")
lv1.devolver()
lv1.apresentar_livro()
print("-------------Livro 1---------------")
lv1.apresentar_livro()
print("-------------Livro 2---------------")
lv2.apresentar_livro()
print("-------------Livro 3---------------")
lv3.apresentar_livro()
print("-------------Livro 4---------------")
lv4.apresentar_livro()