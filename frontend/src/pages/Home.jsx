import { useState, useEffect } from "react";
import { uploadResume, saveInterviewResult } from "../services/api";

function Home() {
  const [file, setFile] = useState(null);
  const [resumeText, setResumeText] = useState("");
  const [atsScore, setAtsScore] = useState(0);
  const [skills, setSkills] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [interviewStarted, setInterviewStarted] = useState(false);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answer, setAnswer] = useState("");
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);

  const SpeechRecognition =
    window.SpeechRecognition || window.webkitSpeechRecognition;

  const [recognition] = useState(() => {
    if (!SpeechRecognition) return null;

    const recog = new SpeechRecognition();
    recog.continuous = false;
    recog.lang = "en-US";

    return recog;
  });

  useEffect(() => {
    if (!recognition) return;

    recognition.onresult = (event) => {
      setAnswer(event.results[0][0].transcript);
    };
  }, [recognition]);

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a resume");
      return;
    }

    try {
      const result = await uploadResume(file);

      setResumeText(result.resume_text);
      setAtsScore(result.ats_score);
      setSkills(result.skills);
      setMissingSkills(result.missing_skills);
      setQuestions(result.questions);

      alert("Resume Uploaded Successfully!");
    } catch (error) {
      console.error(error);
      alert("Upload Failed!");
    }
  };

  // AI Speaking Feature
  const speakQuestion = (text) => {
    window.speechSynthesis.cancel();

    const speech = new SpeechSynthesisUtterance(text);

    speech.lang = "en-US";
    speech.rate = 0.95;
    speech.pitch = 1;

    window.speechSynthesis.speak(speech);
  };

  const startInterview = async () => {
    if (questions.length === 0) {
      alert("Upload Resume First!");
      return;
    }

    try {
      await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });

      setInterviewStarted(true);

      // Speak the first question after a short delay
      setTimeout(() => {
        speakQuestion(questions[0]);
      }, 500);
    } catch (error) {
      alert("Camera or Microphone permission denied!");
      console.error(error);
    }
  };

  const nextQuestion = async () => {
    if (answer.trim() !== "") {
      setScore((prev) => prev + 10);
    }

    setTimeLeft(60);
    setAnswer("");

    if (currentQuestion < questions.length - 1) {
      const next = currentQuestion + 1;
      setCurrentQuestion(next);

      // Speak the next question
      setTimeout(() => {
        speakQuestion(questions[next]);
      }, 300);
    } else {
      window.speechSynthesis.cancel();

      const finalScore = score + 10;

      const email = localStorage.getItem("email");

      try {
        await saveInterviewResult(email, atsScore, finalScore);
      } catch (error) {
        console.log(error);
      }

      alert(`Interview Completed!\nScore: ${finalScore}`);

      setInterviewStarted(false);
      setCurrentQuestion(0);
      setScore(0);
    }
  };

  // Timer Effect
  useEffect(() => {
    if (!interviewStarted) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          nextQuestion();
          return 60;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [interviewStarted, currentQuestion]);

  if (interviewStarted) {
    return (
      <div className="home">
        <h1>Mock Interview</h1>

        <div
          style={{
            maxWidth: "900px",
            width: "100%",
            margin: "auto",
            background: "#111827",
            padding: "30px",
            borderRadius: "10px",
            color: "white",
          }}
        >
          <h2>
            Question {currentQuestion + 1} of {questions.length}
          </h2>

          {/* Timer Display */}
          <h3
            style={{
              color: "#60a5fa",
              marginTop: "10px",
            }}
          >
            ⏱️ Time Left: {timeLeft}s
          </h3>

          {/* Progress Bar Display */}
          <div
            style={{
              width: "100%",
              height: "12px",
              background: "#374151",
              borderRadius: "10px",
              marginTop: "15px",
            }}
          >
            <div
              style={{
                width: `${((currentQuestion + 1) / questions.length) * 100}%`,
                height: "100%",
                background: "#3b82f6",
                borderRadius: "10px",
              }}
            />
          </div>

          <h3 style={{ marginTop: "20px" }}>{questions[currentQuestion]}</h3>

          {/* Repeat Question Button */}
          <button
            className="secondary-btn"
            onClick={() => speakQuestion(questions[currentQuestion])}
            style={{
              marginTop: "15px",
              padding: "10px 20px",
              fontSize: "16px",
              marginRight: "10px",
            }}
          >
            🔊 Repeat Question
          </button>

          {/* Speak Answer Button */}
          <button
            className="secondary-btn"
            onClick={() => recognition && recognition.start()}
            style={{
              marginTop: "15px",
              padding: "10px 20px",
              fontSize: "16px",
            }}
          >
            🎤 Speak Answer
          </button>

          <textarea
            rows="8"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            style={{
              width: "100%",
              marginTop: "20px",
              padding: "10px",
            }}
          />

          <button
            className="primary-btn"
            onClick={nextQuestion}
            style={{ marginTop: "20px" }}
          >
            Next Question
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="home">
      <h1>AI Interview Coach</h1>

      <p>
        Prepare smarter with AI-powered mock interviews, personalized feedback,
        resume-based questions, and detailed performance reports.
      </p>

      <input
        type="file"
        accept=".pdf"
        onChange={(e) => setFile(e.target.files[0])}
      />

      <div className="buttons">
        <button className="primary-btn" onClick={handleUpload}>
          Upload Resume
        </button>

        <button className="secondary-btn" onClick={startInterview}>
          Start Interview
        </button>
      </div>

      {atsScore > 0 && (
        <div className="resume-card">
          <h2>ATS Score</h2>
          <h1>{atsScore}/100</h1>

          <h3>Skills Found</h3>
          <ul>
            {skills.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>

          <h3>Missing Skills</h3>
          <ul>
            {missingSkills.map((skill, index) => (
              <li key={index}>{skill}</li>
            ))}
          </ul>

          <h3>Resume Text</h3>
          <textarea
            value={resumeText}
            readOnly
            rows="10"
            style={{
              width: "100%",
              padding: "10px",
              marginTop: "10px",
            }}
          />
        </div>
      )}
    </div>
  );
}

export default Home;