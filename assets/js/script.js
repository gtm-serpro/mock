/* ============================================
   EPROCESSO BUSCADOR - JavaScript
   ============================================ */

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
    selectors: {
        // Search
        searchInput: '.searchInput',
        searchWrapper: '.searchInputWraper',
        searchCloseBtn: '.searchCloseBtn',
        
        // Sidebar
        sidebar: '#sidebar',
        sidebarBtn: '#sidebarBtn',
        sidebarResizer: '#sidebarResizer',
        sidebarOverlay: '#sidebarOverlay',
        
        // Facets
        facetTitle: '.facetTitle',
        facetGroup: '.facetGroup',
        
        // Dialogs
        filtersDialog: '#filtersDialog',
        filterBtn: '.filterBtn', // Pode ter múltiplos
        infoDialog: '#infoDialog',
        ajudaDialog: '#ajudaDialog'
    }
};

// ============================================
// UTILITIES
// ============================================

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => document.querySelectorAll(selector);

// ============================================
// SEARCH COMPONENT
// ============================================

class SearchComponent {
    constructor() {
        this.inputs = $$(CONFIG.selectors.searchInput);
        this.wrappers = $$(CONFIG.selectors.searchWrapper);
        this.closeBtns = $$(CONFIG.selectors.searchCloseBtn);
        
        if (this.inputs.length > 0) {
            this.init();
        }
    }
    
    init() {
        this.bindEvents();
        this.updatePlaceholders();
    }
    
    bindEvents() {
        // Toggle classe hasValue para cada input
        this.inputs.forEach((input, index) => {
            const wrapper = this.wrappers[index];
            if (input && wrapper) {
                input.addEventListener('input', () => {
                    wrapper.classList.toggle('hasValue', input.value.length > 0);
                });
            }
        });
        
        // Botões limpar
        this.closeBtns.forEach((btn, index) => {
            if (btn) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.clear(index);
                });
            }
        });
        
        // Placeholder responsivo
        window.addEventListener('resize', () => this.updatePlaceholders());
    }
    
    clear(index) {
        const input = this.inputs[index];
        const wrapper = this.wrappers[index];
        if (input && wrapper) {
            input.value = '';
            wrapper.classList.remove('hasValue');
            input.focus();
        }
    }
    
    updatePlaceholders() {
        const placeholder = window.innerWidth <= CONFIG.breakpoints.mobile 
            ? 'Buscar...' 
            : 'Digite para buscar...';
        
        this.inputs.forEach(input => {
            if (input) input.placeholder = placeholder;
        });
    }
}

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
        
        if (this.sidebar) {
            this.init();
        }
    }
    
    init() {
        this.bindToggleEvents();
        this.bindResizerEvents();
        this.updateResizerPosition();
    }
    
    bindToggleEvents() {
        if (this.toggleBtn) {
            this.toggleBtn.addEventListener('click', () => this.toggle());
        }
        
        if (this.overlay) {
            this.overlay.addEventListener('click', () => this.close());
        }
    }
    
    bindResizerEvents() {
        if (!this.resizer) return;
        
        // Mouse events
        this.resizer.addEventListener('mousedown', (e) => this.startResize(e));
        document.addEventListener('mousemove', (e) => this.resize(e));
        document.addEventListener('mouseup', () => this.stopResize());
        
        // Touch events
        this.resizer.addEventListener('touchstart', (e) => this.startResize(e));
        document.addEventListener('touchmove', (e) => this.resizeTouch(e));
        document.addEventListener('touchend', () => this.stopResize());
        
        // Double-click reset
        this.resizer.addEventListener('dblclick', () => this.resetWidth());
        
        // Window resize
        window.addEventListener('resize', () => this.updateResizerPosition());
    }
    
    toggle() {
        this.sidebar.classList.toggle('open');
        this.overlay?.classList.toggle('open');
    }
    
    close() {
        this.sidebar.classList.remove('open');
        this.overlay?.classList.remove('open');
    }
    
    startResize(e) {
        this.isResizing = true;
        this.resizer.classList.add('dragging');
        document.body.classList.add('resizing');
        e.preventDefault();
    }
    
    resize(e) {
        if (!this.isResizing) return;
        this.setWidth(e.clientX);
    }
    
    resizeTouch(e) {
        if (!this.isResizing) return;
        this.setWidth(e.touches[0].clientX);
    }
    
    setWidth(width) {
        const { minWidth, maxWidth } = CONFIG.sidebar;
        if (width >= minWidth && width <= maxWidth) {
            this.sidebar.style.width = `${width}px`;
            this.updateResizerPosition();
        }
    }
    
    stopResize() {
        if (this.isResizing) {
            this.isResizing = false;
            this.resizer?.classList.remove('dragging');
            document.body.classList.remove('resizing');
        }
    }
    
    resetWidth() {
        this.sidebar.style.width = `${CONFIG.sidebar.defaultWidth}px`;
        this.updateResizerPosition();
    }
    
    updateResizerPosition() {
        if (this.resizer) {
            const sidebarWidth = this.sidebar.offsetWidth;
            this.resizer.style.left = `${sidebarWidth - 4}px`;
        }
    }
}

