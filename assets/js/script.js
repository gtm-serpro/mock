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
        searchInput: '.searchInput',
        searchWrapper: '.searchInputWraper',
        searchCloseBtn: '.searchCloseBtn',
        sidebar: '#sidebar',
        sidebarBtn: '#sidebarBtn',
        sidebarResizer: '#sidebarResizer',
        sidebarOverlay: '#sidebarOverlay',
        facetTitle: '.facetTitle',
        facetGroup: '.facetGroup',
        filtersDialog: '#filtersDialog',
        filterBtn: '.filterBtn',
        infoDialog: '#infoDialog',
        ajudaDialog: '#ajudaDialog',
        filterInputGroup: '.filter-input-group',
        filterOperator: '.filter-operator'
    }
};

// ============================================
// UTILITIES
// ============================================

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

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
        if (this.inputs.length > 0) this.init();
    }
    
    init() {
        this.bindEvents();
        this.updatePlaceholders();
    }
    
    bindEvents() {
        this.inputs.forEach((input, index) => {
            const wrapper = this.wrappers[index];
            if (input && wrapper) {
                input.addEventListener('input', () => {
                    wrapper.classList.toggle('hasValue', input.value.length > 0);
                    this.syncSearchInputs(input.value);
                });
            }
        });
        
        this.closeBtns.forEach((btn, index) => {
            if (btn) btn.addEventListener('click', (e) => { e.preventDefault(); this.clear(index); });
        });
        
        this.forms.forEach(form => {
            form.addEventListener('submit', (e) => { e.preventDefault(); this.performSearch(); });
        });
        
        window.addEventListener('resize', debounce(() => this.updatePlaceholders(), 100));
    }
    
    syncSearchInputs(value) {
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
            this.syncSearchInputs('');
        }
    }
    
    performSearch() {
        const searchTerm = this.inputs[0]?.value?.trim() || '';
        const event = new CustomEvent('search', { detail: { term: searchTerm } });
        document.dispatchEvent(event);
    }
    
    updatePlaceholders() {
        const placeholder = window.innerWidth <= CONFIG.breakpoints.mobile ? 'Buscar...' : 'Digite para buscar...';
        this.inputs.forEach(input => { if (input) input.placeholder = placeholder; });
    }
    
    getSearchTerm() { return this.inputs[0]?.value?.trim() || ''; }
}

// ============================================
// PAGE CONTROLLER
// ============================================

class PageController {
    constructor() {
        this.body = document.body;
        this.isEmptyState = this.body.classList.contains('empty-state');
    }
    showResults() { this.body.classList.remove('empty-state'); this.isEmptyState = false; }
    showEmpty() { this.body.classList.add('empty-state'); this.isEmptyState = true; }
    toggle() { this.isEmptyState ? this.showResults() : this.showEmpty(); }
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
        if (this.sidebar) this.init();
    }
    
    init() {
        this.bindToggleEvents();
        this.bindResizerEvents();
    }
    
    bindToggleEvents() {
        if (this.toggleBtn) this.toggleBtn.addEventListener('click', () => this.toggle());
        if (this.overlay) this.overlay.addEventListener('click', () => this.close());
    }
    
    bindResizerEvents() {
        if (!this.resizer) return;
        this.resizer.addEventListener('mousedown', (e) => this.startResize(e));
        document.addEventListener('mousemove', (e) => this.resize(e));
        document.addEventListener('mouseup', () => this.stopResize());
        this.resizer.addEventListener('touchstart', (e) => this.startResize(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.resizeTouch(e), { passive: false });
        document.addEventListener('touchend', () => this.stopResize());
        this.resizer.addEventListener('dblclick', () => this.resetWidth());
    }
    
    toggle() { this.sidebar.classList.toggle('open'); this.overlay?.classList.toggle('open'); }
    close() { this.sidebar.classList.remove('open'); this.overlay?.classList.remove('open'); }
    
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
        this.setWidth(this.startWidth + diff);
    }
    
    resizeTouch(e) {
        if (!this.isResizing) return;
        e.preventDefault();
        const currentX = e.touches[0].clientX;
        this.setWidth(this.startWidth + (currentX - this.startX));
    }
    
    setWidth(width) {
        const { minWidth, maxWidth } = CONFIG.sidebar;
        this.sidebar.style.width = `${Math.max(minWidth, Math.min(maxWidth, width))}px`;
    }
    
    stopResize() {
        if (this.isResizing) {
            this.isResizing = false;
            this.resizer?.classList.remove('dragging');
            document.body.classList.remove('resizing');
        }
    }
    
    resetWidth() { this.sidebar.style.width = `${CONFIG.sidebar.defaultWidth}px`; }
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
                trigger.closest(CONFIG.selectors.facetGroup)?.classList.toggle('open');
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
        if (this.dropdown && this.button) this.init();
    }
    init() {
        this.button.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeOthers();
            this.toggle();
        });
    }
    toggle() { this.dropdown.classList.toggle('open'); }
    close() { this.dropdown.classList.remove('open'); }
    closeOthers() {
        $$('[id$="Dropdown"].open').forEach(el => { if (el !== this.dropdown) el.classList.remove('open'); });
    }
    static closeAll() { $$('[id$="Dropdown"].open').forEach(el => el.classList.remove('open')); }
}

