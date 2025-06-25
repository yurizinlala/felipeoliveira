from flask import Flask, request, jsonify, session
from flask_cors import CORS
import os
import json
from datetime import datetime, timedelta
import sqlite3
import smtplib
import secrets
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from admin_routes import admin_bp
from content_routes import content_bp
from stats_routes import stats_bp

app = Flask(__name__)
app.secret_key = secrets.token_hex(16)  # Gera uma chave secreta aleatória
app.config['SESSION_TYPE'] = 'filesystem'
app.config['SESSION_PERMANENT'] = True
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=1)  # Sessão expira em 1 dia
CORS(app, supports_credentials=True)  # Habilita CORS com suporte a credenciais

# Registrar blueprints
app.register_blueprint(admin_bp, url_prefix='/api/admin')
app.register_blueprint(content_bp, url_prefix='/api/content')
app.register_blueprint(stats_bp, url_prefix='/api/stats')

# Configuração do banco de dados
DB_PATH = os.path.join(os.path.dirname(__file__), 'site_data.db')

# Inicialização do banco de dados
def init_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Tabela para mensagens de contato
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS contact_messages (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        subject TEXT NOT NULL,
        message TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Tabela para contagem de visitas
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS page_visits (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        page TEXT UNIQUE NOT NULL,
        visit_count INTEGER DEFAULT 0,
        last_visit TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
    ''')
    
    # Inserir páginas iniciais
    pages = ['index.html', 'sobre.html', 'areas-pesquisa.html', 'laboratorio.html', 'contato.html']
    for page in pages:
        cursor.execute('INSERT OR IGNORE INTO page_visits (page, visit_count) VALUES (?, 0)', (page,))
    
    conn.commit()
    conn.close()

# Inicializa o banco de dados na inicialização do aplicativo
init_db()

# Função para enviar email (simulada)
def send_email(name, email, subject, message):
    # Esta função seria implementada com um serviço de email real
    # Por enquanto, apenas simula o envio
    print(f"Enviando email de {name} ({email})")
    print(f"Assunto: {subject}")
    print(f"Mensagem: {message}")
    return True

@app.route('/api/contact', methods=['POST'])
def contact():
    data = request.json
    
    # Validação básica
    required_fields = ['name', 'email', 'subject', 'message']
    for field in required_fields:
        if field not in data or not data[field]:
            return jsonify({'success': False, 'message': f'Campo {field} é obrigatório'}), 400
    
    name = data['name']
    email = data['email']
    subject = data['subject']
    message = data['message']
    
    # Salvar no banco de dados
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute(
        'INSERT INTO contact_messages (name, email, subject, message) VALUES (?, ?, ?, ?)',
        (name, email, subject, message)
    )
    conn.commit()
    conn.close()
    
    # Enviar email (simulado)
    try:
        send_email(name, email, subject, message)
    except Exception as e:
        print(f"Erro ao enviar email: {e}")
        # Não falha se o email não puder ser enviado, pois já salvamos no banco
    
    return jsonify({'success': True, 'message': 'Mensagem enviada com sucesso!'})

@app.route('/api/track-visit', methods=['POST'])
def track_visit():
    data = request.json
    
    if 'page' not in data:
        return jsonify({'success': False, 'message': 'Campo page é obrigatório'}), 400
    
    page = data['page']
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Verifica se a página já existe
    cursor.execute('SELECT visit_count FROM page_visits WHERE page = ?', (page,))
    result = cursor.fetchone()
    
    if result:
        # Atualiza a contagem de visitas
        cursor.execute(
            'UPDATE page_visits SET visit_count = visit_count + 1, last_visit = CURRENT_TIMESTAMP WHERE page = ?',
            (page,)
        )
    else:
        # Insere nova página
        cursor.execute(
            'INSERT INTO page_visits (page, visit_count) VALUES (?, 1)',
            (page,)
        )
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'message': 'Visita registrada com sucesso!'})

@app.route('/api/visits', methods=['GET'])
def get_visits():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT page, visit_count, last_visit FROM page_visits ORDER BY visit_count DESC')
    visits = [{'page': row[0], 'visit_count': row[1], 'last_visit': row[2]} for row in cursor.fetchall()]
    conn.close()
    
    return jsonify({'success': True, 'data': visits})

@app.route('/api/messages', methods=['GET'])
def get_messages():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    cursor.execute('SELECT id, name, email, subject, message, created_at FROM contact_messages ORDER BY created_at DESC')
    messages = [
        {
            'id': row[0],
            'name': row[1],
            'email': row[2],
            'subject': row[3],
            'message': row[4],
            'created_at': row[5]
        } for row in cursor.fetchall()
    ]
    conn.close()
    
    return jsonify({'success': True, 'data': messages})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)

