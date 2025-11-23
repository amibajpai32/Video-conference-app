import axios from "axios";
import { createContext, useState } from "react";
import { useNavigate } from "react-router-dom";

const AuthContext = createContext();

const client = axios.create({
  baseURL: "http://localhost:8000/api/v1/users",
});

const AuthProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const router = useNavigate();

  const handleRegister = async (name, username, password) => {
    try {
      const response = await client.post("/register", {
        name,
        username,
        password,
      });

      if (response.status === 201) {
        return response.data.message;
      }
    } catch (err) {
      const message =
        err?.response?.data?.message || err.message || "Registration failed";
      throw new Error(message);
    }
  };

  const handleLogin = async (username, password) => {
    try {
      const response = await client.post("/login", {
        username,
        password,
      });

      if (response.status === 200) {
        localStorage.setItem("token", response.data.token);
        setUserData(response.data.user);
        router("/dashboard");
      }
      return response.data;
    } catch (err) {
      const message =
        err?.response?.data?.message || err.message || "Login failed";
      throw new Error(message);
    }
  };

  return (
    <AuthContext.Provider
      value={{ userData, setUserData, handleRegister, handleLogin }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export { AuthContext, AuthProvider };
