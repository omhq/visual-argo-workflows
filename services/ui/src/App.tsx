import { useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import SideBar from "./components/global/SideBar";
import Project from "./components/Project";

import "./index.css";
import { lightTheme } from "./utils/theme";
import { ThemeProvider } from "@mui/material";

export default function App() {
  const setViewHeight = () => {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  };

  useEffect(() => {
    setViewHeight();
    window.addEventListener("resize", setViewHeight);

    return () => {
      window.removeEventListener("resize", setViewHeight);
    };
  }, []);

  return (
    <ThemeProvider theme={lightTheme}>
      <Toaster />
      <SideBar />
      <Routes>
        <Route path="/projects/new" element={<Project />} />
      </Routes>
    </ThemeProvider>
  );
}
