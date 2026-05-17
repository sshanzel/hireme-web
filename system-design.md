# HireMe.dev Architecture

## Overview

HireMe.dev is a portfolio platform that helps professionals showcase their career stories through AI-powered conversations. Users can upload CVs, create experience narratives, and engage with AI coaching to craft compelling career profiles.

---

## Tech Stack

| Layer              | Technology             |
| ------------------ | ---------------------- |
| **Runtime**        | Node.js 20             |
| **Language**       | TypeScript             |
| **API Framework**  | Fastify                |
| **Database**       | PostgreSQL (Supabase)  |
| **ORM**            | Drizzle ORM            |
| **AI**             | OpenAI API             |
| **Cloud Provider** | Google Cloud Platform  |
| **Compute**        | Cloud Run (serverless) |
| **Message Queue**  | Cloud Pub/Sub          |
| **File Storage**   | Cloud Storage          |
| **Infrastructure** | Pulumi (TypeScript)    |
| **Frontend**       | Vercel (Next.js)       |
| **CI/CD**          | GitHub Actions         |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              CLIENTS                                         │
│                                                                              │
│    ┌──────────────────┐                    ┌──────────────────┐             │
│    │   Web App        │                    │   Public Visitors │            │
│    │   (Next.js)      │                    │   (Bio Pages)     │            │
│    │   Vercel         │                    │                   │            │
│    └────────┬─────────┘                    └─────────┬─────────┘            │
└─────────────┼────────────────────────────────────────┼──────────────────────┘
              │                                        │
              │ HTTPS (REST + WebSocket)               │ HTTPS
              ▼                                        ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                          GOOGLE CLOUD PLATFORM                               │
│                                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                      Cloud Run - API Service                          │  │
│  │                      (scales 0 → N instances)                         │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │  Fastify Server                                                 │  │  │
│  │  │                                                                 │  │  │
│  │  │  REST Endpoints:                                                │  │  │
│  │  │  ├── /auth      (login, register, JWT)                          │  │  │
│  │  │  ├── /profile   (user profiles)                                 │  │  │
│  │  │  ├── /cv        (CV upload)                                     │  │  │
│  │  │  ├── /experiences                                               │  │  │
│  │  │  ├── /stories                                                   │  │  │
│  │  │  └── /coachings                                                 │  │  │
│  │  │                                                                 │  │  │
│  │  │  WebSocket Endpoints:                                           │  │  │
│  │  │  ├── /ws/story-event  (AI story creation chat)                  │  │  │
│  │  │  ├── /ws/coach        (AI coaching - uses RAG)                  │  │  │
│  │  │  └── /ws/bio/:id      (public recruiter chat - uses RAG)        │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                          │                                                   │
│                          │ publish events                                    │
│                          ▼                                                   │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         Cloud Pub/Sub                                 │  │
│  │  ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────────────┐  │  │
│  │  │ cv-uploaded     │ │ story-completed │ │ experience-updated      │  │  │
│  │  └────────┬────────┘ └────────┬────────┘ └────────────┬────────────┘  │  │
│  │           │                   │                       │               │  │
│  │           └───────────────────┼───────────────────────┘               │  │
│  │                               │                                       │  │
│  │                               ▼                                       │  │
│  │                    ┌─────────────────────┐                            │  │
│  │                    │   Dead Letter       │  (after 10 retries)        │  │
│  │                    │   Topic             │                            │  │
│  │                    └─────────────────────┘                            │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                          │                                                   │
│                          │ HTTP push                                         │
│                          ▼                                                   │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                    Cloud Run - Worker Service                         │  │
│  │                    (scales 0 → N instances)                           │  │
│  │  ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │  │  Event Handlers:                                                │  │  │
│  │  │  ├── POST /events/cv-uploaded      → Parse CV, extract data     │  │  │
│  │  │  ├── POST /events/story-completed  → Summarize, embed story     │  │  │
│  │  │  └── POST /events/experience-updated → Generate embeddings      │  │  │
│  │  └─────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                              │
│  ┌─────────────────────┐              ┌─────────────────────────────────┐   │
│  │   Cloud Storage     │              │   External APIs                 │   │
│  │   (CV files)        │              │   ├── OpenAI (chat, embeddings) │   │
│  └─────────────────────┘              │   └── Eden AI (CV parsing)      │   │
│                                       └─────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────┘
                          │
                          │ SQL connection
                          ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SUPABASE                                        │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         PostgreSQL                                    │  │
│  │  Tables:                                                              │  │
│  │  ├── user            (profiles, auth)                                 │  │
│  │  ├── experience      (work, education)                                │  │
│  │  ├── story           (career narratives)                              │  │
│  │  ├── story_event     (chat history)                                   │  │
│  │  ├── file            (CV uploads metadata)                            │  │
│  │  └── ...                                                              │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## AI & RAG Pipeline (Core Feature)

