import os
from dotenv import load_dotenv

# Carregar variáveis de ambiente
load_dotenv()

class Config:
    """Configurações base da aplicação"""
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key-12345'
    DATABASE_URL = os.environ.get('DATABASE_URL') or 'sqlite:///site_data.db'
    
    # Configurações de Email
    SMTP_SERVER = os.environ.get('SMTP_SERVER') or 'localhost'
    SMTP_PORT = int(os.environ.get('SMTP_PORT') or 1025)
    SMTP_USERNAME = os.environ.get('SMTP_USERNAME') or 'dev@localhost'
    SMTP_PASSWORD = os.environ.get('SMTP_PASSWORD') or 'dev'
    SMTP_USE_TLS = os.environ.get('SMTP_USE_TLS', 'False').lower() == 'true'
    
    # Configurações de Segurança
    ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL') or 'yuridantas85@gmail.com'
    RATE_LIMIT_PER_MINUTE = int(os.environ.get('RATE_LIMIT_PER_MINUTE') or 60)
    
    # Configurações de Debug
    DEBUG = os.environ.get('DEBUG', 'True').lower() == 'true'
    TESTING = os.environ.get('TESTING', 'False').lower() == 'true'

class DevelopmentConfig(Config):
    """Configurações para desenvolvimento"""
    DEBUG = True
    TESTING = False

class ProductionConfig(Config):
    """Configurações para produção"""
    DEBUG = False
    TESTING = False

class TestingConfig(Config):
    """Configurações para testes"""
    DEBUG = True
    TESTING = True
    DATABASE_URL = 'sqlite:///test_site_data.db'

# Configuração padrão
config = {
    'development': DevelopmentConfig,
    'production': ProductionConfig,
    'testing': TestingConfig,
    'default': DevelopmentConfig
}

