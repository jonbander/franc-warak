import { SaleRecord } from '../types';

/** Returns known kilograms; historical package sales without a recorded weight are not guessed. */
export const getSaleKgEquivalent = (sale: SaleRecord): number => {
  if (sale.unit === 'كيلوغرام') return sale.quantity;
  const weight = sale.weightPerUnitKg;
  return typeof weight === 'number' && Number.isFinite(weight) && weight > 0
    ? sale.quantity * weight
    : 0;
};
