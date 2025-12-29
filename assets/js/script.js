/* ============================================
   EPROCESSO BUSCADOR - JavaScript
   ============================================ */

// ============================================
// CONFIGURAÇÃO
// ============================================

const CONFIG = {
    breakpoints: {
        mobile: 600,
        tablet: 800
    },
    sidebar: {
        defaultWidth: 250,
        minWidth: 10,
        maxWidth: 1000
    },
    operators: {
        contains: { label: 'Contém', class: 'contains' },
        'not-contains': { label: 'Não contém', class: 'not-contains' },
        equals: { label: 'Igual', class: 'equals' }
    },
    selectors: {
        // Search
        searchInput: '.searchInput',
        searchWrapper: '.searchInputWraper',
        searchCloseBtn: '.searchCloseBtn',
        
        // Sidebar
        sidebar: '#sidebar',
        sidebarBtn: '#sidebarBtn',
        sidebarResizer: '#sidebarResizer',
        sidebarOverlay: '#sidebarOverlay',
        
        // Facets
        facetTitle: '.facetTitle',
        facetGroup: '.facetGroup',
        
        // Dialogs
        filtersDialog: '#filtersDialog',
        filterBtn: '.filterBtn',
        infoDialog: '#infoDialog',
        ajudaDialog: '#ajudaDialog',
        
        // Filter operators
        filterInputGroup: '.filter-input-group',
        filterOperator: '.filter-operator'
    }
};

// ============================================
// UTILITIES
// ============================================

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// Debounce - atrasa execução até parar de chamar
const debounce = (fn, delay = 150) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fn(...args), delay);
    };
};

// ============================================
// SEARCH COMPONENT
// ============================================

class SearchComponent {
    constructor() {
        this.inputs = $$(CONFIG.selectors.searchInput);
        this.wrappers = $$(CONFIG.selectors.searchWrapper);
        this.closeBtns = $$(CONFIG.selectors.searchCloseBtn);
        this.forms = $$('.searchForm');
        
        if (this.inputs.length > 0) {
            this.init();
        }
    }
    
    init() {
        this.bindEvents();
        this.updatePlaceholders();
    }
    
    bindEvents() {
        // Toggle classe hasValue para cada input
        this.inputs.forEach((input, index) => {
            const wrapper = this.wrappers[index];
            if (input && wrapper) {
                input.addEventListener('input', () => {
                    wrapper.classList.toggle('hasValue', input.value.length > 0);
                    // Sincronizar valor entre inputs de busca
                    this.syncSearchInputs(input.value);
                });
            }
        });
        
        // Botões limpar
        this.closeBtns.forEach((btn, index) => {
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.clear(index);
                });
            }
        });
        
        // Submit dos formulários de busca
        this.forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                e.preventDefault();
                this.performSearch();
            });
        });
        
        // Placeholder responsivo (com debounce)
        window.addEventListener('resize', debounce(() => this.updatePlaceholders(), 100));
    }
    
    syncSearchInputs(value) {
        // Sincroniza todos os inputs de busca com o mesmo valor
        this.inputs.forEach(input => {
            if (input.value !== value) {
                input.value = value;
                const wrapper = input.closest('.searchInputWraper');
                wrapper?.classList.toggle('hasValue', value.length > 0);
            }
        });
    }
    
    clear(index) {
        const input = this.inputs[index];
        const wrapper = this.wrappers[index];
        if (input && wrapper) {
            input.value = '';
            wrapper.classList.remove('hasValue');
            input.focus();
            // Sincronizar limpeza
            this.syncSearchInputs('');
        }
    }
    
    performSearch() {
        const searchTerm = this.inputs[0]?.value?.trim() || '';
        
        // Disparar evento customizado de busca
        const event = new CustomEvent('search', { 
            detail: { term: searchTerm }
        });
        document.dispatchEvent(event);
    }
    
    updatePlaceholders() {
        const placeholder = window.innerWidth <= CONFIG.breakpoints.mobile 
            ? 'Buscar...' 
            : 'Digite para buscar...';
        
        this.inputs.forEach(input => {
            if (input) input.placeholder = placeholder;
        });
    }
    
    getSearchTerm() {
        return this.inputs[0]?.value?.trim() || '';
    }
}

// ============================================
// PAGE CONTROLLER
// ============================================

class PageController {
    constructor() {
        this.body = document.body;
        this.isEmptyState = this.body.classList.contains('empty-state');
    }
    
    showResults() {
        this.body.classList.remove('empty-state');
        this.isEmptyState = false;
    }
    
    showEmpty() {
        this.body.classList.add('empty-state');
        this.isEmptyState = true;
    }
    
    toggle() {
        if (this.isEmptyState) {
            this.showResults();
        } else {
            this.showEmpty();
        }
    }
}

// ============================================
// SIDEBAR COMPONENT
// ============================================

class SidebarComponent {
    constructor() {
        this.sidebar = $(CONFIG.selectors.sidebar);
        this.toggleBtn = $(CONFIG.selectors.sidebarBtn);
        this.overlay = $(CONFIG.selectors.sidebarOverlay);
        this.resizer = $(CONFIG.selectors.sidebarResizer);
        
        this.isResizing = false;
        this.startX = 0;
        this.startWidth = 0;
        
        if (this.sidebar) {
            this.init();
        }
    }
    
    init() {
        this.bindToggleEvents();
        this.bindResizerEvents();
    }
    
