# Holidaze - Accommodation Booking Platform

A modern front-end application for Holidaze, an accommodation booking site that allows users to browse venues, make bookings, and enables venue managers to manage their properties and bookings.

## Features

### All Users

- View a list of venues
- Search and filter venues by location, price, guests, amenities, and more
- **Search by city and date from home page** - Search bar redirects to filtered venue list
- View detailed venue pages with images, amenities, and descriptions
- Register as Customer or Venue Manager (requires stud.noroff.no email)
- View availability calendar with booked dates clearly marked
- Date pickers that exclude unavailable dates

### Customers

- Log in and log out
- **Create bookings** - Full API integration for creating bookings
- **View upcoming bookings** - Fetched from API with venue details
- **Edit bookings** - Update check-in/check-out dates and number of guests
- **Cancel bookings** - Delete bookings via API
- **Update avatar/profile picture** - Saves to API via profile update endpoint
- Browse and search venues

### Venue Managers

- Log in and log out
- Create, edit, and delete venues
- **View upcoming bookings for their venues** - Fetched from API for all owned venues
- **Update avatar/profile picture** - Saves to API via profile update endpoint
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
- **Venues**: `/holidaze/venues`, `/holidaze/venues/:id`, `/holidaze/profiles/:name/venues`
- **Bookings**:
  - `GET /holidaze/bookings` - Get all bookings for authenticated user
  - `GET /holidaze/bookings?_venue=true` - Get bookings with venue data
  - `GET /holidaze/profiles/:name/bookings?_venue=true` - Get bookings for specific user
  - `GET /holidaze/venues/:id?_bookings=true` - Get bookings for a venue
  - `POST /holidaze/bookings` - Create a new booking
  - `PUT /holidaze/bookings/:id` - Update a booking
  - `DELETE /holidaze/bookings/:id` - Delete a booking
- **Profiles**:
  - `GET /holidaze/profiles/:name` - Get profile data
  - `PUT /holidaze/profiles` - Update profile (including avatar)
  - `DELETE /auth/profile` - Delete profile

### Authentication

The app uses Bearer token authentication. Tokens are stored in `localStorage` and automatically included in API requests when available.

## Routes

| Route                      | Component             | Description                       |
| -------------------------- | --------------------- | --------------------------------- |
| `/`                        | HomePage              | Landing page with featured venues |
| `/venues`                  | VenueList             | Browse and search all venues      |
| `/venue/:id`               | VenueDetails          | View venue details and book       |
| `/login/user`              | UserLogin             | Customer login                    |
| `/register/user`           | UserRegister          | Customer registration             |
| `/login/venue-manager`     | VenueManagerLogin     | Venue manager login               |
| `/register/venue-manager`  | VenueManagerRegister  | Venue manager registration        |
| `/user/profile`            | UserProfile           | Customer profile and bookings     |
| `/venue-manager/dashboard` | VenueManagerDashboard | Venue manager dashboard           |

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
6. **Booking is created via API** (`POST /holidaze/bookings`)
7. Confirmation modal displays booking details
8. **Venue calendar automatically updates** to show new booking

### Booking Management

- **Create Booking**: Customers can create bookings from venue detail pages
- **Edit Booking**: Customers can edit booking dates and guests from their profile
- **Cancel Booking**: Customers can cancel bookings, which removes them via API
- **View Bookings**:
  - Customers see their own bookings in `/user/profile`
  - Venue managers see bookings for all their venues in `/venue-manager/dashboard`
  - Bookings are fetched from API with venue details included

### Venue Management

- Venue managers can create venues with:
  - Name, location, description
  - Price and max guests
  - Images (URLs only, no base64)
  - Amenities (WiFi, Parking, Pet Friendly, Breakfast)
- Edit existing venues
- Delete venues
- **View bookings for their venues** - Fetched from API for all owned venues
- Bookings automatically refresh when venues are created/updated/deleted

### Search Functionality

- **Home Page Search**: Users can search by city and date from the home page
- Search redirects to `/venues` with URL parameters (`?city=Oslo&checkIn=2024-01-01`)
- Venue list page automatically filters by city when URL parameters are present
- Search supports city name extraction from "City, Country" format

### Profile Management

- **Avatar Updates**: Both customers and venue managers can update their profile pictures
- Avatar changes are saved to API via `PUT /holidaze/profiles`
- Profile data is fetched from API on component mount
- Changes persist across sessions via localStorage and API

## API Integration Details

### Booking API

The booking system is fully integrated with the Noroff API:

- **Creating Bookings**: Requires authentication, sends `dateFrom`, `dateTo`, `guests`, and `venueId`
- **Updating Bookings**: Allows changing dates and guests for existing bookings
- **Fetching Bookings**:
  - Customers: Uses `/holidaze/profiles/:name/bookings?_venue=true` or filters from `/holidaze/bookings`
  - Venue Managers: Fetches bookings for each owned venue via `/holidaze/venues/:id?_bookings=true`
- **Booking Data Structure**: Bookings include venue details, customer info, dates, and calculated total price

### Profile API

- **Avatar Updates**: Profile pictures are saved as base64 data URLs (API accepts this format)
- **Profile Fetching**: Profile data is fetched on component mount and cached in localStorage
- **Update Endpoint**: `PUT /holidaze/profiles` accepts avatar, name, email, bio, and other profile fields

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
- Bookings are fetched when venue page loads and refreshed after new bookings

### Bookings Not Appearing

- **For Customers**: Ensure you're logged in and bookings are fetched from `/holidaze/profiles/:name/bookings`
- **For Venue Managers**: Bookings are fetched for all owned venues - check console for fetch errors
- Verify that bookings have `venueId` or `venue.id` in the API response
- Check that venue data includes bookings when fetched with `?_bookings=true`

### Avatar Not Saving

- Check browser console for API errors
- Verify authentication token is present (user must be logged in)
- Ensure API endpoint `/holidaze/profiles` accepts PUT requests
- Avatar is saved as base64 data URL - API must accept this format

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
