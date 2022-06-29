import "./SidePanel.css";
import React, { useContext } from "react";
import NotesContext from "../../context/notesContext";

function SidePanel({ open, onClose }) {
  const { notes, activeFolderId, addFolder, setActiveFolderId, closeFolder } =
    useContext(NotesContext);

  return (
    <div
      className={"sidepanel__overlay " + (open ? "visible" : "")}
      onClick={onClose}
    >
      <section
        className="sidepanel"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="panel-item header">
          <h3>Folders</h3>
          <button
            className="clickable folder-add flex-center"
            onClick={addFolder}
          >
            +
          </button>
        </div>
        <hr />
        {notes &&
          Object.keys(notes).map((folderId) => {
            return (
              <div className="panel-item" key={folderId}>
                <div
                  className={
                    "folder-name clickable " +
                    (activeFolderId === folderId ? "active" : "")
                  }
                  onClick={() => setActiveFolderId(folderId)}
                >
                  <div>{folderId.split("_")[0]}</div>
                  <div
                    className="clickable folder-close flex-center"
                    onClick={(event) => {
                      event.stopPropagation();
                      closeFolder(folderId);
                    }}
                  >
                    +
                  </div>
                </div>
              </div>
            );
          })}
      </section>
    </div>
  );
}

export default SidePanel;
