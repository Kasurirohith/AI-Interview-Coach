import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

import { getDashboardData } from "../services/api";

function Dashboard() {
  const [stats, setStats] = useState({
    total_interviews: 0,
    best_score: 0,
    average_score: 0,
  });

  useEffect(() => {
    const loadData = async () => {
      const email = localStorage.getItem("email");

      if (!email) return;

      const result = await getDashboardData(email);
      setStats(result);
    };

    loadData();
  }, []);

  const data = [
    {
      name: "Average",
      score: stats.average_score,
    },
    {
      name: "Best",
      score: stats.best_score,
    },
  ];

  return (
    <div className="dashboard">
      <h1 className="dashboard-title">
        Dashboard
      </h1>

      <div className="stats">
        <div className="stat-card">
          <h2>{stats.total_interviews}</h2>
          <p>Total Interviews</p>
        </div>

        <div className="stat-card">
          <h2>{stats.best_score}%</h2>
          <p>Best Score</p>
        </div>

        <div className="stat-card">
          <h2>{stats.average_score}%</h2>
          <p>Average Score</p>
        </div>
      </div>

      <div
        style={{
          width: "100%",
          height: 400,
          marginTop: "40px",
        }}
      >
        <ResponsiveContainer>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />

            <Line
              type="monotone"
              dataKey="score"
              stroke="#3b82f6"
              strokeWidth={3}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default Dashboard;