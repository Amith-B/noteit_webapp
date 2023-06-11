import "./Menu.scss";

import React, { useContext } from "react";

import NotesContext from "../../context/notesContext";
import axios from "axios";
import downloadJSON from "../../utils/downloadNotes";
import { getUrl } from "../../utils/api";

export default function Menu({ open, onClose }) {
  const {
    themes,
    activeTheme,
    setActiveTheme,
    setToken,
    email,
    setIsLoading,
    setFolders,
    setActiveFolder,
  } = useContext(NotesContext);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = handleFileRead(e);
    reader.readAsText(file);
  };

  const handleFileRead = (fileEvent) => async (loadEvent) => {
    const content = loadEvent.target.result;
    const jsonData = JSON.parse(content);

    fileEvent.target.value = null;
    setIsLoading(true);
    try {
      const response = (await axios.post(getUrl("notes/upload"), jsonData))
        .data;

      setFolders(response.folders);
      setActiveFolder(response.activeFolder);
      setIsLoading(false);
    } catch (error) {
      setIsLoading(false);
    }
  };

  const handleDownloadJson = async () => {
    const notes = (await axios.get(getUrl("notes/getall"))).data;

    downloadJSON(notes);
  };

  return (
    <div
      className={"notes-menu__overlay " + (open ? "visible" : "")}
      onClick={() => onClose(false)}
    >
      <div
        className="notes-menu"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        {email && (
          <>
            <h4>Profile</h4>
            <hr />
            <div className="notes-menu-item menu flex-dir-col">
              <h5 className="profile-email">{email}</h5>
              <button
                className="menu-button clickable"
                onClick={() => {
                  setToken(null);
                  setFolders([]);
                  setActiveFolder(null);
                }}
              >
                Sign out
              </button>
            </div>
            <hr />
          </>
        )}
        <h4>Choose Theme</h4>
        <hr />
        {themes.map((theme) => (
          <div
            className={
              "clickable notes-menu-item " +
              (theme === activeTheme ? "active" : "")
            }
            key={theme}
            onClick={() => {
              setActiveTheme(theme);
            }}
          >
            {theme.charAt(0).toUpperCase() + theme.slice(1)}
          </div>
        ))}
        <hr />
        <h4>Export As</h4>
        <hr />
        <div className="notes-menu-item menu">
          <button
            className="menu-button clickable"
            onClick={handleDownloadJson}
          >
            .json
          </button>
          <a id="downloadAnchorElem" style={{ display: "none" }} href="/#">
            Download
          </a>
        </div>
        <hr />
        <h4>
          Import From <code>.json</code>
        </h4>
        <hr />
        <div className="notes-menu-item menu">
          <input type="file" accept=".json" onChange={handleFileChange} />
        </div>
      </div>
    </div>
  );
}
