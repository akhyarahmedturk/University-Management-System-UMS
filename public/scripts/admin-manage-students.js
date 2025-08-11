let deptSelected = 'All';
let semtSelect = 'All';
let min_cgpa = 0;
let max_cgpa = 4;
let students = [];
let departments = [];

document.getElementById('applyFilters').addEventListener('click', () => {
    deptSelected = document.getElementById('departmentFilter').value;
    semtSelect = document.getElementById('semesterFilter').value;
    min_cgpa = Number(document.getElementById('minCGPA').value) || 0;
    max_cgpa = Number(document.getElementById('maxCGPA').value) || 4;
    if (min_cgpa > 4) {
        document.getElementById('minCGPA').value = '4';
        min_cgpa = 4;
    }
    if (max_cgpa > 4) {
        document.getElementById('maxCGPA').value = '4';
        max_cgpa = 4;
    }
    document.getElementById('searchBar').dispatchEvent(new Event('input'));
});

document.getElementById('resetFilters').addEventListener('click', () => {
    deptSelected = 'All';
    semtSelect = 'All';
    min_cgpa = 0;
    max_cgpa = 4;
    document.getElementById('departmentFilter').value = 'All';
    document.getElementById('semesterFilter').value = 'All';
    document.getElementById('minCGPA').value = '';
    document.getElementById('maxCGPA').value = '';
    document.getElementById('searchBar').dispatchEvent(new Event('input'));
});



document.getElementById('searchBar').addEventListener('input', async (e) => {
    const query = e.target.value.trim().toLowerCase();
    const filteredData = students.filter(student =>
        (
            student.name.toLowerCase().includes(query) ||
            student.rollNo.toLowerCase().includes(query) ||
            student.department.toLowerCase().includes(query)
        ) &&
        (deptSelected === 'All' || student.department.toLowerCase() === deptSelected.toLowerCase()) &&
        (semtSelect === 'All' || student.semester === Number(semtSelect)) &&
        (
            (student.cgpa >= min_cgpa && student.cgpa <= max_cgpa)
        )
    );
    renderData(filteredData);
});


async function renderData(data) {
    const resultsDiv = document.getElementById('cards-container');
    resultsDiv.innerHTML = '';
    if (data.length === 0) {
        resultsDiv.innerHTML = '<p>No matching students found.</p>';
        return;
    }
    data.forEach(student => {
        const col = document.createElement("div");
        col.className = "col";
        col.dataset.id = student._id;
        // Create card container
        const card = document.createElement("div");
        card.className = "card text-bg-dark h-100";
        card.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${student.name}</h5>
                <p class="card-text">Roll No: ${student.rollNo}</p>
                <p class="card-text">Department: ${student.department}</p>
                <p class="card-text">Semester: ${student.semester}</p>
                <p class="card-text">CGPA: ${student.cgpa}</p>
                <p class="card-text">Email: ${student.email}</p>
                <button class="update-btn btn btn-success">Update Details</button>
            `;
        col.appendChild(card);
        resultsDiv.appendChild(col);
    });

    resultsDiv.addEventListener("click", (e) => {
        if (e.target.classList.contains("update-btn")) {
            const col = e.target.closest(".col");
            const studentID = col.dataset.id;
            const student = data.find(s => s._id.toString() == studentID);
            // Fill modal inputs with current data
            document.getElementById("updateStudentId").value = student._id; //hidden
            document.getElementById("updateStudentId").type = "hidden";
            document.getElementById("updateName").value = student.name;
            document.getElementById("updateRollNo").value = student.rollNo;
            document.getElementById("updateDepartment").value = student.department;
            document.getElementById("updateSemester").value = student.semester;
            document.getElementById("updateEmail").value = student.email;
            document.getElementById("updatePassword").placeholder = "Leave it blank if you don't want to change";
            // Show modal
            const modal = new bootstrap.Modal(document.getElementById("updateStudentModal"));
            modal.show();
        }
    });
}

document.getElementById("updateStudentModal")// submit ky badd form open / cancel karny per issue tha
    .addEventListener("hidden.bs.modal", () => {
        document.body.classList.remove("modal-open");
        document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());
    });

document.getElementById("saveUpdateBtn").addEventListener("click", async (e) => {
    e.preventDefault(); // prevent page reload
    const studentId = document.getElementById("updateStudentId").value;
    const updatedInfo = {
        studentID: studentId,
        name: document.getElementById("updateName").value,
        rollNo: document.getElementById("updateRollNo").value,
        department: document.getElementById("updateDepartment").value,
        semester: Number(document.getElementById("updateSemester").value),
        email: document.getElementById("updateEmail").value,
        password: document.getElementById("updatePassword").value || undefined
    };

    const res = await updateData(updatedInfo);
    if (res.ok) {
        alert('Student details updated successfully!');
        // Reload data
        // Hide modal
        bootstrap.Modal.getInstance(document.getElementById("updateStudentModal")).hide();
        await loadData();
        renderData(students);
    }
    else {
        const data = await res.json();
        alert(data.message || 'Failed to update student details.');
    }
});
async function updateData(updatedInfo) {
    const res = await fetch(`http://localhost:3500/student/profile`, {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedInfo)
    });
    return res;
}

async function loadData() {
    try {
        const res = await fetch('http://localhost:3500/student');
        const data = await res.json();
        students = data.students;
        departments = [...new Set(students.map(s => s.department))];
    } catch (error) {
        console.error('Error loading student data:', error);
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
}

window.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    renderPage();
    renderData(students);
});