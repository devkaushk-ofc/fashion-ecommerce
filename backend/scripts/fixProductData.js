import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Product from '../models/Product.js';

// Load environment variables
dotenv.config();

// Sample fashion product data
const fashionProducts = [
  { name: 'Classic Denim Jacket', category: 'Men', subcategory: 'Jackets', brand: 'Urban Style', price: 79.99, description: 'Timeless denim jacket with a modern fit. Perfect for casual outings and layering.' },
  { name: 'Floral Summer Dress', category: 'Women', subcategory: 'Dresses', brand: 'Bella Fashion', price: 59.99, description: 'Beautiful floral print dress perfect for summer occasions. Lightweight and comfortable.' },
  { name: 'Casual White Sneakers', category: 'Shoes', subcategory: 'Sneakers', brand: 'ComfortWalk', price: 89.99, description: 'Versatile white sneakers that go with everything. Premium comfort and style.' },
  { name: 'Leather Crossbody Bag', category: 'Bags', subcategory: 'Handbags', brand: 'LuxeLeather', price: 129.99, description: 'Elegant leather crossbody bag with adjustable strap. Perfect for daily use.' },
  { name: 'Cotton Polo Shirt', category: 'Men', subcategory: 'Shirts', brand: 'Classic Fit', price: 39.99, description: 'Premium cotton polo shirt in classic colors. Comfortable and stylish.' },
  { name: 'High-Waisted Jeans', category: 'Women', subcategory: 'Jeans', brand: 'Denim Co', price: 69.99, description: 'Trendy high-waisted jeans with perfect fit. Durable and fashionable.' },
  { name: 'Kids Graphic T-Shirt', category: 'Kids', subcategory: 'T-Shirts', brand: 'Fun Wear', price: 24.99, description: 'Colorful graphic t-shirt for kids. Soft fabric and fun designs.' },
  { name: 'Aviator Sunglasses', category: 'Accessories', subcategory: 'Sunglasses', brand: 'SunStyle', price: 49.99, description: 'Classic aviator sunglasses with UV protection. Timeless style.' },
  { name: 'Wool Blend Coat', category: 'Women', subcategory: 'Coats', brand: 'Winter Elegance', price: 159.99, description: 'Elegant wool blend coat for cold weather. Warm and sophisticated.' },
  { name: 'Running Shoes', category: 'Shoes', subcategory: 'Athletic', brand: 'SportPro', price: 99.99, description: 'High-performance running shoes with excellent cushioning and support.' }
];

// Generate image URL based on category
const generateImageUrl = (category, subcategory, index) => {
  const queries = {
    'Men': ['mens-fashion', 'mens-clothing', 'mens-style'],
    'Women': ['womens-fashion', 'womens-clothing', 'womens-style'],
    'Kids': ['kids-fashion', 'kids-clothing', 'children-wear'],
    'Shoes': ['shoes', 'footwear', 'sneakers'],
    'Bags': ['bags', 'handbags', 'fashion-bags'],
    'Accessories': ['fashion-accessories', 'accessories', 'jewelry'],
    'Jewelry': ['jewelry', 'fashion-jewelry', 'accessories'],
    'Watches': ['watches', 'fashion-watches', 'timepiece']
  };

  const categoryQuery = queries[category] || ['fashion', 'clothing'];
  const query = categoryQuery[index % categoryQuery.length];
  
  return `https://source.unsplash.com/400x400/?${query},${subcategory.toLowerCase()}`;
};

// Get random item from array
const getRandomItem = (array) => array[Math.floor(Math.random() * array.length)];

// Generate default product data
const generateDefaultProduct = (existingProduct, index) => {
  const template = getRandomItem(fashionProducts);
  const categories = ['Men', 'Women', 'Kids', 'Accessories', 'Shoes', 'Bags'];
  const sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
  const colors = ['Black', 'White', 'Blue', 'Red', 'Green', 'Gray', 'Navy', 'Beige'];

  return {
    name: existingProduct.name || `${template.name} ${index}`,
    description: existingProduct.description || template.description,
    price: existingProduct.price || template.price,
    discountPrice: existingProduct.discountPrice || 0,
    category: existingProduct.category || template.category,
    subcategory: existingProduct.subcategory || template.subcategory,
    brand: existingProduct.brand || template.brand,
    sizes: existingProduct.sizes?.length > 0 ? existingProduct.sizes : ['S', 'M', 'L', 'XL'],
    colors: existingProduct.colors?.length > 0 ? existingProduct.colors : ['Black', 'White', 'Blue'],
    images: existingProduct.images?.length > 0 ? existingProduct.images : [
      generateImageUrl(template.category, template.subcategory, index),
      generateImageUrl(template.category, template.subcategory, index + 1)
    ],
    stock: existingProduct.stock || 50,
    ratings: existingProduct.ratings || 4.0,
    numReviews: existingProduct.numReviews || 0,
    reviews: existingProduct.reviews || [],
    isFeatured: existingProduct.isFeatured !== undefined ? existingProduct.isFeatured : (index % 3 === 0),
    isActive: existingProduct.isActive !== undefined ? existingProduct.isActive : true,
    tags: existingProduct.tags?.length > 0 ? existingProduct.tags : ['new', 'trending'],
    material: existingProduct.material || 'Premium Quality Material',
    careInstructions: existingProduct.careInstructions || 'Machine wash cold, tumble dry low'
  };
};

