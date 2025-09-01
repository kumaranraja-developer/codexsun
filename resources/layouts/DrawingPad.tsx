import React, { useRef, useState, useEffect } from "react";
import ImageButton from "../../resources/components/button/ImageBtn";

type Point = { x: number; y: number };
type Stroke = {
  points: Point[];
  color: string;
  size: number;
  type: "draw" | "erase";
};

type ToolType = "draw" | "erase" | "pointer";

const DrawingCanvas: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [redoStack, setRedoStack] = useState<Stroke[]>([]);
  const [currentStroke, setCurrentStroke] = useState<Stroke | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState("#000000");
  const [brushSize, setBrushSize] = useState(5);
  const [tool, setTool] = useState<ToolType>("draw");
  const cursorCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const [cursorPos, setCursorPos] = useState<Point | null>(null);

  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );

  useEffect(() => {
    redraw();
  }, [strokes]);

  const getCanvasContext = (): CanvasRenderingContext2D | null => {
    const canvas = canvasRef.current;
    return canvas ? canvas.getContext("2d") : null;
  };

  const redraw = () => {
    const ctx = getCanvasContext();
    const canvas = canvasRef.current;
    if (!ctx || !canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (const stroke of strokes) {
      ctx.beginPath();
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.strokeStyle = stroke.type === "erase" ? "white" : stroke.color;
      ctx.lineWidth = stroke.size;
      stroke.points.forEach((point, index) => {
        if (index === 0) ctx.moveTo(point.x, point.y);
        else ctx.lineTo(point.x, point.y);
      });
      ctx.stroke();
    }
  };

  const draw = (e: React.MouseEvent) => {
    const { offsetX, offsetY } = e.nativeEvent;
    const pos = { x: offsetX, y: offsetY };

    if (tool === "erase") {
      if (!isDrawing) return;
      const radius = brushSize * 10.5;
      const updatedStrokes = strokes.filter((stroke) => {
        return !stroke.points.some((pt) => {
          const dx = pt.x - pos.x;
          const dy = pt.y - pos.y;
          return dx * dx + dy * dy < radius * radius;
        });
      });

      if (updatedStrokes.length !== strokes.length) {
        setStrokes(updatedStrokes);
        setRedoStack([]);
      }
      return;
    }

    if (!isDrawing || !currentStroke) return;

    const newPoints = [...currentStroke.points, pos];
    const updatedStroke = { ...currentStroke, points: newPoints };
    setCurrentStroke(updatedStroke);
    setStrokes([...strokes.slice(0, -1), updatedStroke]);
  };

  const startDrawing = (e: React.MouseEvent) => {
    if (tool === "pointer") {
      setDragStart({ x: e.clientX, y: e.clientY });
      return;
    }

    const { offsetX, offsetY } = e.nativeEvent;

    if (tool === "erase") {
      setIsDrawing(true); // make sure drag continues
      return;
    }

    const newStroke: Stroke = {
      points: [{ x: offsetX, y: offsetY }],
      color,
      size: brushSize,
      type: tool,
    };
    setCurrentStroke(newStroke);
    setIsDrawing(true);
    setStrokes((prev) => [...prev, newStroke]);
  };

  const endDrawing = () => {
    if (tool === "pointer") {
      setDragStart(null);
      return;
    }

    setIsDrawing(false);

    if (!currentStroke) return;
    setCurrentStroke(null);
  };

  const undo = () => {
    if (strokes.length === 0) return;
    const newStrokes = [...strokes];
    const last = newStrokes.pop();
    setStrokes(newStrokes);
    if (last) setRedoStack([...redoStack, last]);
  };

  const redo = () => {
    if (redoStack.length === 0) return;
    const last = redoStack[redoStack.length - 1];
    setRedoStack(redoStack.slice(0, -1));
    setStrokes([...strokes, last]);
  };

  const clearCanvas = () => {
    setStrokes([]);
    setRedoStack([]);
  };

  const saveDrawing = () => {
    const data = JSON.stringify(strokes);
    localStorage.setItem("drawing", data);
    alert("Saved to localStorage!");
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key === "z") {
        e.preventDefault();
        undo();
      } else if (e.ctrlKey && e.key === "y") {
        e.preventDefault();
        redo();
      } else if (e.ctrlKey && e.key === "d") {
        e.preventDefault();
        clearCanvas();
      } else if (!e.ctrlKey) {
        if (e.key === "d") setTool("draw");
        else if (e.key === "e") setTool("erase");
        else if (e.key === "p") setTool("pointer");
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo, clearCanvas]);

  useEffect(() => {
    const canvas = cursorCanvasRef.current;
    if (!canvas || tool !== "erase") return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (cursorPos) {
      ctx.beginPath();
      ctx.arc(cursorPos.x, cursorPos.y, brushSize / 2, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(0, 0, 0, 0.5)";
      ctx.lineWidth = 1;
      ctx.stroke();
    }
  }, [cursorPos, brushSize, tool]);

  return (
    <div className="h-screen w-screen flex flex-col bg-gray-100">
      {/* Control Bar */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 bg-white border rounded-lg shadow-md p-3 flex flex-wrap gap-3 m-5 z-50">
        <input
          type="color"
          value={color}
          className="block my-auto"
          onChange={(e) => setColor(e.target.value)}
        />
        <label className="flex items-center space-x-2">
          <input
            type="range"
            min={1}
            max={50}
            value={brushSize}
            onChange={(e) => setBrushSize(Number(e.target.value))}
          />
          <span>{brushSize}</span>
        </label>
        <ImageButton
          className={`p-2 rounded-full ${
            tool === "pointer" ? "bg-black text-white" : "bg-white"
          }`}
          onClick={() => setTool("pointer")}
          icon={"cursor"}
        />
        <ImageButton
          onClick={() => setTool("draw")}
          className={`p-2 rounded-full ${
            tool === "draw" ? "bg-black text-white" : "bg-white"
          }`}
          icon={"draw"}
        />
        <ImageButton
          onClick={() => setTool("erase")}
          className={`p-2 rounded-full ${
            tool === "erase" ? "bg-black text-white" : "bg-white"
          }`}
          icon={"erase"}
        />
        <ImageButton
          onClick={undo}
          className="px-3 py-1 border bg-gray-200 rounded"
          icon={"undo"}
        />
        <ImageButton
          onClick={redo}
          className="px-3 py-1 border bg-gray-200 rounded"
          icon={"redo"}
        />
        <ImageButton
          onClick={saveDrawing}
          className="px-3 py-1 border bg-create text-create-foreground rounded"
          icon={"save"}
        />
        <ImageButton
          onClick={clearCanvas}
          className="px-3 py-1 border bg-delete text-delete-foreground rounded"
          icon={"clear"}
        />
      </div>

      {/* Canvas */}
      <div className="flex-1 m-5">
        <canvas
          ref={canvasRef}
          width={window.innerWidth - 40}
          height={window.innerHeight - 120}
          className="w-full h-full border-t border-gray-300 bg-white cursor-crosshair rounded-md touch-none"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={endDrawing}
          onMouseLeave={endDrawing}
          onTouchStart={(e) => {
            if (tool !== "pointer") e.preventDefault();
            const touch = e.touches[0];
            startDrawing({
              clientX: touch.clientX,
              clientY: touch.clientY,
              nativeEvent: {
                offsetX:
                  touch.clientX -
                  canvasRef.current!.getBoundingClientRect().left,
                offsetY:
                  touch.clientY -
                  canvasRef.current!.getBoundingClientRect().top,
              },
            } as unknown as React.MouseEvent);
          }}
          onTouchMove={(e) => {
            if (tool !== "pointer") e.preventDefault();
            const touch = e.touches[0];
            draw({
              clientX: touch.clientX,
              clientY: touch.clientY,
              nativeEvent: {
                offsetX:
                  touch.clientX -
                  canvasRef.current!.getBoundingClientRect().left,
                offsetY:
                  touch.clientY -
                  canvasRef.current!.getBoundingClientRect().top,
              },
            } as unknown as React.MouseEvent);
          }}
          onTouchEnd={(e) => {
            if (tool !== "pointer") e.preventDefault();
            endDrawing();
          }}
        />

        {/* Cursor Canvas (overlay for eraser ring) */}
        <canvas
          ref={cursorCanvasRef}
          width={window.innerWidth - 40}
          height={window.innerHeight - 120}
          className="absolute top-0 left-0 z-20 pointer-events-none"
        />
      </div>
    </div>
  );
};

export default DrawingCanvas;