# Welcome! #
This is a schedule manager with the following functions:
* Register to the website: On the login page, there is a link under the
prompts to login to register. If a user clicks on the link, it routes to the
register page. After a user fills out the registration information, they have
an account with the website.
* Login: Login works by using a form that when submitted will perform
handleLogin. This is a function that calls the login() API with the email and
password that were submitted.
* Search for courses in a course catalog: When a user enters something
into the search bar, handleSearch() is triggered and the backend is
searched for courses based on that query
* Add courses to their personal calendar: When the user searches for a
class, in each result there is a “+” next to each result. On click, it executes
handleAddCourse(), which gets the full course information from the API.
Then it sends a POST request to save the course to the current user’s
profile.
* View calendar: On the /home page, there are two ways a user can view
their calendar. They can either click “Course Calendar” in the upper
lefthand corner, or after adding a course, they will automatically be routed
to the calendar.
