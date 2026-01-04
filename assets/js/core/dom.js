// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    const pageController = new PageController();
    const search = new SearchComponent();
    const sidebar = new SidebarComponent();
    const facetAccordion = new AccordionComponent(CONFIG.selectors.facetTitle);
    const downloadDropdown = new DropdownComponent('downloadDropdown', 'downloadDropdownBtn');
    const accessibilityDropdown = new DropdownComponent('accessibilityDropdown', 'accessibilityBtn');
    
    document.addEventListener('click', () => DropdownComponent.closeAll());
    
    const filterCounter = new FilterCounterComponent('#filtersDialog');
    
    const filtersDialog = new DialogComponent('filtersDialog', {
        openBtnSelector: CONFIG.selectors.filterBtn,
        closeBtnId: 'filtersDialogCloseBtn',
        cancelBtnId: 'filtersDialogCancelBtn',
        clearBtnId: 'filtersDialogClearBtn',
        filterCounter: filterCounter
    });
    
    const infoDialog = new DialogComponent('infoDialog', { openBtnId: 'infoBtn', closeBtnId: 'infoDialogCloseBtn' });
    const ajudaDialog = new DialogComponent('ajudaDialog', { openBtnId: 'ajudaBtn', closeBtnId: 'ajudaDialogCloseBtn' });
    
    const filterOperators = new FilterOperatorComponent();
    const autocomplete = new AutocompleteComponent();
    const currencyInputs = new CurrencyInputComponent();
    const resultCards = new ResultCardComponent();
    
    // Fields Selector - Seletor de campos visíveis
    const fieldsSelector = new FieldsSelectorComponent({
        dropdownId: 'fieldsDropdown',
        buttonId: 'fieldsDropdownBtn',
        resultsContainerId: 'results'
    });
    
    resultCards.setFieldsSelector(fieldsSelector);
    
    document.addEventListener('search', (e) => {
        const searchTerm = e.detail.term;
        resultCards.setSearchTerm(searchTerm);
        resultCards.renderResults(ResultCardComponent.getMockResults());
        pageController.showResults();
        filterCounter.updateCount();
        filtersDialog.close();
    });
    
    const applyBtn = $('#filtersDialogApplyBtn');
    if (applyBtn) {
        applyBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const dialogSearchInput = $('#filtersDialog .searchInput');
            const searchTerm = dialogSearchInput?.value?.trim() || search.getSearchTerm();
            document.dispatchEvent(new CustomEvent('search', { detail: { term: searchTerm } }));
        });
    }
    
    const shortcuts = new KeyboardShortcuts([{ key: 'k', ctrl: true, action: () => filtersDialog.toggle() }]);
});