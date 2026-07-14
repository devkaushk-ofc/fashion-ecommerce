import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide product name'],
    trim: true,
    maxlength: [100, 'Product name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide product description'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please provide product price'],
    min: [0, 'Price cannot be negative']
  },
  discountPrice: {
    type: Number,
    default: 0,
    min: [0, 'Discount price cannot be negative']
  },
  category: {
    type: String,
    required: [true, 'Please provide product category'],
    enum: [
      'Men',
      'Women',
      'Kids',
      'Accessories',
      'Shoes',
      'Bags',
      'Jewelry',
      'Watches'
    ]
  },
  subcategory: {
    type: String,
    required: [true, 'Please provide product subcategory']
  },
  brand: {
    type: String,
    required: [true, 'Please provide brand name']
  },
  sizes: [{
    type: String,
    enum: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'Free Size']
  }],
  colors: [{
    type: String
  }],
  images: [{
    type: String,
    required: true
  }],
  stock: {
    type: Number,
    required: [true, 'Please provide stock quantity'],
    min: [0, 'Stock cannot be negative'],
    default: 0
  },
  ratings: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  reviews: [reviewSchema],
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String
  }],
  material: {
    type: String,
    default: ''
  },
  careInstructions: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Pre-save hook to add default images if missing
productSchema.pre('save', function(next) {
  // Add default image if images array is empty
  if (!this.images || this.images.length === 0) {
    const randomId = Math.floor(Math.random() * 1000);
    this.images = [`https://picsum.photos/400/400?random=${randomId}`];
  }

  // Set default material if empty
  if (!this.material || this.material.trim() === '') {
    this.material = 'Premium Quality Material';
  }

  // Set default care instructions if empty
  if (!this.careInstructions || this.careInstructions.trim() === '') {
    this.careInstructions = 'Machine wash cold, tumble dry low';
  }

  next();
});

// Calculate average rating
productSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.ratings = 0;
    this.numReviews = 0;
  } else {
    const totalRating = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.ratings = (totalRating / this.reviews.length).toFixed(1);
    this.numReviews = this.reviews.length;
  }
};

export default mongoose.model('Product', productSchema);

// Made with Bob
