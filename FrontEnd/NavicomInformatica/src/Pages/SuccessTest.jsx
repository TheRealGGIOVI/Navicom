import React, { useState } from "react";
import "./styles/Module.SuccessTest.css";

export default function SuccessTest() {
  const [sessionId, setSessionId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleClick = async () => {
    if (!sessionId.trim()) {
      alert("Introduce un session_id");
      return;
    }
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch(`http://52.54.146.10:7069/api/checkout/success?sessionId=${sessionId}`);
      if (!res.ok) throw new Error(res.statusText);
      const json = await res.json();
      setResult(json);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="test-container">
      <h1 className="test-title">✅ Test Checkout Success</h1>
      <div className="test-form">
        <input
          type="text"
          className="test-input"
          placeholder="cs_test_xxx…"
          value={sessionId}
          onChange={e => setSessionId(e.target.value)}
        />
        <button
          className="test-button"
          onClick={handleClick}
          disabled={loading}
        >
          {loading ? "Cargando…" : "Probar"}
        </button>
      </div>

      {error && <p className="test-error">Error: {error}</p>}

      {result && (
        <pre className="test-output">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
