export type Currency = {
  code: string;
  symbol: string;
  name: string;
};

export type GrapeVariety = 
  | 'ورق عنب فرنسي نخب أول (طري وفاخر)'
  | 'ورق عنب فرنسي نخب ثاني (متوسط)'
  | 'ورق عنب فرنسي بلدي مشكّل'
  | 'ورق عنب فرنسي مفرّز / معبأ';

export type UnitType = 'كيلوغرام' | 'صندوق' | 'كرتونة' | 'شوال / ربطة';

export type PaymentStatus = 'مدفوع بالكامل' | 'دفعة جزئية' | 'آجل (غير مدفوع)';

export type PaymentMethod = 'نقدي (كاش)' | 'حوالة بنكية' | 'شيك' | 'دفع آجل';

export type AppTab = 'dashboard' | 'sales' | 'expenses' | 'workers' | 'calculator' | 'settings' | 'about';

export interface SaleRecord {
  id: string;
  date: string;
  buyerName: string;
  buyerPhone?: string;
  grapeVariety: GrapeVariety;
  quantity: number;
  unit: UnitType;
  /** Kilograms represented by one package unit; required for non-kg sales. */
  weightPerUnitKg?: number;
  unitPrice: number;
  laborCost: number; // أجار العمال المرتبط بالعملية
  /** Amount already paid to workers for this sale; separate from customer payments. */
  laborPaidAmount?: number;
  totalAmount: number; // الكمية × السعر الإفرادي
  netAmount: number; // المجموع - أجار العمال
  paidAmount: number;
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  workerNotes?: string; // تفاصيل العمال / الورشة
  notes?: string;
  createdAt: string;
}

export type ExpenseCategory = 
  | 'مستلزمات وأقفاص القطاف'
  | 'محروقات وري ومياه'
  | 'أسمدة ومبيدات وعناية'
  | 'أجور نقل وشحن وتوصيل'
  | 'طعام وضيافة الورشة'
  | 'صيانة شبكات وأدوات'
  | 'مصاريف أخرى ونثريات';

export interface ExpenseRecord {
  id: string;
  date: string;
  title: string;
  category: ExpenseCategory;
  amount: number;
  paidTo: string;
  paymentMethod: 'نقدي (كاش)' | 'حوالة' | 'آجل';
  notes?: string;
  createdAt: string;
}

export type WorkerPaymentType = 'أجر يومي' | 'أجر بالوزن (بالكيلو)' | 'أجر بالصندوق' | 'أجر مقطوع للورشة';

export interface WorkerWageRecord {
  id: string;
  date: string;
  workerOrLeaderName: string; // اسم العامل أو رئيس الورشة
  workType: WorkerPaymentType;
  workerCount: number;
  unitsOrHours: number; // عدد الكيلوات أو الصناديق أو الأيام
  ratePerUnit: number; // سعر اليومية أو الكيلو
  totalWage: number;
  paidWage: number;
  remainingWage: number;
  relatedSaleId?: string;
  notes?: string;
  createdAt: string;
}

export interface SeasonSettings {
  seasonName: string;
  farmName: string;
  farmerName: string;
  location: string;
  currency: string;
  targetHarvestKg: number;
  seasonStartDate: string;
}
