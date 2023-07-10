import "./SidePanel.scss";

import React, { useContext, useEffect, useState } from "react";

import NotesContext from "../../context/notesContext";
import arrowLeft from "../../assets/arrow-previous-left.svg";
import edit from "../../assets/edit.svg";

function SidePanel({ open, onClose }) {
  const {
    folders,
    activeFolder,
    addFolder,
    updateActiveFolder,
    closeFolder,
    renameFolder,
  } = useContext(NotesContext);

  const [renameId, setRenameId] = useState("");
  const [renameValue, setRenameValue] = useState("");

  const handleRename = () => {
    renameFolder(renameId, renameValue);
    setRenameId("");
    setRenameValue("");
  };

  const handleScroll = () => {
    const activeTab = document.querySelector(".folder-container.active");

    if (activeTab) {
      activeTab.scrollIntoView();
    }
  };

  useEffect(() => {
    if (open) {
      handleScroll();
    }
  }, [activeFolder, open]);

  useEffect(() => {
    const timerRef = setTimeout(() => {
      handleScroll();
    }, 200);

    return () => clearTimeout(timerRef);
  }, [folders.length]);

  return (
    <div className={"sidepanel__container " + (open ? "visible" : "")}>
      <section
        className="sidepanel"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="panel-item header">
          <h3>
            Folders{" "}
            <div className="folder-notes-count flex-center">
              {folders.length}
            </div>
          </h3>
          <div className="header-options">
            <button
              className="clickable folder-add flex-center"
              onClick={addFolder}
            >
              +
            </button>
            <button
              className="clickable notes-panel__toggle flex-center"
              onClick={onClose}
            >
              <img style={{ height: "16px" }} src={arrowLeft} alt="3-dot" />
            </button>
          </div>
        </div>
        <div className="folder-list hide-scrollbar">
          {folders.map((folder) => {
            return (
              <div className="panel-item" key={folder._id}>
                <div
                  className={
                    "folder-container " +
                    (activeFolder?._id === folder._id ? "active" : "clickable")
                  }
                  onClick={() => updateActiveFolder(folder)}
                >
                  <div className="folder-name" title={folder.folderName}>
                    {renameId === folder._id ? (
                      <input
                        className="folder-rename-input"
                        autoFocus
                        value={renameValue}
                        onChange={(event) => setRenameValue(event.target.value)}
                        type={"text"}
                        min={1}
                        max={20}
                        onBlur={handleRename}
                        onKeyPress={(event) => {
                          if (event.key === "Enter") {
                            handleRename();
                          }
                        }}
                      />
                    ) : (
                      folder.folderName
                    )}
                  </div>
                  <div className="folder-controls">
                    <div className="folder-notes-count flex-center">
                      {folder.notes.length}
                    </div>
                    <div
                      className="clickable folder-rename flex-center"
                      onClick={(event) => {
                        event.stopPropagation();
                        setRenameValue(folder.folderName);
                        setRenameId(folder._id);
                      }}
                    >
                      <img style={{ height: "12px" }} src={edit} alt="rename" />
                    </div>
                    <div
                      className="clickable folder-close flex-center"
                      onClick={(event) => {
                        event.stopPropagation();
                        if (
                          !folder.notes.length ||
                          window.confirm(
                            "Are you sure you want to delete this folder? This folder contains one or more notes, you will not be able to undo this action"
                          )
                        ) {
                          closeFolder(folder._id);
                        }
                      }}
                    >
                      +
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}

export default SidePanel;
