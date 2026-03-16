import { CacheService } from '../services/CacheService.js';
import { eventBus } from '../utils/EventBus.js';

const MAP_STYLES = {
  standard:  { name: 'Estándar',    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png' },
  satellite: { name: 'Satélite',    url: '...' },
  dark:      { name: 'Oscuro',      url: '...' },
  nautical:  { name: 'Náutico',     url: '...' },
};

export class MapStyleSelector {
  #currentStyle;

  constructor(containerEl) {
    this.container = containerEl;
    this.#currentStyle = CacheService.get('mapStyle') || 'standard';
    this.render();
  }

  render() { /* renderiza botones/selector */ }

  selectStyle(styleKey) {
    this.#currentStyle = styleKey;
    CacheService.set('mapStyle', styleKey);       // Persiste en localStorage
    eventBus.emit('mapStyle:changed', MAP_STYLES[styleKey]);
  }
}