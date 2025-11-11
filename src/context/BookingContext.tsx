import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Service, Employee, TimeSlot, BookingState } from '../types';

interface BookingContextType {
  bookingState: BookingState;
  setService: (service: Service) => void;
  setAdditionalService: (service: Service) => void;
  setEmployee: (employee: Employee) => void;
  setDateTime: (date: Date, slot: TimeSlot) => void;
  resetBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const [bookingState, setBookingState] = useState<BookingState>({
    service: null,
    additionalService: null,
    employee: null,
    date: null,
    slot: null,
  });

  const setService = (service: Service) => {
    setBookingState((prev) => ({
      ...prev,
      service,
      additionalService: null,
      employee: null,
      date: null,
      slot: null,
    }));
  };

  const setAdditionalService = (additional: Service) => {
    setBookingState((prev) => ({
      ...prev,
      additionalService: additional,
      employee: null,
      date: null,
      slot: null,
    }));
  };

  const setEmployee = (employee: Employee) => {
    setBookingState((prev) => ({ ...prev, employee, date: null, slot: null }));
  };

  const setDateTime = (date: Date, slot: TimeSlot) => {
    setBookingState((prev) => ({ ...prev, date, slot }));
  };

  const resetBooking = () => {
    setBookingState({
      service: null,
      additionalService: null,
      employee: null,
      date: null,
      slot: null,
    });
  };

  return (
    <BookingContext.Provider
      value={{
        bookingState,
        setService,
        setAdditionalService,
        setEmployee,
        setDateTime,
        resetBooking,
      }}>
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = () => {
  const context = useContext(BookingContext);
  if (context === undefined) {
    throw new Error('useBooking must be used within a BookingProvider');
  }
  return context;
};