    bindToggleEvents() {
        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => this.toggle());
        }
        
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.close());
        }
    }
    
    bindResizerEvents() {
        if (!this.resizer) return;
        
        // Mouse events
        this.resizer.addEventListener('mousedown', (e) => this.startResize(e));
        document.addEventListener('mousemove', (e) => this.resize(e));
        document.addEventListener('mouseup', () => this.stopResize());
        
        // Touch events
        this.resizer.addEventListener('touchstart', (e) => this.startResize(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.resizeTouch(e), { passive: false });
        document.addEventListener('touchend', () => this.stopResize());
        
        // Double-click reset
        this.resizer.addEventListener('dblclick', () => this.resetWidth());
    }
    
    toggle() {
        this.sidebar.classList.toggle('open');
        this.overlay?.classList.toggle('open');
    }
    
    close() {
        this.sidebar.classList.remove('open');
        this.overlay?.classList.remove('open');
    }
    
    startResize(e) {
        e.preventDefault();
        this.isResizing = true;
        this.startX = e.clientX || e.touches?.[0]?.clientX || 0;
        this.startWidth = this.sidebar.offsetWidth;
        this.resizer.classList.add('dragging');
        document.body.classList.add('resizing');
    }
    
    resize(e) {
        if (!this.isResizing) return;
        
        const currentX = e.clientX;
        const diff = currentX - this.startX;
        const newWidth = this.startWidth + diff;
        
        this.setWidth(newWidth);
    }
    
    resizeTouch(e) {
        if (!this.isResizing) return;
        e.preventDefault();
        
        const currentX = e.touches[0].clientX;
        const diff = currentX - this.startX;
        const newWidth = this.startWidth + diff;
        
        this.setWidth(newWidth);
    }
    
    setWidth(width) {
        const { minWidth, maxWidth } = CONFIG.sidebar;
        const clampedWidth = Math.max(minWidth, Math.min(maxWidth, width));
        this.sidebar.style.width = `${clampedWidth}px`;
    }
    
    stopResize() {
        if (this.isResizing) {
            this.isResizing = false;
            this.resizer?.classList.remove('dragging');
            document.body.classList.remove('resizing');
        }
    }
    
    resetWidth() {
        this.sidebar.style.width = `${CONFIG.sidebar.defaultWidth}px`;
    }
}

// ============================================
// ACCORDION COMPONENT
// ============================================

class AccordionComponent {
    constructor(selector) {
        this.triggers = $$(selector);
        this.init();
    }
    
    init() {
        this.triggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                const group = trigger.closest(CONFIG.selectors.facetGroup);
                group?.classList.toggle('open');
            });
        });
    }
}

// ============================================
// DROPDOWN COMPONENT
// ============================================

class DropdownComponent {
    constructor(dropdownId, buttonId) {
        this.dropdown = $(`#${dropdownId}`);
        this.button = $(`#${buttonId}`);
        
        if (this.dropdown && this.button) {
            this.init();
        }
    }
    
    init() {
        this.button.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeOthers();
            this.toggle();
        });
    }
    
    toggle() {
        this.dropdown.classList.toggle('open');
    }
    
    close() {
        this.dropdown.classList.remove('open');
    }
    
    closeOthers() {
        $$('[id$="Dropdown"].open').forEach(el => {
            if (el !== this.dropdown) {
                el.classList.remove('open');
            }
        });
    }
    
    static closeAll() {
        $$('[id$="Dropdown"].open').forEach(el => {
            el.classList.remove('open');
        });
    }
}

// ============================================
// FILTER COUNTER COMPONENT
// ============================================

class FilterCounterComponent {
    constructor(dialogSelector) {
        this.dialog = $(dialogSelector);
        this.badges = $$('.filtersUsedNumbers');
        this.filterCount = 0;
        
        if (this.dialog) {
            this.init();
        }
    }
    
    init() {
        // Atualizar contador quando inputs mudam
        this.dialog.querySelectorAll('.filter-input').forEach(input => {
            input.addEventListener('input', () => this.updateCount());
            input.addEventListener('change', () => this.updateCount());
        });
        
        // Atualizar ao abrir o dialog
        this.dialog.addEventListener('close', () => this.updateCount());
        
        // Inicializar
        this.updateCount();
    }
    
    updateCount() {
        let count = 0;
        
        // Contar inputs de texto com valor
        this.dialog.querySelectorAll('.filter-input-group .filter-input').forEach(input => {
            if (input.value.trim()) {
                count++;
            }
        });
        
        // Contar datas preenchidas (cada par conta como 1 filtro se ao menos uma data preenchida)
        this.dialog.querySelectorAll('.filter-date-range').forEach(range => {
            const inputs = range.querySelectorAll('input[type="date"]');
            const hasValue = Array.from(inputs).some(input => input.value);
            if (hasValue) {
                count++;
            }
        });
        
        // Contar ranges de valor (conta como 1 se ao menos um valor preenchido)
        this.dialog.querySelectorAll('.filter-value-range').forEach(range => {
            const inputs = range.querySelectorAll('.filter-input');
            const hasValue = Array.from(inputs).some(input => input.value.trim());
            if (hasValue) {
                count++;
            }
        });
        
        this.filterCount = count;
        this.updateBadges();
    }
    
    updateBadges() {
        this.badges.forEach(badge => {
            if (this.filterCount > 0) {
                badge.textContent = this.filterCount;
                badge.style.display = 'flex';
            } else {
                badge.textContent = '';
                badge.style.display = 'none';
            }
        });
    }
    
    getCount() {
        return this.filterCount;
    }
    
    reset() {
        this.filterCount = 0;
        this.updateBadges();
    }
}

// ============================================
// DIALOG COMPONENT
// ============================================

class DialogComponent {
    constructor(dialogId, options = {}) {
        this.dialog = $(`#${dialogId}`);
        this.openBtnId = options.openBtnId;
        this.openBtnSelector = options.openBtnSelector;
        this.closeBtnId = options.closeBtnId;
        this.cancelBtnId = options.cancelBtnId;
        this.clearBtnId = options.clearBtnId;
        this.filterCounter = options.filterCounter;
        
        if (this.dialog) {
            this.init();
        }
    }
    
    init() {
        // Botão de abrir (por ID)
        if (this.openBtnId) {
            const openBtn = $(`#${this.openBtnId}`);
            openBtn?.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.open();
            });
        }
        
        // Botões de abrir (por seletor - múltiplos)
        if (this.openBtnSelector) {
            const openBtns = $$(this.openBtnSelector);
            openBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.open();
                });
            });
        }
        
        // Botão de fechar (X)
        if (this.closeBtnId) {
            const closeBtn = $(`#${this.closeBtnId}`);
            if (closeBtn) {
                closeBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.close();
                });
            }
        }
        
        // Botão cancelar
        if (this.cancelBtnId) {
            const cancelBtn = $(`#${this.cancelBtnId}`);
            if (cancelBtn) {
                cancelBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.close();
                });
            }
        }
        
        // Botão limpar filtros
        if (this.clearBtnId) {
            const clearBtn = $(`#${this.clearBtnId}`);
            if (clearBtn) {
                clearBtn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.clearFilters();
                });
            }
        }
        
        // Fechar ao clicar no backdrop (área fora do dialog)
        this.dialog.addEventListener('click', (e) => {
            if (e.target === this.dialog) {
                this.close();
            }
        });
        
        // Fechar com ESC
        this.dialog.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.close();
            }
        });
    }
    
    open() {
        this.dialog.showModal();
    }
    
    close() {
        this.dialog.close();
    }
    
    toggle() {
        if (this.dialog.open) {
            this.close();
        } else {
            this.open();
        }
    }
    
    clearFilters() {
        // Limpar todos os inputs de texto
        this.dialog.querySelectorAll('.filter-input').forEach(input => {
            input.value = '';
        });
        
        // Limpar inputs de data
        this.dialog.querySelectorAll('input[type="date"]').forEach(input => {
            input.value = '';
        });
        
        // Limpar input de busca do header do dialog
        this.dialog.querySelectorAll('.searchInput').forEach(input => {
            input.value = '';
        });
        
        // Resetar todos os operadores para "contém"
        this.dialog.querySelectorAll('.filter-input-group').forEach(group => {
            const opBtn = group.querySelector('.filter-operator');
            if (opBtn) {
                opBtn.dataset.operator = 'contains';
                opBtn.textContent = 'Contém';
                opBtn.classList.remove('not-contains', 'equals');
                opBtn.classList.add('contains');
            }
            // Esconder operador e remover todas as classes de padding
            group.classList.remove('has-operator', 'operator-contains', 'operator-not-contains', 'operator-equals');
        });
        
        // Fechar autocompletes abertos
        this.dialog.querySelectorAll('.filter-autocomplete.open').forEach(ac => {
            ac.classList.remove('open');
        });
        
        // Atualizar contador de filtros
        if (this.filterCounter) {
            this.filterCounter.updateCount();
        }
    }
}

