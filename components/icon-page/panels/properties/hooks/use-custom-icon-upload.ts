import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { CustomizationState } from "@/lib/types";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const MAX_CUSTOM_ICONS = 10;

export function useCustomIconUpload(
  state: CustomizationState,
  onChange: (updates: Partial<CustomizationState>) => void,
  onDeleteIcon?: (id: string) => void
) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const blobUrlsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    return () => {
      blobUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
      blobUrlsRef.current.clear();
    };
  }, []);

  const validateFile = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `File "${file.name}" exceeds 5MB limit`;
    }

    const validTypes = [
      "image/svg+xml",
      "image/png",
      "image/jpeg",
      "image/jpg",
    ];
    if (!validTypes.includes(file.type)) {
      return `File "${file.name}" must be SVG, PNG, or JPG`;
    }

    if (state.customIcons.length >= MAX_CUSTOM_ICONS) {
      return `Maximum ${MAX_CUSTOM_ICONS} icons allowed`;
    }

    return null;
  };

  const sanitizeSVG = async (svgContent: string): Promise<string> => {
    const { default: DOMPurify } = await import("dompurify");
    return DOMPurify.sanitize(svgContent, {
      USE_PROFILES: { svg: true, svgFilters: true },
    });
  };

  const processUploadedFile = useCallback(
    async (file: File): Promise<boolean> => {
      const error = validateFile(file);
      if (error) {
        setUploadError(error);
        return false;
      }

      try {
        let url: string;
        if (file.type === "image/svg+xml") {
          const text = await file.text();
          const sanitized = await sanitizeSVG(text);
          const blob = new Blob([sanitized], { type: "image/svg+xml" });
          url = URL.createObjectURL(blob);
        } else {
          url = URL.createObjectURL(file);
        }
        blobUrlsRef.current.add(url);

        const newIcon = {
          id: `${Date.now()}-${Math.random().toString(36)}`,
          name: file.name,
          url,
        };
        onChange({
          customIcons: [...state.customIcons, newIcon],
        });
        return true;
      } catch (error) {
        console.error("Icon upload failed:", error);
        setUploadError(`Failed to upload "${file.name}"`);
        return false;
      }
    },
    [state.customIcons, onChange],
  );

  const handleFileUpload = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (!files) return;

      setUploadError(null);
      setIsUploading(true);

      for (const file of Array.from(files)) {
        const success = await processUploadedFile(file);
        if (!success) {
          setIsUploading(false);
          return;
        }
      }

      setIsUploading(false);
      e.target.value = "";
      toast.success("Icon uploaded successfully");
    },
    [processUploadedFile],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    async (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      setUploadError(null);
      setIsUploading(true);

      for (const file of Array.from(e.dataTransfer.files)) {
        const success = await processUploadedFile(file);
        if (!success) {
          setIsUploading(false);
          return;
        }
      }

      setIsUploading(false);
      toast.success("Icon uploaded successfully");
    },
    [processUploadedFile],
  );

  const deleteIcon = useCallback(
    (id: string) => {
      const icon = state.customIcons.find((i) => i.id === id);
      if (icon && icon.url.startsWith("blob:")) {
        URL.revokeObjectURL(icon.url);
        blobUrlsRef.current.delete(icon.url);
      }

      onDeleteIcon?.(id);

      onChange({
        customIcons: state.customIcons.filter((icon) => icon.id !== id),
      });
    },
    [state.customIcons, onChange, onDeleteIcon],
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
