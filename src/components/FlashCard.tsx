import { useState } from 'react';

interface FlashCardProps {
  front: string;
  back: string;
  subjectColor?: string;
  onFlip?: () => void;
}

const FlashCard = ({ front, back, subjectColor = '#3b82f6', onFlip }: FlashCardProps) => {
  const [flipped, setFlipped] = useState(false);

  const handleFlip = () => {
    setFlipped(f => !f);
    if (!flipped && onFlip) {
      onFlip();
    }
  };

  return (
    <div
      className={`flashcard${flipped ? ' flipped' : ''}`}
      style={{ borderColor: subjectColor }}
      tabIndex={0}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleFlip()}
      role="button"
      aria-pressed={flipped}
    >
      <div className="flashcard-inner">
        <div className="flashcard-front" onClick={handleFlip}>
          {front}
        </div>
        <div className="flashcard-back" onClick={handleFlip}>
          {back}
        </div>
      </div>
    </div>
  );
};

export default FlashCard; 