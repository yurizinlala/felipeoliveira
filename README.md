# Site do Professor Felipe Oliveira

Este projeto consiste em um site profissional para o Professor Felipe Dennis Mendonça de Oliveira, focado na divulgação de suas atividades acadêmicas, áreas de pesquisa, projetos e o Laboratório LUMEN.

## Estrutura do Projeto

O projeto está organizado da seguinte forma:

```
projeto_g7bet/
├── index.html              # Página inicial
├── sobre.html             # Página sobre o professor
├── areas-pesquisa.html    # Página de áreas de pesquisa (inclui projetos, publicações e orientações)
├── laboratorio.html       # Página do laboratório LUMEN
├── contato.html           # Página de contato
├── css/
│   ├── style.css          # Estilos principais
│   ├── animations.css     # Animações e efeitos visuais
│   └── admin.css          # Estilos da área administrativa
├── js/
│   └── script.js          # Scripts do site
│   └── api.js             # Scripts para comunicação com a API do backend
│   └── admin.js           # Scripts da área administrativa
├── img/                   # Pasta para imagens
├── backend/               # Pasta do backend (API Flask)
│   ├── app.py             # Aplicação principal do Flask
│   ├── requirements.txt   # Dependências do Python
│   ├── .env               # Variáveis de ambiente (configurações de e-mail, etc.)
│   └── site_data.db       # Banco de dados SQLite
└── GUIA_EXECUCAO_BACKEND.md # Guia detalhado para execução do backend
```

## Características Implementadas

### Design e Interface
- Design responsivo para todos os dispositivos
- Paleta de cores baseada no site da UERN
- Fonte Poppins como padrão para todo o site
- Animações e transições para melhorar a experiência do usuário
- Botão de voltar ao topo
- Efeitos de hover em botões e elementos interativos

### Funcionalidades
- Formulário de contato com validação e envio de e-mail (via backend)
- Navegação interna na página de áreas de pesquisa
- Filtros para projetos, publicações e orientações
- Integração com VLibras para acessibilidade
- Links para redes sociais e currículo Lattes
- Área administrativa com login e dashboard
- Contagem de visitas por página

### Estrutura de Navegação
- Menu principal simplificado
- Áreas de Pesquisa consolidada (incluindo projetos, publicações e orientações)
- Rodapé com links institucionais atualizados

## Como Rodar o Projeto Localmente (Frontend e Backend Juntos)

Para testar o projeto completo (frontend e backend) na sua máquina, siga os passos abaixo:

1.  **Pré-requisitos:** Certifique-se de ter o Python 3 instalado.

2.  **Descompacte o projeto:**
    Descompacte o arquivo `projeto_g7bet_completo_para_teste.zip` (ou o zip mais recente que você recebeu) em uma pasta de sua preferência.

3.  **Navegue até a pasta do backend:**
    Abra o terminal ou prompt de comando e navegue até a pasta `projeto_g7bet/backend`:
    ```bash
    cd /caminho/para/projeto_g7bet/backend
    ```

4.  **Crie e ative o ambiente virtual:**
    É altamente recomendável usar um ambiente virtual para isolar as dependências do projeto:
    ```bash
    python3 -m venv venv_backend
    source venv_backend/bin/activate  # No Windows: .\venv_backend\Scripts\activate
    ```

5.  **Instale as dependências:**
    Com o ambiente virtual ativado, instale as bibliotecas Python necessárias:
    ```bash
    pip install -r requirements.txt
    ```

6.  **Configure as variáveis de ambiente (e-mail):**
    Abra o arquivo `.env` (localizado em `projeto_g7bet/backend/.env`) em um editor de texto e preencha as suas credenciais de e-mail. **Esta etapa é crucial para que o envio de e-mails funcione.**
    ```env
    EMAIL_HOST=smtp.seuprovedor.com
    EMAIL_PORT=587
    EMAIL_USE_TLS=True
    EMAIL_USERNAME=seu_email@seuprovedor.com
    EMAIL_PASSWORD=sua_senha_de_app
    EMAIL_SENDER=seu_email@seuprovedor.com
    EMAIL_RECEIVER=email_do_professor@exemplo.com
    ```
    *Para Gmail, use uma [senha de aplicativo](https://support.google.com/accounts/answer/185833?hl=pt-BR).* 

7.  **Inicie o servidor Flask:**
    Na mesma pasta `projeto_g7bet/backend` e com o ambiente virtual ativado, execute o servidor:
    ```bash
    python app.py
    ```
    O servidor Flask será iniciado e servirá tanto o backend (API) quanto o frontend (páginas HTML, CSS, JS) na porta 5000.

8.  **Acesse o site:**
    Abra seu navegador e acesse:
    ```
    http://127.0.0.1:5000
    ```
    Você deverá ver a página inicial do site com o CSS aplicado e poderá navegar por todas as páginas. As funcionalidades de contato e a área administrativa estarão ativas.

## Publicação

### GitHub Pages (Apenas Frontend)

Para publicar apenas o frontend do site no GitHub Pages, você precisará dos arquivos HTML, CSS, JavaScript e imagens. O backend (API) não pode ser hospedado diretamente no GitHub Pages, pois ele requer um servidor Python.

1.  **Use o arquivo `projeto_g7bet_frontend_github_pages.zip`:** Este arquivo contém apenas os recursos estáticos do frontend.
2.  **Crie um repositório no GitHub:** Faça o upload do conteúdo descompactado deste zip para o seu repositório.
3.  **Configure o GitHub Pages:** Nas configurações do seu repositório no GitHub, ative o GitHub Pages e selecione a branch principal (geralmente `main` ou `master`) como fonte.

**Observação:** Ao hospedar apenas o frontend no GitHub Pages, as funcionalidades que dependem do backend (como o formulário de contato e a área administrativa) **não funcionarão**, a menos que você configure o backend em outro serviço de hospedagem e aponte o frontend para a URL correta da API.

### Hospedagem Alternativa (Frontend e Backend)

Para hospedar o projeto completo (frontend e backend), você precisará de um serviço de hospedagem que suporte aplicações Python (Flask). Alguns exemplos incluem:
- Heroku
- Render
- PythonAnywhere
- Servidores VPS (DigitalOcean, AWS EC2, Google Cloud Compute Engine)

## Manutenção

Para atualizar o conteúdo do site:

1. Edite os arquivos HTML, CSS ou JavaScript correspondentes às páginas que deseja atualizar.
2. Para o backend, edite os arquivos `.py` e o banco de dados `site_data.db`.
3. Se estiver usando Git, faça commit e push das alterações para o seu repositório.
4. Se o site estiver hospedado, siga as instruções do seu provedor de hospedagem para deploy das atualizações.

---

© 2025 Felipe Oliveira - Todos os direitos reservados


