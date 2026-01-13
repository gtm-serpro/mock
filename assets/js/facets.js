document.addEventListener('DOMContentLoaded', () => {
    // Adicionar tooltips
    document.querySelectorAll('.facetTitle').forEach(title => {
        const span = title.querySelector('span');
        if (span) title.setAttribute('title', span.textContent);
    });
    
    document.querySelectorAll('.facetLabel').forEach(label => {
        label.setAttribute('title', label.textContent);
    });

    // Toggle individual (click no título)
    document.querySelectorAll('.facetTitle').forEach(title => {
        title.addEventListener('click', () => {
            const group = title.closest('.facetGroup');
            if (group) {
                group.classList.toggle('open');
            }
        });
    });

    // Expandir todos
    document.querySelector('.btn-expand-all')?.addEventListener('click', () => {
        document.querySelectorAll('.facetGroup').forEach(group => {
            group.classList.add('open');
        });
    });

    // Recolher todos
    document.querySelector('.btn-collapse-all')?.addEventListener('click', () => {
        document.querySelectorAll('.facetGroup').forEach(group => {
            group.classList.remove('open');
        });
    });

    // Filtro de facetas
    const filterInput = document.querySelector('.facet-filter');
    
    filterInput?.addEventListener('input', () => {
        const query = removeAccents(filterInput.value.toLowerCase().trim());
        
        document.querySelectorAll('.facetGroup').forEach(group => {
            const titleSpan = group.querySelector('.facetTitle span');
            const originalTitle = titleSpan.dataset.original || titleSpan.textContent;
            const normalizedTitle = removeAccents(originalTitle.toLowerCase());
            
            // Guardar título original
            if (!titleSpan.dataset.original) {
                titleSpan.dataset.original = originalTitle;
            }
            
            const titleMatches = query && normalizedTitle.includes(query);
            
            // Highlight no título
            if (!query) {
                titleSpan.innerHTML = originalTitle;
            } else if (titleMatches) {
                titleSpan.innerHTML = highlightMatch(originalTitle, query);
            } else {
                titleSpan.innerHTML = originalTitle;
            }
            
            const facetItems = group.querySelectorAll('.facetItem');
            let hasItemMatch = false;
            
            facetItems.forEach(item => {
                const label = item.querySelector('.facetLabel');
                const originalText = label.dataset.original || label.textContent;
                const normalizedText = removeAccents(originalText.toLowerCase());
                
                // Guardar texto original
                if (!label.dataset.original) {
                    label.dataset.original = originalText;
                }
                
                if (!query) {
                    label.innerHTML = originalText;
                    item.style.display = '';
                    hasItemMatch = true;
                } else if (titleMatches) {
                    label.innerHTML = originalText;
                    item.style.display = '';
                    hasItemMatch = true;
                } else if (normalizedText.includes(query)) {
                    label.innerHTML = highlightMatch(originalText, query);
                    item.style.display = '';
                    hasItemMatch = true;
                } else {
                    item.style.display = 'none';
                }
            });
            
            const groupHasMatch = titleMatches || hasItemMatch;
            group.style.display = groupHasMatch ? '' : 'none';
            
            // Expandir grupos com match
            if (query && groupHasMatch) {
                group.classList.add('open');
            }
        });
    });

    // Clear button do filtro
    const filterWrapper = filterInput?.closest('.search-input-wrapper');
    const clearBtn = filterWrapper?.querySelector('.clear-btn');
    
    if (filterInput && clearBtn) {
        filterInput.addEventListener('input', () => {
            clearBtn.style.display = filterInput.value ? 'flex' : 'none';
        });
        
        clearBtn.addEventListener('click', () => {
            filterInput.value = '';
            clearBtn.style.display = 'none';
            filterInput.dispatchEvent(new Event('input'));
            filterInput.focus();
        });
    }
});

function removeAccents(str) {
    return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

function highlightMatch(text, query) {
    const normalizedText = removeAccents(text.toLowerCase());
    const index = normalizedText.indexOf(query);
    
    if (index === -1) return text;
    
    const before = text.slice(0, index);
    const match = text.slice(index, index + query.length);
    const after = text.slice(index + query.length);
    
    return before + '<mark>' + match + '</mark>' + highlightMatch(after, query);
}