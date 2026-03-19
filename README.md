```markdown name=README.md url=https://github.com/MinjuMariya/happy_bites
# 🍔 Happy Bites - A Modern Food Ordering & Management System

> A full-stack web application for seamless food ordering, inventory management, and business analytics.

[![Python](https://img.shields.io/badge/Python-3.8+-3776AB?style=flat-square&logo=python)](https://www.python.org/)
[![Flask](https://img.shields.io/badge/Flask-Latest-000000?style=flat-square&logo=flask)](https://flask.palletsprojects.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Latest-316192?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![License](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

---

## 🌟 Features

### 👥 Customer Features
- **User Authentication**: Secure signup and login with email and phone validation
- **Product Catalog**: Browse menu with detailed product information and images
- **Shopping Cart**: Intuitive cart management with real-time stock updates
- **Order Placement**: Seamless checkout with address management
- **Order Tracking**: View order history and current order status
- **Customer Feedback**: Rate and review orders with star ratings
- **Responsive Design**: Mobile-friendly interface for on-the-go browsing

### 🏪 Admin Dashboard
- **Order Management**: 
  - View all orders with comprehensive details
  - Real-time order status updates (Pending → Processing → Completed/Cancelled)
  - Daily analytics and revenue tracking
  - Top-selling items insights
  
- **Product Management**:
  - Add, edit, and delete products
  - Image upload (PNG, JPG, JPEG, GIF, WebP, AVIF)
  - Inventory tracking with stock management
  - Category organization (Bakery, Snacks, Fresh Items)
  
- **User Management**:
  - View all registered customers
  - Track user order history
  - Monitor user activity and engagement
  - Customer statistics and insights
  
- **Analytics & Reports**:
  - Daily, monthly, and complete revenue reports
  - Product sales breakdown
  - Inventory status reports
  - Data export to CSV for further analysis
  
- **Store Settings**:
  - Customize store information
  - Social media integration (Instagram, Facebook, Twitter, WhatsApp, LinkedIn)
  - Admin credential management
  - Multi-channel communication

---

## 📋 Tech Stack

### Backend
- **Framework**: Flask (Python)
- **Database**: PostgreSQL
- **ORM**: SQLAlchemy
- **Session Management**: Flask Sessions

### Frontend
- **HTML5** & **CSS3**
- **JavaScript** (Vanilla)
- **Responsive Design**
- **Interactive UI Components**

### Features
- RESTful APIs for order management
- Secure file upload handling
- Real-time inventory updates
- Database-driven product catalog

---

## 🗂️ Project Structure

```
happy_bites/
├── app1.py                 # Main Flask application & API routes
├── requirements.txt        # Python dependencies
├── templates/              # HTML templates
│   ├── index.html         # Landing page
│   ├── menu.html          # Product menu
│   ├── login.html         # User login
│   ├── signup.html        # User registration
│   ├── my_orders.html     # User order history
│   ├── feedbacks.html     # Customer testimonials
│   ├── admin_login.html   # Admin authentication
│   ├── admin_dashboard.html      # Orders overview
│   ├── admin_products.html       # Product management
│   ├── admin_users.html          # Customer management
│   ├── admin_reports.html        # Analytics & reports
│   ├── admin_settings.html       # Store configuration
│   └── admin_user_history.html   # Individual user orders
├── static/                 # Static files
│   ├── style.css          # Main stylesheet
│   ├── admin.css          # Admin dashboard styles
│   ├── script.js          # Client-side functionality
│   ├── assets/            # Product images & media
│   └── uploads/           # User-uploaded product images
└── __pycache__/           # Python cache files
```

---

## 🚀 Getting Started

### Prerequisites
- Python 3.8 or higher
- PostgreSQL database
- pip (Python package manager)

### Installation

1. **Clone the Repository**
   ```bash
   git clone https://github.com/MinjuMariya/happy_bites.git
   cd happy_bites
   ```

2. **Create Virtual Environment**
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install Dependencies**
   ```bash
   pip install -r requirements.txt
   ```

4. **Configure Database**
   Create a `.env` file with your PostgreSQL credentials:
   ```env
   DB_USERNAME=your_username
   DB_PASSWORD=your_password
   DB_HOST=localhost
   DB_PORT=5432
   DB_NAME=happybites
   ```

5. **Run the Application**
   ```bash
   python app1.py
   ```
   
   The application will be available at `http://localhost:5000`

