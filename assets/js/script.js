// ============================================
// SEARCH INPUT
// ============================================

const searchInput = document.querySelector('.searchInput');
const searchWrapper = document.querySelector('.searchInputWraper');

// Mostrar/esconder botão X baseado no conteúdo
if (searchInput && searchWrapper) {
    searchInput.addEventListener('input', () => {
        if (searchInput.value.length > 0) {
            searchWrapper.classList.add('hasValue');
        } else {
            searchWrapper.classList.remove('hasValue');
        }
    });
}

// Limpar input ao clicar no X
const searchCloseBtn = document.querySelector('.searchCloseBtn');
if (searchCloseBtn) {
    searchCloseBtn.addEventListener('click', (e) => {
        e.preventDefault();
        searchInput.value = '';
        searchWrapper.classList.remove('hasValue');
        searchInput.focus();
    });
}

// Placeholder responsivo
function updatePlaceholder() {
    if (!searchInput) return;
    if (window.innerWidth <= 600) {
        searchInput.placeholder = 'Buscar...';
    } else {
        searchInput.placeholder = 'Digite para buscar...';
    }
}

updatePlaceholder();
window.addEventListener('resize', updatePlaceholder);

// ============================================
// SIDEBAR
// ============================================

const sidebarBtn = document.getElementById('sidebarBtn');
const sidebar = document.getElementById('sidebar');
const overlay = document.getElementById('sidebarOverlay');

if (sidebarBtn && sidebar && overlay) {
    sidebarBtn.addEventListener('click', () => {
        sidebar.classList.toggle('open');
        overlay.classList.toggle('open');
    });

    overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('open');
    });
}

// ============================================
// SIDEBAR RESIZER
// ============================================

const sidebarResizer = document.getElementById('sidebarResizer');

if (sidebarResizer && sidebar) {
    let isResizing = false;

    // Atualiza posição do resizer baseado na largura do sidebar
    function updateResizerPosition() {
        const sidebarWidth = sidebar.offsetWidth;
        sidebarResizer.style.left = `${sidebarWidth - 4}px`;
    }

    // Posição inicial
    updateResizerPosition();

    sidebarResizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        sidebarResizer.classList.add('dragging');
        document.body.classList.add('resizing');
        e.preventDefault();
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        // Calcula nova largura baseada na posição do mouse
        const newWidth = e.clientX;
        
        // Aplica limites (min: 10px, max: 1000px)
        if (newWidth >= 10 && newWidth <= 1000) {
            sidebar.style.width = `${newWidth}px`;
            updateResizerPosition();
        }
    });

    document.addEventListener('mouseup', () => {
        if (isResizing) {
            isResizing = false;
            sidebarResizer.classList.remove('dragging');
            document.body.classList.remove('resizing');
        }
    });

    // Suporte para touch (mobile/tablet)
    sidebarResizer.addEventListener('touchstart', (e) => {
        isResizing = true;
        sidebarResizer.classList.add('dragging');
        document.body.classList.add('resizing');
        e.preventDefault();
    });

    document.addEventListener('touchmove', (e) => {
        if (!isResizing) return;

        const touch = e.touches[0];
        const newWidth = touch.clientX;

        if (newWidth >= 10 && newWidth <= 1000) {
            sidebar.style.width = `${newWidth}px`;
            updateResizerPosition();
        }
    });

    document.addEventListener('touchend', () => {
        if (isResizing) {
            isResizing = false;
            sidebarResizer.classList.remove('dragging');
            document.body.classList.remove('resizing');
        }
    });

    // Double-click para resetar largura padrão
    sidebarResizer.addEventListener('dblclick', () => {
        sidebar.style.width = '250px';
        updateResizerPosition();
    });

    // Atualiza posição quando a janela redimensiona
    window.addEventListener('resize', updateResizerPosition);
}

// ============================================
// FACET ACCORDION
// ============================================

document.querySelectorAll('.facetTitle').forEach(button => {
    button.addEventListener('click', () => {
        const group = button.closest('.facetGroup');
        group.classList.toggle('open');
    });
});

// ============================================
// DROPDOWNS
// ============================================

// Função genérica para criar dropdown
function setupDropdown(dropdownId, buttonId) {
    const dropdown = document.getElementById(dropdownId);
    const btn = document.getElementById(buttonId);
    
    if (!dropdown || !btn) return;
    
    btn.addEventListener('click', (e) => {
        e.stopPropagation();
        // Fecha outros dropdowns abertos
        document.querySelectorAll('.open').forEach(el => {
            if (el !== dropdown && el.id && el.id.includes('Dropdown')) {
                el.classList.remove('open');
            }
        });
        dropdown.classList.toggle('open');
    });
}

// Download dropdown
setupDropdown('downloadDropdown', 'downloadDropdownBtn');

// Accessibility dropdown no footer (sempre visível)
setupDropdown('accessibilityDropdown', 'accessibilityBtn');

// Fechar todos os dropdowns ao clicar fora
document.addEventListener('click', () => {
    document.querySelectorAll('[id$="Dropdown"].open').forEach(el => {
        el.classList.remove('open');
    });
});

// ============================================
// DIALOGS - Função genérica
// ============================================

function setupDialog(dialogId, openBtnId, closeBtnId, cancelBtnId = null) {
    const dialog = document.getElementById(dialogId);
    const openBtn = document.getElementById(openBtnId);
    const closeBtn = document.getElementById(closeBtnId);
    const cancelBtn = cancelBtnId ? document.getElementById(cancelBtnId) : null;

    if (!dialog) return;

    // Abrir
    if (openBtn) {
        openBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            dialog.showModal();
        });
    }

    // Fechar - botão X
    if (closeBtn) {
        closeBtn.addEventListener('click', () => {
            dialog.close();
        });
    }

    // Fechar - botão Cancelar
    if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
            dialog.close();
        });
    }

    // Fechar ao clicar no backdrop
    dialog.addEventListener('click', (e) => {
        if (e.target === dialog) {
            dialog.close();
        }
    });

    return dialog;
}

// ============================================
// FILTERS DIALOG
// ============================================

const filtersDialog = setupDialog(
    'filtersDialog',
    null, // Será aberto pelo filterBtn
    'filtersDialogCloseBtn',
    'filtersDialogCancelBtn'
);

// Abrir pelo botão de filtro (tem classe, não ID)
const filterBtn = document.querySelector('.filterBtn');
if (filterBtn && filtersDialog) {
    filterBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        filtersDialog.showModal();
    });
}

// ============================================
// INFO DIALOG
// ============================================

setupDialog(
    'infoDialog',
    'infoBtn',
    'infoDialogCloseBtn'
);

// ============================================
// AJUDA DIALOG
// ============================================

setupDialog(
    'ajudaDialog',
    'ajudaBtn',
    'ajudaDialogCloseBtn'
);

// ============================================
// ATALHO DE TECLADO - Ctrl+K abre filtros
// ============================================

document.addEventListener('keydown', (e) => {
    // Ctrl+K (ou Cmd+K no Mac)
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        
        if (filtersDialog && filtersDialog.open) {
            filtersDialog.close();
        } else if (filtersDialog) {
            filtersDialog.showModal();
        }
    }
});
