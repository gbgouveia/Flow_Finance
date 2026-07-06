# Arquitetura do Sistema: Flow Finance

Este documento é uma radiografia completa do seu projeto **Flow Finance**. Ele detalha toda a estrutura do sistema, desde a camada visual (Frontend) até a gestão de dados (Backend e Banco de Dados) e como tudo se conecta através da infraestrutura (Docker).

---

## 1. Visão Geral (A Grande Fotografia)

O Flow Finance é uma aplicação **Full Stack** moderna. A arquitetura segue o modelo **Client-Server** (Cliente-Servidor), onde o Frontend (a tela que você interage) e o Backend (o cérebro do negócio) são projetos independentes que "conversam" entre si pela internet ou rede local através de uma API (Interface de Programação de Aplicações).

Tudo isso está empacotado em **Containers Docker**, o que significa que o ambiente é padronizado. Independentemente de onde você rodar o projeto, o comportamento será o mesmo, pois o Docker cria "mini-computadores virtuais" isolados para cada parte do sistema.

---

## 2. A Camada Frontend (O que o usuário vê)

O Frontend é a interface gráfica com a qual o usuário interage.

* **Tecnologias Core:** Construído com **React.js** utilizando o **Vite** como empacotador (bundler). O Vite é responsável por transformar o código fonte em um site rápido e otimizado para o navegador.
* **Estilização (UI/UX):** Todo o design luxuoso, cores, sombras e responsividade são geridos pelo **Tailwind CSS**. Implementamos suporte completo ao modo Escuro/Claro (Dark/Light mode) mapeando variáveis CSS nativas (`:root` e `.dark`).
* **Gerenciamento de Estado Global:** O sistema utiliza a Context API do React para manter informações vitais em memória sem recarregar a página:
  * `AuthContext`: Mantém o token JWT e a sessão de quem está logado.
  * `ThemeContext`: Verifica e altera a preferência visual (claro/escuro).
  * `CommandPaletteContext`: Controla quando o modal de atalhos rápidos (`Ctrl + K`) deve aparecer.
* **Gráficos e Interatividade:** O painel usa a biblioteca **Apache ECharts** (`echarts-for-react`) para renderizar os gráficos financeiros complexos (Radar, Scatter, Heatmap, etc).
* **Comunicação e Exportações:** 
  * O Frontend utiliza o `axios` (no arquivo `services/api.js`) para fazer as requisições HTTP (GET, POST, PUT, DELETE) ao Backend.
  * As funcionalidades avançadas de relatórios utilizam ferramentas robustas: `xlsx` (SheetJS) para criar as planilhas do Excel, `jsPDF` para montar PDFs e o `html2canvas` que "tira uma foto" dos gráficos e acopla no PDF visual.
  * Os downloads agora ocorrem de forma 100% nativa (criando rotas virtuais no navegador `URL.createObjectURL`).

---

## 3. A Camada Backend (O Cérebro da Operação)

O Backend é onde a lógica de negócios, a validação das regras financeiras e a segurança acontecem. Ninguém acessa o Backend diretamente, apenas através do Frontend.

* **Framework Principal:** Desenvolvido em **Python** utilizando **FastAPI**. O FastAPI é um framework assíncrono extremamente rápido (daí o nome) e gera automaticamente documentação das suas rotas (disponível geralmente em `/docs`).
* **Conexão com Banco de Dados (ORM):** Ele utiliza o **SQLAlchemy**. Em vez de escrevermos comandos SQL complexos (`SELECT * FROM table...`), o código Python interage com o banco usando "Objetos".
* **Migrações com Alembic:** O Alembic é como se fosse o "Git" do seu banco de dados. Sempre que criamos uma nova tabela ou adicionamos uma coluna (ex: Tabela de Metas), o Alembic registra essa mudança num arquivo (migration) para garantir que qualquer pessoa que rode o projeto tenha o banco com a mesma estrutura atualizada.
* **Segurança e Autenticação:**
  * As senhas de usuários nunca são salvas em texto puro. O sistema usa **Bcrypt** para criptografar as senhas no momento do cadastro.
  * O controle de acesso é feito via **Token JWT (JSON Web Token)**. Ao logar, o Backend emite um "crachá digital" validado por uma chave secreta. O Frontend anexa esse crachá em toda requisição futura para provar que está autenticado.
* **Validação de Dados:** O sistema blinda qualquer tentativa de injetar dados errados usando o **Pydantic**. Ele checa automaticamente se os e-mails, números e limites orçamentários enviados estão nos formatos esperados antes mesmo de tocar na lógica.

---

## 4. O Banco de Dados (O Cofre de Informações)

* **Motor:** Utilizamos o **PostgreSQL**, o banco de dados relacional (baseado em tabelas) open-source mais robusto e seguro do mercado.
* **Estrutura:** Ele armazena, em tabelas altamente conectadas, os seus "Users" (Usuários), "Accounts" (Contas), "Categories" (Categorias), "Transactions" (Receitas/Despesas) e "Goals" (Metas).
* **Seeding (`seed.py`):** Existe um script em Python que funciona como um preenchimento inicial. Se o banco estiver vazio, este script injeta dados simulados para que você não encontre a plataforma totalmente zerada nos primeiros testes.

---

## 5. Orquestração e Infraestrutura (Docker)

Todo esse sistema interligado só é fácil de rodar porque existe uma partitura musical orquestrando os instrumentos: o `docker-compose.yml`.

Como a orquestração funciona hoje no seu ambiente:
1. **Container do Banco de Dados (`db`):** O Docker puxa a imagem oficial do Postgres, expõe uma porta interna e configura o usuário/senha do banco.
2. **Container do Backend (`backend`):** O Docker pega o código Python e instala as dependências (`requirements.txt`). Antes de inicializar o servidor web, ele roda o arquivo `start.sh`. O `start.sh` garante duas coisas: que o Alembic crie/atualize todas as tabelas no PostgreSQL (`db`), e que o `seed.py` rode para popular os dados. Somente depois disso ele expõe a API para uso.
3. **Container do Frontend (`frontend`):** O Docker constrói (faz a *build*) de toda a sua aplicação React + Vite em páginas estáticas otimizadas e serve esses arquivos usando um servidor simples.

**O Fluxo de Vida Prático (Como os dados viajam):**
1. Você abre o navegador e interage com o Botão de "Salvar Receita" (Frontend).
2. O React valida as informações da tela e, se tudo estiver certo, aciona o `axios`.
3. O `axios` envia os dados junto com seu Token JWT embutido para a rota POST `/transactions/` (Backend).
4. O FastAPI recebe os dados, valida se não é spam/dados mal-formados através do Pydantic, e checa se o seu Token é verdadeiro.
5. Sendo autorizado, o FastAPI pede ao SQLAlchemy para transformar isso num objeto do Python.
6. O SQLAlchemy converte isso para SQL e envia para o PostgreSQL (`db`) armazenar.
7. O PostgreSQL devolve um "OK".
8. O FastAPI devolve ao React (via rede) um status 200/201.
9. O React exibe o balão verde de "Receita Criada" e reconstrói o gráfico ECharts dinamicamente para mostrar seu novo saldo.
