# Data Flow Verification Guide

## Complete Step-by-Step Testing

### Step 1: Verify Database Has Products

```bash
cd backend
node scripts/testAPI.js
```

**Expected Output:**
```
✅ Total products in database: 10
✅ Featured products: 10
```

If you see `Featured products: 0`, run:
```bash
npm run create-products
```

---

### Step 2: Start Backend Server

```bash
cd backend
npm run dev
```

**Expected Output:**
```
Server running on port 5000
MongoDB Connected: ...
```

**Keep this terminal open!**

---

### Step 3: Test API Directly in Browser

Open your browser and go to:
```
http://localhost:5000/api/products?isFeatured=true
```

**Expected Response:**
```json
{
  "status": "success",
  "results": 8,
  "total": 10,
  "page": 1,
  "pages": 2,
  "products": [
    {
      "_id": "...",
      "name": "Classic White Shirt",
      "price": 49.99,
      "images": ["https://picsum.photos/400/400?random=1"],
      "category": "Men",
      ...
    }
  ]
}
```

**Check:**
- ✅ `products` array exists
- ✅ Each product has `images` array
- ✅ Image URLs are `https://picsum.photos/400/400?random=X`
- ✅ `results` shows number of products

---

### Step 4: Start Frontend Server

Open a **NEW terminal**:

```bash
cd frontend
npm run dev
```

**Expected Output:**
```
VITE v5.x.x  ready in xxx ms
➜  Local:   http://localhost:5173/
```

**Keep this terminal open too!**

---

### Step 5: Open Application in Browser

1. Go to: `http://localhost:5173`
2. Open Developer Tools (F12)
3. Go to **Console** tab

**Expected Console Logs:**
```
🔄 Fetching products from API...
📦 API Response: {status: "success", results: 8, ...}
📦 Products count: 8
🖼️  First product full data: {_id: "...", name: "Classic White Shirt", ...}
🖼️  First product name: Classic White Shirt
🖼️  First product price: 49.99
🖼️  First product images array: ["https://picsum.photos/400/400?random=1"]
🖼️  First image URL: https://picsum.photos/400/400?random=1
🎨 Rendering product: Classic White Shirt, Image: https://picsum.photos/400/400?random=1
✅ Image loaded for: Classic White Shirt
```

---

### Step 6: Check Network Tab

In Developer Tools:
1. Go to **Network** tab
2. Refresh the page (F5)
3. Look for request to `/api/products?isFeatured=true`

**Check:**
- ✅ Status: 200 OK
- ✅ Response contains products array
- ✅ Each product has images array

---

### Step 7: Visual Verification

On the homepage, you should see:

**Hero Section:**
- "Welcome to Fashion Store"
- "Shop Now" button

**Categories Section:**
- Men, Women, Kids, Accessories cards

**Featured Products Section:**
- **8 product cards** in a grid
- Each card shows:
  - ✅ Product image (from Lorem Picsum)
  - ✅ Product name
  - ✅ Price (with discount if applicable)
  - ✅ Rating and reviews

**Features Section:**
- Free Shipping, Secure Payment, Easy Returns, 24/7 Support

---

## Troubleshooting

### Issue 1: "No featured products available"

**Cause:** Products in database have `isFeatured: false`

**Solution:**
```bash
cd backend
npm run create-products
```

---

### Issue 2: Console shows "No products returned from API"

**Cause:** Backend not running or wrong API endpoint

**Check:**
1. Backend server is running on port 5000
2. MongoDB is running
3. API endpoint is correct: `/api/products?isFeatured=true`

**Solution:**
```bash
# Restart backend
cd backend
npm run dev
```

---

### Issue 3: Images not loading (broken image icon)

**Cause:** Image URLs are incorrect or blocked

**Check Console for:**
```
❌ Image failed to load for product: ...
❌ Failed URL: ...
```

**Solution:**
1. Check if Lorem Picsum is accessible: Open `https://picsum.photos/400/400` in browser
2. If blocked, check firewall/network settings
3. Images should automatically retry with fallback URL

---

### Issue 4: API returns empty products array

**Cause:** Database is empty

**Solution:**
```bash
cd backend
npm run create-products
```

---

### Issue 5: CORS errors in console

**Error:**
```
Access to XMLHttpRequest at 'http://localhost:5000/api/products' 
from origin 'http://localhost:5173' has been blocked by CORS policy
```

**Solution:**
Check `backend/server.js` has CORS configured:
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

---

## Data Structure Reference

### Backend API Response:
```javascript
{
  status: "success",
  results: 8,
  total: 10,
  page: 1,
  pages: 2,
  products: [
    {
      _id: "6a3b80313cb1e1f3053d9641",
      name: "Classic White Shirt",
      description: "A timeless white shirt...",
      price: 49.99,
      discountPrice: 0,
      category: "Men",
      subcategory: "Shirts",
      brand: "Fashion Brand",
      sizes: ["S", "M", "L", "XL"],
      colors: ["White", "Blue", "Black"],
      images: ["https://picsum.photos/400/400?random=1"],
      stock: 50,
      ratings: 4.5,
      numReviews: 120,
      isFeatured: true,
      isActive: true,
      createdAt: "2026-06-24T06:58:57.584Z",
      updatedAt: "2026-06-24T06:58:57.584Z"
    }
  ]
}
```

### Frontend Usage:
```javascript
// Access product data
product.name          // "Classic White Shirt"
product.price         // 49.99
product.discountPrice // 0
product.images[0]     // "https://picsum.photos/400/400?random=1"
product.ratings       // 4.5
product.numReviews    // 120
product.category      // "Men"
```

---

## Quick Checklist

- [ ] MongoDB is running
- [ ] Backend server is running (port 5000)
- [ ] Frontend server is running (port 5173)
- [ ] Database has 10 products (run `node scripts/testAPI.js`)
- [ ] All products have `isFeatured: true`
- [ ] API returns products when accessed directly
- [ ] Frontend console shows product data
- [ ] Images are loading (check Network tab)
- [ ] Product cards are visible on homepage
- [ ] No errors in console

---

## Success Criteria

✅ Homepage loads without errors
✅ 8 product cards are visible
✅ Each product shows image, name, price, rating
✅ Images are from Lorem Picsum
✅ Console logs show successful data fetch
✅ Network tab shows successful API calls
✅ No CORS errors
✅ No 404 errors

---

**If all checks pass, your data flow is working correctly!** 🎉