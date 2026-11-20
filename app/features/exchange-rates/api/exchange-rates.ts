import type { ApiClient } from '~/shared/http/api-client';

export interface ExchangeRate {
  compra: number;
  venta: number;
  fecha: string;
  validFrom: string;
  lastCheckedAt: string;
}

export function getCurrentRate(api: ApiClient): Promise<ExchangeRate> {
  return api<ExchangeRate>('/v1/exchange-rates/current');
}
