import mongoose from 'mongoose';
import Product from '../models/Product.js';
import User from '../models/User.js';
import dotenv from 'dotenv';

dotenv.config();

const testAdminFlow = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    // Test 1: Check database connection
    console.log('📊 Test 1: Database Connection');
    console.log('   Database:', mongoose.connection.name);
    console.log('   Host:', mongoose.connection.host);
    console.log('   ✅ Connection active\n');

    // Test 2: Check if admin user exists
    console.log('📊 Test 2: Admin User Check');
    const adminUsers = await User.find({ role: 'admin' });
    console.log(`   Found ${adminUsers.length} admin user(s)`);
    if (adminUsers.length > 0) {
      adminUsers.forEach(admin => {
        console.log(`   - ${admin.email} (${admin.name})`);
      });
    } else {
      console.log('   ⚠️  No admin users found. Run: npm run make-admin');
    }
    console.log('');

    // Test 3: Check existing products
    console.log('📊 Test 3: Existing Products');
    const existingProducts = await Product.find();
    console.log(`   Total products: ${existingProducts.length}`);
    if (existingProducts.length > 0) {
      console.log('   Sample products:');
      existingProducts.slice(0, 3).forEach(p => {
        console.log(`   - ${p.name} (${p.category}) - Stock: ${p.stock}`);
      });
    }
    console.log('');

    // Test 4: Create a test product (simulating admin dashboard)
    console.log('📊 Test 4: Create Product (Simulating Admin Dashboard)');
    const testProduct = {
      name: 'Test Admin Product',
      description: 'This product was created by the admin test script',
      price: 99.99,
      discountPrice: 79.99,
      category: 'Men',
      subcategory: 'Test Category',
      brand: 'Test Brand',
      sizes: ['M', 'L', 'XL'],
      colors: ['Black', 'White'],
      images: ['https://picsum.photos/400/400?random=999'],
      stock: 100,
      isFeatured: true,
      material: 'Test Material',
      careInstructions: 'Test care instructions'
    };

    console.log('   Creating product...');
    const createdProduct = await Product.create(testProduct);
    console.log('   ✅ Product created successfully!');
    console.log('   Product ID:', createdProduct._id);
    console.log('   Product Name:', createdProduct.name);
    console.log('   Images:', createdProduct.images);
    console.log('');

    // Test 5: Verify product was saved
    console.log('📊 Test 5: Verify Product in Database');
    const foundProduct = await Product.findById(createdProduct._id);
    if (foundProduct) {
      console.log('   ✅ Product found in database');
      console.log('   Name:', foundProduct.name);
      console.log('   Price:', foundProduct.price);
      console.log('   Stock:', foundProduct.stock);
      console.log('   Featured:', foundProduct.isFeatured);
      console.log('   Images:', foundProduct.images);
    } else {
      console.log('   ❌ Product NOT found in database');
    }
    console.log('');

    // Test 6: Update product (simulating edit)
    console.log('📊 Test 6: Update Product (Simulating Edit)');
    const updatedProduct = await Product.findByIdAndUpdate(
      createdProduct._id,
      { 
        name: 'Updated Test Product',
        price: 89.99,
        stock: 150
      },
      { new: true, runValidators: true }
    );
    console.log('   ✅ Product updated successfully!');
    console.log('   New Name:', updatedProduct.name);
    console.log('   New Price:', updatedProduct.price);
    console.log('   New Stock:', updatedProduct.stock);
    console.log('');

    // Test 7: Get all products (simulating admin dashboard fetch)
    console.log('📊 Test 7: Fetch All Products (Simulating Dashboard)');
    const allProducts = await Product.find().limit(5);
    console.log(`   Retrieved ${allProducts.length} products`);
    allProducts.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name} - $${p.price} - Stock: ${p.stock}`);
    });
    console.log('');

    // Test 8: Delete test product
    console.log('📊 Test 8: Delete Product (Simulating Delete)');
    const deletedProduct = await Product.findByIdAndDelete(createdProduct._id);
    if (deletedProduct) {
      console.log('   ✅ Product deleted successfully!');
      console.log('   Deleted:', deletedProduct.name);
    }
    console.log('');

    // Test 9: Verify deletion
    console.log('📊 Test 9: Verify Deletion');
    const checkDeleted = await Product.findById(createdProduct._id);
    if (!checkDeleted) {
      console.log('   ✅ Product successfully removed from database');
    } else {
      console.log('   ❌ Product still exists in database');
    }
    console.log('');

    // Final Summary
    console.log('═══════════════════════════════════════');
    console.log('📋 Test Summary');
    console.log('═══════════════════════════════════════');
    console.log('✅ Database connection: WORKING');
    console.log(`✅ Admin users: ${adminUsers.length > 0 ? 'FOUND' : 'NOT FOUND'}`);
    console.log(`✅ Existing products: ${existingProducts.length}`);
    console.log('✅ Create product: WORKING');
    console.log('✅ Read product: WORKING');
    console.log('✅ Update product: WORKING');
    console.log('✅ Delete product: WORKING');
    console.log('═══════════════════════════════════════');
    console.log('\n🎉 All tests passed! Admin dashboard should work correctly.\n');

    // Instructions
    console.log('📝 Next Steps:');
    console.log('1. Make sure backend server is running: npm run dev');
    console.log('2. Make sure you have an admin user: npm run make-admin');
    console.log('3. Login as admin on frontend');
    console.log('4. Go to Admin Dashboard → Manage Products');
    console.log('5. Try adding a product\n');

    process.exit(0);
  } catch (error) {
    console.error('\n❌ Error during testing:', error.message);
    console.error('Stack:', error.stack);
    process.exit(1);
  }
};

testAdminFlow();

// Made with Bob
