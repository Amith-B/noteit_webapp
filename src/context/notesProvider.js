/*global chrome*/
import NotesContext from "./notesContext";
import { useState, useEffect, useMemo } from "react";
import initialData from "./initialData";

export default function PuzzleProvider({ children }) {
  const [notes, setNotes] = useState(initialData.notes);
  const [activeFolderId, setActiveFolderId] = useState(
    initialData.activeFolderId
  );
  const themes = initialData.themes;
  const [activeTheme, setActiveTheme] = useState(initialData.activeTheme);
  const [isSaved, setIsSaved] = useState(0); // 0 - not saved, 1 - saved, 2 - error

  const setActiveNoteId = (folderId, activeNodeId) => {
    const data = { ...notes };
    data[folderId].activeNoteId = activeNodeId;
    setNotes(data);
  };

  const addNote = () => {
    const data = { ...notes };
    const newNoteId = "note_" + new Date().getTime().toString();
    if (activeFolderId && Reflect.has(data, activeFolderId)) {
      data[activeFolderId].list.push({
        id: newNoteId,
        title: "New Note",
        content: "",
      });
      setActiveNoteId(activeFolderId, newNoteId);
      setNotes(data);
    }
  };

  const addFolder = () => {
    const data = { ...notes };
    const newFolderId = "folder_" + new Date().getTime().toString();
    data[newFolderId] = {
      folderName: "New Folder",
      activeNoteId: "",
      list: [],
    };
    setNotes(data);
    setActiveFolderId(newFolderId);
  };

  const closeTab = (folderId, noteId) => {
    if (Reflect.has(notes, folderId)) {
      const data = { ...notes };
      data[folderId].list = data[folderId].list.filter(
        (note) => note.id !== noteId
      );
      setNotes(data);
      if (data[folderId].activeNoteId === noteId) {
        setActiveNoteId(folderId, "");
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

  const updateNotes = (folderId, noteId, title, content) => {
    if (Reflect.has(notes, folderId)) {
      const data = { ...notes };
      data[folderId].list = data[folderId].list.map((note) => {
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
    folderData.folderName = newName;
    setNotes(data);
  };

  const activeNoteId = useMemo(
    () => notes[activeFolderId]?.activeNoteId,
    [notes, activeFolderId]
  );

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

          if (!Object.keys(notes).length) {
            setActiveFolderId("");
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
