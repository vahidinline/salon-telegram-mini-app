# Telegram WebApp Salon Booking Client

A modern, multilingual React Telegram WebApp for booking salon services. Built with React, TypeScript, Tailwind CSS, GSAP animations, and full RTL support for Farsi/Arabic.

## Features

- **Multilingual**: Farsi (default) and English with RTL support
- **Telegram Integration**: Native Telegram WebApp APIs
- **Jalali Calendar**: Full Persian calendar support for Farsi users
- **OTP Authentication**: Phone number verification via SMS
- **GSAP Animations**: Smooth, delightful animations throughout
- **Mobile-First**: Optimized for mobile devices
- **Booking Flow**: Complete service → employee → date/time → confirmation flow
- **Booking History**: View and cancel bookings

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development
- **React Router** for navigation
- **i18next** for internationalization
- **dayjs + jalaliday** for Jalali calendar
- **GSAP** for animations
- **Axios** for API calls
- **Tailwind CSS** for styling
- **Telegram WebApp JS** for Telegram integration

## Environment Variables

Create a `.env.local` file in the root directory:

```env
VITE_API_BASE=https://api.example.com
VITE_SALON_ID=651a6b2f8b7a5a1d223e4c90
```

## Installation

```bash
npm install
```

## Development

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

### Testing with Telegram WebApp Locally

For local development, the app includes mock Telegram user data when `import.meta.env.DEV` is true. To test with real Telegram WebApp:

