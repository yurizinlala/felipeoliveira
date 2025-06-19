// Script para o Painel Administrativo

document.addEventListener('DOMContentLoaded', function() {
    // Elementos do DOM
    const loginContainer = document.getElementById('login-container');
    const adminPanel = document.getElementById('admin-panel');
    const loginForm = document.getElementById('login-form');
    const loginMessage = document.getElementById('login-message');
    const adminUsername = document.getElementById('admin-username');
    const logoutBtn = document.getElementById('logout-btn');
    const adminNavItems = document.querySelectorAll('.admin-nav-item');
    const adminSections = document.querySelectorAll('.admin-section');
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabPanes = document.querySelectorAll('.tab-pane');
    const changePasswordForm = document.getElementById('change-password-form');
    const passwordMessage = document.getElementById('password-message');
    
    // Variáveis de estado
    let currentUser = null;
    
    // Verificar autenticação
    function checkAuth() {
        API.checkAuth()
            .then(data => {
                if (data.success && data.authenticated) {
                    currentUser = data.user;
                    showAdminPanel();
                    loadDashboardData();
                } else {
                    showLoginForm();
                }
            })
            .catch(error => {
                console.error('Erro ao verificar autenticação:', error);
                showLoginForm();
            });
    }
    
    // Mostrar formulário de login
    function showLoginForm() {
        loginContainer.classList.remove('hidden');
        adminPanel.classList.add('hidden');
    }
    
    // Mostrar painel administrativo
    function showAdminPanel() {
        loginContainer.classList.add('hidden');
        adminPanel.classList.remove('hidden');
        adminUsername.textContent = currentUser.name;
    }
    
    // Processar login
    if (loginForm) {
        loginForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            
            if (!username || !password) {
                showMessage(loginMessage, 'Usuário e senha são obrigatórios', 'error');
                return;
            }
            
            API.login(username, password)
                .then(data => {
                    if (data.success) {
                        currentUser = data.user;
                        showAdminPanel();
                        loadDashboardData();
                    } else {
                        showMessage(loginMessage, data.message || 'Erro ao fazer login', 'error');
                    }
                })
                .catch(error => {
                    console.error('Erro ao fazer login:', error);
                    showMessage(loginMessage, 'Erro ao conectar com o servidor', 'error');
                });
        });
    }
    
    // Processar logout
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            API.logout()
                .then(data => {
                    if (data.success) {
                        currentUser = null;
                        showLoginForm();
                    }
                })
                .catch(error => {
                    console.error('Erro ao fazer logout:', error);
                });
        });
    }
    
    // Navegação entre seções
    adminNavItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            const targetSection = this.getAttribute('data-section');
            
            // Atualizar navegação
            adminNavItems.forEach(navItem => navItem.classList.remove('active'));
            this.classList.add('active');
            
            // Mostrar seção correspondente
            adminSections.forEach(section => {
                if (section.id === `${targetSection}-section`) {
                    section.classList.remove('hidden');
                    
                    // Carregar dados específicos da seção
                    if (targetSection === 'dashboard') {
                        loadDashboardData();
                    } else if (targetSection === 'messages') {
                        loadMessages();
                    } else if (targetSection === 'content') {
                        loadContent();
                    }
                } else {
                    section.classList.add('hidden');
                }
            });
        });
    });
    
    // Navegação entre abas
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Atualizar botões de abas
            tabBtns.forEach(tabBtn => tabBtn.classList.remove('active'));
            this.classList.add('active');
            
            // Mostrar conteúdo da aba
            tabPanes.forEach(pane => {
                if (pane.id === `${targetTab}-tab`) {
                    pane.classList.add('active');
                } else {
                    pane.classList.remove('active');
                }
            });
        });
    });
    
    // Alterar senha
    if (changePasswordForm) {
        changePasswordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            const currentPassword = document.getElementById('current-password').value;
            const newPassword = document.getElementById('new-password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            
            // Validação
            if (!currentPassword || !newPassword || !confirmPassword) {
                showMessage(passwordMessage, 'Todos os campos são obrigatórios', 'error');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                showMessage(passwordMessage, 'As senhas não coincidem', 'error');
                return;
            }
            
            if (newPassword.length < 8) {
                showMessage(passwordMessage, 'A nova senha deve ter pelo menos 8 caracteres', 'error');
                return;
            }
            
            fetch(`${API_URL}/admin/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    current_password: currentPassword,
                    new_password: newPassword
                }),
                credentials: 'include'
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    showMessage(passwordMessage, 'Senha alterada com sucesso', 'success');
                    changePasswordForm.reset();
                } else {
                    showMessage(passwordMessage, data.message || 'Erro ao alterar senha', 'error');
                }
            })
            .catch(error => {
                console.error('Erro ao alterar senha:', error);
                showMessage(passwordMessage, 'Erro ao conectar com o servidor', 'error');
            });
        });
    }
    
    // Carregar dados do dashboard
    function loadDashboardData() {
        API.getDashboardStats()
            .then(data => {
                if (data.success) {
                    const stats = data.data;
                    
                    // Atualizar estatísticas
                    document.getElementById('total-visits').textContent = stats.total_visits;
                    document.getElementById('total-messages').textContent = stats.total_messages;
                    document.getElementById('recent-messages').textContent = stats.recent_messages;
                    
                    // Atualizar tabela de páginas mais visitadas
                    const topPagesTable = document.getElementById('top-pages-table');
                    topPagesTable.innerHTML = '';
                    
                    stats.top_pages.forEach(page => {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${page.page}</td>
                            <td>${page.visits}</td>
                        `;
                        topPagesTable.appendChild(row);
                    });
                }
            })
            .catch(error => {
                console.error('Erro ao carregar dados do dashboard:', error);
            });
    }
    
    // Carregar mensagens
    function loadMessages() {
        API.getContactMessages()
            .then(data => {
                if (data.success) {
                    const messages = data.data;
                    const messagesTable = document.getElementById('messages-table');
                    messagesTable.innerHTML = '';
                    
                    if (messages.length === 0) {
                        messagesTable.innerHTML = '<tr><td colspan="5">Nenhuma mensagem encontrada</td></tr>';
                        return;
                    }
                    
                    messages.forEach(message => {
                        const date = new Date(message.created_at);
                        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
                        
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${message.name}</td>
                            <td>${message.email}</td>
                            <td>${message.subject}</td>
                            <td>${formattedDate}</td>
                            <td>
                                <button class="btn btn-sm btn-outline view-message-btn" data-id="${message.id}">
                                    <i class="fas fa-eye"></i>
                                </button>
                            </td>
                        `;
                        messagesTable.appendChild(row);
                        
                        // Adicionar evento para visualizar mensagem
                        const viewBtn = row.querySelector('.view-message-btn');
                        viewBtn.addEventListener('click', function() {
                            const messageId = this.getAttribute('data-id');
                            const message = messages.find(m => m.id == messageId);
                            
                            if (message) {
                                showMessageDetails(message);
                            }
                        });
                    });
                }
            })
            .catch(error => {
                console.error('Erro ao carregar mensagens:', error);
            });
    }
    
    // Mostrar detalhes da mensagem
    function showMessageDetails(message) {
        const messageDetails = document.getElementById('message-details');
        const date = new Date(message.created_at);
        const formattedDate = `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        
        document.getElementById('message-subject').textContent = message.subject;
        document.getElementById('message-name').textContent = message.name;
        document.getElementById('message-email').textContent = message.email;
        document.getElementById('message-date').textContent = formattedDate;
        document.getElementById('message-text').textContent = message.message;
        
        messageDetails.classList.remove('hidden');
        
        // Botão para fechar detalhes
        const closeBtn = messageDetails.querySelector('.close-details');
        closeBtn.addEventListener('click', function() {
            messageDetails.classList.add('hidden');
        });
    }
    
    // Carregar conteúdo editável
    function loadContent() {
        // Carregar conteúdo de áreas de pesquisa
        API.getResearchContent()
            .then(data => {
                if (data.success && data.data) {
                    const items = data.data;
                    const contentList = document.getElementById('research-content-list');
                    
                    if (contentList) {
                        contentList.innerHTML = '';
                        
                        items.forEach(item => {
                            const date = new Date(item.updated_at);
                            const formattedDate = `${date.toLocaleDateString()}`;
                            
                            const itemElement = document.createElement('div');
                            itemElement.className = 'content-item';
                            
                            itemElement.innerHTML = `
                                <div class="content-item-header">
                                    <h4>${item.title}</h4>
                                    <div class="content-item-actions">
                                        <button class="btn btn-sm btn-outline edit-btn" data-id="${item.id}"><i class="fas fa-edit"></i></button>
                                        <button class="btn btn-sm btn-outline delete-btn" data-id="${item.id}"><i class="fas fa-trash"></i></button>
                                    </div>
                                </div>
                                <div class="content-item-body">
                                    <p>${item.content}</p>
                                </div>
                                <div class="content-item-footer">
                                    <span class="content-category">${item.category}</span>
                                    <span class="content-date">Última atualização: ${formattedDate}</span>
                                </div>
                            `;
                            
                            contentList.appendChild(itemElement);
                            
                            // Adicionar eventos para editar e excluir
                            const editBtn = itemElement.querySelector('.edit-btn');
                            const deleteBtn = itemElement.querySelector('.delete-btn');
                            
                            editBtn.addEventListener('click', function() {
                                const itemId = this.getAttribute('data-id');
                                const item = items.find(i => i.id == itemId);
                                
                                if (item) {
                                    showContentModal('edit', item);
                                }
                            });
                            
                            deleteBtn.addEventListener('click', function() {
                                const itemId = this.getAttribute('data-id');
                                const item = items.find(i => i.id == itemId);
                                
                                if (item) {
                                    showConfirmModal(`Tem certeza que deseja excluir "${item.title}"?`, function() {
                                        deleteContent(item.id);
                                    });
                                }
                            });
                        });
                    }
                }
            })
            .catch(error => {
                console.error('Erro ao carregar conteúdo:', error);
            });
        
        // Carregar conteúdo de páginas
        loadPageContent('sobre', 'bio');
        loadPageContent('sobre', 'education');
        loadPageContent('laboratorio', 'description');
        loadPageContent('laboratorio', 'infrastructure');
    }
    
    // Carregar conteúdo de página
    function loadPageContent(page, section) {
        API.getPageContent(page, section)
            .then(data => {
                if (data.success && data.data) {
                    const content = data.data;
                    const textarea = document.getElementById(`${section}-content`);
                    
                    if (textarea) {
                        textarea.value = content.content;
                    }
                }
            })
            .catch(error => {
                console.error(`Erro ao carregar conteúdo de ${page}/${section}:`, error);
            });
    }
    
    // Mostrar modal de conteúdo
    function showContentModal(mode, item = null) {
        const modal = document.getElementById('content-modal');
        const modalTitle = document.getElementById('modal-title');
        const contentForm = document.getElementById('content-form');
        const contentTitle = document.getElementById('content-title');
        const contentCategory = document.getElementById('content-category');
        const contentText = document.getElementById('content-text');
        const contentId = document.getElementById('content-id');
        
        // Configurar modal
        if (mode === 'edit') {
            modalTitle.textContent = 'Editar Conteúdo';
            contentTitle.value = item.title;
            contentCategory.value = item.category;
            contentText.value = item.content;
            contentId.value = item.id;
        } else {
            modalTitle.textContent = 'Adicionar Conteúdo';
            contentForm.reset();
            contentId.value = '';
        }
        
        // Mostrar modal
        modal.classList.add('active');
        
        // Configurar botões
        const closeBtn = modal.querySelector('.close-modal');
        const cancelBtn = modal.querySelector('.cancel-btn');
        const saveBtn = modal.querySelector('.save-btn');
        
        // Fechar modal
        function closeModal() {
            modal.classList.remove('active');
        }
        
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        
        // Salvar conteúdo
        saveBtn.addEventListener('click', function() {
            // Validar formulário
            if (!contentTitle.value.trim() || !contentText.value.trim()) {
                alert('Título e conteúdo são obrigatórios');
                return;
            }
            
            const formData = {
                title: contentTitle.value.trim(),
                content: contentText.value.trim(),
                category: contentCategory.value
            };
            
            if (mode === 'edit') {
                // Atualizar conteúdo existente
                API.updateResearchContent(contentId.value, formData.title, formData.content, formData.category)
                    .then(data => {
                        if (data.success) {
                            closeModal();
                            loadContent();
                        } else {
                            alert(data.message || 'Erro ao atualizar conteúdo');
                        }
                    })
                    .catch(error => {
                        console.error('Erro ao atualizar conteúdo:', error);
                        alert('Erro ao conectar com o servidor');
                    });
            } else {
                // Adicionar novo conteúdo
                API.addResearchContent(formData.title, formData.content, formData.category)
                    .then(data => {
                        if (data.success) {
                            closeModal();
                            loadContent();
                        } else {
                            alert(data.message || 'Erro ao adicionar conteúdo');
                        }
                    })
                    .catch(error => {
                        console.error('Erro ao adicionar conteúdo:', error);
                        alert('Erro ao conectar com o servidor');
                    });
            }
        });
    }
    
    // Excluir conteúdo
    function deleteContent(id) {
        API.deleteResearchContent(id)
            .then(data => {
                if (data.success) {
                    loadContent();
                } else {
                    alert(data.message || 'Erro ao excluir conteúdo');
                }
            })
            .catch(error => {
                console.error('Erro ao excluir conteúdo:', error);
                alert('Erro ao conectar com o servidor');
            });
    }
    
    // Mostrar modal de confirmação
    function showConfirmModal(message, confirmCallback) {
        const modal = document.getElementById('confirm-modal');
        const confirmMessage = document.getElementById('confirm-message');
        
        confirmMessage.textContent = message;
        modal.classList.add('active');
        
        // Configurar botões
        const closeBtn = modal.querySelector('.close-modal');
        const cancelBtn = modal.querySelector('.cancel-btn');
        const confirmBtn = modal.querySelector('.confirm-btn');
        
        // Fechar modal
        function closeModal() {
            modal.classList.remove('active');
        }
        
        closeBtn.addEventListener('click', closeModal);
        cancelBtn.addEventListener('click', closeModal);
        
        // Confirmar ação
        confirmBtn.addEventListener('click', function() {
            confirmCallback();
            closeModal();
        });
    }
    
    // Configurar botão de adicionar conteúdo
    const addContentBtn = document.querySelector('.add-content-btn');
    if (addContentBtn) {
        addContentBtn.addEventListener('click', function() {
            showContentModal('add');
        });
    }
    
    // Configurar botões de salvar conteúdo de página
    const saveContentBtns = document.querySelectorAll('.save-content-btn');
    saveContentBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const tabPane = this.closest('.tab-pane');
            const tabId = tabPane.id.replace('-tab', '');
            
            if (tabId === 'sobre') {
                savePageContent('sobre', 'bio');
                savePageContent('sobre', 'education');
            } else if (tabId === 'laboratorio') {
                savePageContent('laboratorio', 'description');
                savePageContent('laboratorio', 'infrastructure');
            }
        });
    });
    
    // Salvar conteúdo de página
    function savePageContent(page, section) {
        const textarea = document.getElementById(`${section}-content`);
        
        if (textarea) {
            const content = textarea.value.trim();
            
            API.updatePageContent(page, section, content)
                .then(data => {
                    if (data.success) {
                        alert(`Conteúdo de ${page}/${section} atualizado com sucesso`);
                    } else {
                        alert(data.message || `Erro ao atualizar conteúdo de ${page}/${section}`);
                    }
                })
                .catch(error => {
                    console.error(`Erro ao atualizar conteúdo de ${page}/${section}:`, error);
                    alert('Erro ao conectar com o servidor');
                });
        }
    }
    
    // Função auxiliar para mostrar mensagens
    function showMessage(container, message, type) {
        container.textContent = message;
        container.className = `message-container ${type}`;
        
        setTimeout(() => {
            container.textContent = '';
            container.className = 'message-container';
        }, 5000);
    }
    
    // Inicializar
    checkAuth();
});