// ============================================
// ACCORDION COMPONENT
// ============================================

class AccordionComponent {
    constructor(selector) {
        this.triggers = $$(selector);
        this.init();
    }
    
    init() {
        this.triggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                const group = trigger.closest(CONFIG.selectors.facetGroup);
                group?.classList.toggle('open');
            });
        });
    }
}

// ============================================
// DROPDOWN COMPONENT
// ============================================

class DropdownComponent {
    constructor(dropdownId, buttonId) {
        this.dropdown = $(`#${dropdownId}`);
        this.button = $(`#${buttonId}`);
        
        if (this.dropdown && this.button) {
            this.init();
        }
    }
    
    init() {
        this.button.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeOthers();
            this.toggle();
        });
    }
    
    toggle() {
        this.dropdown.classList.toggle('open');
    }
    
    close() {
        this.dropdown.classList.remove('open');
    }
    
    closeOthers() {
        $$('[id$="Dropdown"].open').forEach(el => {
            if (el !== this.dropdown) {
                el.classList.remove('open');
            }
        });
    }
    
    static closeAll() {
        $$('[id$="Dropdown"].open').forEach(el => {
            el.classList.remove('open');
        });
    }
}

// ============================================
// DIALOG COMPONENT
// ============================================

class DialogComponent {
    constructor(dialogId, options = {}) {
        this.dialog = $(`#${dialogId}`);
        this.openBtnId = options.openBtnId;
        this.openBtnSelector = options.openBtnSelector;
        this.closeBtnId = options.closeBtnId;
        this.cancelBtnId = options.cancelBtnId;
        
        if (this.dialog) {
            this.init();
        }
    }
    
    init() {
        // Botão de abrir (por ID)
        if (this.openBtnId) {
            const openBtn = $(`#${this.openBtnId}`);
            openBtn?.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.open();
            });
        }
        
        // Botões de abrir (por seletor - múltiplos)
        if (this.openBtnSelector) {
            const openBtns = $$(this.openBtnSelector);
            openBtns.forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.open();
                });
            });
        }
        
        // Botão de fechar
        if (this.closeBtnId) {
            const closeBtn = $(`#${this.closeBtnId}`);
            closeBtn?.addEventListener('click', () => this.close());
        }
        
        // Botão cancelar
        if (this.cancelBtnId) {
            const cancelBtn = $(`#${this.cancelBtnId}`);
            cancelBtn?.addEventListener('click', () => this.close());
        }
        
        // Fechar no backdrop
        this.dialog.addEventListener('click', (e) => {
            if (e.target === this.dialog) {
                this.close();
            }
        });
    }
    
    open() {
        this.dialog.showModal();
    }
    
    close() {
        this.dialog.close();
    }
    
    toggle() {
        if (this.dialog.open) {
            this.close();
        } else {
            this.open();
        }
    }
}

// ============================================
// KEYBOARD SHORTCUTS
// ============================================

class KeyboardShortcuts {
    constructor(shortcuts) {
        this.shortcuts = shortcuts;
        this.init();
    }
    
    init() {
        document.addEventListener('keydown', (e) => this.handleKeydown(e));
    }
    
    handleKeydown(e) {
        this.shortcuts.forEach(shortcut => {
            const ctrlMatch = shortcut.ctrl ? (e.ctrlKey || e.metaKey) : true;
            const shiftMatch = shortcut.shift ? e.shiftKey : !e.shiftKey;
            const keyMatch = e.key.toLowerCase() === shortcut.key.toLowerCase();
            
            if (ctrlMatch && shiftMatch && keyMatch) {
                e.preventDefault();
                shortcut.action();
            }
        });
    }
}

// ============================================
// INICIALIZAÇÃO
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Search (suporta múltiplos)
    const search = new SearchComponent();
    
    // Sidebar
    const sidebar = new SidebarComponent();
    
    // Accordions (Facetas)
    const facetAccordion = new AccordionComponent(CONFIG.selectors.facetTitle);
    
    // Dropdowns
    const downloadDropdown = new DropdownComponent('downloadDropdown', 'downloadDropdownBtn');
    const accessibilityDropdown = new DropdownComponent('accessibilityDropdown', 'accessibilityBtn');
    
    // Fechar dropdowns ao clicar fora
    document.addEventListener('click', () => DropdownComponent.closeAll());
    
    // Dialogs
    const filtersDialog = new DialogComponent('filtersDialog', {
        openBtnSelector: CONFIG.selectors.filterBtn, // Agora pega todos os .filterBtn
        closeBtnId: 'filtersDialogCloseBtn',
        cancelBtnId: 'filtersDialogCancelBtn'
    });
    
    const infoDialog = new DialogComponent('infoDialog', {
        openBtnId: 'infoBtn',
        closeBtnId: 'infoDialogCloseBtn'
    });
    
    const ajudaDialog = new DialogComponent('ajudaDialog', {
        openBtnId: 'ajudaBtn',
        closeBtnId: 'ajudaDialogCloseBtn'
    });
    
    // Atalhos de teclado
    const shortcuts = new KeyboardShortcuts([
        {
            key: 'k',
            ctrl: true,
            action: () => filtersDialog.toggle()
        }
    ]);
});