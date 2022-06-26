import NotesContext from "./notesContext";

import { useState, useEffect } from "react";

import initialData from "./initialData";

export default function PuzzleProvider({ children }) {
  const [notes, setNotes] = useState(initialData.notes);
  const [activeNoteId, setActiveNoteId] = useState(initialData.activeNoteId);
  const themes = initialData.themes;
  const [activeTheme, setActiveTheme] = useState(initialData.activeTheme);

  const addNote = () => {
    setNotes((lst) => {
      const notesList = [...lst];
      const newNoteId = new Date().getTime().toString();
      notesList.push({ id: newNoteId, title: "New Note", content: "" });
      setActiveNoteId(newNoteId);
      return notesList;
    });
  };

  const closeTab = (noteId) => {
    setNotes(notes.filter((note) => note.id !== noteId));
    if (activeNoteId === noteId) {
      setActiveNoteId("");
    }
  };

  const updateNotes = (noteId, title, content) => {
    const updatedNotesList = notes.map((note) => {
      if (note.id === noteId) {
        return {
          id: noteId,
          title,
          content,
        };
      }

      return note;
    });

    setNotes(updatedNotesList);
  };

  useEffect(() => {
    console.log(notes);
  }, [notes]);

  return (
    <NotesContext.Provider
      value={{
        notes,
        setNotes,
        activeNoteId,
        setActiveNoteId,
        themes,
        activeTheme,
        setActiveTheme,
        addNote,
        closeTab,
        updateNotes,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}
