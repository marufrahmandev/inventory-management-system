# Inventory Management System

A full-stack Inventory Management System built with React.js (frontend) and Express.js (backend).

## Tech Stack

### Frontend

- **React.js 18** - Modern UI library with hooks
- **TypeScript** - Type-safe development
- **Redux Toolkit (RTK Query)** - State management and API caching
- **React Hook Form** - Form handling with validation
- **Zod** - Schema validation
- **TanStack Table** - Advanced data tables with sorting, filtering, and pagination
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **Lucide Icons** - Modern icon library
- **React Toastify** - Toast notifications
- **Vite** - Fast build tool and dev server

### Backend

- **Node.js & Express.js** - REST API server
- **Sequelize ORM** - Database ORM with MySQL
- **MySQL** - Relational database
- **JWT (jsonwebtoken)** - Authentication tokens
- **bcrypt** - Password hashing
- **Multer** - File upload handling
- **Cloudinary** - Image storage and optimization
- **Nodemailer** - Email notifications
- **dotenv** - Environment configuration

## Prerequisites

- **Node.js** (v16 or higher)
- **MySQL** (v8.0 or higher)
- **npm** or **yarn**
- **Cloudinary Account** (for image uploads) - [Sign up here](https://cloudinary.com/)

## Installation

### 1. Clone the Repository

```bash
git clone <repository-url>
cd inventory-management-system
```

### 2. Backend Setup

#### Install Dependencies

```bash
cd server
npm install
```

#### Configure Environment Variables

Create a `.env` file in the `server` directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development
API_VERSION=v1
# Optional: For production deployments with custom domain
# SERVER_HOST=yourdomain.com
# SERVER_PROTOCOL=https

# Frontend Configuration
FRONTEND_URL=http://localhost:5173
# For multiple frontend URLs, separate with commas:
# FRONTEND_URL=http://localhost:5173,http://localhost:3000

# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=inventory_management
DB_USER=root
DB_PASSWORD=your_mysql_password

# JWT Secret
JWT_SECRET=your_super_secret_jwt_key_change_in_production

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# Email Configuration (Optional)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_email_password
```

#### Initialize Database

```bash
# Create database and tables
node init-database.js

# (Optional) Seed sample data
node seed-database.js
```

#### Start Backend Server

```bash
npm start
```

Backend will run at `http://localhost:3000`

### 3. Frontend Setup

#### Install Dependencies

```bash
cd client
npm install
```

#### Configure API Base URL (Optional)

If your backend runs on a different port, update the `baseUrl` in RTK Query slices:

- `client/src/state/*/[module]Slice.ts`

Default: `http://localhost:3000/api`

#### Start Frontend Development Server

```bash
npm run dev
```

Frontend will run at `http://localhost:5173`

## Usage

### 1. Access the Application

Open your browser and navigate to: `http://localhost:5173`

### 2. Explore Features

- **Dashboard** - View KPIs, recent activity, and business overview
- **Catalog** - Manage categories and products
- **Contacts** - Add customers and suppliers
- **Purchase** - Create purchase orders
- **Sales** - Create sales orders and generate invoices
- **Reports** - View analytics and export reports
