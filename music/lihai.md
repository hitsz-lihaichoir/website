# 🎵 荔海 (团歌)

<div class="score-workspace">
  <div class="pdf-section">
    <iframe src="/website/pdfs/荔海.pdf#view=FitPage" class="pdf-viewer" title="曲谱预览"></iframe>
  </div>

  <div class="audio-section">
    <h3>🎧 伴奏与声部</h3>

    <div class="audio-track">
      <span class="track-label">男低音 (Bass)</span>
      <audio controls src="/website/audio/荔海-B.mp3"></audio>
    </div>
  </div>
</div>

<style>
.score-workspace {
  display: flex;
  gap: 24px;
  align-items: flex-start;
  margin-top: 20px;
}

.pdf-section {
  flex: 7;
  height: 80vh;
  min-height: 600px;
}

.pdf-viewer {
  width: 100%;
  height: 100%;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.audio-section {
  flex: 3;
  background-color: #f8fafc;
  padding: 20px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.audio-section h3 {
  margin: 0 0 10px 0;
  font-size: 1.2rem;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 8px;
}

.audio-track {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.track-label {
  font-weight: 600;
  font-size: 0.9rem;
  color: #334155;
}

.audio-track audio {
  width: 100%;
  height: 36px; 
}

@media (max-width: 900px) {
  .score-workspace {
    flex-direction: column;
  }
  .pdf-section {
    width: 100%;
    height: 60vh;
  }
  .audio-section {
    width: 100%;
  }
}
</style>