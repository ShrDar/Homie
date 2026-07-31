# Homie - Social Media Platform

I built this app - Homie to bring social media back to what it was meant to be: genuine connection and meaningful interaction. Most platforms today push endless short-form content that shortens our attention spans, so I wanted to create a space that does the opposite.

The app includes Posts, Add Friends - Homies, Direct Messaging (DMs) - Yap, and Teas, a simple way to share quick thoughts and updates. Each feature is designed to encourage authentic conversations and lasting connections.

This is my attempt to create a healthier and more intentional social media experience where people connect with each other instead of just consuming content.


## Features

### Core Features
- **User Authentication**: Secure login/signup with email/password and social providers
- **Posts Management**: Create, edit, delete, and react to posts with rich content
- **Real-time Messaging**: Private messaging system with read receipts
- **User Profiles**: Customizable profiles with bios, profile pictures, and activity feeds
- **Social Networking**: Friend request system with homie connections
- **Content Moderation**: Reporting system for inappropriate content
- **Notifications**: Real-time notifications for activities and messages

### Administrative Features
- **User Management**: Admin dashboard for user oversight
- **Content Moderation**: Tools for managing reported content
- **Analytics**: Insights into platform usage and engagement
- **Configuration**: System settings and feature toggles

### Technical Features
- **Responsive Design**: Mobile-first approach with adaptive UI
- **Theme Support**: Light and dark mode with customizable themes
- **Performance Optimization**: Lazy loading, code splitting, and caching
- **Accessibility**: WCAG compliant components and keyboard navigation
- **Internationalization**: Multi-language support ready

## Technologies

### Frontend
- **Framework**: Next JS
- **Styling**: Tailwind CSS with custom design system
- **State Management**: React Context and Server Components
- **Animations**: Motion library for smooth transitions
- **Icons**: Lucide React icons
- **Forms**: React Hook Form with validation
- **Image Handling**: Next.js Image optimization

### Backend
- **Server Framework**: Express JS
- **Database**: MongoDB with Prisma ORM
- **Authentication**: NextAuth.js with multiple providers
- **Real-time**: Firebase for notifications and messaging
- **Storage**: AppWrite for file uploads
- **API**: RESTful endpoints with Express routers

### Key Components

1. **Frontend**: Next JS application with server-side rendering and static generation
2. **Backend**: Express JS server providing RESTful API endpoints
3. **Database**: MongoDB with Prisma for type-safe data access
4. **Authentication**: NextAuth.js handling sessions and social logins
5. **Real-time**: Firebase for notifications and messaging
6. **Storage**: AppWrite for user-uploaded content

## Installation

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm 9+ or yarn 1.22+
- MongoDB 6.0+
- Firebase project (for real-time features using firestore)
- Appwrite instance (for file storage)

### Clone the Repository

```bash
git clone https://github.com/your-repository/homie.git
cd homie
```

### Install Dependencies

```bash
# Install frontend dependencies
cd homie
npm install

# Install backend dependencies
cd ../homie-server
npm install
```

## Configuration

### Environment Variables

Create `.env` files in both `homie` and `homie-server` directories:

#### Frontend (.env)
```env
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
NEXT_PUBLIC_APPWRITE_ENDPOINT=your-appwrite-endpoint
NEXT_PUBLIC_APPWRITE_PROJECT_ID=your-project-id
NEXT_PUBLIC_APPWRITE_BUCKET_ID=your-bucket-id
NEXT_PUBLIC_FIREBASE_CONFIG=your-firebase-config

DATABASE_URL=mongodb://localhost:27017/homie
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=http://localhost:3000
```

#### Backend (.env)
```env
PORT=8080
DATABASE_URL=mongodb://localhost:27017/homie
JWT_SECRET=your-jwt-secret
```

### Database Setup

1. Install and run MongoDB locally or use MongoDB Atlas
2. Run Prisma migrations:

```bash
cd homie
npx prisma generate
npx prisma migrate dev
```

## Running the Application

### Development Mode

```bash
# Start backend server (in one terminal)
cd homie-server
npm run dev

# Start frontend application (in another terminal)
cd homie
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080

### Production Build

```bash
# Build frontend
cd homie
npm run build

# Start production server
npm run start
```

## API Endpoints

### Authentication
- `POST /api/auth/[...nextauth]` - Authentication routes
- `POST /api/auth/recaptchaSubmit` - reCAPTCHA verification

### Users
- `GET /users` - Get all users
- `GET /users/:id` - Get specific user
- `PUT /users/:id` - Update user profile
- `DELETE /users/:id` - Delete user

### Posts
- `GET /posts` - Get all posts
- `POST /posts` - Create new post
- `GET /posts/:id` - Get specific post
- `PUT /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post

### Messaging (Yaps)
- `GET /yaps` - Get user conversations
- `POST /yaps` - Create new conversation
- `GET /yaps/:id` - Get conversation messages
- `POST /yaps/:id/messages` - Send message

### Social Features
- `POST /homies/request` - Send friend request
- `PUT /homies/accept` - Accept friend request
- `DELETE /homies/reject` - Reject friend request
- `GET /homies/:userId` - Get user's friends