1. Deploy to a public URL (e.g., Vercel, Netlify)
2. Create a Telegram Bot via [@BotFather](https://t.me/BotFather)
3. Set the WebApp URL using `/setmenubutton` or inline button
4. Open the WebApp from Telegram

To simulate Telegram WebApp locally, you can manually set:

```javascript
window.Telegram = {
  WebApp: {
    initDataUnsafe: {
      user: {
        id: 123456789,
        first_name: 'Test',
        last_name: 'User',
        username: 'testuser',
        language_code: 'fa',
      },
    },
    ready: () => {},
    expand: () => {},
    // ... other methods
  },
};
```

## API Contract

The app expects these backend endpoints:

### Services

**GET** `/salons/:salonId/services`

Response:

```json
[
  {
    "_id": "service1",
    "name": "Haircut",
    "duration": 30,
    "description": "Professional haircut",
    "price": 50000,
    "employees": ["emp1", "emp2"]
  }
]
```

### Employees

**GET** `/salons/:salonId/employees?service=serviceId`

Response:

```json
[
  {
    "_id": "emp1",
    "name": "John Doe",
    "services": ["service1"],
    "workDays": ["Saturday", "Sunday", "Monday"],
    "startTime": "09:00",
    "endTime": "17:00",
    "avatar": "https://example.com/avatar.jpg"
  }
]
```

### Availability

**GET** `/availability?employee=empId&service=serviceId&date=YYYY-MM-DD`

Response:

```json
[
  {
    "start": "2025-10-05T09:00:00Z",
    "end": "2025-10-05T09:30:00Z"
  },
  {
    "start": "2025-10-05T10:00:00Z",
    "end": "2025-10-05T10:30:00Z"
  }
]
```

### Authentication

**POST** `/auth/send-otp`

Request:

```json
{
  "phone": "09123456789",
  "telegramUserId": 123456789
}
```

Response:

```json
{
  "success": true
}
```

**POST** `/auth/verify-otp`

Request:

```json
{
  "phone": "09123456789",
  "code": "1234"
}
```

Response:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "user1",
    "phone": "09123456789",
    "name": "User Name"
  }
}
```

### Booking

**POST** `/book`

Request:

```json
{
  "salon": "salonId",
  "employee": "empId",
  "service": "serviceId",
  "start": "2025-10-05T09:00:00Z",
  "end": "2025-10-05T09:30:00Z",
  "user": "userId",
  "phone": "09123456789",
  "telegramUserId": 123456789
}
```

Response:

```json
{
  "_id": "booking1",
  "salon": "salonId",
  "employee": { ... },
  "service": { ... },
  "start": "2025-10-05T09:00:00Z",
  "end": "2025-10-05T09:30:00Z",
  "status": "confirmed",
  "createdAt": "2025-10-05T08:00:00Z"
}
```

### Bookings

**GET** `/bookings?user=userId`

Response:

```json
[
  {
    "_id": "booking1",
    "salon": "salonId",
    "employee": { ... },
    "service": { ... },
    "start": "2025-10-05T09:00:00Z",
    "end": "2025-10-05T09:30:00Z",
    "status": "confirmed"
  }
]
```

**DELETE** `/bookings/:bookingId`

Response:

```json
{
  "success": true
}
```

### Notifications

**POST** `/notifications`

Request:

```json
{
  "type": "booking_created",
  "userId": "user1",
  "bookingDetails": { ... }
}
```

## Project Structure

```
src/
├── components/           # Reusable components
│   ├── LanguageSwitcher.tsx
│   ├── LoadingSpinner.tsx
│   ├── PhoneOTP.tsx
│   ├── SlotCard.tsx
│   └── TeleButton.tsx
├── context/             # React Context
│   └── BookingContext.tsx
├── hooks/               # Custom hooks
│   └── useAnimations.ts
├── pages/               # Page components
│   ├── Welcome.tsx
│   ├── ServiceList.tsx
│   ├── EmployeeSelect.tsx
│   ├── CalendarSlots.tsx
│   ├── ConfirmBooking.tsx
│   └── BookingHistory.tsx
├── types/               # TypeScript types
│   └── index.ts
├── utils/               # Utilities
│   ├── api.ts
│   └── telegram.ts
├── App.tsx              # Main app component
├── i18n.ts              # i18n configuration
├── main.tsx             # Entry point
└── index.css            # Global styles
```

## Features Detail

### Multilingual Support

- Default language: Farsi (فارسی)
- Switch between Farsi and English
- Full RTL support for Farsi
- Jalali calendar for Farsi, Gregorian for English
- Persistent language preference

### Telegram Integration

- Reads user info from Telegram WebApp
- Uses Telegram's native UI elements (alerts, confirms)
- Optimized for Telegram's mobile interface
- Mock data available for local development

### Booking Flow

1. **Welcome**: Greeting with user's Telegram name
2. **Services**: Browse and search services
3. **Employees**: Select available employee
4. **Calendar & Slots**: Pick date and time slot
5. **Confirmation**: Phone verification via OTP
6. **Success**: Animated success screen

### Animations

- Welcome screen entrance with staggered buttons
- Service list items with hover effects
- Calendar transitions
- Booking confirmation celebration
- Respects `prefers-reduced-motion`

## Build

```bash
npm run build
```

The build output will be in the `dist/` directory.

## Type Checking

```bash
npm run typecheck
```

## Linting

```bash
npm run lint
```

## Deployment

The app can be deployed to any static hosting service:

- **Vercel**: `vercel deploy`
- **Netlify**: `netlify deploy`
- **GitHub Pages**: Build and push `dist/` folder

Make sure to set environment variables in your hosting platform.

## Mock Server (Optional)

For development without a backend, create mock endpoints using tools like:

- **JSON Server**: `npm install -g json-server`
- **MSW (Mock Service Worker)**
- **Postman Mock Server**

Example `db.json` for JSON Server:

```json
{
  "services": [
    {
      "_id": "1",
      "name": "Haircut",
      "duration": 30,
      "price": 50000,
      "description": "Professional haircut"
    }
  ],
  "employees": [
    {
      "_id": "1",
      "name": "John Doe",
      "services": ["1"],
      "workDays": ["Saturday", "Sunday"],
      "startTime": "09:00",
      "endTime": "17:00"
    }
  ]
}
```

Run: `json-server --watch db.json --port 3001`

## Browser Support

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Mobile browsers (iOS Safari, Chrome Mobile)
- Telegram in-app browser

## License

MIT

## Support

For issues or questions, please open an issue on GitHub.
