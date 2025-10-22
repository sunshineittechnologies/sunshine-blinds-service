const { v4: uuidv4 } = require('uuid');
const categoryDb = require('../db/categoryDb');
const awsService = require('./awsService');

class CategoryService {
  validateCategoryInput(categoryName, categorySubText, categoryDescription, categoryImageNames) {
    if (!categoryName || !categoryDescription || !categorySubText || !categoryImageNames) {
      return {
        isValid: false,
        message: 'categoryName/categorySubText/categoryDescription/categoryImageNames are required'
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

    if (categoryImageNames.length === 0) {
      return {
        isValid: false,
        message: 'categoryImageNames cannot be empty'
      }
    }

    return { isValid: true };
  }

  async checkDuplicateCategory(categoryName) {
    const existingCategory = await categoryDb.findCategoryByName(categoryName);
    return existingCategory !== undefined;
  }

  async createCategory(categoryName, categorySubText, categoryDescription, categoryImageNames) {
    // Validate input
    const validation = this.validateCategoryInput(categoryName, categorySubText, categoryDescription, categoryImageNames);
    if (!validation.isValid) {
      throw new Error(validation.message);
    }

    // Check for duplicates
    const isDuplicate = await this.checkDuplicateCategory(categoryName);
    if (isDuplicate) {
      throw new Error(`Category with name '${categoryName}' already exists`);
    }

    const categoryId = uuidv4();
    const presignedUrlMap = new Map();
    for(const imageName of categoryImageNames) {
      const presignedUrl = await awsService.generatePreSignedUrl(categoryId, imageName);
      presignedUrlMap.set(imageName, presignedUrl);
    }
    
    const imagesPath = awsService.getImagePath(categoryId);

    // Create category object
    const categoryData = {
      categoryId,
      categoryName,
      categorySubText,
      categoryDescription,
      presignedUrls: Object.fromEntries(presignedUrlMap),
      imagesPath,
      categoryImageNames,
      imageUploadStatus: 'pending',
      createdAt: new Date().toISOString()
    };

    // Save to database
    return await categoryDb.createCategory(categoryData);
  }

  async getAllCategories() {
    const categories = await categoryDb.getAllCategories();
    for (const category of categories) 
      if(category.imagesPath && category.imagesPath != '')
        category.imagesPath = awsService.getPublicImageUrl(category.imagesPath);
      
    return categories;
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

  async updateImageUploadStatus(categoryId, status) {
    if (!categoryId) {
      throw new Error('categoryId is required');
    }

    if (status !== 'completed') {
      throw new Error('status must be "completed"');
    }

    // Check if category exists
    const category = await categoryDb.getCategoryById(categoryId);
    if (!category) {
      throw new Error('Category not found');
    }

    // Update the status
    const updatedCategory = await categoryDb.updateCategoryImageStatus(categoryId, status);
    return updatedCategory;
  }
}

module.exports = new CategoryService();