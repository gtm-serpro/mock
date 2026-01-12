// ============================================
// AUTOCOMPLETE COMPONENT - SEM MOCK
// ============================================

class AutocompleteComponent {
    constructor() {
        // Configuração da API do Solr
        this.solrConfig = {
            baseUrl: window.SOLR_CONFIG?.baseUrl || '/solr/seu-core',
            suggestHandler: '/suggest'
        };
        
        this.activeAutocomplete = null;
        this.highlightedIndex = -1;
        this.cache = {}; // Cache de sugestões
        this.init();
    }
    
    init() {
        const autoFields = $$('.filter-field');
        this.debouncedFilter = debounce((input, list, fieldName) => this.filterSuggestions(input, list, fieldName), 300);
        
        autoFields.forEach(field => {
            const badge = field.querySelector('.filter-badge');
            if (!badge || badge.textContent.trim() !== 'AUTO') return;
            
            const inputGroup = field.querySelector('.filter-input-group');
            const input = inputGroup?.querySelector('.filter-input');
            if (!input || !inputGroup) return;
            
            const fieldName = input.dataset.field;
            if (!fieldName) return;
            
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
        
        document.addEventListener('click', (e) => { 
            if (!e.target.closest('.filter-autocomplete')) this.closeAll(); 
        });
    }
    
    /**
     * Buscar sugestões do Solr via API
     */
    async fetchSuggestions(fieldName, query) {
        // Verificar cache
        const cacheKey = `${fieldName}:${query}`;
        if (this.cache[cacheKey]) {
            return this.cache[cacheKey];
        }
        
        try {
            // Usar Terms Component do Solr para autocompletar
            const url = `${this.solrConfig.baseUrl}/terms?terms.fl=${fieldName}&terms.prefix=${encodeURIComponent(query)}&terms.limit=20&wt=json`;
            
            const response = await fetch(url);
            if (!response.ok) throw new Error('Solr request failed');
            
            const data = await response.json();
            
            // Parse resposta do Solr Terms
            // Formato: {terms: {campo: [termo1, count1, termo2, count2, ...]}}
            const terms = data.terms?.[fieldName] || [];
            const suggestions = [];
            
            // Extrair apenas os termos (ignora counts)
            for (let i = 0; i < terms.length; i += 2) {
                suggestions.push(terms[i]);
            }
            
            // Cachear resultado
            this.cache[cacheKey] = suggestions;
            
            return suggestions;
        } catch (error) {
            console.error('Erro ao buscar sugestões do Solr:', error);
            return [];
        }
    }
    
    async showSuggestions(input, list, fieldName) {
        this.activeAutocomplete = { input, list, fieldName };
        this.highlightedIndex = -1;
        
        const container = input.closest('.filter-autocomplete');
        this.updateDropdownPosition(input, container);
        
        const query = input.value.trim();
        await this.renderSuggestions(input, list, fieldName, query);
        
        container.classList.add('open');
        input.setAttribute('aria-expanded', 'true');
    }
    
    updateDropdownPosition(input, container) {
        const dialogMain = input.closest('#filtersDialog main');
        if (!dialogMain) { 
            container.classList.remove('open-up'); 
            return; 
        }
        
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
    
    async filterSuggestions(input, list, fieldName) {
        this.highlightedIndex = -1;
        input.removeAttribute('aria-activedescendant');
        await this.renderSuggestions(input, list, fieldName, input.value);
    }
    
    async renderSuggestions(input, list, fieldName, query) {
        list.innerHTML = '<li class="filter-autocomplete-loading">Carregando...</li>';
        
        const normalizedQuery = this.normalizeText(query);
        
        // Buscar do Solr
        const data = await this.fetchSuggestions(fieldName, query);
        
        // Filtrar localmente (case-insensitive + sem acentos)
        const filtered = data.filter(item => 
            this.normalizeText(item).includes(normalizedQuery)
        );
        
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
            
            li.addEventListener('mousedown', (e) => { 
                e.preventDefault(); 
                this.selectItem(input, list, item); 
            });
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
    
    normalizeText(text) { 
        return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); 
    }
    
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
            if (isHighlighted && item.id) {
                input.setAttribute('aria-activedescendant', item.id);
            }
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
