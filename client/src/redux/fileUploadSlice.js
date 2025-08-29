import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  files: {},
  previews: {},
};

const fileUploadSlice = createSlice({
  name: "fileUpload",
  initialState,
  reducers: {
    setFile: (state, action) => {
      const { fieldName, fileInfo } = action.payload;
      if (fileInfo) {
        state.files[fieldName] = {
          name: fileInfo.name,
          size: fileInfo.size,
          type: fileInfo.type,
          lastModified: fileInfo.lastModified,
        };
      } else {
        delete state.files[fieldName];
      }
    },
    setPreview: (state, action) => {
      const { fieldName, preview } = action.payload;
      if (preview) {
        state.previews[fieldName] = preview;
      } else {
        delete state.previews[fieldName];
      }
    },
    clearFile: (state, action) => {
      const fieldName = action.payload;
      delete state.files[fieldName];
      delete state.previews[fieldName];
    },
    clearAllFiles: (state) => {
      state.files = {};
      state.previews = {};
    },
  },
});

export const { setFile, setPreview, clearFile, clearAllFiles } =
  fileUploadSlice.actions;
export default fileUploadSlice.reducer;
