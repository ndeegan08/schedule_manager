const course = (
  courseNumber,
  section,
  courseName,
  instructor,
  crn,
  startTime,
  endTime,
  days,
  building,
  room,
  startDate,
  endDate,
  asynchronous
) => {
  return {
    courseNumber,
    section,
    courseName,
    instructor,
    crn,
    startTime,
    endTime,
    days,
    building,
    room,
    startDate,
    endDate,
    asynchronous,
  };
};

let courses = [];

document.addEventListener("DOMContentLoaded", () => {
  const courseNames = Array.from(document.querySelectorAll('[data-property="courseTitle"]')).map(el => el.innerText.trim());
  const courseNumbers = Array.from(document.querySelectorAll('[data-property="courseNumber"]')).map(el => "CSIT-" + el.innerText.trim());
  const courseSections = Array.from(document.querySelectorAll('[data-property="sequenceNumber"]')).map(el => el.innerText.trim());
  const instructors = Array.from(document.querySelectorAll('[data-property="instructor"]')).map(el => el.innerText.replace("(Primary)", "").trim());
  const crns = Array.from(document.querySelectorAll('[data-property="courseReferenceNumber"]')).map(el => el.innerText.trim());
  const meetingTimes = Array.from(document.querySelectorAll('[data-property="meetingTime"]')).map(el => el.innerText.trim());

  for (let i = 0; i < crns.length; i++) {
    let startTime = "";
    let endTime = "";
    let days = "";
    let building = "";
    let room = "";
    let startDate = "";
    let endDate = "";
    let asynchronous = false;

    const rawMeetingInfo = meetingTimes[i].toLowerCase();

    // Determine asynchronous first
    asynchronous = rawMeetingInfo.includes("asynchronous") || rawMeetingInfo.includes("tba");

    // Parse carefully if not asynchronous
    if (!asynchronous) {
      const beforeType = meetingTimes[i].split("Type:")[0].trim(); // Keep only before "Type:"
      const lines = beforeType.split("\n").map(line => line.trim()).filter(Boolean);

      if (lines.length >= 2) {
        days = lines[0];        // Example: "Monday,Wednesday"
        startTime = lines[1];   // Example: "05:20 PM"
      } else if (lines.length === 1) {
        startTime = lines[0];   // Only time info
      }
    }

    // Now extract building, room, startDate, endDate
    const buildingMatch = meetingTimes[i].match(/Building:\s*([^\n]*)/i);
    if (buildingMatch) building = buildingMatch[1].split("Room:")[0].trim();

    const roomMatch = meetingTimes[i].match(/Room:\s*([^\n]*)/i);
    if (roomMatch) room = roomMatch[1].split("Start Date:")[0].trim();

    const startDateMatch = meetingTimes[i].match(/Start Date:\s*([^\n]*)/i);
    if (startDateMatch) startDate = startDateMatch[1].split("End Date:")[0].trim();

    const endDateMatch = meetingTimes[i].match(/End Date:\s*([^\n]*)/i);
    if (endDateMatch) endDate = endDateMatch[1].trim();

    courses.push(
      course(
        courseNumbers[i],
        courseSections[i],
        courseNames[i],
        instructors[i],
        crns[i],
        startTime,
        endTime,
        days,
        building,
        room,
        startDate,
        endDate,
        asynchronous
      )
    );
  }

  console.log(`✅ Scraped ${courses.length} courses:`, courses);

  const uploadButton = document.getElementById("upload");
  if (uploadButton) {
    uploadButton.addEventListener("click", () => {
      fetch("http://localhost:5000/add_courses", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ courses }),
      })
        .then(res => res.json())
        .then(data => {
          console.log(`⬆️ Upload success: ${data.message}`);
          alert(`✅ Uploaded ${courses.length} courses!`);
        })
        .catch(err => console.error("Upload error:", err));
    });
  } else {
    console.error("Upload button not found!");
  }
});
