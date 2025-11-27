import { useState } from "react";
import JobCreator from "./components/JobCreator";
import JobStatus from "./components/JobStatus";
import ScenePlayer from "./components/ScenePlayer";

export default function App() {
  const [jobId, setJobId] = useState(null);
  const [ready, setReady] = useState(false);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Forge Animation Platform</h1>

      {!jobId && (
        <JobCreator onJobCreated={(id) => setJobId(id)} />
      )}

      {jobId && !ready && (
        <JobStatus jobId={jobId} onCompleted={() => setReady(true)} />
      )}

      {ready && (
        <ScenePlayer jobId={jobId} />
      )}
    </div>
  );
}
