const API_URL = "http://localhost:8080";

async function fetchUsers() {
  try {
    const res = await fetch(`${API_URL}/user`);
    const data = await res.json();

    const tbody = document.querySelector("#userTable tbody");
    tbody.innerHTML = "";

    if (data.length === 0) {
      const row = document.createElement("tr");
      row.innerHTML = `<td colspan="3">No users found</td>`;
      tbody.appendChild(row);
      return;
    }

    data.forEach((user) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${user.id}</td>
        <td>${user.name}</td>
        <td>${user.role}</td>
      `;
      tbody.appendChild(row);
    });
  } catch (err) {
    console.error("Error fetching users:", err);
  }
}

async function addUser() {
  const name = document.getElementById("name").value.trim();
  const role = document.getElementById("role").value.trim();

  if (!name || !role) {
    alert("Please enter both name and role.");
    return;
  }

  try {
    await fetch(`${API_URL}/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, role }),
    });
    document.getElementById("name").value = "";
    document.getElementById("role").value = "";
    fetchUsers();
  } catch (err) {
    console.error("Error adding user:", err);
  }
}

fetchUsers();
