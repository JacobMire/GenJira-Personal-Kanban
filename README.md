
# GenJira - Personal Kanban
### The Intelligent, Cloud-Native Workspace for Developers

---

**GenJira** is a modern, high-performance Kanban application designed for personal productivity. Built with **React 19** and **Supabase**, it combines the fluidity of a local app with the power of the cloud. It features AI-powered task generation, customizable layouts, and a "Midnight" design system optimized for focus.

## ✨ Key Features

### 🚀 **Intelligent Workflow**
-   **AI Magic Import**: Paste rough notes or requirements, and let our Gemini-powered AI structure them into actionable tasks with priorities and tags.
-   **Drag & Drop**: Smooth, intuitive drag-and-drop interface powered by `@hello-pangea/dnd`.

### 🎨 **Customizable Views**
-   **Condensed Mode**: Switch to a high-density view to see more tasks at a glance, perfect for planning sessions.
-   **Hybrid Checkboxes**: Smart checkboxes that adapt context—mark tasks as **Completed** (strikethrough) in normal mode, or **Select** them for bulk actions in selection mode.
-   **Midnight UI**: A carefully crafted dark theme using `slate-950` and vivid accents, designed to reduce eye strain during late-night coding.

### ⚡ **Performance & UX**
-   **Silent Sync**: Optimistic UI updates ensure the interface never blocks. Data refreshes silently in the background on tab focus, eliminating jarring loading screens.
-   **Mobile Optimized**: A fully responsive layout that adapts navigation, touch targets, and visibility for productivity on the go.
-   **Keyboard Shortcuts**: Power-user friendly shortcuts (e.g., `/` to search, `n` for new task).

### 🔒 **Enterprise-Grade Backend**
-   **Supabase Auth**: Secure authentication with Magic Links and OAuth.
-   **Row Level Security (RLS)**: Data is isolated at the database level, ensuring users can only access their own boards.
-   **Persistent Settings**: User preferences (view modes, layouts) are synced to the cloud.

## 🛠️ Tech Stack

-   **Frontend**: React 19, TypeScript, Tailwind CSS, Lucide React
-   **Backend**: Supabase (PostgreSQL, Auth, Realtime)
-   **AI**: Google Gemini SDK
-   **State/Logic**: Custom Hooks, Optimistic Updates

## 🚀 Getting Started

### Prerequisites
-   Node.js 18+
-   A Supabase Project
-   A Google Gemini API Key

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/yourusername/genjira.git
    cd genjira
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Configure Environment**
    Create a `.env.local` file:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    VITE_GEMINI_API_KEY=your_gemini_key
    ```

4.  **Run Locally**
    ```bash
    npm run dev
    ```

## 🔮 Roadmap

-   [ ] **Data Encryption**: End-to-end encryption for sensitive task data.
-   [ ] **Import/Export**: JSON/CSV export for data portability.
-   [ ] **Multiple Boards**: Support for managing multiple projects.

---

<div align="center">
Built with ❤️ by the Antigravity Team
</div>
