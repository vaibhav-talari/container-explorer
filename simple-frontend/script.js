const API_URL = "http://localhost:8000";

async function fetchTasks() {
  const res = await fetch(`${API_URL}/tasks`);
  const data = await res.json();
  const list = document.getElementById("taskList");
  list.innerHTML = "";
  data.forEach((task) => {
    const li = document.createElement("li");
    li.textContent = `${task.id}. ${task.title}`;
    list.appendChild(li);
  });
}

async function addTask() {
  const title = document.getElementById("title").value.trim();
  if (!title) return alert("Enter a task title!");
  const id = Date.now();
  await fetch(`${API_URL}/tasks`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id, title }),
  });
  document.getElementById("title").value = "";
  fetchTasks();
}

fetchTasks();
