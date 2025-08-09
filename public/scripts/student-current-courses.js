const courseList = document.getElementById("course-list");

async function loadCourses() {
    try {
        const coursesRes = await fetch('http://localhost:3500/course');
        const currentCoursesRes = await fetch('http://localhost:3500/student/currentCourses');
        let facultiesRes = await fetch('http://localhost:3500/faculty/faculties');

        if (!coursesRes.ok || !currentCoursesRes.ok || !facultiesRes.ok) {
            throw new Error('Failed to fetch course data');
        }
        let courses = await coursesRes.json();
        courses = courses.courses;
        let currentCourses = await currentCoursesRes.json();
        currentCourses = currentCourses.courses;
        let faculties = await facultiesRes.json();
        faculties = faculties.faculty;
        // Convert courses and faculties to a lookup object for easier access by ID
        const courseMap = {};
        for (const course of courses) {
            courseMap[course._id.toString()] = course;
        }

        const facultyMap = {};
        for (const faculty of faculties) {
            facultyMap[faculty._id.toString()] = faculty;
        }

        // Now create the final array with enriched data
        const finalCourses = currentCourses.map(current => {
            const course = courseMap[current.course];
            const faculty = facultyMap[current.faculty];

            return {
                name: course?.name || 'Unknown',
                code: course?.code || 'Unknown',
                ch: course?.ch || 'Unknown',
                faculty: faculty?.name || 'Unknown'
            };
        });

        renderCourses(finalCourses);
    } catch (err) {
        console.error('Error fetching courses:', err);
    }
};

async function renderCourses(courses) {
    if (courses.length === 0) {
        courseList.innerHTML = `<p class="text-white">No current courses.</p>`;
    }
    courses.forEach(course => {
        const col = document.createElement("div");
        col.className = "col";
        // Create card container
        const card = document.createElement("div");
        card.className = "card text-bg-dark h-100";
        card.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${course.name}</h5>
                <p class="card-text">Code: ${course.code}</p>
                <p class="card-text">Credit Hours: ${course.ch}</p
                <p class="card-text">Faculty: ${course.faculty}</p>
            `;

        col.appendChild(card);
        courseList.appendChild(col);
    });
}

loadCourses();