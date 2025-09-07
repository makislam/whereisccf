# Where is CCF?

This is a web application to track where CCF members are across the globe. Users can sign in with Google, fill out their profile information, and see everyone's locations displayed on an interactive world map.

## Features

- 🔐 Google OAuth authentication
- 📝 User profile form (name, program, graduation year, location)
- 🗺️ Interactive world map with member locations
- 📱 Responsive design with Tailwind CSS
- 🎯 Built with Next.js 14 and TypeScript

## Tech Stack

- **Frontend**: Next.js 14, React, TypeScript, Tailwind CSS
- **Authentication**: NextAuth.js with Google Provider
- **Database**: SQLite with Prisma ORM
- **Maps**: Leaflet with React-Leaflet
- **Geocoding**: OpenStreetMap Nominatim API

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd whereisccf
npm install
```

### 2. Set up Environment Variables

Copy the example environment file:
```bash
copy .env.example .env.local
```

### 3. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" and create an OAuth 2.0 Client ID
5. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google`
   - `https://yourdomain.com/api/auth/callback/google` (for production)
6. Copy the Client ID and Client Secret to your `.env.local` file

### 4. Set up the Database

Initialize and generate the database:
```bash
npx prisma generate
npx prisma db push
```

### 5. Generate a NextAuth Secret

Generate a secure random string for NEXTAUTH_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Add this to your `.env.local` file.

### 6. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Environment Variables

Create a `.env.local` file with these variables:

```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-generated-secret-here
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Project Structure

```
whereisccf/
├── app/                    # Next.js 14 app directory
│   ├── api/               # API routes
│   │   ├── auth/          # NextAuth configuration
│   │   └── profile/       # Profile management API
│   ├── globals.css        # Global styles
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Home page
├── components/            # React components
│   ├── AuthProvider.tsx   # Authentication provider
│   ├── LoginButton.tsx    # Login/logout button
│   ├── UserForm.tsx       # Profile form
│   ├── WorldMap.tsx       # Map wrapper component
│   └── Map.tsx            # Leaflet map component
├── lib/                   # Utility libraries
│   └── prisma.ts          # Prisma client
├── prisma/                # Database schema and migrations
│   └── schema.prisma      # Database schema
└── README.md              # This file
```

## Usage

1. **Sign In**: Click "Sign in with Google" to authenticate
2. **Complete Profile**: Fill out the form with your:
   - Full name
   - Program/major
   - Graduation year (optional)
   - Current term (optional)
   - Location (city, state/province, country)
3. **View Map**: See all CCF members' locations on the interactive world map
4. **Explore**: Click on map markers to see member details

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Update `NEXTAUTH_URL` to your production domain
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Node.js. Make sure to:
- Set all environment variables
- Run `npm run build` to build the application
- Use `npm start` to run in production

## License

This project is open source and available under the [MIT License](LICENSE). 