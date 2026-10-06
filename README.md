# AL-ZUBDAH — AI-Powered Arabic Research Assistant

AL-ZUBDAH is an AI-powered research platform designed to help researchers discover, process, understand, and develop academic research in Arabic.

The platform combines academic search, document processing, summarization, English-to-Arabic translation, AI-generated research ideas, and AI-assisted interaction in one web application.

## ✨ Key Features

* 🔎 **Academic Research Search**

  * Search for academic papers using the OpenAlex API.
  * Retrieve research metadata, abstracts, and available PDF links.
  * Filter research results based on availability and recency.

* 📄 **Research Document Processing**

  * Upload and process PDF and DOCX research documents.
  * Extract text from uploaded academic documents.
  * Process research content through the AI/NLP pipeline.

* 📝 **Research Summarization**

  * Generate English summaries from academic text.
  * Uses the `sshleifer/distilbart-cnn-12-6` summarization model.

* 🌐 **English-to-Arabic Translation**

  * Translate academic text and documents from English to Arabic.
  * Uses the `facebook/nllb-200-distilled-600M` multilingual translation model.
  * Supports translation of both summaries and full documents.

* 💡 **Research Idea Generation**

  * Generate potential research ideas using Google Gemini.
  * Uses retrieved research context to help identify research opportunities and gaps.

* 🤖 **AI Research Assistant**

  * Interactive chat functionality powered by Google Gemini.
  * Designed to assist users while working with research-related content.

* 🧠 **AI Content Detection**

  * Provides AI-generated content detection through an external ZeroGPT API integration.

* 👤 **User Authentication**

  * User registration.
  * User login.
  * Password recovery.
  * Password change.
  * Notification settings.

## 🧠 AI & NLP Pipeline

AL-ZUBDAH uses a combination of pre-trained NLP models and generative AI services.

### Summarization

The platform uses:

```text
sshleifer/distilbart-cnn-12-6
```

to generate summaries from academic text.

### Translation

The platform uses:

```text
facebook/nllb-200-distilled-600M
```

for English-to-Arabic translation.

The translation pipeline processes long documents in chunks before combining the translated content.

### Generative AI

Google Gemini is used for:

* AI-assisted chat
* Research idea generation

The current implementation uses:

```text
gemini-2.5-flash
```

### Hardware Acceleration

The NLP pipeline uses PyTorch and automatically selects:

```text
CUDA
```

when a compatible GPU is available, otherwise it falls back to:

```text
CPU
```

## 🏗️ System Architecture

The project consists of a React frontend and a Python Flask backend.

```text
┌──────────────────────────────┐
│        React Frontend        │
│                              │
│  Search • Upload • Chat      │
│  Summarization • Translation │
│  Research Ideas • AI Detector│
└──────────────┬───────────────┘
               │
               │ HTTP / REST API
               ▼
┌──────────────────────────────┐
│       Flask Backend          │
│                              │
│ Authentication               │
│ Research Processing          │
│ Document Extraction          │
│ AI/NLP Pipeline              │
│ Gemini Integration           │
│ External API Integrations    │
└───────┬───────────┬──────────┘
        │           │
        ▼           ▼
   SQLite DB    External APIs
                │
                ├── OpenAlex
                └── ZeroGPT

        ┌──────────────────────┐
        │     AI / NLP         │
        │                      │
        │ DistilBART           │
        │ NLLB-200             │
        │ Gemini               │
        │ PyTorch              │
        └──────────────────────┘
```

## 🛠️ Tech Stack

### Frontend

* React 18
* TypeScript
* Vite
* Tailwind CSS
* React Router
* React Hook Form
* Zod
* React Markdown
* TanStack React Query
* Radix UI
* Lucide React

### Backend

* Python
* Flask
* Flask-CORS
* Flask-SQLAlchemy
* SQLAlchemy
* SQLite
* python-dotenv

### AI & Machine Learning

* PyTorch
* Hugging Face Transformers
* DistilBART
* NLLB-200
* Google Gemini

### Document Processing

* PyMuPDF
* python-docx

### External APIs

* OpenAlex API
* ZeroGPT API

### Development & Testing

* ESLint
* Vitest
* Playwright
* Testing Library

## 📁 Project Structure

