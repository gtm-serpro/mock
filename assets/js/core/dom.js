// ============================================
// INICIALIZAÇÃO - CORRIGIDO FINAL
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    
    // Controllers
    const pageController = new PageController();
    
    // Components
    const search = new SearchComponent();
    const sidebar = new SidebarComponent();
    const facetAccordion = new AccordionComponent(CONFIG.selectors.facetTitle);
    
    // Dropdowns
    const downloadDropdown = new DropdownComponent('downloadDropdown', 'downloadDropdownBtn');
    const accessibilityDropdown = new DropdownComponent('accessibilityDropdown', 'accessibilityBtn');
    
    // Accessibility
    const accessibility = new AccessibilityComponent();

    // Fechar dropdowns ao clicar fora
    document.addEventListener('click', () => DropdownComponent.closeAll());
    
    // Filter Counter
    const filterCounter = new FilterCounterComponent('#filtersDialog');
    
    // Dialogs
    const filtersDialog = new DialogComponent('filtersDialog', {
        openBtnSelector: CONFIG.selectors.filterBtn,
        closeBtnId: 'filtersDialogCloseBtn',
        cancelBtnId: 'filtersDialogCancelBtn',
        clearBtnId: 'filtersDialogClearBtn',
        filterCounter: filterCounter
    });
    
    const infoDialog = new DialogComponent('infoDialog', {
        openBtnId: 'infoBtn',
        closeBtnId: 'infoDialogCloseBtn'
    });
    
    const ajudaDialog = new DialogComponent('ajudaDialog', {
        openBtnId: 'ajudaBtn',
        closeBtnId: 'ajudaDialogCloseBtn'
    });
    
    // Expor dialogs globalmente (para uso nos templates Velocity)
    window.openFiltersDialog = () => filtersDialog.open();
    window.closeFiltersDialog = () => filtersDialog.close();
    window.openInfoDialog = () => infoDialog.open();
    window.closeInfoDialog = () => infoDialog.close();
    window.openAjudaDialog = () => ajudaDialog.open();
    window.closeAjudaDialog = () => ajudaDialog.close();
    
    // Filter Components
    const filterOperators = new FilterOperatorComponent();
    const autocomplete = new AutocompleteComponent();
    const currencyInputs = new CurrencyInputComponent();
    
    // Result Cards
    const resultCards = new ResultCardComponent();
    
    // Fields Selector
    const fieldsSelector = new FieldsSelectorComponent({
        dropdownId: 'fieldsDropdown',
        buttonId: 'fieldsDropdownBtn',
        resultsContainerId: 'results'
    });
    
    resultCards.setFieldsSelector(fieldsSelector);
    
    // ========================================
    // Apply Button Handler - CORRIGIDO
    // ========================================
    const applyBtn = $('#filtersDialogApplyBtn');
    if (applyBtn) {
        applyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            
            // Buscar o valor do input de busca no dialog
            const dialogSearchInput = $('#filtersDialog .searchInput');
            const searchTerm = dialogSearchInput?.value?.trim() || search.getSearchTerm();
            
            // Se há termo de busca no dialog, sincronizar com outros inputs
            if (searchTerm) {
                search.syncSearchInputs(searchTerm);
            }
            
            // CRÍTICO: Chamar a função applyFilters() definida no filters_dialog.vm
            // Essa função constrói a URL com todos os filtros e navega
            if (typeof window.applyFilters === 'function') {
                window.applyFilters();
                // A função applyFilters() já faz window.location.href = url
                // Então não precisamos fazer mais nada aqui
            } else {
                console.error('❌ Função applyFilters() não encontrada. Verifique filters_dialog.vm');
                // Fallback: tentar submeter o form (não vai funcionar bem, mas é melhor que nada)
                const form = $('#filtersDialog form');
                if (form) {
                    form.submit();
                }
            }
            
            // Fechar dialog (a navegação vai acontecer de qualquer forma)
            filtersDialog.close();
        });
    }
    
    // Keyboard Shortcuts
    const shortcuts = new KeyboardShortcuts([
        {
            key: 'k',
            ctrl: true,
            action: () => filtersDialog.toggle()
        }
    ]);
    
    // Link "Saiba mais" na tela vazia também abre o dialog de ajuda
    const emptyHelpLink = $('#emptyHelpLink');
    if (emptyHelpLink) {
        emptyHelpLink.addEventListener('click', (e) => {
            e.preventDefault();
            ajudaDialog.open();
        });
    }
    
    // Botão de ajuda no empty state
    const ajudaBtnEmpty = $('#ajudaBtnEmpty');
    if (ajudaBtnEmpty) {
        ajudaBtnEmpty.addEventListener('click', (e) => {
            e.preventDefault();
            ajudaDialog.open();
        });
    }
    
    // Verificar se estamos na página vazia (sem resultados)
    const hasResults = document.querySelectorAll('.result-card').length > 0;
    
    // Se não há resultados E não há query na URL, abrir filtros automaticamente
    if (!hasResults) {
        const urlParams = new URLSearchParams(window.location.search);
        const hasQuery = urlParams.has('q') || urlParams.has('busca') || urlParams.has('search');
        
        if (!hasQuery) {
            // Pequeno delay para garantir que a página carregou
            setTimeout(() => {
                filtersDialog.open();
            }, 300);
        }
    }
    
    // Live Highlight nos resultados - SEMPRE inicializar
    new LiveHighlightComponent();
    
    // Aplicar visibilidade de campos ao carregar
    fieldsSelector.refresh();
});

// ============================================
// FUNÇÕES GLOBAIS
// ============================================

function clearHeaderSearch() {
    const input = document.getElementById('headerSearchInput');
    if (input) {
        input.value = '';
        input.closest('.searchInputWraper')?.classList.remove('hasValue');
    }
}

function clearEmptySearch() {
    const input = document.getElementById('emptySearchInput');
    if (input) {
        input.value = '';
        input.closest('.searchInputWraper')?.classList.remove('hasValue');
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        const toast = document.querySelector('.copy-toast');
        if (toast) {
            toast.textContent = 'Copiado!';
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2000);
        }
    }).catch(err => {
        console.error('Erro ao copiar:', err);
    });
}

// Expor globalmente
window.clearHeaderSearch = clearHeaderSearch;
window.clearEmptySearch = clearEmptySearch;
window.copyToClipboard = copyToClipboard;