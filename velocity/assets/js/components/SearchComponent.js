// ============================================
// SEARCH COMPONENT - CORRIGIDO FINAL
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
        // Sincronizar inputs enquanto digita
        this.inputs.forEach((input, index) => {
            const wrapper = this.wrappers[index];
            if (input && wrapper) {
                input.addEventListener('input', () => {
                    wrapper.classList.toggle('hasValue', input.value.length > 0);
                    this.syncSearchInputs(input.value);
                });
            }
        });
        
        // Botões de limpar
        this.closeBtns.forEach((btn, index) => {
            if (btn) btn.addEventListener('click', (e) => { 
                e.preventDefault(); 
                this.clear(index); 
            });
        });
        
        // ========================================
        // CRÍTICO: NÃO PREVENIR SUBMIT
        // ========================================
        // O form já tem action="#url_for_home" e method="GET"
        // Deixar ele submeter naturalmente
        this.forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                // Validação básica
                const input = form.querySelector('.searchInput');
                const searchTerm = input?.value?.trim() || '';
                
                // Se vazio, prevenir e focar
                if (!searchTerm) {
                    e.preventDefault();
                    input?.focus();
                    return;
                }
                
                // Sincronizar todos os inputs antes de submeter
                this.syncSearchInputs(searchTerm);
                
                // Dispatch evento para analytics/logging (opcional)
                const event = new CustomEvent('search', { 
                    detail: { term: searchTerm } 
                });
                document.dispatchEvent(event);
                
                // NÃO prevenir submit - deixar navegação acontecer naturalmente
                // O form vai submeter para: /solr/CORE/browse?q=termo
            });
        });
        
        // Atualizar placeholders no resize
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
    
    setSearchTerm(term) {
        this.syncSearchInputs(term);
    }
}