const express = require('express');
const router = express.Router();
const productService = require('../services/productService');

// POST - Create a new product
router.post('/', async (req, res) => {
  try {
    const { productName, productDescription, productPrice, productCategory, category } = req.body;

    const productData = {
      productName,
      productDescription,
      productPrice,
      productCategory,
      category
    };

    const product = await productService.createProduct(productData);

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: product
    });

  } catch (error) {
    console.error('Error creating product:', error);
    
    // Handle validation and business logic errors
    if (error.message.includes('required') || 
        error.message.includes('already exists') ||
        error.message.includes('must be') ||
        error.message.includes('cannot be empty') ||
        error.message.includes('incorrect') ||
        error.message.includes('does not exist')) {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
});

// GET - Retrieve all products
router.get('/', async (req, res) => {
  try {
    const products = await productService.getAllProducts();

    res.status(200).json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('Error fetching products:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
});

// GET - Retrieve a specific product by ID
router.get('/:productId', async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await productService.getProductById(productId);

    res.status(200).json({
      success: true,
      data: product
    });

  } catch (error) {
    console.error('Error fetching product:', error);

    if (error.message === 'Product not found') {
      return res.status(404).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
});

// GET - Retrieve products by category ID
router.get('/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;

    const products = await productService.getProductsByCategory(categoryId);

    res.status(200).json({
      success: true,
      data: products
    });

  } catch (error) {
    console.error('Error fetching products by category:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products by category',
      error: error.message
    });
  }
});

module.exports = router;