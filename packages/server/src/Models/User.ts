import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import { NextFunction } from 'express'

interface IUser extends mongoose.Document {
  firstName: string
  lastName: string
  fullName: string
  email: string
  password: string
  isFodaBagarai: boolean
  createdAt: Date
  updatedAt: Date
}

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true
  },
  lastName: {
    type: String,
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    validate: {
      validator: function (value: string) {
        // eslint-disable-next-line no-useless-escape
        return /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/.test(
          value
        )
      },
      message: 'Email inválido'
    }
  },
  password: {
    type: String,
    select: false
  },
  isFodaBagarai: {
    type: Boolean,
    default: false,
    select: false
  },
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
})

userSchema.pre<IUser>('save', async function (next: NextFunction) {
  const hash = await bcrypt.hashSync(this.password, 10)
  this.password = hash

  next()
})
export default mongoose.model<IUser>('User', userSchema)
