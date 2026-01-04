// ============================================
// RESULT CARD COMPONENT
// ============================================

class ResultCardComponent {
    constructor() {
        this.resultsContainer = $('#results');
        this.searchTerm = '';
        this.toast = null;
        this.fieldsSelector = null;
        if (this.resultsContainer) this.init();
    }
    
    init() { this.createToast(); this.bindCopyEvents(); }
    setFieldsSelector(selector) { this.fieldsSelector = selector; }
    
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
    
    setSearchTerm(term) { this.searchTerm = term; }
    
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
    
    normalizeText(text) { return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, ''); }
    
    renderResults(results) {
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
        
        fields.forEach(f => { if (f.value) body.appendChild(this.createField(f.label, f.value, f.field)); });
        
        card.appendChild(header);
        card.appendChild(body);
        
        if (this.searchTerm && data.conteudo) card.appendChild(this.createSnippet(data.conteudo));
        
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
    
    static getMockResults() {
        return [
            { id: '12345678', titulo: 'NOTIFICAÇÃO DE LANÇAMENTO - COFINS', tipoDocumento: 'NOTIFICAÇÃO', processo: '10580.350820/2019-34', dataAnexacao: '14/05/2019 16:00', dataProtocolo: '15/05/2019 09:15', dataJuntada: '20/05/2019 14:30', unidadeOrigem: 'DRF São Paulo', equipeOrigem: 'EFIS-01', grupoProcesso: 'PROCESSO TRIBUTÁRIO', tipoProcesso: 'LANÇAMENTO DE OFÍCIO', subtipoProcesso: 'AUTO DE INFRAÇÃO', niContribuinte: '12.345.678/0001-99', nomeContribuinte: 'EMPRESA EXEMPLO LTDA', equipeAtual: 'EFIS-02', unidadeAtual: 'DRF São Paulo', cpfResponsavel: '123.456.789-00', usuarioJuntada: 'SILVA, JOÃO', tributoAct: '35 - COFINS', assuntosObjetos: 'GLOSA DE CRÉDITOS', alegacoes: null, numeroDocPrincipal: 'NL-2019-001234', conteudo: 'O contribuinte deixou de recolher a COFINS devida no período de apuração, conforme demonstrado nos autos.', arquivoIndexado: true, indicadorPesquisavel: true, indicadorOriginalPesquisavel: false },
            { id: '23456789', titulo: 'AUTO DE INFRAÇÃO - IRPJ', tipoDocumento: 'AUTO DE INFRAÇÃO', processo: '10580.720145/2020-12', dataAnexacao: '09/03/2020 10:00', dataProtocolo: '10/03/2020 11:45', dataJuntada: '15/03/2020 16:20', unidadeOrigem: 'DRF Rio de Janeiro', equipeOrigem: 'EFIS-03', grupoProcesso: 'PROCESSO ADMINISTRATIVO FISCAL', tipoProcesso: 'LANÇAMENTO DE OFÍCIO', subtipoProcesso: 'AUTO DE INFRAÇÃO', niContribuinte: '98.765.432/0001-10', nomeContribuinte: 'COMERCIAL BRASIL S.A.', equipeAtual: 'EFIS-03', unidadeAtual: 'DRF Rio de Janeiro', cpfResponsavel: '987.654.321-00', usuarioJuntada: 'OLIVEIRA, MARIA', tributoAct: '10 - IRPJ', assuntosObjetos: 'OMISSÃO DE RECEITAS', alegacoes: null, numeroDocPrincipal: 'AI-2020-005678', conteudo: null, arquivoIndexado: true, indicadorPesquisavel: false, indicadorOriginalPesquisavel: false },
            { id: '34567890', titulo: 'RECURSO VOLUNTÁRIO - PIS/COFINS', tipoDocumento: 'RECURSO', processo: '13502.901234/2021-56', dataAnexacao: '21/08/2021 07:00', dataProtocolo: '22/08/2021 08:30', dataJuntada: '25/08/2021 10:00', unidadeOrigem: 'CARF - 1ª Seção', equipeOrigem: 'TURMA-01', grupoProcesso: 'RECURSO VOLUNTÁRIO', tipoProcesso: 'RECURSO', subtipoProcesso: 'RECURSO VOLUNTÁRIO', niContribuinte: '55.444.333/0001-22', nomeContribuinte: 'INDÚSTRIA NACIONAL LTDA', equipeAtual: 'TURMA-02', unidadeAtual: 'CARF - 1ª Seção', cpfResponsavel: '555.444.333-22', usuarioJuntada: 'SANTOS, PEDRO', tributoAct: '34/35 - PIS/COFINS', assuntosObjetos: 'CREDITAMENTO INDEVIDO', alegacoes: 'Alega o contribuinte que os créditos foram tomados de acordo com a legislação vigente.', numeroDocPrincipal: 'RV-2021-009012', conteudo: 'O recurso voluntário interposto pelo contribuinte merece provimento parcial, conforme fundamentação a seguir.', arquivoIndexado: true, indicadorPesquisavel: true, indicadorOriginalPesquisavel: true },
            { id: '45678901', titulo: 'ACÓRDÃO - CSLL', tipoDocumento: 'ACÓRDÃO', processo: '10880.654321/2018-78', dataAnexacao: '04/11/2018 12:00', dataProtocolo: '05/11/2018 14:00', dataJuntada: '10/11/2018 09:45', unidadeOrigem: 'CARF - 2ª Seção', equipeOrigem: 'TURMA-03', grupoProcesso: 'JULGAMENTO', tipoProcesso: 'DECISÃO', subtipoProcesso: 'ACÓRDÃO', niContribuinte: '11.222.333/0001-44', nomeContribuinte: 'SERVIÇOS FINANCEIROS S.A.', equipeAtual: 'TURMA-03', unidadeAtual: 'CARF - 2ª Seção', cpfResponsavel: '111.222.333-44', usuarioJuntada: 'FERREIRA, ANA', tributoAct: '20 - CSLL', assuntosObjetos: 'BASE DE CÁLCULO', alegacoes: 'A base de cálculo foi apurada de forma incorreta pela fiscalização.', numeroDocPrincipal: 'AC-2018-003456', conteudo: null, arquivoIndexado: false, indicadorPesquisavel: false, indicadorOriginalPesquisavel: false },
            { id: '56789012', titulo: 'DESPACHO DECISÓRIO - IPI', tipoDocumento: 'DESPACHO', processo: '10768.112233/2022-90', dataAnexacao: '17/01/2022 15:00', dataProtocolo: '18/01/2022 16:30', dataJuntada: '20/01/2022 11:15', unidadeOrigem: 'DRF Belo Horizonte', equipeOrigem: 'EFIS-05', grupoProcesso: 'PROCESSO ADMINISTRATIVO', tipoProcesso: 'DESPACHO', subtipoProcesso: 'DESPACHO DECISÓRIO', niContribuinte: '77.888.999/0001-55', nomeContribuinte: 'METALÚRGICA MINAS GERAIS LTDA', equipeAtual: 'EFIS-06', unidadeAtual: 'DRF Belo Horizonte', cpfResponsavel: '777.888.999-55', usuarioJuntada: 'COSTA, CARLOS', tributoAct: '40 - IPI', assuntosObjetos: 'CLASSIFICAÇÃO FISCAL', alegacoes: null, numeroDocPrincipal: 'DD-2022-007890', conteudo: 'Pelo exposto, DEFIRO o pedido de reclassificação fiscal do produto NCM 7326.90.90.', arquivoIndexado: true, indicadorPesquisavel: true, indicadorOriginalPesquisavel: false }
        ];
    }
}