from database import conn, cursor
from pydantic import BaseModel

from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware

import pdfplumber
import tempfile

app = FastAPI()


class User(BaseModel):
    name: str = ""
    email: str
    password: str


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


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
            "message": "Login Success"
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

        temp_file.write(
            await file.read()
        )

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

    if "html" in resume_lower:
        questions.append(
            "What is Semantic HTML?"
        )

    if "css" in resume_lower:
        questions.append(
            "Difference between Flexbox and Grid?"
        )

    if "javascript" in resume_lower:
        questions.append(
            "What are closures in JavaScript?"
        )

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