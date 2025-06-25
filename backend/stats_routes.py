from flask import Blueprint, request, jsonify, session
import sqlite3
import os
import json
from datetime import datetime, timedelta
from admin_routes import login_required

stats_bp = Blueprint('stats', __name__)

# Configuração do banco de dados
DB_PATH = os.path.join(os.path.dirname(__file__), 'site_data.db')

# Inicialização do banco de dados para estatísticas
def init_stats_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Tabela para estatísticas detalhadas de visitas
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS visit_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        page TEXT NOT NULL,
        visit_date DATE NOT NULL,
        visit_hour INTEGER NOT NULL,
        visit_count INTEGER DEFAULT 1,
        UNIQUE(page, visit_date, visit_hour)
    )
    ''')
    
    # Tabela para estatísticas de referência
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS referrer_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        referrer TEXT NOT NULL,
        visit_date DATE NOT NULL,
        visit_count INTEGER DEFAULT 1,
        UNIQUE(referrer, visit_date)
    )
    ''')
    
    # Tabela para estatísticas de dispositivo/navegador
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS device_stats (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        device_type TEXT NOT NULL,
        browser TEXT NOT NULL,
        visit_date DATE NOT NULL,
        visit_count INTEGER DEFAULT 1,
        UNIQUE(device_type, browser, visit_date)
    )
    ''')
    
    conn.commit()
    conn.close()

# Inicializar o banco de dados de estatísticas
init_stats_db()

@stats_bp.route('/track-detailed', methods=['POST'])
def track_detailed_visit():
    data = request.json
    
    if 'page' not in data:
        return jsonify({'success': False, 'message': 'Campo page é obrigatório'}), 400
    
    page = data['page']
    referrer = data.get('referrer', 'direct')
    device_type = data.get('device_type', 'desktop')
    browser = data.get('browser', 'unknown')
    
    # Data e hora atual
    now = datetime.now()
    visit_date = now.strftime('%Y-%m-%d')
    visit_hour = now.hour
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Atualizar estatísticas de visitas por página, data e hora
    cursor.execute(
        '''
        INSERT INTO visit_stats (page, visit_date, visit_hour, visit_count)
        VALUES (?, ?, ?, 1)
        ON CONFLICT(page, visit_date, visit_hour) 
        DO UPDATE SET visit_count = visit_count + 1
        ''',
        (page, visit_date, visit_hour)
    )
    
    # Atualizar estatísticas de referência
    cursor.execute(
        '''
        INSERT INTO referrer_stats (referrer, visit_date, visit_count)
        VALUES (?, ?, 1)
        ON CONFLICT(referrer, visit_date) 
        DO UPDATE SET visit_count = visit_count + 1
        ''',
        (referrer, visit_date)
    )
    
    # Atualizar estatísticas de dispositivo/navegador
    cursor.execute(
        '''
        INSERT INTO device_stats (device_type, browser, visit_date, visit_count)
        VALUES (?, ?, ?, 1)
        ON CONFLICT(device_type, browser, visit_date) 
        DO UPDATE SET visit_count = visit_count + 1
        ''',
        (device_type, browser, visit_date)
    )
    
    # Atualizar também a tabela principal de visitas
    cursor.execute(
        '''
        INSERT INTO page_visits (page, visit_count)
        VALUES (?, 1)
        ON CONFLICT(page) 
        DO UPDATE SET visit_count = visit_count + 1, last_visit = CURRENT_TIMESTAMP
        ''',
        (page,)
    )
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'message': 'Visita registrada com sucesso!'})

@stats_bp.route('/daily', methods=['GET'])
@login_required
def get_daily_stats():
    days = request.args.get('days', '30')
    try:
        days = int(days)
        if days <= 0:
            days = 30
    except ValueError:
        days = 30
    
    # Data limite
    limit_date = (datetime.now() - timedelta(days=days)).strftime('%Y-%m-%d')
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Estatísticas diárias de visitas
    cursor.execute(
        '''
        SELECT visit_date, SUM(visit_count) as total
        FROM visit_stats
        WHERE visit_date >= ?
        GROUP BY visit_date
        ORDER BY visit_date
        ''',
        (limit_date,)
    )
    
    daily_visits = [{'date': row[0], 'visits': row[1]} for row in cursor.fetchall()]
    
    # Estatísticas por página
    cursor.execute(
        '''
        SELECT page, SUM(visit_count) as total
        FROM visit_stats
        WHERE visit_date >= ?
        GROUP BY page
        ORDER BY total DESC
        LIMIT 10
        ''',
        (limit_date,)
    )
    
    page_visits = [{'page': row[0], 'visits': row[1]} for row in cursor.fetchall()]
    
    # Estatísticas por hora do dia
    cursor.execute(
        '''
        SELECT visit_hour, SUM(visit_count) as total
        FROM visit_stats
        WHERE visit_date >= ?
        GROUP BY visit_hour
        ORDER BY visit_hour
        ''',
        (limit_date,)
    )
    
    hourly_visits = [{'hour': row[0], 'visits': row[1]} for row in cursor.fetchall()]
    
    # Estatísticas por referência
    cursor.execute(
        '''
        SELECT referrer, SUM(visit_count) as total
        FROM referrer_stats
        WHERE visit_date >= ?
        GROUP BY referrer
        ORDER BY total DESC
        LIMIT 10
        ''',
        (limit_date,)
    )
    
    referrer_visits = [{'referrer': row[0], 'visits': row[1]} for row in cursor.fetchall()]
    
    # Estatísticas por dispositivo
    cursor.execute(
        '''
        SELECT device_type, SUM(visit_count) as total
        FROM device_stats
        WHERE visit_date >= ?
        GROUP BY device_type
        ORDER BY total DESC
        ''',
        (limit_date,)
    )
    
    device_visits = [{'device': row[0], 'visits': row[1]} for row in cursor.fetchall()]
    
    # Estatísticas por navegador
    cursor.execute(
        '''
        SELECT browser, SUM(visit_count) as total
        FROM device_stats
        WHERE visit_date >= ?
        GROUP BY browser
        ORDER BY total DESC
        LIMIT 10
        ''',
        (limit_date,)
    )
    
    browser_visits = [{'browser': row[0], 'visits': row[1]} for row in cursor.fetchall()]
    
    conn.close()
    
    return jsonify({
        'success': True,
        'data': {
            'daily_visits': daily_visits,
            'page_visits': page_visits,
            'hourly_visits': hourly_visits,
            'referrer_visits': referrer_visits,
            'device_visits': device_visits,
            'browser_visits': browser_visits
        }
    })

@stats_bp.route('/summary', methods=['GET'])
@login_required
def get_stats_summary():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Total de visitas
    cursor.execute('SELECT SUM(visit_count) FROM page_visits')
    total_visits = cursor.fetchone()[0] or 0
    
    # Visitas hoje
    today = datetime.now().strftime('%Y-%m-%d')
    cursor.execute(
        'SELECT SUM(visit_count) FROM visit_stats WHERE visit_date = ?',
        (today,)
    )
    today_visits = cursor.fetchone()[0] or 0
    
    # Visitas ontem
    yesterday = (datetime.now() - timedelta(days=1)).strftime('%Y-%m-%d')
    cursor.execute(
        'SELECT SUM(visit_count) FROM visit_stats WHERE visit_date = ?',
        (yesterday,)
    )
    yesterday_visits = cursor.fetchone()[0] or 0
    
    # Visitas nos últimos 7 dias
    last_week = (datetime.now() - timedelta(days=7)).strftime('%Y-%m-%d')
    cursor.execute(
        'SELECT SUM(visit_count) FROM visit_stats WHERE visit_date >= ?',
        (last_week,)
    )
    last_week_visits = cursor.fetchone()[0] or 0
    
    # Páginas mais visitadas
    cursor.execute(
        'SELECT page, visit_count FROM page_visits ORDER BY visit_count DESC LIMIT 5'
    )
    top_pages = [{'page': row[0], 'visits': row[1]} for row in cursor.fetchall()]
    
    conn.close()
    
    return jsonify({
        'success': True,
        'data': {
            'total_visits': total_visits,
            'today_visits': today_visits,
            'yesterday_visits': yesterday_visits,
            'last_week_visits': last_week_visits,
            'top_pages': top_pages
        }
    })

