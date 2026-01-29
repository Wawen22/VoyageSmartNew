# VoyageSmart 🌍✈️

VoyageSmart is your ultimate travel companion, designed to simplify group trip planning, expense tracking, and itinerary management. Built with modern web technologies, it offers a seamless experience for organizing every aspect of your journey.

![Project Status](https://img.shields.io/badge/status-active-success.svg)
![License](https://img.shields.io/badge/license-MIT-blue.svg)

## 🚀 Key Features

### 📅 Smart Itinerary Planning
- **Drag-and-Drop Timeline:** Easily organize your activities day by day.
- **Detailed Activities:** Add locations, notes, and times for every event.
- **Visual Overview:** View your trip on a clear, interactive timeline.

### 💰 Expense Tracking & Splitting
- **Group Finance:** Track shared expenses and know exactly who owes whom.
- **Splitwise-Style Settlement:** Smart algorithms to calculate the most efficient way to settle debts.
- **Visual Budgeting:** Charts and graphs to analyze spending categories.

### 🏨 Logistics Management
- **Accommodations:** Keep track of check-in/out times, addresses, and booking details.
- **Transports:** Manage flights, trains, and transfers with departure/arrival tracking.

### 🤝 Collaboration & Sharing
- **Real-time Collaboration:** Invite friends to plan the trip together.
- **Public View:** Share a read-only view of your itinerary with family and friends via a public link.
- **PDF Export:** Download your complete itinerary and booking details for offline access.

### 📝 Utilities
- **Smart Checklists:** Pre-trip packing lists and to-do items.
- **Document Storage:** Securely upload and access travel documents (passports, tickets).
- **Notifications:** Stay updated on trip changes.

## 🛠️ Tech Stack

**Frontend:**
- [React](https://react.dev/) - UI Library
- [TypeScript](https://www.typescriptlang.org/) - Static Typing
- [Vite](https://vitejs.dev/) - Build Tool
- [Tailwind CSS](https://tailwindcss.com/) - Styling Framework
- [Shadcn UI](https://ui.shadcn.com/) - Component Library (Radix UI)
- [TanStack Query](https://tanstack.com/query/latest) - Server State Management
- [React Router](https://reactrouter.com/) - Routing
- [Framer Motion](https://www.framer.com/motion/) - Animations

**Backend & Services:**
- [Supabase](https://supabase.com/) - Database (PostgreSQL), Authentication, and Realtime
- [Lovable](https://lovable.dev/) - Rapid Prototyping (Initial generation)

**Utilities:**
- `recharts` - Data Visualization
- `jspdf` - PDF Generation
- `zod` & `react-hook-form` - Form Validation
- `date-fns` - Date Management
- `lucide-react` - Icons

**Testing:**
- [Vitest](https://vitest.dev/) - Unit & Integration Testing

## ⚡ Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or bun
- A Supabase project

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/yourusername/voyagesmart.git
    cd voyagesmart
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    # or
    bun install
    ```

3.  **Environment Setup:**
    Create a `.env` file in the root directory (or `.env.local`) and add your Supabase credentials:
    ```env
    VITE_SUPABASE_URL=your_supabase_project_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Run the development server:**
    ```bash
    npm run dev
    ```

## 🗄️ Database Setup

This project uses Supabase. You can find the SQL migrations in the `supabase/migrations` folder. To set up your local or remote database:

1.  Ensure you have the Supabase CLI installed.
2.  Link your project:
    ```bash
    supabase link --project-ref your-project-id
    ```
3.  Apply migrations:
    ```bash
    supabase db push
    ```

## 🧪 Testing

We use Vitest for testing. To run the test suite:

```bash
npm test
# or
npm run test:watch
```

## 📂 Project Structure

```
src/
├── assets/          # Static assets
├── components/      # Reusable UI components
│   ├── accommodations/
│   ├── checklist/
│   ├── dashboard/
│   ├── expenses/    # Expense tracking logic
│   ├── itinerary/   # Timeline and activity components
│   ├── ui/          # Shadcn UI primitives
│   └── ...
├── hooks/           # Custom React hooks (useAuth, useExpenses, etc.)
├── integrations/    # External service configurations (Supabase)
├── pages/           # Application routes/screens
├── lib/             # Utility functions
└── utils/           # Helper scripts (PDF export, etc.)
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.