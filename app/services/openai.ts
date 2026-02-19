import Constants from 'expo-constants';

const SUPABASE_URL = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL ||
  process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY ||
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface ChatResponse {
  message: string;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export interface EmbeddingResponse {
  embeddings: number[][];
  model: string;
  usage: {
    prompt_tokens: number;
    total_tokens: number;
  };
}

export async function generateChatCompletion(
  messages: ChatMessage[],
  model: string = 'gpt-4o',
  temperature: number = 0.7
): Promise<ChatResponse> {
  const apiUrl = `${SUPABASE_URL}/functions/v1/openai-chat`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      messages,
      model,
      temperature,
      max_tokens: 1000,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate chat completion');
  }

  return response.json();
}

export async function generateEmbeddings(
  texts: string[],
  model: string = 'text-embedding-3-large'
): Promise<EmbeddingResponse> {
  const apiUrl = `${SUPABASE_URL}/functions/v1/openai-embeddings`;

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      texts,
      model,
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to generate embeddings');
  }

  return response.json();
}

export async function generateTags(text: string): Promise<string[]> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: 'You are a tagging assistant. Extract 3-7 relevant tags from the provided text. Return only the tags as a comma-separated list, no explanations.',
    },
    {
      role: 'user',
      content: `Extract tags from this text:\n\n${text.slice(0, 2000)}`,
    },
  ];

  const response = await generateChatCompletion(messages, 'gpt-4o', 0.5);

  return response.message
    .split(',')
    .map(tag => tag.trim().toLowerCase())
    .filter(tag => tag.length > 0)
    .slice(0, 7);
}

export async function parseSearchQuery(query: string): Promise<{
  semanticQuery: string;
  filters: {
    sourceType?: 'photo' | 'file' | 'both';
    dateOp?: '=' | '>' | '<' | 'range';
    fromDate?: number;
    toDate?: number;
    associationLevel?: 0 | 1 | 2 | 3;
  };
}> {
  const messages: ChatMessage[] = [
    {
      role: 'system',
      content: `You are a search query parser. Extract filters and semantic meaning from natural language queries.
Return JSON in this exact format:
{
  "semanticQuery": "the core semantic search terms",
  "filters": {
    "sourceType": "photo" | "file" | "both",
    "dateOp": "=" | ">" | "<" | "range",
    "fromDate": timestamp_in_ms,
    "toDate": timestamp_in_ms,
    "associationLevel": 0 | 1 | 2 | 3
  }
}

Association levels: 0=narrow, 1=medium, 2=wide, 3=deep.
Use "both" for sourceType unless specifically mentioned.
Only include filters that are explicitly mentioned in the query.`,
    },
    {
      role: 'user',
      content: query,
    },
  ];

  const response = await generateChatCompletion(messages, 'gpt-4o', 0.3);

  try {
    return JSON.parse(response.message);
  } catch {
    return {
      semanticQuery: query,
      filters: { sourceType: 'both', associationLevel: 1 },
    };
  }
}
