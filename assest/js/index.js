let noteApp = document.getElementById('noteApp');
let notesList = document.getElementById('notesList');
let appTitle = document.getElementById('appTitle');
let titleInput = document.getElementById('noteTitleInput');
let contentInput = document.getElementById('noteContentInput');
let newNoteBtn = document.getElementById('noteAddBtn');
let actionButtons = document.getElementById('noteActionButtons');
let openNoteAppBtn = document.getElementById('openNoteAppBtn');
let warningMessage = document.getElementById('warningMessage');

let dragging = false;
let offsetX, offsetY;
let currentNoteIndex = null;
let maximized = false;
let previousDimensions = {};
let minimized = false;
let originalHeight = 0;

function closeApp() {
    noteApp.style.display = 'none';
    openNoteAppBtn.classList.add('show');
}

function openApp() {
    noteApp.style.display = 'flex';
    openNoteAppBtn.classList.remove('show');
}

function minimizeApp() {
    if (minimized) {
        noteApp.style.height = originalHeight;
        noteApp.classList.remove('minimized');
        minimized = false;
    } else {
        originalHeight = noteApp.style.height;
        noteApp.style.height = '70px';
        noteApp.classList.add('minimized');
        minimized = true;
    }
}

function maximizeApp() {
    if (!maximized) {
        previousDimensions = {
            width: noteApp.style.width,
            height: noteApp.style.height,
            top: noteApp.style.top,
            left: noteApp.style.left
        };
        noteApp.style.width = '100%';
        noteApp.style.height = '100%';
        noteApp.style.top = '0';
        noteApp.style.left = '10';
        document.querySelector('.maximize i').classList.replace('fa-window-maximize', 'fa-window-restore');
    } else {
        noteApp.style.width = previousDimensions.width;
        noteApp.style.height = previousDimensions.height;
        noteApp.style.top = previousDimensions.top;
        noteApp.style.left = previousDimensions.left;
        document.querySelector('.maximize i').classList.replace('fa-window-restore', 'fa-window-maximize');
    }
    maximized = !maximized;
}

function initDrag(event) {
    dragging = true;
    offsetX = event.clientX - noteApp.offsetLeft;
    offsetY = event.clientY - noteApp.offsetTop;
    document.addEventListener('mousemove', dragApp);
    document.addEventListener('mouseup', stopDrag);
}

function dragApp(event) {
    if (dragging) {
        noteApp.style.left = `${event.clientX - offsetX}px`;
        noteApp.style.top = `${event.clientY - offsetY}px`;
    }
}

function stopDrag() {
    if (dragging) {
        dragging = false;
        document.removeEventListener('mousemove', dragApp);
        document.removeEventListener('mouseup', stopDrag);
    }
}

function saveNote() {
    let title = titleInput.value;
    let content = contentInput.value;
    let currentTime = new Date().toLocaleTimeString();
    let updatedTimeLine = `\n\nLast updated: ${currentTime}`;

    if (!title) {
        showWarningMessage();
        return;
    }

    if (currentNoteIndex !== null && title) {
        let notes = fetchNotes();
        let note = notes[currentNoteIndex];
        note.title = title;
        note.content = content + updatedTimeLine;
        localStorage.setItem('notes', JSON.stringify(notes));
        renderNotes();
    } else if (title) {
        let note = { title, content: content + updatedTimeLine };
        let notes = fetchNotes();
        notes.push(note);
        localStorage.setItem('notes', JSON.stringify(notes));
        renderNotes();
    }

    // Clear the title and content fields after saving
    titleInput.value = '';
    contentInput.value = '';
    currentNoteIndex = null;
}

function fetchNotes() {
    let notes = localStorage.getItem('notes');
    return notes ? JSON.parse(notes) : [];
}

function renderNotes() {
    notesList.innerHTML = '';
    let notes = fetchNotes();
    notes.forEach((note, index) => {
        let li = document.createElement('li');
        li.textContent = note.title;
        li.onclick = () => showNoteContent(index);
        notesList.appendChild(li);
        addDeleteBtn(li, index);
    });
}

function showNoteContent(index) {
    revealInputs();
    let notes = fetchNotes();
    let note = notes[index];
    titleInput.value = note.title;
    contentInput.value = note.content;
    currentNoteIndex = index;
}

function discardNote() {
    titleInput.style.display = 'none';
    contentInput.style.display = 'none';
    actionButtons.style.display = 'none';
    newNoteBtn.style.display = 'block';
    currentNoteIndex = null;
    titleInput.value = '';
    contentInput.value = '';
}

function revealInputs() {
    titleInput.style.display = 'flex';
    contentInput.style.display = 'block';
    newNoteBtn.style.display = 'none';
    actionButtons.style.display = 'flex';
}

function createNote() {
    titleInput.value = '';
    contentInput.value = '';
    revealInputs();
    currentNoteIndex = null;
}

function addDeleteBtn(element, index) {
    let deleteBtn = document.createElement('span');
    deleteBtn.classList.add('delete-btn');
    deleteBtn.innerHTML = '&#10006;';
    deleteBtn.onclick = function (event) {
        event.stopPropagation();
        removeNote(index);
    };
    element.appendChild(deleteBtn);
}

function removeNote(index) {
    let notes = fetchNotes();
    notes.splice(index, 1);
    localStorage.setItem('notes', JSON.stringify(notes));
    discardNote();
    renderNotes();
}

function showWarningMessage() {
    warningMessage.style.display = 'block';
    setTimeout(() => {
        warningMessage.style.display = 'none';
    }, 3000);
}

renderNotes();
discardNote();
