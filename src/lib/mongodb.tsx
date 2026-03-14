import mongoose  from "mongoose";

const dbconnect  = async() =>{
const MONGO_URI = process.env.MONGODB_URI!;

try{
  await mongoose.connect(MONGO_URI);
  console.log("connection established");
}catch(e){
  console.log(e);
}

};

export default dbconnect;
