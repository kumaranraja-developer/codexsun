import React, { forwardRef } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ArrowLeft } from "lucide-react";

type CommonProps = {
  label?: string;
  className?: string;
  children?: React.ReactNode;
  arrowLeft?: boolean;
  arrowRight?: boolean;
  scrollToId?: string; // new prop for scrolling to section
};

type ButtonAsLink = {
  path: string;
  onClick?: () => void;
} & CommonProps &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

type ButtonAsButton = {
  path?: undefined;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
} & CommonProps &
  React.ButtonHTMLAttributes<HTMLButtonElement>;

type ButtonProps = ButtonAsLink | ButtonAsButton;

const Button = forwardRef<HTMLButtonElement | HTMLAnchorElement, ButtonProps>(
  (
    {
      label,
      path,
      className = "",
      onClick,
      children,
      arrowLeft = false,
      arrowRight = false,
      scrollToId,
      ...rest
    },
    ref
  ) => {
    const classes = `${className} px-4 py-2 rounded-md cursor-pointer transition-all duration-500 gap-2`;

    const content = (
      <>
        {arrowLeft && <ArrowLeft size={18} />}
        {children || label}
        {arrowRight && <ArrowRight size={18} />}
      </>
    );

    const handleScroll = (e: React.MouseEvent<HTMLElement>) => {
      if (scrollToId) {
        e.preventDefault();
        const el = document.getElementById(scrollToId);
        if (el) {
          el.scrollIntoView({ behavior: "smooth" });
        }
      }
      if (onClick) onClick(e as any); // cast because onClick may expect different element type
    };

    if (path) {
      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          to={path}
          onClick={handleScroll}
          className={classes}
          aria-label={label}
          {...(rest as Omit<ButtonAsLink, "path">)}
        >
          {content} <span className="sr-only">{content}</span>
        </Link>
      );
    }

    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        onClick={handleScroll}
        className={classes}
        aria-label={label}
        {...(rest as Omit<ButtonAsButton, "path">)}
      >
        {content} <span className="sr-only">{content}</span>
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
