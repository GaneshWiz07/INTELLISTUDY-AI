import React, { useState, useEffect } from 'react';
import type { ContentItem, QuizData } from '../../types';
import './QuizContent.css';

interface QuizContentProps {
  content: ContentItem;
}

const QuizContent: React.FC<QuizContentProps> = ({ content }) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [quizStarted, setQuizStarted] = useState(false);

  const quizData = content.content as QuizData;
  const currentQuestion = quizData.questions[currentQuestionIndex];
  const totalQuestions = quizData.questions.length;

  useEffect(() => {
    if (quizData.timeLimit && quizStarted && !showResults) {
      setTimeRemaining(quizData.timeLimit * 60); // Convert minutes to seconds
    }
  }, [quizData.timeLimit, quizStarted, showResults]);

  useEffect(() => {
    if (timeRemaining === null || timeRemaining <= 0 || showResults) return;

    const timer = setInterval(() => {
      setTimeRemaining(prev => {
        if (prev === null || prev <= 1) {
          setShowResults(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeRemaining, showResults]);

  // Fallback for when quiz data is not properly structured
  if (typeof content.content === 'string') {
    return (
      <div className="quiz-content" data-testid="quiz-content">
        <div className="quiz-placeholder">
          <div className="placeholder-icon">📝</div>
          <h3>Quiz Content</h3>
          <p>Quiz data: {content.content}</p>
          <p className="placeholder-note">
            This is a placeholder for quiz content. In a real implementation, 
            this would display interactive quiz questions.
          </p>
        </div>
        <div className="quiz-info">
          <div className="engagement-score">
            <span>Engagement Score: {content.engagementScore}/10</span>
          </div>
        </div>
      </div>
    );
  }

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...selectedAnswers];
    newAnswers[currentQuestionIndex] = answerIndex;
    setSelectedAnswers(newAnswers);
  };

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      setShowResults(true);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const calculateScore = () => {
    let correct = 0;
    quizData.questions.forEach((question, index) => {
      if (selectedAnswers[index] === question.correctAnswer) {
        correct++;
      }
    });
    return correct;
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const startQuiz = () => {
    setQuizStarted(true);
  };

  if (!quizStarted) {
    return (
      <div className="quiz-content" data-testid="quiz-content">
        <div className="quiz-intro">
          <div className="quiz-icon">📝</div>
          <h3>Ready to Start Quiz?</h3>
          <div className="quiz-details">
            <p><strong>Questions:</strong> {totalQuestions}</p>
            {quizData.timeLimit && (
              <p><strong>Time Limit:</strong> {quizData.timeLimit} minutes</p>
            )}
          </div>
          <button className="start-quiz-btn" onClick={startQuiz}>
            Start Quiz
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const score = calculateScore();
    const percentage = Math.round((score / totalQuestions) * 100);
    
    return (
      <div className="quiz-content" data-testid="quiz-content">
        <div className="quiz-results">
          <div className="results-header">
            <h3>Quiz Complete!</h3>
            <div className="score-display">
              <div className="score-circle">
                <span className="score-number">{percentage}%</span>
              </div>
              <p>You scored {score} out of {totalQuestions} questions correctly</p>
            </div>
          </div>
          
          <div className="results-breakdown">
            <h4>Question Review</h4>
            {quizData.questions.map((question, index) => {
              const userAnswer = selectedAnswers[index];
              const isCorrect = userAnswer === question.correctAnswer;
              
              return (
                <div key={question.id} className={`question-result ${isCorrect ? 'correct' : 'incorrect'}`}>
                  <div className="question-header">
                    <span className="question-number">Q{index + 1}</span>
                    <span className={`result-icon ${isCorrect ? 'correct' : 'incorrect'}`}>
                      {isCorrect ? '✅' : '❌'}
                    </span>
                  </div>
                  <p className="question-text">{question.question}</p>
                  <div className="answer-comparison">
                    <p className="user-answer">
                      <strong>Your answer:</strong> {question.options[userAnswer] || 'Not answered'}
                    </p>
                    {!isCorrect && (
                      <p className="correct-answer">
                        <strong>Correct answer:</strong> {question.options[question.correctAnswer]}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
          
          <div className="quiz-actions">
            <button 
              className="retake-btn"
              onClick={() => {
                setCurrentQuestionIndex(0);
                setSelectedAnswers([]);
                setShowResults(false);
                setQuizStarted(false);
                setTimeRemaining(null);
              }}
            >
              Retake Quiz
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="quiz-content" data-testid="quiz-content">
      <div className="quiz-header">
        <div className="quiz-progress">
          <span className="question-counter">
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
          <div className="progress-bar">
            <div 
              className="progress-fill" 
              style={{ width: `${((currentQuestionIndex + 1) / totalQuestions) * 100}%` }}
            />
          </div>
        </div>
        
        {timeRemaining !== null && (
          <div className={`timer ${timeRemaining < 60 ? 'warning' : ''}`}>
            ⏰ {formatTime(timeRemaining)}
          </div>
        )}
      </div>
      
      <div className="question-container">
        <h3 className="question-text">{currentQuestion.question}</h3>
        
        <div className="options-container">
          {currentQuestion.options.map((option, index) => (
            <button
              key={index}
              className={`option-button ${selectedAnswers[currentQuestionIndex] === index ? 'selected' : ''}`}
              onClick={() => handleAnswerSelect(index)}
            >
              <span className="option-letter">{String.fromCharCode(65 + index)}</span>
              <span className="option-text">{option}</span>
            </button>
          ))}
        </div>
      </div>
      
      <div className="quiz-navigation">
        <button 
          className="nav-button prev"
          onClick={handlePrevious}
          disabled={currentQuestionIndex === 0}
        >
          ← Previous
        </button>
        
        <button 
          className="nav-button next"
          onClick={handleNext}
          disabled={selectedAnswers[currentQuestionIndex] === undefined}
        >
          {currentQuestionIndex === totalQuestions - 1 ? 'Finish Quiz' : 'Next →'}
        </button>
      </div>
    </div>
  );
};

export default QuizContent;

