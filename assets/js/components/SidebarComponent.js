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
        this.startX = 0;
        this.startWidth = 0;
        if (this.sidebar) this.init();
    }
    
    init() {
        this.bindToggleEvents();
        this.bindResizerEvents();
    }
    
    bindToggleEvents() {
        if (this.toggleBtn) this.toggleBtn.addEventListener('click', () => this.toggle());
        if (this.overlay) this.overlay.addEventListener('click', () => this.close());
    }
    
    bindResizerEvents() {
        if (!this.resizer) return;
        this.resizer.addEventListener('mousedown', (e) => this.startResize(e));
        document.addEventListener('mousemove', (e) => this.resize(e));
        document.addEventListener('mouseup', () => this.stopResize());
        this.resizer.addEventListener('touchstart', (e) => this.startResize(e), { passive: false });
        document.addEventListener('touchmove', (e) => this.resizeTouch(e), { passive: false });
        document.addEventListener('touchend', () => this.stopResize());
        this.resizer.addEventListener('dblclick', () => this.resetWidth());
    }
    
    toggle() { this.sidebar.classList.toggle('open'); this.overlay?.classList.toggle('open'); }
    close() { this.sidebar.classList.remove('open'); this.overlay?.classList.remove('open'); }
    
    startResize(e) {
        e.preventDefault();
        this.isResizing = true;
        this.startX = e.clientX || e.touches?.[0]?.clientX || 0;
        this.startWidth = this.sidebar.offsetWidth;
        this.resizer.classList.add('dragging');
        document.body.classList.add('resizing');
    }
    
    resize(e) {
        if (!this.isResizing) return;
        const currentX = e.clientX;
        const diff = currentX - this.startX;
        this.setWidth(this.startWidth + diff);
    }
    
    resizeTouch(e) {
        if (!this.isResizing) return;
        e.preventDefault();
        const currentX = e.touches[0].clientX;
        this.setWidth(this.startWidth + (currentX - this.startX));
    }
    
    setWidth(width) {
        const { minWidth, maxWidth } = CONFIG.sidebar;
        this.sidebar.style.width = `${Math.max(minWidth, Math.min(maxWidth, width))}px`;
    }
    
    stopResize() {
        if (this.isResizing) {
            this.isResizing = false;
            this.resizer?.classList.remove('dragging');
            document.body.classList.remove('resizing');
        }
    }
    
    resetWidth() { this.sidebar.style.width = `${CONFIG.sidebar.defaultWidth}px`; }
}