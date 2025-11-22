import { createContext, useState, useContext } from "react";
import { loginAPI, registerAPI } from "../services/authService";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const initialUser = JSON.parse(localStorage.getItem("user")) || null;
  const initialToken = localStorage.getItem("token") || null;

  const [user, setUser] = useState(initialUser);
  const [token, setToken] = useState(initialToken);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await loginAPI(email, password);
      setUser(data.user);
      setToken(data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("token", data.token);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (nombre, email, password) => {
    setIsLoading(true);
    setError(null);
    try {
      return await registerAPI(nombre, email, password);
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem("user");
    localStorage.removeItem("token");
  };

  const contextValue = {
    user,
    token,
    isLoading,
    error,
    isAuthenticated: !!token,
    login,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => useContext(AuthContext);
