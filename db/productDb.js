const dynamoDB = require('./dynamoDbClient');
const TABLE_NAME = 'Products';

class ProductDb {
  async createProduct(productData) {
    const params = {
      TableName: TABLE_NAME,
      Item: productData
    };

    await dynamoDB.put(params).promise();
    return productData;
  }

  async getAllProducts() {
    const params = {
      TableName: TABLE_NAME
    };

    const result = await dynamoDB.scan(params).promise();
    return result.Items;
  }

  async getProductById(productId) {
    const params = {
      TableName: TABLE_NAME,
      Key: {
        productId
      }
    };

    const result = await dynamoDB.get(params).promise();
    return result.Item;
  }

  async getProductsByCategory(categoryId) {
    const params = {
      TableName: TABLE_NAME,
      FilterExpression: 'productCategory = :categoryId',
      ExpressionAttributeValues: {
        ':categoryId': categoryId
      }
    };

    const result = await dynamoDB.scan(params).promise();
    return result.Items;
  }
}

module.exports = new ProductDb();