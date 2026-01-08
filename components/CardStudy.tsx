"use client";

import { useReducer, useEffect, useRef } from "react";
import { Card } from "@/types";

interface CardStudyProps {
  card: Card;
  onAnswer: (isCorrect: boolean) => void;
  onSubmitted?: (isSubmitted: boolean) => void;
  showAnswer?: boolean;
}

interface CardState {
  selectedChoice: string | null;
  isSubmitted: boolean;
  isCorrect: boolean | null;
  showResult: boolean;
}

type CardAction = { type: "RESET" } | { type: "SELECT"; choice: string; isCorrect: boolean };

function cardReducer(state: CardState, action: CardAction): CardState {
  switch (action.type) {
    case "RESET":
      return {
        selectedChoice: null,
        isSubmitted: false,
        isCorrect: null,
        showResult: false,
      };
    case "SELECT":
      return {
        selectedChoice: action.choice,
        isSubmitted: true,
        isCorrect: action.isCorrect,
        showResult: true,
      };
    default:
      return state;
  }
}

export default function CardStudy({ card, onAnswer, onSubmitted }: CardStudyProps) {
  const [state, dispatch] = useReducer(cardReducer, {
    selectedChoice: null,
    isSubmitted: false,
    isCorrect: null,
    showResult: false,
  });
  const prevCardIdRef = useRef<string>(card.id);

  useEffect(() => {
    // Reset state when card.id changes
    if (prevCardIdRef.current !== card.id) {
      prevCardIdRef.current = card.id;
      dispatch({ type: "RESET" });
      onSubmitted?.(false);
    }
  }, [card.id, onSubmitted]);

  const handleChoiceClick = (choiceIndex: number) => {
    if (state.isSubmitted) return;

    const choiceNumber = String(choiceIndex + 1);
    const correct = card.answer === choiceNumber;

    dispatch({ type: "SELECT", choice: choiceNumber, isCorrect: correct });
    onSubmitted?.(true);
    onAnswer(correct);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        className={`bg-white rounded-lg shadow-lg p-6 md:p-8 transition-all duration-300 ${
          state.showResult
            ? state.isCorrect
              ? "border-4 border-green-500 scale-105"
              : "border-4 border-red-500 scale-105"
            : "border-2 border-gray-200"
        }`}
      >
        {/* Question */}
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-2">{card.category}</div>
          <div className="text-lg md:text-xl font-semibold text-gray-800 whitespace-pre-wrap">
            {card.question}
          </div>
        </div>

        {/* Multiple Choice Options */}
        <div className="space-y-3 mb-6">
          {card.choices.map((choice, index) => {
            const choiceNumber = String(index + 1);
            const isSelected = state.selectedChoice === choiceNumber;
            const isCorrectAnswer = card.answer === choiceNumber;

            let buttonClass = "";
            if (state.isSubmitted) {
              if (isCorrectAnswer) {
                buttonClass = "bg-green-500 text-white border-green-600";
              } else if (isSelected && !isCorrectAnswer) {
                buttonClass = "bg-red-500 text-white border-red-600";
              } else {
                buttonClass = "bg-gray-100 text-gray-600 border-gray-300";
              }
            } else {
              buttonClass = isSelected
                ? "bg-blue-500 text-white border-blue-600"
                : "bg-white text-gray-800 border-gray-300 hover:border-blue-400 hover:bg-blue-50";
            }

            return (
              <button
                key={index}
                onClick={() => handleChoiceClick(index)}
                disabled={state.isSubmitted}
                className={`w-full text-left px-6 py-4 rounded-lg border-2 transition-all ${buttonClass} ${
                  state.isSubmitted ? "cursor-not-allowed" : "cursor-pointer"
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold ${
                      state.isSubmitted && isCorrectAnswer
                        ? "bg-green-600 text-white"
                        : state.isSubmitted && isSelected && !isCorrectAnswer
                        ? "bg-red-600 text-white"
                        : isSelected
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {index + 1}
                  </span>
                  <span className="flex-1">{choice}</span>
                  {state.isSubmitted && isCorrectAnswer && (
                    <span className="text-green-600 font-bold">✓</span>
                  )}
                  {state.isSubmitted && isSelected && !isCorrectAnswer && (
                    <span className="text-red-600 font-bold">✗</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>

        {/* Result Display */}
        {state.showResult && (
          <div
            className={`mt-6 p-4 rounded-lg ${
              state.isCorrect
                ? "bg-green-50 border border-green-200"
                : "bg-red-50 border border-red-200"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {state.isCorrect ? (
                <>
                  <span className="text-2xl">✓</span>
                  <span className="text-lg font-semibold text-green-700">정답입니다!</span>
                </>
              ) : (
                <>
                  <span className="text-2xl">✗</span>
                  <span className="text-lg font-semibold text-red-700">오답입니다</span>
                </>
              )}
            </div>
            {!state.isCorrect && (
              <div className="text-gray-700 mt-2">
                <div className="font-medium">정답: {card.answer}번</div>
                <div className="text-lg mt-1">{card.choices[parseInt(card.answer) - 1]}</div>
              </div>
            )}
            {card.explanation && (
              <div className="mt-4 pt-4 border-t border-gray-300">
                <div className="font-semibold text-gray-800 mb-2">💡 해설</div>
                <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                  {card.explanation}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