const fixProductData = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    // Get all products
    const products = await Product.find();
    console.log(`📦 Found ${products.length} products in database\n`);

    if (products.length === 0) {
      console.log('📝 No products found. Creating sample products...\n');
      
      // Create sample products
      const sampleProducts = fashionProducts.map((template, index) => ({
        ...template,
        sizes: ['S', 'M', 'L', 'XL'],
        colors: ['Black', 'White', 'Blue'],
        images: [
          generateImageUrl(template.category, template.subcategory, index),
          generateImageUrl(template.category, template.subcategory, index + 1)
        ],
        stock: 100,
        ratings: 4.0 + (Math.random() * 1),
        numReviews: Math.floor(Math.random() * 50),
        reviews: [],
        isFeatured: index % 3 === 0,
        isActive: true,
        tags: ['new', 'trending'],
        material: 'Premium Quality Material',
        careInstructions: 'Machine wash cold, tumble dry low'
      }));

      await Product.insertMany(sampleProducts);
      console.log(`✅ Created ${sampleProducts.length} sample products\n`);
    } else {
      // Fix existing products
      let fixedCount = 0;
      
      for (let i = 0; i < products.length; i++) {
        const product = products[i];
        let needsUpdate = false;
        const updates = {};

        // Check and fix missing fields
        if (!product.name || product.name.trim() === '') {
          updates.name = `Fashion Item ${i + 1}`;
          needsUpdate = true;
        }

        if (!product.description || product.description.trim() === '') {
          updates.description = 'Stylish and comfortable fashion item perfect for any occasion. Made with quality materials.';
          needsUpdate = true;
        }

        if (!product.price || product.price <= 0) {
          updates.price = 49.99;
          needsUpdate = true;
        }

        if (!product.category) {
          updates.category = 'Men';
          needsUpdate = true;
        }

        if (!product.subcategory) {
          updates.subcategory = 'Clothing';
          needsUpdate = true;
        }

        if (!product.brand) {
          updates.brand = 'Fashion Brand';
          needsUpdate = true;
        }

        if (!product.images || product.images.length === 0) {
          updates.images = [
            generateImageUrl(product.category || 'Men', product.subcategory || 'Clothing', i),
            generateImageUrl(product.category || 'Men', product.subcategory || 'Clothing', i + 1)
          ];
          needsUpdate = true;
        }

        if (!product.sizes || product.sizes.length === 0) {
          updates.sizes = ['S', 'M', 'L', 'XL'];
          needsUpdate = true;
        }

        if (!product.colors || product.colors.length === 0) {
          updates.colors = ['Black', 'White', 'Blue'];
          needsUpdate = true;
        }

        if (product.stock === undefined || product.stock < 0) {
          updates.stock = 50;
          needsUpdate = true;
        }

        if (!product.material) {
          updates.material = 'Premium Quality Material';
          needsUpdate = true;
        }

        if (!product.careInstructions) {
          updates.careInstructions = 'Machine wash cold, tumble dry low';
          needsUpdate = true;
        }

        if (needsUpdate) {
          await Product.findByIdAndUpdate(product._id, updates);
          fixedCount++;
          console.log(`✅ Fixed product: ${updates.name || product.name}`);
        }
      }

      console.log(`\n✅ Fixed ${fixedCount} products with missing data`);
    }

    // Display summary
    const finalProducts = await Product.find();
    console.log('\n📊 Final Product Summary:');
    console.log(`   Total Products: ${finalProducts.length}`);
    console.log(`   Active Products: ${finalProducts.filter(p => p.isActive).length}`);
    console.log(`   Featured Products: ${finalProducts.filter(p => p.isFeatured).length}`);
    
    console.log('\n✅ Product data fix completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

// Run the script
fixProductData();

// Made with Bob
