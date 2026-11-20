import type { Currency } from './currency';
import type { Quote } from './quote';

export interface ExchangePreview {
  cents: number;
  from: Currency;
  to: Currency;
  quote: Quote;
}
