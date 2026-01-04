// ============================================
// ACCORDION COMPONENT
// ============================================

class AccordionComponent {
    constructor(selector) {
        this.triggers = $$(selector);
        this.init();
    }
    init() {
        this.triggers.forEach(trigger => {
            trigger.addEventListener('click', () => {
                trigger.closest(CONFIG.selectors.facetGroup)?.classList.toggle('open');
            });
        });
    }
}