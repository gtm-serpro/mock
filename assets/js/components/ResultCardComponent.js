// ============================================
// RESULT CARD COMPONENT - SEM MOCK
// ============================================

class ResultCardComponent {
    constructor() {
        this.resultsContainer = $('#results');
        this.searchTerm = '';
        this.toast = null;
        this.fieldsSelector = null;
        if (this.resultsContainer) this.init();
    }
    
    init() { 
        this.createToast(); 
        this.bindCopyEvents(); 
    }
    
    setFieldsSelector(selector) { 
        this.fieldsSelector = selector; 
    }
    
    createToast() {
        this.toast = document.createElement('div');
        this.toast.className = 'copy-toast';
        this.toast.textContent = 'Copiado!';
        document.body.appendChild(this.toast);
    }
    
    bindCopyEvents() {
        this.resultsContainer.addEventListener('click', (e) => {
            const field = e.target.closest('.result-field');
            if (field) this.copyFieldValue(field);
        });
    }
    
    copyFieldValue(field) {
        const valueElement = field.querySelector('.result-field-value span');
        if (!valueElement) return;
        
        navigator.clipboard.writeText(valueElement.textContent)
            .then(() => this.showToast('Copiado!'))
            .catch(() => this.showToast('Erro ao copiar'));
    }
    
    showToast(message) {
        this.toast.textContent = message;
        this.toast.classList.add('show');
        setTimeout(() => this.toast.classList.remove('show'), 2000);
    }
    
    setSearchTerm(term) { 
        this.searchTerm = term; 
    }
    
    highlightText(text, term) {
        if (!term || !text) return text;
        
        const normalizedText = this.normalizeText(text);
        const normalizedTerm = this.normalizeText(term);
        
        if (!normalizedTerm) return text;
        
        const matchIndex = normalizedText.indexOf(normalizedTerm);
        if (matchIndex === -1) return text;
        
        const charMap = [];
        for (let i = 0; i < text.length; i++) {
            if (this.normalizeText(text[i]).length > 0) charMap.push(i);
        }
        
        const startOriginal = charMap[matchIndex] ?? 0;
        const endOriginal = charMap[matchIndex + normalizedTerm.length] ?? text.length;
        
        return `${text.substring(0, startOriginal)}<mark>${text.substring(startOriginal, endOriginal)}</mark>${text.substring(endOriginal)}`;
    }
    