// ============================================
// FILTER COUNTER COMPONENT
// ============================================

class FilterCounterComponent {
    constructor(dialogSelector) {
        this.dialog = $(dialogSelector);
        this.badges = $$('.filtersUsedNumbers');
        this.filterCount = 0;
        if (this.dialog) this.init();
    }
    
    init() {
        this.dialog.querySelectorAll('.filter-input').forEach(input => {
            input.addEventListener('input', () => this.updateCount());
            input.addEventListener('change', () => this.updateCount());
        });
        this.dialog.addEventListener('close', () => this.updateCount());
        this.updateCount();
    }
    
    updateCount() {
        let count = 0;
        this.dialog.querySelectorAll('.filter-input-group .filter-input').forEach(input => {
            if (input.value.trim()) count++;
        });
        this.dialog.querySelectorAll('.filter-date-range').forEach(range => {
            if (Array.from(range.querySelectorAll('input[type="date"]')).some(input => input.value)) count++;
        });
        this.dialog.querySelectorAll('.filter-value-range').forEach(range => {
            if (Array.from(range.querySelectorAll('.filter-input')).some(input => input.value.trim())) count++;
        });
        this.filterCount = count;
        this.updateBadges();
    }
    
    updateBadges() {
        this.badges.forEach(badge => {
            if (this.filterCount > 0) { badge.textContent = this.filterCount; badge.style.display = 'flex'; }
            else { badge.textContent = ''; badge.style.display = 'none'; }
        });
    }
    
    getCount() { return this.filterCount; }
    reset() { this.filterCount = 0; this.updateBadges(); }
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
        if (this.dialog) this.init();
    }
    
    init() {
        if (this.openBtnId) {
            $(`#${this.openBtnId}`)?.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); this.open(); });
        }
        if (this.openBtnSelector) {
            $$(this.openBtnSelector).forEach(btn => {
                btn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); this.open(); });
            });
        }
        if (this.closeBtnId) {
            $(`#${this.closeBtnId}`)?.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); this.close(); });
        }
        if (this.cancelBtnId) {
            $(`#${this.cancelBtnId}`)?.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); this.close(); });
        }
        if (this.clearBtnId) {
            $(`#${this.clearBtnId}`)?.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); this.clearFilters(); });
        }
        this.dialog.addEventListener('click', (e) => { if (e.target === this.dialog) this.close(); });
        this.dialog.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.close(); });
    }
    
    open() { this.dialog.showModal(); }
    close() { this.dialog.close(); }
    toggle() { this.dialog.open ? this.close() : this.open(); }
    
    clearFilters() {
        this.dialog.querySelectorAll('.filter-input').forEach(input => input.value = '');
        this.dialog.querySelectorAll('input[type="date"]').forEach(input => input.value = '');
        this.dialog.querySelectorAll('.searchInput').forEach(input => input.value = '');
        this.dialog.querySelectorAll('.filter-input-group').forEach(group => {
            const opBtn = group.querySelector('.filter-operator');
            if (opBtn) {
                opBtn.dataset.operator = 'contains';
                opBtn.textContent = 'Contém';
                opBtn.classList.remove('not-contains', 'equals');
                opBtn.classList.add('contains');
            }
            group.classList.remove('has-operator', 'operator-contains', 'operator-not-contains', 'operator-equals');
        });
        this.dialog.querySelectorAll('.filter-autocomplete.open').forEach(ac => ac.classList.remove('open'));
        if (this.filterCounter) this.filterCounter.updateCount();
    }
}

// ============================================
// FILTER OPERATOR COMPONENT
// ============================================

class FilterOperatorComponent {
    constructor() {
        this.groups = $$(CONFIG.selectors.filterInputGroup);
        this.operators = ['contains', 'not-contains', 'equals'];
        this.labels = { 'contains': 'Contém', 'not-contains': 'Não contém', 'equals': 'Igual' };
        if (this.groups.length > 0) this.init();
    }
    
