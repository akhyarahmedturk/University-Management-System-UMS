const courseList = document.getElementById("course-list");
let noOfCurrentCourses = 0;

async function loadCourses() {
    try {
        const coursesRes = await fetch('http://localhost:3500/course');
        const currentCoursesRes = await fetch('http://localhost:3500/student/currentCourses');

        if (!coursesRes.ok || !currentCoursesRes.ok) {
            throw new Error('Failed to fetch course data');
        }

        let courses = await coursesRes.json();
        courses = courses.courses;
        let currentCourses = await currentCoursesRes.json();
        currentCourses = currentCourses.courses;
        currentCourses = currentCourses.map(c => c.course);
        noOfCurrentCourses = currentCourses.length;
        const availableCourses = courses.filter(course =>
            !currentCourses.includes(course._id.toString()) && course.faculties.length > 0
        );
        if (availableCourses.length == 0) {
            courseList.innerHTML = `<p class="text-white">No courses available for enrollment at the moment.</p>`;
        }
        renderCourses(availableCourses);
    } catch (err) {
        console.error('Error fetching courses:', err);
    }
};

async function renderCourses(courses) {
    let faculties = await fetch('http://localhost:3500/faculty/faculties');
    faculties = await faculties.json();
    faculties = faculties.faculty;
    if (courses.length === 0) {
        courseList.innerHTML = `<p class="text-white">No courses available for enrollment at the moment.</p>`;
    }
    courses.forEach(course => {
        const col = document.createElement("div");
        col.className = "col";

        // Create card container
        const card = document.createElement("div");
        card.className = "card text-bg-dark h-100";
        const availableFaculty = faculties.filter(f =>
            course.faculties.includes(f._id.toString())
        )
        card.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${course.name}</h5>
                <p class="card-text">Code: ${course.code}</p>
                <p class="card-text">Credit Hours: ${course.ch}</p>

                <label for="faculty-${course._id}" class="form-label">Choose Faculty:</label>
                <select class="form-select mb-2" id="faculty-${course._id}">
                    ${availableFaculty.map(faculty =>
            `<option value="${faculty._id}">${faculty.name} (${faculty.designation})</option>`
        ).join('')}
                </select>
                <button class="btn btn-success enroll-btn" data-course="${course._id}">Enroll</button>
            </div>
        `;

        col.appendChild(card);
        courseList.appendChild(col);
    });

    // Handle enrollment
    courseList.addEventListener("click", async (e) => {
        if (e.target.classList.contains("enroll-btn")) {
            if (noOfCurrentCourses >= 7) {
                alert("You can only enroll in up to 7 courses.");
                return;
            }
            const courseID = e.target.dataset.course;
            const facultyID = document.getElementById(`faculty-${courseID}`).value;

            const enrollRes = await fetch('/student/addCourse', {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ courseID, facultyID })
            });

            const result = await enrollRes.json();
            if (enrollRes.ok) {
                alert("Enrolled successfully!");
                noOfCurrentCourses++;
                e.target.disabled = true;
                e.target.innerText = "Enrolled";
            } else {
                alert(result.message || "Enrollment failed");
            }
        }
    });
}

loadCourses();