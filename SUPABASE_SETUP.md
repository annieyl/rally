# Supabase Setup Guide for Rally

## Overview
This guide sets up:
1. **Object Storage** - Store JSON transcripts in Supabase Storage
2. **Postgres Database** - Track session IDs and metadata
3. **API Integration** - Upload transcripts when sessions end

---

## Step 1: Get Supabase Credentials

1. Go to [supabase.com](https://supabase.com) and create a project
2. In your project, go to **Settings → API**
3. Copy:
   - **Project URL** (starts with `https://`)
   - **Anon Public Key**

---

## Step 2: Update Backend .env

Edit `/backend/.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-anon-key-here
```

---

## Step 3: Create Database Schema

1. In Supabase, go to **SQL Editor**
2. Click **New Query**
3. Copy and paste the contents of `backend/sql_schema.sql`
4. Click **Run**

This creates the `sessions` table with:
- `session_id` - Unique session identifier
- `user_id` - Optional user tracking
- `transcript_url` - Public URL to transcript JSON
- `created_at` - When session started
- `ended_at` - When session ended
- `metadata` - Additional data as JSON

---

## Step 4: Create Storage Bucket

1. In Supabase, go to **Storage**
2. Click **Create a new bucket**
3. Name it `transcripts` (must match code)
4. Make it **Public** (or set custom policies)
5. Click **Create**

---

## Step 5: Install Dependencies

```bash
cd backend
pip install -r requirements.txt
# This installs the supabase Python SDK
```

---

## Step 6: Update Frontend

When you want to upload a transcript (e.g., when session ends or user clicks another tab):

```typescript
import { uploadTranscript } from './api/transcript';

// When session ends or user navigates away
await uploadTranscript(sessionId, userId);
```

This will:
1. Send session_id to backend
2. Backend uploads transcript JSON to Supabase Storage
3. Backend saves session metadata to Postgres
4. Frontend receives public URL to transcript
5. Session is cleared from memory

---

## API Endpoints

### Upload Transcript
**POST** `/api/transcript/upload`

Request:
```json
{
  "session_id": "session-123",
  "user_id": "optional-user-456"
}
```

Response:
```json
{
  "session_id": "session-123",
  "transcript_url": "https://your-project.supabase.co/storage/v1/object/public/transcripts/session-123.json",
  "session_data": {
    "id": 1,
    "session_id": "session-123",
    "user_id": "optional-user-456",
    "transcript_url": "...",
    "created_at": "2026-02-16T10:00:00Z",
    "ended_at": "2026-02-16T10:15:00Z"
  }
}
```

---

## How It Works

### On Session End (e.g., user clicks another tab)
1. Frontend calls `uploadTranscript(sessionId)`
2. Backend receives request
3. Backend gets transcript from memory
4. Backend uploads JSON to Supabase Storage
5. Backend saves session record to Postgres
6. Backend clears session from memory
7. Frontend gets back the public transcript URL

### Later Access
You can retrieve past transcripts by:
1. Querying `sessions` table from Supabase dashboard
2. Using the `transcript_url` to get the JSON
3. Or fetch from frontend using: `getTranscript(publicUrl)`

---

## Testing

1. Start backend: `python app.py`
2. Chat with the AI (messages store in memory)
3. Call upload endpoint: 
   ```bash
   curl -X POST http://localhost:8000/api/transcript/upload \
     -H "Content-Type: application/json" \
     -d '{"session_id": "test-123", "user_id": "user-456"}'
   ```
4. Check Supabase:
   - **Storage/transcripts** - Should see `test-123.json`
   - **Table Editor/sessions** - Should see new row

---

## Troubleshooting

**Error: "SUPABASE_URL or SUPABASE_KEY not set"**
- Update `.env` with correct credentials

**Error: "bucket 'transcripts' not found"**
- Go to Supabase Storage and create `transcripts` bucket

**Error: "relation 'sessions' does not exist"**
- Run the SQL schema from `sql_schema.sql`

**Error: "401 Unauthorized"**
- Check that your Anon Key is correct
- May need to check storage policies

---

## Security Notes

- Use Row Level Security (RLS) policies if you have user authentication
- Consider enabling row-level security on the `sessions` table
- Storage bucket is currently public - adjust policies as needed
- Use authenticated keys in production, not anon keys

