import Product from '../models/Product.js';

// @desc    Get all products with filtering, sorting, and pagination
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const skip = (page - 1) * limit;

    // Build query
    let query = { isActive: true };

    // Filter by category
    if (req.query.category) {
      query.category = req.query.category;
    }

    // Filter by subcategory
    if (req.query.subcategory) {
      query.subcategory = req.query.subcategory;
    }

    // Filter by brand
    if (req.query.brand) {
      query.brand = req.query.brand;
    }

    // Filter by sizes (comma-separated list, e.g. ?sizes=S,M,L)
    if (req.query.sizes) {
      const sizeList = req.query.sizes.split(',').map((s) => s.trim()).filter(Boolean);
      if (sizeList.length) query.sizes = { $in: sizeList };
    }

    // Filter by price range
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
    }

    // Search by name or description
    if (req.query.search) {
      query.$or = [
        { name: { $regex: req.query.search, $options: 'i' } },
        { description: { $regex: req.query.search, $options: 'i' } }
      ];
    }

    // Filter by featured — accept both ?featured=true and ?isFeatured=true
    if (req.query.featured === 'true' || req.query.isFeatured === 'true') {
      query.isFeatured = true;
    }

    // Sort
    let sortBy = {};
    if (req.query.sort) {
      const sortField = req.query.sort;
      sortBy[sortField] = req.query.order === 'desc' ? -1 : 1;
    } else {
      sortBy.createdAt = -1; // Default: newest first
    }

    const products = await Product.find(query)
      .sort(sortBy)
      .limit(limit)
      .skip(skip);

    const total = await Product.countDocuments(query);

    // Ensure all products have images
    const productsWithImages = products.map(product => {
      const productObj = product.toObject();
      if (!productObj.images || productObj.images.length === 0) {
        const randomId = Math.floor(Math.random() * 1000);
        productObj.images = [`https://picsum.photos/400/400?random=${randomId}`];
      }
      return productObj;
    });

    // Debug log
    console.log(`📦 Returning ${productsWithImages.length} products`);
    if (productsWithImages.length > 0) {
      console.log(`🖼️  First product images:`, productsWithImages[0].images);
    }

    res.status(200).json({
      status: 'success',
      results: productsWithImages.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      products: productsWithImages
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single product
// @route   GET /api/products/:id
// @access  Public
export const getProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('reviews.user', 'name avatar');

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    res.status(200).json({
      status: 'success',
      product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body);

    res.status(201).json({
      status: 'success',
      product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
export const updateProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    res.status(200).json({
      status: 'success',
      product
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
export const deleteProduct = async (req, res, next) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Product deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create product review
// @route   POST /api/products/:id/reviews
// @access  Private
export const createProductReview = async (req, res, next) => {
  try {
    const { rating, comment } = req.body;

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    // Check if user already reviewed
    const alreadyReviewed = product.reviews.find(
      r => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({
        status: 'error',
        message: 'Product already reviewed'
      });
    }

    const review = {
      user: req.user._id,
      name: req.user.name,
      rating: Number(rating),
      comment
    };

    product.reviews.push(review);
    product.calculateAverageRating();

    await product.save();

    res.status(201).json({
      status: 'success',
      message: 'Review added'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product categories
// @route   GET /api/products/categories/list
// @access  Public
export const getCategories = async (req, res, next) => {
  try {
    const categories = await Product.distinct('category');
    
    res.status(200).json({
      status: 'success',
      categories
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get product brands
// @route   GET /api/products/brands/list
// @access  Public
export const getBrands = async (req, res, next) => {
  try {
    const brands = await Product.distinct('brand');
    
    res.status(200).json({
      status: 'success',
      brands
    });
  } catch (error) {
    next(error);
  }
};

// Made with Bob
