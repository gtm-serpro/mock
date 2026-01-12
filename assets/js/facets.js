document.addEventListener('DOMContentLoaded', () => {
    // adicionar tooltips
    document.querySelectorAll('.facets-title').forEach(title => {
        title.setAttribute('title', title.textContent);
    });
    document.querySelectorAll('.facet-label').forEach(label => {
        label.setAttribute('title', label.textContent);
    });

    // toggle individual
    document.querySelectorAll('.facets-header').forEach(header => {
        header.addEventListener('click', () => {
            const group = header.closest('.facets-group');
            if (group) {
                group.classList.toggle('collapsed');
            }
        });
    });

    // expandir todos
    document.querySelector('.btn-expand-all')?.addEventListener('click', () => {
        document.querySelectorAll('.facets-group').forEach(group => {
            group.classList.remove('collapsed');
        });
    });

    // recolher todos
    document.querySelector('.btn-collapse-all')?.addEventListener('click', () => {
        document.querySelectorAll('.facets-group').forEach(group => {
            group.classList.add('collapsed');
        });
    });

    // filtro de facetas
    const filterInput = document.querySelector('.facet-filter');
    
    filterInput?.addEventListener('input', () => {
        const query = removeAccents(filterInput.value.toLowerCase().trim());
        
        document.querySelectorAll('.facets-group').forEach(group => {
            const title = group.querySelector('.facets-title');
            const originalTitle = title.dataset.original || title.textContent;
            const normalizedTitle = removeAccents(originalTitle.toLowerCase());
            
            // guardar título original
            if (!title.dataset.original) {
                title.dataset.original = originalTitle;
            }
            
            const titleMatches = query && normalizedTitle.includes(query);
            
            // highlight no título
            if (!query) {
                title.innerHTML = originalTitle;
            } else if (titleMatches) {
                title.innerHTML = highlightMatch(originalTitle, query);
            } else {
                title.innerHTML = originalTitle;
            }
            
            const facetItems = group.querySelectorAll('.facet-item');
            let hasItemMatch = false;
            
            facetItems.forEach(item => {
                const label = item.querySelector('.facet-label');
                const originalText = label.dataset.original || label.textContent;
                const normalizedText = removeAccents(originalText.toLowerCase());
                
                // guardar texto original
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
            
            if (query && groupHasMatch) {
                group.classList.remove('collapsed');
            }
        });
    });

    // clear button do filtro
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