import DataStructureModel, { DataStructureType } from '@/models/data_structure_model';
import mongoose from 'mongoose';
import { cache } from 'react';
import { _ToSpace } from './utils';
import { LessonMeta } from '@/models/lesson_content_model';

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

export default async function connectDB() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    cached.promise = mongoose.connect(MONGODB_URI!, {
      serverSelectionTimeoutMS: 5000,
    }).then((mongooseInstance) => {
      console.log('=> New MongoDB Connection Established');
      return mongooseInstance;
    }).catch((err) => {
      cached.promise = null;
      throw err;
    });
  }

  try {
    cached.conn = await cached.promise;
  } catch (err) {
    cached.promise = null;
    throw err;
  }

  return cached.conn;
}

export const getDataStructure = cache(async (slug: string): Promise<DataStructureType | null> => {
  try {
    // Reuse global singleton connection (no HTTP overhead)
    await connectDB();

    // Directly query MongoDB
    const data = await DataStructureModel.findOne({ slug }).lean();
    return data ? JSON.parse(JSON.stringify(data)) : null
  } catch (error) {
    console.error('Failed to fetch data structure:', error);
    return null;
  }
});

export const getLesson = cache(async (data_structure: string, track: string, lesson: string): Promise<LessonMeta | null> => {
  try {
    await connectDB()

    const lessonMeta = await DataStructureModel.aggregate([
      // 1. Find the main document
      { $match: { slug: data_structure } },

      // 2. Flatten the tracks array
      { $unwind: "$learning_tracks" },
      { $match: { "learning_tracks.title": _ToSpace(track) } },

      // 3. Flatten the lessons array
      { $unwind: "$learning_tracks.lessons" },
      { $match: { "learning_tracks.lessons.title": _ToSpace(lesson) } },

      // 4. Shape the final output to just give you the lesson details
      {
        $project: {
          _id: 0,
          difficulty: "$learning_tracks.difficulty",
          category: "$learning_tracks.category",
          lesson: {
            duration: "$learning_tracks.lessons.duration",
            contentRef: "$learning_tracks.lessons.contentRef",
            quiz_questions: "$learning_tracks.lessons.quiz_questions"
          }
        }
      }
    ]);
    return lessonMeta[0]
  } catch (error) {
    console.error('Failed to fetch lesson:', error);
    return null;
  }
})