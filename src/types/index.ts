export interface Service {
  _id: string;
  name: string;
  duration: number;
  description?: string;
  price: number;
  employees?: string[];
}

export interface Employee {
  _id: string;
  name: string;
  services: string[];
  workDays: string[];
  startTime: string;
  endTime: string;
  avatar?: string;
  workSchedule?: string[];
}

export interface TimeSlot {
  start: string;
  end: string;
  slot?: string;
}

export interface Booking {
  _id?: string;
  salon: string;
  employee: Employee | string;
  service: Service | string;
  start: string;
  end: string;
  user?: string;
  phone?: string;
  telegramUserId?: number;
  status?: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt?: string;
}

export interface User {
  _id: string;
  phone: string;
  name?: string;
  telegramUserId?: number;
}

export interface BookingState {
  service: Service | null;
  employee: Employee | null;
  date: Date | null;
  slot: TimeSlot | null;
}