// ============================================
// FILTER OPERATOR COMPONENT
// ============================================

class FilterOperatorComponent {
    constructor() {
        this.groups = $$(CONFIG.selectors.filterInputGroup);
        this.operators = ['contains', 'not-contains', 'equals'];
        this.labels = {
            'contains': 'Contém',
            'not-contains': 'Não contém',
            'equals': 'Igual'
        };
        
        if (this.groups.length > 0) {
            this.init();
        }
    }
    
    init() {
        this.groups.forEach(group => {
            const input = group.querySelector('.filter-input');
            const opBtn = group.querySelector('.filter-operator');
            
            if (!input || !opBtn) return;
            
            // Mostrar operador no foco
            input.addEventListener('focus', () => {
                this.showOperator(group, opBtn);
            });
            
            // Esconder operador ao sair do foco (se não tiver valor)
            input.addEventListener('blur', () => {
                // Delay para permitir clique no operador
                setTimeout(() => {
                    if (!input.value.trim() && !opBtn.matches(':hover')) {
                        this.hideOperator(group, opBtn);
                    }
                }, 150);
            });
            
            // Mostrar operador ao digitar
            input.addEventListener('input', () => {
                if (input.value.trim()) {
                    this.showOperator(group, opBtn);
                } else if (!input.matches(':focus')) {
                    this.hideOperator(group, opBtn);
                }
            });
            
            // Toggle do operador ao clicar
            opBtn.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.cycleOperator(group, opBtn);
                input.focus();
            });
        });
    }
    
    showOperator(group, opBtn) {
        group.classList.add('has-operator');
        const currentOp = opBtn.dataset.operator || 'contains';
        this.updateOperatorClass(group, currentOp);
    }
    
    hideOperator(group, opBtn) {
        group.classList.remove('has-operator');
        group.classList.remove('operator-contains', 'operator-not-contains', 'operator-equals');
    }
    
    updateOperatorClass(group, operator) {
        group.classList.remove('operator-contains', 'operator-not-contains', 'operator-equals');
        group.classList.add(`operator-${operator}`);
    }
    
    cycleOperator(group, opBtn) {
        const current = opBtn.dataset.operator || 'contains';
        const currentIndex = this.operators.indexOf(current);
        const nextIndex = (currentIndex + 1) % this.operators.length;
        const next = this.operators[nextIndex];
        
        // Atualizar dataset e texto
        opBtn.dataset.operator = next;
        opBtn.textContent = this.labels[next];
        
        // Atualizar classes do botão
        opBtn.classList.remove('contains', 'not-contains', 'equals');
        opBtn.classList.add(next);
        
        // Atualizar classe do grupo para padding dinâmico
        this.updateOperatorClass(group, next);
    }
}

// ============================================
// AUTOCOMPLETE COMPONENT
// ============================================

class AutocompleteComponent {
    constructor() {
        // Dados emulados por campo
        this.mockData = {
            'grupo_processo': [
                'Processo Administrativo Fiscal',
                'Processo de Restituição',
                'Processo de Compensação',
                'Processo de Ressarcimento',
                'Processo de Revisão',
                'Processo de Consulta'
            ],
            'tipo_processo': [
                'Recurso Voluntário',
                'Recurso de Ofício',
                'Recurso Especial',
                'Embargos de Declaração',
                'Manifestação de Inconformidade',
                'Impugnação'
            ],
            'subtipo_processo': [
                'IRPJ - Lucro Real',
                'IRPJ - Lucro Presumido',
                'CSLL',
                'PIS/COFINS',
                'IPI',
                'Contribuições Previdenciárias'
            ],
            'situacao_documento': [
                'Em Análise',
                'Julgado',
                'Pendente de Diligência',
                'Aguardando Distribuição',
                'Em Pauta',
                'Arquivado'
            ],
            'tipo_documento': [
                'Acórdão',
                'Decisão',
                'Despacho',
                'Auto de Infração',
                'Intimação',
                'Petição',
                'Recurso',
                'Parecer'
            ],
            'tributo_act': [
                'IRPJ',
                'CSLL',
                'PIS',
                'COFINS',
                'IPI',
                'IRRF',
                'IOF',
                'Contribuição Previdenciária'
            ],
            'unidade_origem': [
                'DRF São Paulo',
                'DRF Rio de Janeiro',
                'DRF Belo Horizonte',
                'DRF Brasília',
                'DRF Curitiba',
                'DRF Porto Alegre',
                'DRF Salvador',
                'DRF Recife'
            ],
            'equipe_origem': [
                'EQMAF01',
                'EQMAF02',
                'EQCAC01',
                'EQCAC02',
                'EQFIS01',
                'EQFIS02',
                'EQREV01'
            ],
            'unidade_atual': [
                'CARF - 1ª Seção',
                'CARF - 2ª Seção',
                'CARF - 3ª Seção',
                'DRJ São Paulo',
                'DRJ Brasília',
                'DRJ Rio de Janeiro',
                'CSRF'
            ],
            'equipe_atual': [
                '1ª Turma Ordinária',
                '2ª Turma Ordinária',
                '3ª Turma Ordinária',
                '1ª Turma Especial',
                '2ª Turma Especial',
                'Turma Superior'
            ],
            'alegacoes_recurso': [
                'Decadência',
                'Prescrição',
                'Nulidade do Auto de Infração',
                'Cerceamento de Defesa',
                'Erro na Apuração',
                'Divergência Jurisprudencial',
                'Inconstitucionalidade'
            ]
        };
        
        this.activeAutocomplete = null;
        this.highlightedIndex = -1;
        
        this.init();
    }
    