    normalizeText(text) { 
        return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); 
    }
    
    /**
     * Renderiza resultados reais do Solr
     * (já renderizados pelo Velocity no servidor)
     * Esta função é mantida para compatibilidade com testes locais
     */
    renderResults(results) {
        if (!results || results.length === 0) {
            this.resultsContainer.innerHTML = `
                <div class="no-results-message" style="text-align: center; padding: 40px; color: var(--color-text-light);">
                    <img src="assets/img/icons/magnifying-glass-solid-full.svg" alt="" style="width: 48px; height: 48px; opacity: 0.3; margin-bottom: 16px;">
                    <h3 style="margin-bottom: 8px; color: var(--color-text);">Nenhum resultado encontrado</h3>
                    <p>Tente ajustar os termos da busca ou remover alguns filtros.</p>
                </div>
            `;
            return;
        }
        
        this.resultsContainer.innerHTML = '';
        results.forEach(result => this.resultsContainer.appendChild(this.createCard(result)));
        
        if (this.fieldsSelector) this.fieldsSelector.refresh();
    }
    
    getDownloadType(data) {
        if (!data.arquivoIndexado) return 'disabled';
        if (data.indicadorPesquisavel && !data.indicadorOriginalPesquisavel) return 'dual';
        if (!data.indicadorPesquisavel && !data.indicadorOriginalPesquisavel) return 'original';
        if (data.indicadorPesquisavel && data.indicadorOriginalPesquisavel) return 'searchable';
        return 'original';
    }
    
    createDownloadButtons(data) {
        const downloadType = this.getDownloadType(data);
        const baseUrl = 'https://eprocesso.suiterfb.receita.fazenda/eprocesso/api/documentos/';
        const id = data.id || '';
        const pdfUrl = `${baseUrl}${id}/obterbinario/download`;
        const pdfOcrUrl = `${baseUrl}${id}/obterbinarioocr/download`;
        
        switch (downloadType) {
            case 'dual':
                return `<div class="btn-group"><a href="${pdfUrl}" class="btn-download" title="Baixar PDF Original" target="_blank"><img class="icon-default iconColor" src="assets/img/icons/file-image-regular-full.svg" alt=""><img class="icon-hover iconColor" src="assets/img/icons/download-solid-full.svg" alt=""></a><a href="${pdfOcrUrl}" class="btn-download" title="Baixar PDF Pesquisável (OCR)" target="_blank"><img class="icon-default iconColorGreen" src="assets/img/icons/file-lines-regular-full.svg" alt=""><img class="icon-hover iconColor" src="assets/img/icons/download-solid-full.svg" alt=""></a></div>`;
            case 'original':
                return `<div class="btn-group"><a href="${pdfUrl}" class="btn-download btn-download-single" title="Baixar PDF Original" target="_blank"><img class="icon-default iconColor" src="assets/img/icons/file-image-regular-full.svg" alt=""><img class="icon-hover iconColor" src="assets/img/icons/download-solid-full.svg" alt=""></a></div>`;
            case 'searchable':
                return `<div class="btn-group"><a href="${pdfUrl}" class="btn-download btn-download-single" title="Baixar PDF" target="_blank"><img class="icon-default iconColor iconColorGreen" src="assets/img/icons/file-lines-regular-full.svg" alt=""><img class="icon-hover iconColor" src="assets/img/icons/download-solid-full.svg" alt=""></a></div>`;
            default:
                return `<div class="btn-group"><span class="btn-download btn-download-disabled" title="PDF não disponível"><img class="iconColor" src="assets/img/icons/file-excel-regular-full.svg" alt=""></span></div>`;
        }
    }
    
    createCard(data) {
        const card = document.createElement('article');
        card.className = 'result-card';
        if (data.id) card.id = `doc-${data.id}`;
        
        const header = document.createElement('header');
        header.className = 'result-card-header';
        
        const actions = document.createElement('div');
        actions.className = 'result-card-actions';
        actions.innerHTML = this.createDownloadButtons(data);
        
        const title = document.createElement('h3');
        title.className = 'result-card-title';
        let titleText = data.tipoDocumento || 'Documento';
        if (data.titulo) titleText += ` - ${data.titulo}`;
        title.innerHTML = this.highlightText(titleText, this.searchTerm);
        
        header.appendChild(actions);
        header.appendChild(title);
        
        const body = document.createElement('div');
        body.className = 'result-card-body';
        
        const fields = [
            { label: 'Número do Processo', value: data.processo, field: 'processo' },
            { label: 'Data Anexação', value: data.dataAnexacao, field: 'data-anexacao' },
            { label: 'Data Protocolo', value: data.dataProtocolo, field: 'data-protocolo' },
            { label: 'Data Juntada', value: data.dataJuntada, field: 'data-juntada' },
            { label: 'Unidade Origem', value: data.unidadeOrigem, field: 'unidade-origem' },
            { label: 'Equipe Origem', value: data.equipeOrigem, field: 'equipe-origem' },
            { label: 'Tipo Documento', value: data.tipoDocumento, field: 'tipo-documento' },
            { label: 'Título', value: data.titulo, field: 'titulo' },
            { label: 'Grupo Processo', value: data.grupoProcesso, field: 'grupo-processo' },
            { label: 'Tipo Processo', value: data.tipoProcesso, field: 'tipo-processo' },
            { label: 'Subtipo Processo', value: data.subtipoProcesso, field: 'subtipo-processo' },
            { label: 'NI Contribuinte', value: data.niContribuinte, field: 'ni-contribuinte' },
            { label: 'Nome Contribuinte', value: data.nomeContribuinte, field: 'nome-contribuinte' },
            { label: 'Equipe Atual', value: data.equipeAtual, field: 'equipe-atual' },
            { label: 'Unidade Atual', value: data.unidadeAtual, field: 'unidade-atual' },
            { label: 'CPF Responsável', value: data.cpfResponsavel, field: 'cpf-responsavel' },
            { label: 'Usuário Juntada', value: data.usuarioJuntada, field: 'usuario-juntada' },
            { label: 'Tributo ACT', value: data.tributoAct, field: 'tributo-act' },
            { label: 'Assuntos/Objetos', value: data.assuntosObjetos, field: 'assuntos-objetos' },
            { label: 'Alegações', value: data.alegacoes, field: 'alegacoes' },
            { label: 'Nr Doc Principal', value: data.numeroDocPrincipal, field: 'numero-doc-principal' }
        ];
        
        fields.forEach(f => { 
            if (f.value) body.appendChild(this.createField(f.label, f.value, f.field)); 
        });
        
        card.appendChild(header);
        card.appendChild(body);
        
        if (this.searchTerm && data.conteudo) {
            card.appendChild(this.createSnippet(data.conteudo));
        }
        
        return card;
    }
    
    createField(label, value, fieldName) {
        const field = document.createElement('div');
        field.className = 'result-field';
        field.dataset.field = fieldName;
        field.title = 'Clique para copiar';
        field.innerHTML = `<dt class="result-field-label">${label}</dt><dd class="result-field-value"><span>${this.highlightText(value, this.searchTerm)}</span><img class="result-field-copy iconColor" src="assets/img/icons/copy-regular-full.svg" alt="Copiar"></dd>`;
        return field;
    }
    
    createSnippet(conteudo) {
        const snippet = document.createElement('div');
        snippet.className = 'result-card-snippet';
        snippet.innerHTML = `<dt class="result-snippet-label">Trecho:</dt><dd class="result-snippet-value">${this.highlightText(conteudo, this.searchTerm)}</dd>`;
        return snippet;
    }
}
