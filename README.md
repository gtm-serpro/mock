# Migração eProcesso Buscador - Guia Completo

## 📋 Resumo

Você já tem:
- ✅ **Todos os arquivos CSS** prontos e funcionando
- ✅ **HTML protótipo** com estrutura completa
- ✅ **Arquivos JavaScript** dos componentes

Precisa criar:
- 📝 **11 arquivos Velocity (.vm)** - templates do backend

## 📁 Estrutura de Arquivos

### Arquivos Velocity a Criar

```
vm/
├── layout.vm                 # Layout principal (NOVO)
├── header.vm                 # Cabeçalho (SUBSTITUIR)
├── head.vm                   # Head (SUBSTITUIR)
├── pageEmpty.vm              # Tela vazia (NOVO)
├── pageResults.vm            # Página de resultados (NOVO)
├── facet_fields.vm           # Facetas (SUBSTITUIR)
├── nfe_doc.vm                # Cards de resultado (SUBSTITUIR)
└── dialogs/                  # Pasta nova
    ├── filtersDialog.vm      # Dialog de filtros
    ├── infoDialog.vm         # Dialog de info
    └── ajudaDialog.vm        # Dialog de ajuda
```

### Arquivos Mantidos (não mexer)

```
vm/
├── facets.vm                 # ✅ Mantém como está
├── hit.vm                    # ✅ Mantém como está
├── results_list.vm           # ✅ Mantém como está
├── pagination_bottom.vm      # ✅ Mantém como está
└── VM_global_library.vm      # ✅ Mantém como está
```

### Arquivos Removidos

```
❌ query_form.vm  (agora integrado no header.vm)
❌ tabs.vm         (não usado mais)
❌ footer.vm       (não usado mais)
```

## 🚀 Instalação Rápida

### 1. Backup

```bash
cd /caminho/para/solr/velocity/
mkdir backup_$(date +%Y%m%d)
cp -r vm/ backup_$(date +%Y%m%d)/
```

### 2. Criar Estrutura

```bash
cd vm/
mkdir -p dialogs
```

### 3. Copiar Arquivos .vm

Copie os 11 arquivos Velocity que criei anteriormente para suas respectivas pastas.

### 4. Verificar CSS

Os CSS já estão prontos em:
```
assets/css/
├── reset.css                 # ✅ Pronto
├── variables.css             # ✅ Pronto
├── typography.css            # ✅ Pronto
├── components.css            # ✅ Pronto
├── global.css                # ✅ Pronto
├── mainHeader.css            # ✅ Pronto
├── pageEmpty.css             # ✅ Pronto
├── pageResults.css           # ✅ Pronto
├── resultCard.css            # ✅ Pronto
├── dialogs.css               # ✅ Pronto
├── fieldsSelector.css        # ✅ Pronto
└── ajudaDialog.css           # ✅ Pronto
```

## 🔧 Configuração Backend

### Variáveis Necessárias (Java/Solr)

No seu código Java que processa o Velocity, certifique-se de ter:

```java
// Context path
context.put("request", new RequestWrapper(request));

// Ou manualmente:
context.put("contextPath", "/eprocesso-buscador");

// Variáveis do Solr (já existentes)
context.put("response", solrResponse);
context.put("page", pageInfo);
context.put("params", requestParams);
```

### Verificar Funções Velocity

Estas funções precisam estar disponíveis (provavelmente já estão):

```velocity
#url_for_home              ## URL base
#url_for_facet_filter()    ## URL com filtro de faceta
#link_to_previous_page()   ## Link página anterior
#link_to_next_page()       ## Link página seguinte
#field()                   ## Campo com highlight
$esc.html()                ## Escape HTML
$date.format()             ## Formato de data
$number.format()           ## Formato de número
$display.truncate()        ## Truncar texto
```

## 📊 Mapeamento de Dados

### Estrutura Esperada

```velocity
## Response do Solr
$response.results              → Lista de documentos
$response.facetFields          → Lista de facetas

## Paginação
$page.start                    → Primeiro resultado (ex: 1)
$page.end                      → Último resultado (ex: 10)
$page.results_found            → Total (ex: 123)
$page.current_page_number      → Página atual (ex: 1)
$page.page_count               → Total de páginas (ex: 13)

## Parâmetros
$params.get('q')               → Termo buscado
$params.get('fq')              → Filtros ativos
$params.getParams('fq')        → Lista de filtros
```

### Campos dos Documentos

Mapeamento do Solr → Velocity:

```velocity
$doc.getFieldValue('id')                          → ID do documento
$doc.getFieldValue('processo_s')                  → Número do processo
$doc.getFieldValue('tipo_processo_s')             → Tipo
$doc.getFieldValue('dt_juntada_tdt')             → Data (formato ISO)
$doc.getFieldValue('nome_contribuinte_s')        → Nome
$doc.getFieldValue('arquivo_indexado_s')         → S/N
$doc.getFieldValue('indicador_pesquisavel_s')    → S/N
```

## ✅ Checklist de Migração

### Pré-Migração
- [ ] Backup completo dos arquivos .vm
- [ ] Verificar se CSS estão carregando
- [ ] Verificar se jQuery UI está disponível
- [ ] Testar em ambiente de dev primeiro

