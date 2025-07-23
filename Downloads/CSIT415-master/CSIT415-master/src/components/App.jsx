import { createRoot } from "react-dom/client";
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LoginBox from "./LoginBox";
import RegisterBox from "./RegisterBox";
import Home from "./Home";
import Scheduleview from "./Scheduleview";
import DemoClasses from "./DemoClasses"; 
import { SelectedCoursesProvider } from "./SelectedCoursesContext";

const root = createRoot(document.getElementById("root"));

root.render(
  <SelectedCoursesProvider>
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginBox />} />
        <Route path="/register" element={<RegisterBox />} />
        <Route path="/home" element={<Home />} />
        <Route path="/calendar" element={<DemoClasses />} /> {/* Or use Scheduleview */}
      </Routes>
    </Router>
  </SelectedCoursesProvider>
);
