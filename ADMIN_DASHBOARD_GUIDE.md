# Admin Dashboard Guide

## Complete Admin Functionality Documentation

---

## 🔐 Admin Access

### Making a User Admin

**Method 1: Using the Script**
```bash
cd backend
npm run make-admin
```
Enter the user's email when prompted.

**Method 2: Using MongoDB Compass**
1. Open MongoDB Compass
2. Connect to `mongodb://localhost:27017`
3. Navigate to `fashion_ecommerce` → `users`
4. Find the user
5. Edit the document and change `role: "user"` to `role: "admin"`
6. Save

**Method 3: Using MongoDB Shell**
```bash
mongosh
use fashion_ecommerce
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

---

## 🎯 Admin Dashboard Features

### 1. Dashboard Overview (`/admin/dashboard`)

**Statistics Cards:**
- **Total Products** - Shows total number of products in store
- **Featured Products** - Count of products marked as featured
- **Low Stock Items** - Products with stock < 10 units
- **Total Orders** - Total orders placed (coming soon)

**Quick Actions:**
- Add Product - Quick link to create new product
- Manage Products - View and edit all products
- View Orders - Check customer orders
- Manage Users - User management

**Top Products:**
- Displays top 5 products by stock level
- Shows product image, name, category, brand
- Displays price and current stock
- Quick edit button for each product

**Low Stock Alert:**
- Automatic alert when products have low stock
- Direct link to product management

---

### 2. Product Management (`/admin/products`)

#### View All Products

**Product Table Columns:**
- **Image** - Product thumbnail
- **Name** - Product name and brand
- **Category** - Main category and subcategory
- **Price** - Current price (with discount if applicable)
- **Stock** - Available units (color-coded)
- **Featured** - Toggle featured status
- **Actions** - Edit and Delete buttons

**Features:**
- Sortable columns
- Hover effects for better UX
- Color-coded stock status (green = in stock, red = out of stock)
- Quick feature/unfeature toggle

---

#### Add New Product

Click **"+ Add New Product"** button to open the product form.

**Required Fields:**
1. **Product Name*** - e.g., "Classic White Shirt"
2. **Brand*** - e.g., "Fashion Brand"
3. **Description*** - Detailed product description
4. **Category*** - Select from dropdown (Men, Women, Kids, Accessories, etc.)
5. **Subcategory*** - e.g., "Shirts", "Dresses", "T-Shirts"
6. **Price ($)*** - Regular price (e.g., 49.99)
7. **Stock*** - Number of units available
8. **Sizes*** - Select at least one size (XS, S, M, L, XL, XXL, Free Size)
9. **Colors*** - Add colors (press Enter after typing each color)
10. **Images*** - Add image URLs (press Enter after each URL)

**Optional Fields:**
- **Discount Price** - Sale price (leave empty if no discount)
- **Material** - e.g., "100% Cotton"
- **Care Instructions** - e.g., "Machine wash cold"
- **Featured** - Checkbox to feature on homepage

**Image Options:**
- Paste image URL and press Enter
- Click "Generate Random" for Lorem Picsum image
- Add multiple images (first image is primary)

**Validation:**
- All required fields must be filled
- At least one size must be selected
- At least one color must be added
- At least one image must be provided
- Price must be a positive number
- Stock must be a non-negative number

---

#### Edit Product

1. Click **"Edit"** button on any product
2. Modal opens with pre-filled form
3. Modify any fields
4. Click **"Update Product"**
5. Changes are saved immediately
6. Product list refreshes automatically

**What You Can Edit:**
- All product details
- Add/remove sizes
- Add/remove colors
- Add/remove images
- Change featured status
- Update stock levels
- Modify pricing

---

#### Delete Product

1. Click **"Delete"** button on any product
2. Confirmation dialog appears
3. Click **"OK"** to confirm deletion
4. Product is permanently removed
5. Product list refreshes automatically

**Warning:** Deletion is permanent and cannot be undone!

---

#### Toggle Featured Status

1. Click the **"Feature"** or **"⭐ Featured"** button
2. Status toggles immediately
3. Featured products appear on homepage
4. No confirmation needed

---

## 🎨 User Interface Features

### Product Form

**Size Selector:**
- Click sizes to select/deselect
- Selected sizes are highlighted in blue
- Multiple sizes can be selected

**Color Tags:**
- Type color name and press Enter
- Color appears as a tag
- Click × on tag to remove

**Image Preview:**
- Images display in a grid
- Hover to see delete button
- Click × to remove image
- First image is the primary product image

**Form Validation:**
- Real-time validation
- Error messages for missing fields
- Submit button disabled until valid

---

### Success/Error Messages

**Success Messages (Green):**
- "Product created successfully!"
- "Product updated successfully!"
- "Product deleted successfully!"
- "Product featured successfully!"

**Error Messages (Red):**
- "Please fill in all required fields"
- "Please select at least one size"
- "Please add at least one color"
- "Please add at least one image"
- "Failed to save product"
- "Failed to delete product"

Messages auto-dismiss after 5 seconds.

---

## 🔒 Security Features

### Admin-Only Access

**Backend Protection:**
- All admin routes require authentication
- JWT token validation on every request
- Role-based authorization (admin role required)
- Middleware: `protect` and `authorize('admin')`

**Frontend Protection:**
- Admin routes check user role
- Redirect to login if not authenticated
- Redirect to home if not admin
- Admin menu only visible to admins

**Protected Routes:**
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- All routes in `/admin/*`

---

## 📱 Responsive Design

**Desktop (> 768px):**
- Full table view
- Multi-column grid layouts
- Side-by-side form fields
- Hover effects enabled

**Mobile (< 768px):**
- Horizontal scrolling for table
- Single column layouts
- Stacked form fields
- Touch-friendly buttons
- Full-screen modals

---

## 🚀 Quick Start Guide

### Step 1: Create Admin User

```bash
# Register a new user first (via frontend or API)
# Then make them admin:
cd backend
npm run make-admin
# Enter: admin@example.com
```

### Step 2: Login as Admin

1. Go to `http://localhost:5173/login`
2. Enter admin credentials
3. Click "Login"
4. You'll see "Admin Dashboard" in navbar

### Step 3: Access Admin Dashboard

1. Click "Admin Dashboard" in navbar
2. Or go directly to `http://localhost:5173/admin/dashboard`
3. View statistics and quick actions

### Step 4: Add Your First Product

1. Click "Manage Products" or go to `/admin/products`
2. Click "+ Add New Product"
3. Fill in all required fields:
   - Name: "Summer Dress"
   - Brand: "Fashion Co"
   - Description: "Beautiful summer dress..."
   - Category: "Women"
   - Subcategory: "Dresses"
   - Price: 79.99
   - Stock: 50
   - Sizes: Select S, M, L
   - Colors: Add "Blue", "Pink", "White"
   - Images: Click "Generate Random" or paste URL
4. Check "Featured" if you want it on homepage
5. Click "Create Product"
6. Product appears in list immediately!

---

## 💡 Tips & Best Practices

### Product Management

1. **Use Clear Names** - Be descriptive and specific
2. **Add Multiple Images** - Show product from different angles
3. **Set Accurate Stock** - Keep inventory updated
4. **Use Discounts Wisely** - Only when running promotions
5. **Feature Strategically** - Limit to 8-10 featured products
6. **Update Regularly** - Keep product info current

### Image Management

1. **Use Consistent Sizes** - 400x400px recommended
2. **High Quality** - Clear, well-lit product photos
3. **Multiple Angles** - Front, back, detail shots
4. **Lorem Picsum** - Good for testing/placeholders
5. **First Image** - Most important, shows in listings

### Stock Management

1. **Monitor Low Stock** - Check dashboard alerts
2. **Update After Sales** - Keep stock accurate
3. **Set Realistic Levels** - Based on actual inventory
4. **Use Zero Stock** - For out-of-stock items

### Pricing

1. **Competitive Pricing** - Research market rates
2. **Clear Discounts** - Show original price when discounted
3. **Consistent Format** - Always use 2 decimal places
4. **Update Seasonally** - Adjust for sales/seasons

---

## 🐛 Troubleshooting

### "Admin Dashboard" Not Showing in Navbar

**Cause:** User is not admin
**Solution:** Run `npm run make-admin` and enter user email

### Can't Access Admin Pages

**Cause:** Not logged in or not admin
**Solution:** 
1. Login first
2. Verify admin role in database
3. Clear browser cache and re-login

### Product Not Saving

**Cause:** Validation errors or missing fields
**Solution:**
1. Check all required fields are filled
2. Ensure at least one size selected
3. Add at least one color
4. Add at least one image
5. Check browser console for errors

### Images Not Loading

**Cause:** Invalid image URLs
**Solution:**
1. Use valid image URLs (https://)
2. Test URL in browser first
3. Use Lorem Picsum for testing
4. Check network tab for failed requests

### Changes Not Reflecting

**Cause:** Browser cache
**Solution:**
1. Hard refresh: Ctrl+Shift+R
2. Clear browser cache
3. Check if backend saved changes
4. Verify in MongoDB

---

## 📊 API Endpoints Used

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (admin only)
- `PUT /api/products/:id` - Update product (admin only)
- `DELETE /api/products/:id` - Delete product (admin only)

### Authentication
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Register
- `GET /api/auth/me` - Get current user

---

## ✅ Success Checklist

- [ ] Admin user created
- [ ] Can login as admin
- [ ] "Admin Dashboard" visible in navbar
- [ ] Can access `/admin/dashboard`
- [ ] Can access `/admin/products`
- [ ] Can view all products
- [ ] Can add new product
- [ ] Can edit existing product
- [ ] Can delete product
- [ ] Can toggle featured status
- [ ] Success messages appear
- [ ] Changes reflect immediately
- [ ] Images display correctly
- [ ] Form validation works
- [ ] Mobile responsive

---

## 🎉 You're Ready!

Your admin dashboard is fully functional with:
- ✅ Complete product CRUD operations
- ✅ Real-time updates
- ✅ Form validation
- ✅ Image management
- ✅ Stock tracking
- ✅ Featured products
- ✅ Responsive design
- ✅ Secure authentication
- ✅ User-friendly interface

**Start managing your fashion e-commerce store!** 🛍️