/* ============================================
   FIELDS SELECTOR COMPONENT
   Componente para seleção de campos visíveis
   ============================================ */

class FieldsSelectorComponent {
    constructor(options = {}) {
        this.dropdownId = options.dropdownId || 'fieldsDropdown';
        this.buttonId = options.buttonId || 'fieldsDropdownBtn';
        this.resultsContainerId = options.resultsContainerId || 'results';
        
        // Definição completa de todos os campos possíveis (baseado no Velocity)
        this.allFields = [
            // Identificação do Processo
            { key: 'processo', label: 'Número do Processo', group: 'processo' },
            { key: 'grupo-processo', label: 'Grupo Processo', group: 'processo' },
            { key: 'tipo-processo', label: 'Tipo Processo', group: 'processo' },
            { key: 'subtipo-processo', label: 'Subtipo Processo', group: 'processo' },
            
            // Documento
            { key: 'tipo-documento', label: 'Tipo Documento', group: 'documento' },
            { key: 'titulo', label: 'Título', group: 'documento' },
            { key: 'numero-doc-principal', label: 'Nr Doc Principal', group: 'documento' },
            { key: 'assuntos-objetos', label: 'Assuntos/Objetos', group: 'documento' },
            
            // Datas
            { key: 'data-anexacao', label: 'Data Anexação', group: 'datas' },
            { key: 'data-protocolo', label: 'Data Protocolo', group: 'datas' },
            { key: 'data-juntada', label: 'Data Juntada', group: 'datas' },
            
            // Unidade e Equipe
            { key: 'unidade-origem', label: 'Unidade Origem', group: 'unidade' },
            { key: 'equipe-origem', label: 'Equipe Origem', group: 'unidade' },
            { key: 'unidade-atual', label: 'Unidade Atual', group: 'unidade' },
            { key: 'equipe-atual', label: 'Equipe Atual', group: 'unidade' },
            
            // Contribuinte
            { key: 'ni-contribuinte', label: 'NI Contribuinte', group: 'partes' },
            { key: 'nome-contribuinte', label: 'Nome Contribuinte', group: 'partes' },
            
            // Responsável
            { key: 'cpf-responsavel', label: 'CPF Responsável', group: 'partes' },
            { key: 'usuario-juntada', label: 'Usuário Juntada', group: 'partes' },
            
            // Tributo e Julgamento
            { key: 'tributo-act', label: 'Tributo ACT', group: 'julgamento' },
            { key: 'alegacoes', label: 'Alegações', group: 'julgamento' }
        ];
        
        // Grupos para organização visual
        this.groups = {
            'processo': 'Processo',
            'documento': 'Documento',
            'datas': 'Datas',
            'unidade': 'Unidade/Equipe',
            'partes': 'Partes Envolvidas',
            'julgamento': 'Tributo/Julgamento'
        };
        
        // Estado: campos visíveis (todos por padrão)
        this.visibleFields = new Set(this.allFields.map(f => f.key));
        
        // Campos presentes nos resultados atuais
        this.availableFields = new Set();
        
        // Elementos DOM
        this.dropdown = null;
        this.button = null;
        this.menu = null;
        this.menuList = null;
        this.resultsContainer = null;
        this.badge = null;
        
        this.init();
    }
    
    init() {
        this.dropdown = document.getElementById(this.dropdownId);
        this.button = document.getElementById(this.buttonId);
        this.resultsContainer = document.getElementById(this.resultsContainerId);
        
        if (!this.dropdown || !this.button) {
            console.warn('FieldsSelectorComponent: elementos não encontrados');
            return;
        }
        
        this.menu = this.dropdown.querySelector('.fields-menu');
        this.menuList = this.dropdown.querySelector('.fields-menu-list');
        
        // Criar badge se não existir
        this.createBadge();
        
        this.bindEvents();
        this.loadFromStorage();
    }
    
    createBadge() {
        if (!this.button.querySelector('.fields-hidden-count')) {
            this.badge = document.createElement('span');
            this.badge.className = 'fields-hidden-count';
            this.button.style.position = 'relative';
            this.button.appendChild(this.badge);
        } else {
            this.badge = this.button.querySelector('.fields-hidden-count');
        }
    }
    
