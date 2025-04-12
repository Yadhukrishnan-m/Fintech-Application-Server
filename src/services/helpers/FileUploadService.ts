import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { Buffer } from "buffer";
import dotenv from "dotenv";
import { IUploadToS3 } from "../../interfaces/helpers/file-upload.interface";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { injectable } from "inversify";


// dotenv.config();

// // Define the file type for Multer's uploaded file
// interface UploadedFile {
//   originalname: string;
//   buffer: Buffer;
//   mimetype: string;
// }

// class S3Uploader implements IUploadToS3 {
//   private s3: S3Client;
//   private bucketName: string;

//   constructor() {
//     if (
//       !process.env.AWS_REGION ||
//       !process.env.AWS_ACCESS_KEY_ID ||
//       !process.env.AWS_SECRET_ACCESS_KEY ||
//       !process.env.AWS_S3_BUCKET_NAME
//     ) {
//       throw new Error("Missing AWS S3 environment variables");
//     }

//     this.s3 = new S3Client({
//       region: process.env.AWS_REGION as string,
//       credentials: {
//         accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
//         secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
//       },
//     });

//     this.bucketName = process.env.AWS_S3_BUCKET_NAME as string;
//   }

//   async upload(file: UploadedFile): Promise<string> {
//     if (!file) {
//       throw new Error("No file provided");
//     }

//     const uploadParams = {
//       Bucket: this.bucketName,
//       Key: `uploads/${Date.now()}_${file.originalname}`,
//       Body: file.buffer,
//       ContentType: file.mimetype,
//     };

//     try {
//       const command = new PutObjectCommand(uploadParams);
//       await this.s3.send(command);

//       const fileUrl = `https://${this.bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${uploadParams.Key}`;
//       return fileUrl;
//     } catch (error) {
//       console.error("S3 Upload Error:", error);
//       throw new Error("File upload failed");
//     }
//   }
// }

// export default S3Uploader;



// import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
// import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
// import dotenv from "dotenv";
// import { IUploadToS3 } from "../../interfaces/helpers/file-upload.interface";

dotenv.config();

interface UploadedFile {
  originalname: string;
  buffer: Buffer;
  mimetype: string;
}
@injectable()
class S3Uploader implements IUploadToS3 {
  private s3: S3Client;
  private bucketName: string;

  constructor() {
    if (
      !process.env.AWS_REGION ||
      !process.env.AWS_ACCESS_KEY_ID ||
      !process.env.AWS_SECRET_ACCESS_KEY ||
      !process.env.AWS_S3_BUCKET_NAME
    ) {
      throw new Error("Missing AWS S3 environment variables");
    }

    this.s3 = new S3Client({
      region: process.env.AWS_REGION as string,
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
      },
    });

    this.bucketName = process.env.AWS_S3_BUCKET_NAME as string;
  }

  async upload(file: UploadedFile): Promise<string> {
    if (!file) {
      throw new Error("No file provided");
    }

    const fileKey = `uploads/${Date.now()}_${file.originalname}`;

    const uploadParams = {
      Bucket: this.bucketName,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype,
    };

    try {
      const command = new PutObjectCommand(uploadParams);
      await this.s3.send(command);
      return fileKey;
    } catch (error) {
      console.error(" S3 Upload Error:", error);
      throw new Error("File upload failed");
    }
  }

  async getSignedUrl(
    fileKey: string,
    expiresIn: number = process.env.URL_EXPIRY as unknown as number
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: fileKey,
      });

      return await getSignedUrl(this.s3, command, { expiresIn });
    } catch (error) {
      console.error("❌ Error Generating Signed URL:", error);
      throw new Error("Failed to generate signed URL");
    }
  }

  async delete(fileKey: string): Promise<void> {
    if (!fileKey) {
      throw new Error("No file key provided");
    }

    const deleteParams = {
      Bucket: this.bucketName,
      Key: fileKey,
    };

    try {
      const command = new DeleteObjectCommand(deleteParams);
      await this.s3.send(command);
    } catch (error) {
      console.error(" S3 Delete Error:", error);
      throw new Error("File deletion failed");
    }
  }
} 

export default S3Uploader;
