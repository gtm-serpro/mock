// ============================================
// FILTER OPERATOR COMPONENT
// ============================================

class FilterOperatorComponent {
    constructor() {
        this.groups = $$(CONFIG.selectors.filterInputGroup);
        this.operators = ['contains', 'not-contains', 'equals'];
        this.labels = { 'contains': 'Contém', 'not-contains': 'Não contém', 'equals': 'Igual' };
        if (this.groups.length > 0) this.init();
    }
    
    init() {
        this.groups.forEach(group => {
            const input = group.querySelector('.filter-input');
            const opBtn = group.querySelector('.filter-operator');
            if (!input || !opBtn) return;
            
            input.addEventListener('focus', () => this.showOperator(group, opBtn));
            input.addEventListener('blur', () => {
                setTimeout(() => {
                    if (!input.value.trim() && !opBtn.matches(':hover')) this.hideOperator(group, opBtn);
                }, 150);
            });
            input.addEventListener('input', () => {
                if (input.value.trim()) this.showOperator(group, opBtn);
                else if (!input.matches(':focus')) this.hideOperator(group, opBtn);
            });
            opBtn.addEventListener('click', (e) => {
                e.preventDefault(); e.stopPropagation();
                this.cycleOperator(group, opBtn);
                input.focus();
            });
        });
    }
    
    showOperator(group, opBtn) {
        group.classList.add('has-operator');
        this.updateOperatorClass(group, opBtn.dataset.operator || 'contains');
    }
    hideOperator(group) {
        group.classList.remove('has-operator', 'operator-contains', 'operator-not-contains', 'operator-equals');
    }
    updateOperatorClass(group, operator) {
        group.classList.remove('operator-contains', 'operator-not-contains', 'operator-equals');
        group.classList.add(`operator-${operator}`);
    }
    cycleOperator(group, opBtn) {
        const current = opBtn.dataset.operator || 'contains';
        const next = this.operators[(this.operators.indexOf(current) + 1) % this.operators.length];
        opBtn.dataset.operator = next;
        opBtn.textContent = this.labels[next];
        opBtn.classList.remove('contains', 'not-contains', 'equals');
        opBtn.classList.add(next);
        this.updateOperatorClass(group, next);
    }
}