    init() {
        // Encontrar todos os campos com badge AUTO
        const autoFields = $$('.filter-field');
        
        // Handler com debounce para filtrar sugestões
        this.debouncedFilter = debounce((input, list, fieldName) => {
            this.filterSuggestions(input, list, fieldName);
        }, 100);
        
        autoFields.forEach(field => {
            const badge = field.querySelector('.filter-badge');
            if (!badge || badge.textContent.trim() !== 'AUTO') return;
            
            const inputGroup = field.querySelector('.filter-input-group');
            const input = inputGroup?.querySelector('.filter-input');
            
            if (!input || !inputGroup) return;
            
            const fieldName = input.dataset.field;
            if (!fieldName || !this.mockData[fieldName]) return;
            
            // Gerar ID único para acessibilidade
            const listId = `autocomplete-${fieldName}-${Date.now()}`;
            
            // Adicionar wrapper de autocomplete
            inputGroup.classList.add('filter-autocomplete');
            
            // Criar lista de sugestões
            const list = document.createElement('ul');
            list.className = 'filter-autocomplete-list';
            list.id = listId;
            list.setAttribute('role', 'listbox');
            list.setAttribute('aria-label', `Sugestões para ${fieldName}`);
            inputGroup.appendChild(list);
            
            // Atributos ARIA no input
            input.setAttribute('role', 'combobox');
            input.setAttribute('aria-autocomplete', 'list');
            input.setAttribute('aria-expanded', 'false');
            input.setAttribute('aria-controls', listId);
            input.setAttribute('aria-haspopup', 'listbox');
            
            // Eventos
            input.addEventListener('focus', () => this.showSuggestions(input, list, fieldName));
            input.addEventListener('input', () => this.debouncedFilter(input, list, fieldName));
            input.addEventListener('blur', () => this.hideSuggestions(input, list));
            input.addEventListener('keydown', (e) => this.handleKeydown(e, input, list));
        });
        
        // Fechar ao clicar fora
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.filter-autocomplete')) {
                this.closeAll();
            }
        });
    }
    
    showSuggestions(input, list, fieldName) {
        this.activeAutocomplete = { input, list, fieldName };
        this.highlightedIndex = -1;
        
        const container = input.closest('.filter-autocomplete');
        
        // Detectar se deve abrir para cima ou para baixo
        this.updateDropdownPosition(input, container);
        
        this.renderSuggestions(input, list, fieldName, input.value);
        container.classList.add('open');
        input.setAttribute('aria-expanded', 'true');
    }
    
    updateDropdownPosition(input, container) {
        // Encontrar o main do dialog (área de scroll)
        const dialogMain = input.closest('#filtersDialog main');
        if (!dialogMain) {
            container.classList.remove('open-up');
            return;
        }
        
        const inputRect = input.getBoundingClientRect();
        const mainRect = dialogMain.getBoundingClientRect();
        
        // Espaço disponível abaixo do input até o fim do main
        const spaceBelow = mainRect.bottom - inputRect.bottom;
        
        // Se não há espaço suficiente para o dropdown (200px + margem), abre para cima
        const dropdownHeight = 208; // 200px max-height + 8px margins
        
        if (spaceBelow < dropdownHeight) {
            container.classList.add('open-up');
        } else {
            container.classList.remove('open-up');
        }
    }
    
    hideSuggestions(input, list) {
        // Delay para permitir clique nos itens
        setTimeout(() => {
            const container = list.closest('.filter-autocomplete');
            container?.classList.remove('open');
            input?.setAttribute('aria-expanded', 'false');
            input?.removeAttribute('aria-activedescendant');
            this.activeAutocomplete = null;
            this.highlightedIndex = -1;
        }, 200);
    }
    
    filterSuggestions(input, list, fieldName) {
        this.highlightedIndex = -1;
        input.removeAttribute('aria-activedescendant');
        this.renderSuggestions(input, list, fieldName, input.value);
    }
    
    renderSuggestions(input, list, fieldName, query) {
        const data = this.mockData[fieldName] || [];
        const normalizedQuery = this.normalizeText(query);
        
        // Filtrar dados
        const filtered = data.filter(item => 
            this.normalizeText(item).includes(normalizedQuery)
        );
        
        // Limpar lista
        list.innerHTML = '';
        
        if (filtered.length === 0) {
            const empty = document.createElement('li');
            empty.className = 'filter-autocomplete-empty';
            empty.setAttribute('role', 'presentation');
            empty.textContent = 'Nenhum resultado encontrado';
            list.appendChild(empty);
            return;
        }
        
        // Renderizar itens
        filtered.forEach((item, index) => {
            const li = document.createElement('li');
            const itemId = `${list.id}-item-${index}`;
            li.id = itemId;
            li.className = 'filter-autocomplete-item';
            li.setAttribute('role', 'option');
            li.setAttribute('aria-selected', 'false');
            li.dataset.value = item;
            li.dataset.index = index;
            
            // Highlight do texto que corresponde
            if (query) {
                li.innerHTML = this.highlightMatch(item, query);
            } else {
                li.textContent = item;
            }
            
            // Eventos
            li.addEventListener('mousedown', (e) => {
                e.preventDefault();
                this.selectItem(input, list, item);
            });
            
            li.addEventListener('mouseenter', () => {
                this.highlightItem(input, list, index);
            });
            
            list.appendChild(li);
        });
    }
    
    highlightMatch(text, query) {
        if (!query) return text;
        
        const normalizedText = this.normalizeText(text);
        const normalizedQuery = this.normalizeText(query);
        const matchIndex = normalizedText.indexOf(normalizedQuery);
        
        if (matchIndex === -1) return text;
        
        // Mapear índices do texto normalizado para o original
        // Isso resolve o bug com caracteres acentuados
        const charMap = [];
        let normalizedPos = 0;
        
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const normalizedChar = this.normalizeText(char);
            
            if (normalizedChar.length > 0) {
                charMap.push(i);
                normalizedPos++;
            }
        }
        
        // Encontrar posições no texto original
        const startOriginal = charMap[matchIndex] ?? 0;
        const endNormalized = matchIndex + normalizedQuery.length;
        const endOriginal = (charMap[endNormalized] ?? text.length);
        
        // Construir resultado com highlight
        const before = text.substring(0, startOriginal);
        const match = text.substring(startOriginal, endOriginal);
        const after = text.substring(endOriginal);
        
        return `${before}<mark>${match}</mark>${after}`;
    }
    
    normalizeText(text) {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }
    
    selectItem(input, list, value) {
        input.value = value;
        input.setAttribute('aria-expanded', 'false');
        input.removeAttribute('aria-activedescendant');
        list.closest('.filter-autocomplete')?.classList.remove('open');
        
        // Disparar evento input para atualizar operador
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    highlightItem(input, list, index) {
        const items = list.querySelectorAll('.filter-autocomplete-item');
        items.forEach((item, i) => {
            const isHighlighted = i === index;
            item.classList.toggle('highlighted', isHighlighted);
            item.setAttribute('aria-selected', isHighlighted ? 'true' : 'false');
            
            if (isHighlighted && item.id) {
                input.setAttribute('aria-activedescendant', item.id);
            }
        });
        this.highlightedIndex = index;
    }
    
    handleKeydown(e, input, list) {
        const items = list.querySelectorAll('.filter-autocomplete-item');
        const isOpen = list.closest('.filter-autocomplete')?.classList.contains('open');
        
        if (!isOpen || items.length === 0) return;
        
        switch (e.key) {
            case 'ArrowDown':
                e.preventDefault();
                this.highlightedIndex = Math.min(this.highlightedIndex + 1, items.length - 1);
                this.highlightItem(input, list, this.highlightedIndex);
                items[this.highlightedIndex]?.scrollIntoView({ block: 'nearest' });
                break;
                
            case 'ArrowUp':
                e.preventDefault();
                this.highlightedIndex = Math.max(this.highlightedIndex - 1, 0);
                this.highlightItem(input, list, this.highlightedIndex);
                items[this.highlightedIndex]?.scrollIntoView({ block: 'nearest' });
                break;
                
            case 'Enter':
                e.preventDefault();
                if (this.highlightedIndex >= 0 && items[this.highlightedIndex]) {
                    const value = items[this.highlightedIndex].dataset.value;
                    this.selectItem(input, list, value);
                }
                break;
                
            case 'Escape':
                e.preventDefault();
                input.setAttribute('aria-expanded', 'false');
                input.removeAttribute('aria-activedescendant');
                list.closest('.filter-autocomplete')?.classList.remove('open');
                break;
        }
    }
    
    closeAll() {
        $$('.filter-autocomplete.open').forEach(el => {
            el.classList.remove('open');
            const input = el.querySelector('input');
            input?.setAttribute('aria-expanded', 'false');
            input?.removeAttribute('aria-activedescendant');
        });
        this.activeAutocomplete = null;
        this.highlightedIndex = -1;
    }
}

