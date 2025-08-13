import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { getAuth } from '@clerk/nextjs/server';

// Reuse the MongoDB connection logic
let clientPromise;
if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}
const client = new MongoClient(process.env.MONGODB_URI, {});
clientPromise = client.connect();

export async function POST(request) {
  let userId;

  // Secure the endpoint with Clerk authentication
  if (process.env.NODE_ENV === 'development') {
    userId = 'user_placeholder_dev'; // For local testing
  } else {
    const { userId: clerkUserId } = getAuth(request);
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    userId = clerkUserId;
  }

  try {
    const { pathId, lesson_title, score } = await request.json();

    if (!pathId || !lesson_title) {
      return NextResponse.json({ error: 'pathId and lesson_title are required' }, { status: 400 });
    }

    const mongoClient = await clientPromise;
    const db = mongoClient.db('pathfinder');
    const pathsCollection = db.collection('paths');

    // Perform the database update operation
    const result = await pathsCollection.updateOne(
      { 
        _id: new ObjectId(pathId), 
        userId: userId // Ensure users can only update their own paths
      },
      { 
        $set: { 
            "modules.$[].lessons.$[lesson].completed": true,
            "modules.$[].lessons.$[lesson].score": score 
        }
      },
      { 
        arrayFilters: [{ "lesson.lesson_title": lesson_title }] 
      }
    );

    if (result.matchedCount === 0) {
        return NextResponse.json({ error: 'Path not found or you do not have permission to edit it.' }, { status: 404 });
    }

    if (result.modifiedCount === 0) {
        // This could mean the lesson was already marked as complete, which is not an error.
        return NextResponse.json({ success: true, message: 'Lesson was already complete or not found within the path.' });
    }

    return NextResponse.json({ success: true, message: 'Lesson marked as complete.' });

  } catch (error) {
    console.error('API Error in markComplete:', error);
    // Handle potential errors with invalid ObjectId
    if (error.name === 'BSONError') {
        return NextResponse.json({ error: 'Invalid pathId format.' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
