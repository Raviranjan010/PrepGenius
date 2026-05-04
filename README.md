<div align="center">
  <img src="public/svg/logo.svg" alt="PrepGenius Logo" width="120" />

  # 💼 PrepGenius
  
  **The Ultimate AI-Powered Tech Interview SaaS**

  [![React](https://img.shields.io/badge/React-18-blue.svg)](https://reactjs.org/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue.svg)](https://www.typescriptlang.org/)
  [![Firebase](https://img.shields.io/badge/Firebase-v11-orange.svg)](https://firebase.google.com/)
  [![Gemini](https://img.shields.io/badge/Google%20Gemini-AI-purple.svg)](https://deepmind.google/technologies/gemini/)
</div>

<br />

**PrepGenius** is a hardcore, production-ready SaaS platform engineered to help software engineers and tech professionals dominate their interviews. Moving beyond generic Q&A, PrepGenius delivers hyper-personalized, immersive interview simulations that adapt to your resume and the exact job description you are targeting.

---

## 🔥 Killer Features

### 💻 Integrated Live Coding Environment
For Software Engineering roles, verbal Q&A is not enough. PrepGenius features a split-screen interface powered by the **Monaco Editor** (the engine behind VS Code). You write code to solve algorithmic challenges in real-time while the AI proctor observes, evaluates time/space complexity, and asks follow-up optimization questions.

### 🧠 Hyper-Personalization via Resume & JD Parsing
Generic questions are useless. Upload your PDF Resume and paste your Target Job Description (JD). Our AI extraction pipeline analyzes the delta between your experience and the JD to generate deeply targeted, probing questions. 

### 📐 Interactive System Design Whiteboard
System design is often the hardest round to mock. PrepGenius provides an interactive whiteboard where you can map out architectures (Load Balancers, Microservices, Databases). The AI evaluates your diagram for bottlenecks, single points of failure, and scalability.

### 🎮 Gamification, Heatmaps, & Streaks
Stay addicted to your preparation. PrepGenius features GitHub-style contribution heatmaps for "Days Interviewed," dynamic streak tracking, and unlockable achievement badges.

### 🎙️ AI Video & Communication Analysis (Simulated)
Experience a realistic interview flow with strict timelines, real-time voice synthesis, and post-interview debriefs comparing your responses to ideal STAR-method answers.

---

## 🛠️ Tech Stack

- **Frontend:** React.js, TypeScript, Vite
- **Styling:** TailwindCSS, Shadcn UI, custom Glassmorphism/Dark Theme Engine
- **Auth:** Clerk (Enterprise-grade OAuth & SSO)
- **Database & Hosting:** Firebase Firestore
- **AI Engine:** Google Gemini AI (Advanced Contextual Prompting)
- **Code Editor:** Monaco Editor
- **Analytics:** Recharts for Gamification Data Visualization

---

## 🚀 Getting Started

### Prerequisites
Make sure you have `Node.js` and `pnpm` installed.

### 1. Clone & Install
```bash
git clone https://github.com/your-username/PrepGenius.git
cd PrepGenius
pnpm install
```

### 2. Environment Variables
Create a `.env` file at the root of the project:
```env
VITE_CLERK_PUBLISHABLE_KEY=your_clerk_key
VITE_FIREBASE_API_KEY=your_firebase_key
VITE_GEMINI_API_KEY=your_gemini_api_key
```

### 3. Run the Development Server
```bash
pnpm run dev
```

---

## 🎨 Design Philosophy

PrepGenius uses a **high-contrast, utilitarian dark aesthetic** designed specifically for developers. 
- **Onyx & Emerald Theme:** Focused, terminal-inspired color palette.
- **Glassmorphism:** Subtle blur effects and depth without sacrificing performance or readability.
- **Micro-Animations:** Fluid interactions that make the platform feel alive and responsive.

---

## 🛡️ License

This project is licensed under the MIT License.
