// ============================================
// ACCESSIBILITY COMPONENT
// ============================================

class AccessibilityComponent {
    constructor() {
        this.storageKey = 'eprocesso-accessibility';
        this.fontSize = 100; // Variável de instância, não reseta
        
        this.preferences = {
            theme: 'light',
            contrast: false,
            fontSize: 100
        };
        
        this.init();
    }
    
    init() {
        // Carregar preferências
        this.loadPreferences();
        
        // Aplicar fontSize inicial
        this.fontSize = this.preferences.fontSize;
        document.documentElement.style.fontSize = this.fontSize + '%';
        
        // Aplicar tema e contraste
        if (this.preferences.theme === 'dark') {
            document.body.classList.add('dark-theme');
        }
        if (this.preferences.contrast) {
            document.body.classList.add('high-contrast');
        }
        
        // Event listeners nos botões
        document.querySelectorAll('#accessibilityMenu .dropdown-item').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const action = button.value;
                
                switch(action) {
                    case 'theme':
                        document.body.classList.toggle('dark-theme');
                        this.preferences.theme = document.body.classList.contains('dark-theme') ? 'dark' : 'light';
                        break;
                        
                    case 'contrast':
                        document.body.classList.toggle('high-contrast');
                        this.preferences.contrast = document.body.classList.contains('high-contrast');
                        break;
                        
                    case 'fontUp':
                        this.fontSize = Math.min(this.fontSize + 10, 150);
                        document.documentElement.style.fontSize = this.fontSize + '%';
                        this.preferences.fontSize = this.fontSize;
                        console.log(this.preferences.fontSize)
                        break;
                        
                    case 'fontDown':
                        this.fontSize = Math.max(this.fontSize - 10, 70);
                        document.documentElement.style.fontSize = this.fontSize + '%';
                        this.preferences.fontSize = this.fontSize;
                        break;
                        
                    case 'reset':
                        this.fontSize = 100;
                        document.documentElement.style.fontSize = '100%';
                        document.body.classList.remove('high-contrast');
                        document.body.classList.remove('dark-theme');
                        this.preferences = { theme: 'light', contrast: false, fontSize: 100 };
                        break;
                }
                
                this.savePreferences();
            });
        });
    }
    
    savePreferences() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.preferences));
    }
    
    loadPreferences() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            this.preferences = JSON.parse(saved);
        }
    }
}