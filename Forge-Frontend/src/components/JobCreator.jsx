import { useState } from "react";
import { api } from "../api/backend";

export default function JobCreator({ onJobCreated }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  async function handleSubmit(e) {
    e.preventDefault();
    const res = await api.post("/api/animations/generate", {
      title,
      description,
    });

    onJobCreated(res.data.jobId);
  }

  return (
    <div style={{ padding: "20px", border: "1px solid #ccc", marginBottom: "20px" }}>
      <h2>Create Animation Job</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label><br />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            style={{ width: "300px" }}
          />
        </div>

        <div style={{ marginTop: "10px" }}>
          <label>Description:</label><br />
          <textarea
            rows="3"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            style={{ width: "300px" }}
          ></textarea>
        </div>

        <button type="submit" style={{ marginTop: "10px" }}>
          Generate Animation
        </button>
      </form>
    </div>
  );
}
