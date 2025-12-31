# Inventory Management System

A full-stack, production-ready **Inventory Management System** built with **React.js** (frontend) and **Express.js** (backend), featuring comprehensive CRUD operations, authentication, and real-time analytics.

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [System Architecture](#system-architecture)
- [Installation](#installation)
- [Usage](#usage)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### Core Modules
- **📦 Product Management** - Complete CRUD operations with image uploads (Cloudinary)
- **📂 Category Management** - Hierarchical categories with parent-child relationships
- **📊 Stock Management** - Real-time inventory tracking with low-stock alerts
- **🛒 Sales Orders** - Customer orders with multi-item support and status tracking
- **🛍️ Purchase Orders** - Supplier purchase orders with automated stock updates
- **💰 Invoices** - Invoice generation linked to sales orders with payment tracking
- **👥 Customer Management** - Customer profiles with contact information
- **🏭 Supplier Management** - Supplier management with contact details
- **📈 Reports & Analytics** - Dashboard with KPIs, sales trends, and inventory insights

### Additional Features
- **🔐 User Authentication** - JWT-based authentication with role-based access control (Admin, Manager, Staff, Viewer)
- **💳 Payment Tracking** - Multi-method payment tracking (Cash, Credit Card, Bank Transfer, etc.)
- **📝 Audit Logs** - Complete activity tracking for compliance and security
- **🔔 Notifications** - Low-stock alerts and system notifications
- **⚙️ Settings** - Company info, tax rates, currency, and email configuration
- **🔄 Returns Management** - Sales and purchase returns with refund processing
- **🔍 Advanced Search** - Real-time search and filtering across all modules
- **📱 Responsive UI** - Mobile-friendly interface with modern design

---

## 🛠️ Tech Stack

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

---

## 🏗️ System Architecture

```
inventory-management-system/
├── client/                    # React Frontend
│   ├── src/
│   │   ├── components/        # Reusable UI components
│   │   ├── elements/          # Form elements (Input, Select, etc.)
│   │   ├── pages/             # Page components (Categories, Products, etc.)
│   │   ├── state/             # Redux slices and RTK Query APIs
│   │   ├── configs/           # Configuration files (navbar, toast, etc.)
│   │   ├── types/             # TypeScript type definitions
│   │   └── routes.tsx         # Application routing
│   └── package.json
│
├── server/                    # Express Backend
│   ├── config/                # Database and environment config
│   ├── controllers/           # Business logic controllers
│   ├── models/                # Sequelize models
│   ├── routes/                # API route definitions
│   ├── middleware/            # Authentication and validation middleware
│   ├── utils/                 # Helper utilities (Cloudinary, email, etc.)
│   ├── uploads/               # Temporary file storage
│   ├── init-database.js       # Database initialization script
│   ├── seed-database.js       # Sample data seeding script
│   └── server.js              # Express app entry point
│
└── README.md                  # This file
```

---

## 🚀 Installation

### Prerequisites
- **Node.js** (v16 or higher)
- **MySQL** (v8.0 or higher)
- **npm** or **yarn**
- **Cloudinary Account** (for image uploads) - [Sign up here](https://cloudinary.com/)

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

---

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

---

## 📖 Usage

### 1. Access the Application
Open your browser and navigate to: `http://localhost:5173`

### 2. Login (Optional - if authentication is enabled)
- **Default Admin Account:**
  - Email: `admin@inventory.com`
  - Password: `admin123`

### 3. Explore Features
- **Dashboard** - View KPIs, recent activity, and business overview
- **Catalog** - Manage categories and products
- **Contacts** - Add customers and suppliers
- **Purchase** - Create purchase orders
- **Sales** - Create sales orders and generate invoices
- **Reports** - View analytics and export reports

---

## 📂 Project Structure

### Frontend (`client/src/`)
```
src/
├── components/
│   ├── DashboardLayout.tsx          # Main layout wrapper
│   ├── SideBar.tsx                  # Desktop navigation
│   ├── MobileSideBarOverlay.tsx     # Mobile navigation
│   └── TanstackTable/               # Reusable table component
├── elements/
│   ├── Input.tsx                    # Form input component
│   ├── Select.tsx                   # Dropdown component
│   ├── Textarea.tsx                 # Textarea component
│   ├── FileInput.tsx                # File upload component
│   └── Button.tsx                   # Button component
├── pages/
│   ├── Auth/                        # Login & Signup pages
│   ├── Categories/                  # Category CRUD pages
│   ├── Products/                    # Product CRUD pages
│   ├── Stocks/                      # Stock CRUD pages
│   ├── SalesOrders/                 # Sales Order CRUD pages
│   ├── PurchaseOrders/              # Purchase Order CRUD pages
│   ├── Invoices/                    # Invoice CRUD pages
│   ├── Customers/                   # Customer CRUD pages
│   ├── Suppliers/                   # Supplier CRUD pages
│   ├── Reports/                     # Reports and analytics
│   └── Home.tsx                     # Dashboard page
├── state/
│   ├── categories/categorySlice.ts  # Category API slice
│   ├── products/productSlice.ts     # Product API slice
│   ├── auth/authSlice.ts            # Auth API slice
│   └── store.ts                     # Redux store configuration
├── configs/
│   ├── navbar.tsx                   # Navigation configuration
│   └── toast.ts                     # Toast notification config
└── routes.tsx                       # Application routes
```

### Backend (`server/`)
```
server/
├── config/
│   ├── database.js                  # Sequelize connection (singleton)
│   └── env.config.js                # Environment variables
├── controllers/
│   ├── categoryController.js        # Category logic
│   ├── productController.js         # Product logic
│   ├── authController.js            # Authentication logic
│   └── [other controllers]
├── models/
│   ├── index.js                     # Model associations
│   ├── categoryModel.js             # Category model
│   ├── productModel.js              # Product model
│   └── [other models]
├── routes/
│   ├── index.js                     # Route aggregator
│   ├── category.routes.js           # Category routes
│   ├── product.routes.js            # Product routes
│   ├── auth.routes.js               # Auth routes
│   └── [other routes]
├── middleware/
│   └── auth.middleware.js           # JWT authentication
├── utils/
│   ├── cloudinaryHelper.js          # Image upload utility
│   └── emailHelper.js               # Email sending utility
└── server.js                        # Express app entry point
```

---

## 📡 API Documentation

### Base URL
```
http://localhost:3000/api
```

### Authentication Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/signup` | Register new user |
| POST | `/auth/login` | Login user |
| POST | `/auth/logout` | Logout user |
| GET | `/auth/profile` | Get user profile |

### Category Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/categories` | Get all categories |
| GET | `/categories/:id` | Get category by ID |
| POST | `/categories` | Create new category |
| PUT | `/categories/:id` | Update category |
| DELETE | `/categories/:id` | Delete category |

### Product Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/products` | Get all products |
| GET | `/products/:id` | Get product by ID |
| GET | `/products/category/:categoryId` | Get products by category |
| POST | `/products` | Create new product |
| PUT | `/products/:id` | Update product |
| DELETE | `/products/:id` | Delete product |

### Stock Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/stocks` | Get all stocks |
| GET | `/stocks/:id` | Get stock by ID |
| GET | `/stocks/product/:productId` | Get stocks by product |
| GET | `/stocks/low-stock` | Get low stock items |
| POST | `/stocks` | Create new stock entry |
| PUT | `/stocks/:id` | Update stock |
| DELETE | `/stocks/:id` | Delete stock |

### Sales Order Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/sales-orders` | Get all sales orders |
| GET | `/sales-orders/:id` | Get sales order by ID |
| POST | `/sales-orders` | Create new sales order |
| PUT | `/sales-orders/:id` | Update sales order |
| DELETE | `/sales-orders/:id` | Delete sales order |

### Purchase Order Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/purchase-orders` | Get all purchase orders |
| GET | `/purchase-orders/:id` | Get purchase order by ID |
| POST | `/purchase-orders` | Create new purchase order |
| PUT | `/purchase-orders/:id` | Update purchase order |
| DELETE | `/purchase-orders/:id` | Delete purchase order |

### Invoice Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/invoices` | Get all invoices |
| GET | `/invoices/:id` | Get invoice by ID |
| POST | `/invoices` | Create new invoice |
| PUT | `/invoices/:id` | Update invoice |
| DELETE | `/invoices/:id` | Delete invoice |

### Customer & Supplier Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/customers` | Get all customers |
| POST | `/customers` | Create new customer |
| GET | `/suppliers` | Get all suppliers |
| POST | `/suppliers` | Create new supplier |

### Report Endpoints
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports/dashboard` | Get dashboard statistics |
| GET | `/reports/sales` | Get sales reports |
| GET | `/reports/purchases` | Get purchase reports |
| GET | `/reports/invoices` | Get invoice reports |
| GET | `/reports/inventory` | Get inventory reports |

---

## 🎨 Screenshots

### Dashboard
![Dashboard](./screenshots/dashboard.png)

### Product Management
![Products](./screenshots/products.png)

### Sales Orders
![Sales Orders](./screenshots/sales-orders.png)

*(Add actual screenshots to `/screenshots` folder)*

---

## 🧪 Testing

### Backend API Testing
```bash
cd server
node test-all-endpoints.js
```

### Frontend Testing
```bash
cd client
npm run test
```

---

## 📦 Available Scripts

### Backend (`server/`)
```bash
npm start              # Start server in production mode
npm run dev            # Start server in development mode (with nodemon)
npm run init-db        # Initialize database
npm run seed           # Seed sample data
npm test               # Run API tests
```

### Frontend (`client/`)
```bash
npm run dev            # Start development server
npm run build          # Build for production
npm run preview        # Preview production build
npm run lint           # Run ESLint
```

---

## 🔐 Security Features

- **JWT Authentication** - Secure token-based authentication
- **Password Hashing** - bcrypt encryption for user passwords
- **Role-Based Access Control** - Admin, Manager, Staff, Viewer roles
- **Input Validation** - Zod schema validation on frontend, backend validation
- **SQL Injection Protection** - Sequelize ORM with parameterized queries
- **XSS Protection** - React's built-in XSS protection
- **CORS Configuration** - Restricted API access
- **Environment Variables** - Sensitive data in `.env` files

---

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the frontend: `npm run build` (in `client/`)
2. Deploy the `client/dist` folder to Vercel/Netlify
3. Set environment variables for API base URL

### Backend (Heroku/Railway/AWS)
1. Set environment variables (DB credentials, JWT secret, etc.)
2. Deploy the `server/` directory
3. Run database migrations: `node init-database.js`

### Database (MySQL)
- Use a cloud MySQL provider (AWS RDS, PlanetScale, etc.)
- Update `DB_HOST`, `DB_USER`, `DB_PASSWORD` in production `.env`

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/YourFeature`
3. Commit your changes: `git commit -m 'Add YourFeature'`
4. Push to the branch: `git push origin feature/YourFeature`
5. Open a Pull Request

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- Portfolio: [your-portfolio.com](https://your-portfolio.com)
- LinkedIn: [linkedin.com/in/your-profile](https://linkedin.com/in/your-profile)
- GitHub: [@your-username](https://github.com/your-username)

---

## 📞 Support

For issues or questions:
- Open an issue on [GitHub Issues](https://github.com/your-username/inventory-management-system/issues)
- Email: your-email@example.com

---

## 🙏 Acknowledgments

- [React](https://react.dev/) - UI Library
- [Express.js](https://expressjs.com/) - Backend Framework
- [Sequelize](https://sequelize.org/) - ORM
- [Cloudinary](https://cloudinary.com/) - Image Management
- [TanStack Table](https://tanstack.com/table) - Data Tables
- [Tailwind CSS](https://tailwindcss.com/) - CSS Framework

---

## 📈 Project Status

✅ **Production Ready** - All core features implemented and tested

### Roadmap
- [ ] Multi-warehouse support
- [ ] Barcode scanning
- [ ] Email notifications
- [ ] PDF export for invoices
- [ ] Advanced reporting with charts
- [ ] Mobile app (React Native)

---

**⭐ If you find this project useful, please consider giving it a star!**
