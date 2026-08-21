# AI Mock Interview Platform

An AI-powered mock interview application designed to help candidates practice interviews, receive structured feedback, and improve their performance.

## Features

* Full interview question prompts
* Candidate response collection
* AI-generated scoring and evaluation
* STAR feedback analysis
* Strengths and improvement suggestions
* Interview review and final summary
* Job description setup
* Candidate profile management
* Interview analytics
* Login and authentication screens

## Project Structure

```text
Ai_MOCK/
│
├── app/
│
├── frontend/
│   ├── public/
│   └── src/
│       ├── assets/
│       ├── components/
│       │   ├── layout/
│       │   └── screens/
│       │       ├── ChatbotScreen.jsx
│       │       ├── DashboardOverviewScreen.jsx
│       │       ├── FinalSummaryScreen.jsx
│       │       ├── InterviewScreen.jsx
│       │       ├── JobDescriptionSetupScreen.jsx
│       │       ├── LandingScreen.jsx
│       │       ├── LoginScreen.jsx
│       │       ├── ProfileScreen.jsx
│       │       ├── ReviewScreen.jsx
│       │       ├── RLAnalyticsScreen.jsx
│       │       └── SettingsScreen.jsx
│       │
│       ├── api.js
│       ├── App.css
│       ├── App.jsx
│       ├── index.css
│       └── main.jsx
│
├── .env
└── .gitignore
```

## Main Screens

### Landing Screen

The entry point of the application where users can begin the interview process or navigate to job setup.

### Job Description Setup

Allows the user to provide or paste job-related information that can be used to customize the interview.

### Interview Screen

Displays interview questions and provides an interface for the candidate to submit responses.

### Final Summary

Shows the overall interview result, including:

* Full question prompt
* Candidate response
* AI score
* STAR feedback analysis
* Strengths
* Areas for improvement

### Review Screen

Allows the candidate to review previous interview responses and feedback.

### Dashboard

Provides an overview of interview activity and performance.

### Analytics

Displays performance insights and analytics to help track improvement.

### Profile and Settings

Allows users to manage their account information and application preferences.

## Technologies Used

* React
* JavaScript
* JSX
* CSS
* Node.js
* Environment variables using `.env`

## Getting Started

### 1. Navigate to the frontend folder

```bash
cd frontend
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Create or update the `.env` file with the required environment variables.

Example:

```env
VITE_API_URL=http://127.0.0.1:8000
```

### 4. Start the development server

```bash
npm run dev
```

The frontend will then be available at the local URL displayed in the terminal, typically:

```text
http://localhost:5173
```

## Backend

The application communicates with a backend API server. Make sure the backend server is running before starting an interview session.

The frontend API configuration is managed through:

```text
frontend/src/api.js
```

## Application Flow

```text
Landing Screen
      ↓
Job Description Setup
      ↓
Interview Session
      ↓
Candidate Responses
      ↓
AI Evaluation
      ↓
Score + STAR Analysis
      ↓
Final Summary and Feedback
```

## AI Evaluation

The platform evaluates candidate responses and provides feedback based on factors such as:

* Relevance to the question
* Quality and clarity of the response
* Overall response score
* STAR method structure
* Candidate strengths
* Areas requiring improvement

## STAR Method

The feedback system can evaluate responses using the STAR framework:

* **S — Situation:** Explain the context.
* **T — Task:** Describe the responsibility or challenge.
* **A — Action:** Explain the actions taken.
* **R — Result:** Describe the outcome or achievement.

## Future Improvements

* Real-time voice interviews
* Speech-to-text support
* Multiple interview categories
* More advanced analytics
* Interview history
* Downloadable interview reports
* Personalized AI coaching
* Performance comparison across multiple interviews

## License

This project is intended for educational and development purposes.
