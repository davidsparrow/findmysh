# findmysh

A privacy-first, on-device AI search app for photos and files. Your content stays on your device while powerful semantic search helps you find what you need instantly.

## Features

- **Privacy-First**: All files stay on your device. No uploads.
- **Semantic Search**: Natural language queries powered by OpenAI embeddings
- **Photo Indexing**: Search your entire photo library using OCR and AI
- **File Support**: Import and search documents via share sheet or file picker
- **Chat & Manual Modes**: Use conversational AI or traditional search filters
- **Smart Tagging**: Automatic tag generation for enhanced searchability

## Tech Stack

- **Framework**: React Native (Expo)
- **Database**: SQLite (local, on-device)
- **AI**: OpenAI GPT-4o + text-embedding-3-large (via Supabase Edge Functions)
- **State Management**: Zustand
- **Navigation**: Expo Router

## Setup

### Prerequisites

- Node.js 18+
- Expo CLI
- iOS Simulator or Android Emulator (or physical device)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Configure environment variables in `.env`:

```env
EXPO_PUBLIC_OPENAI_API_KEY=your-openai-api-key-here
EXPO_PUBLIC_OPENAI_CHAT_MODEL=gpt-4o
EXPO_PUBLIC_OPENAI_EMBEDDING_MODEL=text-embedding-3-large

EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key

EXPO_PUBLIC_FREE_PHOTO_CAP=10
EXPO_PUBLIC_FREE_FILE_CAP=10
```

4. Add placeholder assets to the `assets/` directory:
   - `icon.png` (1024x1024)
   - `splash.png` (1242x2436)
   - `adaptive-icon.png` (1024x1024)
   - `favicon.png` (48x48)

### Running the App

```bash
# Start Expo development server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

### Building for Production

This app requires an Expo Development Build (not Expo Go):

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure EAS
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## Architecture

### Folder Structure

```
app/
├── components/      # Reusable UI components
├── database/        # SQLite schema and operations
├── services/        # Business logic (indexing, search, OpenAI)
├── hooks/           # Custom React hooks
├── stores/          # Zustand state management
├── screens/         # Screen components
└── utils/           # Helper utilities

supabase/
└── functions/       # Edge Functions for OpenAI API calls
```

### Key Components

- **IndexingController**: State machine managing photo/file indexing
- **SearchService**: Semantic search with cosine similarity
- **OpenAI Service**: Interface to GPT-4o and embeddings via Edge Functions
- **RefreshService**: Validates and purges deleted items

## Caps & Limits

Free tier defaults:
- 10 photos
- 10 files

Configurable via environment variables or database settings.

## Privacy & Security

- All photos and files remain on device
- Only extracted text sent to OpenAI (not original files)
- No cloud storage or sync
- SQLite database stored locally in app sandbox

## License

MIT

## Support

For issues and questions, please open a GitHub issue.
