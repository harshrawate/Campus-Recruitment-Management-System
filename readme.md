# 🎓 Campus Recruitment Management System (CRMS)

![License](https://img.shields.io/badge/License-MIT-blue.svg)
![React](https://img.shields.io/badge/Frontend-React%20%2B%20Vite-61DAFB?logo=react)
![Node](https://img.shields.io/badge/Backend-Node.js%20%2B%20Express-339933?logo=nodedotjs)
![Python](https://img.shields.io/badge/AI-Python%20%2B%20FastAPI-3776AB?logo=python)

A full-stack, AI-driven web application designed to streamline the campus placement process for students, faculty, and administrators. It features a modern web portal for managing recruitment drives alongside an intelligent AI analytics dashboard that predicts placement probabilities and offers career recommendations.

---

## ✨ Key Features

- **🧑‍🎓 Role-Based Dashboards:** Dedicated portals for Students, Faculty, and Admins.
- **📊 AI Placement Prediction:** Uses an XGBoost Machine Learning model to predict placement probabilities based on academic metrics, skills, and projects.
- **📈 Advanced Analytics:** Visual radar charts and company-fit matching for top MNCs (Amazon, Google, Microsoft, etc.).
- **🔐 Secure Authentication:** JWT-based authentication with bcrypt password hashing.
- **📄 Report Generation:** Generate and download PDF resumes and Excel data reports.
- **📧 Automated Notifications:** Email integrations via Nodemailer to keep students updated on upcoming drives and results.

---

## 🏗️ Architecture & Tech Stack

The project is divided into three main microservices:

### 1. Client (`/client`)
A high-performance frontend SPA built for an exceptional user experience.
- **Framework:** React 19 + Vite
- **Styling:** Tailwind CSS + Headless UI + Framer Motion
- **State Management:** Redux Toolkit + React Query
- **Charts:** Chart.js + Recharts

### 2. Server (`/server`)
A robust, scalable backend handling business logic and data persistence.
- **Runtime:** Node.js + Express
- **Database:** MongoDB (Mongoose) + Redis (for caching)
- **File Storage:** AWS SDK (S3) + Multer
- **Auth & Security:** JWT + bcryptjs

### 3. AI Analytics App (`/Placement_app`)
A Python-powered AI engine for predictive modeling.
- **Model:** XGBoost (`joblib` serialized)
- **API:** FastAPI for external prediction requests.
- **Dashboard:** Streamlit for interactive data exploration and career strategy insights.
- **Data Handling:** Pandas + NumPy

---

## 🚀 Getting Started

Follow these steps to set up the project locally.

### Prerequisites
- Node.js (v18+)
- Python (v3.9+)
- MongoDB instance (local or Atlas)
- Redis server (optional, but recommended)

### 1. Backend Setup (Node.js Server)
```bash
cd server
npm install

# Create a .env file and add your MongoDB URI, JWT Secret, and AWS credentials
cp .env.example .env

# Start the development server
npm run dev
```
*The server will typically run on `http://localhost:5000`.*

### 2. Frontend Setup (React Client)
```bash
cd client
npm install

# Start the Vite development server
npm run dev
```
*The client will be accessible at `http://localhost:5173`.*

### 3. AI Analytics Setup (Python/FastAPI & Streamlit)
```bash
cd Placement_app

# Create a virtual environment
python -m venv venv
source venv/bin/activate  # On Windows use: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# To run the Streamlit Dashboard:
streamlit run app.py

# To run the FastAPI prediction endpoint:
uvicorn api:app --reload --port 8000
```
*Streamlit runs on `http://localhost:8501`. FastAPI runs on `http://localhost:8000`.*

---

## 📂 Project Structure

```text
Campus-Recruitment-Management-System/
├── client/                 # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Application views
│   │   ├── redux/          # State management slices
│   │   ├── routes/         # React Router configurations
│   │   └── utils/          # Helper functions
├── server/                 # Node.js Backend
│   ├── controller/         # Request handlers
│   ├── middleware/         # Auth and validation guards
│   ├── models/             # Mongoose DB schemas
│   ├── routes/             # API route definitions (admin, faculty, student)
│   └── services/           # Business logic (emails, excel gen)
└── Placement_app/          # AI Microservice
    ├── app.py              # Streamlit Interactive Dashboard
    ├── api.py              # FastAPI Inference Server
    ├── build_model.py      # Script to train the XGBoost model
    └── *.csv / *.joblib    # Datasets and trained model binaries
```

---

## 🤝 Contributing

Contributions are welcome! If you'd like to improve the system, please fork the repository, make your changes, and submit a pull request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---


