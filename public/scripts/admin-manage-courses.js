let facultySelected = 'All';
let departmentSelected = "All";
let courses = [];
let faculties = [];
let departments = [];

document.getElementById('applyFilters').addEventListener('click', () => {
    facultySelected = document.getElementById('facultyFilter').value;
    departmentSelected = document.getElementById('departmentFilter').value;
    document.getElementById('searchBar').dispatchEvent(new Event('input'));
});

document.getElementById('resetFilters').addEventListener('click', () => {
    facultySelected = 'All';
    departmentSelected = 'All';
    document.getElementById('departmentFilter').value = 'All';
    document.getElementById('facultyFilter').value = 'All';
    document.getElementById('searchBar').dispatchEvent(new Event('input'));
});



document.getElementById('searchBar').addEventListener('input', async (e) => {
    const query = e.target.value.trim().toLowerCase();
    const filteredData = courses.filter(course =>
        (
            course.name.toLowerCase().includes(query) ||
            course.code.toLowerCase().includes(query)
        ) &&
        (departmentSelected === 'All' || course.code.toLowerCase().includes(departmentSelected.toLowerCase())) &&
        (facultySelected === 'All' || course.faculties.includes(facultySelected))
    );
    renderData(filteredData);
});


async function renderData(data) {
    const resultsDiv = document.getElementById('cards-container');
    resultsDiv.innerHTML = '';
    if (data.length === 0) {
        resultsDiv.innerHTML = '<p>No matching courses found.</p>';
        return;
    }
    data.forEach(course => {
        const col = document.createElement("div");
        col.className = "col";
        col.dataset.id = course._id;
        // Create card container
        const card = document.createElement("div");
        card.className = "card text-bg-dark h-100";
        card.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${course.name}</h5>
                <p class="card-text">Course Code: ${course.code}</p>
                <p class="card-text">Credit Hours: ${course.ch}</p>
                <p class="faculties-data card-text">Faculties: ${course.faculties_name.join(", ")}</p>
                <button class="update-btn btn btn-success">Update Details</button>
            `;
        col.appendChild(card);
        resultsDiv.appendChild(col);
    });

    resultsDiv.addEventListener("click", (e) => {
        if (e.target.classList.contains("update-btn")) {
            const col = e.target.closest(".col");
            const courseID = col.dataset.id;
            const course = data.find(c => c._id.toString() == courseID);
            // Fill modal inputs with current data
            document.getElementById("updateCourseId").value = course._id; //hidden
            document.getElementById("updateCourseId").type = "hidden";
            document.getElementById("updateName").value = course.name;
            document.getElementById("updateCourseCode").value = course.code;
            document.getElementById("updateCreditHours").value = course.ch;
            // Show modal
            const modal = new bootstrap.Modal(document.getElementById("updateCourseModal"));
            modal.show();
        }
    });
}

document.getElementById("updateCourseModal")// submit ky badd form open / cancel karny per issue tha
    .addEventListener("hidden.bs.modal", () => {
        document.body.classList.remove("modal-open");
        document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());
    });

document.getElementById("saveUpdateBtn").addEventListener("click", async (e) => {
    e.preventDefault(); // prevent page reload
    const courseId = document.getElementById("updateCourseId").value;
    const ch = document.getElementById("updateCreditHours");
    if (ch.value < 1 || ch.value > 4) {
        alert("Invalid credit hours. Please enter a value between 1 and 4.");
        return;
    }
    const updatedInfo = {
        courseID: courseId,
        name: document.getElementById("updateName").value,
        code: document.getElementById("updateCourseCode").value,
        ch: parseInt(ch.value),
    };

    const res = await updateData(updatedInfo);
    if (res.ok) {
        alert('Course details updated successfully!');
        // Reload data
        // Hide modal
        bootstrap.Modal.getInstance(document.getElementById("updateCourseModal")).hide();
        await loadCourses();
        renderData(courses);
    }
    else {
        const data = await res.json();
        alert(data.message || 'Failed to update course details.');
    }
});
async function updateData(updatedInfo) {
    const res = await fetch(`http://localhost:3500/course`, {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedInfo)
    });
    return res;
}

async function loadCourses() {
    try {
        const res = await fetch('http://localhost:3500/course');
        const data = await res.json();
        courses = data.courses;
        departments = [...new Set(courses.map(course => course.code.split('-')[0]))];
        courses.forEach(course => {
            course.faculties_name = course.faculties.map(facultyId => {
                const facultyObj = faculties.find(f => f._id === facultyId);
                return facultyObj ? facultyObj.name : null; // or "" if you want empty string
            });
        });

    } catch (error) {
        console.error('Error loading course data:', error);
    }
}

async function loadFaculties() {
    try {
        const res = await fetch('http://localhost:3500/faculty/faculties');
        const data = await res.json();
        faculties = data.faculty;
        faculties = faculties.filter(faculty => (faculty.courses && faculty.courses.length > 0));
    } catch (error) {
        console.error('Error loading faculty data:', error);
    }
}

async function renderPage() {
    const deptSelect = document.getElementById('departmentFilter');
    departments.forEach(dept => {
        const option = document.createElement('option');
        option.value = dept;
        option.textContent = dept;
        deptSelect.appendChild(option);
    });
    const facultySelect = document.getElementById('facultyFilter');
    faculties.forEach(fac => {
        const option = document.createElement('option');
        option.value = fac._id;
        option.textContent = fac.name;
        facultySelect.appendChild(option);
    });
}

window.addEventListener('DOMContentLoaded', async () => {
    await loadFaculties();
    await loadCourses();
    renderPage();
    renderData(courses);
});