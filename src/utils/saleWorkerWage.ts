import { SaleRecord, WorkerWageRecord } from '../types';

/** Build or refresh the single wage ledger entry belonging to a sale. */
export const createSaleWorkerWage = (
  sale: SaleRecord,
  existing?: WorkerWageRecord,
): WorkerWageRecord => {
  const totalWage = Math.max(0, Number(sale.laborCost) || 0);
  const requestedPaid = sale.laborPaidAmount ?? existing?.paidWage ?? 0;
  const paidWage = Math.min(totalWage, Math.max(0, Number(requestedPaid) || 0));
  const unitsOrHours = existing && existing.unitsOrHours > 0 ? existing.unitsOrHours : 1;
  const workerCount = existing?.workerCount || 1;
  const rateMultiplier = unitsOrHours * (existing?.workType === 'أجر يومي' ? workerCount : 1);

  return {
    id: existing?.id ?? `wage-sale-${sale.id}`,
    date: sale.date,
    workerOrLeaderName: existing?.workerOrLeaderName || sale.workerNotes?.trim() || `عمال بيع ${sale.buyerName}`,
    workType: existing?.workType ?? 'أجر مقطوع للورشة',
    workerCount,
    unitsOrHours,
    ratePerUnit: Number((totalWage / rateMultiplier).toFixed(2)),
    totalWage,
    paidWage,
    remainingWage: Number(Math.max(0, totalWage - paidWage).toFixed(2)),
    relatedSaleId: sale.id,
    notes: existing?.notes || `أجر مرتبط بعملية البيع #${sale.id}`,
    createdAt: existing?.createdAt ?? sale.createdAt,
  };
};

/** Upsert exactly one wage row for a sale and remove any duplicate linked rows. */
export const upsertSaleWorkerWage = (
  wages: WorkerWageRecord[],
  sale: SaleRecord,
): WorkerWageRecord[] => {
  const linked = wages.filter((wage) => wage.relatedSaleId === sale.id);
  if (sale.laborCost <= 0) {
    return wages.filter((wage) => wage.relatedSaleId !== sale.id);
  }

  const wage = createSaleWorkerWage(sale, linked[0]);
  return [wage, ...wages.filter((item) => item.relatedSaleId !== sale.id)];
};
