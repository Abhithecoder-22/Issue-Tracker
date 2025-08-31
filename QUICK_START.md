#  Quick Start Guide

##  What's Done
-  Dependencies installed
-  Environment file created (`.env.local`)
-  JWT Secret generated
-  Scripts added to package.json

## 🔧 Next Steps

### 1. Setup Database (Neon - Free PostgreSQL)
1. Go to [neon.tech](https://neon.tech) and create a free account
2. Create a new project
3. Copy your database connection string
4. Update `DATABASE_URL` in `.env.local`

Your connection string should look like:
```
postgresql://username:password@ep-example-123456.us-east-1.aws.neon.tech/your-database-name?sslmode=require
```

### 2. Initialize Database
```bash
npm run db:init    # Create tables
npm run db:seed    # Add sample data
```

### 3. Start Development Server
```bash
npm run dev
```

### 4. Test the App
Open http://localhost:3000

**Default Login Credentials:**
- Admin: `admin@example.com` / `Admin1234!`
- User: `user@example.com` / `User1234!`

##  Key Features
-  **Authentication**: JWT with secure cookies
-  **RBAC**: Admin vs User permissions
-  **Issues CRUD**: Create, read, update, delete issues
-  **Comments**: Add comments to issues
-  **Filtering**: Status, pagination, search
-  **Modern UI**: React + Next.js + Tailwind CSS

##  Available Scripts
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:init      # Initialize database schema
npm run db:seed      # Add sample data
npm run db:migrate   # Apply database migrations
```

##  Docker Alternative (Optional)
If you prefer local PostgreSQL instead of Neon:

1. Update `DATABASE_URL` in `.env.local`:
   ```
   DATABASE_URL=postgresql://postgres:postgres@localhost:5432/issuetracker
   ```

2. Start PostgreSQL with Docker:
   ```bash
   docker-compose up -d
   ```

3. Initialize and seed the database:
   ```bash
   npm run db:init
   npm run db:seed
   ```
