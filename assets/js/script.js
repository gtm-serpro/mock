// select dropdown
const dropdown = document.getElementById('accessibilityDropdown');
const btn = document.getElementById('accessibilityBtn');

btn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('open');
});

document.addEventListener('click', () => {
    dropdown.classList.remove('open');
});

// limpar do search input
const searchInput = document.querySelector('.searchInput');
const searchWrapper = document.querySelector('.searchInputWraper');

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

// toggle sidebar
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

// Download buttons
const downloadDropdown = document.getElementById('downloadDropdown');
const downloadBtn = document.getElementById('downloadDropdownBtn');

downloadBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    downloadDropdown.classList.toggle('open');
});

document.addEventListener('click', () => {
    downloadDropdown.classList.remove('open');
});

// Accordion das facetas
document.querySelectorAll('.facetTitle').forEach(button => {
    button.addEventListener('click', () => {
        const group = button.closest('.facetGroup');
        group.classList.toggle('open');
    });
});

//Placebolder search mobile
function updatePlaceholder() {
    if (window.innerWidth <= 600) {
        searchInput.placeholder = 'Buscar...';
    } else {
        searchInput.placeholder = 'Digite para buscar...';
    }
}

// Executa no load e no resize
updatePlaceholder();
window.addEventListener('resize', updatePlaceholder);

// Accessibility dropdown (MOBILE - no footer)
const accessibilityDropdownMobile = document.getElementById('accessibilityDropdownMobile');
const accessibilityBtnMobile = document.getElementById('accessibilityBtnMobile');

if (accessibilityBtnMobile) {
    accessibilityBtnMobile.addEventListener('click', (e) => {
        e.stopPropagation();
        accessibilityDropdownMobile.classList.toggle('open');
    });

    document.addEventListener('click', () => {
        accessibilityDropdownMobile.classList.remove('open');
    });
}