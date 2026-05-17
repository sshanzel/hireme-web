# Codebase Refactoring Plan

## Overview

This document outlines the refactoring plan to improve code organization, eliminate duplication, and establish proper folder structure.

---

## Phase 1: Folder Restructure

### Current Structure
```
/components (flat - 17 files)
/lib (mixed utilities)
/types (1 file)
```

### Target Structure
```
/components
├── /ui                    # Shadcn primitives (existing)
├── /chat                  # Chat-related components
│   ├── MessageBubble.tsx
│   └── index.ts
├── /experience            # Experience-related components
│   ├── ExperienceItem.tsx
│   ├── ExperienceList.tsx
│   ├── ExperienceForm.tsx
│   ├── ExperienceModal.tsx
│   ├── StoryItem.tsx
│   └── index.ts
├── /coaching              # Coaching page components
│   ├── SessionItem.tsx
│   ├── SessionList.tsx
│   └── index.ts
├── /profile               # Profile-related components
│   ├── ProfileForm.tsx
│   ├── ProfileSection.tsx
│   └── index.ts
├── /layout                # Layout components
│   ├── AppLayout.tsx
│   ├── Sidebar.tsx
│   ├── PageHeader.tsx
│   └── index.ts
├── /common                # Shared/common components
│   ├── LoadingSpinner.tsx
│   ├── CollapsibleList.tsx
│   ├── CVUploadOverlay.tsx
│   └── index.ts
├── /auth                  # Auth-related components
│   ├── ProtectedRoute.tsx
│   ├── GuestRoute.tsx
│   └── index.ts
└── /story                 # Story-related components
    ├── Chat.tsx
    ├── UntaggedStories.tsx
    └── index.ts

/lib
├── /strings
│   ├── format.ts          # Consolidated formatters
│   └── name.ts            # Existing
├── api.ts
├── config.ts
├── utils.ts
└── /validations           # Existing

/types
├── experience.ts          # Existing
├── profile.ts             # NEW - Profile types
├── chat.ts                # NEW - Chat/coaching types
└── index.ts               # Barrel export
```

---

## Phase 2: Extract Duplicate Components

### 2.1 MessageBubble (3 instances → 1)

**Extract from:**
- `/components/Chat.tsx` (lines 37-71)
- `/app/[identifier]/page.tsx` (lines 84-107)
- `/app/coach/page.tsx` (lines 174-207)

**Create:** `/components/chat/MessageBubble.tsx`

```typescript
interface MessageBubbleProps {
  message: {
    role: 'user' | 'assistant' | 'error';
    content: string;
  };
}
```

### 2.2 SessionItem & SessionList

**Extract from:** `/app/coach/page.tsx`

**Create:**
- `/components/coaching/SessionItem.tsx`
- `/components/coaching/SessionList.tsx`

### 2.3 ExperienceItem & StoryItem

**Extract from:** `/components/ExperienceList.tsx`

**Create:**
- `/components/experience/ExperienceItem.tsx`
- `/components/experience/StoryItem.tsx`

### 2.4 ExperienceModal

**Extract from:** `/app/[identifier]/page.tsx`

**Create:** `/components/experience/ExperienceModal.tsx`

---

## Phase 3: Consolidate Utilities

### 3.1 Format Utilities

**Consolidate into:** `/lib/strings/format.ts`

```typescript
// From AppLayout.tsx, [identifier]/page.tsx
export function getInitials(name: string): string

// From ExperienceList.tsx
export function formatDate(dateString: string): string

// From [identifier]/page.tsx, ExperienceList.tsx
export function formatDateRange(startDate: string, endDate: string | null): string

// From coach/page.tsx
export function formatRelativeDate(dateString: string): string
```

### 3.2 Loading Components

**Create:** `/components/common/LoadingSpinner.tsx`

```typescript
interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  text?: string;
}
```

---

## Phase 4: Type Consolidation

### 4.1 Create `/types/profile.ts`
- Move `ProfileUser`, `ProfileData` from hooks
- Move `PublicProfile`, `PublicExperience` from [identifier]/page.tsx

