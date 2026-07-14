# Image Display Troubleshooting Guide

## Issue: Images Not Appearing in the Application

This guide will help you diagnose and fix image display issues in your fashion e-commerce application.

---

## Step 1: Verify Backend is Running with Latest Changes

1. **Stop the backend server** (if running):
   - Press `Ctrl+C` in the backend terminal

2. **Restart the backend**:
   ```bash
   cd backend
   npm run dev
   ```

3. **Check the console output** - You should see:
   ```
   Server running on port 5000
   MongoDB Connected: ...
   ```

---

## Step 2: Run the Product Fix Script

This script will populate your database with products that have images:

```bash
cd backend
npm run fix-products
```

**Expected output:**
```
🔧 Starting product data fix...
✅ Fixed 10 products
✅ Created 10 sample products
🎉 Product fix complete!
```

---

## Step 3: Verify Products in Database

### Option A: Using MongoDB Compass (Recommended)
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Navigate to `fashion_ecommerce` database → `products` collection
4. Check that products have an `images` array with URLs like:
   ```json
   "images": ["https://source.unsplash.com/400x400/?Men,Shirts"]
   ```

### Option B: Using MongoDB Shell
```bash
mongosh
use fashion_ecommerce
db.products.findOne()
```

Look for the `images` field in the output.

---

## Step 4: Test Backend API Directly

Open your browser and go to:
```
http://localhost:5000/api/products
```

**What to check:**
1. You should see JSON data with products
2. Each product should have an `images` array
3. The URLs should look like: `https://source.unsplash.com/400x400/?category,subcategory`

**Example of correct product data:**
```json
{
  "success": true,
  "products": [
    {
      "_id": "...",
      "name": "Classic White Shirt",
      "images": ["https://source.unsplash.com/400x400/?Men,Shirts"],
      "category": "Men",
      "subcategory": "Shirts",
      "price": 49.99
    }
  ]
}
```

---

## Step 5: Check Backend Console Logs

When you access the homepage, check the backend terminal for debug logs:

```
🔍 Products before image check: 10
🖼️  Product: Classic White Shirt
   Images: ["https://source.unsplash.com/400x400/?Men,Shirts"]
🔍 Products after image check: 10
```

**If you don't see these logs:**
- The backend code wasn't updated
- Restart the backend server

---

## Step 6: Check Frontend Console Logs

1. Open your browser to `http://localhost:5173`
2. Open Developer Tools (F12)
3. Go to the Console tab

**Expected logs:**
```
📦 Fetched products: 8
🖼️  First product: {name: "Classic White Shirt", images: [...], ...}
🖼️  First product images: ["https://source.unsplash.com/400x400/?Men,Shirts"]
🖼️  First image URL: https://source.unsplash.com/400x400/?Men,Shirts
```

**If you see errors:**
- `❌ Error fetching featured products` - Backend is not running or API endpoint is wrong
- `❌ Image failed to load` - The image URL is invalid or blocked

---

## Step 7: Check Network Tab

In Developer Tools:
1. Go to the **Network** tab
2. Refresh the page
3. Look for requests to `source.unsplash.com`

**What to check:**
- Status should be `200 OK`
- If status is `403` or `404`, the Unsplash URL might be blocked or invalid
- If no requests to Unsplash, images aren't being loaded at all

---

## Step 8: Test Image URLs Directly

Copy an image URL from the console logs (e.g., `https://source.unsplash.com/400x400/?Men,Shirts`) and paste it directly in your browser.

**Expected result:**
- You should see a random image related to "Men" and "Shirts"

**If the image doesn't load:**
- Your network might be blocking Unsplash
- Try a different image source or use local placeholder images

---

## Common Issues and Solutions

### Issue 1: "Cannot GET /api/products"
**Solution:** Backend is not running. Start it with `npm run dev` in the backend folder.

### Issue 2: Products array is empty
**Solution:** Run the fix script: `npm run fix-products`

### Issue 3: Images field is missing or empty in database
**Solution:** 
1. Delete all products: `db.products.deleteMany({})`
2. Run fix script: `npm run fix-products`

### Issue 4: CORS errors in console
**Solution:** Check that backend CORS is configured correctly in `backend/server.js`:
```javascript
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

### Issue 5: Images show broken icon
**Solution:** 
- Check if Unsplash is accessible from your network
- The frontend now has fallback logic that will retry with a different URL
- Check browser console for specific error messages

### Issue 6: "Module not found" errors
**Solution:** Install dependencies:
```bash
cd backend && npm install
cd ../frontend && npm install
```

---

## Alternative: Use Local Placeholder Images

If Unsplash is blocked or you want to use local images:

1. Create a `public/images` folder in the frontend
2. Add placeholder images (e.g., `placeholder-men.jpg`, `placeholder-women.jpg`)
3. Update the image fallback in `frontend/src/pages/Home.jsx`:

```javascript
const getPlaceholderImage = (category) => {
  const placeholders = {
    'Men': '/images/placeholder-men.jpg',
    'Women': '/images/placeholder-women.jpg',
    'Kids': '/images/placeholder-kids.jpg',
    'Accessories': '/images/placeholder-accessories.jpg'
  };
  return placeholders[category] || '/images/placeholder-default.jpg';
};

// In the img tag:
<img 
  src={product.images?.[0] || getPlaceholderImage(product.category)} 
  alt={product.name}
  onError={(e) => e.target.src = getPlaceholderImage(product.category)}
/>
```

---

## Quick Checklist

- [ ] Backend server is running (`npm run dev` in backend folder)
- [ ] Frontend server is running (`npm run dev` in frontend folder)
- [ ] MongoDB is running
- [ ] Ran the fix script (`npm run fix-products`)
- [ ] Products exist in database with images array
- [ ] Backend API returns products with images when accessed directly
- [ ] Backend console shows debug logs
- [ ] Frontend console shows fetched products with image URLs
- [ ] No CORS errors in browser console
- [ ] Network tab shows successful image requests

---

## Still Not Working?

If images still don't appear after following all steps:

1. **Clear browser cache**: Ctrl+Shift+Delete → Clear cache
2. **Hard refresh**: Ctrl+Shift+R
3. **Try incognito mode**: To rule out browser extensions
4. **Check firewall**: Ensure it's not blocking Unsplash
5. **Try a different browser**: To rule out browser-specific issues

---

## Contact Information

If you're still experiencing issues, provide the following information:
- Backend console output
- Frontend console output (from browser DevTools)
- Network tab screenshot showing the API request
- Sample product data from database

---

**Last Updated:** 2026-06-24
**Version:** 1.0