    init() {
        this.groups.forEach(group => {
            const input = group.querySelector('.filter-input');
            const opBtn = group.querySelector('.filter-operator');
            if (!input || !opBtn) return;
            
            input.addEventListener('focus', () => this.showOperator(group, opBtn));
            input.addEventListener('blur', () => {
                setTimeout(() => {
                    if (!input.value.trim() && !opBtn.matches(':hover')) this.hideOperator(group, opBtn);
                }, 150);
            });
            input.addEventListener('input', () => {
                if (input.value.trim()) this.showOperator(group, opBtn);
                else if (!input.matches(':focus')) this.hideOperator(group, opBtn);
            });
            opBtn.addEventListener('click', (e) => {
                e.preventDefault(); e.stopPropagation();
                this.cycleOperator(group, opBtn);
                input.focus();
            });
        });
    }
    
    showOperator(group, opBtn) {
        group.classList.add('has-operator');
        this.updateOperatorClass(group, opBtn.dataset.operator || 'contains');
    }
    hideOperator(group) {
        group.classList.remove('has-operator', 'operator-contains', 'operator-not-contains', 'operator-equals');
    }
    updateOperatorClass(group, operator) {
        group.classList.remove('operator-contains', 'operator-not-contains', 'operator-equals');
        group.classList.add(`operator-${operator}`);
    }
    cycleOperator(group, opBtn) {
        const current = opBtn.dataset.operator || 'contains';
        const next = this.operators[(this.operators.indexOf(current) + 1) % this.operators.length];
        opBtn.dataset.operator = next;
        opBtn.textContent = this.labels[next];
        opBtn.classList.remove('contains', 'not-contains', 'equals');
        opBtn.classList.add(next);
        this.updateOperatorClass(group, next);
    }
}

// ============================================
// AUTOCOMPLETE COMPONENT
// ============================================

class AutocompleteComponent {
    constructor() {
        this.mockData = {
            'grupo_processo': ['Processo Administrativo Fiscal', 'Processo de Restituição', 'Processo de Compensação', 'Processo de Ressarcimento', 'Processo de Revisão', 'Processo de Consulta'],
            'tipo_processo': ['Recurso Voluntário', 'Recurso de Ofício', 'Recurso Especial', 'Embargos de Declaração', 'Manifestação de Inconformidade', 'Impugnação'],
            'subtipo_processo': ['IRPJ - Lucro Real', 'IRPJ - Lucro Presumido', 'CSLL', 'PIS/COFINS', 'IPI', 'Contribuições Previdenciárias'],
            'situacao_documento': ['Em Análise', 'Julgado', 'Pendente de Diligência', 'Aguardando Distribuição', 'Em Pauta', 'Arquivado'],
            'tipo_documento': ['Acórdão', 'Decisão', 'Despacho', 'Auto de Infração', 'Intimação', 'Petição', 'Recurso', 'Parecer'],
            'tributo_act': ['IRPJ', 'CSLL', 'PIS', 'COFINS', 'IPI', 'IRRF', 'IOF', 'Contribuição Previdenciária'],
            'unidade_origem': ['DRF São Paulo', 'DRF Rio de Janeiro', 'DRF Belo Horizonte', 'DRF Brasília', 'DRF Curitiba', 'DRF Porto Alegre', 'DRF Salvador', 'DRF Recife'],
            'equipe_origem': ['EQMAF01', 'EQMAF02', 'EQCAC01', 'EQCAC02', 'EQFIS01', 'EQFIS02', 'EQREV01'],
            'unidade_atual': ['CARF - 1ª Seção', 'CARF - 2ª Seção', 'CARF - 3ª Seção', 'DRJ São Paulo', 'DRJ Brasília', 'DRJ Rio de Janeiro', 'CSRF'],
            'equipe_atual': ['1ª Turma Ordinária', '2ª Turma Ordinária', '3ª Turma Ordinária', '1ª Turma Especial', '2ª Turma Especial', 'Turma Superior'],
            'alegacoes_recurso': ['Decadência', 'Prescrição', 'Nulidade do Auto de Infração', 'Cerceamento de Defesa', 'Erro na Apuração', 'Divergência Jurisprudencial', 'Inconstitucionalidade']
        };
        this.activeAutocomplete = null;
        this.highlightedIndex = -1;
        this.init();
    }
    
