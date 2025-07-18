import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';

// This re-uses the MongoDB connection logic from our other API route
let clientPromise;
if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}
const client = new MongoClient(process.env.MONGODB_URI, {});
clientPromise = client.connect();

// This function handles GET requests to /api/path/[id]
export async function GET(request, { params }) {
  try {
    const { id } = params; // The [id] from the URL
    if (!id) {
      return NextResponse.json({ error: 'Path ID is required' }, { status: 400 });
    }

    const mongoClient = await clientPromise;
    const db = mongoClient.db('pathfinder');
    const pathsCollection = db.collection('paths');

    // Find the single document that matches the provided ID
    const path = await pathsCollection.findOne({ _id: new ObjectId(id) });

    if (!path) {
      return NextResponse.json({ error: 'Path not found' }, { status: 404 });
    }

    // Return the found path data
    return NextResponse.json({ path }, { status: 200 });

  } catch (error) {
    console.error('API Error:', error);
    // This can happen if the ID is not a valid ObjectId format
    if (error.name === 'BSONError') {
       return NextResponse.json({ error: 'Invalid Path ID format' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
