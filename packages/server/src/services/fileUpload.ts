/* eslint-disable prettier/prettier */
import { config } from 'dotenv'
import { randomBytes } from 'crypto'
import { Storage } from '@google-cloud/storage'
import { NextFunction } from 'express'

config()

class FileUploader {
  publicUrl: string
  constructor (publicUrl = '') {
    this.publicUrl = publicUrl
  }

  async uploadFile (
    this: ObjectConstructor,
    imageName: string,
    imageContent: string,
    mimetype: string,
    next: NextFunction
  ): Promise<void> {
    const [name, extension] = imageName.split('.')

    const fileName = `${randomBytes(16).toString('hex')}-${name}.${extension}`

    const storage = new Storage()

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
    this.publicUrl = publicUrl
  }

  getUrl (this: ObjectConstructor): string {
    return this.publicUrl
  }
}

export default FileUploader