    init() {
        const autoFields = $$('.filter-field');
        this.debouncedFilter = debounce((input, list, fieldName) => this.filterSuggestions(input, list, fieldName), 100);
        
        autoFields.forEach(field => {
            const badge = field.querySelector('.filter-badge');
            if (!badge || badge.textContent.trim() !== 'AUTO') return;
            const inputGroup = field.querySelector('.filter-input-group');
            const input = inputGroup?.querySelector('.filter-input');
            if (!input || !inputGroup) return;
            const fieldName = input.dataset.field;
            if (!fieldName || !this.mockData[fieldName]) return;
            
            const listId = `autocomplete-${fieldName}-${Date.now()}`;
            inputGroup.classList.add('filter-autocomplete');
            const list = document.createElement('ul');
            list.className = 'filter-autocomplete-list';
            list.id = listId;
            list.setAttribute('role', 'listbox');
            inputGroup.appendChild(list);
            
            input.setAttribute('role', 'combobox');
            input.setAttribute('aria-autocomplete', 'list');
            input.setAttribute('aria-expanded', 'false');
            input.setAttribute('aria-controls', listId);
            
            input.addEventListener('focus', () => this.showSuggestions(input, list, fieldName));
            input.addEventListener('input', () => this.debouncedFilter(input, list, fieldName));
            input.addEventListener('blur', () => this.hideSuggestions(input, list));
            input.addEventListener('keydown', (e) => this.handleKeydown(e, input, list));
        });
        
        document.addEventListener('click', (e) => { if (!e.target.closest('.filter-autocomplete')) this.closeAll(); });
    }
    
    showSuggestions(input, list, fieldName) {
        this.activeAutocomplete = { input, list, fieldName };
        this.highlightedIndex = -1;
        const container = input.closest('.filter-autocomplete');
        this.updateDropdownPosition(input, container);
        this.renderSuggestions(input, list, fieldName, input.value);
        container.classList.add('open');
        input.setAttribute('aria-expanded', 'true');
    }
    
    updateDropdownPosition(input, container) {
        const dialogMain = input.closest('#filtersDialog main');
        if (!dialogMain) { container.classList.remove('open-up'); return; }
        const inputRect = input.getBoundingClientRect();
        const mainRect = dialogMain.getBoundingClientRect();
        container.classList.toggle('open-up', (mainRect.bottom - inputRect.bottom) < 208);
    }
    
