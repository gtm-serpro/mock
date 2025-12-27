// ============================================
// SEARCH INPUT
// ============================================

const searchInput = document.querySelector('.searchInput');
const searchWrapper = document.querySelector('.searchInputWraper');

// Mostrar/esconder botão X baseado no conteúdo
searchInput.addEventListener('input', () => {
    if (searchInput.value.length > 0) {
        searchWrapper.classList.add('hasValue');
    } else {
        searchWrapper.classList.remove('hasValue');
    }
});

// Limpar input ao clicar no X
document.querySelector('.searchCloseBtn').addEventListener('click', (e) => {
    e.preventDefault();
    searchInput.value = '';
    searchWrapper.classList.remove('hasValue');
    searchInput.focus();
});

// Placeholder responsivo
function updatePlaceholder() {
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

sidebarBtn.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    overlay.classList.toggle('open');
});

overlay.addEventListener('click', () => {
    sidebar.classList.remove('open');
    overlay.classList.remove('open');
});

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
