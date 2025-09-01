import React, { useState, useEffect } from "react";

type TypingTextProps = {
  messages: string[];
  typingSpeed?: number;
  pauseTime?: number;
  fixedMessage: string;
  className?: string;
  TypingTextClassName?: string;
};

const TypingText: React.FC<TypingTextProps> = ({
  messages,
  typingSpeed = 100,
  pauseTime = 1000,
  fixedMessage = "Good Morning",
  className = "text-foreground",
  TypingTextClassName = "text-primary",
}) => {
  const [text, setText] = useState("");
  const [msgIndex, setMsgIndex] = useState(0);
  const [charIndex, setCharIndex] = useState(0);

  useEffect(() => {
    let typingTimeout: NodeJS.Timeout;

    if (charIndex < messages[msgIndex].length) {
      // type next character
      typingTimeout = setTimeout(() => {
        setText((prev) => prev + messages[msgIndex][charIndex]);
        setCharIndex(charIndex + 1);
      }, typingSpeed);
    } else {
      // full message typed, wait then go to next
      typingTimeout = setTimeout(() => {
        setCharIndex(0);
        setText("");
        setMsgIndex((prev) => (prev + 1) % messages.length);
      }, pauseTime);
    }

    return () => clearTimeout(typingTimeout);
  }, [charIndex, msgIndex, messages, typingSpeed, pauseTime]);

  return (
    <div className={`text-center ${className}`}>
      {fixedMessage}{" "}
      <span className={TypingTextClassName}>
        {text}
        {/* Show cursor only while typing */}
        {charIndex < messages[msgIndex].length && (
          <span className="animate-blink font-extrabold w-4 h-2 bg-primary"></span>
        )}
      </span>
    </div>
  );
};

export default TypingText;
