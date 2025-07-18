// // import { NextResponse } from 'next/server';
// // import { MongoClient } from 'mongodb';
// // import { HfInference } from "@huggingface/inference";

// // // Initialize APIs
// // const hf = new HfInference(process.env.HUGGINGFACE_TOKEN);
// // let clientPromise;

// // // Initialize and cache MongoDB connection
// // if (!process.env.MONGODB_URI) {
// //   throw new Error('Please add your Mongo URI to .env.local');
// // }
// // const client = new MongoClient(process.env.MONGODB_URI, {});
// // clientPromise = client.connect();

// // export async function POST(request) {
// //   try {
// //     const { topic } = await request.json();
// //     if (!topic) {
// //       return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
// //     }

// //     const prompt = `
// //       You are an expert curriculum designer for a platform called Pathfinder AI.
// //       A user wants to learn about "${topic}".
// //       Create a detailed, 3-step learning path.

// //       You MUST respond in a valid JSON format. The JSON object must have a single key "path" which is an array of objects.
// //       Each object in the array represents a step and must have the following keys:
// //       1. "title": A string for the step's title.
// //       2. "description": A string (2-3 sentences) explaining what the user will learn.
// //       3. "key_takeaways": An array of 3 short strings detailing key concepts.
// //       4. "Youtube_query": A string for an optimized Youtube query for this step.
// //       5. "quiz": An object containing a single multiple-choice quiz question to test understanding of the step. The quiz object must have three keys:
// //          - "question": A string for the quiz question.
// //          - "options": An array of 4 strings representing the possible answers.
// //          - "answer": A string containing the exact correct answer from the "options" array.
      
// //       Do not include any text or formatting outside of the main JSON object.
// //     `;

// //     const response = await hf.chatCompletion({
// //         model: 'mistralai/Mistral-7B-Instruct-v0.2',
// //         messages: [{ role: 'user', content: prompt }],
// //         max_tokens: 1024, // Increase tokens for the larger response
// //     });
// //     const aiResponseJsonString = response.choices[0].message.content;
// //     const parsedPath = JSON.parse(aiResponseJsonString);

// //     const mongoClient = await clientPromise;
// //     const db = mongoClient.db('pathfinder');
// //     const pathsCollection = db.collection('paths');
    
// //     const newPath = {
// //       userId: 'anonymous_user',
// //       topic: topic,
// //       createdAt: new Date(),
// //       path: parsedPath,
// //     };
// //     const result = await pathsCollection.insertOne(newPath);

// //     return NextResponse.json({ success: true, pathId: result.insertedId }, { status: 200 });

// //   } catch (error) {
// //     console.error('API Error:', error);
// //     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
// //   }
// // }

// import { NextResponse } from 'next/server';
// import { MongoClient } from 'mongodb';
// import { HfInference } from "@huggingface/inference";

// // Initialize APIs
// const hf = new HfInference(process.env.HUGGINGFACE_TOKEN);
// const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// // Initialize and cache MongoDB connection
// let clientPromise;
// if (!process.env.MONGODB_URI) {
//   throw new Error('Please add your Mongo URI to .env.local');
// }
// const client = new MongoClient(process.env.MONGODB_URI, {});
// clientPromise = client.connect();


// export async function POST(request) {
//   try {
//     const { topic } = await request.json();
//     if (!topic) {
//       return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
//     }

//     // --- Step 1: Generate the detailed path with the NEW, smarter prompt ---
//     const prompt = `
//       You are an expert curriculum designer. A user wants to learn about "${topic}".
//       Create a concise, 3-step learning path.
//       You MUST respond in a valid JSON format. The JSON object should have a single key "path" which is an array of objects.
//       Each object in the array represents a step and must have the following keys:
//       1. "title": A string for the step's title.
//       2. "description": A string (2-3 sentences) explaining what the user will learn in this step.
//       3. "youtube_search_query": A string for an optimized YouTube search query. THIS QUERY MUST BE UNIQUE AND HIGHLY SPECIFIC to the step's title and description to find the best possible video. For example, for a step about "GANs", the query should be something like "Generative Adversarial Networks explained for beginners" not just "GenAI".

//       Do not include any text or formatting outside of the main JSON object.
//     `;
//     const aiResponse = await hf.chatCompletion({
//         model: 'mistralai/Mistral-7B-Instruct-v0.2',
//         messages: [{ role: 'user', content: prompt }],
//         max_tokens: 500,
//     });
//     const aiResponseJsonString = aiResponse.choices[0].message.content;
//     const parsedData = JSON.parse(aiResponseJsonString);

//     // --- Step 2: Find a YouTube video for each step ---
//     const pathWithVideos = await Promise.all(
//       parsedData.path.map(async (step) => {
//         const searchQuery = step.youtube_search_query;
//         const youtubeUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(searchQuery)}&type=video&maxResults=1&key=${YOUTUBE_API_KEY}`;
        
//         const youtubeResponse = await fetch(youtubeUrl);
//         const youtubeData = await youtubeResponse.json();
        
//         const videoId = youtubeData.items && youtubeData.items.length > 0 ? youtubeData.items[0].id.videoId : null;
        
//         return { ...step, videoId };
//       })
//     );
    
//     // --- Step 3: Save the complete path with video IDs to the database ---
//     const mongoClient = await clientPromise;
//     const db = mongoClient.db('pathfinder');
//     const pathsCollection = db.collection('paths');
    
//     const newPath = {
//       userId: 'anonymous_user',
//       topic: topic,
//       createdAt: new Date(),
//       path: pathWithVideos,
//     };
//     const result = await pathsCollection.insertOne(newPath);

//     // --- Step 4: Return the final ID to the frontend ---
//     return NextResponse.json({ success: true, pathId: result.insertedId });

//   } catch (error) {
//     console.error('API Error:', error);
//     return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
//   }
// }


import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { getAuth } from '@clerk/nextjs/server'; // Re-import getAuth
import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HUGGINGFACE_TOKEN);
let clientPromise;

if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}
const client = new MongoClient(process.env.MONGODB_URI, {});
clientPromise = client.connect();

export async function POST(request) {
  // Re-enabling the security check
  const { userId } = getAuth(request);
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { topic } = await request.json();
    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const prompt = `
      You are an expert curriculum designer...
      // The rest of your detailed prompt
    `;

    const response = await hf.chatCompletion({
        model: 'mistralai/Mistral-7B-Instruct-v0.2',
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 1024,
    });
    const aiResponseJsonString = response.choices[0].message.content;
    const parsedPath = JSON.parse(aiResponseJsonString);

    const mongoClient = await clientPromise;
    const db = mongoClient.db('pathfinder');
    const pathsCollection = db.collection('paths');
    
    const newPath = {
      userId: userId, // Using the REAL userId from the session
      topic: topic,
      createdAt: new Date(),
      path: parsedPath,
    };
    const result = await pathsCollection.insertOne(newPath);

    return NextResponse.json({ success: true, pathId: result.insertedId });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}