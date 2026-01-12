// ============================================
// CONFIGURAÇÃO
// ============================================

const CONFIG = {
    breakpoints: {
        mobile: 600,
        tablet: 800
    },
    sidebar: {
        defaultWidth: 250,
        minWidth: 10,
        maxWidth: 1000
    },
    operators: {
        contains: { label: 'Contém', class: 'contains' },
        'not-contains': { label: 'Não contém', class: 'not-contains' },
        equals: { label: 'Igual', class: 'equals' }
    },
    selectors: {
        searchInput: '.searchInput',
        searchWrapper: '.searchInputWraper',
        searchCloseBtn: '.searchCloseBtn',
        sidebar: '#sidebar',
        sidebarBtn: '#sidebarBtn',
        sidebarResizer: '#sidebarResizer',
        sidebarOverlay: '#sidebarOverlay',
        facetTitle: '.facetTitle',
        facetGroup: '.facetGroup',
        filtersDialog: '#filtersDialog',
        filterBtn: '.filterBtn',
        infoDialog: '#infoDialog',
        ajudaDialog: '#ajudaDialog',
        filterInputGroup: '.filter-input-group',
        filterOperator: '.filter-operator'
    }
};