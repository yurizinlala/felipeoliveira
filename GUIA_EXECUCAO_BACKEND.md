# Guia de Execução do Backend - G7Bet

## Visão Geral

Este documento fornece instruções detalhadas para configurar e executar o backend do projeto G7Bet em sua máquina local. O backend foi desenvolvido em Python utilizando o framework Flask e inclui funcionalidades de API REST, autenticação de administrador, envio de emails e gerenciamento de banco de dados SQLite.

## Pré-requisitos

Antes de iniciar, certifique-se de que sua máquina possui os seguintes requisitos:

- Python 3.11 ou superior instalado
- pip (gerenciador de pacotes do Python)
- Git (para clonar o repositório, se necessário)
- Acesso à internet para instalação de dependências

## Estrutura do Projeto

O backend está organizado da seguinte forma:

```
backend/
├── app.py                 # Arquivo principal da aplicação Flask
├── admin_routes.py        # Rotas de administração e autenticação
├── content_routes.py      # Rotas para gerenciamento de conteúdo
├── stats_routes.py        # Rotas para estatísticas e métricas
├── requirements.txt       # Dependências do projeto
├── .env                   # Variáveis de ambiente (configurar)
├── README.md             # Documentação do backend
└── site_data.db          # Banco de dados SQLite (criado automaticamente)
```

## Configuração do Ambiente

### 1. Criação do Ambiente Virtual

É altamente recomendado usar um ambiente virtual para isolar as dependências do projeto:

```bash
# Navegue até o diretório do projeto
cd projeto_g7bet

# Crie um ambiente virtual
python3.11 -m venv venv_backend

# Ative o ambiente virtual
# No Linux/macOS:
source venv_backend/bin/activate

# No Windows:
venv_backend\Scripts\activate
```

### 2. Instalação das Dependências

Com o ambiente virtual ativado, instale as dependências:

```bash
# Navegue até o diretório backend
cd backend

# Instale as dependências
pip install -r requirements.txt
```

As principais dependências incluem:
- Flask 3.0.3 - Framework web
- Flask-CORS 4.0.1 - Suporte a CORS
- python-dotenv 1.0.1 - Carregamento de variáveis de ambiente

### 3. Configuração das Variáveis de Ambiente

Edite o arquivo `.env` no diretório backend com suas configurações de email:

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_USERNAME=seu_email@gmail.com
EMAIL_PASSWORD=sua_senha_de_app
EMAIL_SENDER=seu_email@gmail.com
EMAIL_RECEIVER=email_do_professor@exemplo.com
```

**Importante:** Para Gmail, você precisará:
1. Ativar a autenticação de dois fatores
2. Gerar uma senha de aplicativo específica
3. Usar a senha de aplicativo no campo EMAIL_PASSWORD

## Execução do Servidor

### 1. Inicialização do Banco de Dados

O banco de dados SQLite será criado automaticamente na primeira execução. Ele incluirá:
- Tabela de mensagens de contato
- Tabela de visitas às páginas
- Tabela de usuários administradores
- Tabela de conteúdo editável

### 2. Usuário Administrador Padrão

Um usuário administrador é criado automaticamente:
- **Usuário:** admin
- **Senha:** admin123
- **Email:** felipedennis@uern.br

### 3. Iniciando o Servidor

```bash
# Certifique-se de estar no diretório backend com o ambiente virtual ativado
cd backend
source venv_backend/bin/activate  # Linux/macOS
# ou venv_backend\Scripts\activate  # Windows

# Execute o servidor
python app.py
```

O servidor será iniciado em:
- **URL local:** http://127.0.0.1:5000
- **URL de rede:** http://0.0.0.0:5000

## Testando as Funcionalidades

### 1. Teste de Login de Administrador

```bash
curl -X POST http://localhost:5000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'
```

Resposta esperada:
```json
{
  "message": "Login realizado com sucesso",
  "success": true,
  "user": {
    "email": "felipedennis@uern.br",
    "id": 1,
    "name": "Administrador",
    "username": "admin"
  }
}
```

### 2. Teste de Envio de Mensagem

```bash
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste",
    "email": "teste@exemplo.com",
    "subject": "Teste de contato",
    "message": "Esta é uma mensagem de teste."
  }'
```

### 3. Verificação de Mensagens Salvas

```bash
curl -X GET http://localhost:5000/api/messages
```

## Principais Endpoints da API

### Autenticação e Administração
- `POST /api/admin/login` - Login de administrador
- `POST /api/admin/logout` - Logout
- `GET /api/admin/check-auth` - Verificar autenticação
- `GET /api/admin/dashboard` - Dashboard com estatísticas

### Contato e Mensagens
- `POST /api/contact` - Enviar mensagem de contato
- `GET /api/messages` - Listar mensagens (requer autenticação)

### Estatísticas
- `POST /api/track-visit` - Registrar visita à página
- `GET /api/visits` - Obter estatísticas de visitas

## Solução de Problemas

### Erro de Importação do Flask
Se encontrar erros de importação, verifique se:
1. O ambiente virtual está ativado
2. As dependências foram instaladas corretamente
3. A versão do Python é compatível (3.11+)

### Problemas com Email
Se o envio de email falhar:
1. Verifique as configurações no arquivo `.env`
2. Confirme se a senha de aplicativo está correta
3. Teste com um provedor de email diferente

### Banco de Dados
O banco SQLite é criado automaticamente. Se houver problemas:
1. Delete o arquivo `site_data.db`
2. Reinicie o servidor para recriar o banco

## Desenvolvimento e Debug

Para desenvolvimento, o servidor Flask está configurado com:
- **Debug mode:** Ativado
- **Auto-reload:** Ativado
- **CORS:** Habilitado para todas as origens

## Segurança

Para produção, considere:
1. Alterar a senha padrão do administrador
2. Configurar HTTPS
3. Usar um banco de dados mais robusto
4. Implementar rate limiting
5. Configurar CORS para origens específicas

## Logs e Monitoramento

O servidor exibe logs no console, incluindo:
- Requisições HTTP
- Erros de envio de email
- Operações de banco de dados

Para logs mais detalhados, modifique o nível de log no arquivo `app.py`.

