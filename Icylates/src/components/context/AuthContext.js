"use client";
import { createContext, useContext, useEffect, useState } from "react";
import { getCurrentUser, loginUser, loginAdmin, logoutUser, registerUser, updateProfile } from "@/lib/api";
const AuthContext = createContext(null);
export const AuthProvider = ({children}) => {
  const [user,setUser] = useState(null);
  const [loading,setLoading] = useState(true);
  const [sessionError,setSessionError] = useState("");
  useEffect(() => {
    const controller = new AbortController();
    try {localStorage.removeItem("icytales_user");} catch {}
    getCurrentUser({signal:controller.signal})
      .then(data => {setUser(data);setSessionError("");})
      .catch(error => {if(error.name !== "AbortError" && error.status !== 401) setSessionError(error.message);})
      .finally(() => {if(!controller.signal.aborted) setLoading(false);});
    return () => controller.abort();
  },[]);
  const authenticate = async (action,credentials) => {
    const data = await action(credentials);
    setUser(data);setSessionError("");return data;
  };
  const login = credentials => authenticate(loginUser,credentials);
  const adminLogin = credentials => authenticate(loginAdmin,credentials);
  const saveProfile = profile => authenticate(updateProfile,profile);
  const register = credentials => authenticate(registerUser,credentials);
  const logout = async () => {
    await logoutUser();setUser(null);setSessionError("");
  };
  return <AuthContext.Provider value={{user,loading,sessionError,login,adminLogin,saveProfile,register,logout}}>{children}</AuthContext.Provider>;
};
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth requires AuthProvider");
  return context;
};
