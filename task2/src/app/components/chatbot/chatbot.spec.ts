import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { FormsModule } from '@angular/forms';
import { ChatbotComponent } from './chatbot';
import { GeminiService } from '../../services/gemini.service';

describe('ChatbotComponent', () => {
  let component: ChatbotComponent;
  let fixture: ComponentFixture<ChatbotComponent>;
  let geminiService: jasmine.SpyObj<GeminiService>;

  beforeEach(async () => {
    const spy = jasmine.createSpyObj('GeminiService', ['sendMessage', 'getChatHistory', 'clearChatHistory']);
    
    await TestBed.configureTestingModule({
      imports: [ChatbotComponent, HttpClientTestingModule, FormsModule],
      providers: [
        { provide: GeminiService, useValue: spy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ChatbotComponent);
    component = fixture.componentInstance;
    geminiService = TestBed.inject(GeminiService) as jasmine.SpyObj<GeminiService>;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load chat history on init', () => {
    const mockHistory = [
      { role: 'user', content: 'Hello', timestamp: new Date() }
    ];
    geminiService.getChatHistory.and.returnValue(m/ockHistory);
    
    component.ngOnInit();
    
    expect(geminiService.getChatHistory).toHaveBeenCalled();
    expect(component.messages).toEqual(mockHistory);
  });

  it('should toggle chat window', () => {
    expect(component.isOpen).toBeFalse();
    
    component.toggleChat();
    expect(component.isOpen).toBeTrue();
    
    component.toggleChat();
    expect(component.isOpen).toBeFalse();
  });

  it('should clear chat history', () => {
    component.messages = [{ role: 'user', content: 'Test', timestamp: new Date() }];
    
    component.clearChat();
    
    expect(geminiService.clearChatHistory).toHaveBeenCalled();
    expect(component.messages).toEqual([]);
  });
});
