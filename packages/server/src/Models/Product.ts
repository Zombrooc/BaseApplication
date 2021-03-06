import mongoose from 'mongoose'

interface IProduct extends mongoose.Document {
  productName: string
  description: string
  discount: number
  price: number
  image: string
  quantityInStock: number
  featured: boolean
  createdAt: number
  updatedAt: number
}

const ProductSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  discount: {
    type: Number,
    default: 0
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  image: {
    type: String,
    required: true
  },
  quantityInStock: {
    type: Number,
    default: 0,
    min: 0
  },
  featured: {
    type: Boolean,
    default: false
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

export default mongoose.model<IProduct>('Product', ProductSchema)
