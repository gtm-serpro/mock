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