interface StoryTextProps {
  text: string;
}

/** Renders story copy where **double asterisks** mark emphasis. */
export default function StoryText({ text }: StoryTextProps) {
  const parts = text.split(/\*\*(.*?)\*\*/g);
  return (
    <p>
      {parts.map((part, i) =>
        i % 2 === 1 ? <strong key={i}>{part}</strong> : part
      )}
    </p>
  );
}
