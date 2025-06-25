# Projeto: Site de Felipe Oliveira

Este repositório contém a aplicação completa do site pessoal de Felipe Oliveira, incluindo frontend estático (HTML/CSS/JS) e backend em Python (Flask) para gerenciamento de conteúdo e estatísticas.

---

## Sumário

1. [Tecnologias Utilizadas](#tecnologias-utilizadas)
2. [Estrutura de Pastas](#estrutura-de-pastas)
3. [Pré-requisitos](#pré-requisitos)
4. [Configuração do Ambiente](#configura%C3%A7%C3%A3o-do-ambiente)
5. [Banco de Dados](#banco-de-dados)
6. [Como Executar](#como-executar)
7. [Credenciais de Acesso (Admin)](#credenciais-de-acesso-admin)
8. [Rotas da API](#rotas-da-api)
9. [Deploy em Produção](#deploy-em-produ%C3%A7%C3%A3o)
10. [Testes](#testes)
11. [Licença](#licen%C3%A7a)

---

## Tecnologias Utilizadas

- **Frontend**: HTML5, CSS3, JavaScript puro
- **Backend**: Python 3.x, Flask, Flask-CORS, Flask-Limiter
- **Banco de Dados**: SQLite (arquivo `site_data.db`)
- **Env Variables**: python-dotenv
- **Outras Bibliotecas**:
  - `flask_limiter` para rate limiting
  - `sqlite3` (módulo padrão)
  - `email` / `smtplib` para envio de formulários de contato

---

## Estrutura de Pastas

```
felipe_oliveira_site/
├── admin.html              # Interface de login/admin estático
├── areas-pesquisa.html     # Página Áreas de Pesquisa
├── css/
│   ├── style.css           # Estilos gerais
│   └── admin.css           # Estilos da área admin
├── img/                    # Imagens do site (perfil, ícones, etc.)
├── js/
│   ├── script.js           # Lógica de navegação e animações
│   ├── api.js              # Comunicação com o backend (fetch)
│   └── admin.js            # Lógica da área administrativa
├── index.html              # Página Home
├── laboratorio.html        # Página Laboratórios
├── orientacoes.html        # Página Orientações
├── projetos.html           # Página Projetos
├── publicacoes.html        # Página Publicações
├── sobre.html              # Página Sobre
├── README.md               # (Este arquivo)
│
└── backend/                # Aplicação Flask
    ├── .env.example        # Exemplo de variáveis de ambiente
    ├── requirements.txt    # Dependências Python
    ├── site_data.db        # Banco de dados SQLite (inicial)
    ├── app.py              # Aplicação principal
    ├── config.py           # Configurações (dev/prod/test)
    ├── admin_routes.py     # Rotas de autenticação e dashboard
    ├── content_routes.py   # Rotas de conteúdo público e mensagens
    ├── stats_routes.py     # Rotas de estatísticas
    └── utils.py            # Funções auxiliares (validação, e-mail, etc.)
```

---

## Pré-requisitos

- **Python 3.7+** instalado
- **pip** (gerenciador de pacotes Python)
- Para envio de e-mail via SMTP (opcional): conta Gmail ou outro servidor configurado

---

## Configuração do Ambiente

1. Clone este repositório:

   ```bash
   git clone https://github.com/seuusuario/felipe_oliveira_site.git
   cd felipe_oliveira_site/backend
   ```

2. Crie um ambiente virtual (recomendado):

   ```bash
   python3 -m venv venv
   source venv/bin/activate  # Linux/macOS
   venv\\Scripts\\activate  # Windows
   ```

3. Instale as dependências:

   ```bash
   pip install -r requirements.txt
   ```

4. Copie o arquivo de variáveis de ambiente:

   ```bash
   cp .env.example .env
   ```

5. Ajuste as variáveis em `.env` conforme necessário:

   ```dotenv
   SECRET_KEY=your-secret-key-here       # Chave secreta do Flask
   DATABASE_URL=sqlite:///site_data.db  # URL do banco (SQLite padrão)

   SMTP_SERVER=smtp.gmail.com           # Servidor SMTP
   SMTP_PORT=587                         # Porta SMTP
   SMTP_USERNAME=seu-email@gmail.com    # Usuário de e-mail
   SMTP_PASSWORD=sua-senha-de-app       # Senha de aplicativo ou SMTP
   SMTP_USE_TLS=True                     # TLS True/False

   ADMIN_EMAIL=felipedennis@uern.br      # E-mail do admin para notificações
   RATE_LIMIT_PER_MINUTE=60               # Limite de requisições/minuto

   DEBUG=True                            # Modo depuração
   ```

---

## Banco de Dados

- O arquivo SQLite padrão está em `backend/site_data.db`.
- Tabelas principais:
  - `admin_users`: lista de usuários administradores (username, password\_hash, email)
  - `site_content`: conteúdo dinâmico (páginas, textos)
  - `contact_messages`: mensagens enviadas pelo formulário
  - `page_visits`, `device_stats`: estatísticas de acesso

Para resetar o banco, delete o arquivo `site_data.db` e execute os scripts de migração (caso existam) ou insira dados iniciais via scripts Python.

---

## Como Executar

1. Navegue até a pasta `backend` e ative o ambiente virtual.
2. Execute o servidor Flask:
   ```bash
   python main.py
   ```
3. O backend ficará disponível em: `http://localhost:5000`
4. Abra o frontend estático abrindo `index.html` no navegador ou sirva via servidor HTTP (por exemplo, `python -m http.server` na raiz).

> **Dica**: Para testes de CORS, abra o frontend usando um servidor HTTP em vez de `file://`.

---

## Credenciais de Acesso (Admin)

- **URL de Login Admin**: `http://localhost:5000/admin.html`
- **Usuário**: `admin`
- **Senha**: `admin123`

Após login, você terá acesso ao painel de estatísticas e gerenciamento de mensagens.

---

## Rotas da API

### Autenticação

- `POST /login` — Autentica um usuário admin.

  - **Payload**: `{ "username": "admin", "password": "admin123" }`
  - **Resposta**: \`{ success: true, data: { id, name, email }, message }

- `POST /logout` — Finaliza sessão.

- `GET /check-auth` — Verifica se o token de sessão é válido.

### Conteúdo e Mensagens

- `GET /content/:page` — Retorna conteúdo dinâmico de uma página.
- `POST /messages` — Envia mensagem de contato.

### Estatísticas (Admin only)

- `GET /stats/visits` — Total de visitas.
- `GET /stats/pages` — Visitas por página.
- `GET /stats/messages` — Total e recentes.

Consulte o código em `backend/*.py` para detalhes adicionais.

---

## Deploy em Produção

- Configure variável `FLASK_ENV=production` e ajuste `DEBUG=False` no `.env`.
- Utilize um servidor WSGI (Gunicorn, uWSGI) e servidor reverso (NGINX).
- Exemplo com Gunicorn:
  ```bash
  pip install gunicorn
  gunicorn -w 4 -b 0.0.0.0:8000 main:app
  ```

---

## Testes

- Scripts de teste não estão inclusos, mas você pode adicionar testes Flask usando `pytest` e configuração em `config.TestingConfig`.

---

## Licença

Este projeto está licenciado sob a [MIT License](LICENSE).

