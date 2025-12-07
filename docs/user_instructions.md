# GenJira User Interaction Guide

## 1. Authentication
- Users authenticate via Email/Password or Google OAuth (Supabase Auth).
- When login succeeds, GenJira loads the user-specific board.
- RLS ensures users only see their own boards.

## 2. Board Management
### Columns
- Users can Create, Rename, Resize, and Delete columns.
- Columns can collapse into vertical "pills".

### Tasks
- Create: Press **N** or click *Create Issue*.
- Drag & Drop: Tasks move across or within columns.
- Multi-Select: Enables bulk operations (delete, move).

## 3. AI Features
### Enhance Task
- Inside the Task Modal → clicking **Enhance with Gemini**:
  - Refines title and description.
  - Adds acceptance criteria.
  - Generates story points.
  - Adds tags/priority.

### Magic Import
- User pastes unstructured text (meeting notes).
- Gemini parses and returns an array of structured tasks.
- Tasks are batch inserted and appear instantly via optimistic UI.

## 4. Keyboard Shortcuts
- `N` → New Task
- `/` → Focus Search
- `Esc` → Close modal
- `Ctrl+Enter` → Save / Run AI import

