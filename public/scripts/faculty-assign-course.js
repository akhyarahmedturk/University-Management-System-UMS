document.addEventListener("DOMContentLoaded", async () => {
    await loadCourses();
});

let noOfCurrentCourses = 0;

async function loadCourses() {
    try {
        const currentRes = await fetch('https://university-management-system-ums-production.up.railway.app/faculty/courses');
        const coursesRes = await fetch('https://university-management-system-ums-production.up.railway.app/course');

        let currentCourses = await currentRes.json();
        let courses = await coursesRes.json();
        currentCourses = currentCourses.courses;
        courses = courses.courses;
        noOfCurrentCourses = currentCourses.length;
        const availableCourses = courses.filter(course => !currentCourses.some(c => c === course._id));
        currentCourses = courses.filter(c => currentCourses.includes(c._id.toString()));

        renderCourseList('current-courses', currentCourses, true);  // true = droppable
        renderCourseList('available-courses', availableCourses, false); // false = assignable
    } catch (err) {
        console.error("Error loading courses", err);
    }
}

function renderCourseList(containerId, courses, isCurrent) {
    const container = document.getElementById(containerId);
    container.innerHTML = '';

    if (!courses.length) {
        container.innerHTML = `<p class="text-muted">${isCurrent ? "No current courses" : "No available courses"}</p>`;
        return;
    }

    courses.forEach(course => {
        const div = document.createElement('div');
        div.className = 'd-flex justify-content-between align-items-center border p-3 mb-2 rounded';
        div.dataset.courseId = `${course._id.toString()}`; // Store course ID for easy access
        div.innerHTML = `
            <div>
                <strong>${course.name}</strong> (${course.code})
            </div>
            <button class="btn btn-${isCurrent ? 'danger' : 'success'} btn-sm">
                ${isCurrent ? 'Drop' : 'Assign'}
            </button>
        `;

        const btn = div.querySelector('button');
        btn.addEventListener('click', () => {
            if (isCurrent) {
                dropCourse(div.dataset.courseId);
            } else {
                assignCourse(div.dataset.courseId);
            }
        });

        container.appendChild(div);
    });
}

async function assignCourse(courseID) {
    try {
        if (noOfCurrentCourses >= 5) {
            alert("You can only teach up to 5 courses at a time.");
            return;
        }
        const res = await fetch('/faculty', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseID })
        });

        if (res.ok) {
            alert("Course assigned!");
            await loadCourses();
        } else {
            const error = await res.json();
            alert("Error: " + error.message);
        }
    } catch (err) {
        console.error(err);
    }
}

async function dropCourse(courseID) {
    try {
        const res = await fetch('/faculty', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ courseID })
        });

        if (res.ok) {
            alert("Course dropped.");
            await loadCourses();
        } else {
            const error = await res.json();
            alert("Error: " + error.message);
        }
    } catch (err) {
        console.error(err);
    }
}
