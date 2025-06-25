from flask import Flask, request, jsonify, session
from flask_cors import CORS
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
import os
import json
from datetime import datetime, timedelta
import sqlite3
import secrets
from admin_routes import admin_bp
from content_routes import content_bp
from stats_routes import stats_bp
from config import config, Config
from utils import send_email, validate_contact_data, format_api_response
import logging

# Configurar logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

def create_app(config_name='default'):
    """Factory function para criar a aplicação Flask"""
    app = Flask(__name__)
    
    # Carregar configuração
    app.config.from_object(config[config_name])
    
    # Configurar chave secreta
    app.secret_key = app.config['SECRET_KEY']
    app.config['SESSION_TYPE'] = 'filesystem'
    app.config['SESSION_PERMANENT'] = True
    app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=1)
    
    # Configurar CORS
    CORS(app, supports_credentials=True, origins="*")
    
    # Configurar rate limiting
    limiter = Limiter(
        app=app,
        key_func=get_remote_address,
        default_limits=[f"{Config.RATE_LIMIT_PER_MINUTE} per minute"]
    )
    
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
            ip_address TEXT,
            user_agent TEXT,
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
        pages = ['index.html', 'sobre.html', 'areas-pesquisa.html', 'laboratorio.html', 'contato.html', 'projetos.html', 'publicacoes.html', 'orientacoes.html']
        for page in pages:
            cursor.execute('INSERT OR IGNORE INTO page_visits (page, visit_count) VALUES (?, 0)', (page,))
        
        conn.commit()
        conn.close()
        logger.info("Banco de dados inicializado com sucesso")
    
    # Inicializar o banco de dados
    with app.app_context():
        init_db()
    
    @app.route('/api/health', methods=['GET'])
    def health_check():
        """Endpoint para verificação de saúde da API"""
        return format_api_response(
            success=True,
            message="API funcionando corretamente",
            data={
                'status': 'healthy',
                'timestamp': datetime.now().isoformat(),
                'version': '1.0.0'
            }
        )
    
    @app.route('/api/contact', methods=['POST'])
    @limiter.limit("5 per minute")  # Limite específico para contato
    def contact():
        """Endpoint para receber mensagens de contato"""
        try:
            data = request.json
            
            if not data:
                return jsonify(format_api_response(
                    success=False,
                    message="Dados não fornecidos"
                )), 400
            
            # Validar dados
            validation = validate_contact_data(data)
            
            if not validation['valid']:
                return jsonify(format_api_response(
                    success=False,
                    message="Dados inválidos",
                    errors=validation['errors']
                )), 400
            
            validated_data = validation['data']
            
            # Obter informações adicionais
            ip_address = request.environ.get('HTTP_X_FORWARDED_FOR', request.environ.get('REMOTE_ADDR', 'unknown'))
            user_agent = request.headers.get('User-Agent', 'unknown')
            
            # Salvar no banco de dados
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute(
                '''INSERT INTO contact_messages 
                   (name, email, subject, message, ip_address, user_agent) 
                   VALUES (?, ?, ?, ?, ?, ?)''',
                (validated_data['name'], validated_data['email'], 
                 validated_data['subject'], validated_data['message'],
                 ip_address, user_agent)
            )
            conn.commit()
            conn.close()
            
            # Tentar enviar email
            email_success, email_message = send_email(
                validated_data['name'],
                validated_data['email'],
                validated_data['subject'],
                validated_data['message']
            )
            
            if email_success:
                logger.info(f"Mensagem de contato recebida e email enviado: {validated_data['name']} ({validated_data['email']})")
                return jsonify(format_api_response(
                    success=True,
                    message="Mensagem enviada com sucesso! Responderemos em breve."
                ))
            else:
                logger.warning(f"Mensagem salva mas email não enviado: {email_message}")
                return jsonify(format_api_response(
                    success=True,
                    message="Mensagem recebida com sucesso! Responderemos em breve."
                ))
                
        except Exception as e:
            logger.error(f"Erro no endpoint de contato: {e}")
            return jsonify(format_api_response(
                success=False,
                message="Erro interno do servidor. Tente novamente mais tarde."
            )), 500
    
    @app.route('/api/track-visit', methods=['POST'])
    @limiter.limit("30 per minute")  # Limite para tracking
    def track_visit():
        """Endpoint para rastrear visitas às páginas"""
        try:
            data = request.json
            
            if not data or 'page' not in data:
                return jsonify(format_api_response(
                    success=False,
                    message="Campo 'page' é obrigatório"
                )), 400
            
            page = data['page'].strip()
            
            if not page:
                return jsonify(format_api_response(
                    success=False,
                    message="Nome da página não pode estar vazio"
                )), 400
            
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            
            # Verificar se a página já existe
            cursor.execute('SELECT visit_count FROM page_visits WHERE page = ?', (page,))
            result = cursor.fetchone()
            
            if result:
                # Atualizar a contagem de visitas
                cursor.execute(
                    'UPDATE page_visits SET visit_count = visit_count + 1, last_visit = CURRENT_TIMESTAMP WHERE page = ?',
                    (page,)
                )
            else:
                # Inserir nova página
                cursor.execute(
                    'INSERT INTO page_visits (page, visit_count) VALUES (?, 1)',
                    (page,)
                )
            
            conn.commit()
            conn.close()
            
            return jsonify(format_api_response(
                success=True,
                message="Visita registrada com sucesso"
            ))
            
        except Exception as e:
            logger.error(f"Erro ao rastrear visita: {e}")
            return jsonify(format_api_response(
                success=False,
                message="Erro interno do servidor"
            )), 500
    
    @app.route('/api/visits', methods=['GET'])
    def get_visits():
        """Endpoint para obter estatísticas de visitas"""
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute('SELECT page, visit_count, last_visit FROM page_visits ORDER BY visit_count DESC')
            visits = [
                {
                    'page': row[0], 
                    'visit_count': row[1], 
                    'last_visit': row[2]
                } for row in cursor.fetchall()
            ]
            conn.close()
            
            return jsonify(format_api_response(
                success=True,
                message="Estatísticas de visitas obtidas com sucesso",
                data=visits
            ))
            
        except Exception as e:
            logger.error(f"Erro ao obter visitas: {e}")
            return jsonify(format_api_response(
                success=False,
                message="Erro interno do servidor"
            )), 500
    
    @app.route('/api/messages', methods=['GET'])
    def get_messages():
        """Endpoint para obter mensagens de contato (requer autenticação)"""
        try:
            # Verificar autenticação
            if 'user_id' not in session:
                return jsonify(format_api_response(
                    success=False,
                    message="Autenticação necessária"
                )), 401
            
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            cursor.execute('''
                SELECT id, name, email, subject, message, ip_address, user_agent, created_at 
                FROM contact_messages 
                ORDER BY created_at DESC
            ''')
            messages = [
                {
                    'id': row[0],
                    'name': row[1],
                    'email': row[2],
                    'subject': row[3],
                    'message': row[4],
                    'ip_address': row[5],
                    'user_agent': row[6],
                    'created_at': row[7]
                } for row in cursor.fetchall()
            ]
            conn.close()
            
            return jsonify(format_api_response(
                success=True,
                message="Mensagens obtidas com sucesso",
                data=messages
            ))
            
        except Exception as e:
            logger.error(f"Erro ao obter mensagens: {e}")
            return jsonify(format_api_response(
                success=False,
                message="Erro interno do servidor"
            )), 500
    
    @app.route('/api/messages/stats', methods=['GET'])
    def get_messages_stats():
        """Endpoint público para obter estatísticas básicas de mensagens"""
        try:
            conn = sqlite3.connect(DB_PATH)
            cursor = conn.cursor()
            
            # Total de mensagens
            cursor.execute('SELECT COUNT(*) FROM contact_messages')
            total_messages = cursor.fetchone()[0] or 0
            
            # Mensagens recentes (últimos 7 dias)
            cursor.execute('''
                SELECT COUNT(*) FROM contact_messages 
                WHERE created_at >= datetime('now', '-7 days')
            ''')
            recent_messages = cursor.fetchone()[0] or 0
            
            # Mensagens básicas para dashboard (sem dados sensíveis)
            cursor.execute('''
                SELECT id, name, subject, created_at 
                FROM contact_messages 
                ORDER BY created_at DESC 
                LIMIT 10
            ''')
            recent_list = [
                {
                    'id': row[0],
                    'name': row[1],
                    'subject': row[2],
                    'created_at': row[3]
                } for row in cursor.fetchall()
            ]
            
            conn.close()
            
            return jsonify(format_api_response(
                success=True,
                message="Estatísticas de mensagens obtidas com sucesso",
                data={
                    'total_messages': total_messages,
                    'recent_messages': recent_messages,
                    'recent_list': recent_list
                }
            ))
            
        except Exception as e:
            logger.error(f"Erro ao obter estatísticas de mensagens: {e}")
            return jsonify(format_api_response(
                success=False,
                message="Erro interno do servidor"
            )), 500
    
    @app.errorhandler(404)
    def not_found(error):
        return jsonify(format_api_response(
            success=False,
            message="Endpoint não encontrado"
        )), 404
    
    @app.errorhandler(405)
    def method_not_allowed(error):
        return jsonify(format_api_response(
            success=False,
            message="Método não permitido"
        )), 405
    
    @app.errorhandler(429)
    def ratelimit_handler(e):
        return jsonify(format_api_response(
            success=False,
            message="Muitas requisições. Tente novamente mais tarde."
        )), 429
    
    @app.errorhandler(500)
    def internal_error(error):
        logger.error(f"Erro interno do servidor: {error}")
        return jsonify(format_api_response(
            success=False,
            message="Erro interno do servidor"
        )), 500
    
    return app

# Criar aplicação
app = create_app()

if __name__ == '__main__':
    logger.info("Iniciando servidor Flask...")
    app.run(host='0.0.0.0', port=5000, debug=Config.DEBUG)

