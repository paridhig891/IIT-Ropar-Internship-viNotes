import React, { useState, ChangeEvent } from 'react';

const WritingEditor: React.FC = () => {
  const [text, setText] = useState<string>('');
  
  // Keystroke tracking
  const [lastKeyTime, setLastKeyTime] = useState<number | null>(null);
  const [gaps, setGaps] = useState<number[]>([]);
  const [backspaceCount, setBackspaceCount] = useState(0);
  const [pasteCount, setPasteCount] = useState(0);
  
  // UI states
  const [showReport, setShowReport] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const charCount = text.length;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const currentTime = Date.now();

    if (lastKeyTime !== null) {
      const gap = currentTime - lastKeyTime;
      setGaps(prev => [...prev, gap]);
    }

    setLastKeyTime(currentTime);

    if (e.key === "Backspace") {
      setBackspaceCount(prev => prev + 1);
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    setPasteCount(prev => prev + 1);
  };

  const wordCount = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const totalKeystrokes = gaps.length;

  // Authenticity Score Logic
  let score = 100;
  const warnings: string[] = [];

  if (pasteCount > 0) {
    score -= 40;
    warnings.push("⚠️ Pasted content detected");
  }
  if (backspaceCount < 2) {
    score -= 20;
    warnings.push("⚠️ Low editing behavior");
  }

  const averageGap = gaps.length > 0 
    ? gaps.reduce((a, b) => a + b, 0) / gaps.length 
    : 0;

  if (averageGap < 50) {
    score -= 20;
    warnings.push("⚠️ Unnaturally fast typing");
  }

  const status = score >= 80 ? 'Likely Human' : 'Suspicious';
  const statusColor = score >= 80 ? '#10b981' : '#ef4444';

  const handleGenerateReport = async () => {
    setShowReport(true);
    setIsSaving(true);
    setSaveMessage(null);
    try {
      const res = await fetch('https://vinotes-l6kf.onrender.com/save-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionData: { wordCount, totalKeystrokes, backspaceCount, pasteCount, score, status } })
      });
      if (res.ok) setSaveMessage('✅ Session saved successfully!');
      else setSaveMessage('❌ Failed to save session.');
    } catch (err) {
      setSaveMessage('❌ Error connecting to server.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <style>{`
        * {
          box-sizing: border-box;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        }
        
        body {
          margin: 0;
          padding: 0;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
        }

        .editor-container {
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 2rem;
        }

        .glass-card {
          width: 100%;
          max-width: 700px;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.4);
          border-radius: 24px;
          padding: 2.5rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }

        .header-title {
          text-align: center;
          margin: 0;
          color: #1e293b;
          font-size: 28px;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .header-subtitle {
          text-align: center;
          color: #64748b;
          font-size: 15px;
          margin: 8px 0 24px 0;
          font-weight: 500;
        }

        .textarea-wrapper {
          position: relative;
          margin-bottom: 24px;
        }

        .modern-textarea {
          width: 100%;
          padding: 1.25rem;
          border-radius: 16px;
          border: 2px solid #e2e8f0;
          background: rgba(255, 255, 255, 0.9);
          font-size: 16px;
          line-height: 1.6;
          color: #334155;
          outline: none;
          resize: vertical;
          transition: all 0.3s ease;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.02);
        }

        .modern-textarea:focus {
          border-color: #8b5cf6;
          box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.15), inset 0 2px 4px rgba(0,0,0,0.02);
          background: #ffffff;
        }

        .modern-textarea::placeholder {
          color: #94a3b8;
        }

        .stats-row {
          display: flex;
          justify-content: space-between;
          margin-top: 10px;
          font-size: 13px;
          color: #64748b;
          font-weight: 500;
          padding: 0 4px;
        }

        .btn-generate {
          width: 100%;
          padding: 16px;
          background: linear-gradient(135deg, #6366f1 0%, #a855f7 100%);
          color: white;
          border: none;
          border-radius: 14px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
        }

        .btn-generate:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4);
          filter: brightness(1.05);
        }

        .btn-generate:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-generate:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          filter: grayscale(0.2);
        }

        .report-section {
          animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          margin-top: 24px;
          padding: 24px;
          background: rgba(255, 255, 255, 0.95);
          border-radius: 16px;
          border: 1px solid #e2e8f0;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .report-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
          margin-bottom: 24px;
        }

        .stat-card {
          background: #f8fafc;
          padding: 16px;
          border-radius: 12px;
          border: 1px solid #f1f5f9;
        }

        .stat-label {
          font-size: 13px;
          color: #64748b;
          margin-bottom: 6px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 20px;
          font-weight: 700;
          color: #0f172a;
        }

        .score-card {
          padding: 20px;
          background: #ffffff;
          border-radius: 12px;
          border: 2px solid #f1f5f9;
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .score-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .score-label {
          font-weight: 600;
          color: #334155;
          font-size: 15px;
        }

        .score-value {
          font-size: 28px;
          font-weight: 800;
        }

        .status-badge {
          padding: 6px 14px;
          border-radius: 20px;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.3px;
        }

        .warnings-container {
          margin-top: 20px;
          padding: 16px;
          background: #fff5f5;
          border-radius: 12px;
          border: 1px solid #fed7d7;
        }

        .warnings-title {
          margin: 0 0 12px 0;
          color: #c53030;
          font-size: 14px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .warning-item {
          color: #c53030;
          font-size: 13.5px;
          font-weight: 500;
          margin-bottom: 8px;
          display: flex;
          align-items: center;
        }
        
        .warning-item:last-child {
          margin-bottom: 0;
        }

        .save-msg {
          text-align: center;
          margin-top: 16px;
          padding: 12px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          animation: slideUp 0.3s ease;
        }
      `}</style>
      <div className="editor-container">
        <div className="glass-card">
          <h2 className="header-title">Vi Notes — Authenticity Analyzer</h2>
          <p className="header-subtitle">Analyze human vs AI writing behavior</p>

          <div className="textarea-wrapper">
            <textarea
              className="modern-textarea"
              rows={12}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={handleKeyDown}
              onPaste={handlePaste}
              placeholder="Start writing or paste your text here..."
            />
            <div className="stats-row">
              <span>{wordCount} words</span>
              <span>{charCount} characters</span>
            </div>
          </div>

          <button
            className="btn-generate"
            onClick={handleGenerateReport}
            disabled={isSaving}
          >
            {isSaving ? "Saving Session..." : "Generate Report"}
          </button>

          {saveMessage && (
            <div className={`save-msg`} style={{
              background: saveMessage.includes('✅') ? '#ecfdf5' : '#fef2f2',
              color: saveMessage.includes('✅') ? '#059669' : '#dc2626',
              border: `1px solid ${saveMessage.includes('✅') ? '#a7f3d0' : '#fecaca'}`
            }}>
              {saveMessage}
            </div>
          )}

          {showReport && (
            <div className="report-section">
              <h3 style={{ margin: "0 0 20px 0", color: "#0f172a", fontSize: "20px", fontWeight: "700" }}>
                Analysis Report
              </h3>
              
              <div className="report-grid">
                <div className="stat-card">
                  <div className="stat-label">Word Count</div>
                  <div className="stat-value">{wordCount}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Total Keystrokes</div>
                  <div className="stat-value">{totalKeystrokes}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Backspace Count</div>
                  <div className="stat-value">{backspaceCount}</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Paste Count</div>
                  <div className="stat-value">{pasteCount}</div>
                </div>
              </div>

              <div className="score-card" style={{ borderColor: `${statusColor}30` }}>
                <div className="score-row">
                  <span className="score-label">Authenticity Score</span>
                  <span className="score-value" style={{ color: statusColor }}>
                    {score}%
                  </span>
                </div>
                <div className="score-row">
                  <span className="score-label">Status</span>
                  <span className="status-badge" style={{ 
                    background: `${statusColor}15`,
                    color: statusColor,
                  }}>
                    {status}
                  </span>
                </div>
              </div>

              {warnings.length > 0 && (
                <div className="warnings-container">
                  <h4 className="warnings-title">
                    Behavior Warnings
                  </h4>
                  <div>
                    {warnings.map((warning, idx) => (
                      <div key={idx} className="warning-item">
                        {warning}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default WritingEditor;
