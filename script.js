
// Ensure displayNotes runs after DOM and localStorage are ready
window.addEventListener('DOMContentLoaded', displayNotes);

const notesList = document.getElementById("notes-list");
const saveBtn = document.getElementById("save-btn");
const noteInput = document.getElementById("note-input");
const groupInput = document.getElementById("group-input");
const statusInput = document.getElementById("status-input");

function statusLabel(status) {
  switch (status) {
    case "not-started": return "Not Started";
    case "in-progress": return "Working On";
    case "completed": return "Completed";
    default: return "";
  }
}

function displayNotes() {
  notesList.innerHTML = "";
  const notes = JSON.parse(localStorage.getItem("notes")) || [];
  // Group notes by tags (comma-separated, lowercased, trimmed)
  const grouped = {};
  notes.forEach((note, idx) => {
    let tags = (note.group || "Ungrouped").split(',').map(t => t.trim().toLowerCase()).filter(Boolean);
    if (tags.length === 0) tags = ["ungrouped"];
    tags.forEach(tag => {
      if (!grouped[tag]) grouped[tag] = [];
      grouped[tag].push({ ...note, idx });
    });
  });
  Object.keys(grouped).forEach(tag => {
    const groupDiv = document.createElement("div");
    groupDiv.className = "note-group";
    groupDiv.textContent = tag.charAt(0).toUpperCase() + tag.slice(1);
    notesList.appendChild(groupDiv);
    grouped[tag].forEach(note => {
      const div = document.createElement("div");
      div.className = "note";
      div.innerHTML = `
        <span class="note-status ${note.status}">
          <select onchange="updateStatus(${note.idx}, this.value)">
            <option value="not-started" ${note.status === 'not-started' ? 'selected' : ''}>Not Started</option>
            <option value="in-progress" ${note.status === 'in-progress' ? 'selected' : ''}>Working On</option>
            <option value="completed" ${note.status === 'completed' ? 'selected' : ''}>Completed</option>
          </select>
        </span>
        <textarea class="edit-note-text" onchange="editNoteText(${note.idx}, this.value)">${note.text}</textarea>
        <input class="edit-note-group" type="text" value="${note.group || ''}" placeholder="Tags (comma separated)" onchange="editNoteGroup(${note.idx}, this.value)">
        <button onclick="deleteNote(${note.idx})">Delete</button>
      `;
      notesList.appendChild(div);
    });
  });
}

window.updateStatus = function(idx, newStatus) {
  const notes = JSON.parse(localStorage.getItem("notes")) || [];
  if (notes[idx]) {
    notes[idx].status = newStatus;
    localStorage.setItem("notes", JSON.stringify(notes));
    displayNotes();
  }
}

window.editNoteText = function(idx, newText) {
  const notes = JSON.parse(localStorage.getItem("notes")) || [];
  if (notes[idx]) {
    notes[idx].text = newText;
    localStorage.setItem("notes", JSON.stringify(notes));
    // No need to refresh display for text edit
  }
}

window.editNoteGroup = function(idx, newGroup) {
  const notes = JSON.parse(localStorage.getItem("notes")) || [];
  if (notes[idx]) {
    notes[idx].group = newGroup;
    localStorage.setItem("notes", JSON.stringify(notes));
    displayNotes();
  }
}

saveBtn.onclick = () => {
  const notes = JSON.parse(localStorage.getItem("notes")) || [];
  const text = noteInput.value.trim();
  const group = groupInput.value.trim();
  const status = statusInput.value;
  if (!text) return;
  notes.push({ text, group, status });
  localStorage.setItem("notes", JSON.stringify(notes));
  noteInput.value = "";
  groupInput.value = "";
  statusInput.value = "not-started";
  displayNotes();
};

function deleteNote(index) {
  const notes = JSON.parse(localStorage.getItem("notes")) || [];
  // Find the note by idx property
  const idx = notes.findIndex((n, i) => i === index);
  if (idx > -1) {
    notes.splice(idx, 1);
    localStorage.setItem("notes", JSON.stringify(notes));
    displayNotes();
  }
}

