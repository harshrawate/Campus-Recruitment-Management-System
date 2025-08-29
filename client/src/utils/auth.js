// src/utils/auth.js
import { jwtDecode } from "jwt-decode";
import Cookies from "js-cookie";

export const getDecodedToken = () => {
  try {
    const token = Cookies.get("userCookie");
    if (!token) return null;

    return jwtDecode(token);
  } catch (error) {
    console.error("Error decoding token:", error);
    return null;
  }
};

export const getUserRole = () => {
  try {
    const decodedToken = getDecodedToken();
    return decodedToken?.role?.toLowerCase() || "";
  } catch (error) {
    console.error("Error getting user role:", error);
    return "";
  }
};

export const getUserId = () => {
  try {
    const decodedToken = getDecodedToken();
    return decodedToken?.id || "";
  } catch (error) {
    console.error(error);
    return "";
  }
};
