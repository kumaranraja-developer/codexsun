interface ErrorProps {
  message: string;
  className?: string;
  id: string;
}

function Error({ message, id, className = "" }: ErrorProps) {
  if (!message) return null;

  return (
    <div
      id={id}
      className={`text-sm text-error error-float ${className}`}
    >
      {message}
    </div>
  );
}

export default Error;
