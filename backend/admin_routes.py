from flask import Blueprint, request, jsonify, session
import sqlite3
import os
import json
import hashlib
import secrets
from datetime import datetime, timedelta
from functools import wraps

admin_bp = Blueprint('admin', __name__)

# Configuração do banco de dados
DB_PATH = os.path.join(os.path.dirname(__file__), 'site_data.db')

# Função para verificar se o usuário está autenticado
def login_required(f):
    @wraps(f)
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return jsonify({'success': False, 'message': 'Autenticação necessária'}), 401
        return f(*args, **kwargs)
    return decorated_function

# Inicialização do banco de dados para administração
def init_admin_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Tabela para usuários administradores
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS admin_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP
    )
    ''')
    
    # Tabela para conteúdo editável do site
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS site_content (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        page TEXT NOT NULL,
        section TEXT NOT NULL,
        content TEXT NOT NULL,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by INTEGER,
        FOREIGN KEY (updated_by) REFERENCES admin_users (id)
    )
    ''')
    
    # Verificar se já existe um usuário administrador
    cursor.execute('SELECT COUNT(*) FROM admin_users')
    count = cursor.fetchone()[0]
    
    # Se não existir, criar um usuário padrão
    if count == 0:
        # Senha padrão: admin123
        password_hash = hashlib.sha256('admin123'.encode()).hexdigest()
        cursor.execute(
            'INSERT INTO admin_users (username, password_hash, name, email) VALUES (?, ?, ?, ?)',
            ('admin', password_hash, 'Administrador', 'yuridantas85@gmail.com')
        )
    
    conn.commit()
    conn.close()

# Inicializar o banco de dados de administração
init_admin_db()

@admin_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    
    if 'username' not in data or 'password' not in data:
        return jsonify({'success': False, 'message': 'Usuário e senha são obrigatórios'}), 400
    
    username = data['username']
    password = data['password']
    password_hash = hashlib.sha256(password.encode()).hexdigest()
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute(
        'SELECT id, name, email FROM admin_users WHERE username = ? AND password_hash = ?',
        (username, password_hash)
    )
    user = cursor.fetchone()
    
    if user:
        # Atualizar último login
        cursor.execute(
            'UPDATE admin_users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
            (user[0],)
        )
        conn.commit()
        
        # Criar sessão
        session['user_id'] = user[0]
        session['username'] = username
        session['name'] = user[1]
        
        conn.close()
        return jsonify({
            'success': True,
            'message': 'Login realizado com sucesso',
            'user': {
                'id': user[0],
                'username': username,
                'name': user[1],
                'email': user[2]
            }
        })
    
    conn.close()
    return jsonify({'success': False, 'message': 'Usuário ou senha inválidos'}), 401

@admin_bp.route('/logout', methods=['POST'])
def logout():
    session.clear()
    return jsonify({'success': True, 'message': 'Logout realizado com sucesso'})

@admin_bp.route('/check-auth', methods=['GET'])
def check_auth():
    if 'user_id' in session:
        return jsonify({
            'success': True,
            'authenticated': True,
            'user': {
                'id': session['user_id'],
                'username': session['username'],
                'name': session['name']
            }
        })
    
    return jsonify({'success': True, 'authenticated': False})

@admin_bp.route('/change-password', methods=['POST'])
def change_password():
    data = request.json
    
    if 'current_password' not in data or 'new_password' not in data:
        return jsonify({'success': False, 'message': 'Senha atual e nova senha são obrigatórias'}), 400
    
    current_password = data['current_password']
    new_password = data['new_password']
    
    # Validar nova senha (mínimo 6 caracteres)
    if len(new_password) < 6:
        return jsonify({'success': False, 'message': 'A nova senha deve ter pelo menos 6 caracteres'}), 400
    
    current_password_hash = hashlib.sha256(current_password.encode()).hexdigest()
    new_password_hash = hashlib.sha256(new_password.encode()).hexdigest()
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Verificar senha atual (buscar qualquer usuário admin)
    cursor.execute(
        'SELECT id FROM admin_users WHERE password_hash = ?',
        (current_password_hash,)
    )
    user = cursor.fetchone()
    
    if not user:
        conn.close()
        return jsonify({'success': False, 'message': 'Senha atual incorreta'}), 401
    
    # Atualizar senha do usuário encontrado
    cursor.execute(
        'UPDATE admin_users SET password_hash = ? WHERE id = ?',
        (new_password_hash, user[0])
    )
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'message': 'Senha alterada com sucesso'})

@admin_bp.route('/dashboard', methods=['GET'])
@login_required
def dashboard():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Obter estatísticas de visitas
    cursor.execute('SELECT SUM(visit_count) FROM page_visits')
    total_visits = cursor.fetchone()[0] or 0
    
    cursor.execute('SELECT page, visit_count FROM page_visits ORDER BY visit_count DESC LIMIT 5')
    top_pages = [{'page': row[0], 'visits': row[1]} for row in cursor.fetchall()]
    
    # Obter estatísticas de mensagens
    cursor.execute('SELECT COUNT(*) FROM contact_messages')
    total_messages = cursor.fetchone()[0] or 0
    
    cursor.execute('SELECT COUNT(*) FROM contact_messages WHERE created_at > ?', 
                  (datetime.now() - timedelta(days=7),))
    recent_messages = cursor.fetchone()[0] or 0
    
    conn.close()
    
    return jsonify({
        'success': True,
        'stats': {
            'total_visits': total_visits,
            'top_pages': top_pages,
            'total_messages': total_messages,
            'recent_messages': recent_messages
        }
    })