// ============================================
// CURRENCY INPUT COMPONENT
// ============================================

class CurrencyInputComponent {
    constructor() {
        this.inputs = $$('.filter-value-range .filter-input');
        
        if (this.inputs.length > 0) {
            this.init();
        }
    }
    
    init() {
        this.inputs.forEach(input => {
            // Permitir apenas números e formatação
            input.addEventListener('input', (e) => {
                this.formatCurrency(e.target);
            });
            
            // Prevenir caracteres não numéricos
            input.addEventListener('keypress', (e) => {
                // Permitir: números, vírgula, ponto, backspace, delete, tab, escape, enter
                if (!/[0-9,.]/.test(e.key) && 
                    !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                    e.preventDefault();
                }
            });
            
            // Formatar ao sair do campo
            input.addEventListener('blur', (e) => {
                this.formatCurrency(e.target);
            });
        });
    }
    
    formatCurrency(input) {
        // Remove tudo exceto números
        let value = input.value.replace(/\D/g, '');
        
        if (value === '') {
            input.value = '';
            return;
        }
        
        // Converte para número e formata
        const numValue = parseInt(value, 10) / 100;
        
        // Formata como moeda brasileira
        input.value = numValue.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
        });
    }
}

// ============================================
// RESULT CARD COMPONENT
// ============================================

class ResultCardComponent {
    constructor() {
        this.resultsContainer = $('#results');
        this.searchTerm = '';
        this.toast = null;
        
        if (this.resultsContainer) {
            this.init();
        }
    }
    
    init() {
        this.createToast();
        this.bindCopyEvents();
    }
    
    createToast() {
        // Criar toast de feedback
        this.toast = document.createElement('div');
        this.toast.className = 'copy-toast';
        this.toast.textContent = 'Copiado!';
        document.body.appendChild(this.toast);
    }
    
    bindCopyEvents() {
        // Delegação de eventos para copiar campos
        this.resultsContainer.addEventListener('click', (e) => {
            const field = e.target.closest('.result-field');
            if (field) {
                this.copyFieldValue(field);
            }
        });
    }
    
    copyFieldValue(field) {
        const valueElement = field.querySelector('.result-field-value span');
        if (!valueElement) return;
        
        // Pegar texto sem o highlight
        const text = valueElement.textContent;
        
        navigator.clipboard.writeText(text).then(() => {
            this.showToast('Copiado!');
        }).catch(() => {
            this.showToast('Erro ao copiar');
        });
    }
    
    showToast(message) {
        this.toast.textContent = message;
        this.toast.classList.add('show');
        
        setTimeout(() => {
            this.toast.classList.remove('show');
        }, 2000);
    }
    
    setSearchTerm(term) {
        this.searchTerm = term;
    }
    
    highlightText(text, term) {
        if (!term || !text) return text;
        
        const normalizedText = this.normalizeText(text);
        const normalizedTerm = this.normalizeText(term);
        
        if (!normalizedTerm) return text;
        
        const matchIndex = normalizedText.indexOf(normalizedTerm);
        if (matchIndex === -1) return text;
        
        // Mapear índices
        const charMap = [];
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const normalizedChar = this.normalizeText(char);
            if (normalizedChar.length > 0) {
                charMap.push(i);
            }
        }
        
        const startOriginal = charMap[matchIndex] ?? 0;
        const endNormalized = matchIndex + normalizedTerm.length;
        const endOriginal = charMap[endNormalized] ?? text.length;
        
        const before = text.substring(0, startOriginal);
        const match = text.substring(startOriginal, endOriginal);
        const after = text.substring(endOriginal);
        
