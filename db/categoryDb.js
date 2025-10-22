const dynamoDB = require('./dynamoDbClient');
const TABLE_NAME = 'Categories';

class CategoryDb {
  async createCategory(categoryData) {
    const params = {
      TableName: TABLE_NAME,
      Item: categoryData
    };

    await dynamoDB.put(params).promise();
    return categoryData;
  }

  async getAllCategories() {
    const params = {
      TableName: TABLE_NAME,
      FilterExpression: 'imageUploadStatus = :status',
      ExpressionAttributeValues: {
        ':status': 'completed'
      }
    };

    const result = await dynamoDB.scan(params).promise();
    return result.Items;
  }

  async getCategoryById(categoryId) {
    const params = {
      TableName: TABLE_NAME,
      Key: {
        categoryId
      }
    };

    const result = await dynamoDB.get(params).promise();
    return result.Item;
  }

  async findCategoryByName(categoryName) {
    const allCategories = await this.getAllCategories();
    return allCategories.find(
      category => category.categoryName.toLowerCase() === categoryName.toLowerCase()
    );
  }

  async updateCategoryImageStatus(categoryId, imageUploadStatus) {
    const params = {
      TableName: TABLE_NAME,
      Key: {
        categoryId
      },
      UpdateExpression: 'SET imageUploadStatus = :status',
      ExpressionAttributeValues: {
        ':status': imageUploadStatus
      },
      ReturnValues: 'ALL_NEW'
    };

    const result = await dynamoDB.update(params).promise();
    return result.Attributes;
  }
}

module.exports = new CategoryDb();