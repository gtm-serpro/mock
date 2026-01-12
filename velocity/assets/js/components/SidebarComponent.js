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
// SIDEBAR HEADER - Funcionalidades
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    
    // Elementos
    const btnExpandAll = document.querySelector('.btn-expand-all');
    const btnCollapseAll = document.querySelector('.btn-collapse-all');
    const facetFilter = document.querySelector('.facet-filter');
    const clearBtn = document.querySelector('.clear-btn');
    const facetGroups = document.querySelectorAll('.facetGroup');
    
    // Expandir todos os grupos
    btnExpandAll?.addEventListener('click', () => {
        facetGroups.forEach(group => {
            group.classList.add('open');
        });
    });
    
    // Recolher todos os grupos
    btnCollapseAll?.addEventListener('click', () => {
        facetGroups.forEach(group => {
            group.classList.remove('open');
        });
    });
    
    // Limpar campo de busca
    clearBtn?.addEventListener('click', () => {
        facetFilter.value = '';
        facetFilter.focus();
        filterFacets('');
    });
    
    // Filtrar facetas em tempo real
    facetFilter?.addEventListener('input', (e) => {
        filterFacets(e.target.value);
    });
    
    // Função para remover acentos
    function removeAccents(str) {
        return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    }
    
    // Função para destacar texto (ignorando acentos)
    function highlightText(text, term) {
        if (!term) return text;
        
        // Cria um array de caracteres do termo
        const termChars = term.split('');
        
        // Constrói regex que aceita versões com e sem acento de cada letra
        const pattern = termChars.map(char => {
            // Mapeia caracteres com suas variações acentuadas
            const accents = {
                'a': '[aáàâãäåāăą]',
                'e': '[eéèêëēėę]',
                'i': '[iíìîïīįı]',
                'o': '[oóòôõöøōő]',
                'u': '[uúùûüūůű]',
                'c': '[cçćč]',
                'n': '[nñń]',
            };
            
            const lowerChar = char.toLowerCase();
            return accents[lowerChar] || char.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        }).join('');
        
        const regex = new RegExp(`(${pattern})`, 'gi');
        return text.replace(regex, '<mark>$1</mark>');
    }
    
    // Função de filtro
    function filterFacets(searchTerm) {
        const term = removeAccents(searchTerm.toLowerCase().trim());
        
        facetGroups.forEach(group => {
            const titleSpan = group.querySelector('.facetTitle span');
            const titleText = titleSpan?.getAttribute('data-original-text') || titleSpan?.textContent || '';
            
            // Guarda texto original na primeira vez
            if (!titleSpan?.hasAttribute('data-original-text')) {
                titleSpan?.setAttribute('data-original-text', titleText);
            }
            
            const items = group.querySelectorAll('.facetText button');
            let hasVisibleItems = false;
            
            // Verifica se o título do grupo corresponde
            const titleMatches = term && removeAccents(titleText.toLowerCase()).includes(term);
            
            // Atualiza título com highlight
            if (titleSpan) {
                titleSpan.innerHTML = term ? highlightText(titleText, searchTerm.trim()) : titleText;
            }
            
            items.forEach(item => {
                const textSpan = item.querySelector('span:first-child');
                const originalText = textSpan?.getAttribute('data-original-text') || textSpan?.textContent || '';
                
                // Guarda texto original na primeira vez
                if (!textSpan?.hasAttribute('data-original-text')) {
                    textSpan?.setAttribute('data-original-text', originalText);
                }
                
                const matches = !term || removeAccents(originalText.toLowerCase()).includes(term) || titleMatches;
                
                // Atualiza texto com highlight
                if (textSpan) {
                    textSpan.innerHTML = term && matches ? highlightText(originalText, searchTerm.trim()) : originalText;
                }
                
                item.parentElement.style.display = matches ? '' : 'none';
                if (matches) hasVisibleItems = true;
            });
            
            // Mostra/oculta o grupo completo
            group.style.display = (hasVisibleItems || titleMatches) ? '' : 'none';
            
            // Expande grupos com resultados ao filtrar
            if (term && hasVisibleItems) {
                group.classList.add('open');
            }
        });
    }
    
    // Toggle de grupos (já existente, mantém compatibilidade)
    facetGroups.forEach(group => {
        const btn = group.querySelector('.facetTitle');
        btn?.addEventListener('click', () => {
            group.classList.toggle('open');
        });
    });
    
});
