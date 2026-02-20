import * as FileSystem from 'expo-file-system';

export async function extractTextFromImage(imageUri: string): Promise<string> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(imageUri);
    if (!fileInfo.exists) {
      return '';
    }

    const base64 = await FileSystem.readAsStringAsync(imageUri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const apiUrl = 'https://0ec90b57d6e95fcbda19832f.supabase.co/functions/v1/openai-chat';
    const apiKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJib2x0IiwicmVmIjoiMGVjOTBiNTdkNmU5NWZjYmRhMTk4MzJmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTg4ODE1NzQsImV4cCI6MTc1ODg4MTU3NH0.9I8-U0x86Ak8t2DGaIk0HfvTSLsAyzdnz-Nw00mMkKw';

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Extract all visible text from this image. Return only the text content, no explanations. If there is no text, return an empty response.',
              },
              {
                type: 'image_url',
                image_url: {
                  url: `data:image/jpeg;base64,${base64}`,
                },
              },
            ],
          },
        ],
        model: 'gpt-4o',
        max_tokens: 1000,
      }),
    });

    if (!response.ok) {
      console.error('OCR API error:', await response.text());
      return '';
    }

    const data = await response.json();
    return data.message || '';
  } catch (error) {
    console.error('Error extracting text from image:', error);
    return '';
  }
}

export async function extractTextFromFile(filePath: string): Promise<string> {
  try {
    const fileInfo = await FileSystem.getInfoAsync(filePath);
    if (!fileInfo.exists) {
      return '';
    }

    const extension = filePath.split('.').pop()?.toLowerCase();

    const textFormats = ['txt', 'md', 'json', 'js', 'ts', 'tsx', 'jsx', 'html', 'css', 'xml', 'csv'];

    if (textFormats.includes(extension || '')) {
      const content = await FileSystem.readAsStringAsync(filePath, {
        encoding: FileSystem.EncodingType.UTF8,
      });
      return content;
    }

    if (extension === 'pdf') {
      return '[PDF file - text extraction not yet implemented]';
    }

    if (['doc', 'docx'].includes(extension || '')) {
      return '[Word document - text extraction not yet implemented]';
    }

    return '';
  } catch (error) {
    console.error('Error extracting text from file:', error);
    return '';
  }
}