The heart of HireMe.dev is a **Retrieval-Augmented Generation (RAG)** system that allows an AI to "become" the user and answer questions about their career on their behalf.

### RAG Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           INGESTION PIPELINE                                 │
│                     (Async, Event-Driven via Pub/Sub)                        │
│                                                                              │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────────────────────┐    │
│  │ CV Upload   │     │ Story Chat  │     │ Experience Update           │    │
│  │             │     │ Complete    │     │                             │    │
│  └──────┬──────┘     └──────┬──────┘     └──────────────┬──────────────┘    │
│         │                   │                           │                    │
│         ▼                   ▼                           ▼                    │
│  ┌─────────────┐     ┌─────────────┐     ┌─────────────────────────────┐    │
│  │ Eden AI     │     │ GPT-4o-mini │     │                             │    │
│  │ CV Parser   │     │ Summarize   │     │ Format as searchable chunk  │    │
│  │             │     │ Conversation│     │                             │    │
│  └──────┬──────┘     └──────┬──────┘     └──────────────┬──────────────┘    │
│         │                   │                           │                    │
│         ▼                   ▼                           ▼                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                    OpenAI Embeddings API                            │    │
│  │                    (text-embedding-3-small)                         │    │
│  │                    Converts text → 1536-dim vector                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                    │                                         │
│                                    ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      PostgreSQL + pgvector                          │    │
│  │  ┌─────────────────────────┐  ┌─────────────────────────────────┐   │    │
│  │  │     story_index         │  │       experience_index          │   │    │
│  │  │  - story_id             │  │  - experience_id                │   │    │
│  │  │  - chunk (text)         │  │  - chunk (text)                 │   │    │
│  │  │  - vector (1536-dim)    │  │  - vector (1536-dim)            │   │    │
│  │  │  - metadata (json)      │  │  - metadata (json)              │   │    │
│  │  └─────────────────────────┘  └─────────────────────────────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                           RETRIEVAL PIPELINE                                 │
│                        (Real-time, WebSocket)                                │
│                                                                              │
│  Used by TWO features:                                                       │
│  ┌─────────────────────────────┐  ┌─────────────────────────────────────┐   │
│  │  1. PUBLIC BIO CHAT         │  │  2. AI COACHING                     │   │
│  │     /ws/bio/:id             │  │     /ws/coach                       │   │
│  │                             │  │                                     │   │
│  │  WHO: Recruiters, visitors  │  │  WHO: The user themselves           │   │
│  │  PURPOSE: Ask questions     │  │  PURPOSE: Career coaching &         │   │
│  │  about the user's career    │  │  interview preparation              │   │
│  │                             │  │                                     │   │
│  │  AI PERSONA: "You are       │  │  AI PERSONA: "You are a career      │   │
│  │  {userName}, responding     │  │  coach helping {userName} prepare   │   │
│  │  on your public profile"    │  │  for interviews and articulate      │   │
│  │                             │  │  their experiences"                 │   │
│  └─────────────────────────────┘  └─────────────────────────────────────┘   │
│                                                                              │
│  Example: Visitor asks "What projects have you worked on?"                  │
│         │                                                                    │
│         ▼                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  1. EMBED QUERY                                                     │    │
│  │     "What projects have you worked on?" → [0.012, -0.034, ...]      │    │
│  │     (text-embedding-3-small)                                        │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│         │                                                                    │
│         ▼                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  2. VECTOR SEARCH (pgvector cosine similarity)                      │    │
│  │                                                                     │    │
│  │     SELECT chunk, 1 - (vector <=> query_vector) as similarity       │    │
│  │     FROM story_index                                                │    │
│  │     UNION ALL                                                       │    │
│  │     SELECT chunk, 1 - (vector <=> query_vector) as similarity       │    │
│  │     FROM experience_index                                           │    │
│  │     WHERE user_id = $1                                              │    │
│  │     ORDER BY similarity DESC                                        │    │
│  │     LIMIT 5                                                         │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│         │                                                                    │
│         │  Top 5 most relevant chunks                                        │
│         ▼                                                                    │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  3. AUGMENTED GENERATION                                            │    │
│  │                                                                     │    │
│  │  System Prompt:                                                     │    │
│  │  "You are {userName}, responding to questions on your public        │    │
│  │   profile page. Answer based ONLY on the provided context..."       │    │
│  │                                                                     │    │
│  │  Context:                                                           │    │
│  │  [STORY] Led migration of microservices to Kubernetes at Company X  │    │
│  │  [EXPERIENCE] Senior Engineer at Company X (2020-2023)              │    │
│  │  [STORY] Built real-time analytics dashboard processing 1M events  │    │
│  │  ...                                                                │    │
│  │                                                                     │    │
│  │  Chat History + User Query → GPT-4o-mini → Response                 │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│         │                                                                    │
│         ▼                                                                    │
│  AI responds as the user: "I've worked on several exciting projects..."     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### AI Models Used

