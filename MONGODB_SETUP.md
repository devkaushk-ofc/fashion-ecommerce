# MongoDB Setup Guide for Fashion E-Commerce

This guide will help you set up MongoDB for the Fashion E-Commerce application on Windows.

## Option 1: Local MongoDB Installation (Recommended for Development)

### Step 1: Download MongoDB
1. Visit [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Select:
   - Version: Latest (7.0 or higher)
   - Platform: Windows
   - Package: MSI
3. Click "Download"

### Step 2: Install MongoDB
1. Run the downloaded `.msi` file
2. Choose "Complete" installation
3. **Important**: Check "Install MongoDB as a Service"
4. **Important**: Check "Install MongoDB Compass" (GUI tool)
5. Complete the installation

### Step 3: Verify Installation
Open Command Prompt or PowerShell and run:
```bash
mongod --version
```

You should see the MongoDB version information.

### Step 4: Start MongoDB Service
MongoDB should start automatically as a service. To verify:

**Using Command Prompt (as Administrator):**
```bash
# Check if MongoDB service is running
net start | findstr MongoDB

# If not running, start it:
net start MongoDB
```

**Using PowerShell (as Administrator):**
```bash
# Check service status
Get-Service MongoDB

# Start service if stopped
Start-Service MongoDB
```

### Step 5: Configure Your Application
1. Navigate to your backend directory:
   ```bash
   cd backend
   ```

2. Copy the example environment file:
   ```bash
   copy .env.example .env
   ```

3. Edit `.env` file and set:
   ```env
   MONGODB_URI=mongodb://localhost:27017/fashion-ecommerce
   ```

### Step 6: Test Connection
1. Start your backend server:
   ```bash
   npm run dev
   ```

2. You should see: "MongoDB Connected: localhost"

---

## Option 2: MongoDB Atlas (Cloud - Free Tier)

If you prefer a cloud database or have issues with local installation:

### Step 1: Create MongoDB Atlas Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)
2. Sign up for a free account
3. Verify your email

### Step 2: Create a Cluster
1. Click "Build a Database"
2. Choose "FREE" tier (M0 Sandbox)
3. Select a cloud provider and region (choose closest to you)
4. Click "Create Cluster"
5. Wait 3-5 minutes for cluster creation

### Step 3: Create Database User
1. Click "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Set username (e.g., `fashionuser`)
5. Set a strong password (save it!)
6. Set privileges to "Read and write to any database"
7. Click "Add User"

### Step 4: Configure Network Access
1. Click "Network Access" in left sidebar
2. Click "Add IP Address"
3. Click "Allow Access from Anywhere" (for development)
   - This adds `0.0.0.0/0`
4. Click "Confirm"

### Step 5: Get Connection String
1. Click "Database" in left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string (looks like):
   ```
   mongodb+srv://fashionuser:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

### Step 6: Configure Your Application
1. Edit your `backend/.env` file:
   ```env
   MONGODB_URI=mongodb+srv://fashionuser:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/fashion-ecommerce?retryWrites=true&w=majority
   ```
   
   **Important**: Replace:
   - `YOUR_PASSWORD` with your actual password
   - `cluster0.xxxxx` with your actual cluster address
   - Add `/fashion-ecommerce` before the `?` to specify database name

---

## Using MongoDB Compass (GUI Tool)

MongoDB Compass is a visual tool to interact with your database.

### For Local MongoDB:
1. Open MongoDB Compass
2. Connection string: `mongodb://localhost:27017`
3. Click "Connect"

### For MongoDB Atlas:
1. Open MongoDB Compass
2. Use the connection string from Atlas
3. Replace `<password>` with your actual password
4. Click "Connect"

### What You Can Do in Compass:
- View databases and collections
- Browse documents
- Create/edit/delete data
- Run queries
- View indexes

---

## Troubleshooting

### Issue: "MongoDB service not found"
**Solution:**
1. Reinstall MongoDB and ensure "Install as Service" is checked
2. Or manually start MongoDB:
   ```bash
   # Navigate to MongoDB bin directory
   cd "C:\Program Files\MongoDB\Server\7.0\bin"
   
   # Start MongoDB
   mongod --dbpath "C:\data\db"
   ```

### Issue: "Connection refused" or "ECONNREFUSED"
**Solutions:**
1. Check if MongoDB service is running:
   ```bash
   net start MongoDB
   ```

2. Check if port 27017 is in use:
   ```bash
   netstat -ano | findstr :27017
   ```

3. Restart MongoDB service:
   ```bash
   net stop MongoDB
   net start MongoDB
   ```

### Issue: "Authentication failed" (Atlas)
**Solutions:**
1. Verify username and password in connection string
2. Check if user has correct permissions in Atlas
3. Ensure password doesn't contain special characters (or URL encode them)

### Issue: "IP not whitelisted" (Atlas)
**Solution:**
1. Go to Network Access in Atlas
2. Add your current IP or use `0.0.0.0/0` for development

---

## Creating Sample Data

Once connected, you can add sample products using MongoDB Compass or the API.

### Using the API (Recommended):
1. Start your backend server
2. Register an admin user
3. Update user role to admin in MongoDB:
   ```javascript
   // In MongoDB Compass or Shell
   db.users.updateOne(
     { email: "admin@example.com" },
     { $set: { role: "admin" } }
   )
   ```
4. Use the admin panel to add products

### Using MongoDB Compass:
1. Connect to your database
2. Create database: `fashion-ecommerce`
3. Create collection: `products`
4. Insert sample document:
   ```json
   {
     "name": "Classic T-Shirt",
     "description": "Comfortable cotton t-shirt",
     "price": 29.99,
     "discountPrice": 0,
     "category": "Men",
     "subcategory": "T-Shirts",
     "brand": "Fashion Brand",
     "sizes": ["S", "M", "L", "XL"],
     "colors": ["Black", "White", "Blue"],
     "images": ["https://via.placeholder.com/400"],
     "stock": 100,
     "ratings": 4.5,
     "numReviews": 0,
     "reviews": [],
     "isFeatured": true,
     "isActive": true,
     "tags": ["casual", "cotton"],
     "material": "100% Cotton",
     "careInstructions": "Machine wash cold"
   }
   ```

---

## Environment Variables Reference

Your `backend/.env` file should look like this:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# Database Configuration (Choose one)
# Local MongoDB:
MONGODB_URI=mongodb://localhost:27017/fashion-ecommerce

# OR MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.xxxxx.mongodb.net/fashion-ecommerce?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d

# Cookie Configuration
COOKIE_EXPIRE=7

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads
```

---

## Quick Start Commands

```bash
# 1. Navigate to backend
cd backend

# 2. Install dependencies
npm install

# 3. Create .env file
copy .env.example .env

# 4. Edit .env with your MongoDB URI

# 5. Start the server
npm run dev

# You should see:
# "Server running in development mode on port 5000"
# "MongoDB Connected: localhost" (or your Atlas cluster)
```

---

## Useful MongoDB Commands

### MongoDB Shell Commands:
```bash
# Connect to local MongoDB
mongosh

# Show databases
show dbs

# Use your database
use fashion-ecommerce

# Show collections
show collections

# View all products
db.products.find()

# View all users
db.users.find()

# Count documents
db.products.countDocuments()

# Delete all products (careful!)
db.products.deleteMany({})
```

---

## Need Help?

- MongoDB Documentation: https://docs.mongodb.com/
- MongoDB Atlas Documentation: https://docs.atlas.mongodb.com/
- MongoDB Compass: https://docs.mongodb.com/compass/

If you encounter any issues, check the troubleshooting section above or refer to the official documentation.