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
        this.clearBtnId = options.clearBtnId;
        this.filterCounter = options.filterCounter;
        if (this.dialog) this.init();
    }
    
    init() {
        if (this.openBtnId) {
            $(`#${this.openBtnId}`)?.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); this.open(); });
        }
        if (this.openBtnSelector) {
            $$(this.openBtnSelector).forEach(btn => {
                btn.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); this.open(); });
            });
        }
        if (this.closeBtnId) {
            $(`#${this.closeBtnId}`)?.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); this.close(); });
        }
        if (this.cancelBtnId) {
            $(`#${this.cancelBtnId}`)?.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); this.close(); });
        }
        if (this.clearBtnId) {
            $(`#${this.clearBtnId}`)?.addEventListener('click', (e) => { e.preventDefault(); e.stopPropagation(); this.clearFilters(); });
        }
        this.dialog.addEventListener('click', (e) => { if (e.target === this.dialog) this.close(); });
        this.dialog.addEventListener('keydown', (e) => { if (e.key === 'Escape') this.close(); });
    }
    
    open() { this.dialog.showModal(); }
    close() { this.dialog.close(); }
    toggle() { this.dialog.open ? this.close() : this.open(); }
    
    clearFilters() {
        this.dialog.querySelectorAll('.filter-input').forEach(input => input.value = '');
        this.dialog.querySelectorAll('input[type="date"]').forEach(input => input.value = '');
        this.dialog.querySelectorAll('.searchInput').forEach(input => input.value = '');
        this.dialog.querySelectorAll('.filter-input-group').forEach(group => {
            const opBtn = group.querySelector('.filter-operator');
            if (opBtn) {
                opBtn.dataset.operator = 'contains';
                opBtn.textContent = 'Contém';
                opBtn.classList.remove('not-contains', 'equals');
                opBtn.classList.add('contains');
            }
            group.classList.remove('has-operator', 'operator-contains', 'operator-not-contains', 'operator-equals');
        });
        this.dialog.querySelectorAll('.filter-autocomplete.open').forEach(ac => ac.classList.remove('open'));
        if (this.filterCounter) this.filterCounter.updateCount();
    }
}