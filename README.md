# Projeto do Site do Professor Felipe Oliveira

Este repositório contém o código-fonte completo do site do Professor Felipe Oliveira, incluindo o frontend (HTML, CSS, JavaScript) e o backend (Flask).



## Estrutura do Projeto

O projeto está organizado em duas partes principais:

- `frontend/`: Contém os arquivos HTML, CSS e JavaScript do site.
- `backend/`: Contém o código-fonte do servidor Flask, incluindo a API e a lógica de negócio.




## Como Rodar Localmente

Para rodar o site localmente, você precisará configurar tanto o backend quanto o frontend.

### Pré-requisitos

Certifique-se de ter o seguinte software instalado em sua máquina:

- Python 3.8+ (para o backend)
- pip (gerenciador de pacotes do Python)
- Node.js e npm (opcional, para algumas ferramentas de frontend, mas não estritamente necessário para rodar o site)

### Configuração do Backend

1. Navegue até o diretório `backend`:
   ```bash
   cd backend
   ```

2. Crie um ambiente virtual (recomendado):
   ```bash
   python3 -m venv venv
   ```

3. Ative o ambiente virtual:
   - No Linux/macOS:
     ```bash
     source venv/bin/activate
     ```
   - No Windows:
     ```bash
     .\venv\Scripts\activate
     ```

4. Instale as dependências do Python:
   ```bash
   pip install -r requirements.txt
   ```

5. Crie um arquivo `.env` na raiz do diretório `backend` (baseado no `.env.example`) e configure as variáveis de ambiente. O conteúdo mínimo deve ser:
   ```
   SECRET_KEY='sua_chave_secreta_aqui'
   MAIL_USERNAME='seu_email@gmail.com'
   MAIL_PASSWORD='sua_senha_de_aplicativo_ou_senha_do_email'
   MAIL_SERVER='smtp.gmail.com'
   MAIL_PORT=587
   MAIL_USE_TLS=True
   MAIL_USE_SSL=False
   ADMIN_USERNAME='admin'
   ADMIN_PASSWORD_HASH='hash_sha256_da_senha_admin123'
   ```
   **Nota:** Para `ADMIN_PASSWORD_HASH`, você pode usar um gerador SHA256 online para a senha `admin123` ou qualquer outra senha que desejar. O hash SHA256 de `admin123` é `a665a45920422f9d417e4867efdc4fb8a04a1f3fff1fa07e998e86f7f7a27ae3`.

6. Inicialize o banco de dados (se for a primeira vez):
   ```bash
   python -c 'from app import db; db.create_all()'
   ```

7. Execute o servidor Flask:
   ```bash
   flask run
   ```
   O backend estará disponível em `http://127.0.0.1:5000`.

### Configuração do Frontend

O frontend é composto por arquivos HTML, CSS e JavaScript estáticos. Você pode abri-los diretamente no seu navegador ou usar um servidor web simples.

1. Navegue até o diretório raiz do projeto (onde está `index.html`):
   ```bash
   cd .. # Se você estiver no diretório backend
   ```

2. Abra o arquivo `index.html` no seu navegador preferido.

   Alternativamente, você pode usar um servidor web simples do Python:
   ```bash
   python -m http.server 8000
   ```
   O frontend estará disponível em `http://127.0.0.1:8000`.

   **Importante:** Certifique-se de que o backend esteja rodando antes de acessar o frontend, pois o frontend fará requisições para a API do backend.




## Publicando no GitHub

Para publicar este projeto no GitHub, siga os passos abaixo:

1. **Inicialize um repositório Git** na raiz do projeto (onde estão as pastas `backend` e `css`, `img`, `js`, etc.):
   ```bash
   git init
   ```

2. **Adicione os arquivos ao repositório:**
   ```bash
   git add .
   ```

3. **Faça o primeiro commit:**
   ```bash
   git commit -m "Initial commit: Project setup"
   ```

4. **Crie um novo repositório no GitHub** (por exemplo, `felipe_oliveira_site`). Não inicialize com um README, licença ou `.gitignore`.

5. **Adicione o repositório remoto:**
   ```bash
   git remote add origin <URL_DO_SEU_REPOSITORIO_GITHUB>
   ```
   (Substitua `<URL_DO_SEU_REPOSITORIO_GITHUB>` pela URL HTTPS ou SSH do seu novo repositório no GitHub).

6. **Envie os arquivos para o GitHub:**
   ```bash
   git push -u origin master
   ```
   (Ou `main`, dependendo da branch padrão do seu repositório).

Agora seu projeto estará disponível no GitHub!

## Licença

Este projeto está licenciado sob a licença MIT. Veja o arquivo `LICENSE` para mais detalhes.

## Contato

Para dúvidas ou sugestões, entre em contato com o Professor Felipe Oliveira através do formulário de contato no site.

---

**Desenvolvido por Manus AI**


