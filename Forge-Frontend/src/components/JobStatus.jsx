import { useEffect, useState } from "react";
import { api } from "../api/backend";

export default function JobStatus({ jobId, onCompleted }) {
  const [status, setStatus] = useState("checking...");
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    if (!jobId) return;

    const interval = setInterval(async () => {
      const res = await api.get(`/api/animations/${jobId}`);

      setStatus(res.data.status);
      setProgress(res.data.progress);

      if (res.data.status === "completed") {
        clearInterval(interval);
        onCompleted(jobId);
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [jobId]);

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", marginBottom: "20px" }}>
      <h2>Job Status</h2>

      <p>Job ID: {jobId}</p>
      <p>Status: {status}</p>
      <p>Progress: {progress}%</p>
    </div>
  );
}
