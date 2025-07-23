import React, { useEffect, useState } from "react";
import { Info, DateTime, Interval } from "luxon";
import classnames from "classnames";
import api from "../api/axios";
import "/Static/Calendar.css";
import "/Static/Schedule.css";
import "/Static/Scheduleview.css";
import "/Static/cells.css";

const Scheduleview = () => {
  const today = DateTime.local();
  const [firstActiveDayOfWeek, setFirstActiveDayOfWeek] = useState(today.startOf("week"));
  const [firstActiveDayOfMonth, setFirstActiveDayOfMonth] = useState(today.startOf("month"));
  const [activeDay, setActiveDay] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [savedCourses, setSavedCourses] = useState([]);

  const hoursOfDay = Array.from({ length: 24 }, (_, i) =>
    DateTime.local().startOf("day").plus({ hours: i })
  );

  const daysOfMonth = Interval.fromDateTimes(
    firstActiveDayOfMonth.startOf("week"),
    firstActiveDayOfMonth.endOf("month").endOf("week")
  )
    .splitBy({ day: 1 })
    .map((day) => day.start);

  const daysOfWeek = Interval.fromDateTimes(
    firstActiveDayOfWeek.startOf("week"),
    firstActiveDayOfWeek.endOf("week")
  )
    .splitBy({ day: 1 })
    .map((d) => d.start);

  const normalizeTime = (dt) => dt?.set({ year: 2000, month: 1, day: 1 });

  useEffect(() => {
    const fetchSavedCourses = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const res = await api.get("/user_courses", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const cleanedCourses = res.data.map((course) => {
          const extractedStartTime = course.startTime?.match(/\d{1,2}:\d{2} [APM]{2}/)?.[0] || "";
          const extractedEndTime = course.endTime?.match(/\d{1,2}:\d{2} [APM]{2}/)?.[0] || "";
          const extractedDays =
            course.startTime?.match(/(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/g)?.join(",") ||
            course.days ||
            "";

          return {
            ...course,
            course_name: course.course_name.replace("\nLecture", "").trim(),
            startTime: extractedStartTime,
            endTime: extractedEndTime,
            days: extractedDays,
          };
        });

        setSavedCourses(cleanedCourses);
      } catch (err) {
        console.error("Failed to fetch user courses:", err);
      }
    };

    fetchSavedCourses();
  }, []);

  const goToLastMonth = () => setFirstActiveDayOfMonth(firstActiveDayOfMonth.minus({ month: 1 }));
  const goToNextMonth = () => setFirstActiveDayOfMonth(firstActiveDayOfMonth.plus({ month: 1 }));
  const goToToday = () => {
    setFirstActiveDayOfMonth(today.startOf("month"));
    setActiveDay(today);
  };

  const goToLastWeek = () => setFirstActiveDayOfWeek(firstActiveDayOfWeek.minus({ week: 1 }));
  const goToNextWeek = () => setFirstActiveDayOfWeek(firstActiveDayOfWeek.plus({ week: 1 }));
  const goToCurrentWeek = () => setFirstActiveDayOfWeek(today.startOf("week"));

  return (
    <div className="schedule-view-container">
      {/* Sidebar Calendar */}
      <div className={!collapsed ? "calendar-sidebar" : "calendar-sidebar collapsed"}>
                <div className="calendar-sidebar-options">
        <button onClick={() => setCollapsed(!collapsed)}>☰</button>
                </div>
        <div className="calendar">
          <div className="calendar-header">
            <div className="calendar-header-month">
              {firstActiveDayOfMonth.toLocaleString({ month: "short", year: "numeric" })}
            </div>
            <div className="calendar-header-controls">
              <div className="calendar-header-control" onClick={goToLastMonth}>←</div>
              <div className="calendar-header-control calendar-header-today" onClick={goToToday}>Today</div>
              <div className="calendar-header-control" onClick={goToNextMonth}>→</div>
            </div>
          </div>

          <div className="calendar-weeks-grid">
            {Info.weekdays("short").map((day, i) => (
              <div key={i} className="calendar-weeks-grid-cell">{day}</div>
            ))}
          </div>

          <div className="calendar-grid">
            {daysOfMonth.map((day, i) => (
              <div
                key={i}
                className={classnames("calendar-grid-cell", {
                  "calendar-grid-cell-inactive": day.month !== firstActiveDayOfMonth.month,
                  "calendar-grid-cell-active": activeDay?.toISODate() === day.toISODate(),
                })}
                onClick={() => {
                  setActiveDay(day);
                  setFirstActiveDayOfWeek(day.startOf("week"));
                }}
              >
                {day.day}
              </div>
            ))}
          </div>
        </div>
        <div className="schedule">
          <div className="schedule-headline">
            {activeDay
              ? activeDay.toLocaleString(DateTime.DATE_MED)
              : "Please select a day"}
          </div>
        </div>
      </div>

      {/* Weekly Schedule Grid */}
      <div className="schedule-container">
        <div className="schedule">
          <div className="schedule-week">
            <div className="schedule-week-control" onClick={goToLastWeek}>←</div>
            <div className="schedule-week-control schedule-week-today" onClick={goToCurrentWeek}>Today</div>
            <div className="schedule-week-control" onClick={goToNextWeek}>→</div>
          </div>

          <div className="schedule-grid">
            <div className="Schedule-cell-empty"></div>

            {daysOfWeek.map((day, i) => (
              <div
                key={i}
                className={classnames("schedule-header", {
                  "inner-cells-highlight": day.toISODate() === today.toISODate(),
                })}
              >
                <div className="weekday">{day.toLocaleString({ weekday: "long" })}</div>
                <div className="days">{day.toLocaleString({ month: "short", day: "2-digit" })}</div>
              </div>
            ))}

            {hoursOfDay.slice(7, 20).map((hour, hourIndex) => (
              <React.Fragment key={hourIndex}>
                <div className="schedule-time">
                  {hour.toLocaleString(DateTime.TIME_SIMPLE)}
                </div>

                {daysOfWeek.map((day, dayIndex) => {
                  const course = savedCourses.find((c) => {
                    const courseDays = c.days?.split(",") || [];
                    const startTime = DateTime.fromFormat(c.startTime, "hh:mm a");
                    const endTime = DateTime.fromFormat(c.endTime, "hh:mm a");

                    const courseStart = c.startDate ? DateTime.fromFormat(c.startDate, "MM/dd/yyyy") : null;
                    const courseEnd = c.endDate ? DateTime.fromFormat(c.endDate, "MM/dd/yyyy") : null;

                    const hourNorm = normalizeTime(hour);
                    const startNorm = normalizeTime(startTime);
                    const endNorm = normalizeTime(endTime);

                    return (
                      courseDays.includes(day.toFormat("EEEE")) &&
                      hourNorm >= startNorm &&
                      hourNorm < endNorm &&
                      (!courseStart || day >= courseStart) &&
                      (!courseEnd || day <= courseEnd)
                    );
                  });

                  if (course) {
                    const startTime = DateTime.fromFormat(course.startTime, "hh:mm a");
                    const endTime = DateTime.fromFormat(course.endTime, "hh:mm a");
                    const duration = endTime.diff(startTime, "hours").hours;

                    return (
                      <div
                        key={`${hourIndex}-${dayIndex}`}
                        className="inner-cells meeting-cell"
                        style={{ height: `${duration * 55}px` }}
                        onClick={() => setSelectedCourse(course)}
                      >
                        <div>
                          <strong>{course.course_name}</strong><br />
                          {course.instructor}<br />
                          {course.building} - {course.room}<br />
                          {course.days}<br />
                          {course.startTime} - {course.endTime}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={`${hourIndex}-${dayIndex}`} className="inner-cells"></div>
                  );
                })}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>

      {/* Selected Course Info Panel */}
      {selectedCourse && (
        <div className="course-border">
          <div className="course-info">
            <h2>{selectedCourse.course_name}</h2>
            <p><strong>Instructor:</strong> {selectedCourse.instructor}</p>
            <p><strong>Location:</strong> {selectedCourse.building} {selectedCourse.room}</p>
            <p><strong>Days:</strong> {selectedCourse.days}</p>
            <p><strong>Time:</strong> {selectedCourse.startTime} - {selectedCourse.endTime}</p>
            <button onClick={() => setSelectedCourse(null)}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Scheduleview;