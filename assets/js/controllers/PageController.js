// ============================================
// PAGE CONTROLLER
// ============================================

class PageController {
    constructor() {
        this.body = document.body;
        this.isEmptyState = this.body.classList.contains('empty-state');
    }
    showResults() { this.body.classList.remove('empty-state'); this.isEmptyState = false; }
    showEmpty() { this.body.classList.add('empty-state'); this.isEmptyState = true; }
    toggle() { this.isEmptyState ? this.showResults() : this.showEmpty(); }
}