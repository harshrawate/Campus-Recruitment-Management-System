import { createSlice } from "@reduxjs/toolkit";
import Cookies from "js-cookie";
import { jwtDecode } from "jwt-decode";

const initialState = {
  token: null,
  role: null,
  isInitialized: false,
  isProfileComplete: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setTokenAndRole(state, action) {
      const { token } = action.payload;
      if (token) {
        const decoded = jwtDecode(token);
        state.token = token;
        state.role = decoded.role;
      }
      state.isInitialized = true;
    },
    clearAuth(state) {
      state.token = null;
      state.role = null;
      state.isInitialized = true;
    },
  },
});

export const { setTokenAndRole, clearAuth } = authSlice.actions;

// Helper to initialize auth from cookies
export const initializeAuth = () => (dispatch) => {
  const token = Cookies.get("userCookie");
  if (token) {
    dispatch(
      setTokenAndRole({
        token,
      })
    );
  } else {
    dispatch(clearAuth());
  }
};

export default authSlice.reducer;
