import { DataStructureType } from '@/models/data_structure_model';
import mongoose from 'mongoose';
import dns from "node:dns/promises";
console.log(await dns.getServers());
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Check if a global connection cache exists, or create an empty object
let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export default async function connectDB() {
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

export async function getDataStructure(slug: string): Promise<DataStructureType | null> {
  try {
    // Use absolute URL for server-side fetch in Next.js
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
    const res = await fetch(`${baseUrl}/api/data-structure/${slug}`, {
      cache: "no-store", // always fetch fresh from DB
    });
    if (!res.ok) return null;
    const json = await res.json();
    return json.data;
  } catch {
    return null;
  }
}
