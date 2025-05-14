import { Injectable } from '@nestjs/common';
import { MinioService } from 'nestjs-minio-client';
import * as crypto from 'crypto';
import { ConfigService } from '@nestjs/config';
import { handleError } from 'src/utils/errorHandling';

@Injectable()
export class MinioClientService {
  private readonly baseBucket: string;

  constructor(
    private readonly minio: MinioService,
    private readonly configService: ConfigService,
  ) {
    this.baseBucket = this.configService.getOrThrow<string>('MINIO_BUCKET');
  }

  public get client() {
    return this.minio.client;
  }

  public async upload(
    buffer: Buffer,
    originalName: string,
    mimeType: string,
    baseBucket: string = this.baseBucket,
  ) {
    const ext = originalName.substring(originalName.lastIndexOf('.'));
    const hashedFileName = crypto
      .createHash('md5')
      .update(Date.now().toString())
      .digest('hex');
    const filename = hashedFileName + ext;

    const metaData = {
      'Content-Type': mimeType,
    };

    try {
      await this.client.putObject(baseBucket, filename, buffer, metaData);

      return {
        url: `${this.configService.get('MINIO_ENDPOINT')}:${this.configService.get('MINIO_PORT')}/${baseBucket}/${filename}`,
      };
    } catch (error) {
      handleError(error);
    }
  }

  async delete(objectName: string, baseBucket: string = this.baseBucket) {
    try {
      await this.client.removeObject(baseBucket, objectName);
    } catch (err) {
      handleError(err);
    }
  }
}
