import React, { useState } from "react";
import { Plus, Trash2, Shield, HelpCircle } from "lucide-react";

const ApprovalQuestions = ({ 
  questions = [], 
  onQuestionsChange, 
  disabled = false 
}) => {
  const [newQuestion, setNewQuestion] = useState("");

  const addQuestion = () => {
    if (newQuestion.trim() && questions.length < 5) {
      // Convert to backend format: { question: string, required: boolean }
      const formattedQuestion = {
        question: newQuestion.trim(),
        required: true
      };
      
      const updatedQuestions = [...questions, formattedQuestion];
      onQuestionsChange(updatedQuestions);
      setNewQuestion("");
    }
  };

  const removeQuestion = (index) => {
    const updatedQuestions = questions.filter((_, i) => i !== index);
    onQuestionsChange(updatedQuestions);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addQuestion();
    }
  };

  // Helper to get question text for display
  const getQuestionText = (question) => {
    if (typeof question === 'string') return question;
    if (typeof question === 'object' && question.question) {
      return question.question;
    }
    return String(question);
  };

  return (
    <div className="mt-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
      <div className="flex items-center gap-2 mb-3">
        <Shield className="h-4 w-4 text-orange-600" />
        <h4 className="font-medium text-orange-900">Registration Questions</h4>
      </div>

      <p className="text-sm text-orange-700 mb-3">
        Ask questions to help you decide which attendees to approve. These will
        be shown during registration.
      </p>

      <div className="space-y-3">
        <div className="flex gap-2">
          <input
            type="text"
            value={newQuestion}
            onChange={(e) => setNewQuestion(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={disabled || questions.length >= 5}
            className="flex-1 px-3 py-2 border border-orange-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent disabled:opacity-50 text-sm"
            placeholder="e.g., Why do you want to attend this event?"
          />
          <button
            type="button"
            onClick={addQuestion}
            disabled={disabled || !newQuestion.trim() || questions.length >= 5}
            className="px-3 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-50 flex items-center gap-1 text-sm"
          >
            <Plus className="h-4 w-4" />
            Add
          </button>
        </div>

        {questions.length > 0 && (
          <div className="space-y-2">
            {questions.map((question, index) => (
              <div
                key={index}
                className="flex items-center justify-between bg-white px-3 py-2 rounded-lg border border-orange-200"
              >
                <div className="flex items-center gap-2">
                  <HelpCircle className="h-4 w-4 text-orange-500" />
                  <span className="text-sm text-orange-900">
                    {getQuestionText(question)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => removeQuestion(index)}
                  disabled={disabled}
                  className="text-orange-500 hover:text-orange-700 disabled:opacity-50"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex items-center gap-2 text-xs text-orange-600">
          <Shield className="h-3 w-3" />
          <span>{questions.length}/5 questions added</span>
        </div>

        <div className="bg-white p-3 rounded border border-orange-200">
          <p className="text-xs text-orange-800 font-medium mb-1">
            How approval works:
          </p>
          <ul className="text-xs text-orange-700 space-y-1 list-disc list-inside">
            <li>Attendees answer these questions during registration</li>
            <li>You review their answers in your organizer dashboard</li>
            <li>
              Based on their responses, you approve or reject their registration
            </li>
            <li>Approved attendees receive tickets via email</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default ApprovalQuestions;