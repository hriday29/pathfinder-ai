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

  // Secure the endpoint with Clerk authentication
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

    // To make this efficient, we run both database queries at the same time
    const [pathsStarted, lessonsCompletedResult] = await Promise.all([
      // Query 1: Count the total number of paths for the user
      pathsCollection.countDocuments({ userId }),
      
      // Query 2: Use an aggregation pipeline to count all completed lessons
      pathsCollection.aggregate([
        { $match: { userId } },
        { $unwind: "$modules" },
        { $unwind: "$modules.lessons" },
        { $match: { "modules.lessons.completed": true } },
        { $count: "count" }
      ]).toArray()
    ]);

    // The aggregation result is an array, so we extract the count from it
    const lessonsCompleted = lessonsCompletedResult.length > 0 ? lessonsCompletedResult[0].count : 0;

    // Return the calculated stats
    return NextResponse.json({
      pathsStarted,
      lessonsCompleted,
    });

  } catch (error) {
    console.error('API Error in getStats:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