| Purpose                  | Model                    | RAG?    | Description                                               |
| ------------------------ | ------------------------ | ------- | --------------------------------------------------------- |
| **Embeddings**           | `text-embedding-3-small` | -       | Converts text to 1536-dim vectors for similarity search   |
| **Story Summarization**  | `gpt-4o-mini`            | No      | Converts chat conversations into coherent narratives      |
| **Story Chat**           | `gpt-4o-mini`            | No      | Interactive story creation with streaming                 |
| **Bio Chat (Recruiter)** | `gpt-4o-mini`            | **Yes** | AI answers as the user, grounded in their indexed content |
| **Coaching Chat**        | `gpt-4o-mini`            | **Yes** | AI coaches user using their own experiences as context    |
| **CV Parsing**           | Eden AI                  | No      | Specialized resume parsing API                            |

### Chunking Strategy

**Stories:**

- Chat conversations are summarized into first-person narratives
- Each story = 1 chunk (optimized for retrieval, not split)
- Prompt instructs GPT to make it "vector-search friendly"

**Experiences:**

- Formatted as structured text:
  ```
  Work: Senior Engineer at Company X
  Period: Jan 2020 - Dec 2023
  Description: Led team of 5 engineers...
  Skills: TypeScript, Kubernetes, PostgreSQL
  ```
- Each experience = 1 chunk

### Vector Storage (pgvector)

```sql
-- story_index table
CREATE TABLE story_index (
  id UUID PRIMARY KEY,
  story_id UUID REFERENCES story(id),
  chunk TEXT,
  vector VECTOR(1536),  -- pgvector extension
  metadata JSONB
);

-- Cosine similarity search
SELECT *, 1 - (vector <=> $1) as similarity
FROM story_index
ORDER BY vector <=> $1
LIMIT 5;
```

### Why This Architecture?

1. **Separation of Ingestion & Retrieval**
   - Embedding generation is async (Pub/Sub workers)
   - Search is real-time (< 100ms with proper indexing)

2. **User-Scoped Search**
   - Each query only searches the specific user's data
   - No cross-user data leakage

3. **Grounded Responses**
   - AI can ONLY answer based on indexed content
   - Reduces hallucination risk
   - "If not in context, say you don't have it documented"

4. **Cost Optimization**
   - `gpt-4o-mini` is 10x cheaper than `gpt-4o`
   - Embeddings are cached (generated once per content update)
   - Small context window (top 5 chunks) keeps token usage low

---

## Data Flow

### 1. CV Upload & Processing

```
User uploads CV
       │
       ▼
┌─────────────────┐
│  POST /cv       │  → Save to Cloud Storage
│                 │  → Create file record (status: uploaded)
│                 │  → Publish to cv-uploaded topic
└─────────────────┘
       │
       │ async (Pub/Sub push)
       ▼
┌─────────────────┐
│  Worker:        │  → Fetch file from Storage
│  cv-uploaded    │  → Call Eden AI parser
│                 │  → Extract work experience, education
│                 │  → Save to database
│                 │  → Update file status: processed
└─────────────────┘
```

### 2. Story Creation (AI Chat)

```
User opens story editor
       │
       ▼
┌─────────────────┐
│  WebSocket      │  → Authenticate user
│  /ws/story-event│  → Load story context
└─────────────────┘
       │
       │ bidirectional
       ▼
┌─────────────────┐
│  User sends     │  → Save event to DB
│  message        │  → Stream to OpenAI
│                 │  → Stream response back via WS
│                 │  → Save AI response to DB
└─────────────────┘
       │
       │ on story complete
       ▼
┌─────────────────┐
│  Publish to     │  → Summarize story
│  story-completed│  → Generate embeddings
└─────────────────┘
```

### 3. Public Bio Chat (Recruiter Feature)

```
Recruiter/visitor lands on /{username}
       │
       ▼
┌─────────────────┐
│  WebSocket      │  → Load user's profile
│  /ws/bio/:id    │  → No auth required (public)
└─────────────────┘
       │
       │ visitor asks: "What's your experience with Kubernetes?"
       ▼
┌─────────────────┐
│  RAG Pipeline   │  → Embed query
│                 │  → Vector search user's stories & experiences
│                 │  → Retrieve top 5 relevant chunks
└─────────────────┘
       │
       ▼
┌─────────────────┐
│  AI responds    │  → System: "You are {userName}, answer as yourself"
│  AS the user    │  → Context: relevant stories & experiences
│                 │  → Generates personalized response
└─────────────────┘
```

