// Configuration file for API keys and settings
// In production, you should use environment variables instead of hardcoding the API key

export const config = {
  // OpenAI API Configuration
  OPENAI_API_KEY: import.meta.env.VITE_OPENAI_API_KEY,
  OPENAI_API_URL: 'https://api.openai.com/v1/chat/completions',
  
  // App Configuration
  MAX_FILE_SIZE: 10 * 1024 * 1024, // 10MB
  ALLOWED_FILE_TYPES: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ],
  
  // UI Configuration
  URGENT_DAYS_THRESHOLD: 7
};
