import { useEffect, useState } from "react";
import { getHistoryData } from "../services/api";

function History() {
  const [history, setHistory] = useState([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const email = localStorage.getItem("email");

        if (!email) return;

        const result = await getHistoryData(email);
        setHistory(result);
      } catch (error) {
        console.log(error);
      }
    };

    loadHistory();
  }, []);

  const filteredHistory = history.filter((item) =>
    String(item.created_at)
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  return (
    <div className="history-container">
      <h1 className="history-title">
        Interview History
      </h1>

      <input
        className="input-box"
        placeholder="Search by date..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        style={{
          maxWidth: "400px",
          marginBottom: "20px",
        }}
      />

      <table className="history-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>ATS Score</th>
            <th>Interview Score</th>
            <th>Result</th>
          </tr>
        </thead>

        <tbody>
          {filteredHistory.length > 0 ? (
            filteredHistory.map((item, index) => (
              <tr key={index}>
                <td>{item.created_at}</td>
                <td>{item.ats_score}</td>
                <td>{item.interview_score}</td>
                <td>
                  {item.interview_score >= 70
                    ? "✅ Pass"
                    : "❌ Fail"}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">
                No Interview History Found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default History;