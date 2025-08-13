import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { getAuth } from '@clerk/nextjs/server';

// Initialize and cache MongoDB connection
let clientPromise;
if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}
const client = new MongoClient(process.env.MONGODB_URI, {});
clientPromise = client.connect();

export async function GET(request) {
  let userId;

  // Secure the endpoint
  if (process.env.NODE_ENV === 'development') {
    userId = 'user_placeholder_dev';
  } else {
    const { userId: clerkUserId } = getAuth(request);
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    userId = clerkUserId;
  }

  try {
    const mongoClient = await clientPromise;
    const db = mongoClient.db('pathfinder');
    const pathsCollection = db.collection('paths');

    // Find the single most recently created path for the user
    const latestPath = await pathsCollection.findOne(
      { userId },
      { sort: { createdAt: -1 } }
    );

    // If the user has no paths created yet, return null
    if (!latestPath) {
      return NextResponse.json({ nextLesson: null });
    }

    // Iterate through the modules and lessons to find the first uncompleted one
    let nextLesson = null;
    for (const module of latestPath.modules) {
      for (const lesson of module.lessons) {
        if (!lesson.completed) {
          nextLesson = lesson; // We found our target
          break; // Exit the inner loop
        }
      }
      if (nextLesson) {
        break; // Exit the outer loop
      }
    }

    // If all lessons in the latest path are complete, nextLesson will be null
    if (!nextLesson) {
      return NextResponse.json({ 
        nextLesson: null, 
        message: 'Latest path complete! Great job!' 
      });
    }

    // Return the data needed for the "Continue Learning" card
    return NextResponse.json({
      pathId: latestPath._id,
      pathTopic: latestPath.topic,
      lesson: nextLesson
    });

  } catch (error) {
    console.error('API Error in getNextLesson:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