```text
AL-ZUBDAH/
│
├── backend/
│   ├── app.py
│   ├── text_pipeline.py
│   ├── requirements.txt
│   ├── .env.example
│   └── .gitignore
│
├── public/
│
├── src/
│   ├── components/
│   ├── pages/
│   ├── integrations/
│   └── ...
│
├── .gitignore
├── package.json
├── package-lock.json
├── vite.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

Make sure you have the following installed:

* Node.js
* npm
* Python 3
* pip
* Git

A compatible NVIDIA GPU can be used for CUDA acceleration, but the application can also run on CPU.

---

## 1. Clone the Repository

```bash
git clone https://github.com/Maysam-ai77/AL-ZUBDAH.git
cd AL-ZUBDAH
```

---

## 2. Backend Setup

Navigate to the backend directory:

```bash
cd backend
```

Create a Python virtual environment:

### Windows

```powershell
python -m venv venv
```

Activate it:

```powershell
.\venv\Scripts\Activate.ps1
```

Install the required dependencies:

```powershell
pip install -r requirements.txt
```

---

## 3. Configure Environment Variables

Create a `.env` file inside the `backend` directory.

You can use `.env.example` as a template:

```text
GEMINI_API_KEY=
SENDER_EMAIL=
APP_PASSWORD=
API_KEY=
```

Add your own credentials to the corresponding variables.

> **Important:** Never commit your `.env` file or expose API keys and passwords publicly.

The repository includes a `.gitignore` configuration that prevents the local `.env` file from being committed.

---

## 4. Start the Backend

From the `backend` directory:

```powershell
python app.py
```

The backend is configured to run locally on:

```text
http://127.0.0.1:5000
```

---

## 5. Start the Frontend

Open a new terminal and return to the project root:

```powershell
cd ..
```

Install frontend dependencies:

```powershell
npm install
```

Start the Vite development server:

```powershell
npm run dev
```

Vite will provide the local development URL in the terminal.

The frontend communicates with the Flask backend through:

```text
http://127.0.0.1:5000
```

## 🔌 API Overview

The Flask backend currently exposes endpoints for the main platform functionality.

### Authentication

```text
POST /api/register
POST /api/login
POST /api/forgot-password
POST /api/change-password
POST /api/toggle-notifications
```

### Research Processing

```text
POST /api/process
POST /api/search
POST /api/fetch-url
POST /api/upload
POST /api/translate-full-text
```

### AI Features

```text
POST /api/detect-ai
POST /api/chat
POST /api/generate-idea
```

## 🔐 Environment Variables

The backend uses environment variables for sensitive configuration.

| Variable         | Purpose                                  |
| ---------------- | ---------------------------------------- |
| `GEMINI_API_KEY` | Google Gemini API authentication         |
| `SENDER_EMAIL`   | Email account used by the application    |
| `APP_PASSWORD`   | Email application password               |
| `API_KEY`        | External AI detection API authentication |

Sensitive values are intentionally excluded from the repository.

## 📊 Project Status

AL-ZUBDAH is a functional academic research platform developed as a graduation project.

The current implementation includes:

* React frontend
* Flask backend
* User authentication
* SQLite database
* Academic research search
* PDF and DOCX processing
* Research summarization
* English-to-Arabic translation
* Full-document translation
* Gemini-powered chat
* AI-generated research ideas
* AI content detection integration

The project can be further developed with additional testing, deployment, performance optimization, and production-oriented infrastructure.

## 🔬 Research Workflow

A typical research workflow in AL-ZUBDAH can be represented as:

```text
Research Search
      ↓
Retrieve Academic Papers
      ↓
Read / Upload Research
      ↓
Extract Text
      ↓
Summarize Research
      ↓
Translate to Arabic
      ↓
Analyze Research Context
      ↓
Generate Potential Research Ideas
```

## 💻 Development

The frontend is built using a component-based React architecture, while the backend provides REST API endpoints for application functionality and AI processing.

The NLP processing pipeline is implemented separately in:

```text
backend/text_pipeline.py
```

The main Flask application and API routes are implemented in:

```text
backend/app.py
```

## 🤖 AI-Assisted Development

AI tools were used as part of the development process to assist with implementation, debugging, code generation, and problem solving.

The project was reviewed, integrated, and developed into a working application around the required research workflow and functionality.

## 📌 Future Improvements

Potential future improvements include:

* Production deployment
* Improved API configuration through environment variables
* More extensive automated testing
* User testing and usability evaluation
* Improved research recommendation and gap analysis
* Performance optimization for large documents
* More robust authentication and security
* Improved scalability of the backend
* Improved frontend/backend configuration for different environments

## 👩‍💻 Project

**AL-ZUBDAH**

AI-powered research assistant for discovering, processing, summarizing, translating, and developing academic research.

Built as an Artificial Intelligence graduation project at **Al-Zaytoonah Jordanian University**.

---

⭐ If you find the project interesting, feel free to explore the repository and follow its development.
