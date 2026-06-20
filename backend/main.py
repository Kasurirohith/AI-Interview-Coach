from database import conn, cursor
from pydantic import BaseModel

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

import pdfplumber
import tempfile

app = FastAPI()


# ---------------- MODELS ---------------- #

class User(BaseModel):
    name: str = ""
    email: str
    password: str

class InterviewResult(BaseModel):
    email: str
    ats_score: int
    interview_score: int

class FeedbackRequest(BaseModel):
    answer: str

class CompanyInterview(BaseModel):
    company: str



# ---------------- CORS ---------------- #

app.add_middleware(
    CORSMiddleware,
    allow_origin_regex="https://.*\.vercel\.app",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------- CREATE TABLES ---------------- #

cursor.execute("""
CREATE TABLE IF NOT EXISTS interview_history(
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT,
    ats_score INTEGER,
    interview_score INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

conn.commit()


# ---------------- HOME ---------------- #

@app.get("/")
def home():
    return {
        "message": "Backend Running Successfully"
    }


# ---------------- SIGNUP ---------------- #

@app.post("/signup")
def signup(user: User):

    try:
        cursor.execute(
            """
            INSERT INTO users(name,email,password)
            VALUES(?,?,?)
            """,
            (
                user.name,
                user.email,
                user.password
            )
        )

        conn.commit()

        return {
            "success": True,
            "message": "Signup Successful"
        }

    except Exception:
        return {
            "success": False,
            "message": "User Already Exists"
        }


# ---------------- LOGIN ---------------- #

@app.post("/login")
def login(user: User):

    cursor.execute(
        """
        SELECT * FROM users
        WHERE email=? AND password=?
        """,
        (
            user.email,
            user.password
        )
    )

    result = cursor.fetchone()

    if result:
        return {
            "success": True,
            "message": "Login Success",
            "name": result[1],
            "email": result[2]
        }

    return {
        "success": False,
        "message": "Invalid Credentials"
    }


# ---------------- RESUME UPLOAD ---------------- #

@app.post("/upload-resume")
async def upload_resume(file: UploadFile = File(...)):

    with tempfile.NamedTemporaryFile(
        delete=False,
        suffix=".pdf"
    ) as temp_file:

        temp_file.write(await file.read())
        temp_path = temp_file.name

    resume_text = ""

    with pdfplumber.open(temp_path) as pdf:

        for page in pdf.pages:

            text = page.extract_text()

            if text:
                resume_text += text + "\n"

    resume_lower = resume_text.lower()

    skills = [
        "python",
        "java",
        "sql",
        "react",
        "machine learning",
        "html",
        "css",
        "javascript",
        "power bi",
        "excel"
    ]

    detected_skills = []
    missing_skills = []

    score = 0

    for skill in skills:

        if skill in resume_lower:
            detected_skills.append(skill)
            score += 10
        else:
            missing_skills.append(skill)

    questions = []

    if "python" in resume_lower:
        questions.extend([
            "Explain OOP concepts in Python.",
            "What are decorators in Python?"
        ])

    if "java" in resume_lower:
        questions.extend([
            "What is JVM?",
            "Difference between JDK and JRE?"
        ])

    if "sql" in resume_lower:
        questions.extend([
            "What is normalization?",
            "Difference between INNER JOIN and LEFT JOIN?"
        ])

    if "react" in resume_lower:
        questions.extend([
            "What are React Hooks?",
            "Explain useState."
        ])

    if "machine learning" in resume_lower:
        questions.extend([
            "What is supervised learning?",
            "Explain overfitting."
        ])

    questions.extend([
        "Tell me about yourself.",
        "What are your strengths?",
        "Why should we hire you?",
        "Where do you see yourself in 5 years?"
    ])

    questions = questions[:10]

    return {
        "resume_text": resume_text,
        "ats_score": score,
        "skills": detected_skills,
        "missing_skills": missing_skills,
        "questions": questions
    }


# ---------------- SAVE RESULT ---------------- #

@app.post("/save-result")
def save_result(data: InterviewResult):

    cursor.execute(
        """
        INSERT INTO interview_history
        (email, ats_score, interview_score)
        VALUES (?, ?, ?)
        """,
        (
            data.email,
            data.ats_score,
            data.interview_score
        )
    )

    conn.commit()

    return {
        "success": True,
        "message": "Result Saved Successfully"
    }


# ---------------- HISTORY ---------------- #

@app.get("/history/{email}")
def get_history(email: str):

    cursor.execute(
        """
        SELECT ats_score,
               interview_score,
               created_at
        FROM interview_history
        WHERE email=?
        ORDER BY id DESC
        """,
        (email,)
    )

    rows = cursor.fetchall()

    history = []

    for row in rows:
        history.append({
            "ats_score": row[0],
            "interview_score": row[1],
            "created_at": row[2]
        })

    return history


# ---------------- DASHBOARD ---------------- #

@app.get("/dashboard/{email}")
def dashboard(email: str):

    cursor.execute(
        """
        SELECT COUNT(*)
        FROM interview_history
        WHERE email=?
        """,
        (email,)
    )

    total = cursor.fetchone()[0]

    cursor.execute(
        """
        SELECT MAX(interview_score)
        FROM interview_history
        WHERE email=?
        """,
        (email,)
    )

    best = cursor.fetchone()[0]

    if best is None:
        best = 0

    cursor.execute(
        """
        SELECT AVG(interview_score)
        FROM interview_history
        WHERE email=?
        """,
        (email,)
    )

    avg = cursor.fetchone()[0]

    if avg is None:
        avg = 0

    return {
        "total_interviews": total,
        "best_score": round(best),
        "average_score": round(avg)
    }


# ---------------- AI FEEDBACK ---------------- #

@app.post("/feedback")
def generate_feedback(data: FeedbackRequest):

    answer_length = len(data.answer)

    if answer_length > 200:
        feedback = "Excellent detailed answer."
        score = 9
    elif answer_length > 100:
        feedback = "Good answer. Add more examples."
        score = 7
    else:
        feedback = "Answer too short. Elaborate more."
        score = 5

    return {
        "feedback": feedback,
        "score": score
    }


# ---------------- CERTIFICATE ---------------- #

@app.get("/certificate/{email}")
def certificate(email: str):

    cursor.execute(
        """
        SELECT MAX(interview_score)
        FROM interview_history
        WHERE email=?
        """,
        (email,)
    )

    score = cursor.fetchone()[0]

    if score is None:
        score = 0

    return {
        "name": email,
        "score": score,
        "status": "Certified"
    }


# ---------------- COMPANY INTERVIEW ---------------- #

@app.get("/company/{company}")
def company_questions(company: str):

    questions = {
        "tcs": [
            "Explain OOP concepts.",
            "What is SQL?"
        ],
        "accenture": [
            "Explain DBMS.",
            "What is normalization?"
        ],
        "infosys": [
            "What is Java?",
            "Explain collections."
        ],
        "google": [
            "What is time complexity?",
            "Explain binary search."
        ]
    }

    return {
        "questions":
        questions.get(
            company.lower(),
            ["Tell me about yourself."]
        )
    }