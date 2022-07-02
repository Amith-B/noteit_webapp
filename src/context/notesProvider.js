/*global chrome*/
import NotesContext from "./notesContext";
import { useState, useEffect } from "react";
import initialData from "./initialData";

export default function PuzzleProvider({ children }) {
  const [notes, setNotes] = useState(initialData.notes);
  const [activeNoteId, setActiveNoteId] = useState(initialData.activeNoteId);
  const [activeFolderId, setActiveFolderId] = useState(
    initialData.activeFolderId
  );
  const themes = initialData.themes;
  const [activeTheme, setActiveTheme] = useState(initialData.activeTheme);
  const [isSaved, setIsSaved] = useState(0); // 0 - not saved, 1 - saved, 2 - error

  const addNote = () => {
    const data = { ...notes };
    const newNoteId = new Date().getTime().toString();
    if (activeFolderId && Reflect.has(data, activeFolderId)) {
      data[activeFolderId].push({
        id: newNoteId,
        title: "New Note",
        content: "",
      });
      setActiveNoteId(newNoteId);
      setNotes(data);
    }
  };

  const addFolder = () => {
    const data = { ...notes };
    const newFolderId = "newFolder_" + new Date().getTime().toString();
    data[newFolderId] = [];
    setNotes(data);
    setActiveFolderId(newFolderId);
  };

  const closeTab = (noteId) => {
    if (activeFolderId && Reflect.has(notes, activeFolderId)) {
      const data = { ...notes };
      data[activeFolderId] = data[activeFolderId].filter(
        (note) => note.id !== noteId
      );
      setNotes(data);
      if (activeNoteId === noteId) {
        setActiveNoteId("");
      }
    }
  };

  const closeFolder = (folderId) => {
    const data = { ...notes };
    Reflect.deleteProperty(data, folderId);
    setNotes(data);
    if (folderId === activeFolderId) {
      setActiveFolderId("");
    }
  };

  const updateNotes = (noteId, title, content) => {
    if (activeFolderId && Reflect.has(notes, activeFolderId)) {
      const data = { ...notes };
      data[activeFolderId] = data[activeFolderId].map((note) => {
        if (note.id === noteId) {
          return {
            id: noteId,
            title,
            content,
          };
        }

        return note;
      });
      setNotes(data);
    }
  };

  const renameFolder = (folderId, newName) => {
    const data = { ...notes };
    const folderData = data[folderId];
    Reflect.deleteProperty(data, folderId);
    const newFolderId = newName + "_" + new Date().getTime().toString();
    data[newFolderId] = folderData;
    if (activeFolderId === folderId) {
      setActiveFolderId(newFolderId);
    }
    setNotes(data);
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
    setActiveNoteId("");
    const timmer = setTimeout(() => {
      chrome &&
        chrome.storage &&
        chrome.storage.local.set(
          { activeFolderId: activeFolderId },
          function () {
            console.log("Active Folder Changed");
          }
        );
    }, 100);

    return () => clearTimeout(timmer);
  }, [activeFolderId]);

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
      chrome.storage.local.get(["activeFolderId"], function (result) {
        if (result.activeFolderId) {
          setActiveFolderId(result.activeFolderId);
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
        activeFolderId,
        setActiveFolderId,
        themes,
        activeTheme,
        setActiveTheme,
        isSaved,
        setIsSaved,
        addNote,
        addFolder,
        renameFolder,
        closeTab,
        closeFolder,
        updateNotes,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}
