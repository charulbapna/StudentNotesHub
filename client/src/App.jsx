
import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:5001/api/notes";

function App() {
  const [notes, setNotes] = useState([]);
  const [search, setSearch] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    subject: "",
    content: "",
    tags: "",
  });

  async function fetchNotes() {
    try {
      setError("");
      const response = await axios.get(API);
      setNotes(response.data);
    } catch (err) {
      setError("Could not load notes. Check that your backend is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchNotes();
  }, []);

  function handleChange(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function openNewForm() {
    setForm({ title: "", subject: "", content: "", tags: "" });
    setEditingId(null);
    setShowForm(true);
  }

  function openEditForm(note) {
    setForm({
      title: note.title,
      subject: note.subject,
      content: note.content,
      tags: (note.tags || []).join(", "),
    });
    setEditingId(note._id);
    setShowForm(true);
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const payload = {
      title: form.title.trim(),
      subject: form.subject.trim(),
      content: form.content.trim(),
      tags: form.tags.split(",").map((tag) => tag.trim()).filter(Boolean),
    };

    try {
      setError("");

      if (editingId) {
        await axios.put(`${API}/${editingId}`, payload);
      } else {
        await axios.post(API, payload);
      }

      setShowForm(false);
      setEditingId(null);
      await fetchNotes();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save the note.");
    }
  }

  async function deleteNote(id) {
    if (!window.confirm("Are you sure you want to delete this note?")) {
      return;
    }

    try {
      setError("");
      await axios.delete(`${API}/${id}`);
      await fetchNotes();
    } catch (err) {
      setError(err.response?.data?.message || "Could not delete the note.");
    }
  }

  const filteredNotes = notes.filter((note) => {
    const query = search.toLowerCase();

    return (
      note.title.toLowerCase().includes(query) ||
      note.subject.toLowerCase().includes(query) ||
      note.content.toLowerCase().includes(query) ||
      (note.tags || []).some((tag) => tag.toLowerCase().includes(query))
    );
  });

  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">StudySpace<span>.</span></div>
        <p className="sidebar-label">WORKSPACE</p>
        <button className="nav-item active" onClick={() => setSearch("")}>
          📚 All Notes
        </button>
        <p className="sidebar-footer">Your knowledge, organized.</p>
      </aside>

      <main className="main">
        <header className="topbar">
          <div>
            <p className="eyebrow">YOUR PERSONAL LIBRARY</p>
            <h1>Student Notes</h1>
            <p className="subtitle">Keep your learning organized, one note at a time.</p>
          </div>
          <button className="primary-btn" onClick={openNewForm}>
            + Create Note
          </button>
        </header>

        <section className="toolbar">
          <input
            className="search"
            type="search"
            placeholder="Search notes, subjects, or tags..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
          <span className="note-count">{notes.length} notes</span>
        </section>

        {error && <div className="error">{error}</div>}

        {showForm && (
          <form className="note-form" onSubmit={handleSubmit}>
            <h2>{editingId ? "Edit Note" : "Create a Note"}</h2>

            <label>
              Title
              <input
                name="title"
                value={form.title}
                onChange={handleChange}
                placeholder="e.g. Linked List Basics"
                required
              />
            </label>

            <label>
              Subject
              <input
                name="subject"
                value={form.subject}
                onChange={handleChange}
                placeholder="e.g. Data Structures"
                required
              />
            </label>

            <label>
              Content
              <textarea
                name="content"
                value={form.content}
                onChange={handleChange}
                placeholder="Write your notes here..."
                rows="5"
                required
              />
            </label>

            <label>
              Tags (comma-separated)
              <input
                name="tags"
                value={form.tags}
                onChange={handleChange}
                placeholder="C++, DSA, Exam"
              />
            </label>

            <div className="form-actions">
              <button className="primary-btn" type="submit">
                {editingId ? "Save Changes" : "Save Note"}
              </button>
              <button
                className="secondary-btn"
                type="button"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <p className="message">Loading your notes...</p>
        ) : filteredNotes.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📖</div>
            <h2>{search ? "No matching notes" : "Your notebook awaits"}</h2>
            <p>
              {search
                ? "Try another search term."
                : "Create your first note and start building your library."}
            </p>
            {!search && (
              <button className="primary-btn" onClick={openNewForm}>
                Create your first note
              </button>
            )}
          </div>
        ) : (
          <section className="notes-grid">
            {filteredNotes.map((note) => (
              <article className="note-card" key={note._id}>
                <div className="card-top">
                  <span className="subject">{note.subject}</span>
                  <span className="card-icon">📝</span>
                </div>

                <h2>{note.title}</h2>
                <p className="note-content">{note.content}</p>

                <div className="tags">
                  {(note.tags || []).map((tag, index) => (
                    <span className="tag" key={`${tag}-${index}`}>
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="card-footer">
                  <span>
                    {new Date(note.updatedAt).toLocaleDateString()}
                  </span>
                  <div className="card-actions">
                    <button onClick={() => openEditForm(note)}>Edit</button>
                    <button
                      className="delete-btn"
                      onClick={() => deleteNote(note._id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