### 4.2 Create `/types/chat.ts`
- Rename `Story` in StoryChatContext to `ChatStory`
- Move `Message`, `ChatEvent` types

### 4.3 Update `/types/index.ts`
- Barrel export all types

---

## Execution Checklist

### Step 1: Create folder structure
- [ ] Create `/components/chat/`
- [ ] Create `/components/experience/`
- [ ] Create `/components/coaching/`
- [ ] Create `/components/profile/`
- [ ] Create `/components/layout/`
- [ ] Create `/components/common/`
- [ ] Create `/components/auth/`
- [ ] Create `/components/story/`

### Step 2: Extract and move components
- [ ] Extract MessageBubble → `/components/chat/MessageBubble.tsx`
- [ ] Extract SessionItem → `/components/coaching/SessionItem.tsx`
- [ ] Extract SessionList → `/components/coaching/SessionList.tsx`
- [ ] Extract ExperienceItem → `/components/experience/ExperienceItem.tsx`
- [ ] Extract StoryItem → `/components/experience/StoryItem.tsx`
- [ ] Extract ExperienceModal → `/components/experience/ExperienceModal.tsx`
- [ ] Create LoadingSpinner → `/components/common/LoadingSpinner.tsx`

### Step 3: Move existing components
- [ ] Move AppLayout → `/components/layout/`
- [ ] Move Sidebar → `/components/layout/`
- [ ] Move PageHeader → `/components/layout/`
- [ ] Move ProfileForm → `/components/profile/`
- [ ] Move ProfileSection → `/components/profile/`
- [ ] Move ExperienceList → `/components/experience/`
- [ ] Move ExperienceForm → `/components/experience/`
- [ ] Move Chat → `/components/story/`
- [ ] Move UntaggedStories → `/components/story/`
- [ ] Move CollapsibleList → `/components/common/`
- [ ] Move CVUploadOverlay → `/components/common/`
- [ ] Move ProtectedRoute → `/components/auth/`
- [ ] Move GuestRoute → `/components/auth/`

### Step 4: Create barrel exports (index.ts)
- [ ] `/components/chat/index.ts`
- [ ] `/components/experience/index.ts`
- [ ] `/components/coaching/index.ts`
- [ ] `/components/profile/index.ts`
- [ ] `/components/layout/index.ts`
- [ ] `/components/common/index.ts`
- [ ] `/components/auth/index.ts`
- [ ] `/components/story/index.ts`

### Step 5: Consolidate utilities
- [ ] Create `/lib/strings/format.ts` with all formatters
- [ ] Update imports across codebase

### Step 6: Update all imports
- [ ] Update `/app/page.tsx`
- [ ] Update `/app/coach/page.tsx`
- [ ] Update `/app/settings/page.tsx`
- [ ] Update `/app/[identifier]/page.tsx`
- [ ] Update `/app/login/page.tsx`
- [ ] Update `/app/signup/page.tsx`
- [ ] Update all components with new paths

### Step 7: Verify
- [ ] Run `npm run build`
- [ ] Run `npm run lint`
- [ ] Test all pages manually

---

## Files Changed Summary

### New Files (13)
1. `/components/chat/MessageBubble.tsx`
2. `/components/chat/index.ts`
3. `/components/coaching/SessionItem.tsx`
4. `/components/coaching/SessionList.tsx`
5. `/components/coaching/index.ts`
6. `/components/experience/ExperienceItem.tsx`
7. `/components/experience/StoryItem.tsx`
8. `/components/experience/ExperienceModal.tsx`
9. `/components/experience/index.ts`
10. `/components/common/LoadingSpinner.tsx`
11. `/components/common/index.ts`
12. `/components/layout/index.ts`
13. `/lib/strings/format.ts`

### Moved Files (14)
All existing components moved to categorized folders

### Modified Files (8+)
All app pages and components updated with new import paths

---

## Expected Outcomes

1. **Reduced duplication**: MessageBubble from 3 → 1 instance
2. **Better organization**: Components grouped by feature
3. **Improved discoverability**: Barrel exports for easy imports
4. **Cleaner pages**: App pages focus on composition, not implementation
5. **Reusable utilities**: Consolidated format functions
6. **Type safety**: Centralized type definitions
