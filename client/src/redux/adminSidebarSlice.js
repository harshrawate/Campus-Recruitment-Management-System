// src/redux/sidebarSlice.js
import { createSlice } from "@reduxjs/toolkit";

const sidebarSlice = createSlice({
  name: "adminSidebar",
  initialState: {
    isOpen: false,
  },
  reducers: {
    toggleSidebar: (state) => {
      state.isOpen = !state.isOpen;
    },
  },
});

export const { toggleSidebar, setSidebarOpen, setSidebarClosed } =
  sidebarSlice.actions;

export default sidebarSlice.reducer;
