import { useRef, useState, useEffect } from "react";
import { cropImageToSize } from "../external/cropImageToSize";

interface FilePreview {
  file: File;
  progress: number;
}

interface FileUploadProps {
  id: string;
  onChange?: (files: File[]) => void;
   multiple?: boolean;
}

function FileUpload({ id, onChange, multiple }: FileUploadProps) {
  const [previews, setPreviews] = useState<FilePreview[]>([]);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const processedPreviews: FilePreview[] = [];

    for (const file of fileArray) {
      try {
        const croppedFile = await cropImageToSize(file, 200, 200, 0.6);
        processedPreviews.push({ file: croppedFile, progress: 0 });
      } catch (err) {
        console.error("Failed to process file:", file.name, err);
      }
    }

    setPreviews((prev) => [...prev, ...processedPreviews]);
    simulateUpload(processedPreviews);
    onChange?.([...previews.map((p) => p.file), ...processedPreviews.map((p) => p.file)]); // ✅ all files

  };

  const simulateUpload = (files: FilePreview[]) => {
    files.forEach((fp) => {
      const interval = setInterval(() => {
        setPreviews((prev) => {
          const updated = [...prev];
          const target = updated.find((p) => p.file === fp.file);
          if (!target) return prev;

          target.progress += 10;
          if (target.progress >= 100) {
            target.progress = 100;
            clearInterval(interval);
          }

          return [...updated];
        });
      }, 100);
    });
  };

  const removeFile = (fileToRemove: File) => {
    const updatedPreviews = previews.filter((fp) => fp.file !== fileToRemove);
    setPreviews(updatedPreviews);
    onChange?.(updatedPreviews.map((p) => p.file));
  };

  useEffect(() => {
    if (previews.length === 0 && inputRef.current) {
      inputRef.current.value = "";
    }
  }, [previews]);

  return (
    <div className="space-y-4">
      <div
        className="cursor-pointer p-12 flex justify-center bg-white border border-dashed border-gray-300 rounded-xl dark:bg-neutral-800 dark:border-neutral-600"
        onClick={() => inputRef.current?.click()}
      >
        <input
          id={id}
          type="file"
           multiple={multiple} 
          ref={inputRef}
          className="hidden"
          accept="image/png, image/jpeg, image/jpg, image/gif"
          onChange={handleFileSelect}
        />
        <div className="text-center">
          <span className="inline-flex justify-center items-center size-16">📁</span>
          <div className="mt-4 text-sm text-gray-600 dark:text-neutral-200">
            <span className="font-medium">Drop your files here</span> or{" "}
            <span className="text-blue-600 font-semibold hover:underline">browse</span>
          </div>
          <p className="text-xs text-gray-400 dark:text-neutral-400 mt-1">
            Pick image files up to 2MB each.
          </p>
        </div>
      </div>

      {previews.length > 0 && (
        <div className="space-y-2">
          {previews.map(({ file, progress }) => (
            <div
              key={file.name}
              className="p-3 bg-white border border-solid border-gray-300 rounded-xl dark:bg-neutral-800 dark:border-neutral-600"
            >
              <div className="flex justify-between items-center mb-1">
                <div className="flex items-center gap-3">
                  <div className="size-10 flex justify-center items-center border border-gray-200 rounded-lg text-gray-500 dark:border-neutral-700 dark:text-neutral-500">
                    {file.type.startsWith("image/") ? (
                      <img
                        src={URL.createObjectURL(file)}
                        alt={file.name}
                        className="rounded-lg max-w-10 max-h-10"
                      />
                    ) : (
                      <span className="text-xs">{file.name.split(".").pop()}</span>
                    )}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-white truncate max-w-[200px]">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-neutral-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => removeFile(file)}
                  className="text-gray-500 hover:text-gray-800 dark:text-neutral-500 dark:hover:text-neutral-200"
                >
                  🗑
                </button>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden dark:bg-neutral-700">
                  <div
                    className={`h-full bg-blue-600 transition-all duration-300 ${
                      progress >= 100 ? "bg-green-500" : ""
                    }`}
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <div className="w-10 text-right text-sm text-gray-800 dark:text-white">
                  {progress}%
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default FileUpload;
