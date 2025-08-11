let designationSelected = 'All';
let faculty = [];

document.getElementById('applyFilters').addEventListener('click', () => {
    designationSelected = document.getElementById('designationFilter').value;
    document.getElementById('searchBar').dispatchEvent(new Event('input'));
});

document.getElementById('resetFilters').addEventListener('click', () => {
    designationSelected = 'All';
    document.getElementById('designationFilter').value = 'All';
    document.getElementById('searchBar').dispatchEvent(new Event('input'));
});

document.getElementById('searchBar').addEventListener('input', async (e) => {
    const query = e.target.value.trim().toLowerCase();
    const filteredData = faculty.filter(facultyMember =>
        (
            facultyMember.name.toLowerCase().includes(query)
        ) 
        &&
        (designationSelected === 'All' || facultyMember.designation.toLowerCase() === designationSelected.toLowerCase())
    );
    renderData(filteredData);
});


async function renderData(data) {
    const resultsDiv = document.getElementById('cards-container');
    resultsDiv.innerHTML = '';
    if (data.length === 0) {
        resultsDiv.innerHTML = '<p>No matching faculty found.</p>';
        return;
    }
    data.forEach(facultyMember => {
        const col = document.createElement("div");
        col.className = "col";
        col.dataset.id = facultyMember._id;
        // Create card container
        const card = document.createElement("div");
        card.className = "card text-bg-dark h-100";
        card.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${facultyMember.name}</h5>
                <p class="card-text">Designation: ${facultyMember.designation}</p>
                <p class="card-text">Email: ${facultyMember.email}</p>               
                <button class="update-btn btn btn-success">Update Details</button>
            `;
        col.appendChild(card);
        resultsDiv.appendChild(col);
    });

    resultsDiv.addEventListener("click", (e) => {
        if (e.target.classList.contains("update-btn")) {
            const col = e.target.closest(".col");
            const facultyID = col.dataset.id;
            const facultyMember = data.find(f => f._id.toString() == facultyID);
            // Fill modal inputs with current data
            document.getElementById("updateFacultyId").value = facultyMember._id; //hidden
            document.getElementById("updateFacultyId").type = "hidden";
            document.getElementById("updateName").value = facultyMember.name;
            document.getElementById("updateEmail").value = facultyMember.email;
            document.getElementById("updateDesignation").value = facultyMember.designation;
            document.getElementById("updatePassword").placeholder = "Leave it blank if you don't want to change";
            // Show modal
            const modal = new bootstrap.Modal(document.getElementById("updateFacultyModal"));
            modal.show();
        }
    });
}

document.getElementById("updateFacultyModal")// submit ky badd form open / cancel karny per issue tha
    .addEventListener("hidden.bs.modal", () => {
        document.body.classList.remove("modal-open");
        document.querySelectorAll(".modal-backdrop").forEach(el => el.remove());
    });

document.getElementById("saveUpdateBtn").addEventListener("click", async (e) => {
    e.preventDefault(); // prevent page reload
    const facultyId = document.getElementById("updateFacultyId").value;
    const updatedInfo = {
        facultyID: facultyId,
        name: document.getElementById("updateName").value,
        email: document.getElementById("updateEmail").value,
        designation: document.getElementById("updateDesignation").value,
        password: document.getElementById("updatePassword").value || undefined
    };

    const res = await updateData(updatedInfo);
    if (res.ok) {
        alert('Faculty details updated successfully!');
        // Hide modal
        bootstrap.Modal.getInstance(document.getElementById("updateFacultyModal")).hide();
        // Reload data
        await loadData();
        renderData(faculty);
    }
    else{
        const data = await res.json();
        alert(data.message || 'Failed to update faculty details.');
    }
});
async function updateData(updatedInfo) {
    const res = await fetch(`http://localhost:3500/faculty`, {
        method: 'PUT',
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedInfo)
    });
    return res;
}

async function loadData() {
    try {
        const res = await fetch('http://localhost:3500/faculty/faculties');
        const data = await res.json();
        faculty = data.faculty;
    } catch (error) {
        console.error('Error loading faculty data:', error);
    }
}


window.addEventListener('DOMContentLoaded', async () => {
    await loadData();
    renderData(faculty);
});