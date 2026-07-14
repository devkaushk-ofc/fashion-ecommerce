// Middleware to add default values for missing product fields

const generateImageUrl = () => {
  const randomId = Math.floor(Math.random() * 1000);
  return `https://picsum.photos/400/400?random=${randomId}`;
};

export const addProductDefaults = (req, res, next) => {
  const product = req.body;

  // Set default name if missing
  if (!product.name || product.name.trim() === '') {
    product.name = 'Fashion Item';
  }

  // Set default description if missing
  if (!product.description || product.description.trim() === '') {
    product.description = 'Stylish and comfortable fashion item perfect for any occasion. Made with quality materials for lasting durability.';
  }

  // Set default price if missing or invalid
  if (!product.price || product.price <= 0) {
    product.price = 49.99;
  }

  // Set default category if missing
  if (!product.category) {
    product.category = 'Men';
  }

  // Set default subcategory if missing
  if (!product.subcategory) {
    product.subcategory = 'Clothing';
  }

  // Set default brand if missing
  if (!product.brand) {
    product.brand = 'Fashion Brand';
  }

  // Set default sizes if missing
  if (!product.sizes || product.sizes.length === 0) {
    product.sizes = ['S', 'M', 'L', 'XL'];
  }

  // Set default colors if missing
  if (!product.colors || product.colors.length === 0) {
    product.colors = ['Black', 'White', 'Blue'];
  }

  // Set default images if missing
  if (!product.images || product.images.length === 0) {
    product.images = [generateImageUrl()];
  }

  // Set default stock if missing
  if (product.stock === undefined || product.stock < 0) {
    product.stock = 50;
  }

  // Set default ratings if missing
  if (!product.ratings) {
    product.ratings = 0;
  }

  // Set default numReviews if missing
  if (!product.numReviews) {
    product.numReviews = 0;
  }

  // Set default reviews if missing
  if (!product.reviews) {
    product.reviews = [];
  }

  // Set default isFeatured if missing
  if (product.isFeatured === undefined) {
    product.isFeatured = false;
  }

  // Set default isActive if missing
  if (product.isActive === undefined) {
    product.isActive = true;
  }

  // Set default tags if missing
  if (!product.tags || product.tags.length === 0) {
    product.tags = ['new'];
  }

  // Set default material if missing
  if (!product.material) {
    product.material = 'Premium Quality Material';
  }

  // Set default care instructions if missing
  if (!product.careInstructions) {
    product.careInstructions = 'Machine wash cold, tumble dry low';
  }

  // Set default discountPrice if missing
  if (product.discountPrice === undefined) {
    product.discountPrice = 0;
  }

  next();
};

// Middleware to ensure product has valid image before sending response
export const ensureProductImages = (req, res, next) => {
  const originalJson = res.json;

  res.json = function(data) {
    // Check if response contains product(s)
    if (data.product) {
      data.product = addDefaultsToProduct(data.product);
    } else if (data.products && Array.isArray(data.products)) {
      data.products = data.products.map(addDefaultsToProduct);
    }

    originalJson.call(this, data);
  };

  next();
};

// Helper function to add defaults to a single product
const addDefaultsToProduct = (product) => {
  if (!product) return product;

  // Ensure images array exists and has at least one image
  if (!product.images || product.images.length === 0) {
    product.images = [generateImageUrl()];
  }

  // Ensure name exists
  if (!product.name || product.name.trim() === '') {
    product.name = 'Fashion Item';
  }

  // Ensure description exists
  if (!product.description || product.description.trim() === '') {
    product.description = 'Stylish fashion item';
  }

  // Ensure price exists
  if (!product.price || product.price <= 0) {
    product.price = 49.99;
  }

  return product;
};

// Made with Bob
