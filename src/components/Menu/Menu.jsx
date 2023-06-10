import "./Menu.scss";

import React, { useContext } from "react";

import NotesContext from "../../context/notesContext";

export default function Menu({ open, onClose }) {
  const { themes, activeTheme, setActiveTheme, setToken, profile } =
    useContext(NotesContext);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();
    reader.onload = handleFileRead;
    reader.readAsText(file);
  };

  const handleFileRead = (e) => {
    const content = e.target.result;
    const jsonData = JSON.parse(content);
    // handle uploading to server
    // setFolders(jsonData);
  };

  const handleDownloadJson = () => {
    // request all notes and convert it into json
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
        {profile.name && profile.email && (
          <>
            <h4>Profile</h4>
            <hr />
            <div className="notes-menu-item menu flex-dir-col">
              <div className="profile">
                <img
                  className="profile-img"
                  alt="profile"
                  src={profile.picture}
                />
                <div>
                  <h5 className="profile-name">{profile.name}</h5>
                  <h5 className="profile-email">{profile.email}</h5>
                </div>
              </div>
              <button
                className="menu-button clickable"
                onClick={() => setToken(null)}
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
          Import From{" "}
          <span style={{ padding: "0 6px" }} className="menu-button">
            .json
          </span>
        </h4>
        <hr />
        <div className="notes-menu-item menu">
          <input type="file" accept=".json" onChange={handleFileChange} />
        </div>
      </div>
    </div>
  );
}
