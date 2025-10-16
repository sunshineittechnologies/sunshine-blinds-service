const { v4: uuidv4 } = require('uuid');
const productDb = require('../db/productDb');
const categoryDb = require('../db/categoryDb');

class ProductService {
  validateProductInput(productData) {
    const { productName, productDescription, productPrice, productCategory, category } = productData;

    if (!productName || !productDescription || !productPrice || !productCategory) {
      return {
        isValid: false,
        message: 'productName, productDescription, productPrice, and productCategory are required'
      };
    }

    if (typeof productName !== 'string' || typeof productDescription !== 'string' || 
        typeof productPrice !== 'string' || typeof productCategory !== 'string') {
      return {
        isValid: false,
        message: 'productName, productDescription, productPrice, and productCategory must be strings'
      };
    }

    if (productName.trim().length === 0 || productDescription.trim().length === 0 || 
        productPrice.trim().length === 0 || productCategory.trim().length === 0) {
      return {
        isValid: false,
        message: 'Product fields cannot be empty'
      };
    }

    // If productCategory is "NewCategory", validate category object
    if (productCategory === 'NewCategory') {
      if (!category || typeof category !== 'object') {
        return {
          isValid: false,
          message: 'category object is required when productCategory is "NewCategory"'
        };
      }

      const { categoryName, categorySubText, categoryDescription } = category;

      if (!categoryName || !categorySubText || !categoryDescription) {
        return {
          isValid: false,
          message: 'categoryName, categorySubText, and categoryDescription are required in category object'
        };
      }

      if (typeof categoryName !== 'string' || typeof categorySubText !== 'string' || 
          typeof categoryDescription !== 'string') {
        return {
          isValid: false,
          message: 'Category fields must be strings'
        };
      }

      if (categoryName.trim().length === 0 || categorySubText.trim().length === 0 || 
          categoryDescription.trim().length === 0) {
        return {
          isValid: false,
          message: 'Category fields cannot be empty'
        };
      }
    }

    return { isValid: true };
  }

  async createProduct(productData) {
    const { productName, productDescription, productPrice, productCategory, category } = productData;

    // Validate input
    const validation = this.validateProductInput(productData);
    if (!validation.isValid) {
      throw new Error(validation.message);
    }

    let finalCategoryId = productCategory;

    // Handle "NewCategory" case
    if (productCategory === 'NewCategory') {
      const { categoryName, categorySubText, categoryDescription } = category;

      // Check if category with same name already exists
      const existingCategory = await categoryDb.findCategoryByName(categoryName);
      if (existingCategory) {
        throw new Error(`Category with name '${categoryName}' already exists`);
      }

      // Create new category
      const newCategoryData = {
        categoryId: uuidv4(),
        categoryName,
        categorySubText,
        categoryDescription,
        createdAt: new Date().toISOString()
      };

      await categoryDb.createCategory(newCategoryData);
      finalCategoryId = newCategoryData.categoryId;
    } else {
      // Verify that the categoryId exists
      const existingCategory = await categoryDb.getCategoryById(productCategory);
      if (!existingCategory) {
        throw new Error('productCategory is incorrect. Category ID does not exist');
      }
    }

    // Create product object
    const product = {
      productId: uuidv4(),
      productName,
      productDescription,
      productPrice,
      productCategory: finalCategoryId,
      createdAt: new Date().toISOString()
    };

    // Save to database
    return await productDb.createProduct(product);
  }

  async getAllProducts() {
    return await productDb.getAllProducts();
  }

  async getProductById(productId) {
    if (!productId) {
      throw new Error('productId is required');
    }

    const product = await productDb.getProductById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    return product;
  }

  async getProductsByCategory(categoryId) {
    if (!categoryId) {
      throw new Error('categoryId is required');
    }

    return await productDb.getProductsByCategory(categoryId);
  }
}

module.exports = new ProductService();