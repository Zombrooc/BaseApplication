/* eslint-disable prettier/prettier */
import { config } from 'dotenv'
import { randomBytes } from 'crypto'
import { Storage } from '@google-cloud/storage'
import { NextFunction } from 'express'

config()

export class FileUtils {
  slugfy (this: ObjectConstructor, str: string): string {
    return str.toString()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^\w-]+/g, '')
      .replace(/--+/g, '-')
  }

  uploadFile (
    imageName: string,
    imageContent: string,
    mimetype: string,
    next: NextFunction
  ): string {
    const [name, extension] = imageName.split('.')

    const fileName = `${randomBytes(16).toString('hex')}-${this.slugfy(name)}.${extension}`
    const storage = new Storage({
      keyFile: './TheSimple-81bdb70cc69e.json',
      keyFilename: './TheSimple-81bdb70cc69e.json'
    })

    const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET)
    const blob = bucket.file(fileName)
    const blobStream = blob.createWriteStream({
      metadata: {
        contentType: mimetype
      }
    })

    blobStream
      .on('error', err => {
        next(err)
      })
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      .on('finish', () => {})
      .end(imageContent)
    const publicUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`
    return publicUrl
  }

  async deleteFile (this: ObjectConstructor, fileName: string): Promise<void> {
    const storage = new Storage({
      keyFile: './TheSimple-81bdb70cc69e.json',
      keyFilename: './TheSimple-81bdb70cc69e.json'
    })

    const bucket = storage.bucket(process.env.GCLOUD_STORAGE_BUCKET)
    await bucket.file(fileName).delete()
  }
}
