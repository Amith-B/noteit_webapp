import { useEffect, useMemo, useState } from "react";

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
  const [isLoading, setIsLoading] = useState(false);
  const [token, setToken] = useState(null);
  const [email, setEmail] = useState(null);

  const setActiveNoteId = (folderId, activeNoteId) => {
    const newFolderList = folders.map((folder) => {
      if (folder._id === folderId) {
        const activeFolderData = {
          ...activeFolder,
          activeNoteId,
        };
        setActiveFolder(activeFolderData);
        return activeFolderData;
      }
      return folder;
    });

    setFolders(newFolderList);

    axios.patch(getUrl("notes/activenote"), {
      activeNoteId,
    });
  };

  const addNote = async () => {
    if (!activeFolder._id) {
      return;
    }

    setIsLoading(true);

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

    setIsLoading(false);
  };

  const addFolder = async () => {
    setIsLoading(true);
    const newFolder = await axios.post(getUrl("folder"), {
      folderName: "New Folder",
    });

    setFolders(folders.concat(newFolder.data));
    setIsLoading(false);
  };

  const updateActiveFolder = async (activeFolderData) => {
    setIsLoading(true);

    const updatedActiveFolder = (
      await axios.patch(getUrl("folder/activefolder"), {
        activeFolderId: activeFolderData._id,
      })
    ).data;

    setActiveFolder(updatedActiveFolder);
    setIsLoading(false);

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

    setIsLoading(true);

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
      axios.patch(getUrl("notes/activenote"), {
        activeNoteId: updatedNotesList[updatedNotesList.length - 1]?._id,
      });
    } else {
      setActiveFolder({
        ...activeFolder,
        notes: updatedNotesList,
      });
    }

    setIsLoading(false);
  };

  const closeFolder = async (folderId) => {
    setIsLoading(true);

    const deletedFolder = (await axios.delete(getUrl(`folder/${folderId}`)))
      .data;
    const filteredFolders = folders.filter(
      (folder) => folder._id !== deletedFolder._id
    );

    setFolders(filteredFolders);

    if (activeFolder?._id === folderId) {
      setActiveFolder(null);
    }

    setIsLoading(false);
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
    const timerRef = setTimeout(() => {
      if (activeTheme) {
        localStorage.setItem("activeTheme", activeTheme);
      }
    }, 200);

    return () => clearTimeout(timerRef);
  }, [activeTheme]);

  useEffect(() => {
    const activeTh = localStorage.getItem("activeTheme");

    if (activeTh) {
      setActiveTheme(activeTh);
    }

    const authToken = localStorage.getItem("auth_token");
    if (authToken) {
      setToken(authToken);

      verifyToken(authToken);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const timerRef = setTimeout(() => {
      if (!token) {
        localStorage.removeItem("auth_token");
        return;
      }

      localStorage.setItem("auth_token", token);

      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setIsLoading(true);

      fetchFolders();

      setIsLoading(false);
    }, 200);

    return () => clearTimeout(timerRef);
  }, [token]);

  const verifyToken = async (verifyToken) => {
    axios.defaults.headers.common["Authorization"] = `Bearer ${verifyToken}`;

    setIsLoading(true);

    try {
      if (!verifyToken) {
        setIsLoading(false);
        return;
      }
      const response = (await axios.get(getUrl("signin/verifytoken"))).data;

      if (response.email) {
        setEmail(response.email);
      }
      if (!response.valid) {
        setToken(null);
      }

      setIsLoading(false);
    } catch (error) {
      if (error?.response?.data?.code === "INCORRECT_TOKEN") {
        setToken(null);
      }
      setIsLoading(false);
    }
  };

  const fetchFolders = async () => {
    setIsLoading(true);
    const { folders, activeFolder } = (await axios.get(getUrl("folder"))).data;

    setFolders(folders);
    setActiveFolder(activeFolder);
    setIsLoading(false);
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
        isLoading,
        token,
        setToken,
        email,
        setEmail,
        setIsLoading,
      }}
    >
      {children}
    </NotesContext.Provider>
  );
}
