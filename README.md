# Holidaze - Accommodation Booking Platform

A modern front-end application for Holidaze, an accommodation booking site that allows users to browse venues, make bookings, and enables venue managers to manage their properties and bookings.

## Features

### All Users
- View a list of venues
- Search and filter venues by location, price, guests, amenities, and more
- View detailed venue pages with images, amenities, and descriptions
- Register as Customer or Venue Manager (requires stud.noroff.no email)
- View availability calendar with booked dates clearly marked
- Date pickers that exclude unavailable dates

### Customers
- Log in and log out
- Create bookings with date selection
- View upcoming bookings
- Update avatar/profile picture
- Browse and search venues

### Venue Managers
- Log in and log out
- Create, edit, and delete venues
- View upcoming bookings for their venues
- Update avatar/profile picture
- Manage venue availability

## Technologies

- **React 18.2.0** - UI library
- **TypeScript 5.2.2** - Type safety
- **Vite 5.0.8** - Build tool and dev server
- **React Router DOM 6.20.0** - Routing
- **Tailwind CSS 3.4.0** - Styling
- **React DatePicker 4.25.0** - Date selection

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher recommended)
- **npm** (comes with Node.js) or **yarn**
- **Git**

## 🔧 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Marshflair1988/Project-Exam-2-Holidaze
   cd Project-Exam-2-Holidaze
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   VITE_NOROFF_API_BASE_URL=
   VITE_NOROFF_API_KEY=your-api-key-here
   ```
   
   **Important:** The `.env` file is already in `.gitignore` and will not be committed to version control.

4. **Get your API credentials**
   - Visit the [Noroff API documentation](https://v2.api.noroff.dev/docs)
   - Register/login to get your API key
   - Add your API key to the `.env` file

## Running the Project

### Development Mode

Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173` (or the next available port).

### Build for Production

Create an optimized production build:

```bash
npm run build
```

The built files will be in the `dist` directory.

### Preview Production Build

Preview the production build locally:

```bash
npm run preview
```

### Linting

Run ESLint to check for code issues:

```bash
npm run lint
```

## API Configuration

The application uses the Noroff Holidaze API. All API calls are configured in `src/services/api.ts`.

### API Endpoints Used

- **Authentication**: `/auth/register`, `/auth/login`
- **Venues**: `/holidaze/venues`
- **Bookings**: `/holidaze/bookings`
- **Profiles**: `/holidaze/profiles`

### Authentication

The app uses Bearer token authentication. Tokens are stored in `localStorage` and automatically included in API requests when available.

## Routes

| Route | Component | Description |
|-------|-----------|-------------|
| `/` | HomePage | Landing page with featured venues |
| `/venues` | VenueList | Browse and search all venues |
| `/venue/:id` | VenueDetails | View venue details and book |
| `/login/user` | UserLogin | Customer login |
| `/register/user` | UserRegister | Customer registration |
| `/login/venue-manager` | VenueManagerLogin | Venue manager login |
| `/register/venue-manager` | VenueManagerRegister | Venue manager registration |
| `/user/profile` | UserProfile | Customer profile and bookings |
| `/venue-manager/dashboard` | VenueManagerDashboard | Venue manager dashboard |

## Styling

The project uses **Tailwind CSS** for styling with custom color palette defined in `tailwind.config.js`:

- `holidaze-gray` - Primary text color
- `holidaze-light-gray` - Secondary text color
- `holidaze-border` - Border color
- Custom blue accent: `#0369a1` - Used for buttons and header

## Environment Variables

Required environment variables (in `.env`):

```env
VITE_NOROFF_API_BASE_URL=https://v2.api.noroff.dev
VITE_NOROFF_API_KEY=your-api-key-here
```

**Note:** All environment variables must be prefixed with `VITE_` to be accessible in the React application.

## Key Features Implementation

### Date Selection & Availability

- Date pickers automatically exclude booked dates
- Calendar shows available dates in **bold** and unavailable dates in normal weight
- Booked dates are non-selectable
- Date ranges are validated (check-out must be after check-in)

### Booking Flow

1. User selects check-in and check-out dates
2. Selects number of guests
3. Clicks "Book Now" button
4. Booking modal opens with pre-filled information
5. User confirms booking
6. Confirmation modal displays booking details

### Venue Management

- Venue managers can create venues with:
  - Name, location, description
  - Price and max guests
  - Images (URLs only, no base64)
  - Amenities (WiFi, Parking, Pet Friendly, Breakfast)
- Edit existing venues
- Delete venues
- View bookings for their venues

## Troubleshooting

### API Key Issues

If you see errors about missing API key:
1. Ensure `.env` file exists in the root directory
2. Check that `VITE_NOROFF_API_KEY` is set correctly
3. Restart the dev server after changing `.env`

### Date Picker Not Showing Booked Dates

- Check browser console for booking fetch errors
- Verify API endpoint is returning booking data
- Ensure bookings have valid `dateFrom` and `dateTo` fields

### Build Errors

- Run `npm install` to ensure all dependencies are installed
- Clear `node_modules` and reinstall if issues persist:
  ```bash
  rm -rf node_modules package-lock.json
  npm install
  ```

## Additional Resources

- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)
- [Vite Documentation](https://vitejs.dev/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [React Router Documentation](https://reactrouter.com/)
- [Noroff API Documentation](https://v2.api.noroff.dev/docs)

