# Gemini Chatbot Setup Guide

This guide will help you set up the Gemini AI chatbot in your Angular application.

## Prerequisites

- Google Cloud account
- Gemini API access enabled
- API key for Gemini

## Setup Steps

### 1. Get Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy the generated API key

### 2. Configure the API Key

1. Open `src/environments/environment.ts`
2. Replace `'YOUR_GEMINI_API_KEY_HERE'` with your actual API key:

```typescript
export const environment = {
  production: false,
  tmdbApiKey: 'your-tmdb-key',
  tmdbBaseUrl: 'https://api.themoviedb.org/3',
  tmdbImageBaseUrl: 'https://image.tmdb.org/t/p',
  geminiApiKey: 'your-actual-gemini-api-key-here' // Replace this
};
```

### 3. Test the Chatbot

1. Start your Angular application: `ng serve`
2. Navigate to a page with the chatbot component
3. Click the chat button to open the chatbot
4. Type a message and press Enter

## Features

- **Real-time Chat**: Instant responses from Gemini AI
- **Chat History**: Messages are stored during the session
- **Responsive Design**: Works on desktop and mobile
- **Error Handling**: Graceful error handling for API failures
- **Loading States**: Visual feedback during API calls

## Configuration Options

You can customize the chatbot behavior by modifying the `GeminiService`:

- **Model**: Currently using `gemini-pro` (can be changed to other available models)
- **Max Output Tokens**: Set to 1000 (adjustable)
- **Temperature**: Set to 0.7 for balanced creativity (0.0 = very focused, 1.0 = very creative)

## Troubleshooting

### Common Issues

1. **"Invalid API Key" Error**
   - Verify your API key is correct
   - Ensure the API key has Gemini access enabled

2. **"Quota Exceeded" Error**
   - Check your Google Cloud billing
   - Monitor your API usage in Google AI Studio

3. **Chat Not Responding**
   - Check browser console for errors
   - Verify network connectivity
   - Ensure the Gemini service is properly injected

### Getting Help

- Check the [Gemini API Documentation](https://ai.google.dev/docs)
- Review the [Google AI Studio](https://makersuite.google.com/) for API status
- Check the browser console for detailed error messages

## Security Notes

- Never commit your API key to version control
- Use environment variables for production deployments
- Consider implementing rate limiting for production use
- Monitor API usage to control costs
