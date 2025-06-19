// API para comunicação com o backend

// Configuração da API
const API_URL = 'http://localhost:5000/api';

// Classe para gerenciar a comunicação com a API
class API {
    // Método para enviar mensagem de contato
    static async sendContactMessage(name, email, subject, message) {
        try {
            const response = await fetch(`${API_URL}/contact`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ name, email, subject, message })
            });
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao enviar mensagem:', error);
            return { success: false, message: 'Erro ao conectar com o servidor' };
        }
    }
    
    // Método para rastrear visita na página
    static async trackPageVisit(page) {
        try {
            // Obter informações do navegador e dispositivo
            const userAgent = navigator.userAgent;
            const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
            const deviceType = isMobile ? 'mobile' : 'desktop';
            
            // Detectar navegador
            let browser = 'unknown';
            if (userAgent.indexOf('Chrome') > -1) browser = 'chrome';
            else if (userAgent.indexOf('Safari') > -1) browser = 'safari';
            else if (userAgent.indexOf('Firefox') > -1) browser = 'firefox';
            else if (userAgent.indexOf('MSIE') > -1 || userAgent.indexOf('Trident/') > -1) browser = 'ie';
            else if (userAgent.indexOf('Edge') > -1) browser = 'edge';
            
            // Obter referência
            const referrer = document.referrer || 'direct';
            
            // Enviar dados básicos para a API simples
            fetch(`${API_URL}/track-visit`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ page })
            }).catch(error => console.error('Erro ao rastrear visita (básico):', error));
            
            // Enviar dados detalhados para a API avançada
            return await fetch(`${API_URL}/stats/track-detailed`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    page, 
                    referrer,
                    device_type: deviceType,
                    browser
                })
            }).then(response => response.json());
        } catch (error) {
            console.error('Erro ao rastrear visita:', error);
            return { success: false };
        }
    }
    
    // Método para fazer login no painel administrativo
    static async login(username, password) {
        try {
            const response = await fetch(`${API_URL}/admin/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ username, password })
            });
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao fazer login:', error);
            return { success: false, message: 'Erro ao conectar com o servidor' };
        }
    }
    
    // Método para verificar autenticação
    static async checkAuth() {
        try {
            const response = await fetch(`${API_URL}/admin/check-auth`, {
                method: 'GET',
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
            const response = await fetch(`${API_URL}/admin/logout`, {
                method: 'POST',
                credentials: 'include'
            });
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao fazer logout:', error);
            return { success: false };
        }
    }
    
    // Método para obter estatísticas do dashboard
    static async getDashboardStats() {
        try {
            const response = await fetch(`${API_URL}/stats/summary`, {
                method: 'GET',
                credentials: 'include'
            });
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao obter estatísticas:', error);
            return { success: false };
        }
    }
    
    // Método para obter estatísticas detalhadas
    static async getDetailedStats(days = 30) {
        try {
            const response = await fetch(`${API_URL}/stats/daily?days=${days}`, {
                method: 'GET',
                credentials: 'include'
            });
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao obter estatísticas detalhadas:', error);
            return { success: false };
        }
    }
    
    // Método para obter mensagens de contato
    static async getContactMessages() {
        try {
            const response = await fetch(`${API_URL}/messages`, {
                method: 'GET',
                credentials: 'include'
            });
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao obter mensagens:', error);
            return { success: false };
        }
    }
    
    // Método para obter conteúdo de pesquisa
    static async getResearchContent(category = 'all') {
        try {
            const response = await fetch(`${API_URL}/content/research?category=${category}`, {
                method: 'GET'
            });
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao obter conteúdo de pesquisa:', error);
            return { success: false };
        }
    }
    
    // Método para adicionar conteúdo de pesquisa
    static async addResearchContent(title, content, category) {
        try {
            const response = await fetch(`${API_URL}/content/research`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ title, content, category })
            });
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao adicionar conteúdo:', error);
            return { success: false, message: 'Erro ao conectar com o servidor' };
        }
    }
    
    // Método para atualizar conteúdo de pesquisa
    static async updateResearchContent(id, title, content, category) {
        try {
            const response = await fetch(`${API_URL}/content/research/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ title, content, category })
            });
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao atualizar conteúdo:', error);
            return { success: false, message: 'Erro ao conectar com o servidor' };
        }
    }
    
    // Método para excluir conteúdo de pesquisa
    static async deleteResearchContent(id) {
        try {
            const response = await fetch(`${API_URL}/content/research/${id}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao excluir conteúdo:', error);
            return { success: false, message: 'Erro ao conectar com o servidor' };
        }
    }
    
    // Método para obter conteúdo de página
    static async getPageContent(page, section) {
        try {
            const response = await fetch(`${API_URL}/content/page/${page}/${section}`, {
                method: 'GET'
            });
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao obter conteúdo de página:', error);
            return { success: false };
        }
    }
    
    // Método para atualizar conteúdo de página
    static async updatePageContent(page, section, content, title = null) {
        try {
            const response = await fetch(`${API_URL}/content/page/${page}/${section}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({ content, title })
            });
            
            return await response.json();
        } catch (error) {
            console.error('Erro ao atualizar conteúdo de página:', error);
            return { success: false, message: 'Erro ao conectar com o servidor' };
        }
    }
}

// Exportar a classe API
window.API = API;

