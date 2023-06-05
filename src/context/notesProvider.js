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
  const [isSaved, setIsSaved] = useState(0); // 0 - not saved, 1 - saved, 2 - error

  const setActiveNoteId = (folderId, activeNodeId) => {
    const data = { ...folders };
    data[folderId].activeNoteId = activeNodeId;
    setFolders(data);
  };

  const addNote = () => {
    const data = { ...folders };
    const newNoteId = "note_" + new Date().getTime().toString();
    if (activeFolder) {
      activeFolder.noteIds.push({
        id: newNoteId,
        title: "New Note",
        content: "",
      });
      setActiveNoteId(activeFolder, newNoteId);
      setFolders(data);
    }
  };

  const addFolder = async () => {
    // const data = { ...folders };
    // const newFolderId = "folder_" + new Date().getTime().toString();
    // data[newFolderId] = {
    //   folderName: "New Folder",
    //   activeNoteId: "",
    //   list: [],
    // };
    // setFolders(data);
    // setActiveFolder(newFolderId);

    const newFolder = await axios.post(getUrl("folder"), {
      folderName: "New Folder",
    });

    setFolders(folders.concat(newFolder.data));
  };

  const updateActiveFolder = async (folder) => {
    const activeFolderNotes = (
      await axios.get(getUrl(`folder/${folder._id}/notes`))
    ).data;

    setActiveFolder({
      ...folder,
      noteIds: activeFolderNotes,
    });
  };

  const closeTab = (folderId, noteId) => {
    if (Reflect.has(folders, folderId)) {
      const data = { ...folders };
      data[folderId].list = data[folderId].list.filter(
        (note) => note.id !== noteId
      );
      setFolders(data);
      if (data[folderId].activeNoteId === noteId) {
        setActiveNoteId(folderId, "");
      }
    }
  };

  const closeFolder = async (folderId) => {
    // setFolders(folders);
    // if (folderId === activeFolder._id) {
    //   setActiveFolder(null);
    // }

    const deletedFolder = (await axios.delete(getUrl(`folder/${folderId}`)))
      .data;
    const filteredFolders = folders.filter(
      (folder) => folder._id !== deletedFolder._id
    );

    setFolders(filteredFolders);
  };

  const updateNotes = (folderId, noteId, title, content) => {
    if (Reflect.has(folders, folderId)) {
      const data = { ...folders };
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
      setFolders(data);
    }
  };

  const renameFolder = async (folderId, folderName) => {
    const updatedFolder = (
      await axios.patch(getUrl(`folder/${folderId}`), {
        folderName,
      })
    ).data;

    const updatedFolderList = folders.map((folder) => {
      if (folder._id === updatedFolder._id) {
        return updatedFolder;
      }

      return folder;
    });

    setFolders(updatedFolderList);
  };

  // const activeNoteId = useMemo(
  //   () => activeFolder?.activeNoteId,
  //   [folders, activeFolder]
  // );

  const activeNoteId = null;

  // useEffect(() => {
  //   setIsSaved(0);
  //   const timmer = setTimeout(() => {
  //     chrome &&
  //       chrome.storage &&
  //       chrome.storage.local.set({ notes: folders }, function () {
  //         console.log("Notes Updated");
  //         const error = chrome.runtime.lastError;
  //         if (error) {
  //           console.log("Storage Exceeded");
  //           setIsSaved(2);
  //         }

  //         if (!Object.keys(folders).length) {
  //           setActiveFolderId("");
  //         }
  //       });
  //     setIsSaved(1);
  //   }, 1000);

  //   return () => clearTimeout(timmer);
  // }, [folders]);

  // useEffect(() => {
  //   const timmer = setTimeout(() => {
  //     chrome &&
  //       chrome.storage &&
  //       chrome.storage.local.set(
  //         { activeFolderId: activeFolderId },
  //         function () {
  //           console.log("Active Folder Changed");
  //         }
  //       );
  //   }, 100);

  //   return () => clearTimeout(timmer);
  // }, [activeFolderId]);

  // useEffect(() => {
  //   setIsSaved(0);
  //   const timmer = setTimeout(() => {
  //     chrome &&
  //       chrome.storage &&
  //       chrome.storage.local.set({ activeTheme: activeTheme }, function () {
  //         console.log("Theme Changed");
  //       });
  //     setIsSaved(1);
  //   }, 100);

  //   return () => clearTimeout(timmer);
  // }, [activeTheme]);

  useEffect(() => {
    // if (chrome.storage) {
    //   chrome.storage.local.get(["notes"], function (result) {
    //     if (result.notes) {
    //       setFolders(result.notes);
    //     }
    //   });
    //   chrome.storage.local.get(["activeTheme"], function (result) {
    //     if (result.activeTheme) {
    //       setActiveTheme(result.activeTheme);
    //     }
    //   });
    //   chrome.storage.local.get(["activeFolderId"], function (result) {
    //     if (result.activeFolderId) {
    //       setActiveFolderId(result.activeFolderId);
    //     }
    //   });
    // }
    // mongodb read

    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6ImFtaXRoYnI2QGdtYWlsLmNvbSIsIm5hbWUiOiJBbWl0aCBCIiwicGljdHVyZSI6Imh0dHBzOi8vbGgzLmdvb2dsZXVzZXJjb250ZW50LmNvbS9hL0FBY0hUdGR1RVdJRmI0aWVHeU5PUnZLVXFpWEtzQVBreWgwbmVFM1drSWJDSEE9czk2LWMiLCJfaWQiOiI2NDdiMzJhNzVlNjhjOTQzYTMwYTM3ZTQiLCJpYXQiOjE2ODU4NzM4MTMsImV4cCI6MTY4NjQ3ODYxM30.aGEzvtWihKf7K8fa5LAIpQbR_brk7uM20xPibINsRzY";

    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;

    fetchFolders();
  }, []);

  const fetchFolders = async () => {
    const folderList = await axios.get(getUrl("folder"));

    setFolders(folderList.data);
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
