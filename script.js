let notes = JSON.parse(localStorage.getItem('md-notes') || '[]');
let currentId = null;
let isPreview = false;

function saveToStorage() {
  localStorage.setItem('md-notes', JSON.stringify(notes));
}

function newNote() {
  const note = {
    id: Date.now(),
    title: 'Untitled Note',
    content: '',
    date: new Date().toLocaleDateString()
  };
  notes.unshift(note);
  saveToStorage();
  renderNotesList();
  openNote(note.id);
}

function openNote(id) {
  currentId = id;
  const note = notes.find(n => n.id === id);
  if (!note) return;

  document.getElementById('noteTitle').value = note.title;
  document.getElementById('editor').value = note.content;
  updatePreview();
  updateStats();
  renderNotesList();

  if (isPreview) {
    document.getElementById('editor').classList.add('hidden');
    document.getElementById('preview').classList.remove('hidden');
  }
}

function saveCurrentNote() {
  if (!currentId) return;
  const note = notes.find(n => n.id === currentId);
  if (!note) return;
  note.title = document.getElementById('noteTitle').value || 'Untitled Note';
  note.content = document.getElementById('editor').value;
  note.date = new Date().toLocaleDateString();
  saveToStorage();
  renderNotesList();
  updateStats();
  document.getElementById('saveStatus').textContent = 'Saved ✓';
  setTimeout(() => {
    document.getElementById('saveStatus').textContent = '';
  }, 1500);
}

function deleteNote() {
  if (!currentId) return;
  if (!confirm('Delete this note?')) return;
  notes = notes.filter(n => n.id !== currentId);
  saveToStorage();
  currentId = null;
  document.getElementById('noteTitle').value = '';
  document.getElementById('editor').value = '';
  document.getElementById('preview').innerHTML = '';
  document.getElementById('saveStatus').textContent = 'No note selected';
  renderNotesList();
}

function renderNotesList() {
  const query = document.getElementById('searchInput').value.toLowerCase();
  const filtered = notes.filter(n =>
    n.title.toLowerCase().includes(query) ||
    n.content.toLowerCase().includes(query)
  );

  const list = document.getElementById('notesList');
  list.innerHTML = '';

  if (filtered.length === 0) {
    list.innerHTML = '<li style="padding:16px;color:#404050;font-size:0.85rem;">No notes found</li>';
    return;
  }

  filtered.forEach(note => {
    const li = document.createElement('li');
    li.className = `note-item ${note.id === currentId ? 'active' : ''}`;
    li.onclick = () => openNote(note.id);
    li.innerHTML = `
      <div class="note-item-title">${note.title}</div>
      <div class="note-item-preview">${note.content.slice(0, 60) || 'Empty note'}</div>
      <div class="note-item-date">${note.date}</div>
    `;
    list.appendChild(li);
  });
}

function searchNotes() { renderNotesList(); }

function updatePreview() {
  const content = document.getElementById('editor').value;
  document.getElementById('preview').innerHTML = marked.parse(content);
}

function toggleView() {
  isPreview = !isPreview;
  const editor = document.getElementById('editor');
  const preview = document.getElementById('preview');
  const btn = document.getElementById('viewToggle');

  if (isPreview) {
    updatePreview();
    editor.classList.add('hidden');
    preview.classList.remove('hidden');
    btn.textContent = '✏️ Edit';
  } else {
    editor.classList.remove('hidden');
    preview.classList.add('hidden');
    btn.textContent = '👁 Preview';
  }
}

function insertMd(before, after) {
  const ta = document.getElementById('editor');
  const start = ta.selectionStart;
  const end = ta.selectionEnd;
  const selected = ta.value.substring(start, end);
  const newText = before + selected + after;
  ta.value = ta.value.substring(0, start) + newText + ta.value.substring(end);
  ta.selectionStart = start + before.length;
  ta.selectionEnd = start + before.length + selected.length;
  ta.focus();
  saveCurrentNote();
  updatePreview();
}

function updateStats() {
  const content = document.getElementById('editor').value;
  const words = content.trim() === '' ? 0 : content.trim().split(/\s+/).length;
  document.getElementById('wordCount').textContent = `${words} words`;
  document.getElementById('charCount').textContent = `${content.length} chars`;
}

window.onload = () => {
  renderNotesList();
  if (notes.length > 0) openNote(notes[0].id);
};