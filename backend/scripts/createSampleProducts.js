import mongoose from 'mongoose';
import Product from '../models/Product.js';
import dotenv from 'dotenv';

dotenv.config();

const sampleProducts = [
  {
    name: 'Classic White Shirt',
    description: 'A timeless white shirt perfect for any occasion. Made from premium cotton fabric.',
    price: 49.99,
    category: 'Men',
    subcategory: 'Shirts',
    brand: 'Fashion Brand',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Blue', 'Black'],
    stock: 50,
    images: ['https://picsum.photos/400/400?random=1'],
    isFeatured: true,
    ratings: 4.5,
    numReviews: 120
  },
  {
    name: 'Slim Fit Jeans',
    description: 'Comfortable slim fit jeans with stretch fabric. Perfect for everyday wear.',
    price: 79.99,
    discountPrice: 59.99,
    category: 'Men',
    subcategory: 'Jeans',
    brand: 'Denim Co',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['Blue', 'Black', 'Grey'],
    stock: 75,
    images: ['https://picsum.photos/400/400?random=2'],
    isFeatured: true,
    ratings: 4.7,
    numReviews: 200
  },
  {
    name: 'Floral Summer Dress',
    description: 'Beautiful floral print dress perfect for summer. Light and breathable fabric.',
    price: 89.99,
    category: 'Women',
    subcategory: 'Dresses',
    brand: 'Summer Style',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Floral Pink', 'Floral Blue', 'Floral Yellow'],
    stock: 40,
    images: ['https://picsum.photos/400/400?random=3'],
    isFeatured: true,
    ratings: 4.8,
    numReviews: 150
  },
  {
    name: 'Leather Jacket',
    description: 'Premium leather jacket with modern design. Perfect for cool weather.',
    price: 199.99,
    discountPrice: 149.99,
    category: 'Women',
    subcategory: 'Jackets',
    brand: 'Leather Luxe',
    sizes: ['S', 'M', 'L'],
    colors: ['Black', 'Brown'],
    stock: 25,
    images: ['https://picsum.photos/400/400?random=4'],
    isFeatured: true,
    ratings: 4.9,
    numReviews: 85
  },
  {
    name: 'Kids Cotton T-Shirt',
    description: 'Soft cotton t-shirt for kids. Fun prints and comfortable fit.',
    price: 19.99,
    category: 'Kids',
    subcategory: 'T-Shirts',
    brand: 'Kids Fashion',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Red', 'Blue', 'Green', 'Yellow'],
    stock: 100,
    images: ['https://picsum.photos/400/400?random=5'],
    isFeatured: true,
    ratings: 4.6,
    numReviews: 95
  },
  {
    name: 'Kids Denim Shorts',
    description: 'Comfortable denim shorts for active kids. Durable and stylish.',
    price: 29.99,
    category: 'Kids',
    subcategory: 'Shorts',
    brand: 'Kids Denim',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Blue', 'Black'],
    stock: 60,
    images: ['https://picsum.photos/400/400?random=6'],
    isFeatured: true,
    ratings: 4.4,
    numReviews: 70
  },
  {
    name: 'Designer Handbag',
    description: 'Elegant designer handbag with premium materials. Perfect for any occasion.',
    price: 149.99,
    discountPrice: 119.99,
    category: 'Accessories',
    subcategory: 'Bags',
    brand: 'Luxury Bags',
    sizes: ['Free Size'],
    colors: ['Black', 'Brown', 'Beige'],
    stock: 30,
    images: ['https://picsum.photos/400/400?random=7'],
    isFeatured: true,
    ratings: 4.7,
    numReviews: 110
  },
  {
    name: 'Aviator Sunglasses',
    description: 'Classic aviator sunglasses with UV protection. Timeless style.',
    price: 79.99,
    category: 'Accessories',
    subcategory: 'Sunglasses',
    brand: 'Sun Style',
    sizes: ['Free Size'],
    colors: ['Gold', 'Silver', 'Black'],
    stock: 80,
    images: ['https://picsum.photos/400/400?random=8'],
    isFeatured: true,
    ratings: 4.5,
    numReviews: 130
  },
  {
    name: 'Casual Sneakers',
    description: 'Comfortable casual sneakers for everyday wear. Lightweight and stylish.',
    price: 69.99,
    category: 'Men',
    subcategory: 'Shoes',
    brand: 'Sneaker Pro',
    sizes: ['S', 'M', 'L', 'XL'],
    colors: ['White', 'Black', 'Grey'],
    stock: 90,
    images: ['https://picsum.photos/400/400?random=9'],
    isFeatured: true,
    ratings: 4.6,
    numReviews: 180
  },
  {
    name: 'Elegant Evening Gown',
    description: 'Stunning evening gown for special occasions. Luxurious fabric and design.',
    price: 299.99,
    discountPrice: 249.99,
    category: 'Women',
    subcategory: 'Dresses',
    brand: 'Evening Elegance',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Black', 'Red', 'Navy'],
    stock: 20,
    images: ['https://picsum.photos/400/400?random=10'],
    isFeatured: true,
    ratings: 4.9,
    numReviews: 65
  }
];

const createSampleProducts = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB Connected\n');

    // Delete existing products (optional - comment out if you want to keep existing)
    console.log('🗑️  Clearing existing products...');
    await Product.deleteMany({});
    console.log('✅ Existing products cleared\n');

    // Create sample products
    console.log('📦 Creating sample products...');
    const createdProducts = await Product.insertMany(sampleProducts);
    console.log(`✅ Created ${createdProducts.length} sample products\n`);

    // Display summary
    console.log('📊 Product Summary:');
    const categories = await Product.aggregate([
      { $group: { _id: '$category', count: { $sum: 1 } } }
    ]);
    categories.forEach(cat => {
      console.log(`   ${cat._id}: ${cat.count} products`);
    });

    console.log('\n🎉 Sample products created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
};

createSampleProducts();

// Made with Bob
