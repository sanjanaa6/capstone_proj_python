import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Send, Clock, ChevronRight, ChevronLeft, Volume2, VolumeX } from 'lucide-react';

const InterviewScreen = ({ 
  currentQuestion, 
  questionNumber, 
  totalQuestions, 
  onSubmitAnswer, 
  onNextQuestion, 
  onPreviousQuestion,
  isReviewMode = false 
}) => {
  const [answer, setAnswer] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState('');
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [isTtsEnabled, setIsTtsEnabled] = useState(true);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);
  const finalTranscriptRef = useRef('');
  const latestTranscriptRef = useRef('');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = window.localStorage.getItem('ttsEnabled');
      if (saved === null) return;
      setIsTtsEnabled(saved === 'true');
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('ttsEnabled', String(isTtsEnabled));
    } catch {
      // ignore
    }
    if (!isTtsEnabled && typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
  }, [isTtsEnabled]);

  const speakQuestion = (text) => {
    if (!isTtsEnabled) return;
    if (typeof window === 'undefined') return;
    if (!('speechSynthesis' in window)) return;
    if (!text || typeof text !== 'string') return;

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`Question: ${text}`);
      utterance.rate = 1;
      utterance.pitch = 1;
      utterance.volume = 1;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.error('TTS error:', e);
    }
  };

  // Timer effect
  useEffect(() => {
    let interval;
    if (isTimerRunning && !isReviewMode) {
      interval = setInterval(() => {
        setTimeElapsed(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, isReviewMode]);

  // Start timer when question loads
  useEffect(() => {
    if (!isReviewMode) {
      setTimeElapsed(0);
      setIsTimerRunning(true);
    }
  }, [currentQuestion, isReviewMode]);

  useEffect(() => {
    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.onresult = null;
          recognitionRef.current.onerror = null;
          recognitionRef.current.onend = null;
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
        recognitionRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!isReviewMode && isRecording) {
      setIsRecording(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentQuestion]);

  useEffect(() => {
    if (!isReviewMode) {
      speakQuestion(currentQuestion);
    }
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, [currentQuestion, isReviewMode, isTtsEnabled]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleSubmit = () => {
    if (answer.trim()) {
      setIsTimerRunning(false);
      onSubmitAnswer(answer, timeElapsed);
      setAnswer('');
      setTimeElapsed(0);
    }
  };

  const toggleRecording = () => {
    if (typeof window === 'undefined') return;
    setRecordingError('');

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecordingError('Speech recognition is not supported in this browser.');
      return;
    }

    if (isRecording) {
      setIsRecording(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setAnswer(latestTranscriptRef.current || finalTranscriptRef.current || answer);
      return;
    }

    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    finalTranscriptRef.current = '';
    latestTranscriptRef.current = '';
    recognitionRef.current = recognition;
    setIsRecording(true);

    recognition.onresult = (event) => {
      let interim = '';
      for (let i = event.resultIndex; i < event.results.length; i += 1) {
        const res = event.results[i];
        const text = res && res[0] && res[0].transcript ? res[0].transcript : '';
        if (!text) continue;
        if (res.isFinal) {
          finalTranscriptRef.current += `${text} `;
        } else {
          interim += text;
        }
      }
      const combined = `${finalTranscriptRef.current}${interim}`.trim();
      latestTranscriptRef.current = combined;
      setAnswer(combined);
    };

    recognition.onerror = (e) => {
      setRecordingError(e?.error ? `Speech recognition error: ${e.error}` : 'Speech recognition error');
      setIsRecording(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setAnswer(latestTranscriptRef.current || finalTranscriptRef.current || answer);
      setIsRecording(false);
      recognitionRef.current = null;
    };

    try {
      recognition.start();
    } catch (e) {
      setRecordingError('Unable to start recording. Please try again.');
      setIsRecording(false);
      recognitionRef.current = null;
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="screen">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="screen-inner"
      >
        {/* Progress bar and question counter */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-gray-600">
              <span className="font-medium">Question {questionNumber} of {totalQuestions}</span>
              <div className="flex items-center gap-1 text-sm">
                <Clock className="w-4 h-4" />
                <span>{formatTime(timeElapsed)}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsTtsEnabled((v) => !v)}
                className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 transition-colors"
                type="button"
                aria-label={isTtsEnabled ? 'Disable question announcements' : 'Enable question announcements'}
              >
                {isTtsEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
              {!isReviewMode && (
                <div className="flex gap-2">
                  <button
                    onClick={onPreviousQuestion}
                    disabled={questionNumber === 1}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={onNextQuestion}
                    disabled={questionNumber === totalQuestions}
                    className="p-2 rounded-lg bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* Progress bar */}
          <div className="w-full" style={{ background: '#e5e7eb', borderRadius: 9999, height: 8 }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
              transition={{ duration: 0.5 }}
              style={{ background: '#2563eb', height: 8, borderRadius: 9999 }}
            />
          </div>
        </div>

        {/* Question card */}
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
          className="card mb-6"
        >
          <div className="flex items-start gap-3 mb-4">
            <div style={{ width: 32, height: 32, borderRadius: 9999, background: 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#2563eb', fontWeight: 600, fontSize: 14 }}>
              {questionNumber}
            </div>
            <div className="flex-1">
              <h2 className="text-xl md:text-2xl font-semibold text-gray-800 mb-2">
                {currentQuestion}
              </h2>
              <div className="flex flex-wrap gap-2">
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  Technical
                </span>
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                  Medium
                </span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Answer input area */}
        {!isReviewMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
            className="card"
          >
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Answer
              </label>
              <textarea
                ref={textareaRef}
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type your answer here... (Ctrl+Enter to submit)"
                className="input-field"
                style={{ minHeight: 120, resize: 'none' }}
                disabled={isRecording}
              />
              <div className="flex items-center justify-between mt-2">
                <span className="text-sm text-gray-500">
                  {answer.length} characters • Press Ctrl+Enter to submit
                </span>
                <div className="flex items-center gap-2">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={toggleRecording}
                    className={`rounded-full ${
                      isRecording 
                        ? ''
                        : ''
                    }`}
                    style={{
                      padding: 12,
                      border: 'none',
                      cursor: 'pointer',
                      background: isRecording ? '#ef4444' : '#f3f4f6',
                      color: isRecording ? 'white' : '#4b5563',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleSubmit}
                    disabled={!answer.trim()}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    Submit Answer
                  </motion.button>
                </div>
              </div>
            </div>

            {/* Voice recording indicator */}
            <AnimatePresence>
              {isRecording && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-red-50 border border-red-200 rounded-lg p-3"
                >
                  <div className="flex items-center gap-2 text-red-600">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">Recording... Click the mic button to stop</span>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <AnimatePresence>
              {!!recordingError && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mt-3"
                >
                  <div className="text-yellow-800 text-sm font-medium">{recordingError}</div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* Review mode display */}
        {isReviewMode && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="card bg-gray-50"
          >
            <p className="text-gray-600 italic">
              Answer submitted • Time taken: {formatTime(timeElapsed)}
            </p>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default InterviewScreen;
