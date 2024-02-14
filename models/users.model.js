import mongoose from 'mongoose'
let { Schema , model} = mongoose
let UserSchema = new Schema(
  {
    username: {
      type: String,
      unique: true,
      required: true,
    },
    email: {
      type: String,
      unique: true,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default:
        "https://images.squarespace-cdn.com/content/v1/5de1f65b98e1587c6356b434/1629182426829-GOXQJ0JPTE4R41CFNFMR/73-730477_first-name-profile-image-placeholder-png.png",
    },
  },
  { timestamps: true }
);
export default model('User', UserSchema)