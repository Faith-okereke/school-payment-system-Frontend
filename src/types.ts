
export interface User {
  id: string;
  full_name: string;
  email: string;
  username: string;
  department?: string;
  level?: string;
}

export interface Payment {
  id: string;
  reference: string;
  amount: number;
  status: 'pending' | 'success' | 'failed';
  date: string;
  purpose: string;
  session: string;
}

export interface ApiResponse<T> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

export interface FeeStructure {
  level: string;
  amount: number;
  breakdown: { item: string; price: number }[];
}
