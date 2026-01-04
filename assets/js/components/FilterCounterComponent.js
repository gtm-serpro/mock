// ============================================
// FILTER COUNTER COMPONENT
// ============================================

class FilterCounterComponent {
    constructor(dialogSelector) {
        this.dialog = $(dialogSelector);
        this.badges = $$('.filtersUsedNumbers');
        this.filterCount = 0;
        if (this.dialog) this.init();
    }
    
    init() {
        this.dialog.querySelectorAll('.filter-input').forEach(input => {
            input.addEventListener('input', () => this.updateCount());
            input.addEventListener('change', () => this.updateCount());
        });
        this.dialog.addEventListener('close', () => this.updateCount());
        this.updateCount();
    }
    
    updateCount() {
        let count = 0;
        this.dialog.querySelectorAll('.filter-input-group .filter-input').forEach(input => {
            if (input.value.trim()) count++;
        });
        this.dialog.querySelectorAll('.filter-date-range').forEach(range => {
            if (Array.from(range.querySelectorAll('input[type="date"]')).some(input => input.value)) count++;
        });
        this.dialog.querySelectorAll('.filter-value-range').forEach(range => {
            if (Array.from(range.querySelectorAll('.filter-input')).some(input => input.value.trim())) count++;
        });
        this.filterCount = count;
        this.updateBadges();
    }
    
    updateBadges() {
        this.badges.forEach(badge => {
            if (this.filterCount > 0) { badge.textContent = this.filterCount; badge.style.display = 'flex'; }
            else { badge.textContent = ''; badge.style.display = 'none'; }
        });
    }
    
    getCount() { return this.filterCount; }
    reset() { this.filterCount = 0; this.updateBadges(); }
}