### 4. AI Coaching (User Feature)

```
User opens coaching session
       │
       ▼
┌─────────────────┐
│  WebSocket      │  → Authenticate user
│  /ws/coach      │  → Load user context
└─────────────────┘
       │
       │ user asks: "How should I talk about my leadership experience?"
       ▼
┌─────────────────┐
│  RAG Pipeline   │  → Embed query
│                 │  → Vector search user's OWN stories & experiences
│                 │  → Retrieve relevant chunks about their career
└─────────────────┘
       │
       ▼
┌─────────────────┐
│  AI responds    │  → System: "You are a career coach helping {userName}"
│  AS coach       │  → Context: user's actual experiences
│                 │  → Provides tailored coaching advice
└─────────────────┘
```

---

## Event-Driven Architecture

### Topics & Subscriptions

| Topic                       | Subscription                       | Handler             | Purpose                         |
| --------------------------- | ---------------------------------- | ------------------- | ------------------------------- |
| `api.v1.cv-uploaded`        | `cv-uploaded-parsing`              | CV parsing          | Extract structured data from CV |
| `api.v1.story-completed`    | `story-completed-canonicalization` | Story processing    | Summarize and embed stories     |
| `api.v1.experience-updated` | `experience-updated-indexing`      | Experience indexing | Generate embeddings             |
| `api.v1.dead-letter`        | -                                  | -                   | Failed messages (inspection)    |

### Retry Policy

- **Max attempts**: 10
- **Backoff**: 10s → 60s (exponential)
- **After max retries**: Message moves to dead letter topic

---

## Infrastructure (Pulumi)

```
infra/
├── index.ts                 # Entry point
└── src/
    ├── config.ts            # Environment config + secrets
    ├── artifact-registry.ts # Docker image repository
    ├── iam/
    │   └── index.ts         # Service accounts + permissions
    ├── cloudrun/
    │   ├── api.ts           # API service
    │   └── worker.ts        # Worker service
    └── pubsub/
        └── index.ts         # Topics + subscriptions
```

### Service Accounts

| Account          | Purpose             | Permissions                        |
| ---------------- | ------------------- | ---------------------------------- |
| `core-api`       | API service         | Pub/Sub publisher, Storage admin   |
| `core-worker`    | Worker service      | Pub/Sub subscriber, Storage viewer |
| `pubsub-invoker` | Pub/Sub → Cloud Run | Service account token creator      |

---

## Local Development

```bash
# Terminal 1: API
pnpm dev

# Terminal 2: Worker (pull mode)
pnpm dev:worker

# Terminal 3: Pub/Sub emulator
gcloud beta emulators pubsub start --project=local-project
```

The worker auto-detects environment:

- **Local**: Pull-based subscription (polls for messages)
- **Cloud Run**: Push-based (receives HTTP POST from Pub/Sub)

---

## Deployment

### CI/CD Pipeline (GitHub Actions)

```
Push to main
     │
     ├── infra/** changed? → Pulumi preview/up
     │
     └── src/** changed? → Docker build → Push to Artifact Registry
                                       → Deploy to Cloud Run
```

### Manual Deployment

```bash
# Infrastructure
cd infra && pulumi up

# Application (handled by CI/CD typically)
docker build -t api .
docker push europe-west1-docker.pkg.dev/hiremedev/core-api/api
gcloud run deploy core-api --image ...
```

---

## Cost Optimization

| Decision                | Impact                             |
| ----------------------- | ---------------------------------- |
| Cloud Run (serverless)  | Pay only for requests, scales to 0 |
| Supabase free tier      | $0 for database (500MB)            |
| Pub/Sub free tier       | $0 for low volume                  |
| Cloud Storage free tier | $0 for 5GB                         |
| Spot/preemptible VMs    | Not applicable (serverless)        |

**Estimated monthly cost**: ~$0 (within free tiers for low traffic)

---

## Security

- **Authentication**: JWT tokens (httpOnly cookies)
- **CORS**: Restricted to allowed origins
- **Cloud Run**: API is public, Worker is internal-only
- **Secrets**: Managed via Pulumi (encrypted in state)
- **Service Accounts**: Least privilege IAM bindings

---

## Future Considerations

- [ ] Add Redis for session caching (if needed for scale)
- [ ] Implement rate limiting
- [ ] Add monitoring/alerting (Cloud Monitoring)
- [ ] Consider CDN for static assets
- [ ] Database connection pooling via Supabase pooler
