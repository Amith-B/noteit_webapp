import { useEffect, useMemo, useState } from "react";

/*global chrome*/
import NotesContext from "./notesContext";
import axios from "axios";
import { getUrl } from "../utils/api";
import initialData from "./initialData";

export default function NotesProvider({ children }) {
  const [folders, setFolders] = useState(initialData.folders);
  const [activeFolder, setActiveFolder] = useState(initialData.activeFolder);
  const themes = initialData.themes;
  const [activeTheme, setActiveTheme] = useState(initialData.activeTheme);
  const [isSaved, setIsSaved] = useState(1); // 0 - not saved, 1 - saved, 2 - error

  const setActiveNoteId = (folderId, activeNoteId) => {
    const newFolderList = folders.map((folder) => {
      if (folder._id === folderId) {
        const activeFolderData = {
          ...activeFolder,
          activeNoteId: activeNoteId,
        };
        setActiveFolder(activeFolderData);
        return activeFolderData;
      }
      return folder;
    });

    setFolders(newFolderList);

    axios.patch(getUrl(`folder/${folderId}/activenote`), {
      activeNoteId,
    });
  };

  const addNote = async () => {
    if (!activeFolder._id) {
      return;
    }

    const newNote = (
      await axios.post(getUrl(`notes/${activeFolder._id}/add`), {
        title: "New Note",
        content: "",
      })
    ).data;

    const updatedFolder = folders.map((folder) => {
      if (folder._id === newNote.folderId) {
        return {
          ...folder,
          notes: folder.notes.concat(newNote),
        };
      }

      return folder;
    });

    setFolders(updatedFolder);

    setActiveFolder({
      ...activeFolder,
      activeNoteId: newNote._id,
      notes: activeFolder.notes.concat(newNote),
    });
  };

  const addFolder = async () => {
    const newFolder = await axios.post(getUrl("folder"), {
      folderName: "New Folder",
    });

    setFolders(folders.concat(newFolder.data));
  };

  const updateActiveFolder = async (activeFolderData) => {
    const updatedActiveFolder = (
      await axios.patch(getUrl("folder/activefolder"), {
        activeFolderId: activeFolderData._id,
      })
    ).data;

    setActiveFolder(updatedActiveFolder);

    const newFolderList = folders.map((folder) => {
      if (folder._id === activeFolderData._id) {
        return updatedActiveFolder;
      }
      return folder;
    });

    setFolders(newFolderList);
  };

  const closeTab = async (noteId) => {
    if (!activeFolder._id) {
      return;
    }

    const deletedNote = (await axios.delete(getUrl(`notes/${noteId}`))).data;

    const updatedFolders = folders.map((folder) => {
      if (folder._id === deletedNote.folderId) {
        return {
          ...folder,
          notes: folder.notes.filter((note) => note._id !== deletedNote._id),
        };
      }

      return folder;
    });

    setFolders(updatedFolders);

    const updatedNotesList = activeFolder.notes.filter(
      (note) => note._id !== deletedNote._id
    );

    if (activeFolder.activeNoteId === noteId) {
      setActiveFolder({
        ...activeFolder,
        activeNoteId: updatedNotesList[updatedNotesList.length - 1]?._id,
        notes: updatedNotesList,
      });
      await axios.patch(getUrl("notes/activenote"), {
        activeNoteId: updatedNotesList[updatedNotesList.length - 1]?._id,
      });
    } else {
      setActiveFolder({
        ...activeFolder,
        notes: updatedNotesList,
      });
    }
  };

  const closeFolder = async (folderId) => {
    const deletedFolder = (await axios.delete(getUrl(`folder/${folderId}`)))
      .data;
    const filteredFolders = folders.filter(
      (folder) => folder._id !== deletedFolder._id
    );

    setFolders(filteredFolders);
  };

  const updateNotes = async (noteId, title, content) => {
    const updatedNotes = activeFolder.notes.map((note) => {
      if (note._id === noteId) {
        return {
          ...note,
          title,
          content,
        };
      }

      return note;
    });

    setActiveFolder({
      ...activeFolder,
      notes: updatedNotes,
    });

    setIsSaved(0);
    await axios.patch(getUrl(`notes/${noteId}`), {
      title,
      content,
    });
    setIsSaved(1);
  };

  const renameFolder = (folderId, folderName) => {
    const updatedFolderList = folders.map((folder) => {
      if (folder._id === folderId) {
        return {
          ...folder,
          folderName,
        };
      }

      return folder;
    });

    setFolders(updatedFolderList);

    axios.patch(getUrl(`folder/${folderId}`), {
      folderName,
    });
  };

  const activeNoteId = useMemo(
    () => activeFolder?.activeNoteId,
    [activeFolder]
  );

  useEffect(() => {
    chrome &&
      chrome.storage &&
      chrome.storage.local.set({ activeTheme: activeTheme }, function () {
        console.log("Theme Changed");
      });
  }, [activeTheme]);

  useEffect(() => {
    if (chrome.storage) {
      chrome.storage.local.get(["activeTheme"], function (result) {
        if (result.activeTheme) {
          setActiveTheme(result.activeTheme);
        }
      });
    }

    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFtaXRoYnI2QGdtYWlsLmNvbSIsIm5hbWUiOiJBbWl0aCBCIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FBY0hUdGR1RVdJRmI0aWVHeU5PUnZLVXFpWEtzQVBreWgwbmVFM1drSWJDSEE9czk2LWMiLCJfaWQiOiI2NDdiMzJhNzVlNjhjOTQzYTMwYTM3ZTQiLCJpYXQiOjE2ODU4NzM4MTMsImV4cCI6MTY4NjQ3ODYxM30.aGEzvtWihKf7K8fa5LAIpQbR_brk7uM20xPibINsRzY";

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    const { folders, activeFolder } = (await axios.get(getUrl("folder"))).data;

    setFolders(folders);
    setActiveFolder(activeFolder);
  };

  return (
    <NotesContext.Provider
      value={{
        folders,
        setFolders,
        activeNoteId,
        setActiveNoteId,
        activeFolder,
        setActiveFolder,
        updateActiveFolder,
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
