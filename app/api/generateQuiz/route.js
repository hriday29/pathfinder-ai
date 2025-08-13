import { NextResponse } from 'next/server';
import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function POST(request) {
  try {
    const { lessonTitle, lessonDescription } = await request.json();
    if (!lessonTitle) {
      return NextResponse.json({ error: 'Lesson title is required' }, { status: 400 });
    }

    const prompt = `
      A user is learning about the lesson titled "${lessonTitle}". The lesson is described as: "${lessonDescription}".
      
      Create a high-quality, 3-question multiple-choice quiz to test their understanding of this specific lesson.

      You MUST respond in a valid JSON object and nothing else. 
      The JSON object must have a single key "quiz", containing a "questions" key. 
      The value of "questions" must be an array of exactly 3 quiz objects.
      Each quiz object must have a "question" (string), "options" (array of 4 strings), and "answer" (string).
    `;

    const safetySettings = [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    ];
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash", safetySettings });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    
    if (response.promptFeedback && response.promptFeedback.blockReason) {
        console.error('AI response blocked:', response.promptFeedback);
        return NextResponse.json({ 
          error: `The AI was unable to generate a quiz for this topic due to safety restrictions. Reason: ${response.promptFeedback.blockReason}` 
        }, { status: 400 });
    }

    let aiResponseText = response.text();

    const startIndex = aiResponseText.indexOf('{');
    const endIndex = aiResponseText.lastIndexOf('}');
    if (startIndex === -1 || endIndex === -1) {
      console.error("AI did not return a valid JSON object in its response text:", aiResponseText);
      throw new Error("AI did not return a valid JSON object.");
    }
    const jsonString = aiResponseText.substring(startIndex, endIndex + 1);
    const parsedQuiz = JSON.parse(jsonString);

    return NextResponse.json(parsedQuiz, { status: 200 });

  } catch (error) {
    console.error('Quiz Generation API Error:', error);

    // This block catches errors like the "503 Service Unavailable"
    // and sends a user-friendly message to the frontend.
    if (error.status) {
      return NextResponse.json({ error: `AI Error: ${error.statusText || 'Service Unavailable'}. Please try again.` }, { status: error.status });
    }
    
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
