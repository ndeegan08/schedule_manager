import React, { useEffect, useState } from "react";
import Scheduleview from "./Scheduleview";

function DemoClasses() {
    const [selectedCourses, setSelectedCourses] = useState([]);
    const courses = [
        {
            courseNumber: "CSIT-104",
            section: "11",
            courseName: "Python Programming I",
            instructor: {
                fName: "Kazi",
                lName: "Sultana",
                mName: " Zakia",
            },
            crn: "30768",
            meetingInfo: {
                start: "14:00",
                end: "16:00",
                days: ["Thursday", "Friday"],
                building: "Center for Comp & Info Science",
                room: "147",
                startDate: "05/12/2025",
                endDate: "07/01/2025",
            },
        },
    ];

    // useEffect(() => {
    //     const storedCourses = JSON.parse(localStorage.getItem("selectedCourses")) || [];
    //     setSelectedCourses(courses);
    // }, []);

    return (
        <div>
            <Scheduleview courses={courses} />
        </div>
    );
}

export default DemoClasses;
