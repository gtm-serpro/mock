// ============================================
// LIVE HIGHLIGHT COMPONENT
// Aplica highlight em tempo real enquanto digita no search
// ============================================

class LiveHighlightComponent {
    constructor() {
        // Aguardar DOM
        setTimeout(() => this.init(), 0);
    }
    
    init() {
        // Buscar inputs por classe
        const searchInputs = document.querySelectorAll('input.searchInput[name="q"]');
        
        if (searchInputs.length === 0) {
            return;
        }
        
        // Aplicar highlight inicial da URL
        this.applyInitialHighlight();
        
        // Adicionar listener em TODOS os inputs de busca
        searchInputs.forEach((input) => {
            input.addEventListener('input', (e) => {
                this.applyLiveHighlight(e.target.value);
            });
        });
    }
    
    // Coletar elementos DINAMICAMENTE (não no constructor)
    collectHighlightableElements() {
        const elements = [];
        const originalTexts = new Map();
        
        // Título dos cards
        document.querySelectorAll('.result-card-title').forEach(el => {
            originalTexts.set(el, el.textContent);
            elements.push(el);
        });
        
        // Campos com data-highlight-field
        document.querySelectorAll('[data-highlight-field]').forEach(el => {
            originalTexts.set(el, el.textContent);
            elements.push(el);
        });
        
        // Todos os .result-field-value span
        document.querySelectorAll('.result-field-value span').forEach(el => {
            originalTexts.set(el, el.textContent);
            elements.push(el);
        });
        
        return { elements, originalTexts };
    }
    
    applyInitialHighlight() {
        const query = this.getSearchQuery();
        
        if (query && query !== '*:*') {
            this.applyLiveHighlight(query);
        }
    }
    
    getSearchQuery() {
        // Tentar pegar do SOLR_CONFIG
        if (typeof SOLR_CONFIG !== 'undefined' && SOLR_CONFIG.currentQuery) {
            return SOLR_CONFIG.currentQuery;
        }
        
        // Fallback: pegar da URL
        const params = new URLSearchParams(window.location.search);
        return params.get('q') || '';
    }
    
    applyLiveHighlight(query) {
        const trimmedQuery = query.trim();
        
        // Coletar elementos AGORA (dinamicamente)
        const { elements, originalTexts } = this.collectHighlightableElements();
        
        // Se vazio, limpar highlights
        if (!trimmedQuery) {
            elements.forEach(element => {
                const originalText = originalTexts.get(element);
                if (originalText) {
                    element.textContent = originalText;
                }
            });
            return;
        }
        
        // Se não há elementos, não fazer nada
        if (elements.length === 0) {
            return;
        }
        
        // Normalizar query
        const normalizedQuery = this.removeAccents(trimmedQuery.toLowerCase());
        
        // Aplicar highlight
        elements.forEach(element => {
            const originalText = originalTexts.get(element);
            if (!originalText) return;
            
            const highlightedText = this.highlightMatch(originalText, normalizedQuery);
            element.innerHTML = highlightedText;
        });
    }
    
    removeAccents(str) {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    
    highlightMatch(text, query) {
        const normalizedText = this.removeAccents(text.toLowerCase());
        const matchIndex = normalizedText.indexOf(query);
        
        if (matchIndex === -1) return this.escapeHtml(text);
        
        // Criar mapa de índices considerando caracteres especiais
        const charMap = [];
        for (let i = 0; i < text.length; i++) {
            if (this.removeAccents(text[i]).length > 0) {
                charMap.push(i);
            }
        }
        
        const startOriginal = charMap[matchIndex] ?? 0;
        const endOriginal = charMap[matchIndex + query.length] ?? text.length;
        
        return this.escapeHtml(text.substring(0, startOriginal)) + 
               '<mark>' + this.escapeHtml(text.substring(startOriginal, endOriginal)) + '</mark>' + 
               this.highlightMatch(text.substring(endOriginal), query);
    }
    
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}