import { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookingProvider } from './context/BookingContext';
import Welcome from './pages/Welcome';
import ServiceList from './pages/ServiceList';
import EmployeeSelect from './pages/EmployeeSelect';
import CalendarSlots from './pages/CalendarSlots';
import ConfirmBooking from './pages/ConfirmBooking';
import BookingHistory from './pages/BookingHistory';
import { initTelegramWebApp } from './utils/telegram';
import PaymentInfo from './pages/PaymentInfo';
import HeaderButtons from './components/HeaderButtons';
import BookingManagement from './pages/BookingManagement';
import AdditionalServiceList from './pages/AdditionalServices';
import WeeklyCalendar from './pages/WeeklyCalendar';

function App() {
  const { i18n } = useTranslation();

  useEffect(() => {
    initTelegramWebApp();

    const savedLang = localStorage.getItem('language') || 'fa';
    i18n.changeLanguage(savedLang);
    document.documentElement.dir = savedLang === 'fa' ? 'rtl' : 'ltr';
    document.documentElement.lang = savedLang;
  }, [i18n]);

  return (
    <BookingProvider>
      <Router>
        <div
          // style={{
          //   backgroundImage: `url(${Background})`,
          // }}
          className="">
          <div className="fixed flex flex-row h-50 z-50 w-full">
            <HeaderButtons />
          </div>
          <Routes>
            {/* <Route path="/" element={<Welcome />} /> */}
            <Route path="/services" element={<ServiceList />} />
            <Route
              path="/additionalservices"
              element={<AdditionalServiceList />}
            />
            <Route path="/employees" element={<EmployeeSelect />} />
            <Route path="/calendar" element={<CalendarSlots />} />
            <Route path="/confirm" element={<ConfirmBooking />} />
            <Route path="/paymentinfo" element={<PaymentInfo />} />
            <Route path="/bookings" element={<BookingHistory />} />
            <Route path="/bookingmanagement" element={<BookingManagement />} />
            <Route path="/" element={<WeeklyCalendar />} />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </BookingProvider>
  );
}

export default App;
