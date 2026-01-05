// ============================================
// INICIALIZAÇÃO
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
    
    // Search Event Handler
    document.addEventListener('search', (e) => {
        const searchTerm = e.detail.term;
        resultCards.setSearchTerm(searchTerm);
        resultCards.renderResults(ResultCardComponent.getMockResults());
        pageController.showResults();
        filterCounter.updateCount();
        filtersDialog.close();
    });
    
    // Apply Button Handler
    const applyBtn = $('#filtersDialogApplyBtn');
    if (applyBtn) {
        applyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const dialogSearchInput = $('#filtersDialog .searchInput');
            const searchTerm = dialogSearchInput?.value?.trim() || search.getSearchTerm();
            document.dispatchEvent(new CustomEvent('search', { detail: { term: searchTerm } }));
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

    // Abrir dialog de filtros automaticamente se estiver no empty state (sem busca na URL)
    const urlParams = new URLSearchParams(window.location.search);
    const hasBusca = urlParams.has('q') || urlParams.has('busca') || urlParams.has('search');

    if (pageController.isEmptyState && !hasBusca) {
        filtersDialog.open();
    }

    
});

// Funções globais usadas nos templates Velocity
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
        // Mostrar toast de confirmação
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