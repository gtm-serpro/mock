import { CONFIG } from './core/config.js';

import { PageController } from './controllers/PageController.js';
import { SearchComponent } from './components/SearchComponent.js';
import { SidebarComponent } from './components/SidebarComponent.js';
import { AccordionComponent } from './components/AccordionComponent.js';
import { DropdownComponent } from './components/DropdownComponent.js';
import { FilterCounterComponent } from './components/FilterCounterComponent.js';
import { DialogComponent } from './components/DialogComponent.js';
import { FilterOperatorComponent } from './components/FilterOperatorComponent.js';
import { AutocompleteComponent } from './components/AutocompleteComponent.js';
import { CurrencyInputComponent } from './components/CurrencyInputComponent.js';
import { ResultCardComponent } from './components/ResultCardComponent.js';
import { KeyboardShortcuts } from './components/KeyboardShortcuts.js';

import './fieldsSelector.js'; // mantém comportamento atual

document.addEventListener('DOMContentLoaded', () => {
  const pageController = new PageController();
  const search = new SearchComponent();
  new SidebarComponent();
  new AccordionComponent(CONFIG.selectors.facetTitle);

  new DropdownComponent('downloadDropdown', 'downloadDropdownBtn');
  new DropdownComponent('accessibilityDropdown', 'accessibilityBtn');

  const filterCounter = new FilterCounterComponent('#filtersDialog');

  const filtersDialog = new DialogComponent('filtersDialog', {
    openBtnSelector: CONFIG.selectors.filterBtn,
    closeBtnId: 'filtersDialogCloseBtn',
    cancelBtnId: 'filtersDialogCancelBtn',
    clearBtnId: 'filtersDialogClearBtn',
    filterCounter
  });

  new FilterOperatorComponent();
  new AutocompleteComponent();
  new CurrencyInputComponent();

  const resultCards = new ResultCardComponent();

  document.addEventListener('search', (e) => {
    resultCards.setSearchTerm(e.detail.term);
    resultCards.renderResults(ResultCardComponent.getMockResults());
    pageController.showResults();
    filterCounter.updateCount();
    filtersDialog.close();
  });

  new KeyboardShortcuts([
    {
      key: 'k',
      ctrl: true,
      action: () => filtersDialog.toggle()
    }
  ]);

});
