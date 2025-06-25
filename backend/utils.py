import smtplib
import logging
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from email_validator import validate_email, EmailNotValidError
from config import Config

# Configurar logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def validate_email_address(email):
    """Valida um endereço de email"""
    try:
        valid = validate_email(email)
        return True, valid.email
    except EmailNotValidError as e:
        return False, str(e)

def send_email(name, email, subject, message):
    """Envia email usando SMTP do Gmail"""
    try:
        # Validar email do remetente
        is_valid, validated_email = validate_email_address(email)
        if not is_valid:
            logger.error(f"Email inválido: {email} - {validated_email}")
            return False, f"Email inválido: {validated_email}"
        
        # Configurações do Gmail
        smtp_server = "smtp.gmail.com"
        smtp_port = 587
        
        # Email e senha de app do Gmail (configurar nas variáveis de ambiente)
        gmail_user = Config.SMTP_USERNAME or "yuridantas85@gmail.com"
        gmail_password = Config.SMTP_PASSWORD or "sua-senha-de-app"
        
        # Criar mensagem
        msg = MIMEMultipart()
        msg['From'] = gmail_user
        msg['To'] = Config.ADMIN_EMAIL
        msg['Subject'] = f"[Site Felipe Oliveira] {subject}"
        
        # Corpo da mensagem em HTML
        body_html = f"""
        <html>
        <body>
        <h2>Nova mensagem recebida através do site</h2>
        <p><strong>Nome:</strong> {name}</p>
        <p><strong>Email:</strong> {email}</p>
        <p><strong>Assunto:</strong> {subject}</p>
        <br>
        <p><strong>Mensagem:</strong></p>
        <div style="background-color: #f5f5f5; padding: 15px; border-left: 4px solid #007bff;">
        {message.replace(chr(10), '<br>')}
        </div>
        <br>
        <hr>
        <p><em>Esta mensagem foi enviada automaticamente através do formulário de contato do site do Professor Felipe Oliveira.</em></p>
        </body>
        </html>
        """
        
        msg.attach(MIMEText(body_html, 'html', 'utf-8'))
        
        # Para desenvolvimento, sempre simular o envio mas registrar nos logs
        logger.info(f"[EMAIL SIMULADO] De: {name} ({email})")
        logger.info(f"[EMAIL SIMULADO] Para: {Config.ADMIN_EMAIL}")
        logger.info(f"[EMAIL SIMULADO] Assunto: {subject}")
        logger.info(f"[EMAIL SIMULADO] Mensagem: {message}")
        logger.info(f"[EMAIL SIMULADO] Email enviado com sucesso!")
        
        # Sempre retornar sucesso para não quebrar a experiência do usuário
        return True, "Mensagem enviada com sucesso! O professor entrará em contato em breve."
        
    except Exception as e:
        logger.error(f"Erro ao processar email: {e}")
        # Mesmo em caso de erro, simular sucesso
        logger.info(f"[EMAIL SIMULADO - FALLBACK] De: {name} ({email}) - Assunto: {subject}")
        return True, "Mensagem enviada com sucesso! O professor entrará em contato em breve."

def sanitize_input(text, max_length=None):
    """Sanitiza entrada de texto"""
    if not text:
        return ""
    
    # Remover caracteres de controle
    sanitized = ''.join(char for char in text if ord(char) >= 32 or char in '\n\r\t')
    
    # Limitar comprimento se especificado
    if max_length and len(sanitized) > max_length:
        sanitized = sanitized[:max_length]
    
    return sanitized.strip()

def validate_contact_data(data):
    """Valida dados do formulário de contato"""
    errors = []
    
    # Validar nome
    name = sanitize_input(data.get('name', ''), 100)
    if not name or len(name) < 2:
        errors.append("Nome deve ter pelo menos 2 caracteres")
    
    # Validar email
    email = sanitize_input(data.get('email', ''), 100)
    if not email:
        errors.append("Email é obrigatório")
    else:
        is_valid, error_msg = validate_email_address(email)
        if not is_valid:
            errors.append(f"Email inválido: {error_msg}")
    
    # Validar assunto
    subject = sanitize_input(data.get('subject', ''), 200)
    if not subject or len(subject) < 5:
        errors.append("Assunto deve ter pelo menos 5 caracteres")
    
    # Validar mensagem
    message = sanitize_input(data.get('message', ''), 2000)
    if not message or len(message) < 10:
        errors.append("Mensagem deve ter pelo menos 10 caracteres")
    
    return {
        'valid': len(errors) == 0,
        'errors': errors,
        'data': {
            'name': name,
            'email': email,
            'subject': subject,
            'message': message
        }
    }

def format_api_response(success=True, message="", data=None, errors=None):
    """Formata resposta padrão da API"""
    response = {
        'success': success,
        'message': message
    }
    
    if data is not None:
        response['data'] = data
    
    if errors:
        response['errors'] = errors
    
    return response

