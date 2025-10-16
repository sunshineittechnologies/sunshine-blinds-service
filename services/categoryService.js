const { v4: uuidv4 } = require('uuid');
const categoryDb = require('../db/categoryDb');

class CategoryService {
  validateCategoryInput(categoryName, categorySubText, categoryDescription) {
    if (!categoryName || !categoryDescription || !categorySubText) {
      return {
        isValid: false,
        message: 'categoryName and categoryDescription are required'
      };
    }

    if (typeof categoryName !== 'string' || typeof categoryDescription !== 'string') {
      return {
        isValid: false,
        message: 'categoryName and categoryDescription must be strings'
      };
    }

    if (categoryName.trim().length === 0) {
      return {
        isValid: false,
        message: 'categoryName cannot be empty'
      };
    }

    if (categoryDescription.trim().length === 0) {
      return {
        isValid: false,
        message: 'categoryDescription cannot be empty'
      };
    }

    if (categorySubText.trim().length === 0) {
      return {
        isValid: false,
        message: 'categorySubText cannot be empty'
      };
    }

    return { isValid: true };
  }

  async checkDuplicateCategory(categoryName) {
    const existingCategory = await categoryDb.findCategoryByName(categoryName);
    return existingCategory !== undefined;
  }

  async createCategory(categoryName, categorySubText, categoryDescription) {
    // Validate input
    const validation = this.validateCategoryInput(categoryName, categorySubText, categoryDescription);
    if (!validation.isValid) {
      throw new Error(validation.message);
    }

    // Check for duplicates
    const isDuplicate = await this.checkDuplicateCategory(categoryName);
    if (isDuplicate) {
      throw new Error(`Category with name '${categoryName}' already exists`);
    }

    // Create category object
    const categoryData = {
      categoryId: uuidv4(),
      categoryName,
      categoryDescription,
      createdAt: new Date().toISOString()
    };

    // Save to database
    return await categoryDb.createCategory(categoryData);
  }

  async getAllCategories() {
    return await categoryDb.getAllCategories();
  }

  async getCategoryById(categoryId) {
    if (!categoryId) {
      throw new Error('categoryId is required');
    }

    const category = await categoryDb.getCategoryById(categoryId);
    if (!category) {
      throw new Error('Category not found');
    }

    return category;
  }
}

module.exports = new CategoryService();