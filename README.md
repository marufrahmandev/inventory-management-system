# Inventory Management System

A full-stack Inventory Management System built with React.js frontend and Express.js backend, featuring Sequelize ORM with Singleton Pattern, comprehensive inventory tracking, order management, and reporting capabilities.

## 🚀 Features

### Core Modules

1. **Category Management** ✅

   - List, Add, Edit, Delete categories
   - Image upload with Cloudinary integration
   - Parent category support

2. **Product Management** ✅

   - Full CRUD operations
   - SKU, barcode, and pricing management
   - Stock level tracking with low stock alerts
   - Category association

3. **Sales Orders** ✅

   - Create and manage sales orders
   - Multiple order items support
   - Order status tracking
   - Automatic stock deduction

4. **Purchase Orders** ✅

   - Create and manage purchase orders
   - Supplier information tracking
   - Order status tracking
   - Automatic stock addition on receipt

5. **Invoices** ✅

   - Generate invoices
   - Payment status tracking
   - Due date management

6. **Stock Management** ✅

   - Track stock levels by location
   - Batch number and expiry date tracking
   - Low stock alerts

7. **Reports & Analytics** ✅
   - Dashboard with key metrics
   - Sales, purchase, inventory reports
   - Date range filtering

## 🛠️ Tech Stack

### Frontend

- **React 19** - UI library
- **TypeScript** - Type safety
- **Redux Toolkit** + **RTK Query** - State management & API calls
- **React Hook Form** + **Zod** - Form management & validation
- **TanStack Table** - Advanced table features
- **Tailwind CSS** - Styling
- **React Router 7** - Routing

### Backend

- **Express.js** - Web framework
- **Node.js** - Runtime
- **MySQL** - Relational database
- **Sequelize ORM** - Object-Relational Mapping with Singleton Pattern ⭐
- **Cloudinary** - Image storage
- **Multer** - File uploads
- **CORS** - Cross-origin support

## 📦 Installation & Setup

### Prerequisites

- Node.js (v18+)
- MySQL Server (v8.0+)
- Cloudinary account (optional, for images)

### Quick Start (5 Minutes)

#### 1. Clone & Install

```bash
# Clone repository
git clone <your-repo-url>
cd inventory-management-system

# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

#### 2. Setup MySQL Database

```bash
# Login to MySQL
mysql -u root -p

# Create database
CREATE DATABASE inventory_management;

# Exit
exit;
```

#### 3. Configure Environment Variables

Create `server/.env` file (copy from `.env.example`):

```env
# Server
NODE_ENV=development
PORT=3000
API_VERSION=v1

# Database
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=inventory_management

# Cloudinary (optional - for image uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### 4. Initialize Database

```bash
cd server
npm run init-db
```

#### 5. Start Servers

**Backend:**

```bash
cd server
npm run dev
```

**Frontend (new terminal):**

```bash
cd client
npm run dev
```

#### 6. Access Application

- Frontend: http://localhost:5173
- Backend API: http://localhost:3000
- API v1: http://localhost:3000/api/v1

## 📁 Project Structure

```
inventory-management-system/
├── client/                  # React frontend
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   ├── state/          # Redux store
│   │   └── types/          # TypeScript types
│   └── package.json
│
├── server/                  # Express backend
│   ├── config/             # Configuration
│   │   ├── database.js     # Sequelize singleton connection
│   │   └── env.config.js   # Environment config
│   ├── models/             # Sequelize models
│   │   ├── index.js        # Model definitions & associations
│   │   ├── categoryModel.js
│   │   ├── productModel.js
│   │   └── ...
│   ├── controllers/        # Business logic
│   ├── routes/             # API routes
│   │   ├── index.js        # Main router
│   │   ├── category.routes.js
│   │   ├── product.routes.js
│   │   ├── salesOrder.routes.js
│   │   ├── purchaseOrder.routes.js
│   │   ├── invoice.routes.js
│   │   ├── stock.routes.js
│   │   └── report.routes.js
│   ├── utils/              # Utilities
│   ├── init-database.js    # DB initialization
│   └── server.js           # Server entry point
│
└── README.md               # This file
```

## 📡 API Endpoints

### Base URL

```
http://localhost:3000/api/v1
```

### Endpoints

**Categories**

- `GET /api/v1/categories` - Get all categories
- `POST /api/v1/categories` - Create category
- `PUT /api/v1/categories/:id` - Update category
- `DELETE /api/v1/categories/:id` - Delete category

**Products**

- `GET /api/v1/products` - Get all products
- `POST /api/v1/products` - Create product
- `PUT /api/v1/products/:id` - Update product
- `DELETE /api/v1/products/:id` - Delete product

**Sales Orders**

- `GET /api/v1/sales-orders` - Get all sales orders

**Purchase Orders**

- `GET /api/v1/purchase-orders` - Get all purchase orders

**Invoices**

- `GET /api/v1/invoices` - Get all invoices

**Stocks**

- `GET /api/v1/stocks` - Get all stocks
- `GET /api/v1/stocks/low-stock` - Get low stock items

**Reports**

- `GET /api/v1/reports/dashboard` - Dashboard summary
- `GET /api/v1/reports/sales` - Sales report
- `GET /api/v1/reports/purchase` - Purchase report
- `GET /api/v1/reports/inventory` - Inventory report
- `GET /api/v1/reports/invoice` - Invoice report

