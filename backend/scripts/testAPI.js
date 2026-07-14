import mongoose from 'mongoose';
import Product from '../models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

const testAPI = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    // Get one product
    const product = await Product.findOne();
    
    if (!product) {
      console.log('❌ No products found in database!');
      process.exit(1);
    }

    console.log('📦 Sample Product from Database:');
    console.log('================================\n');
    console.log('ID:', product._id);
    console.log('Name:', product.name);
    console.log('Description:', product.description);
    console.log('Price:', product.price);
    console.log('Discount Price:', product.discountPrice);
    console.log('Category:', product.category);
    console.log('Subcategory:', product.subcategory);
    console.log('Brand:', product.brand);
    console.log('Sizes:', product.sizes);
    console.log('Colors:', product.colors);
    console.log('Images:', product.images);
    console.log('Stock:', product.stock);
    console.log('Ratings:', product.ratings);
    console.log('Num Reviews:', product.numReviews);
    console.log('Is Featured:', product.isFeatured);
    console.log('Is Active:', product.isActive);
    console.log('\n================================\n');

    // Test what the API would return
    const productObj = product.toObject();
    console.log('📡 Product as API would return it:');
    console.log(JSON.stringify(productObj, null, 2));
    console.log('\n================================\n');

    // Count all products
    const count = await Product.countDocuments();
    console.log(`✅ Total products in database: ${count}`);

    // Get all featured products
    const featured = await Product.find({ isFeatured: true });
    console.log(`✅ Featured products: ${featured.length}`);
    
    if (featured.length > 0) {
      console.log('\n🌟 Featured Products:');
      featured.forEach((p, i) => {
        console.log(`${i + 1}. ${p.name} - $${p.price} - Images: ${p.images?.length || 0}`);
      });
    }

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

testAPI();

// Made with Bob
