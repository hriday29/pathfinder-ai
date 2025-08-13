import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import { getAuth } from '@clerk/nextjs/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

// Initialize APIs
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

// Initialize and cache MongoDB connection
let clientPromise;
if (!process.env.MONGODB_URI) {
  throw new Error('Please add your Mongo URI to .env.local');
}
const client = new MongoClient(process.env.MONGODB_URI, {});
clientPromise = client.connect();

// Helper function to validate the topic before generating a path
async function isValidTopic(topic, model) {
  console.log(`Validating topic: "${topic}"`);
  const prompt = `Is "${topic}" a real, valid topic for creating a learning path? The topic should not be nonsense or gibberish. Answer with a single word: YES or NO.`;
  
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().trim().toUpperCase();
    console.log(`Validation response: "${text}"`);
    return text === 'YES';
  } catch (error) {
    console.error('Error during topic validation:', error);
    return true; 
  }
}

// Helper function to search YouTube for either a video or a playlist
async function searchYouTube(query, type = 'video') {
  console.log(`Searching YouTube for type "${type}" with query: "${query}"`);
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&q=${encodeURIComponent(query)}&type=${type}&maxResults=1&key=${YOUTUBE_API_KEY}`;
  
  const response = await fetch(url);
  const data = await response.json();

  if (data.error) {
    console.error('YouTube API Error:', data.error.message);
    return null;
  }
  return data;
}

export async function POST(request) {
  let userId;

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
    const { topic } = await request.json();
    if (!topic) {
      return NextResponse.json({ error: 'Topic is required' }, { status: 400 });
    }

    const safetySettings = [
        { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
        { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    ];
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", safetySettings });

    const topicIsValid = await isValidTopic(topic, model);
    if (!topicIsValid) {
      return NextResponse.json({ error: 'Invalid or nonsense topic provided. Please try a real topic.' }, { status: 400 });
    }
  const prompt = `
    Act as an expert curriculum designer and a seasoned financial analyst who is creating a definitive learning path for a new trainee on the topic: "${topic}".

    Your response MUST be a valid JSON object and nothing else. The entire response must start with "{" and end with "}".
    Ensure there are no trailing commas.

    The JSON object must have a single key "modules". The value must be an array of 3 to 5 modules. **Generate 3 modules for smaller topics, and up to 5 for more complex, deep topics. Use your expert judgment to select the appropriate number between 3 and 5.** The path should be rigorous and detailed enough for someone looking to apply these skills professionally.

    Each "module" object must have:
    1. "module_title": A comprehensive and descriptive title for the module.
    2. "lessons": An array of 2 to 4 lesson objects.

    Each "lesson" object must have:
    1. "lesson_title": A specific and clear title for the lesson.
    2. "description": A detailed paragraph (4-5 sentences) explaining the core concepts of the lesson, its importance, and what the learner will be able to do after completing it. The description must be insightful and go beyond surface-level definitions.
    3. "content_type": A string, either "video" for a specific concept or "playlist" for a broader lesson requiring a full course.
    4. "youtube_query": A query for a high-quality, expert-level YouTube video or playlist. For playlists, the query MUST include "full course" or "masterclass".
    5. "quiz": An object with a "questions" key, which is an array of exactly 3 challenging quiz questions that test true understanding, not just memorization. Each quiz object must have a "question", "options" (array of 4), and "answer".
  `;
    
    console.log("Generating learning path...");
    const result = await model.generateContent(prompt);
    const response = await result.response;

    if (response.promptFeedback && response.promptFeedback.blockReason) {
      throw new Error(`AI response blocked due to: ${response.promptFeedback.blockReason}`);
    }

    let aiResponseText = response.text();
    const startIndex = aiResponseText.indexOf('{');
    // --- THIS IS THE FIX ---
    const endIndex = aiResponseText.lastIndexOf('}'); 
    if (startIndex === -1 || endIndex === -1) {
      console.error("AI did not return a valid JSON object in its response text:", aiResponseText);
      throw new Error("AI did not return a valid JSON object.");
    }
    const jsonString = aiResponseText.substring(startIndex, endIndex + 1);
    
    const cleanedJsonString = jsonString.replace(/,(?=\s*?[\}\]])/g, '');
    const parsedData = JSON.parse(cleanedJsonString);
    if (!parsedData.modules || parsedData.modules.length < 3) {
      console.error("AI failed to generate the required number of modules. It generated:", parsedData.modules?.length || 0);
      // For now, we can throw an error. A more advanced solution would be to
      // automatically retry the AI call, perhaps with a modified prompt.
      throw new Error("The AI failed to generate a valid learning path. Please try again.");
    }
    for (const module of parsedData.modules) {
      for (const lesson of module.lessons) {
        if (!lesson.youtube_query || !lesson.content_type) {
            console.warn('Skipping a lesson due to missing youtube_query or content_type.');
            continue;
        }
        let youtubeData = await searchYouTube(lesson.youtube_query, lesson.content_type);
        
        if (!youtubeData || !youtubeData.items || youtubeData.items.length === 0) {
          console.log(`Fallback search for: ${lesson.lesson_title}`);
          youtubeData = await searchYouTube(lesson.lesson_title, 'video'); 
        }

        lesson.content = {
            type: lesson.content_type,
            id: youtubeData?.items?.[0]?.id?.videoId || youtubeData?.items?.[0]?.id?.playlistId || null
        };
        
        lesson.completed = false;
        delete lesson.youtube_query;
      }
    }
    
    const mongoClient = await clientPromise;
    const db = mongoClient.db('pathfinder');
    const pathsCollection = db.collection('paths');
    const newPath = { userId, topic, createdAt: new Date(), modules: parsedData.modules };
    const dbResult = await pathsCollection.insertOne(newPath);

    return NextResponse.json({ success: true, pathId: dbResult.insertedId });

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