        return `${before}<mark>${match}</mark>${after}`;
    }
    
    normalizeText(text) {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }
    
    renderResults(results) {
        this.resultsContainer.innerHTML = '';
        
        results.forEach(result => {
            const card = this.createCard(result);
            this.resultsContainer.appendChild(card);
        });
    }
    
    /**
     * Determina o tipo de download baseado nos indicadores
     * @returns {string} 'dual' | 'original' | 'searchable' | 'disabled'
     */
    getDownloadType(data) {
        if (!data.arquivoIndexado) {
            return 'disabled';
        }
        
        const pesquisavel = data.indicadorPesquisavel;
        const originalPesquisavel = data.indicadorOriginalPesquisavel;
        
        // Caso SN: Versão OCR disponível (original não pesquisável)
        if (pesquisavel && !originalPesquisavel) {
            return 'dual';
        }
        
        // Caso NN: Apenas original disponível (não pesquisável)
        if (!pesquisavel && !originalPesquisavel) {
            return 'original';
        }
        
        // Caso SS: Original já é pesquisável
        if (pesquisavel && originalPesquisavel) {
            return 'searchable';
        }
        
        return 'original';
    }
    
    /**
     * Cria os botões de download baseado no tipo
     */
    createDownloadButtons(data) {
        const downloadType = this.getDownloadType(data);
        const baseUrl = 'https://eprocesso.suiterfb.receita.fazenda/eprocesso/api/documentos/';
        const id = data.id || '';
        const pdfUrl = `${baseUrl}${id}/obterbinario/download`;
        const pdfOcrUrl = `${baseUrl}${id}/obterbinarioocr/download`;
        
        switch (downloadType) {
            case 'dual':
                // Dois botões: Original + OCR/Pesquisável
                return `
                    <div class="btn-group">
                        <a href="${pdfUrl}" class="btn-download" title="Baixar PDF Original" target="_blank">
                            <img class="icon-default iconColor" src="assets/img/icons/file-image-regular-full.svg" alt="">
                            <img class="icon-hover iconColor" src="assets/img/icons/download-solid-full.svg" alt="">
                        </a>
                        <a href="${pdfOcrUrl}" class="btn-download" title="Baixar PDF Pesquisável (OCR)" target="_blank">
                            <img class="icon-default iconColorGreen" src="assets/img/icons/file-lines-regular-full.svg" alt="">
                            <img class="icon-hover iconColor" src="assets/img/icons/download-solid-full.svg" alt="">
                        </a>
                    </div>
                `;
            
            case 'original':
                // Apenas botão original
                return `
                    <div class="btn-group">
                        <a href="${pdfUrl}" class="btn-download btn-download-single" title="Baixar PDF Original" target="_blank">
                            <img class="icon-default iconColor" src="assets/img/icons/file-image-regular-full.svg" alt="">
                            <img class="icon-hover iconColor" src="assets/img/icons/download-solid-full.svg" alt="">
                        </a>
                    </div>
                `;
            
            case 'searchable':
                // Botão único para PDF já pesquisável
                return `
                    <div class="btn-group">
                        <a href="${pdfUrl}" class="btn-download btn-download-single" title="Baixar PDF" target="_blank">
                            <img class="icon-default iconColor iconColorGreen" src="assets/img/icons/file-lines-regular-full.svg" alt="">
                            <img class="icon-hover iconColor" src="assets/img/icons/download-solid-full.svg" alt="">
                        </a>
                    </div>
                `;
            
            case 'disabled':
            default:
                // Botão desabilitado
                return `
                    <div class="btn-group">
                        <span class="btn-download btn-download-disabled" title="PDF não disponível">
                            <img class="iconColor" src="assets/img/icons/file-excel-regular-full.svg" alt="">
                        </span>
                    </div>
                `;
        }
    }
    
    createCard(data) {
        const card = document.createElement('article');
        card.className = 'result-card';
        if (data.id) {
            card.id = `doc-${data.id}`;
        }
        
        // Header
        const header = document.createElement('header');
        header.className = 'result-card-header';
        
        // Botões de ação (com lógica de download)
        const actions = document.createElement('div');
        actions.className = 'result-card-actions';
        actions.innerHTML = this.createDownloadButtons(data);
        
        // Título: TIPO_DOCUMENTO - TITULO
        const title = document.createElement('h3');
        title.className = 'result-card-title';
        let titleText = data.tipoDocumento || 'Documento';
        if (data.titulo) {
            titleText += ` - ${data.titulo}`;
        }
        title.innerHTML = this.highlightText(titleText, this.searchTerm);
        
        header.appendChild(actions);
        header.appendChild(title);
        
        // Body com campos
        const body = document.createElement('div');
        body.className = 'result-card-body';
        
        // Lista completa de campos baseada no Velocity
        const fields = [
            // Processo
            { label: 'Número do Processo', value: data.processo, field: 'processo' },
            
            // Datas
            { label: 'Data Anexação', value: data.dataAnexacao, field: 'data-anexacao' },
            { label: 'Data Protocolo', value: data.dataProtocolo, field: 'data-protocolo' },
            { label: 'Data Juntada', value: data.dataJuntada, field: 'data-juntada' },
            
            // Unidade e Equipe Origem
            { label: 'Unidade Origem', value: data.unidadeOrigem, field: 'unidade-origem' },
            { label: 'Equipe Origem', value: data.equipeOrigem, field: 'equipe-origem' },
            
            // Tipo e Grupo do Processo
            { label: 'Tipo Documento', value: data.tipoDocumento, field: 'tipo-documento' },
            { label: 'Título', value: data.titulo, field: 'titulo' },
            { label: 'Grupo Processo', value: data.grupoProcesso, field: 'grupo-processo' },
            { label: 'Tipo Processo', value: data.tipoProcesso, field: 'tipo-processo' },
            { label: 'Subtipo Processo', value: data.subtipoProcesso, field: 'subtipo-processo' },
            
            // Contribuinte
            { label: 'NI Contribuinte', value: data.niContribuinte, field: 'ni-contribuinte' },
            { label: 'Nome Contribuinte', value: data.nomeContribuinte, field: 'nome-contribuinte' },
            
            // Equipe e Unidade Atual
            { label: 'Equipe Atual', value: data.equipeAtual, field: 'equipe-atual' },
            { label: 'Unidade Atual', value: data.unidadeAtual, field: 'unidade-atual' },
            
            // Responsável
            { label: 'CPF Responsável', value: data.cpfResponsavel, field: 'cpf-responsavel' },
            { label: 'Usuário Juntada', value: data.usuarioJuntada, field: 'usuario-juntada' },
            
            // Tributo e Assuntos
            { label: 'Tributo ACT', value: data.tributoAct, field: 'tributo-act' },
            { label: 'Assuntos/Objetos', value: data.assuntosObjetos, field: 'assuntos-objetos' },
            
            // Alegações e Julgamento
            { label: 'Alegações', value: data.alegacoes, field: 'alegacoes' },
            
            // Número documento principal
            { label: 'Nr Doc Principal', value: data.numeroDocPrincipal, field: 'numero-doc-principal' }
        ];
        
        fields.forEach(f => {
            if (f.value) {
                const field = this.createField(f.label, f.value, f.field);
                body.appendChild(field);
            }
        });
        
        card.appendChild(header);
        card.appendChild(body);
        
        // Trecho do conteúdo (highlighting) - se houver termo de busca e conteúdo
        if (this.searchTerm && data.conteudo) {
            const snippet = this.createSnippet(data.conteudo);
            card.appendChild(snippet);
        }
        
        return card;
    }
    
    createField(label, value, fieldName) {
        const field = document.createElement('div');
        field.className = 'result-field';
        field.dataset.field = fieldName;
        field.title = 'Clique para copiar';
        
        field.innerHTML = `
            <dt class="result-field-label">${label}</dt>
            <dd class="result-field-value">
                <span>${this.highlightText(value, this.searchTerm)}</span>
                <img class="result-field-copy iconColor" src="assets/img/icons/copy-regular-full.svg" alt="Copiar">
            </dd>
        `;
        
        return field;
    }
    
    /**
     * Cria o trecho de conteúdo com highlighting
     */
    createSnippet(conteudo) {
        const snippet = document.createElement('div');
        snippet.className = 'result-card-snippet';
        
        snippet.innerHTML = `
            <dt class="result-snippet-label">Trecho:</dt>
            <dd class="result-snippet-value">${this.highlightText(conteudo, this.searchTerm)}</dd>
        `;
        
        return snippet;
    }
    
    // Dados de exemplo para demonstração (atualizado com todos os campos)
    static getMockResults() {
        return [
            {
                id: '12345678',
                titulo: 'NOTIFICAÇÃO DE LANÇAMENTO - COFINS',
                tipoDocumento: 'NOTIFICAÇÃO',
                processo: '10580.350820/2019-34',
                dataAnexacao: '14/05/2019 16:00',
                dataProtocolo: '15/05/2019 09:15',
                dataJuntada: '20/05/2019 14:30',
                unidadeOrigem: 'DRF São Paulo',
                equipeOrigem: 'EFIS-01',
                grupoProcesso: 'PROCESSO TRIBUTÁRIO',
                tipoProcesso: 'LANÇAMENTO DE OFÍCIO',
                subtipoProcesso: 'AUTO DE INFRAÇÃO',
                niContribuinte: '12.345.678/0001-99',
                nomeContribuinte: 'EMPRESA EXEMPLO LTDA',
                equipeAtual: 'EFIS-02',
                unidadeAtual: 'DRF São Paulo',
                cpfResponsavel: '123.456.789-00',
                usuarioJuntada: 'SILVA, JOÃO',
                tributoAct: '35 - COFINS',
                assuntosObjetos: 'GLOSA DE CRÉDITOS',
                alegacoes: null,
                numeroDocPrincipal: 'NL-2019-001234',
                conteudo: 'O contribuinte deixou de recolher a COFINS devida no período de apuração, conforme demonstrado nos autos.',
                arquivoIndexado: true,
                indicadorPesquisavel: true,
                indicadorOriginalPesquisavel: false
            },
            {
                id: '23456789',
                titulo: 'AUTO DE INFRAÇÃO - IRPJ',
                tipoDocumento: 'AUTO DE INFRAÇÃO',
                processo: '10580.720145/2020-12',
                dataAnexacao: '09/03/2020 10:00',
                dataProtocolo: '10/03/2020 11:45',
                dataJuntada: '15/03/2020 16:20',
                unidadeOrigem: 'DRF Rio de Janeiro',
                equipeOrigem: 'EFIS-03',
                grupoProcesso: 'PROCESSO ADMINISTRATIVO FISCAL',
                tipoProcesso: 'LANÇAMENTO DE OFÍCIO',
                subtipoProcesso: 'AUTO DE INFRAÇÃO',
                niContribuinte: '98.765.432/0001-10',
                nomeContribuinte: 'COMERCIAL BRASIL S.A.',
                equipeAtual: 'EFIS-03',
                unidadeAtual: 'DRF Rio de Janeiro',
                cpfResponsavel: '987.654.321-00',
                usuarioJuntada: 'OLIVEIRA, MARIA',
                tributoAct: '10 - IRPJ',
                assuntosObjetos: 'OMISSÃO DE RECEITAS',
                alegacoes: null,
                numeroDocPrincipal: 'AI-2020-005678',
                conteudo: null,
                arquivoIndexado: true,
                indicadorPesquisavel: false,
                indicadorOriginalPesquisavel: false
            },
            {
                id: '34567890',
                titulo: 'RECURSO VOLUNTÁRIO - PIS/COFINS',
                tipoDocumento: 'RECURSO',
                processo: '13502.901234/2021-56',
                dataAnexacao: '21/08/2021 07:00',
                dataProtocolo: '22/08/2021 08:30',
                dataJuntada: '25/08/2021 10:00',
                unidadeOrigem: 'CARF - 1ª Seção',
                equipeOrigem: 'TURMA-01',
                grupoProcesso: 'RECURSO VOLUNTÁRIO',
                tipoProcesso: 'RECURSO',
                subtipoProcesso: 'RECURSO VOLUNTÁRIO',
                niContribuinte: '55.444.333/0001-22',
                nomeContribuinte: 'INDÚSTRIA NACIONAL LTDA',
                equipeAtual: 'TURMA-02',
                unidadeAtual: 'CARF - 1ª Seção',
                cpfResponsavel: '555.444.333-22',
                usuarioJuntada: 'SANTOS, PEDRO',
                tributoAct: '34/35 - PIS/COFINS',
                assuntosObjetos: 'CREDITAMENTO INDEVIDO',
                alegacoes: 'Alega o contribuinte que os créditos foram tomados de acordo com a legislação vigente.',
                numeroDocPrincipal: 'RV-2021-009012',
                conteudo: 'O recurso voluntário interposto pelo contribuinte merece provimento parcial, conforme fundamentação a seguir.',
                arquivoIndexado: true,
                indicadorPesquisavel: true,
                indicadorOriginalPesquisavel: true
            },
            {
                id: '45678901',
                titulo: 'ACÓRDÃO - CSLL',
                tipoDocumento: 'ACÓRDÃO',
                processo: '10880.654321/2018-78',
                dataAnexacao: '04/11/2018 12:00',
                dataProtocolo: '05/11/2018 14:00',
                dataJuntada: '10/11/2018 09:45',
                unidadeOrigem: 'CARF - 2ª Seção',
                equipeOrigem: 'TURMA-03',
                grupoProcesso: 'JULGAMENTO',
                tipoProcesso: 'DECISÃO',
                subtipoProcesso: 'ACÓRDÃO',
                niContribuinte: '11.222.333/0001-44',
                nomeContribuinte: 'SERVIÇOS FINANCEIROS S.A.',
                equipeAtual: 'TURMA-03',
                unidadeAtual: 'CARF - 2ª Seção',
                cpfResponsavel: '111.222.333-44',
                usuarioJuntada: 'FERREIRA, ANA',
                tributoAct: '20 - CSLL',
                assuntosObjetos: 'BASE DE CÁLCULO',
                alegacoes: 'A base de cálculo foi apurada de forma incorreta pela fiscalização.',
                numeroDocPrincipal: 'AC-2018-003456',
                conteudo: null,
                arquivoIndexado: false,
                indicadorPesquisavel: false,
                indicadorOriginalPesquisavel: false
            },
            {
                id: '56789012',
                titulo: 'DESPACHO DECISÓRIO - IPI',
                tipoDocumento: 'DESPACHO',
                processo: '10768.112233/2022-90',
                dataAnexacao: '17/01/2022 15:00',
                dataProtocolo: '18/01/2022 16:30',
                dataJuntada: '20/01/2022 11:15',
                unidadeOrigem: 'DRF Belo Horizonte',
                equipeOrigem: 'EFIS-05',
                grupoProcesso: 'PROCESSO ADMINISTRATIVO',
                tipoProcesso: 'DESPACHO',
                subtipoProcesso: 'DESPACHO DECISÓRIO',
                niContribuinte: '77.888.999/0001-55',
                nomeContribuinte: 'METALÚRGICA MINAS GERAIS LTDA',
                equipeAtual: 'EFIS-06',
                unidadeAtual: 'DRF Belo Horizonte',
                cpfResponsavel: '777.888.999-55',
                usuarioJuntada: 'COSTA, CARLOS',
                tributoAct: '40 - IPI',
                assuntosObjetos: 'CLASSIFICAÇÃO FISCAL',
                alegacoes: null,
                numeroDocPrincipal: 'DD-2022-007890',
                conteudo: 'Pelo exposto, DEFIRO o pedido de reclassificação fiscal do produto NCM 7326.90.90.',
                arquivoIndexado: true,
                indicadorPesquisavel: true,
                indicadorOriginalPesquisavel: false
            }
        ];
    }
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

