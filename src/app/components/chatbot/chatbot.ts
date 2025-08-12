import { Component, OnInit, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { GeminiService, ChatMessage } from '../../services/gemini.service';

@Component({
  selector: 'app-chatbot',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './chatbot.html',
  styleUrls: ['./chatbot.scss']
})
export class ChatbotComponent implements OnInit, AfterViewChecked {
  @ViewChild('chatContainer') private chatContainer!: ElementRef;
  
  messages: ChatMessage[] = [];
  newMessage: string = '';
  isLoading: boolean = false;
  isOpen: boolean = false;
  isGeminiReady: boolean = false;

  constructor(private geminiService: GeminiService) {}

  ngOnInit(): void {
    this.loadChatHistory();
    this.checkGeminiStatus();
  }

  ngAfterViewChecked(): void {
    this.scrollToBottom();
  }

  loadChatHistory(): void {
    this.messages = this.geminiService.getChatHistory();
  }

  checkGeminiStatus(): void {
    this.isGeminiReady = this.geminiService.isGeminiReady();
  }

  testConnection(): void {
    this.isLoading = true;
    this.geminiService.testConnection().subscribe({
      next: (result) => {
        const successMessage: ChatMessage = {
          role: 'assistant',
          content: `✅ Connection successful! Gemini AI is working. Response: ${result.response}`,
          timestamp: new Date()
        };
        this.messages.push(successMessage);
        this.isLoading = false;
        this.checkGeminiStatus();
      },
      error: (error) => {
        const errorMessage: ChatMessage = {
          role: 'assistant',
          content: `❌ Connection failed: ${error.message}`,
          timestamp: new Date()
        };
        this.messages.push(errorMessage);
        this.isLoading = false;
        this.checkGeminiStatus();
      }
    });
  }

  showStatus(): void {
    const status = this.geminiService.getStatus();
    const statusMessage: ChatMessage = {
      role: 'assistant',
      content: `📊 Gemini Status:\n` +
               `• Initialized: ${status.isInitialized}\n` +
               `• Has API Key: ${status.hasApiKey}\n` +
               `• API Key Length: ${status.apiKeyLength}\n` +
               `• Has GenAI: ${status.hasGenAI}\n` +
               `• Has Model: ${status.hasModel}\n` +
               `• Has Chat: ${status.hasChat}\n` +
               `• Model Name: ${status.modelName}\n` +
               `• Chat History: ${status.chatHistoryLength} messages`,
      timestamp: new Date()
    };
    this.messages.push(statusMessage);
  }

  sendMessage(): void {
    if (!this.newMessage.trim() || this.isLoading) return;

    const userMessage = this.newMessage;
    this.newMessage = '';
    this.isLoading = true;

    // Add user message to chat immediately
    const userChatMessage: ChatMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    this.messages.push(userChatMessage);

    this.geminiService.sendMessage(userMessage).subscribe({
      next: (response) => {
        const assistantMessage: ChatMessage = {
          role: 'assistant',
          content: response.candidates[0]?.content?.parts[0]?.text || 'Sorry, I couldn\'t process your request.',
          timestamp: new Date()
        };
        
        this.messages.push(assistantMessage);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error sending message:', error);
        
        // Check if it's an initialization error
        if (error.message && error.message.includes('not initialized')) {
          const errorMessage: ChatMessage = {
            role: 'assistant',
            content: '⚠️ Gemini AI is not properly configured. Please check your API key in the environment file.',
            timestamp: new Date()
          };
          this.messages.push(errorMessage);
        } else {
          const errorMessage: ChatMessage = {
            role: 'assistant',
            content: `❌ Error: ${error.message || 'Failed to get response from Gemini AI. Please try again.'}`,
            timestamp: new Date()
          };
          this.messages.push(errorMessage);
        }
        
        this.isLoading = false;
      }
    });
  }

  toggleChat(): void {
    this.isOpen = !this.isOpen;
  }

  clearChat(): void {
    this.geminiService.clearChatHistory();
    this.messages = [];
  }

  private scrollToBottom(): void {
    try {
      this.chatContainer.nativeElement.scrollTop = this.chatContainer.nativeElement.scrollHeight;
    } catch (err) {}
  }
}
