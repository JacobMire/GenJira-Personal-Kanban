# extracted_knowledge.md

## Agile / Kanban Domain Knowledge
- Fibonacci estimation: 1 → 2 → 3 → 5 → 8 → 13 → 21.
- User Story Format:
  "As a [role], I want [feature], so that [benefit]."
- Acceptance Criteria are boolean and represent "definition of done".

---

## Google GenAI SDK (`@google/genai`)
1. Initialization:
   ```ts
   const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
Models:

gemini-2.5-flash for fast operations.

gemini-3-pro-preview for reasoning-heavy tasks.

Structured Output:

Always use responseSchema (Type.OBJECT or Type.ARRAY).

Output Access:

Use response.text, never .text().

React 19 + Supabase Constraints
Auth state changes via onAuthStateChange.

RLS requires auth.uid() checks on DB operations.

Drag & drop library needs compatible StrictMode wrappers.

UUIDs:

Use crypto.randomUUID() when available.

Provide fallback for insecure contexts.

UI Design System ("Midnight")
Background: #0f172a (Slate-950).

Surfaces: bg-slate-900, borders white/10 or white/5.

Primary: Blue-600 (#2563eb).

Glow: shadow-lg shadow-primary/20.

Glass: backdrop-blur-md + bg-opacity.

yaml
Copy code

---

# 📁 **docs/project_summary.md**
```markdown
# Project Summary — GenJira

GenJira is a high-fidelity, AI-powered Kanban application built using React 19, TypeScript, Supabase, Tailwind CSS, and Google Gemini.

Unlike simple task boards, GenJira integrates deep LLM functionality to restructure vague inputs into actionable Agile tasks, estimate effort, and generate acceptance criteria.

This document summarizes:
- Technology stack
- Key workflows
- Component architecture
- Critical logic