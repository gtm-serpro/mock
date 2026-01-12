// ============================================
// RESULT HIGHLIGHT COMPONENT
// Aplica highlight nos cards de resultado
// usando a mesma lógica do filtro de facetas
// ============================================

class ResultHighlightComponent {
    constructor() {
        this.init();
    }
    
    init() {
        // Buscar query atual da URL ou do SOLR_CONFIG
        const query = this.getSearchQuery();
        
        if (!query || query === '*:*') return;
        
        // Aplicar highlight em todos os campos marcados
        this.applyHighlightToResults(query);
    }
    
    getSearchQuery() {
        // Tentar pegar do SOLR_CONFIG primeiro
        if (typeof SOLR_CONFIG !== 'undefined' && SOLR_CONFIG.currentQuery) {
            return SOLR_CONFIG.currentQuery;
        }
        
        // Fallback: pegar da URL
        const params = new URLSearchParams(window.location.search);
        return params.get('q') || '';
    }
    
    applyHighlightToResults(query) {
        // Normalizar query (remover acentos)
        const normalizedQuery = this.removeAccents(query.toLowerCase().trim());
        
        // Pegar todos os elementos que devem ter highlight
        const highlightElements = document.querySelectorAll('[data-highlight-field]');
        
        highlightElements.forEach(element => {
            const originalText = element.textContent;
            
            // Aplicar highlight
            const highlightedText = this.highlightMatch(originalText, normalizedQuery);
            
            // Só atualizar se houve mudança
            if (highlightedText !== originalText) {
                element.innerHTML = highlightedText;
            }
        });
    }
    
    removeAccents(str) {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    
    highlightMatch(text, query) {
        const normalizedText = this.removeAccents(text.toLowerCase());
        const index = normalizedText.indexOf(query);
        
        if (index === -1) return text;
        
        const before = text.slice(0, index);
        const match = text.slice(index, index + query.length);
        const after = text.slice(index + query.length);
        
        return before + '<mark>' + match + '</mark>' + this.highlightMatch(after, query);
    }
}