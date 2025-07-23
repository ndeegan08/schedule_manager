import { createContext, useContext, useState, useEffect } from "react";

const SelectedCoursesContext = createContext();

export function useSelectedCourses() {
  return useContext(SelectedCoursesContext);
}

export function SelectedCoursesProvider({ children }) {
  const [selectedCourses, setSelectedCourses] = useState([]);

  useEffect(() => {
    const storedCourses = localStorage.getItem("selectedCourses");
    if (storedCourses) {
      setSelectedCourses(JSON.parse(storedCourses));
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("selectedCourses", JSON.stringify(selectedCourses));
  }, [selectedCourses]);

  return (
    <SelectedCoursesContext.Provider value={{ selectedCourses, setSelectedCourses }}>
      {children}
    </SelectedCoursesContext.Provider>
  );
}