    hideSuggestions(input, list) {
        setTimeout(() => {
            list.closest('.filter-autocomplete')?.classList.remove('open');
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
        const filtered = data.filter(item => this.normalizeText(item).includes(normalizedQuery));
        list.innerHTML = '';
        
        if (filtered.length === 0) {
            const empty = document.createElement('li');
            empty.className = 'filter-autocomplete-empty';
            empty.textContent = 'Nenhum resultado encontrado';
            list.appendChild(empty);
            return;
        }
        
        filtered.forEach((item, index) => {
            const li = document.createElement('li');
            li.id = `${list.id}-item-${index}`;
            li.className = 'filter-autocomplete-item';
            li.setAttribute('role', 'option');
            li.dataset.value = item;
            li.innerHTML = query ? this.highlightMatch(item, query) : item;
            li.addEventListener('mousedown', (e) => { e.preventDefault(); this.selectItem(input, list, item); });
            li.addEventListener('mouseenter', () => this.highlightItem(input, list, index));
            list.appendChild(li);
        });
    }
    
    highlightMatch(text, query) {
        const normalizedText = this.normalizeText(text);
        const normalizedQuery = this.normalizeText(query);
        const matchIndex = normalizedText.indexOf(normalizedQuery);
        if (matchIndex === -1) return text;
        
        const charMap = [];
        for (let i = 0; i < text.length; i++) {
            if (this.normalizeText(text[i]).length > 0) charMap.push(i);
        }
        const startOriginal = charMap[matchIndex] ?? 0;
        const endOriginal = charMap[matchIndex + normalizedQuery.length] ?? text.length;
        return `${text.substring(0, startOriginal)}<mark>${text.substring(startOriginal, endOriginal)}</mark>${text.substring(endOriginal)}`;
    }
    
    normalizeText(text) { return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
    
    selectItem(input, list, value) {
        input.value = value;
        input.setAttribute('aria-expanded', 'false');
        list.closest('.filter-autocomplete')?.classList.remove('open');
        input.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    highlightItem(input, list, index) {
        list.querySelectorAll('.filter-autocomplete-item').forEach((item, i) => {
            const isHighlighted = i === index;
            item.classList.toggle('highlighted', isHighlighted);
            item.setAttribute('aria-selected', isHighlighted);
            if (isHighlighted && item.id) input.setAttribute('aria-activedescendant', item.id);
        });
        this.highlightedIndex = index;
    }
    
    handleKeydown(e, input, list) {
        const items = list.querySelectorAll('.filter-autocomplete-item');
        if (!list.closest('.filter-autocomplete')?.classList.contains('open') || items.length === 0) return;
        
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
                    this.selectItem(input, list, items[this.highlightedIndex].dataset.value);
                }
                break;
            case 'Escape':
                e.preventDefault();
                input.setAttribute('aria-expanded', 'false');
                list.closest('.filter-autocomplete')?.classList.remove('open');
                break;
        }
    }
    
    closeAll() {
        $$('.filter-autocomplete.open').forEach(el => {
            el.classList.remove('open');
            el.querySelector('input')?.setAttribute('aria-expanded', 'false');
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
        if (this.inputs.length > 0) this.init();
    }
    
    init() {
        this.inputs.forEach(input => {
            input.addEventListener('input', () => this.formatCurrency(input));
            input.addEventListener('keypress', (e) => {
                if (!/[0-9,.]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                    e.preventDefault();
                }
            });
            input.addEventListener('blur', () => this.formatCurrency(input));
        });
    }
    
    formatCurrency(input) {
        let value = input.value.replace(/\D/g, '');
        if (value === '') { input.value = ''; return; }
        input.value = (parseInt(value, 10) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
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
        this.fieldsSelector = null;
        if (this.resultsContainer) this.init();
    }
    
    init() { this.createToast(); this.bindCopyEvents(); }
    setFieldsSelector(selector) { this.fieldsSelector = selector; }
    
    createToast() {
        this.toast = document.createElement('div');
        this.toast.className = 'copy-toast';
        this.toast.textContent = 'Copiado!';
        document.body.appendChild(this.toast);
    }
    
    bindCopyEvents() {
        this.resultsContainer.addEventListener('click', (e) => {
            const field = e.target.closest('.result-field');
            if (field) this.copyFieldValue(field);
        });
    }
    
    copyFieldValue(field) {
        const valueElement = field.querySelector('.result-field-value span');
        if (!valueElement) return;
        navigator.clipboard.writeText(valueElement.textContent)
            .then(() => this.showToast('Copiado!'))
            .catch(() => this.showToast('Erro ao copiar'));
    }
    
    showToast(message) {
        this.toast.textContent = message;
        this.toast.classList.add('show');
        setTimeout(() => this.toast.classList.remove('show'), 2000);
    }
    
    setSearchTerm(term) { this.searchTerm = term; }
    
    highlightText(text, term) {
        if (!term || !text) return text;
        const normalizedText = this.normalizeText(text);
        const normalizedTerm = this.normalizeText(term);
        if (!normalizedTerm) return text;
        const matchIndex = normalizedText.indexOf(normalizedTerm);
        if (matchIndex === -1) return text;
        
        const charMap = [];
        for (let i = 0; i < text.length; i++) {
            if (this.normalizeText(text[i]).length > 0) charMap.push(i);
        }
        const startOriginal = charMap[matchIndex] ?? 0;
        const endOriginal = charMap[matchIndex + normalizedTerm.length] ?? text.length;
        return `${text.substring(0, startOriginal)}<mark>${text.substring(startOriginal, endOriginal)}</mark>${text.substring(endOriginal)}`;
    }
    
    normalizeText(text) { return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
    
    renderResults(results) {
        this.resultsContainer.innerHTML = '';
        results.forEach(result => this.resultsContainer.appendChild(this.createCard(result)));
        if (this.fieldsSelector) this.fieldsSelector.refresh();
    }
    
    getDownloadType(data) {
        if (!data.arquivoIndexado) return 'disabled';
        if (data.indicadorPesquisavel && !data.indicadorOriginalPesquisavel) return 'dual';
        if (!data.indicadorPesquisavel && !data.indicadorOriginalPesquisavel) return 'original';
        if (data.indicadorPesquisavel && data.indicadorOriginalPesquisavel) return 'searchable';
        return 'original';
    }
    
    createDownloadButtons(data) {
        const downloadType = this.getDownloadType(data);
        const baseUrl = 'https://eprocesso.suiterfb.receita.fazenda/eprocesso/api/documentos/';
        const id = data.id || '';
        const pdfUrl = `${baseUrl}${id}/obterbinario/download`;
        const pdfOcrUrl = `${baseUrl}${id}/obterbinarioocr/download`;
        
        switch (downloadType) {
            case 'dual':
                return `<div class="btn-group"><a href="${pdfUrl}" class="btn-download" title="Baixar PDF Original" target="_blank"><img class="icon-default iconColor" src="assets/img/icons/file-image-regular-full.svg" alt=""><img class="icon-hover iconColor" src="assets/img/icons/download-solid-full.svg" alt=""></a><a href="${pdfOcrUrl}" class="btn-download" title="Baixar PDF Pesquisável (OCR)" target="_blank"><img class="icon-default iconColorGreen" src="assets/img/icons/file-lines-regular-full.svg" alt=""><img class="icon-hover iconColor" src="assets/img/icons/download-solid-full.svg" alt=""></a></div>`;
            case 'original':
                return `<div class="btn-group"><a href="${pdfUrl}" class="btn-download btn-download-single" title="Baixar PDF Original" target="_blank"><img class="icon-default iconColor" src="assets/img/icons/file-image-regular-full.svg" alt=""><img class="icon-hover iconColor" src="assets/img/icons/download-solid-full.svg" alt=""></a></div>`;
            case 'searchable':
                return `<div class="btn-group"><a href="${pdfUrl}" class="btn-download btn-download-single" title="Baixar PDF" target="_blank"><img class="icon-default iconColor iconColorGreen" src="assets/img/icons/file-lines-regular-full.svg" alt=""><img class="icon-hover iconColor" src="assets/img/icons/download-solid-full.svg" alt=""></a></div>`;
            default:
                return `<div class="btn-group"><span class="btn-download btn-download-disabled" title="PDF não disponível"><img class="iconColor" src="assets/img/icons/file-excel-regular-full.svg" alt=""></span></div>`;
        }
    }
    
    createCard(data) {
        const card = document.createElement('article');
        card.className = 'result-card';
        if (data.id) card.id = `doc-${data.id}`;
        
        const header = document.createElement('header');
        header.className = 'result-card-header';
        const actions = document.createElement('div');
        actions.className = 'result-card-actions';
        actions.innerHTML = this.createDownloadButtons(data);
        const title = document.createElement('h3');
        title.className = 'result-card-title';
        let titleText = data.tipoDocumento || 'Documento';
        if (data.titulo) titleText += ` - ${data.titulo}`;
        title.innerHTML = this.highlightText(titleText, this.searchTerm);
        header.appendChild(actions);
        header.appendChild(title);
        
        const body = document.createElement('div');
        body.className = 'result-card-body';
        
        const fields = [
            { label: 'Número do Processo', value: data.processo, field: 'processo' },
            { label: 'Data Anexação', value: data.dataAnexacao, field: 'data-anexacao' },
            { label: 'Data Protocolo', value: data.dataProtocolo, field: 'data-protocolo' },
            { label: 'Data Juntada', value: data.dataJuntada, field: 'data-juntada' },
            { label: 'Unidade Origem', value: data.unidadeOrigem, field: 'unidade-origem' },
            { label: 'Equipe Origem', value: data.equipeOrigem, field: 'equipe-origem' },
            { label: 'Tipo Documento', value: data.tipoDocumento, field: 'tipo-documento' },
            { label: 'Título', value: data.titulo, field: 'titulo' },
            { label: 'Grupo Processo', value: data.grupoProcesso, field: 'grupo-processo' },
            { label: 'Tipo Processo', value: data.tipoProcesso, field: 'tipo-processo' },
            { label: 'Subtipo Processo', value: data.subtipoProcesso, field: 'subtipo-processo' },
            { label: 'NI Contribuinte', value: data.niContribuinte, field: 'ni-contribuinte' },
            { label: 'Nome Contribuinte', value: data.nomeContribuinte, field: 'nome-contribuinte' },
            { label: 'Equipe Atual', value: data.equipeAtual, field: 'equipe-atual' },
            { label: 'Unidade Atual', value: data.unidadeAtual, field: 'unidade-atual' },
            { label: 'CPF Responsável', value: data.cpfResponsavel, field: 'cpf-responsavel' },
            { label: 'Usuário Juntada', value: data.usuarioJuntada, field: 'usuario-juntada' },
            { label: 'Tributo ACT', value: data.tributoAct, field: 'tributo-act' },
            { label: 'Assuntos/Objetos', value: data.assuntosObjetos, field: 'assuntos-objetos' },
            { label: 'Alegações', value: data.alegacoes, field: 'alegacoes' },
            { label: 'Nr Doc Principal', value: data.numeroDocPrincipal, field: 'numero-doc-principal' }
        ];
        
        fields.forEach(f => { if (f.value) body.appendChild(this.createField(f.label, f.value, f.field)); });
        
        card.appendChild(header);
        card.appendChild(body);
        
        if (this.searchTerm && data.conteudo) card.appendChild(this.createSnippet(data.conteudo));
        
        return card;
    }
    
    createField(label, value, fieldName) {
        const field = document.createElement('div');
        field.className = 'result-field';
        field.dataset.field = fieldName;
        field.title = 'Clique para copiar';
        field.innerHTML = `<dt class="result-field-label">${label}</dt><dd class="result-field-value"><span>${this.highlightText(value, this.searchTerm)}</span><img class="result-field-copy iconColor" src="assets/img/icons/copy-regular-full.svg" alt="Copiar"></dd>`;
        return field;
    }
    
    createSnippet(conteudo) {
        const snippet = document.createElement('div');
        snippet.className = 'result-card-snippet';
        snippet.innerHTML = `<dt class="result-snippet-label">Trecho:</dt><dd class="result-snippet-value">${this.highlightText(conteudo, this.searchTerm)}</dd>`;
        return snippet;
    }
    
    static getMockResults() {
        return [
            { id: '12345678', titulo: 'NOTIFICAÇÃO DE LANÇAMENTO - COFINS', tipoDocumento: 'NOTIFICAÇÃO', processo: '10580.350820/2019-34', dataAnexacao: '14/05/2019 16:00', dataProtocolo: '15/05/2019 09:15', dataJuntada: '20/05/2019 14:30', unidadeOrigem: 'DRF São Paulo', equipeOrigem: 'EFIS-01', grupoProcesso: 'PROCESSO TRIBUTÁRIO', tipoProcesso: 'LANÇAMENTO DE OFÍCIO', subtipoProcesso: 'AUTO DE INFRAÇÃO', niContribuinte: '12.345.678/0001-99', nomeContribuinte: 'EMPRESA EXEMPLO LTDA', equipeAtual: 'EFIS-02', unidadeAtual: 'DRF São Paulo', cpfResponsavel: '123.456.789-00', usuarioJuntada: 'SILVA, JOÃO', tributoAct: '35 - COFINS', assuntosObjetos: 'GLOSA DE CRÉDITOS', alegacoes: null, numeroDocPrincipal: 'NL-2019-001234', conteudo: 'O contribuinte deixou de recolher a COFINS devida no período de apuração, conforme demonstrado nos autos.', arquivoIndexado: true, indicadorPesquisavel: true, indicadorOriginalPesquisavel: false },
            { id: '23456789', titulo: 'AUTO DE INFRAÇÃO - IRPJ', tipoDocumento: 'AUTO DE INFRAÇÃO', processo: '10580.720145/2020-12', dataAnexacao: '09/03/2020 10:00', dataProtocolo: '10/03/2020 11:45', dataJuntada: '15/03/2020 16:20', unidadeOrigem: 'DRF Rio de Janeiro', equipeOrigem: 'EFIS-03', grupoProcesso: 'PROCESSO ADMINISTRATIVO FISCAL', tipoProcesso: 'LANÇAMENTO DE OFÍCIO', subtipoProcesso: 'AUTO DE INFRAÇÃO', niContribuinte: '98.765.432/0001-10', nomeContribuinte: 'COMERCIAL BRASIL S.A.', equipeAtual: 'EFIS-03', unidadeAtual: 'DRF Rio de Janeiro', cpfResponsavel: '987.654.321-00', usuarioJuntada: 'OLIVEIRA, MARIA', tributoAct: '10 - IRPJ', assuntosObjetos: 'OMISSÃO DE RECEITAS', alegacoes: null, numeroDocPrincipal: 'AI-2020-005678', conteudo: null, arquivoIndexado: true, indicadorPesquisavel: false, indicadorOriginalPesquisavel: false },
            { id: '34567890', titulo: 'RECURSO VOLUNTÁRIO - PIS/COFINS', tipoDocumento: 'RECURSO', processo: '13502.901234/2021-56', dataAnexacao: '21/08/2021 07:00', dataProtocolo: '22/08/2021 08:30', dataJuntada: '25/08/2021 10:00', unidadeOrigem: 'CARF - 1ª Seção', equipeOrigem: 'TURMA-01', grupoProcesso: 'RECURSO VOLUNTÁRIO', tipoProcesso: 'RECURSO', subtipoProcesso: 'RECURSO VOLUNTÁRIO', niContribuinte: '55.444.333/0001-22', nomeContribuinte: 'INDÚSTRIA NACIONAL LTDA', equipeAtual: 'TURMA-02', unidadeAtual: 'CARF - 1ª Seção', cpfResponsavel: '555.444.333-22', usuarioJuntada: 'SANTOS, PEDRO', tributoAct: '34/35 - PIS/COFINS', assuntosObjetos: 'CREDITAMENTO INDEVIDO', alegacoes: 'Alega o contribuinte que os créditos foram tomados de acordo com a legislação vigente.', numeroDocPrincipal: 'RV-2021-009012', conteudo: 'O recurso voluntário interposto pelo contribuinte merece provimento parcial, conforme fundamentação a seguir.', arquivoIndexado: true, indicadorPesquisavel: true, indicadorOriginalPesquisavel: true },
            { id: '45678901', titulo: 'ACÓRDÃO - CSLL', tipoDocumento: 'ACÓRDÃO', processo: '10880.654321/2018-78', dataAnexacao: '04/11/2018 12:00', dataProtocolo: '05/11/2018 14:00', dataJuntada: '10/11/2018 09:45', unidadeOrigem: 'CARF - 2ª Seção', equipeOrigem: 'TURMA-03', grupoProcesso: 'JULGAMENTO', tipoProcesso: 'DECISÃO', subtipoProcesso: 'ACÓRDÃO', niContribuinte: '11.222.333/0001-44', nomeContribuinte: 'SERVIÇOS FINANCEIROS S.A.', equipeAtual: 'TURMA-03', unidadeAtual: 'CARF - 2ª Seção', cpfResponsavel: '111.222.333-44', usuarioJuntada: 'FERREIRA, ANA', tributoAct: '20 - CSLL', assuntosObjetos: 'BASE DE CÁLCULO', alegacoes: 'A base de cálculo foi apurada de forma incorreta pela fiscalização.', numeroDocPrincipal: 'AC-2018-003456', conteudo: null, arquivoIndexado: false, indicadorPesquisavel: false, indicadorOriginalPesquisavel: false },
            { id: '56789012', titulo: 'DESPACHO DECISÓRIO - IPI', tipoDocumento: 'DESPACHO', processo: '10768.112233/2022-90', dataAnexacao: '17/01/2022 15:00', dataProtocolo: '18/01/2022 16:30', dataJuntada: '20/01/2022 11:15', unidadeOrigem: 'DRF Belo Horizonte', equipeOrigem: 'EFIS-05', grupoProcesso: 'PROCESSO ADMINISTRATIVO', tipoProcesso: 'DESPACHO', subtipoProcesso: 'DESPACHO DECISÓRIO', niContribuinte: '77.888.999/0001-55', nomeContribuinte: 'METALÚRGICA MINAS GERAIS LTDA', equipeAtual: 'EFIS-06', unidadeAtual: 'DRF Belo Horizonte', cpfResponsavel: '777.888.999-55', usuarioJuntada: 'COSTA, CARLOS', tributoAct: '40 - IPI', assuntosObjetos: 'CLASSIFICAÇÃO FISCAL', alegacoes: null, numeroDocPrincipal: 'DD-2022-007890', conteudo: 'Pelo exposto, DEFIRO o pedido de reclassificação fiscal do produto NCM 7326.90.90.', arquivoIndexado: true, indicadorPesquisavel: true, indicadorOriginalPesquisavel: false }
        ];
    }
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

class KeyboardShortcuts {
    constructor(shortcuts) { this.shortcuts = shortcuts; this.init(); }
    init() { document.addEventListener('keydown', (e) => this.handleKeydown(e)); }
    handleKeydown(e) {
        this.shortcuts.forEach(shortcut => {
            const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : true;
            const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
            if (ctrlMatch && shiftMatch && e.key.toLowerCase() === shortcut.key.toLowerCase()) {
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
    const pageController = new PageController();
    const search = new SearchComponent();
    const sidebar = new SidebarComponent();
    const facetAccordion = new AccordionComponent(CONFIG.selectors.facetTitle);
    const downloadDropdown = new DropdownComponent('downloadDropdown', 'downloadDropdownBtn');
    const accessibilityDropdown = new DropdownComponent('accessibilityDropdown', 'accessibilityBtn');
    
    document.addEventListener('click', () => DropdownComponent.closeAll());
    
    const filterCounter = new FilterCounterComponent('#filtersDialog');
    
    const filtersDialog = new DialogComponent('filtersDialog', {
        openBtnSelector: CONFIG.selectors.filterBtn,
        closeBtnId: 'filtersDialogCloseBtn',
        cancelBtnId: 'filtersDialogCancelBtn',
        clearBtnId: 'filtersDialogClearBtn',
        filterCounter: filterCounter
    });
    
    const infoDialog = new DialogComponent('infoDialog', { openBtnId: 'infoBtn', closeBtnId: 'infoDialogCloseBtn' });
    const ajudaDialog = new DialogComponent('ajudaDialog', { openBtnId: 'ajudaBtn', closeBtnId: 'ajudaDialogCloseBtn' });
    
    const filterOperators = new FilterOperatorComponent();
    const autocomplete = new AutocompleteComponent();
    const currencyInputs = new CurrencyInputComponent();
    const resultCards = new ResultCardComponent();
    
    // Fields Selector - Seletor de campos visíveis
    const fieldsSelector = new FieldsSelectorComponent({
        dropdownId: 'fieldsDropdown',
        buttonId: 'fieldsDropdownBtn',
        resultsContainerId: 'results'
    });
    
    resultCards.setFieldsSelector(fieldsSelector);
    
    document.addEventListener('search', (e) => {
        const searchTerm = e.detail.term;
        resultCards.setSearchTerm(searchTerm);
        resultCards.renderResults(ResultCardComponent.getMockResults());
        pageController.showResults();
        filterCounter.updateCount();
        filtersDialog.close();
    });
    
    const applyBtn = $('#filtersDialogApplyBtn');
    if (applyBtn) {
        applyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const dialogSearchInput = $('#filtersDialog .searchInput');
            const searchTerm = dialogSearchInput?.value?.trim() || search.getSearchTerm();
            document.dispatchEvent(new CustomEvent('search', { detail: { term: searchTerm } }));
        });
    }
    
    const shortcuts = new KeyboardShortcuts([{ key: 'k', ctrl: true, action: () => filtersDialog.toggle() }]);
});
