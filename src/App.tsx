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
import BackButton from './components/GoBack';

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
          className="min-h-screen bg-cover bg-center">
          <div className="fixed flex flex-row justify-between top-4 end-4 z-50">
            {/* <LanguageSwitcher /> */}
            <BackButton />
          </div>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/services" element={<ServiceList />} />
            <Route path="/employees" element={<EmployeeSelect />} />
            <Route path="/calendar" element={<CalendarSlots />} />
            <Route path="/confirm" element={<ConfirmBooking />} />
            <Route path="/paymentinfo" element={<PaymentInfo />} />
            <Route path="/bookings" element={<BookingHistory />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </BookingProvider>
  );
}

export default App;
