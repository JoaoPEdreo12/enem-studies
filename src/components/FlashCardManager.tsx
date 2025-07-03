import React, { useState } from 'react';
import { CreditCard, Plus, Brain, RotateCcw, Trash2 } from 'lucide-react';
import type { FlashCard, Subject } from '../types';
import FlashCard from './FlashCard';
import { useSupabaseFlashcards } from '../hooks/useSupabaseFlashcards';
import { useSupabaseSubjects } from '../hooks/useSupabaseSubjects';

interface FlashCardManagerProps {
  user: any;
}

export default function FlashCardManager({ user }: FlashCardManagerProps) {
  return (
    <div>
      <h1>FlashCard Manager</h1>
    </div>
  );
}