// ============================================
// DROPDOWN COMPONENT
// ============================================

class DropdownComponent {
    constructor(dropdownId, buttonId) {
        this.dropdown = $(`#${dropdownId}`);
        this.button = $(`#${buttonId}`);
        if (this.dropdown && this.button) this.init();
    }
    init() {
        this.button.addEventListener('click', (e) => {
            e.stopPropagation();
            this.closeOthers();
            this.toggle();
        });
    }
    toggle() { this.dropdown.classList.toggle('open'); }
    close() { this.dropdown.classList.remove('open'); }
    closeOthers() {
        $$('[id$="Dropdown"].open').forEach(el => { if (el !== this.dropdown) el.classList.remove('open'); });
    }
    static closeAll() { $$('[id$="Dropdown"].open').forEach(el => el.classList.remove('open')); }
}