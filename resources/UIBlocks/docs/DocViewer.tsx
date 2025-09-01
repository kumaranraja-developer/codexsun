import React, { useEffect, useState } from "react";
import ReactMarkdown, { Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import Button from "../../../resources/components/button/Button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface DocViewerProps {
  slug: string | null;
}

export default function DocViewer({ slug }: DocViewerProps) {
  const [content, setContent] = useState<string>("");
  const [checkedItems, setCheckedItems] = useState<Record<number, boolean>>({});

  useEffect(() => {
    if (!slug) {
      setContent("");
      return;
    }

    fetch(`http://localhost:5001/api/docs/${slug}`)
      .then((res) => res.json())
      .then((data) => setContent(data.content))
      .catch(() => setContent("Failed to load document."));
  }, [slug]);

  const toggleCheckbox = (index: number) => {
    setCheckedItems((prev) => ({ ...prev, [index]: !prev[index] }));
  };

  const markdownComponents: Components = {
    code: (({ inline, className, children, ...props }) => {
      const match = /language-(\w+)/.exec(className || "");
      return !inline && match ? (
        <SyntaxHighlighter
          style={materialLight}
          language={match[1]}
          PreTag="div"
          {...props}
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code className="bg-neutral-100 rounded px-1 py-0.5 text-sm" {...props}>
          {children}
        </code>
      );
    }) as React.FC<any>,

    a: (({ href, children, ...props }) => (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="text-blue-600 hover:underline"
        {...props}
      >
        {children}
      </a>
    )) as React.FC<any>,

    // Task lists
    li({ children, checked, ...props }: any) {
      if (typeof checked === "boolean") {
        const index = Number(props.key) || Math.random();
        const isChecked = checkedItems[index] ?? checked;

        return (
          <li
            className={`flex items-start ml-6 mb-2 ${isChecked ? "opacity-50 line-through text-gray-400" : ""}`}
            {...props}
          >
            <input
              type="checkbox"
              checked={isChecked}
              onChange={() => toggleCheckbox(index)}
              className="mr-2 mt-1 flex-shrink-0"
            />
            <span>{children}</span>
          </li>
        );
      }
      return (
        <li className="ml-6 mb-2 list-disc" {...props}>
          {children}
        </li>
      );
    },

    // Tables
    table({ children, ...props }) {
      return (
        <table
          className="table-auto border border-gray-300 w-full my-4"
          {...props}
        >
          {children}
        </table>
      );
    },
    th({ children, ...props }) {
      return (
        <th className="border border-gray-300 px-4 py-2 bg-gray-100" {...props}>
          {children}
        </th>
      );
    },
    td({ children, ...props }) {
      return (
        <td className="border border-gray-300 px-4 py-2" {...props}>
          {children}
        </td>
      );
    },

    // Strikethrough
    del({ children, ...props }) {
      return (
        <del className="line-through text-gray-500" {...props}>
          {children}
        </del>
      );
    },

    // Blockquotes
    blockquote({ children, ...props }) {
      return (
        <blockquote
          className="border-l-4 border-gray-300 pl-4 italic text-gray-600 my-2"
          {...props}
        >
          {children}
        </blockquote>
      );
    },

    // Headings
    h1({ children, ...props }) {
      return (
        <h1 className="text-3xl font-bold my-4" {...props}>
          {children}
        </h1>
      );
    },
    h2({ children, ...props }) {
      return (
        <h2 className="text-2xl font-bold my-3" {...props}>
          {children}
        </h2>
      );
    },
    h3({ children, ...props }) {
      return (
        <h3 className="text-xl font-semibold my-2" {...props}>
          {children}
        </h3>
      );
    },
    h4({ children, ...props }) {
      return (
        <h4 className="text-lg font-semibold my-2" {...props}>
          {children}
        </h4>
      );
    },
    h5({ children, ...props }) {
      return (
        <h5 className="text-base font-semibold my-1" {...props}>
          {children}
        </h5>
      );
    },
    h6({ children, ...props }) {
      return (
        <h6 className="text-base font-medium my-1" {...props}>
          {children}
        </h6>
      );
    },

    // Paragraphs
    p({ children, ...props }) {
      return (
        <p className="my-2" {...props}>
          {children}
        </p>
      );
    },

    // Horizontal rule
    hr(props) {
      return <hr className="border-gray-300 my-4" {...props} />;
    },

    // Images
    img({ src, alt, ...props }: { src?: string; alt?: string }) {
      return (
        <img
          src={src}
          alt={alt}
          className="max-w-full my-2 rounded"
          {...props}
        />
      );
    },
  };

  return (
    <div className="flex-1 overflow-y-auto scrollbar-hide bg-background px-6 pt-5 border border-ring/30">
      {!slug && <p className="text-gray-500">Select a document to view.</p>}
      {slug && (
        <>
          <Breadcrumb slug={slug} />
          <div className="prose prose-sm sm:prose lg:prose-lg max-w-none p-2 text-foreground">
            <ReactMarkdown
              remarkPlugins={[remarkGfm]}
              components={markdownComponents}
            >
              {content}
            </ReactMarkdown>
          </div>
        </>
      )}

      <div className="flex justify-between mb-5 px-3">
        <div className="flex items-center border border-ring/30 rounded">
          <ChevronLeft />
          <Button label="Prev" className="text-lg" />
        </div>
        <div className="flex items-center border border-ring/30 rounded">
          <Button label="Next" className="text-lg" />
          <ChevronRight />
        </div>
      </div>
    </div>
  );
}

// Breadcrumb
interface BreadcrumbProps {
  slug: string;
}

function Breadcrumb({ slug }: BreadcrumbProps) {
  const parts = slug.split("/");
  return (
    <nav className="text-sm text-foreground/60 mb-4" aria-label="Breadcrumb">
      {parts.map((part, idx) => {
        const path = parts.slice(0, idx + 1).join("/");
        const isLast = idx === parts.length - 1;
        return (
          <span key={path}>
            {!isLast ? (
              <>
                <button
                  onClick={() =>
                    document
                      .getElementById(path)
                      ?.scrollIntoView({ behavior: "smooth" })
                  }
                  className="hover:underline focus:outline-none"
                >
                  {part}
                </button>
                {" / "}
              </>
            ) : (
              <span className="font-semibold">{part}</span>
            )}
          </span>
        );
      })}
    </nav>
  );
}
