import * as FileSystem from 'expo-file-system';

export async function extractTextFromImage(imageUri: string): Promise<string> {
  try {
    return '';
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

    if (extension === 'txt') {
      const content = await FileSystem.readAsStringAsync(filePath);
      return content;
    }

    return '';
  } catch (error) {
    console.error('Error extracting text from file:', error);
    return '';
  }
}