    bindEvents() {
        // Toggle dropdown
        this.button.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });
        
        // Fechar ao clicar fora
        document.addEventListener('click', (e) => {
            if (!this.dropdown.contains(e.target)) {
                this.close();
            }
        });
        
        // Botões Todos/Nenhum
        const selectAllBtn = this.dropdown.querySelector('.fields-select-all');
        const selectNoneBtn = this.dropdown.querySelector('.fields-select-none');
        
        selectAllBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectAll();
        });
        
        selectNoneBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            this.selectNone();
        });
        
        // Observar mudanças nos resultados para atualizar campos disponíveis
        if (this.resultsContainer) {
            const observer = new MutationObserver(() => {
                this.updateAvailableFields();
            });
            observer.observe(this.resultsContainer, { childList: true, subtree: true });
        }
    }
    
    toggle() {
        if (this.dropdown.classList.contains('open')) {
            this.close();
        } else {
            this.open();
        }
    }
    
    open() {
        // Fechar outros dropdowns
        document.querySelectorAll('[id$="Dropdown"].open').forEach(el => {
            if (el !== this.dropdown) {
                el.classList.remove('open');
            }
        });
        
        this.updateAvailableFields();
        this.renderMenu();
        this.dropdown.classList.add('open');
    }
    
    close() {
        this.dropdown.classList.remove('open');
    }
    
    /**
     * Atualiza a lista de campos disponíveis baseado nos resultados atuais
     */
    updateAvailableFields() {
        this.availableFields.clear();
        
        if (!this.resultsContainer) return;
        
        // Procurar todos os campos presentes nos cards de resultado
        const fields = this.resultsContainer.querySelectorAll('.result-field[data-field]');
        fields.forEach(field => {
            const fieldKey = field.dataset.field;
            if (fieldKey) {
                this.availableFields.add(fieldKey);
            }
        });
    }
    
    /**
     * Renderiza o menu de seleção de campos
     */
    renderMenu() {
        if (!this.menuList) return;
        
        this.menuList.innerHTML = '';
        
        // Se não há campos disponíveis, mostrar mensagem
        if (this.availableFields.size === 0) {
            const empty = document.createElement('div');
            empty.className = 'fields-menu-empty';
            empty.textContent = 'Nenhum resultado para configurar';
            this.menuList.appendChild(empty);
            return;
        }
        
        // Agrupar campos
        const groupedFields = {};
        this.allFields.forEach(field => {
            if (!groupedFields[field.group]) {
                groupedFields[field.group] = [];
            }
            groupedFields[field.group].push(field);
        });
        
        // Renderizar por grupo
        let isFirstGroup = true;
        Object.entries(groupedFields).forEach(([groupKey, fields]) => {
            // Filtrar apenas campos disponíveis neste grupo
            const availableInGroup = fields.filter(f => this.availableFields.has(f.key));
            
            if (availableInGroup.length === 0) return;
            
            // Separador entre grupos
            if (!isFirstGroup) {
                const separator = document.createElement('div');
                separator.className = 'fields-menu-separator';
                this.menuList.appendChild(separator);
            }
            isFirstGroup = false;
            
            // Título do grupo
            const groupTitle = document.createElement('div');
            groupTitle.className = 'fields-menu-group-title';
            groupTitle.textContent = this.groups[groupKey] || groupKey;
            this.menuList.appendChild(groupTitle);
            
            // Campos do grupo
            availableInGroup.forEach(field => {
                const item = this.createMenuItem(field);
                this.menuList.appendChild(item);
            });
        });
        
        // Footer com contador
        this.updateFooter();
    }
    
    /**
     * Cria um item do menu (checkbox + label)
     */
    createMenuItem(field) {
        const item = document.createElement('div');
        item.className = 'fields-menu-item';
        
        const isAvailable = this.availableFields.has(field.key);
        const isVisible = this.visibleFields.has(field.key);
        
        if (!isAvailable) {
            item.classList.add('disabled');
        }
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `field-toggle-${field.key}`;
        checkbox.checked = isVisible;
        checkbox.disabled = !isAvailable;
        
        const label = document.createElement('label');
        label.htmlFor = checkbox.id;
        label.textContent = field.label;
        label.title = field.label;
        
        // Evento de mudança
        checkbox.addEventListener('change', () => {
            this.toggleField(field.key, checkbox.checked);
        });
        
        // Click no item todo também alterna
        item.addEventListener('click', (e) => {
            if (e.target !== checkbox && isAvailable) {
                checkbox.checked = !checkbox.checked;
                this.toggleField(field.key, checkbox.checked);
            }
        });
        
        item.appendChild(checkbox);
        item.appendChild(label);
        
        return item;
    }
    
    /**
     * Alterna visibilidade de um campo
     */
    toggleField(fieldKey, visible) {
        if (visible) {
            this.visibleFields.add(fieldKey);
        } else {
            this.visibleFields.delete(fieldKey);
        }
        
        this.applyVisibility();
        this.updateBadge();
        this.updateFooter();
        this.saveToStorage();
    }
    
    /**
     * Seleciona todos os campos disponíveis
     */
    selectAll() {
        this.availableFields.forEach(key => {
            this.visibleFields.add(key);
        });
        
        // Atualizar checkboxes
        this.menuList.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            if (!cb.disabled) {
                cb.checked = true;
            }
        });
        
        this.applyVisibility();
        this.updateBadge();
        this.updateFooter();
        this.saveToStorage();
    }
    
    /**
     * Desseleciona todos os campos
     */
    selectNone() {
        this.availableFields.forEach(key => {
            this.visibleFields.delete(key);
        });
        
        // Atualizar checkboxes
        this.menuList.querySelectorAll('input[type="checkbox"]').forEach(cb => {
            cb.checked = false;
        });
        
        this.applyVisibility();
        this.updateBadge();
        this.updateFooter();
        this.saveToStorage();
    }
    
    /**
     * Aplica a visibilidade aos campos nos resultados
     */
    applyVisibility() {
        if (!this.resultsContainer) return;
        
        const fields = this.resultsContainer.querySelectorAll('.result-field[data-field]');
        fields.forEach(field => {
            const fieldKey = field.dataset.field;
            if (this.visibleFields.has(fieldKey)) {
                field.classList.remove('field-hidden');
            } else {
                field.classList.add('field-hidden');
            }
        });
    }
    
    /**
     * Atualiza o badge com número de campos ocultos
     */
    updateBadge() {
        if (!this.badge) return;
        
        // Contar campos ocultos que estão disponíveis
        let hiddenCount = 0;
        this.availableFields.forEach(key => {
            if (!this.visibleFields.has(key)) {
                hiddenCount++;
            }
        });
        
        if (hiddenCount > 0) {
            this.badge.textContent = hiddenCount;
            this.badge.dataset.count = hiddenCount;
        } else {
            this.badge.textContent = '';
            this.badge.dataset.count = '0';
        }
    }
    
    /**
     * Atualiza o footer do menu com contagem
     */
    updateFooter() {
        let footer = this.menu?.querySelector('.fields-menu-footer');
        
        if (!footer) {
            footer = document.createElement('div');
            footer.className = 'fields-menu-footer';
            this.menu?.appendChild(footer);
        }
        
        const visibleCount = [...this.availableFields].filter(k => this.visibleFields.has(k)).length;
        const totalCount = this.availableFields.size;
        
        footer.textContent = `${visibleCount} de ${totalCount} campos visíveis`;
    }
    
    /**
     * Salva preferências no localStorage
     */
    saveToStorage() {
        try {
            const hidden = this.allFields
                .map(f => f.key)
                .filter(k => !this.visibleFields.has(k));
            localStorage.setItem('eprocesso_hidden_fields', JSON.stringify(hidden));
        } catch (e) {
            // localStorage pode estar indisponível
        }
    }
    
    /**
     * Carrega preferências do localStorage
     */
    loadFromStorage() {
        try {
            const stored = localStorage.getItem('eprocesso_hidden_fields');
            if (stored) {
                const hidden = JSON.parse(stored);
                hidden.forEach(key => {
                    this.visibleFields.delete(key);
                });
            }
        } catch (e) {
            // localStorage pode estar indisponível
        }
    }
    
    /**
     * Método público para aplicar visibilidade após renderizar novos resultados
     */
    refresh() {
        this.updateAvailableFields();
        this.applyVisibility();
        this.updateBadge();
    }
    
    /**
     * Reseta para mostrar todos os campos
     */
    reset() {
        this.visibleFields = new Set(this.allFields.map(f => f.key));
        this.applyVisibility();
        this.updateBadge();
        this.saveToStorage();
    }
}

// Exportar para uso global
window.FieldsSelectorComponent = FieldsSelectorComponent;