---

## 📊 Database Models

### User
- Username, Email, Password (with validation)
- Full Name, Phone Number (Indian format validation)
- Delivery Address
- Order History

### Product
- Name, Price
- Category (Bakery, Snacks, Fresh)
- Image URL (local or external)
- Stock Management (Initial & Remaining)

### Order
- Customer Information
- Items & Quantities
- Order Total
- Timestamp
- Status (Pending, Processing, Completed, Cancelled)

### Feedback
- Star Rating
- Message/Review
- Timestamp

### Store Settings
- Business Information
- Contact Details
- Social Media Links
- Store Hours & Address

---

## 🔐 Security Features

- ✅ Input validation for user data
- ✅ Phone number format validation (Indian mobile numbers)
- ✅ Email uniqueness checks
- ✅ Session-based authentication
- ✅ File upload security with extension validation
- ✅ Secure file handling with `werkzeug.utils`
- ✅ Admin credential protection

---

## 🎯 API Endpoints

### Customer API
```
POST   /api/order              - Place an order
POST   /api/feedback           - Submit feedback
POST   /api/contact            - Send contact message
GET    /api/products           - Get product list with stock
```

### Admin API
```
GET    /admin                  - Dashboard overview
POST   /admin/order/update-status - Update order status
GET    /admin/products         - Manage products
GET    /admin/users            - View customers
GET    /admin/reports          - Analytics reports
GET    /admin/export/orders    - Export orders as CSV
GET    /admin/api/stats        - Real-time statistics
```

---

## 👤 Default Admin Credentials

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `admin123` |

**⚠️ Important**: Change these credentials immediately in production!

---

## 🛒 Sample Products

The application comes pre-loaded with:
- 🥐 **Bakery Items**: Butter Cookies, Unnakaya, Garden Salad
- 🥔 **Snacks**: Crispy Samosa, Hot Bhajji
- 🥗 **Fresh Items**: Fresh Fruit Salad

---

## 📱 Key Features Showcase

### For Customers
1. Browse menu with beautiful product cards
2. Add items to cart
3. Manage quantities
4. Secure checkout
5. Track orders in real-time
6. Leave reviews and ratings

### For Restaurant Owners
1. Dashboard with key metrics
2. Order management system
3. Inventory tracking
4. Revenue analytics
5. Customer insights
6. Export data for business intelligence

---

## 🔄 Order Status Workflow

```
PENDING → PROCESSING → COMPLETED
   ↓                      ↓
   └────→ CANCELLED ←─────┘
```

---

## 📈 Analytics & Reporting

- **Daily Reports**: Today's revenue, items sold, top products
- **Monthly Reports**: Monthly trends and performance
- **Complete Reports**: All-time statistics and insights
- **Inventory Status**: Stock levels across products
- **Customer Analytics**: User order frequency and preferences

---

## 🐛 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port 5000 already in use | Change `port=5000` in `app1.py` |
| Database connection error | Verify PostgreSQL is running and credentials are correct |
| Image upload fails | Ensure `/static/uploads` directory exists |
| Invalid phone number error | Use Indian format: `+91XXXXXXXXXX` |

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

---

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

---

## 👨‍💻 Author

**Minju Mariya**

- GitHub: [@MinjuMariya](https://github.com/MinjuMariya)
- Repository: [happy_bites](https://github.com/MinjuMariya/happy_bites)

---

## 🙏 Acknowledgments

- Built with Flask and PostgreSQL
- Inspired by modern food delivery platforms
- Community contributions and feedback

---

## 📞 Support

For issues, questions, or suggestions, please create a GitHub issue or contact the repository owner.

---

**Made with ❤️ for food lovers and restaurant owners**
