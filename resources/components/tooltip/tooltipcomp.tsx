import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "./tooltip";

interface TooltipComponentProps {
  tip: string;
  content: React.ReactNode; // now accepts JSX (like <ImageBtn />)
  className?: string;
}

function Tooltipcomp({ tip, content, className = "" }: TooltipComponentProps) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <div className={className}>
          {content}
        </div>
      </TooltipTrigger>
      <TooltipContent>{tip}</TooltipContent>
    </Tooltip>
  );
}

export default Tooltipcomp;