## 🧪 Testing

### Run Automated Tests

```bash
cd server
node test-api.js
```

### Manual Testing

```bash
# Test health endpoint
curl http://localhost:3000/

# Test categories
curl http://localhost:3000/api/v1/categories

# Create category
curl -X POST http://localhost:3000/api/v1/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"Electronics","description":"Electronic devices"}'
```

## 🎯 Sequelize ORM Features

### Singleton Pattern

- Single database connection instance
- Efficient resource management
- Connection pooling (max: 10)

### Model Operations

```javascript
// Get all
const categories = await Category.findAll();

// Get by ID
const category = await Category.findByPk(id);

// Create
const category = await Category.create({ name: "Electronics" });

// Update
await category.update({ name: "Updated Name" });

// Delete
await category.destroy();
```

### With Associations

```javascript
// Eager loading
const products = await Product.findAll({
  include: [{ model: Category, as: "category" }],
});
```

### Transactions

```javascript
await database.transaction(async (t) => {
  const order = await SalesOrder.create(data, { transaction: t });
  await SalesOrderItem.bulkCreate(items, { transaction: t });
});
```

## 🐛 Troubleshooting

### Server Won't Start

**Check:**

1. MySQL is running
2. `.env` file exists with correct credentials
3. Database created: `CREATE DATABASE inventory_management;`
4. Run `npm install` in server folder

### Database Connection Error

```bash
# Create database
mysql -u root -p
CREATE DATABASE inventory_management;
exit;

# Initialize tables
cd server
npm run init-db
```

### Frontend Can't Connect

**Check:**

1. Backend is running on port 3000
2. CORS settings in `.env`:
   ```env
   CORS_ORIGIN=http://localhost:5173
   ```
3. Restart both servers

### Port Already in Use

```bash
# Change port in .env
PORT=3001

# Or kill process on port 3000
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

## 🚀 NPM Scripts

### Backend (`server/`)

```bash
npm run dev          # Start development server
npm start            # Start production server
npm run init-db      # Initialize database (safe)
npm run init-db:seed # Initialize with sample data
npm run init-db:force # Force recreate (drops tables)
```

### Frontend (`client/`)

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 🏗️ Architecture

### Design Patterns

- **Singleton Pattern** - Database connection
- **MVC Pattern** - Models, Controllers, Routes
- **Repository Pattern** - Data access abstraction

### Request Flow

```
Client → Routes → Controller → Model → Sequelize ORM → MySQL Database
```

## 🔐 Security

- SQL injection prevention (via Sequelize)
- Environment variables for sensitive data
- CORS configuration
- Input validation

## 📊 Environment Variables

| Variable                | Description           | Default              | Required   |
| ----------------------- | --------------------- | -------------------- | ---------- |
| `NODE_ENV`              | Environment mode      | development          | No         |
| `PORT`                  | Server port           | 3000                 | No         |
| `API_VERSION`           | API version           | v1                   | No         |
| `DB_HOST`               | MySQL host            | localhost            | No         |
| `DB_PORT`               | MySQL port            | 3306                 | No         |
| `DB_USER`               | MySQL username        | root                 | No         |
| `DB_PASSWORD`           | MySQL password        | (empty)              | No         |
| `DB_NAME`               | Database name         | inventory_management | No         |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name | -                    | For images |
| `CLOUDINARY_API_KEY`    | Cloudinary API key    | -                    | For images |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret | -                    | For images |

**Note:** All variables have sensible defaults. Only configure what you need to change.

## 📚 Key Technologies Explained

### Sequelize ORM

- **Type-safe** database operations
- **Automatic** SQL query generation
- **Built-in** validation
- **Transaction** support
- **Association** management

### Benefits

- ✅ No SQL injection
- ✅ Easy relationships
- ✅ Automatic migrations
- ✅ Query building
- ✅ Connection pooling

## 🎓 Learn More

- [Sequelize Documentation](https://sequelize.org/docs/v6/)
- [Express.js Best Practices](https://expressjs.com/en/advanced/best-practice-performance.html)
- [React Documentation](https://react.dev/)
- [Redux Toolkit](https://redux-toolkit.js.org/)

## 📝 Common Tasks

### Add New Category

```bash
curl -X POST http://localhost:3000/api/v1/categories \
  -H "Content-Type: application/json" \
  -d '{"name":"New Category","description":"Description here"}'
```

### Add New Product

```bash
curl -X POST http://localhost:3000/api/v1/products \
  -H "Content-Type: application/json" \
  -d '{"name":"Product Name","price":99.99,"stock":100,"sku":"PRD-001"}'
```

### View Dashboard

```bash
curl http://localhost:3000/api/v1/reports/dashboard
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

MIT License

## 👨‍💻 Support

For support:

1. Check troubleshooting section above
2. Review console logs for errors
3. Verify all prerequisites are met
4. Open an issue in the repository

---

## ✅ Quick Checklist

Before starting:

- [ ] Node.js installed
- [ ] MySQL installed and running
- [ ] `.env` file configured
- [ ] Dependencies installed
- [ ] Database initialized

For development:

- [ ] Backend running on port 3000
- [ ] Frontend running on port 5173
- [ ] No console errors
- [ ] Can create/edit/delete data

---

**Built with ❤️ using React, Express, and Sequelize ORM**

**System Version:** 2.0.0 (Sequelize ORM + Clean Architecture)
