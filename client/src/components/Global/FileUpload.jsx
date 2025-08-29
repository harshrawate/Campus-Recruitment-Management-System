import React, { useCallback, useEffect, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import {
  FileIcon,
  ImageIcon,
  FileTextIcon,
  XIcon,
  EyeIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { setFile, setPreview } from "../../redux/fileUploadSlice";

const FileUpload = ({
  value,
  onChange,
  accept,
  maxSize = 5000000,
  label,
  error,
  helperText,
  showPreview = true,
  fieldName,
  initialUrl,
}) => {
  const dispatch = useDispatch();
  const reduxFile = useSelector((state) => state.fileUpload.files[fieldName]);
  const reduxPreview = useSelector(
    (state) => state.fileUpload.previews[fieldName]
  );
  const [localPreview, setLocalPreview] = useState(null);

  // Sync Redux state with local state
  useEffect(() => {
    // Ensure value is a File object before comparing
    if (reduxFile && (!value || !(value instanceof File))) {
      onChange(null);
    }
    if (reduxPreview) {
      setLocalPreview(reduxPreview);
    }
  }, [reduxFile, reduxPreview, onChange]);

  useEffect(() => {
    if (reduxPreview) {
      setLocalPreview(reduxPreview);
    }
  }, [reduxPreview]);

  const generatePreview = useCallback(
    (file) => {
      if (!file) {
        setLocalPreview(null);
        dispatch(setPreview({ fieldName, preview: null }));
        return;
      }

      // Ensure file is a File object
      if (!(file instanceof File)) {
        return;
      }

      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const preview = { type: "image", url: e.target.result };
          setLocalPreview(preview);
          dispatch(setPreview({ fieldName, preview }));
        };
        reader.readAsDataURL(file);
      } else if (file.type === "application/pdf") {
        const preview = { type: "pdf", name: file.name };
        setLocalPreview(preview);
        dispatch(setPreview({ fieldName, preview }));
      } else if (
        file.type === "application/msword" ||
        file.type ===
          "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        const preview = { type: "doc", name: file.name };
        setLocalPreview(preview);
        dispatch(setPreview({ fieldName, preview }));
      } else {
        const preview = { type: "file", name: file.name };
        setLocalPreview(preview);
        dispatch(setPreview({ fieldName, preview }));
      }
    },
    [dispatch, fieldName]
  );
  const onDrop = useCallback(
    (acceptedFiles, rejectedFiles) => {
      if (rejectedFiles && rejectedFiles.length > 0) {
        const currentFile = rejectedFiles[0];

        if (currentFile.file.size > maxSize) {
          toast.error(
            `File is too large. Maximum size is ${maxSize / 1000000}MB`,
            {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            }
          );
          return;
        }

        if (!accept[currentFile.file.type]) {
          toast.error(
            "Invalid file type. Please check the allowed file types.",
            {
              position: "top-right",
              autoClose: 3000,
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
            }
          );
          return;
        }
      }

      if (acceptedFiles && acceptedFiles.length > 0) {
        const file = acceptedFiles[0];
        onChange(file);
        dispatch(setFile({ fieldName, file }));

        if (showPreview) {
          generatePreview(file);
        }

        toast.success("File uploaded successfully!", {
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
      }
    },
    [
      onChange,
      showPreview,
      generatePreview,
      maxSize,
      accept,
      dispatch,
      fieldName,
    ]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize,
    multiple: false,
  });

  const removeFile = (e) => {
    e.stopPropagation();
    onChange(null);
    dispatch(setFile({ fieldName, file: null }));
    dispatch(setPreview({ fieldName, preview: null }));
    setLocalPreview(null);

    toast.info("File removed", {
      position: "top-right",
      autoClose: 2000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
    });
  };

  const openDocument = (url) => {
    if (url) {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  };

  const renderPreview = () => {
    let previewData = localPreview || reduxPreview;
    let documentUrl =
      value instanceof File || value instanceof Blob
        ? URL.createObjectURL(value)
        : undefined;

    if (!documentUrl && initialUrl) {
      documentUrl = initialUrl;
      var filename = initialUrl.split("/").pop();
      var fileExtension = filename.split(".").pop();
      if (fileExtension === "jpg") {
        previewData = { type: "image", url: initialUrl };
      } else if (fileExtension === "pdf") {
        previewData = { type: "pdf", name: filename };
      } else {
        previewData = { type: "doc", name: filename };
      }
    }

    if (!previewData && !documentUrl) return null;
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-4 relative"
      >
        <div className="bg-gray-50 rounded-lg p-4 flex items-center justify-center relative group">
          <button
            onClick={removeFile}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            title="Remove file"
          >
            <XIcon size={16} />
          </button>

          {documentUrl && (
            <button
              onClick={() => openDocument(documentUrl)}
              className="absolute -top-2 -left-2 bg-blue-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              title="View document"
            >
              <EyeIcon size={16} />
            </button>
          )}

          {previewData?.type === "image" && (
            <div className="relative">
              <img
                src={previewData.url}
                alt="Preview"
                className="max-w-xs max-h-48 mx-auto rounded-lg object-contain"
              />
              <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-10 transition-opacity rounded-lg" />
            </div>
          )}

          {previewData?.type === "pdf" && (
            <div className="text-center">
              <FileTextIcon size={48} className="text-red-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600 max-w-xs truncate">
                {previewData.name}
              </p>
            </div>
          )}

          {previewData?.type === "doc" && (
            <div className="text-center">
              <FileTextIcon size={48} className="text-blue-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600 max-w-xs truncate">
                {previewData.name}
              </p>
            </div>
          )}

          {previewData?.type === "file" && (
            <div className="text-center">
              <FileIcon size={48} className="text-gray-500 mx-auto mb-2" />
              <p className="text-sm text-gray-600 max-w-xs truncate">
                {previewData.name}
              </p>
            </div>
          )}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="space-y-2">
      <div
        {...getRootProps()}
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors
      ${
        isDragActive
          ? "border-indigo-500 bg-indigo-50"
          : "border-gray-300 hover:border-indigo-400"
      }
      ${error ? "border-red-500" : ""}`}
      >
        <input {...getInputProps()} />
        <div className="space-y-2">
          {!value && !reduxFile && !initialUrl && (
            <div className="flex flex-col items-center space-y-2">
              <ImageIcon className="w-8 h-8 text-gray-400" />
              <p className="text-gray-600">
                {isDragActive
                  ? "Drop file here"
                  : "Drag & drop or click to select"}
              </p>
            </div>
          )}
          {helperText && <p className="text-xs text-gray-500">{helperText}</p>}
        </div>
      </div>

      {error && <p className="text-sm text-red-500">{error.message}</p>}

      {showPreview && renderPreview()}
    </div>
  );
};

export default FileUpload;
