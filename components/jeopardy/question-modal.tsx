"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import type { Question, Category } from "@/lib/types";

interface QuestionModalProps {
  question: Question;
  category: Category;
  onClose: () => void;
  onMarkPlayed: () => void;
}

export function QuestionModal({
  question,
  category,
  onClose,
  onMarkPlayed,
}: QuestionModalProps) {
  const [showAnswer, setShowAnswer] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      } else if (e.key === " " || e.key === "Enter") {
        e.preventDefault();
        if (!showAnswer) {
          setShowAnswer(true);
        } else {
          onMarkPlayed();
          onClose();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [showAnswer, onClose, onMarkPlayed]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute right-4 top-4 rounded-full p-2 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
      >
        <X className="h-8 w-8" />
      </button>

      {/* Content */}
      <div
        className="flex max-w-5xl flex-col items-center justify-center text-center"
        onClick={() => {
          if (!showAnswer) {
            setShowAnswer(true);
          } else {
            onMarkPlayed();
            onClose();
          }
        }}
      >
        {/* Category & Points */}
        <div className="mb-8 flex items-center gap-4">
          <span className="text-xl font-medium uppercase tracking-wider text-[var(--secondary)]">
            {category.name}
          </span>
          <span className="text-xl text-white/50">•</span>
          <span className="text-xl font-bold text-[var(--secondary)]">
            ${question.points}
          </span>
        </div>

        {/* Clue */}
        <div className="mb-12">
          <p className="text-4xl font-semibold uppercase leading-relaxed tracking-wide text-white md:text-5xl lg:text-6xl">
            {question.answer}
          </p>
        </div>

        {/* Answer */}
        {showAnswer ? (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
            <p className="mb-4 text-lg text-[var(--muted-foreground)]">
              Correct Response:
            </p>
            <p className="text-3xl font-medium text-[var(--secondary)] md:text-4xl">
              {question.question}
            </p>
          </div>
        ) : (
          <p className="text-lg text-white/40">
            Click or press Space to reveal answer
          </p>
        )}
      </div>

      {/* Instructions */}
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-sm text-white/30">
        Press Escape to close • Space/Enter to advance
      </div>
    </div>
  );
}
