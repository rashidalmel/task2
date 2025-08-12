import { Injectable } from '@angular/core';
import { Observable, from, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { environment } from '../../environments/environment';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private apiKey = environment.geminiApiKey;
  private genAI: GoogleGenerativeAI | null = null;
  private model: any = null;
  private chat: any = null;
  
  private chatHistory: ChatMessage[] = [];
  private isInitialized = false;

  constructor() {
    this.initializeGemini();
  }

  private initializeGemini(): void {
    console.log('Initializing Gemini...');
    console.log('API Key length:', this.apiKey ? this.apiKey.length : 'undefined');
    
    try {
      if (!this.apiKey || this.apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
        console.error('Gemini API key not configured');
        return;
      }

      console.log('Creating GoogleGenerativeAI instance...');
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      console.log('GoogleGenerativeAI instance created');
      
      // Try gemini-1.5-flash first (better free tier limits), then fallback to gemini-1.5-pro
      try {
        console.log('Trying gemini-1.5-flash model (better free tier limits)...');
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
        console.log('gemini-1.5-flash model loaded successfully');
      } catch (error) {
        console.warn('gemini-1.5-flash not available, trying gemini-1.5-pro');
        this.model = this.genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
        console.log('gemini-1.5-pro model loaded successfully');
      }
      
      console.log('Starting chat session...');
      this.chat = this.model.startChat({
        history: [
          {
            role: 'user',
            parts: [{
              text: `You are an AI assistant for a movie discovery and entertainment application built with Angular. 

PROJECT CONTEXT:
- This is a movie application that helps users discover, search, and learn about movies
- It integrates with TMDB (The Movie Database) API for movie data
- Built with Angular 20, TypeScript, and modern web technologies
- Features include: movie search, movie details, user authentication, and now AI chat assistance
- The app has components for: home page, movie cards, search functionality, movie details, user login/register, and personal info

YOUR ROLE:
- Help users with questions about movies, actors, directors, genres
- Assist with using the application features
- Provide movie recommendations based on preferences
- Help troubleshoot any app-related issues
- Be knowledgeable about the entertainment industry
- Keep responses concise but helpful

TECHNICAL KNOWLEDGE:
- You understand this is an Angular application
- You know about the TMDB API integration
- You can help with movie-related queries and app usage

Please introduce yourself and ask how you can help with the movie application.`
            }]
          },
          {
            role: 'model',
            parts: [{
              text: `Hello! I'm your AI assistant for the movie discovery application! 🎬

I'm here to help you explore movies, get recommendations, and make the most of this entertainment platform. I know all about the app's features and can help with:

🎭 Movie recommendations and discovery
🔍 Search tips and tricks  
📱 App navigation and features
🎬 Actor, director, and genre information
💡 Entertainment industry insights

What would you like to know about movies or how can I help you use the application?`
            }]
          }
        ],
        generationConfig: {
          maxOutputTokens: 1000,
          temperature: 0.7,
        },
      });
      console.log('Chat session started with project context');
      
      this.isInitialized = true;
      console.log('Gemini initialized successfully with model:', this.model.modelName);
    } catch (error) {
      console.error('Failed to initialize Gemini:', error);
      this.isInitialized = false;
    }
  }

  sendMessage(message: string): Observable<any> {
    console.log('sendMessage called with:', message);
    console.log('isInitialized:', this.isInitialized);
    console.log('chat object:', this.chat);
    
    if (!this.isInitialized || !this.chat) {
      console.error('Gemini not initialized or chat not available');
      return throwError(() => new Error('Gemini not initialized. Please check your API key.'));
    }

    const userMessage: ChatMessage = {
      role: 'user',
      content: message,
      timestamp: new Date()
    };
    
    this.chatHistory.push(userMessage);
    console.log('User message added to history');

    return from(this.chat.sendMessage(message).then((result: any) => {
      console.log('Raw API result:', result);
      
      if (!result || !result.response) {
        console.error('Invalid result structure:', result);
        throw new Error('Invalid response from Gemini API');
      }
      
      const response = result.response;
      const text = response.text();
      console.log('Extracted text:', text);
      
      if (!text) {
        console.error('Empty text in response');
        throw new Error('Empty response from Gemini API');
      }
      
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: text,
        timestamp: new Date()
      };
      
      this.chatHistory.push(assistantMessage);
      console.log('Assistant message added to history');
      
      return {
        candidates: [{
          content: {
            parts: [{
              text: text
            }]
          }
        }]
      };
    })).pipe(
      catchError((error) => {
        console.error('Gemini API Error in sendMessage:', error);
        
        let userMessage = 'Failed to get response from Gemini';
        
        // Check for specific quota errors
        if (error.message && error.message.includes('429')) {
          if (error.message.includes('quota')) {
            userMessage = '⚠️ Rate limit exceeded! You\'ve hit the free tier limits. Please wait a few minutes and try again, or consider upgrading your plan.';
          } else if (error.message.includes('retryDelay')) {
            const retryMatch = error.message.match(/retryDelay":"([^"]+)"/);
            if (retryMatch) {
              userMessage = `⏰ Rate limited! Please wait ${retryMatch[1]} before trying again.`;
            } else {
              userMessage = '⏰ Rate limited! Please wait a few minutes before trying again.';
            }
          }
        } else if (error.message && error.message.includes('model')) {
          userMessage = '🚫 Model not available. Trying to switch to alternative model...';
          // Try to reinitialize with a different model
          setTimeout(() => this.initializeGemini(), 1000);
        }
        
        // Add error message to chat history
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: userMessage,
          timestamp: new Date()
        };
        this.chatHistory.push(errorMessage);
        return throwError(() => error);
      })
    );
  }

  getChatHistory(): ChatMessage[] {
    return [...this.chatHistory];
  }

  clearChatHistory(): void {
    this.chatHistory = [];
    // Reset the chat session but maintain project context
    if (this.model) {
      try {
        this.chat = this.model.startChat({
          history: [
            {
              role: 'user',
              parts: [{
                text: `You are an AI assistant for a movie discovery and entertainment application built with Angular. 

PROJECT CONTEXT:
- This is a movie application that helps users discover, search, and learn about movies
- It integrates with TMDB (The Movie Database) API for movie data
- Built with Angular 20, TypeScript, and modern web technologies
- Features include: movie search, movie details, user authentication, and now AI chat assistance
- The app has components for: home page, movie cards, search functionality, movie details, user login/register, and personal info

YOUR ROLE:
- Help users with questions about movies, actors, directors, genres
- Assist with using the application features
- Provide movie recommendations based on preferences
- Help troubleshoot any app-related issues
- Be knowledgeable about the entertainment industry
- Keep responses concise but helpful

TECHNICAL KNOWLEDGE:
- You understand this is an Angular application
- You know about the TMDB API integration
- You can help with movie-related queries and app usage

Please introduce yourself and ask how you can help with the movie application.`
              }]
            },
            {
              role: 'model',
              parts: [{
                text: `Hello! I'm your AI assistant for the movie discovery application! 🎬

I'm here to help you explore movies, get recommendations, and make the most of this entertainment platform. I know all about the app's features and can help with:

🎭 Movie recommendations and discovery
🔍 Search tips and tricks  
📱 App navigation and features
🎬 Actor, director, and genre information
💡 Entertainment industry insights

What would you like to know about movies or how can I help you use the application?`
              }]
            }
          ],
          generationConfig: {
            maxOutputTokens: 1000,
            temperature: 0.7,
          },
        });
        console.log('Chat session reset with project context maintained');
      } catch (error) {
        console.error('Failed to reset chat session:', error);
      }
    }
  }

  isGeminiReady(): boolean {
    return this.isInitialized && this.chat !== null;
  }

  // Test method to verify API connection
  testConnection(): Observable<any> {
    console.log('Testing connection...');
    if (!this.isInitialized || !this.model) {
      console.error('Model not initialized for test');
      return throwError(() => new Error('Gemini not initialized'));
    }

    // Try direct generation instead of chat
    return from(this.model.generateContent('Hello').then((result: any) => {
      console.log('Test generation result:', result);
      
      if (!result || !result.response) {
        throw new Error('Invalid response from Gemini API');
      }
      
      const response = result.response;
      const text = response.text();
      console.log('Test response text:', text);
      
      if (!text) {
        throw new Error('Empty response from Gemini API');
      }
      
      return { success: true, response: text };
    })).pipe(
      catchError((error) => {
        console.error('Gemini API Test Error:', error);
        return throwError(() => error);
      })
    );
  }

  // Get current model info
  getCurrentModelInfo(): string {
    if (!this.model) {
      return 'No model loaded';
    }
    return `Model: ${this.model.modelName || 'Unknown'}`;
  }

  // Get detailed status for debugging
  getStatus(): any {
    return {
      isInitialized: this.isInitialized,
      hasApiKey: !!this.apiKey,
      apiKeyLength: this.apiKey ? this.apiKey.length : 0,
      hasGenAI: !!this.genAI,
      hasModel: !!this.model,
      hasChat: !!this.chat,
      modelName: this.model ? this.model.modelName : 'None',
      chatHistoryLength: this.chatHistory.length
    };
  }
}
