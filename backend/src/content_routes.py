from flask import Blueprint, request, jsonify, session
import sqlite3
import os
import json
from datetime import datetime
from admin_routes import login_required

content_bp = Blueprint('content', __name__)

# Configuração do banco de dados
DB_PATH = os.path.join(os.path.dirname(__file__), 'site_data.db')

# Inicialização do banco de dados para conteúdo
def init_content_db():
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Tabela para conteúdo de áreas de pesquisa
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS research_content (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        category TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by INTEGER,
        FOREIGN KEY (updated_by) REFERENCES admin_users (id)
    )
    ''')
    
    # Tabela para conteúdo de páginas
    cursor.execute('''
    CREATE TABLE IF NOT EXISTS page_content (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        page TEXT NOT NULL,
        section TEXT NOT NULL,
        title TEXT,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_by INTEGER,
        FOREIGN KEY (updated_by) REFERENCES admin_users (id)
    )
    ''')
    
    # Verificar se já existe conteúdo inicial
    cursor.execute('SELECT COUNT(*) FROM research_content')
    count = cursor.fetchone()[0]
    
    # Se não existir, criar conteúdo inicial
    if count == 0:
        # Inserir alguns conteúdos de exemplo
        research_items = [
            ('Sistemas Embarcados', 'Desenvolvimento de sistemas embarcados para aplicações de tempo real.', 'pesquisa'),
            ('Sistemas de Tempo Real', 'Estudo e implementação de sistemas de tempo real para aplicações críticas.', 'pesquisa'),
            ('Internet das Coisas', 'Pesquisa em tecnologias e aplicações para Internet das Coisas (IoT).', 'pesquisa'),
            ('Artigo: Análise de Desempenho de Sistemas Embarcados', 'Publicado na revista IEEE Transactions on Embedded Systems, 2023.', 'publicacao'),
            ('Artigo: Algoritmos para Sistemas de Tempo Real', 'Publicado na conferência RTSS 2022.', 'publicacao'),
            ('Orientação: Implementação de Sistema IoT para Monitoramento Ambiental', 'Aluno: João Silva, Mestrado, 2023-2024', 'orientacao'),
            ('Orientação: Desenvolvimento de Framework para Sistemas Embarcados', 'Aluna: Maria Santos, Doutorado, 2022-2025', 'orientacao')
        ]
        
        cursor.executemany(
            'INSERT INTO research_content (title, content, category) VALUES (?, ?, ?)',
            research_items
        )
        
        # Inserir conteúdo inicial das páginas
        page_contents = [
            ('sobre', 'bio', 'Biografia', 'Professor Felipe Dennis Mendonça de Oliveira é doutor em Ciência da Computação pela Universidade Federal do Rio Grande do Norte (UFRN) e atua como professor no Departamento de Computação da Universidade do Estado do Rio Grande do Norte (UERN). Possui experiência nas áreas de Sistemas Embarcados, Sistemas de Tempo Real e Internet das Coisas (IoT).'),
            ('sobre', 'education', 'Formação Acadêmica', '- Doutorado em Ciência da Computação, UFRN, 2015-2019\n- Mestrado em Ciência da Computação, UFRN, 2013-2015\n- Graduação em Engenharia de Computação, UERN, 2008-2012'),
            ('laboratorio', 'description', 'Descrição do Laboratório', 'O Laboratório de Sistemas Embarcados e de Tempo Real (LUMEN) é um espaço dedicado à pesquisa e desenvolvimento de soluções tecnológicas para sistemas embarcados, sistemas de tempo real e Internet das Coisas. O laboratório está vinculado ao Departamento de Computação da UERN e atua em parceria com empresas e outras instituições de pesquisa.'),
            ('laboratorio', 'infrastructure', 'Infraestrutura', '- Equipamentos para desenvolvimento de sistemas embarcados\n- Plataformas de prototipação (Arduino, Raspberry Pi, ESP32)\n- Sensores e atuadores diversos\n- Estações de trabalho para desenvolvimento de software\n- Equipamentos para testes e validação')
        ]
        
        cursor.executemany(
            'INSERT INTO page_content (page, section, title, content) VALUES (?, ?, ?, ?)',
            page_contents
        )
    
    conn.commit()
    conn.close()

# Inicializar o banco de dados de conteúdo
init_content_db()

@content_bp.route('/research', methods=['GET'])
def get_research_content():
    category = request.args.get('category', 'all')
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    if category != 'all':
        cursor.execute(
            'SELECT id, title, content, category, created_at, updated_at FROM research_content WHERE category = ? ORDER BY updated_at DESC',
            (category,)
        )
    else:
        cursor.execute(
            'SELECT id, title, content, category, created_at, updated_at FROM research_content ORDER BY updated_at DESC'
        )
    
    items = [
        {
            'id': row[0],
            'title': row[1],
            'content': row[2],
            'category': row[3],
            'created_at': row[4],
            'updated_at': row[5]
        } for row in cursor.fetchall()
    ]
    
    conn.close()
    
    return jsonify({'success': True, 'data': items})

@content_bp.route('/research', methods=['POST'])
@login_required
def add_research_content():
    data = request.json
    
    if 'title' not in data or 'content' not in data or 'category' not in data:
        return jsonify({'success': False, 'message': 'Título, conteúdo e categoria são obrigatórios'}), 400
    
    title = data['title']
    content = data['content']
    category = data['category']
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute(
        'INSERT INTO research_content (title, content, category, updated_by) VALUES (?, ?, ?, ?)',
        (title, content, category, session.get('user_id'))
    )
    
    item_id = cursor.lastrowid
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'message': 'Conteúdo adicionado com sucesso',
        'data': {
            'id': item_id,
            'title': title,
            'content': content,
            'category': category
        }
    })

@content_bp.route('/research/<int:item_id>', methods=['PUT'])
@login_required
def update_research_content(item_id):
    data = request.json
    
    if 'title' not in data or 'content' not in data or 'category' not in data:
        return jsonify({'success': False, 'message': 'Título, conteúdo e categoria são obrigatórios'}), 400
    
    title = data['title']
    content = data['content']
    category = data['category']
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute(
        'UPDATE research_content SET title = ?, content = ?, category = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ? WHERE id = ?',
        (title, content, category, session.get('user_id'), item_id)
    )
    
    if cursor.rowcount == 0:
        conn.close()
        return jsonify({'success': False, 'message': 'Conteúdo não encontrado'}), 404
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'message': 'Conteúdo atualizado com sucesso',
        'data': {
            'id': item_id,
            'title': title,
            'content': content,
            'category': category
        }
    })

@content_bp.route('/research/<int:item_id>', methods=['DELETE'])
@login_required
def delete_research_content(item_id):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute('DELETE FROM research_content WHERE id = ?', (item_id,))
    
    if cursor.rowcount == 0:
        conn.close()
        return jsonify({'success': False, 'message': 'Conteúdo não encontrado'}), 404
    
    conn.commit()
    conn.close()
    
    return jsonify({'success': True, 'message': 'Conteúdo excluído com sucesso'})

@content_bp.route('/page/<page>/<section>', methods=['GET'])
def get_page_content(page, section):
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    cursor.execute(
        'SELECT id, title, content, updated_at FROM page_content WHERE page = ? AND section = ?',
        (page, section)
    )
    
    row = cursor.fetchone()
    
    if not row:
        conn.close()
        return jsonify({'success': False, 'message': 'Conteúdo não encontrado'}), 404
    
    content = {
        'id': row[0],
        'title': row[1],
        'content': row[2],
        'updated_at': row[3]
    }
    
    conn.close()
    
    return jsonify({'success': True, 'data': content})

@content_bp.route('/page/<page>/<section>', methods=['PUT'])
@login_required
def update_page_content(page, section):
    data = request.json
    
    if 'content' not in data:
        return jsonify({'success': False, 'message': 'Conteúdo é obrigatório'}), 400
    
    content = data['content']
    title = data.get('title')
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    # Verificar se o conteúdo existe
    cursor.execute(
        'SELECT id FROM page_content WHERE page = ? AND section = ?',
        (page, section)
    )
    
    row = cursor.fetchone()
    
    if row:
        # Atualizar conteúdo existente
        cursor.execute(
            'UPDATE page_content SET content = ?, title = ?, updated_at = CURRENT_TIMESTAMP, updated_by = ? WHERE page = ? AND section = ?',
            (content, title, session.get('user_id'), page, section)
        )
    else:
        # Inserir novo conteúdo
        cursor.execute(
            'INSERT INTO page_content (page, section, title, content, updated_by) VALUES (?, ?, ?, ?, ?)',
            (page, section, title, content, session.get('user_id'))
        )
    
    conn.commit()
    conn.close()
    
    return jsonify({
        'success': True,
        'message': 'Conteúdo atualizado com sucesso',
        'data': {
            'page': page,
            'section': section,
            'title': title,
            'content': content
        }
    })

