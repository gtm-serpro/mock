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