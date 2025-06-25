// Script para o painel administrativo

document.addEventListener('DOMContentLoaded', function() {
    // Elementos principais
    const loginContainer = document.getElementById('login-container');
    const adminPanel = document.getElementById('admin-panel');
    const loginForm = document.getElementById('login-form');
    const logoutBtn = document.getElementById('logout-btn');
    const adminUsername = document.getElementById('admin-username');
    
    // Navegação do painel
    const navItems = document.querySelectorAll('.admin-nav-item');
    const sections = document.querySelectorAll('.admin-section');
    
    // Verificar autenticação ao carregar a página
    checkAuthentication();
    
    // Configurar eventos
    setupEventListeners();
    
    function checkAuthentication() {
        API.checkAuth()
            .then(data => {
                if (data.success && data.authenticated) {
                    showAdminPanel(data.user);
                } else {
                    showLoginForm();
                }
            })
            .catch(error => {
                console.error('Erro ao verificar autenticação:', error);
                showLoginForm();
            });
    }
    
    function showLoginForm() {
        loginContainer.classList.remove('hidden');
        adminPanel.classList.add('hidden');
    }
    
    function showAdminPanel(user) {
        loginContainer.classList.add('hidden');
        adminPanel.classList.remove('hidden');
        
        if (user && user.name) {
            adminUsername.textContent = user.name;
        }
        
        // Carregar dados do dashboard
        loadDashboardData();
    }
    
    function setupEventListeners() {
        // Login
        loginForm.addEventListener('submit', handleLogin);
        
        // Logout
        logoutBtn.addEventListener('click', handleLogout);
        
        // Navegação do painel
        navItems.forEach(item => {
            item.addEventListener('click', function(e) {
                e.preventDefault();
                const section = this.getAttribute('data-section');
                showSection(section);
                
                // Atualizar navegação ativa
                navItems.forEach(nav => nav.classList.remove('active'));
                this.classList.add('active');
            });
        });
        
        // Tabs de conteúdo
        const tabBtns = document.querySelectorAll('.tab-btn');
        tabBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                const tab = this.getAttribute('data-tab');
                showTab(tab);
                
                // Atualizar tab ativa
                tabBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
            });
        });
        
        // Botões de ação das mensagens
        document.addEventListener('click', function(e) {
            if (e.target.classList.contains('view-message-btn')) {
                const messageId = e.target.getAttribute('data-message-id');
                showMessageDetails(messageId);
            }
            
            if (e.target.classList.contains('close-details')) {
                hideMessageDetails();
            }
            
            if (e.target.classList.contains('change-password-btn')) {
                showChangePasswordModal();
            }
            
            if (e.target.classList.contains('close-modal')) {
                hideChangePasswordModal();
            }
        });
        
        // Formulário de alteração de senha
        const changePasswordForm = document.getElementById('change-password-form');
        if (changePasswordForm) {
            changePasswordForm.addEventListener('submit', handleChangePassword);
        }
    }
    
    function handleLogin(e) {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        const submitBtn = e.target.querySelector('button[type=\"submit\"]');
        const messageContainer = document.getElementById('login-message');
        
        // Alterar estado do botão
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class=\"fas fa-spinner fa-spin\"></i> <span>Entrando...</span>';
        
        API.login(username, password)
            .then(data => {
                if (data.success) {
                    showMessage(messageContainer, 'Login realizado com sucesso!', 'success');
                    setTimeout(() => {
                        showAdminPanel(data.user);
                    }, 1000);
                } else {
                    showMessage(messageContainer, data.message || 'Erro ao fazer login', 'error');
                }
            })
            .catch(error => {
                console.error('Erro no login:', error);
                showMessage(messageContainer, 'Erro ao fazer login. Tente novamente.', 'error');
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            });
    }
    
    function handleLogout() {
        API.logout()
            .then(() => {
                showLoginForm();
                // Limpar formulário
                loginForm.reset();
                document.getElementById('login-message').innerHTML = '';
            })
            .catch(error => {
                console.error('Erro no logout:', error);
                // Mesmo com erro, mostrar tela de login
                showLoginForm();
            });
    }
    
    function showSection(sectionName) {
        // Esconder todas as seções
        sections.forEach(section => section.classList.add('hidden'));
        
        // Mostrar seção selecionada
        const targetSection = document.getElementById(`${sectionName}-section`);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            
            // Carregar dados específicos da seção
            if (sectionName === 'dashboard') {
                loadDashboardData();
            } else if (sectionName === 'messages') {
                loadMessages();
            }
        }
    }
    
    function showTab(tabName) {
        // Esconder todas as tabs
        const tabPanes = document.querySelectorAll('.tab-pane');
        tabPanes.forEach(pane => pane.classList.remove('active'));
        
        // Mostrar tab selecionada
        const targetTab = document.getElementById(`${tabName}-tab`);
        if (targetTab) {
            targetTab.classList.add('active');
        }
    }
    
    function loadDashboardData() {
        // Carregar estatísticas de visitas
        API.getVisitStats()
            .then(data => {
                if (data.success && data.data) {
                    updateDashboardStats(data.data);
                }
            })
            .catch(error => {
                console.error('Erro ao carregar estatísticas de visitas:', error);
            });
        
        // Carregar mensagens para estatísticas
        API.getMessageStats()
            .then(data => {
                if (data.success && data.data) {
                    updateMessageStats(data.data);
                }
            })
            .catch(error => {
                console.error('Erro ao carregar estatísticas de mensagens:', error);
            });
    }
    
    function updateDashboardStats(visitData) {
        // Calcular total de visitas
        const totalVisits = visitData.reduce((sum, page) => sum + page.visit_count, 0);
        document.getElementById('total-visits').textContent = totalVisits.toLocaleString();
        
        // Atualizar tabela de páginas mais visitadas
        const topPagesTable = document.getElementById('top-pages-table');
        topPagesTable.innerHTML = '';
        
        // Ordenar por número de visitas e pegar top 5
        const topPages = visitData
            .sort((a, b) => b.visit_count - a.visit_count)
            .slice(0, 5);
        
        topPages.forEach(page => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${formatPageName(page.page)}</td>
                <td>${page.visit_count}</td>
            `;
            topPagesTable.appendChild(row);
        });
    }
    
    function updateMessageStats(messageData) {
        // Total de mensagens
        document.getElementById('total-messages').textContent = messageData.total_messages || 0;
        
        // Mensagens recentes (últimos 7 dias)
        document.getElementById('recent-messages').textContent = messageData.recent_messages || 0;
    }
    
    function loadMessages() {
        // Usar estatísticas de mensagens para evitar problemas de autenticação
        API.getMessageStats()
            .then(data => {
                if (data.success && data.data) {
                    displayMessagesSummary(data.data);
                }
            })
            .catch(error => {
                console.error('Erro ao carregar mensagens:', error);
                const messagesTable = document.getElementById('messages-table');
                messagesTable.innerHTML = '<tr><td colspan=\"5\">Erro ao carregar mensagens</td></tr>';
            });
    }
    
    function displayMessagesSummary(messageData) {
        const messagesTable = document.getElementById('messages-table');
        messagesTable.innerHTML = '';
        
        if (!messageData.recent_list || messageData.recent_list.length === 0) {
            messagesTable.innerHTML = '<tr><td colspan=\"5\">Nenhuma mensagem encontrada</td></tr>';
            return;
        }
        
        messageData.recent_list.forEach(message => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${message.name}</td>
                <td>-</td>
                <td>${message.subject}</td>
                <td>${formatDate(message.created_at)}</td>
                <td>
                    <span class="text-muted">Resumo</span>
                </td>
            `;
            messagesTable.appendChild(row);
        });
    }
    
    function displayMessages(messages) {
        const messagesTable = document.getElementById('messages-table');
        messagesTable.innerHTML = '';
        
        if (messages.length === 0) {
            messagesTable.innerHTML = '<tr><td colspan=\"5\">Nenhuma mensagem encontrada</td></tr>';
            return;
        }
        
        messages.forEach(message => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${message.name}</td>
                <td>${message.email}</td>
                <td>${message.subject}</td>
                <td>${formatDate(message.created_at)}</td>
                <td>
                    <button class=\"btn btn-sm btn-primary view-message-btn\" data-message-id=\"${message.id}\">
                        <i class=\"fas fa-eye\"></i> Ver
                    </button>
                </td>
            `;
            messagesTable.appendChild(row);
        });
        
        // Armazenar mensagens para acesso posterior
        window.currentMessages = messages;
    }
    
    function showMessageDetails(messageId) {
        const message = window.currentMessages.find(m => m.id == messageId);
        
        if (message) {
            document.getElementById('message-subject').textContent = message.subject;
            document.getElementById('message-name').textContent = message.name;
            document.getElementById('message-email').textContent = message.email;
            document.getElementById('message-date').textContent = formatDate(message.created_at);
            document.getElementById('message-text').textContent = message.message;
            
            document.getElementById('message-details').classList.remove('hidden');
        }
    }
    
    function hideMessageDetails() {
        document.getElementById('message-details').classList.add('hidden');
    }
    
    function formatPageName(pageName) {
        const pageNames = {
            'index.html': 'Página Inicial',
            'sobre.html': 'Sobre',
            'areas-pesquisa.html': 'Áreas de Pesquisa',
            'laboratorio.html': 'Laboratório LUMEN',
            'contato.html': 'Contato',
            'projetos.html': 'Projetos',
            'publicacoes.html': 'Publicações',
            'orientacoes.html': 'Orientações'
        };
        
        return pageNames[pageName] || pageName;
    }
    
    function formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR') + ' ' + date.toLocaleTimeString('pt-BR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    }
    
    function showMessage(container, message, type) {
        container.innerHTML = `<div class=\"message ${type}\">${message}</div>`;
        
        setTimeout(() => {
            container.innerHTML = '';
        }, 5000);
    }
    
    function showChangePasswordModal() {
        const modal = document.getElementById('change-password-modal');
        if (modal) {
            modal.classList.remove('hidden');
            // Limpar formulário
            document.getElementById('change-password-form').reset();
            document.getElementById('password-message').innerHTML = '';
        }
    }
    
    function hideChangePasswordModal() {
        const modal = document.getElementById('change-password-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
    
    function handleChangePassword(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        const submitBtn = e.target.querySelector('button[type=\"submit\"]');
        const messageContainer = document.getElementById('password-message');
        
        // Validações
        if (newPassword !== confirmPassword) {
            showMessage(messageContainer, 'As senhas não coincidem', 'error');
            return;
        }
        
        if (newPassword.length < 6) {
            showMessage(messageContainer, 'A nova senha deve ter pelo menos 6 caracteres', 'error');
            return;
        }
        
        // Alterar estado do botão
        const originalText = submitBtn.innerHTML;
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class=\"fas fa-spinner fa-spin\"></i> Alterando...';
        
        API.changePassword(currentPassword, newPassword)
            .then(data => {
                if (data.success) {
                    showMessage(messageContainer, 'Senha alterada com sucesso!', 'success');
                    setTimeout(() => {
                        hideChangePasswordModal();
                    }, 2000);
                } else {
                    showMessage(messageContainer, data.message || 'Erro ao alterar senha', 'error');
                }
            })
            .catch(error => {
                console.error('Erro ao alterar senha:', error);
                showMessage(messageContainer, 'Erro ao alterar senha. Tente novamente.', 'error');
            })
            .finally(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            });
    }
});

