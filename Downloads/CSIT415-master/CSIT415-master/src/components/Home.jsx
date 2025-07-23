import { useState, useEffect } from "react";
import api from "../api/axios";
import "../../Static/Home.css";
import { useNavigate } from "react-router-dom";
import { useSelectedCourses } from "./SelectedCoursesContext";

function Home() {
    const [query, setQuery] = useState("");
    const [results, setResults] = useState([]);
    const [error, setError] = useState("");
    const [searched, setSearched] = useState(false);
    const { selectedCourses, setSelectedCourses } = useSelectedCourses();
    const navigate = useNavigate();

    // Fetch saved courses for the logged-in user
    useEffect(() => {
        const fetchUserCourses = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await api.get("/user_courses", {
                    headers: { Authorization: `Bearer ${token}` },
                });
                setSelectedCourses(res.data);
            } catch (err) {
                console.error(
                    "Failed to fetch user courses:",
                    err?.response?.data || err.message || err
                );
            }
        };
        fetchUserCourses();
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        try {
            const res = await api.get(`/courses?query=${query}`);
            setResults(res.data);
            setError("");
        } catch (err) {
            console.error("Search error:", err);
            setError("Failed to search courses. Try again.");
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    //Save selected course for current user
    const handleAddCourse = async (course) => {
        try {
            const token = localStorage.getItem("token");

            // Get full course details
            const res = await api.get(`/courses/${course.id}`);
            const fullCourse = res.data;

            // Extract clean startTime, endTime, days
            const cleanStartTime = fullCourse.startTime?.match(/\d{1,2}:\d{2} [APM]{2}/)?.[0] || "";
            const cleanEndTime = fullCourse.endTime?.match(/\d{1,2}:\d{2} [APM]{2}/)?.[0] || "";
            const cleanDays =
                fullCourse.days
                    ?.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/g)
                    ?.join(",") || "";

            const cleanedCourse = {
                ...fullCourse,
                startTime: cleanStartTime,
                endTime: cleanEndTime,
                days: cleanDays,
            };

            // Save to user
            await api.post(
                "/save_course",
                { course_id: cleanedCourse.id },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // Update frontend state
            setSelectedCourses((prev) => {
                if (!prev.some((c) => c.id === cleanedCourse.id)) {
                    return [...prev, cleanedCourse];
                }
                return prev;
            });
            navigate("/calendar");
        } catch (err) {
            console.error("Failed to save course:", err?.response?.data || err.message || err);
        }
    };

    return (
        <>
            <div className="toolbar">
                <div className="toolbarLeft">
                    <button
                        className="toolbarButton"
                        style={{ fontFamily: "Baskerville" }}
                        onClick={() => navigate("/calendar")}
                    >
                        Course Calendar
                    </button>
                </div>
                <div className="toolbarRight">
                    {localStorage.getItem("token") ? (
                        <button className="toolbarButton" onClick={handleLogout}>
                            Logout
                        </button>
                    ) : (
                        <button className="toolbarButton" onClick={() => navigate("/login")}>
                            Login
                        </button>
                    )}
                </div>
            </div>

            <div className="homeWrapper">
                <div className={searched ? "searchContainer searched" : "searchContainer"}>
                    <h2 style={{ width: "100%", textAlign: "center", margin: "20px" }}>
                        Search for your courses below!
                    </h2>

                    <form className="courseSearch" onSubmit={handleSearch}>
                        <input
                            type="text"
                            placeholder="Search Summer 2025 Classes"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                        />
                        <button type="submit" onClick={() => setSearched(true)}>
                            Search
                        </button>
                    </form>

                    <div className="searchResults">
                        {results.length > 0 && (
                            <p style={{ margin: "0", width: "100%" }}>Search Results</p>
                        )}
                        {error && <p style={{ color: "red" }}>{error}</p>}

                        {searched
                            ? results.map((course) => (
                                  <div key={course.id} className="result">
                                      <div className="courseTitle">
                                          <h2>
                                              {course.course_number} - {course.course_name}
                                          </h2>
                                          <div className="course-info-options">
                                              <button onClick={() => handleAddCourse(course)}>
                                                  +
                                              </button>
                                          </div>
                                      </div>
                                      <div className="courseInfo">
                                          <h4>Instructor: {course.instructor}</h4>
                                          <p>
                                              CRN: {course.crn} | Section: {course.section}
                                          </p>
                                      </div>
                                  </div>
                              ))
                            : null}
                    </div>
                </div>
            </div>
        </>
    );
}

export default Home;
