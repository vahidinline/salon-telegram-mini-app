import { useEffect } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { BookingProvider } from './context/BookingContext';
import LanguageSwitcher from './components/LanguageSwitcher';
import Welcome from './pages/Welcome';
import ServiceList from './pages/ServiceList';
import EmployeeSelect from './pages/EmployeeSelect';
import CalendarSlots from './pages/CalendarSlots';
import ConfirmBooking from './pages/ConfirmBooking';
import BookingHistory from './pages/BookingHistory';
import { initTelegramWebApp } from './utils/telegram';
import Background from './assets/img/wallpaper.jpeg';

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
          style={{
            backgroundImage: `url(${Background})`,
          }}
          className="min-h-screen bg-gray-50 bg-gradient-to-b from-white to-blue-50 relative">
          <div className="fixed top-4 end-4 z-50">
            <LanguageSwitcher />
          </div>
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/services" element={<ServiceList />} />
            <Route path="/employees" element={<EmployeeSelect />} />
            <Route path="/calendar" element={<CalendarSlots />} />
            <Route path="/confirm" element={<ConfirmBooking />} />
            <Route path="/bookings" element={<BookingHistory />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </Router>
    </BookingProvider>
  );
}

export default App;
