# Supabase Auth with JWT - Next.js Example

This is a comprehensive authentication example built with Next.js, Supabase, and JWT tokens featuring session timeout functionality.

## Features

- **🔐 Supabase Authentication**: Email/password authentication with Supabase
- **🎫 JWT Token Management**: Custom JWT tokens generated after successful authentication
- **⏰ Session Timeout**: Configurable session timeout with automatic logout
- **🔄 Real-time Timer**: Visual countdown showing remaining session time
- **🛡️ Protected API Routes**: Middleware-protected API endpoints
- **📱 Responsive UI**: Modern, responsive design with Tailwind CSS
- **🔒 Auto-logout**: Automatic logout when session expires

## Tech Stack

- **Frontend**: Next.js 15 (App Router), React, TypeScript
- **Styling**: Tailwind CSS
- **Authentication**: Supabase Auth
- **Tokens**: JSON Web Tokens (JWT)
- **Deployment**: Vercel (recommended)

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
git clone <your-repo-url>
cd auth_test
npm install
```

### 2. Supabase Setup

1. Create a new project at [Supabase](https://supabase.com)
2. Go to Settings > API to get your keys
3. Copy your project URL and keys

### 3. Environment Variables

Create a `.env.local` file in the root directory:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Session timeout (in milliseconds) - 30 minutes default
SESSION_TIMEOUT=1800000
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── protected/          # Protected API routes
│   │   └── verify-token/       # JWT verification endpoint
│   ├── layout.tsx              # Root layout with AuthProvider
│   └── page.tsx               # Main page
├── components/
│   ├── Dashboard.tsx          # User dashboard
│   ├── LoginForm.tsx          # Authentication form
│   └── ProtectedApiTest.tsx   # API testing component
├── contexts/
│   └── AuthContext.tsx        # Authentication context
└── lib/
    ├── jwt.ts                 # JWT utilities
    └── supabase.ts            # Supabase client
```

## How It Works

### Authentication Flow

1. **User Registration/Login**: Users can sign up or sign in using email/password
2. **Supabase Authentication**: Supabase handles the authentication process
3. **JWT Generation**: Upon successful auth, a custom JWT token is generated
4. **Session Management**: The app tracks session time and automatically logs out users
5. **Protected Routes**: API routes are protected using JWT middleware

### Session Timeout

- Default timeout: 30 minutes (configurable via `SESSION_TIMEOUT`)
- Real-time countdown displayed to users
- Automatic logout when session expires
- Warning notifications when session is about to expire

### JWT Token Features

- Contains user ID and email
- Configurable expiration time
- Used for API authentication
- Stored in localStorage with automatic cleanup

## API Endpoints

### Public Endpoints
- `GET/POST /api/verify-token` - Verify JWT token validity

### Protected Endpoints
- `GET/POST /api/protected/user-data` - Example protected route

## Usage Examples

### Testing Protected APIs

1. Sign in to get a JWT token
2. Use the "Protected API Test" section in the dashboard
3. Test GET and POST requests to protected endpoints
4. View real-time API responses

### Custom JWT Integration

```typescript
import { generateJWTToken, verifyJWTToken } from '@/lib/jwt'

// Generate token
const token = generateJWTToken(userId, email)

// Verify token
const payload = verifyJWTToken(token)
```

## Customization

### Changing Session Timeout

Update the `SESSION_TIMEOUT` environment variable (in milliseconds):

```env
SESSION_TIMEOUT=3600000  # 1 hour
SESSION_TIMEOUT=900000   # 15 minutes
```

### Adding More Protected Routes

1. Create routes under `/api/protected/`
2. They'll automatically be protected by the middleware
3. Access user info via headers: `x-user-id`, `x-user-email`

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

Ensure your deployment platform supports:
- Node.js runtime
- Environment variables
- API routes

## Security Considerations

- JWT secrets should be cryptographically secure
- Use HTTPS in production
- Regularly rotate JWT secrets
- Consider implementing refresh tokens for longer sessions
- Validate and sanitize all user inputs

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - feel free to use this project as a starting point for your applications.

## Support

For issues and questions:
1. Check existing GitHub issues
2. Create a new issue with detailed description
3. Include steps to reproduce any bugs

---

Built with ❤️ using Next.js and Supabase