### Arquivos Velocity
- [ ] layout.vm copiado e configurado
- [ ] header.vm substituído
- [ ] head.vm substituído  
- [ ] pageEmpty.vm criado
- [ ] pageResults.vm criado
- [ ] facet_fields.vm substituído
- [ ] nfe_doc.vm substituído
- [ ] dialogs/filtersDialog.vm criado
- [ ] dialogs/infoDialog.vm criado
- [ ] dialogs/ajudaDialog.vm criado

### Configuração
- [ ] Variável `contextPath` configurada
- [ ] Funções Velocity funcionando
- [ ] URLs sendo geradas corretamente

### Testes Funcionais
- [ ] Tela vazia aparece sem resultados
- [ ] Busca simples funciona
- [ ] Resultados aparecem em cards
- [ ] Facetas na sidebar funcionam
- [ ] Clique em faceta filtra resultados
- [ ] Paginação funciona
- [ ] Filtros avançados abrem
- [ ] Aplicar filtros funciona
- [ ] Downloads de PDF funcionam
- [ ] Autocomplete funciona
- [ ] Operadores (Contém/Igual/Não Contém) funcionam
- [ ] Copy-to-clipboard funciona
- [ ] Seletor de campos funciona
- [ ] Responsividade mobile funciona

### Navegadores
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Chrome
- [ ] Mobile Safari

## 🐛 Troubleshooting

### Problema: CSS não carrega

**Solução:**
```velocity
## Verificar se contextPath está correto em head.vm
## Deve ser algo como:
<link rel="stylesheet" href="${request.contextPath}/assets/css/variables.css">

## Testar diretamente no navegador:
https://seu-servidor/eprocesso-buscador/assets/css/variables.css
```

### Problema: Facetas não aparecem

**Debug em facet_fields.vm:**
```velocity
## Adicionar no topo:
<div style="background:yellow;padding:10px;">
  #if($response.facetFields)
    Total facetas: $response.facetFields.size()
  #else
    Nenhuma faceta
  #end
</div>
```

### Problema: Paginação quebrada

**Debug em pageResults.vm:**
```velocity
<div style="background:yellow;padding:10px;">
  Start: $page.start<br>
  End: $page.end<br>
  Total: $page.results_found<br>
  Current: $page.current_page_number<br>
  Pages: $page.page_count
</div>
```

### Problema: Downloads não funcionam

**Verificar em nfe_doc.vm:**
```velocity
## URL deve ser montada corretamente:
#set($id = $doc.getFieldValue('id'))
#set($link = "https://eprocesso.suiterfb.receita.fazenda/eprocesso/api/documentos/${id}/obterbinario/download")

## Testar se $id tem valor:
<div>ID: $id</div>
<div>Link: $link</div>
```

### Problema: Autocomplete não funciona

**Verificar:**
1. jQuery está carregado? (`/js/jquery-3.6.0.js`)
2. jQuery UI está carregado? (`/js/jquery-ui.js`)
3. CSS do jQuery UI está carregado? (`/css/jquery-ui.css`)

## 📝 Diferenças Principais

### Antes (Sistema Antigo)

```velocity
## Tudo em query_form.vm com filtros inline
<form>
  <input name="q">
  <input name="grupo_processo_s">
  <input name="tipo_processo_s">
  <!-- 50+ campos de filtro -->
</form>
```

### Depois (Sistema Novo)

```velocity
## Busca no header
header.vm → Busca simples

## Filtros em dialog separado
dialogs/filtersDialog.vm → Filtros avançados

## Resultados em cards modernos
nfe_doc.vm → Card responsivo
```

## 🎨 Personalização

### Alterar Cores

Edite `variables.css`:
```css
:root {
    --color-primary: #1351B4;      /* Azul principal */
    --color-secondary: #FFCD07;    /* Amarelo */
    /* ... */
}
```

### Adicionar Campos nos Cards

Edite `nfe_doc.vm`:
```velocity
#if($doc.getFieldValue('seu_campo_s'))
    <div class="result-field" data-field="seu_campo_s">
        <span class="result-field-label">Seu Label:</span>
        <span class="result-field-value" data-copy>#field('seu_campo_s')</span>
    </div>
#end
```

### Adicionar Filtros

Edite `dialogs/filtersDialog.vm`:
```velocity
<div class="filter-field">
    <label class="filter-label">
        <span class="filter-label-text">Novo Filtro</span>
    </label>
    <div class="filter-input-group">
        <input type="text" class="filter-input" 
               id="novo_campo_s" name="novo_campo_s" 
               placeholder="Digite...">
        <button type="button" class="filter-operator contains">Contém</button>
    </div>
</div>
```

## 📞 Suporte

- **Documentação Velocity**: https://velocity.apache.org/
- **Documentação Solr**: https://solr.apache.org/
- **Design System Gov.br**: https://www.gov.br/ds/

## 🎯 Próximos Passos

Após migração completa:

1. **Otimizações de Performance**
   - Minificar CSS/JS
   - Lazy loading de imagens
   - Cache de facetas

2. **Melhorias UX**
   - Salvar filtros favoritos
   - Histórico de buscas
   - Exportação em lote

3. **Acessibilidade**
   - Navegação por teclado completa
   - ARIA labels
   - Contraste ajustável

4. **Analytics**
   - Rastreamento de buscas
   - Métricas de uso
   - Feedback de usuários