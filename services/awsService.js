const AWS = require('aws-sdk');

const S3_BUCKET_NAME = process.env.S3_BUCKET_NAME;
const IMAGE_PATH = `${S3_BUCKET_NAME}/images`;
const S3_REGION = process.env.AWS_REGION;

class AwsService {
  async generatePreSignedUrl(categoryId, imageName) {
    if (!categoryId) {
      throw new Error('categoryId is required to generate pre-signed URL');
    }

    const key = `${IMAGE_PATH}/${categoryId}/${imageName}`;
    
    const params = {
      Bucket: S3_BUCKET_NAME,
      Key: key,
      Expires: 3600,
      ContentType: 'image/jpeg'
    };

    const s3Client = new AWS.S3({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      signatureVersion: 'v4'
    });

    try {
      const presignedUrl = await s3Client.getSignedUrlPromise('putObject', params);
      return presignedUrl;
    } catch (error) {
      console.error('Error generating pre-signed URL:', error);
      throw new Error('Failed to generate pre-signed URL');
    }
  }

  getImagePath(categoryId) {
    return `${IMAGE_PATH}/${categoryId}`;
  }

  getPublicImageUrl(imagePath) {
    return `https://${S3_BUCKET_NAME}.s3.${S3_REGION}.amazonaws.com/${imagePath}`;
  }

}

module.exports = new AwsService();