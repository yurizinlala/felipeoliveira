// API para comunicação com o backend

class API {
    static BASE_URL = 'https://5000-iwno5gixrjbn7pc5px65t-b8573bc7.manusvm.computer/api';
    
    // Método para enviar mensagem de contato
    static async sendContactMessage(name, email, subject, message) {
        try {
            const response = await fetch(`${this.BASE_URL}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    name,
                    email,
                    subject,
                    message
                })
            });
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao enviar mensagem de contato:', error);
            return { success: false, message: 'Erro ao enviar mensagem. Por favor, tente novamente.' };
        }
    }
    
    // Método para rastrear visita
    static async trackVisit(page) {
        try {
            const response = await fetch(`${this.BASE_URL}/track-visit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    page,
                    referrer: document.referrer || 'direct',
                    device_type: this.getDeviceType(),
                    browser: this.getBrowserInfo()
                })
            });
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao rastrear visita:', error);
            return { success: false };
        }
    }
    
    // Método para obter estatísticas de visitas (para o painel admin)
    static async getVisitStats() {
        try {
            const response = await fetch(`${this.BASE_URL}/visits`);
            return await response.json();
        } catch (error) {
            console.error('Erro ao obter estatísticas de visitas:', error);
            return { success: false, data: [] };
        }
    }
    
    // Método para obter mensagens de contato (para o painel admin)
    static async getContactMessages() {
        try {
            const response = await fetch(`${this.BASE_URL}/messages`, {
                credentials: 'include'
            });
            return await response.json();
        } catch (error) {
            console.error('Erro ao obter mensagens de contato:', error);
            return { success: false, data: [] };
        }
    }
    
    // Método para obter estatísticas de mensagens (público)
    static async getMessageStats() {
        try {
            const response = await fetch(`${this.BASE_URL}/messages/stats`);
            return await response.json();
        } catch (error) {
            console.error('Erro ao obter estatísticas de mensagens:', error);
            return { success: false, data: { total_messages: 0, recent_messages: 0, recent_list: [] } };
        }
    }
    
    // Método para fazer login no painel admin
    static async login(username, password) {
        try {
            const response = await fetch(`${this.BASE_URL}/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username,
                    password
                }),
                credentials: 'include'
            });
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            return { success: false, message: 'Erro ao fazer login. Por favor, tente novamente.' };
        }
    }
    
    // Método para verificar autenticação
    static async checkAuth() {
        try {
            const response = await fetch(`${this.BASE_URL}/admin/check-auth`, {
                credentials: 'include'
            });
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao verificar autenticação:', error);
            return { success: false, authenticated: false };
        }
    }
    
    // Método para fazer logout
    static async logout() {
        try {
            const response = await fetch(`${this.BASE_URL}/admin/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            return { success: false };
        }
    }
    
    // Método para alterar senha
    static async changePassword(currentPassword, newPassword) {
        try {
            const response = await fetch(`${this.BASE_URL}/admin/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword
                }),
                credentials: 'include'
            });
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao alterar senha:', error);
            return { success: false, message: 'Erro ao alterar senha. Por favor, tente novamente.' };
        }
    }
    
    // Método para obter estatísticas de mensagens (público)
    static async getMessageStats() {
        try {
            const response = await fetch(`${this.BASE_URL}/messages/stats`);
            return await response.json();
        } catch (error) {
            console.error('Erro ao obter estatísticas de mensagens:', error);
            return { success: false, message: 'Erro ao carregar estatísticas de mensagens' };
        }
    }
    
    // Método para obter mensagens de contato (requer autenticação)
    static async getContactMessages() {
        try {
            const response = await fetch(`${this.BASE_URL}/messages`, {
                credentials: 'include'
            });
            return await response.json();
        } catch (error) {
            console.error('Erro ao obter mensagens:', error);
            return { success: false, message: 'Erro ao carregar mensagens' };
        }
    }
    
    // Método para obter o tipo de dispositivo
    static getDeviceType() {
        const userAgent = navigator.userAgent;
        if (/mobile/i.test(userAgent)) {
            return 'mobile';
        } else if (/tablet/i.test(userAgent)) {
            return 'tablet';
        } else {
            return 'desktop';
        }
    }
    
    // Método para obter informações do navegador
    static getBrowserInfo() {
        const userAgent = navigator.userAgent;
        let browser = 'unknown';
        
        if (/chrome/i.test(userAgent)) {
            browser = 'chrome';
        } else if (/firefox/i.test(userAgent)) {
            browser = 'firefox';
        } else if (/safari/i.test(userAgent)) {
            browser = 'safari';
        } else if (/edge/i.test(userAgent)) {
            browser = 'edge';
        } else if (/opera/i.test(userAgent) || /opr/i.test(userAgent)) {
            browser = 'opera';
        } else if (/msie/i.test(userAgent) || /trident/i.test(userAgent)) {
            browser = 'ie';
        }
        
        return browser;
    }
}

