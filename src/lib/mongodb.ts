import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Check if a global connection cache exists, or create an empty object
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function connectDB() {
  // If a connection already exists, reuse it immediately
  if (cached.conn) {
    return cached.conn;
  }

  // If a connection is currently in progress, wait for it
  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI!, {
      bufferCommands: false, // Turn off buffering to catch hotspot errors instantly
    }).then((mongooseInstance) => {
      console.log('=> New MongoDB Connection Established');
      return mongooseInstance;
    });
  }
  
  cached.conn = await cached.promise;
  return cached.conn;
}

export default connectDB;
