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
        contains: { label: 'contém', class: 'contains' },
        'not-contains': { label: 'não contém', class: 'not-contains' },
        equals: { label: 'igual', class: 'equals' }
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
        
        // Placeholder responsivo (com debounce)
        window.addEventListener('resize', debounce(() => this.updatePlaceholders(), 100));
    }
    
    clear(index) {
        const input = this.inputs[index];
        const wrapper = this.wrappers[index];
        if (input && wrapper) {
            input.value = '';
            wrapper.classList.remove('hasValue');
            input.focus();
        }
    }
    
    updatePlaceholders() {
        const placeholder = window.innerWidth <= CONFIG.breakpoints.mobile 
            ? 'Buscar...' 
            : 'Digite para buscar...';
        
        this.inputs.forEach(input => {
            if (input) input.placeholder = placeholder;
        });
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
        
        if (this.sidebar) {
            this.init();
        }
    }
    
    init() {
        this.bindToggleEvents();
        this.bindResizerEvents();
        this.updateResizerPosition();
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
        this.resizer.addEventListener('touchstart', (e) => this.startResize(e));
        document.addEventListener('touchmove', (e) => this.resizeTouch(e));
        document.addEventListener('touchend', () => this.stopResize());
        
        // Double-click reset
        this.resizer.addEventListener('dblclick', () => this.resetWidth());
        
        // Window resize (com debounce)
        window.addEventListener('resize', debounce(() => this.updateResizerPosition(), 100));
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
        this.isResizing = true;
        this.resizer.classList.add('dragging');
        document.body.classList.add('resizing');
        e.preventDefault();
    }
    
    resize(e) {
        if (!this.isResizing) return;
        this.setWidth(e.clientX);
    }
    
    resizeTouch(e) {
        if (!this.isResizing) return;
        this.setWidth(e.touches[0].clientX);
    }
    
    setWidth(width) {
        const { minWidth, maxWidth } = CONFIG.sidebar;
        if (width >= minWidth && width <= maxWidth) {
            this.sidebar.style.width = `${width}px`;
            this.updateResizerPosition();
        }
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
        this.updateResizerPosition();
    }
    
    updateResizerPosition() {
        if (this.resizer) {
            const sidebarWidth = this.sidebar.offsetWidth;
            this.resizer.style.left = `${sidebarWidth - 4}px`;
        }
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
        
        // Limpar input de busca do header do dialog
        this.dialog.querySelectorAll('.searchInput').forEach(input => {
            input.value = '';
        });
        
        // Resetar todos os operadores para "contém"
        this.dialog.querySelectorAll('.filter-input-group').forEach(group => {
            const opBtn = group.querySelector('.filter-operator');
            if (opBtn) {
                opBtn.dataset.operator = 'contains';
                opBtn.textContent = 'contém';
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
            'contains': 'contém',
            'not-contains': 'não contém',
            'equals': 'igual'
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
        this.renderSuggestions(input, list, fieldName, input.value);
        input.closest('.filter-autocomplete').classList.add('open');
        input.setAttribute('aria-expanded', 'true');
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
    
    // Dialogs
    const filtersDialog = new DialogComponent('filtersDialog', {
        openBtnSelector: CONFIG.selectors.filterBtn,
        closeBtnId: 'filtersDialogCloseBtn',
        cancelBtnId: 'filtersDialogCancelBtn',
        clearBtnId: 'filtersDialogClearBtn'
    });
    
    const infoDialog = new DialogComponent('infoDialog', {
        openBtnId: 'infoBtn',
        closeBtnId: 'infoDialogCloseBtn'
    });
    
    const ajudaDialog = new DialogComponent('ajudaDialog', {
        openBtnId: 'ajudaBtn',
        closeBtnId: 'ajudaDialogCloseBtn'
    });
    
    // Filter Operators (toggle contém/não contém/igual)
    const filterOperators = new FilterOperatorComponent();
    
    // Autocomplete para campos com badge AUTO
    const autocomplete = new AutocompleteComponent();
    
    // Currency Inputs (formatação de valores monetários)
    const currencyInputs = new CurrencyInputComponent();
    
    // Atalhos de teclado
    const shortcuts = new KeyboardShortcuts([
        {
            key: 'k',
            ctrl: true,
            action: () => filtersDialog.toggle()
        }
    ]);
});