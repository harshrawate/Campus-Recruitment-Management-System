// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import studentSidebarReducer from "./studentSidebarSlice";
import facultySidebarReducer from "./facultySidebarSlice";
import adminSidebarReducer from "./adminSidebarSlice";
import fileUploadReducer from "./fileUploadSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    studentSidebar: studentSidebarReducer,
    facultySidebar: facultySidebarReducer,
    adminSidebar: adminSidebarReducer,
    fileUpload: fileUploadReducer,
  },
});
