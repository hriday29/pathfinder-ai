import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { getAuth } from '@clerk/nextjs/server';

let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}
const client = new MongoClient(process.env.MONGODB_URI, {});
clientPromise = client.connect();

export async function GET(request) {
  let userId;

  // Use the same Dev Mode logic as our other API
  if (process.env.NODE_ENV === 'development') {
    userId = 'user_placeholder_dev';
  } else {
    const { userId: clerkUserId } = getAuth(request);
    if (!clerkUserId) {
      // Return an empty array if the user is not logged in, instead of an error
      return NextResponse.json({ paths: [] }, { status: 200 });
    }
    userId = clerkUserId;
  }

  try {
    const mongoClient = await clientPromise;
    const db = mongoClient.db('pathfinder');
    const pathsCollection = db.collection('paths');

    const recentPaths = await pathsCollection
      .find({ userId: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .toArray();

    return NextResponse.json({ paths: recentPaths }, { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
