/*global chrome*/
import NotesContext from "./notesContext";
import { useState, useEffect } from "react";
import initialData from "./initialData";

export default function PuzzleProvider({ children }) {
  const [notes, setNotes] = useState(initialData.notes);
  const [activeNoteId, setActiveNoteId] = useState(initialData.activeNoteId);
  const themes = initialData.themes;
  const [activeTheme, setActiveTheme] = useState(initialData.activeTheme);
  const [isSaved, setIsSaved] = useState(true);

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
    setIsSaved(false);
    const timmer = setTimeout(() => {
      chrome &&
        chrome.storage &&
        chrome.storage.sync.set({ notes: notes }, function () {
          console.log("Notes Updated");
        });
      setIsSaved(true);
    }, 1000);

    return () => clearTimeout(timmer);
  }, [notes]);

  useEffect(() => {
    setIsSaved(false);
    const timmer = setTimeout(() => {
      chrome &&
        chrome.storage &&
        chrome.storage.sync.set({ activeNoteId: activeNoteId }, function () {
          console.log("Active Note Changed");
        });
      setIsSaved(true);
    }, 100);

    return () => clearTimeout(timmer);
  }, [activeNoteId]);

  useEffect(() => {
    setIsSaved(false);
    const timmer = setTimeout(() => {
      chrome &&
        chrome.storage &&
        chrome.storage.sync.set({ activeTheme: activeTheme }, function () {
          console.log("Theme Changed");
        });
      setIsSaved(true);
    }, 100);

    return () => clearTimeout(timmer);
  }, [activeTheme]);

  useEffect(() => {
    if (chrome.storage) {
      chrome.storage.sync.get(["notes"], function (result) {
        setNotes(result.notes);
      });
      chrome.storage.sync.get(["activeTheme"], function (result) {
        setActiveTheme(result.activeTheme);
      });
      chrome.storage.sync.get(["activeNoteId"], function (result) {
        setActiveNoteId(result.activeNoteId);
      });
    }
  }, []);

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
        isSaved,
        setIsSaved,
        addNote,
        closeTab,
        updateNotes,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}
