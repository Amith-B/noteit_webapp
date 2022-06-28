/*global chrome*/
import NotesContext from "./notesContext";
import { useState, useEffect } from "react";
import initialData from "./initialData";

export default function PuzzleProvider({ children }) {
  const [notes, setNotes] = useState(initialData.notes);
  const [activeNoteId, setActiveNoteId] = useState(initialData.activeNoteId);
  const themes = initialData.themes;
  const [activeTheme, setActiveTheme] = useState(initialData.activeTheme);
  const [isSaved, setIsSaved] = useState(0); // 0 - not saved, 1 - saved, 2 - error

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
    setIsSaved(0);
    const timmer = setTimeout(() => {
      chrome &&
        chrome.storage &&
        chrome.storage.local.set({ notes: notes }, function () {
          console.log("Notes Updated");
          const error = chrome.runtime.lastError;
          if (error) {
            console.log("Storage Exceeded");
            setIsSaved(2);
          }
        });
      setIsSaved(1);
    }, 1000);

    return () => clearTimeout(timmer);
  }, [notes]);

  useEffect(() => {
    const timmer = setTimeout(() => {
      chrome &&
        chrome.storage &&
        chrome.storage.local.set({ activeNoteId: activeNoteId }, function () {
          console.log("Active Note Changed");
        });
    }, 100);

    return () => clearTimeout(timmer);
  }, [activeNoteId]);

  useEffect(() => {
    setIsSaved(0);
    const timmer = setTimeout(() => {
      chrome &&
        chrome.storage &&
        chrome.storage.local.set({ activeTheme: activeTheme }, function () {
          console.log("Theme Changed");
        });
      setIsSaved(1);
    }, 100);

    return () => clearTimeout(timmer);
  }, [activeTheme]);

  useEffect(() => {
    if (chrome.storage) {
      chrome.storage.local.get(["notes"], function (result) {
        if (result.notes) {
          setNotes(result.notes);
        }
      });
      chrome.storage.local.get(["activeTheme"], function (result) {
        if (result.activeTheme) {
          setActiveTheme(result.activeTheme);
        }
      });
      chrome.storage.local.get(["activeNoteId"], function (result) {
        if (result.activeNoteId) {
          setActiveNoteId(result.activeNoteId);
        }
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
