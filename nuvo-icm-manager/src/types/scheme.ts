
export interface Scheme {
  id: string;
  name: string;
  description?: string;
  status: 'DRAFT' | 'APPROVED' | 'ACTIVE' | 'COMPLETED';
  startDate: string;
  endDate: string;
  clientId: string;
  createdAt: string;
  updatedAt: string;
}

export interface SchemeFormData {
  name: string;
  description?: string;
  startDate: string;
  endDate: string;
  kpis: SchemeKpi[];
}

export interface SchemeKpi {
  name: string;
  weight: number;
  threshold: number;
  target: number;
  max: number;
}
