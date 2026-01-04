// ============================================
// CURRENCY INPUT COMPONENT
// ============================================

class CurrencyInputComponent {
    constructor() {
        this.inputs = $$('.filter-value-range .filter-input');
        if (this.inputs.length > 0) this.init();
    }
    
    init() {
        this.inputs.forEach(input => {
            input.addEventListener('input', () => this.formatCurrency(input));
            input.addEventListener('keypress', (e) => {
                if (!/[0-9,.]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'Escape', 'Enter', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                    e.preventDefault();
                }
            });
            input.addEventListener('blur', () => this.formatCurrency(input));
        });
    }
    
    formatCurrency(input) {
        let value = input.value.replace(/\D/g, '');
        if (value === '') { input.value = ''; return; }
        input.value = (parseInt(value, 10) / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }
}