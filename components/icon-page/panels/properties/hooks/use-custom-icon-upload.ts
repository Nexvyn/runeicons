import { useCallback, useState } from "react";
import { toast } from "sonner";
import { CustomizationState } from "@/lib/types";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_PERSISTED_DATA_SIZE = 3.5 * 1024 * 1024;
const MAX_CUSTOM_ICONS = 10;

interface CustomIcon {
  id: string;
  name: string;
  url: string;
}

function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error("File read failed"));
    reader.readAsDataURL(blob);
  });
}

export function useCustomIconUpload(
  state: CustomizationState,
  onChange: (updates: Partial<CustomizationState>) => void,
  onDeleteIcon?: (id: string) => void,
) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const validateFile = useCallback((file: File, nextCount: number) => {
    if (file.size > MAX_FILE_SIZE) {
      return `File "${file.name}" exceeds the 5MB limit`;
    }

    const validTypes = ["image/svg+xml", "image/png", "image/jpeg"];
    if (!validTypes.includes(file.type)) {
      return `File "${file.name}" must be SVG, PNG, or JPG`;
    }

    if (nextCount >= MAX_CUSTOM_ICONS) {
      return `Maximum ${MAX_CUSTOM_ICONS} icons allowed`;
    }

    return null;
  }, []);

  const sanitizeSvg = useCallback(async (svgContent: string) => {
    const { default: DOMPurify } = await import("dompurify");
    return DOMPurify.sanitize(svgContent, {
      USE_PROFILES: { svg: true, svgFilters: true },
    });
  }, []);

  const processFile = useCallback(
    async (file: File, nextCount: number): Promise<CustomIcon> => {
      const validationError = validateFile(file, nextCount);
      if (validationError) throw new Error(validationError);

      let url: string;
      if (file.type === "image/svg+xml") {
        const sanitized = await sanitizeSvg(await file.text());
        url = await blobToDataUrl(
          new Blob([sanitized], { type: "image/svg+xml" }),
        );
      } else {
        url = await blobToDataUrl(file);
      }

      return {
        id: `${Date.now()}-${crypto.randomUUID()}`,
        name: file.name,
        url,
      };
    },
    [sanitizeSvg, validateFile],
  );

  const processFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      setUploadError(null);
      setIsUploading(true);

      try {
        const additions: CustomIcon[] = [];
        let persistedSize = state.customIcons.reduce(
          (total, icon) => total + icon.url.length,
          0,
        );

        for (const file of files) {
          const icon = await processFile(
            file,
            state.customIcons.length + additions.length,
          );
          persistedSize += icon.url.length;
          if (persistedSize > MAX_PERSISTED_DATA_SIZE) {
            throw new Error(
              "Uploads are too large to save reliably. Use smaller SVG or image files.",
            );
          }
          additions.push(icon);
        }

        onChange({ customIcons: [...state.customIcons, ...additions] });
        toast.success(
          additions.length === 1
            ? "Icon uploaded successfully"
            : `${additions.length} icons uploaded successfully`,
        );
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Icon upload failed";
        setUploadError(message);
      } finally {
        setIsUploading(false);
      }
    },
    [onChange, processFile, state.customIcons],
  );

  const handleFileUpload = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = Array.from(event.target.files ?? []);
      await processFiles(files);
      event.target.value = "";
    },
    [processFiles],
  );

  const handleDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleDrop = useCallback(
    async (event: React.DragEvent) => {
      event.preventDefault();
      setIsDragging(false);
      await processFiles(Array.from(event.dataTransfer.files));
    },
    [processFiles],
  );

  const deleteIcon = useCallback(
    (id: string) => {
      onDeleteIcon?.(id);
      onChange({
        customIcons: state.customIcons.filter((icon) => icon.id !== id),
      });
    },
    [onChange, onDeleteIcon, state.customIcons],
  );

  return {
    isDragging,
    uploadError,
    setUploadError,
    isUploading,
    handleFileUpload,
    handleDragOver,
    handleDragLeave,
    handleDrop,
    deleteIcon,
    MAX_CUSTOM_ICONS,
  };
}
