# 🚀 Quick Start Guide - Fashion E-Commerce

Get your fashion e-commerce application running in 5 minutes!

## ✅ Prerequisites

- Node.js (v16+) installed
- MongoDB installed and running
- Git Bash or PowerShell

---

## 📦 Step 1: Install Dependencies

```bash
# Backend
cd backend
npm install

# Frontend (in new terminal)
cd frontend
npm install
```

---

## ⚙️ Step 2: Configure Environment

```bash
# In backend folder
cd backend
copy .env.example .env
```

Edit `.env` file:
```env
MONGODB_URI=mongodb://localhost:27017/fashion-ecommerce
JWT_SECRET=your_secret_key_here
```

---

## 🗄️ Step 3: Start MongoDB

```bash
# Windows (as Administrator)
net start MongoDB
```

---

## 🎨 Step 4: Add Sample Products (Automatic!)

```bash
# In backend folder
npm run fix-products
```

This automatically creates 10 sample fashion products with images!

---

## 🚀 Step 5: Start Servers

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

---

## 🌐 Step 6: Open Application

Open browser: `http://localhost:5173`

You should see:
- ✅ Fashion Store homepage
- ✅ 10 sample products with images
- ✅ Working navigation

---

## 👤 Step 7: Create Admin User

### Option A: Using Script (Easiest)
```bash
# Register a user first in the app, then:
cd backend
npm run make-admin your-email@example.com
```

### Option B: Using MongoDB Shell
```bash
mongosh
use fashion-ecommerce
db.users.updateOne(
  { email: "your-email@example.com" },
  { $set: { role: "admin" } }
)
```

Then logout and login again!

---

## ✅ Verification Checklist

- [ ] Backend running on port 5000
- [ ] Frontend running on port 5173
- [ ] MongoDB connected
- [ ] Products visible on homepage
- [ ] Can register/login
- [ ] Admin dashboard accessible (if admin)

---

## 🎉 You're Done!

Your fashion e-commerce is now running with:
- ✅ 10 sample products with real images
- ✅ User authentication
- ✅ Shopping cart
- ✅ Admin panel
- ✅ Responsive design

---

## 🔧 Common Commands

```bash
# Fix/Add products anytime
npm run fix-products

# Make user admin
npm run make-admin email@example.com

# Start backend
npm run dev

# Start frontend
npm run dev
```

---

## 📚 Next Steps

1. **Explore the app** - Browse products, add to cart
2. **Test admin features** - Manage products, orders, users
3. **Customize** - Add your own products and styling
4. **Deploy** - When ready, deploy to production

---

## 🆘 Need Help?

- Check `PRODUCT_DATA_FIX.md` for product management
- Check `MONGODB_SETUP.md` for database setup
- Check `README.md` for full documentation

---

## 🎯 Quick Test

1. Open `http://localhost:5173`
2. Click "Register" and create account
3. Browse products on homepage
4. Click a product to see details
5. Add to cart (if logged in)
6. View cart
7. Make yourself admin (see Step 7)
8. Access Admin Dashboard

**Everything working? You're all set! 🎉**