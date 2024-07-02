import { NextResponse } from "next/server";
const { VertexAI } = require("@google-cloud/vertexai");

let chatHistory: any = []; // Keep a simple in-memory chat history

export async function POST(req: any) {
  try {
    const body = await req.json();
    const { prompt } = body;
    const vertexAI = new VertexAI({
      project: process.env.NEXT_PUBLIC_PROJECT_ID,
      location: "us-central1",
    });

    // Add the new prompt to the history
    chatHistory.push({ role: "user", content: prompt });

    // Combine the chat history into a single prompt
    const fullPrompt = chatHistory
      .map((msg: any) => `${msg.role}: ${msg.content}`)
      .join("\n");

    const generativeModel = vertexAI.getGenerativeModel({
      model: "gemini-1.5-flash-001",
    });
    const result = await generativeModel.generateContent(fullPrompt);

    const response = await result.response;
    const botMessage = response.candidates[0].content.parts[0].text;

    // Add the bot response to the history
    chatHistory.push({ role: "model", content: botMessage });

    // Return only the latest response to the client
    return NextResponse.json({ response: botMessage });
  } catch (error) {
    console.log(error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