class KeyboardShortcuts {
    constructor(shortcuts) {
        this.shortcuts = shortcuts;
        this.init();
    }
    
    init() {
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
    }
    
    handleKeydown(e) {
        this.shortcuts.forEach(shortcut => {
            const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : true;
            const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
            const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
            
            if (ctrlMatch && shiftMatch && keyMatch) {
                e.preventDefault();
                shortcut.action();
            }
        });
    }
}

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Page Controller
    const pageController = new PageController();
    
    // Search (suporta múltiplos)
    const search = new SearchComponent();
    
    // Sidebar
    const sidebar = new SidebarComponent();
    
    // Accordions (Facetas)
    const facetAccordion = new AccordionComponent(CONFIG.selectors.facetTitle);
    
    // Dropdowns
    const downloadDropdown = new DropdownComponent('downloadDropdown', 'downloadDropdownBtn');
    const accessibilityDropdown = new DropdownComponent('accessibilityDropdown', 'accessibilityBtn');
    
    // Fechar dropdowns ao clicar fora
    document.addEventListener('click', () => DropdownComponent.closeAll());
    
    // Filter Counter - deve ser criado antes do dialog
    const filterCounter = new FilterCounterComponent('#filtersDialog');
    
    // Dialogs
    const filtersDialog = new DialogComponent('filtersDialog', {
        openBtnSelector: CONFIG.selectors.filterBtn,
        closeBtnId: 'filtersDialogCloseBtn',
        cancelBtnId: 'filtersDialogCancelBtn',
        clearBtnId: 'filtersDialogClearBtn',
        filterCounter: filterCounter
    });
    
    const infoDialog = new DialogComponent('infoDialog', {
        openBtnId: 'infoBtn',
        closeBtnId: 'infoDialogCloseBtn'
    });
    
    const ajudaDialog = new DialogComponent('ajudaDialog', {
        openBtnId: 'ajudaBtn',
        closeBtnId: 'ajudaDialogCloseBtn'
    });
    
    // Filter Operators (toggle contém/Não contém/Igual)
    const filterOperators = new FilterOperatorComponent();
    
    // Autocomplete para campos com badge AUTO
    const autocomplete = new AutocompleteComponent();
    
    // Currency Inputs (formatação de valores monetários)
    const currencyInputs = new CurrencyInputComponent();
    
    // Result Cards
    const resultCards = new ResultCardComponent();
    
    // Listener para evento de busca
    document.addEventListener('search', (e) => {
        const searchTerm = e.detail.term;
        
        // Atualizar termo de busca nos cards
        resultCards.setSearchTerm(searchTerm);
        
        // Renderizar resultados (mock por enquanto)
        resultCards.renderResults(ResultCardComponent.getMockResults());
        
        // Mostrar página de resultados
        pageController.showResults();
        
        // Atualizar contador de filtros
        filterCounter.updateCount();
        
        // Fechar dialog de filtros se estiver aberto
        filtersDialog.close();
    });
    
    // Botão Buscar do dialog de filtros também dispara busca
    const applyBtn = $('#filtersDialogApplyBtn');
    if (applyBtn) {
        applyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Pegar termo do input de busca do dialog
            const dialogSearchInput = $('#filtersDialog .searchInput');
            const searchTerm = dialogSearchInput?.value?.trim() || search.getSearchTerm();
            
            // Disparar evento de busca
            const event = new CustomEvent('search', { 
                detail: { term: searchTerm }
            });
            document.dispatchEvent(event);
        });
    }
    
    // Atalhos de teclado
    const shortcuts = new KeyboardShortcuts([
        {
            key: 'k',
            ctrl: true,
            action: () => filtersDialog.toggle()
        }
    ]);
});
