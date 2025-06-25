// Script principal para o site Felipe Oliveira

document.addEventListener('DOMContentLoaded', function() {
    // Loader de página
    const loader = document.querySelector('.loader-container');
    if (loader) {
        window.addEventListener('load', function() {
            setTimeout(function() {
                loader.classList.add('loader-hidden');
            }, 500);
        });
    }
    
    // Menu Mobile Toggle
    const menuToggle = document.querySelector('.menu-toggle');
    const navList = document.querySelector('.nav-list');
    
    if (menuToggle && navList) {
        menuToggle.addEventListener('click', function() {
            this.classList.toggle('active');
            navList.classList.toggle('active');
        });
    }
    
    // Fechar menu ao clicar em um link
    const navLinks = document.querySelectorAll('.nav-list a');
    navLinks.forEach(link => {
        link.addEventListener('click', function() {
            menuToggle.classList.remove('active');
            navList.classList.remove('active');
        });
    });
    
    // Formulário de contato
    const contactForm = document.getElementById('contact-form');
    const quickContactForm = document.getElementById('quick-contact-form');
    
    const setupContactForm = function(form) {
        if (form) {
            form.addEventListener('submit', function(e) {
                e.preventDefault();
                
                // Validação do formulário
                let isValid = true;
                const name = this.querySelector('#name');
                const email = this.querySelector('#email');
                const subject = this.querySelector('#subject') || { value: 'Contato via site' };
                const message = this.querySelector('#message');
                
                // Validar nome
                if (name.value.trim() === '') {
                    showError(name, 'Por favor, informe seu nome');
                    isValid = false;
                } else {
                    removeError(name);
                }
                
                // Validar email
                if (email.value.trim() === '') {
                    showError(email, 'Por favor, informe seu email');
                    isValid = false;
                } else if (!isValidEmail(email.value)) {
                    showError(email, 'Por favor, informe um email válido');
                    isValid = false;
                } else {
                    removeError(email);
                }
                
                // Validar mensagem
                if (message.value.trim() === '') {
                    showError(message, 'Por favor, escreva sua mensagem');
                    isValid = false;
                } else {
                    removeError(message);
                }
                
                if (!isValid) {
                    return;
                }
                
                // Alterar estado do botão
                const submitButton = this.querySelector('button[type="submit"]');
                const originalText = submitButton.innerHTML;
                
                submitButton.disabled = true;
                submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>Enviando...</span>';
                
                // Enviar para a API
                API.sendContactMessage(
                    name.value.trim(),
                    email.value.trim(),
                    subject.value.trim(),
                    message.value.trim()
                )
                .then(data => {
                    if (data.success) {
                        showSuccessMessage('Mensagem enviada com sucesso! O professor entrará em contato em breve.', form);
                        form.reset();
                    } else {
                        showErrorMessage('Ocorreu um erro ao enviar a mensagem. Por favor, tente novamente.', form);
                    }
                })
                .catch(error => {
                    console.error('Erro ao enviar formulário:', error);
                    showErrorMessage('Ocorreu um erro ao enviar a mensagem. Por favor, tente novamente.', form);
                })
                .finally(() => {
                    submitButton.disabled = false;
                    submitButton.innerHTML = originalText;
                });
            });
        }
    };
    
    // Configurar ambos os formulários
    setupContactForm(contactForm);
    setupContactForm(quickContactForm);
    
    // Funções auxiliares para validação de formulário
    function showError(input, message) {
        const formGroup = input.parentElement;
        const errorMessage = formGroup.querySelector('.error-message') || document.createElement('div');
        
        errorMessage.className = 'error-message';
        errorMessage.textContent = message;
        
        if (!formGroup.querySelector('.error-message')) {
            formGroup.appendChild(errorMessage);
        }
        
        input.classList.add('input-error');
    }
    
    function removeError(input) {
        const formGroup = input.parentElement;
        const errorMessage = formGroup.querySelector('.error-message');
        
        if (errorMessage) {
            formGroup.removeChild(errorMessage);
        }
        
        input.classList.remove('input-error');
    }
    
    function isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
    
    function showSuccessMessage(message, form) {
        const successMessage = document.createElement('div');
        successMessage.className = 'success-message';
        successMessage.textContent = message;
        
        form.parentElement.insertBefore(successMessage, form.nextSibling);
        
        setTimeout(() => {
            successMessage.remove();
        }, 5000);
    }
    
    function showErrorMessage(message, form) {
        const errorMessage = document.createElement('div');
        errorMessage.className = 'error-message form-error';
        errorMessage.textContent = message;
        
        form.parentElement.insertBefore(errorMessage, form.nextSibling);
        
        setTimeout(() => {
            errorMessage.remove();
        }, 5000);
    }
    
    // Animação de scroll suave para links internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId !== '#') {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    window.scrollTo({
                        top: targetElement.offsetTop - 80,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
    
    // Adicionar classe ativa ao link do menu correspondente à página atual
    const currentLocation = window.location.pathname;
    const menuItems = document.querySelectorAll('.nav-list a');
    const menuLength = menuItems.length;
    
    for (let i = 0; i < menuLength; i++) {
        if (menuItems[i].getAttribute('href') === currentLocation || 
            menuItems[i].getAttribute('href') === currentLocation.split('/').pop()) {
            menuItems[i].classList.add('active');
        } else if (currentLocation === '/' && menuItems[i].getAttribute('href') === 'index.html') {
            menuItems[i].classList.add('active');
        }
    }
    
    // Botão voltar ao topo
    const backToTopButton = document.getElementById('back-to-top');
    
    if (backToTopButton) {
        backToTopButton.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
        
        window.addEventListener('scroll', function() {
            if (window.pageYOffset > 300) {
                backToTopButton.classList.add('visible');
            } else {
                backToTopButton.classList.remove('visible');
            }
        });
    }
    
    // Animações de entrada
    const fadeElements = document.querySelectorAll('.fade-in');
    const sectionElements = document.querySelectorAll('.section-animated');
    
    function checkFade() {
        const triggerBottom = window.innerHeight * 0.8;
        
        fadeElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            
            if (elementTop < triggerBottom) {
                element.classList.add('visible');
            }
        });
        
        sectionElements.forEach(element => {
            const elementTop = element.getBoundingClientRect().top;
            
            if (elementTop < triggerBottom) {
                element.classList.add('visible');
            }
        });
    }
    
    window.addEventListener('scroll', checkFade);
    window.addEventListener('resize', checkFade);
    
    // Iniciar verificação de animações
    checkFade();
    
    // Animação de títulos
    const titleElements = document.querySelectorAll('.title-animation');
    
    titleElements.forEach(title => {
        const text = title.textContent;
        title.textContent = '';
        
        for (let i = 0; i < text.length; i++) {
            const span = document.createElement('span');
            span.textContent = text[i];
            span.style.animationDelay = `${i * 0.05}s`;
            title.appendChild(span);
        }
    });
    
    // Accordion para infraestrutura
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    if (accordionHeaders.length > 0) {
        accordionHeaders.forEach(header => {
            header.addEventListener('click', function() {
                const content = this.nextElementSibling;
                const icon = this.querySelector('i');
                
                // Toggle active class
                content.classList.toggle('active');
                
                // Change icon
                if (content.classList.contains('active')) {
                    icon.classList.remove('fa-chevron-down');
                    icon.classList.add('fa-chevron-up');
                } else {
                    icon.classList.remove('fa-chevron-up');
                    icon.classList.add('fa-chevron-down');
                }
            });
        });
    }
    
    // Filtros para projetos, publicações e orientações
    const setupFilters = function(filterBtns, items) {
        if (filterBtns.length > 0 && items.length > 0) {
            filterBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    const filter = this.getAttribute('data-filter');
                    
                    // Remover classe ativa de todos os botões
                    filterBtns.forEach(b => b.classList.remove('active'));
                    
                    // Adicionar classe ativa ao botão clicado
                    this.classList.add('active');
                    
                    // Filtrar itens
                    items.forEach(item => {
                        if (filter === 'all' || item.getAttribute('data-category') === filter) {
                            item.style.display = 'block';
                        } else {
                            item.style.display = 'none';
                        }
                    });
                });
            });
        }
    };
    
    // Configurar filtros para projetos
    const projectFilterBtns = document.querySelectorAll('.project-filters .research-nav-item');
    const projectItems = document.querySelectorAll('.project-item');
    setupFilters(projectFilterBtns, projectItems);
    
    // Configurar filtros para publicações
    const publicationFilterBtns = document.querySelectorAll('.publication-filters .research-nav-item');
    const publicationItems = document.querySelectorAll('.publication-item');
    setupFilters(publicationFilterBtns, publicationItems);
    
    // Configurar filtros para orientações
    const orientationFilterBtns = document.querySelectorAll('.orientation-filters .research-nav-item');
    const orientationItems = document.querySelectorAll('.orientation-item');
    setupFilters(orientationFilterBtns, orientationItems);
    
    // Funcionalidades de acessibilidade
    const accessibilityToggle = document.querySelector('.accessibility-toggle');
    const accessibilityWidget = document.querySelector('.accessibility-widget');
    const fontIncreaseBtn = document.querySelector('.font-size-increase');
    const fontDecreaseBtn = document.querySelector('.font-size-decrease');
    const contrastToggleBtn = document.querySelector('.contrast-toggle');
    const resetAccessibilityBtn = document.querySelector('.reset-accessibility');
    
    // Variáveis para controle de acessibilidade
    let currentFontSize = 0; // 0 = normal, 1 = large, 2 = larger, 3 = largest, -1 = small, -2 = smaller
    let highContrastMode = false;
    
    // Função para salvar configurações de acessibilidade
    function saveAccessibilitySettings() {
        localStorage.setItem('accessibilityFontSize', currentFontSize);
        localStorage.setItem('accessibilityHighContrast', highContrastMode);
    }
    
    // Função para carregar configurações de acessibilidade
    function loadAccessibilitySettings() {
        const savedFontSize = localStorage.getItem('accessibilityFontSize');
        const savedHighContrast = localStorage.getItem('accessibilityHighContrast');
        
        if (savedFontSize !== null) {
            currentFontSize = parseInt(savedFontSize);
            updateFontSize();
        }
        
        if (savedHighContrast === 'true') {
            highContrastMode = true;
            document.body.classList.add('high-contrast');
        }
    }
    
    // Função para atualizar o tamanho da fonte
    function updateFontSize() {
        // Remover todas as classes de tamanho de fonte
        document.body.classList.remove('font-size-large', 'font-size-larger', 'font-size-largest', 'font-size-small', 'font-size-smaller');
        
        // Adicionar a classe apropriada
        if (currentFontSize === 1) {
            document.body.classList.add('font-size-large');
        } else if (currentFontSize === 2) {
            document.body.classList.add('font-size-larger');
        } else if (currentFontSize === 3) {
            document.body.classList.add('font-size-largest');
        } else if (currentFontSize === -1) {
            document.body.classList.add('font-size-small');
        } else if (currentFontSize === -2) {
            document.body.classList.add('font-size-smaller');
        }
    }
    
    // Configurar eventos de acessibilidade
    if (accessibilityToggle) {
        accessibilityToggle.addEventListener('click', function() {
            accessibilityWidget.classList.toggle('active');
        });
        
        // Fechar o widget ao clicar fora dele
        document.addEventListener('click', function(e) {
            if (!accessibilityWidget.contains(e.target) && e.target !== accessibilityToggle) {
                accessibilityWidget.classList.remove('active');
            }
        });
    }
    
    if (fontIncreaseBtn) {
        fontIncreaseBtn.addEventListener('click', function() {
            if (currentFontSize < 3) {
                currentFontSize++;
                updateFontSize();
                saveAccessibilitySettings();
            }
        });
    }
    
    if (fontDecreaseBtn) {
        fontDecreaseBtn.addEventListener('click', function() {
            if (currentFontSize > -2) {
                currentFontSize--;
                updateFontSize();
                saveAccessibilitySettings();
            }
        });
    }
    
    if (contrastToggleBtn) {
        contrastToggleBtn.addEventListener('click', function() {
            highContrastMode = !highContrastMode;
            document.body.classList.toggle('high-contrast');
            saveAccessibilitySettings();
        });
    }
    
    if (resetAccessibilityBtn) {
        resetAccessibilityBtn.addEventListener('click', function() {
            // Resetar tamanho da fonte
            currentFontSize = 0;
            document.body.classList.remove('font-size-large', 'font-size-larger', 'font-size-largest', 'font-size-small', 'font-size-smaller');
            
            // Resetar contraste
            highContrastMode = false;
            document.body.classList.remove('high-contrast');
            
            // Salvar configurações
            saveAccessibilitySettings();
        });
    }
    
    // Carregar configurações de acessibilidade ao iniciar
    loadAccessibilitySettings();
    
    // Carregar conteúdo dinâmico da API
    function loadResearchContent() {
        const researchContainer = document.querySelector('.research-content');
        
        if (researchContainer) {
            API.getResearchContent()
                .then(data => {
                    if (data.success && data.data && data.data.length > 0) {
                        // Processar e exibir o conteúdo
                        const items = data.data;
                        
                        // Separar por categoria
                        const pesquisaItems = items.filter(item => item.category === 'pesquisa');
                        const publicacaoItems = items.filter(item => item.category === 'publicacao');
                        const orientacaoItems = items.filter(item => item.category === 'orientacao');
                        
                        // Atualizar contadores
                        updateCategoryCount('pesquisa', pesquisaItems.length);
                        updateCategoryCount('publicacao', publicacaoItems.length);
                        updateCategoryCount('orientacao', orientacaoItems.length);
                        
                        // Renderizar itens
                        renderResearchItems('pesquisa', pesquisaItems);
                        renderResearchItems('publicacao', publicacaoItems);
                        renderResearchItems('orientacao', orientacaoItems);
                    }
                })
                .catch(error => {
                    console.error('Erro ao carregar conteúdo de pesquisa:', error);
                });
        }
    }
    
    function updateCategoryCount(category, count) {
        const countElement = document.querySelector(`.${category}-count`);
        if (countElement) {
            countElement.textContent = count;
        }
    }
    
    function renderResearchItems(category, items) {
        const container = document.querySelector(`.${category}-container`);
        
        if (container && items.length > 0) {
            // Limpar container
            container.innerHTML = '';
            
            // Adicionar itens
            items.forEach(item => {
                const itemElement = document.createElement('div');
                itemElement.className = `${category}-item research-item fade-in`;
                itemElement.setAttribute('data-category', category);
                
                itemElement.innerHTML = `
                    <div class="research-item-header">
                        <h3>${item.title}</h3>
                    </div>
                    <div class="research-item-body">
                        <p>${item.content}</p>
                    </div>
                `;
                
                container.appendChild(itemElement);
            });
            
            // Iniciar animações
            checkFade();
        }
    }
    
    // Carregar conteúdo de página
    function loadPageContent() {
        // Obter o nome da página atual
        const pageName = window.location.pathname.split('/').pop().replace('.html', '') || 'index';
        
        // Mapear seções por página
        const pageSections = {
            'sobre': ['bio', 'education'],
            'laboratorio': ['description', 'infrastructure']
        };
        
        // Verificar se a página atual tem seções para carregar
        if (pageSections[pageName]) {
            pageSections[pageName].forEach(section => {
                API.getPageContent(pageName, section)
                    .then(data => {
                        if (data.success && data.data) {
                            const content = data.data;
                            updatePageSection(pageName, section, content);
                        }
                    })
                    .catch(error => {
                        console.error(`Erro ao carregar conteúdo da seção ${section}:`, error);
                    });
            });
        }
    }
    
    function updatePageSection(page, section, content) {
        const sectionElement = document.querySelector(`.${page}-${section}`);
        
        if (sectionElement) {
            // Atualizar título se existir
            const titleElement = sectionElement.querySelector('h2, h3');
            if (titleElement && content.title) {
                titleElement.textContent = content.title;
            }
            
            // Atualizar conteúdo
            const contentElement = sectionElement.querySelector('p, .content');
            if (contentElement) {
                contentElement.innerHTML = content.content.replace(/\n/g, '<br>');
            }
        }
    }
    
    // Rastreamento de visitas
    function trackPageVisit() {
        // Obter o nome da página atual
        const pageName = window.location.pathname.split('/').pop() || 'index.html';
        
        // Enviar para a API
        API.trackVisit(pageName)
            .then(data => {
                console.log('Visita registrada:', data);
            })
            .catch(error => {
                console.error('Erro ao registrar visita:', error);
            });
    }
    
    // Carregar conteúdo dinâmico
    loadResearchContent();
    loadPageContent();
    
    // Registrar visita à página
    trackPageVisit();
});

