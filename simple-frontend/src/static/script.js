// since the javascript code loads on the user browser
// the url should point to the one accessible from the user
//i.e url accessible outside the container
//we assume the port 8000 is where backend service is accessible.
const API_URL = "http://localhost:8000";

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
    console.error("error fetching users:", err);
  }
}

async function addUser() {
  const name = document.getElementById("name").value.trim();
  const role = document.getElementById("role").value.trim();

  if (!name || !role) {
    alert("enter both name and role.");
    return;
  }

  try {
    await fetch(`${API_URL}/user`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      //in es6 have '{}' in stringigy will convert to json
      //JSON.stringify({ name, role }) => {"name": "john", "role": "admin"}
      //without {} will result in a string
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
