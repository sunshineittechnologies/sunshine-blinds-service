const express = require('express');
const router = express.Router();
const categoryService = require('../services/categoryService');

// POST - Create a new category
router.post('/', async (req, res) => {
  try {
    const { categoryName, categorySubText, categoryDescription } = req.body;

    const category = await categoryService.createCategory(categoryName, categorySubText, categoryDescription);

    res.status(201).json({
      success: true,
      message: 'Category created successfully',
      data: category
    });

  } catch (error) {
    console.error('Error creating category:', error);
    
    // Handle validation and duplicate errors
    if (error.message.includes('required') || 
        error.message.includes('already exists') ||
        error.message.includes('must be') ||
        error.message.includes('cannot be empty')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating category',
      error: error.message
    });
  }
});

// GET - Retrieve all categories
router.get('/', async (req, res) => {
  try {
    const categories = await categoryService.getAllCategories();

    res.status(200).json({
      success: true,
      data: categories
    });

  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching categories',
      error: error.message
    });
  }
});

// GET - Retrieve a specific category by ID
router.get('/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;

    const category = await categoryService.getCategoryById(categoryId);

    res.status(200).json({
      success: true,
      data: category
    });

  } catch (error) {
    console.error('Error fetching category:', error);

    if (error.message === 'Category not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching category',
      error: error.message
    });
  }
});

module.exports = router;