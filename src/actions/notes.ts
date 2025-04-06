"use server";

import { getUser } from "@/auth/server";
import { prisma } from "@/db/prisma";
import { handleError } from "@/lib/utils";
import openai from "@/openai";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
// Import the Google Generative AI library
import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

export const createNoteAction = async (noteId: string) => {
  try {
    const user = await getUser();
    if (!user) throw new Error("You must be logged in to create a note");

    await prisma.note.create({
      data: {
        id: noteId,
        authorId: user.id,
        text: "",
      },
    });

    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

export const updateNoteAction = async (noteId: string, text: string) => {
  try {
    const user = await getUser();
    if (!user) throw new Error("You must be logged in to update a note");

    await prisma.note.update({
      where: { id: noteId },
      data: { text },
    });

    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

export const deleteNoteAction = async (noteId: string) => {
  try {
    const user = await getUser();
    if (!user) throw new Error("You must be logged in to delete a note");

    await prisma.note.delete({
      where: { id: noteId, authorId: user.id },
    });

    return { errorMessage: null };
  } catch (error) {
    return handleError(error);
  }
};

export const askAIAboutNotesAction = async (
  newQuestions: string[],
  responses: string[],
) => {
  try {
    const user = await getUser();
    if (!user) throw new Error("You must be logged in to ask AI questions");

    console.log("User authenticated, fetching notes...");

    const notes = await prisma.note.findMany({
      where: { authorId: user.id },
      orderBy: { createdAt: "desc" },
      select: { text: true, createdAt: true, updatedAt: true, id: true },
    });

    if (notes.length === 0) {
      return "<p>You don't have any notes yet.</p>";
    }

    console.log(`Found ${notes.length} notes for the user`);

    // Create a structured formatting of notes with numbering
    const formattedNotes = notes
      .map((note: { id: string; text: string; createdAt: Date; updatedAt: Date }, index) => {
        const noteNumber = index + 1;
        return `
        =============== NOTE ${noteNumber} (ID: ${note.id}) ===============

        ${note.text}

        Created: ${note.createdAt}
        Last updated: ${note.updatedAt}
        =============== END OF NOTE ${noteNumber} ===============
        `.trim();
      })
      .join("\n\n");

    console.log("Preparing to call Gemini API...");

    if (!process.env.GEMINI_API_KEY) {
      console.error("GEMINI_API_KEY is not set in environment variables");
      return "<p>Configuration error: API key not set. Please contact support.</p>";
    }

    // Create the model with configuration
    const model = genAI.getGenerativeModel({
      model: "gemini-2.0-flash",
      generationConfig: {
        temperature: 0.7,
        topP: 0.95,
        topK: 40,
        maxOutputTokens: 2048,
      },
    });

    // Get the latest question
    const latestQuestion = newQuestions[newQuestions.length - 1];

    // Format the conversation history for context
    let historyPrompt = "";
    if (newQuestions.length > 1 && responses.length > 0) {
      historyPrompt = "Here is our conversation history for context:\n\n";

      for (let i = 0; i < Math.min(newQuestions.length - 1, responses.length); i++) {
        historyPrompt += `USER: ${newQuestions[i]}\n`;
        historyPrompt += `ASSISTANT: ${responses[i]}\n\n`;
      }
    }

    console.log(`Processing question: "${latestQuestion}" with conversation history`);

    // Improved prompt that maintains context and provides better note handling
    const prompt = `
      You are an AI assistant helping a student with their notes. Your primary task is to provide responses to the questions about the notes provided. You can response to those contents also that is not present in the notes, but should be related to the topic.

      ${historyPrompt}

      Here are the user's notes:
      ${formattedNotes}

      Current question from user: "${latestQuestion}"

      Important instructions:
      1. Answer Should be relevent to the notes.
      2. Identify which note(s) contain information relevant to the question.
      3. If the user asks for study materials (MCQs, quizzes), generate them strictly based on the notes user is asking about.
      4. Do **NOT** use markdown, code blocks, or wrap responses in triple backticks (e.g., \`\`\`html).
      5. Format the response in clean HTML with proper tags like <li>, <ul>, <p>, <br>, <div>, etc but without explicit \`\`\`html declarations.
    `;

    try {
      const result = await model.generateContent(prompt);
      let response = result.response.text();

      console.log("Gemini API responded successfully");

      // Remove unwanted markdown or triple backticks
      response = response.replace(/'''html/g, "").replace(/'''/g, "").trim();

      return response || "<p>The AI couldn't generate a response. Please try again.</p>";
    } catch (generationError: any) {
      console.error("Specific Gemini generation error:", generationError);
      return `<p>Error with AI service: ${generationError.message || "Unknown error"}</p>`;
    }
  } catch (error: any) {
    console.error("Error in askAIAboutNotesAction:", error);
    return `<p>An error occurred: ${error.message || "Unknown error"}</p>`;
  }
};