import { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { setFile, setPreview, clearFile } from "../redux/fileUploadSlice";

export const useFileUpload = (initialUrl = null) => {
  const dispatch = useDispatch();
  const [fieldName, setFieldName] = useState(null);
  const fileRef = useRef(null);

  const reduxFileInfo = useSelector((state) =>
    fieldName ? state?.fileUpload?.files?.[fieldName] : null
  );
  const reduxPreview = useSelector((state) =>
    fieldName ? state?.fileUpload?.previews?.[fieldName] : null
  );

  useEffect(() => {
    if (initialUrl && !fieldName) {
      const newFieldName = `file_${Date.now()}`;
      setFieldName(newFieldName);

      // Set preview for URL
      dispatch(
        setPreview({
          fieldName: newFieldName,
          preview: {
            type: "image",
            url: initialUrl,
            isExisting: true, // Flag to identify existing files
          },
        })
      );
    }
  }, [initialUrl, dispatch]);

  useEffect(() => {
    const currentFile = fileRef.current;

    if (!currentFile || !fieldName) {
      dispatch(setPreview({ fieldName, preview: null }));
      return;
    }

    try {
      if (currentFile.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          dispatch(
            setPreview({
              fieldName,
              preview: {
                type: "image",
                url: e.target.result,
              },
            })
          );
        };
        reader.onerror = (error) => {
          console.error("File reading error:", error);
        };
        reader.readAsDataURL(currentFile);
      } else if (currentFile.type === "application/pdf") {
        dispatch(
          setPreview({
            fieldName,
            preview: {
              type: "pdf",
              name: currentFile.name,
            },
          })
        );
      } else if (
        currentFile.type === "application/msword" ||
        currentFile.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        dispatch(
          setPreview({
            fieldName,
            preview: {
              type: "doc",
              name: currentFile.name,
            },
          })
        );
      } else {
        dispatch(
          setPreview({
            fieldName,
            preview: {
              type: "file",
              name: currentFile.name,
            },
          })
        );
      }
    } catch (error) {
      console.error("Preview generation error:", error);
    }

    return () => {
      if (reduxPreview?.type === "image" && reduxPreview.url) {
        URL.revokeObjectURL(reduxPreview.url);
      }
    };
  }, [fieldName, dispatch]);

  const setFileValue = (newFile, customFieldName = null) => {
    const uploadFieldName =
      customFieldName || fieldName || `file_${Date.now()}`;

    if (!fieldName) {
      setFieldName(uploadFieldName);
    }

    if (
      newFile === null ||
      newFile instanceof File ||
      newFile instanceof Blob
    ) {
      fileRef.current = newFile;

      dispatch(
        setFile({
          fieldName: uploadFieldName,
          fileInfo: newFile
            ? {
                name: newFile.name,
                size: newFile.size,
                type: newFile.type,
                lastModified: newFile.lastModified,
              }
            : null,
        })
      );

      return uploadFieldName;
    } else {
      console.error("Invalid file type");
      return null;
    }
  };

  const clearFileValue = () => {
    if (fieldName) {
      fileRef.current = null;
      dispatch(clearFile(fieldName));
    }
  };

  return {
    file: fileRef.current,
    fileInfo: reduxFileInfo,
    setFile: setFileValue,
    preview: reduxPreview,
    clearFile: clearFileValue,
    fieldName,
  };
};
