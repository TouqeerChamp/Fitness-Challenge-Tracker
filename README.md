# Fitness Challenge Tracker

A modern, full-stack fitness challenge tracking application that helps you set, track, and achieve your fitness goals. Built with cutting-edge technologies for a seamless and responsive user experience.

![Fitness Challenge Tracker](./public/hero.png)

---

## 📋 Project Overview

Fitness Challenge Tracker is a comprehensive web application designed to help users create personal fitness challenges, track their progress in real-time, and compete on a global leaderboard. Whether you're aiming to run 100km in a month, complete 500 push-ups, or build any custom fitness habit, this app provides the tools you need to stay accountable and motivated.

---

## 🛠️ Tech Stack

| Technology | Version | Purpose |
|------------|---------|---------|
| **React** | 19 | UI framework with modern hooks and context API |
| **Vite** | 7 | Lightning-fast build tool and dev server |
| **Tailwind CSS** | v4 | Utility-first CSS framework for styling |
| **Firebase Authentication** | Latest | Secure user authentication and management |
| **Firebase Firestore** | Latest | Real-time NoSQL database for challenges and data |
| **Chart.js** | Latest | Interactive charts and data visualization |
| **React Chart.js 2** | Latest | React bindings for Chart.js |
| **Lucide React** | Latest | Beautiful, consistent icon library |
| **TypeScript** | Latest | Type-safe JavaScript development |

---

## ✨ Key Features

### 🔐 Authentication
- **Secure Sign Up / Login** – Email and password authentication powered by Firebase Auth
- **Protected Routes** – Dashboard and features accessible only to authenticated users
- **Session Persistence** – Stay logged in across browser sessions

### 📊 Challenge Management (CRUD)
- **Create Challenges** – Set custom fitness goals with title, description, target value, unit, and deadline
- **View Challenges** – Beautiful card-based layout showing all your active and completed challenges
- **Update Progress** – Add progress increments in real-time with a smooth, intuitive UI
- **Edit/Delete** – Modify or remove challenges at any time

### 📈 Real-Time Analytics
- **Progress Charts** – Visual bar chart showing completion percentage across all challenges
- **Status Distribution** – Doughnut chart displaying active, completed, and expired challenges
- **Live Updates** – All data syncs in real-time via Firebase Firestore

### 🏆 Global Leaderboard
- **Compete Globally** – See how you rank against other users worldwide
- **Sorted by Performance** – Leaderboard ranks users by completed challenges and progress
- **Real-Time Rankings** – Positions update automatically as users make progress

### 🎨 Modern UI/UX
- **Dark Theme** – Sleek midnight blue and purple gradient design
- **Responsive Design** – Perfect experience on desktop, tablet, and mobile
- **Animated Elements** – Smooth transitions, hover effects, and loading states
- **Glassmorphism Cards** – Modern frosted glass aesthetic throughout

---

## 🚀 Setup Instructions

### Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v18 or higher) – [Download here](https://nodejs.org/)
- **npm** or **yarn** – Comes with Node.js
- **Git** – [Download here](https://git-scm.com/)

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/fitness-challenge-tracker.git
cd fitness-challenge-tracker
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Firebase

1. Go to the [Firebase Console](https://console.firebase.google.com/)
2. Create a new project (or select an existing one)
3. Enable **Authentication** (Email/Password provider)
4. Enable **Firestore Database**
5. Go to **Project Settings** → **General** → **Your apps**
6. Click the **Web** icon (`</>`) and register your app
7. Copy the Firebase configuration object

### 4. Set Up Environment Variables

Create a `.env` file in the root directory:

```bash
cp .env.example .env
```

Add your Firebase credentials to `.env`:

```env
VITE_FIREBASE_API_KEY=your_api_key_here
VITE_FIREBASE_AUTH_DOMAIN=your_project_id.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project_id.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

> ⚠️ **Important:** Never commit your `.env` file to version control. It's already included in `.gitignore`.

### 5. Start the Development Server

```bash
npm run dev
```

The app will open at `http://localhost:5173` (or the next available port).

### 6. Build for Production

```bash
npm run build
```

Production files will be generated in the `dist/` folder.

### 7. Preview Production Build

```bash
npm run preview
```

---

## 📸 Screenshots

### Landing Page
![Landing Page](./public/screenshots/landing-page.png)
*Welcome page with gradient heading and call-to-action buttons*

### Login Page
![Login Page](./public/screenshots/login.png)
*Secure authentication with modern glassmorphism design*

### Dashboard Overview
![Dashboard](./public/screenshots/dashboard.png)
*Main dashboard showing stats, charts, and active challenges*

### Challenge Card
![Challenge Card](./public/screenshots/challenge-card.png)
*Individual challenge with progress tracking and update functionality*

### Leaderboard
![Leaderboard](./public/screenshots/leaderboard.png)
*Global rankings showing top performers*

### Analytics
![Analytics](./public/screenshots/analytics.png)
*Real-time charts showing progress and status distribution*

---

## 📁 Project Structure

```
fitness-challenge-tracker/
├── public/
│   ├── screenshots/          # App screenshots for README
│   └── vite.svg
├── src/
│   ├── components/           # Reusable UI components
│   │   ├── ChallengeForm.tsx
│   │   ├── Navbar.tsx
│   │   └── ProtectedRoute.tsx
│   ├── context/              # React Context providers
│   │   └── AuthContext.tsx
│   ├── firebase/             # Firebase configuration
│   │   └── config.ts
│   ├── pages/                # Page components
│   │   ├── Welcome.tsx
│   │   ├── Login.tsx
│   │   ├── Signup.tsx
│   │   ├── Dashboard.tsx
│   │   ├── Leaderboard.tsx
│   │   └── Analytics.tsx
│   ├── types/                # TypeScript type definitions
│   │   └── Challenge.ts
│   ├── App.tsx               # Main app component with routing
│   ├── index.css             # Global styles (Tailwind v4)
│   └── main.tsx              # App entry point
├── .env                      # Environment variables (not in git)
├── .env.example              # Example environment file
├── .gitignore
├── index.html
├── package.json
├── postcss.config.js
├── tsconfig.json
└── vite.config.ts
```

---

## 🎯 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with hot reload |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint for code quality |

---

## 🔒 Security Notes

- All user data is protected by Firebase Authentication
- Firestore security rules ensure users can only access their own data
- Environment variables are never exposed to the client
- HTTPS is enforced in production

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License – see the [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**  
[GitHub](https://github.com/your-username) • [Email](mailto:your.email@example.com)

---

## 🙏 Acknowledgments

- [Firebase](https://firebase.google.com/) for backend infrastructure
- [Vite](https://vitejs.dev/) for the blazing-fast build tool
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first styling
- [Chart.js](https://www.chartjs.org/) for beautiful data visualization
- [Lucide Icons](https://lucide.dev/) for the icon library

---

<div align="center">

**Made with ❤️ for fitness enthusiasts worldwide**

[Report a Bug](https://github.com/your-username/fitness-challenge-tracker/issues) • [Request a Feature](https://github.com/your-username/fitness-challenge-tracker/issues) • [Star this Repo](https://github.com/your-username/fitness-challenge-tracker/stargazers)

</div>
