from flask import Flask, request, jsonify, session, send_from_directory
from flask_cors import CORS
import os
import json
from datetime import datetime, timedelta
import sqlite3
import smtplib
import secrets
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

from admin_routes import admin_bp
from content_routes import content_bp
from stats_routes import stats_bp

load_dotenv() # Carrega variáveis de ambiente do arquivo .env

# Define o caminho para a pasta raiz do projeto (onde estão os arquivos HTML, CSS, JS)
PROJECT_ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), os.pardir))

# Configura o Flask para servir arquivos estáticos a partir da raiz do projeto
app = Flask(__name__, static_folder=PROJECT_ROOT, static_url_path="/")

app.secret_key = secrets.token_hex(16)  # Gera uma chave secreta aleatória
app.config["SESSION_TYPE"] = "filesystem"
app.config["SESSION_PERMANENT"] = True
app.config["PERMANENT_SESSION_LIFETIME"] = timedelta(days=1)  # Sessão expira em 1 dia
CORS(app, supports_credentials=True)  # Habilita CORS com suporte a credenciais

# Configurações de e-mail
EMAIL_HOST = os.getenv("EMAIL_HOST")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", 587))
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "True").lower() == "true"
EMAIL_USERNAME = os.getenv("EMAIL_USERNAME")
EMAIL_PASSWORD = os.getenv("EMAIL_PASSWORD")
EMAIL_SENDER = os.getenv("EMAIL_SENDER")
EMAIL_RECEIVER = os.getenv("EMAIL_RECEIVER") # O e-mail do professor

# Registrar blueprints
app.register_blueprint(admin_bp, url_prefix="/api/admin")
app.register_blueprint(content_bp, url_prefix="/api/content")
app.register_blueprint(stats_bp, url_prefix="/api/stats")

# Configuração do banco de dados
DB_PATH = os.path.join(os.path.dirname(__file__), "site_data.db")

# Inicialização do banco de dados
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Tabela para mensagens de contato
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Tabela para contagem de visitas
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS page_visits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        page TEXT UNIQUE NOT NULL,
        visit_count INTEGER DEFAULT 0,
        last_visit TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    """)
    
    # Inserir páginas iniciais
    pages = ["index.html", "sobre.html", "areas-pesquisa.html", "laboratorio.html", "contato.html"]
    for page in pages:
        cursor.execute("INSERT OR IGNORE INTO page_visits (page, visit_count) VALUES (?, 0)", (page,))
    
    conn.commit()
    conn.close()

# Inicializa o banco de dados na inicialização do aplicativo
init_db()

# Função para enviar email
def send_email(name, email, subject, message):
    if not all([EMAIL_HOST, EMAIL_USERNAME, EMAIL_PASSWORD, EMAIL_SENDER, EMAIL_RECEIVER]):
        print("Configurações de e-mail incompletas. Verifique o arquivo .env")
        return False

    msg = MIMEMultipart()
    msg["From"] = EMAIL_SENDER
    msg["To"] = EMAIL_RECEIVER
    msg["Subject"] = f"[Contato G7Bet] {subject} - de {name} ({email})"

    body = f"Nome: {name}\nE-mail: {email}\nAssunto: {subject}\nMensagem:\n{message}"
    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP(EMAIL_HOST, EMAIL_PORT) as server:
            if EMAIL_USE_TLS:
                server.starttls()
            server.login(EMAIL_USERNAME, EMAIL_PASSWORD)
            server.sendmail(EMAIL_SENDER, EMAIL_RECEIVER, msg.as_string())
        print(f"Email enviado com sucesso para {EMAIL_RECEIVER}")
        return True
    except Exception as e:
        print(f"Erro ao enviar email: {e}")
        return False

@app.route("/api/contact", methods=["POST"])
def contact():
    data = request.json
    
    # Validação básica
    required_fields = ["name", "email", "subject", "message"]
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({"success": False, "message": f"Campo {field} é obrigatório"}), 400
    
    name = data["name"]
    email = data["email"]
    subject = data["subject"]
    message = data["message"]
    
    # Salvar no banco de dados
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)",
        (name, email, subject, message)
    )
    conn.commit()
    conn.close()
    
    # Enviar email
    try:
        send_email(name, email, subject, message)
    except Exception as e:
        print(f"Erro ao enviar email: {e}")
        # Não falha se o email não puder ser enviado, pois já salvamos no banco
    
    return jsonify({"success": True, "message": "Mensagem enviada com sucesso!"})

@app.route("/api/track-visit", methods=["POST"])
def track_visit():
    data = request.json
    
    if "page" not in data:
        return jsonify({"success": False, "message": "Campo page é obrigatório"}), 400
    
    page = data["page"]
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Verifica se a página já existe
    cursor.execute("SELECT visit_count FROM page_visits WHERE page = ?", (page,))
    result = cursor.fetchone()
    
    if result:
        # Atualiza a contagem de visitas
        cursor.execute(
            "UPDATE page_visits SET visit_count = visit_count + 1, last_visit = CURRENT_TIMESTAMP WHERE page = ?",
            (page,)
        )
    else:
        # Insere nova página
        cursor.execute(
            "INSERT INTO page_visits (page, visit_count) VALUES (?, 1)",
            (page,)
        )
    
    conn.commit()
    conn.close()
    
    return jsonify({"success": True, "message": "Visita registrada com sucesso!"})

@app.route("/api/visits", methods=["GET"])
def get_visits():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT page, visit_count, last_visit FROM page_visits ORDER BY visit_count DESC")
    visits = [{"page": row[0], "visit_count": row[1], "last_visit": row[2]} for row in cursor.fetchall()]
    conn.close()
    
    return jsonify({"success": True, "data": visits})

@app.route("/api/messages", methods=["GET"])
def get_messages():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute("SELECT id, name, email, subject, message, created_at FROM contact_messages ORDER BY created_at DESC")
    messages = [
        {
            "id": row[0],
            "name": row[1],
            "email": row[2],
            "subject": row[3],
            "message": row[4],
            "created_at": row[5]
        } for row in cursor.fetchall()
    ]
    conn.close()
    
    return jsonify({"success": True, "data": messages})

# Rota para servir o index.html na raiz
@app.route("/")
def serve_index():
    return send_from_directory(PROJECT_ROOT, "index.html")

# Rota para servir outras páginas HTML
@app.route("/<page_name>.html")
def serve_html_page(page_name):
    return send_from_directory(PROJECT_ROOT, f"{page_name}.html")

# Rota para servir arquivos estáticos (CSS, JS, imagens, etc.)
@app.route("/<path:filename>")
def serve_static(filename):
    # Evita que a rota de arquivos estáticos intercepte as rotas da API
    if filename.startswith("api/") or filename.startswith("backend/"):
        return "", 404
    return send_from_directory(PROJECT_ROOT, filename)

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)


