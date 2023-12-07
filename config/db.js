 import mongoose from "mongoose";
 const Db = async() => {
const MONGODB=process.env.MONGODB
  try {
    const con=await mongoose.connect(MONGODB)
    console.log('connected to db')
  } catch (error) {
    console.log('error')
  }
 }
 
 export default Db