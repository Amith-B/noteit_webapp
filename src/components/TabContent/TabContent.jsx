import "./TabContent.scss";

import React, { useContext, useEffect, useMemo, useState } from "react";

import NotesContext from "../../context/notesContext";

function TabContent() {
  const { activeFolder, updateNotes } = useContext(NotesContext);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");

  const activeNoteData = useMemo(() => {
    if (activeFolder && activeFolder.activeNoteId) {
      return activeFolder.notes.find(
        (note) => note._id === activeFolder.activeNoteId
      );
    }

    return undefined;
  }, [activeFolder]);

  useEffect(() => {
    if (activeNoteData) {
      setTitle(activeNoteData.title);
      setContent(activeNoteData.content);
    }
  }, [activeNoteData]);

  useEffect(() => {
    const timmer = setTimeout(() => {
      handleNotesDataChange(title, content);
    }, 500);

    return () => clearTimeout(timmer);
    // eslint-disable-next-line
  }, [title, content]);

  const handleNotesDataChange = (title, content) => {
    if (activeNoteData) {
      if (
        activeNoteData.title === title &&
        activeNoteData.content === content
      ) {
        return;
      } else {
        updateNotes(activeFolder.activeNoteId, title, content);
      }
    }
  };

  return (
    <div className="tab-content__container">
      {activeFolder && activeFolder.activeNoteId ? (
        <div style={{ height: "100%" }}>
          <div className="tab-content__title-container">
            <input
              id="title"
              className={"tab-content__title-input " + (!title ? "empty" : "")}
              type="text"
              maxLength="40"
              minLength="1"
              value={title}
              onChange={(event) => {
                setTitle(event.target.value);
              }}
            />
            <label htmlFor="title">Title</label>
          </div>
          <div className="tab-content">
            <textarea
              id="content"
              autoFocus
              className={"tab-content-input " + (!content ? "empty" : "")}
              value={content}
              onChange={(event) => {
                setContent(event.target.value);
              }}
            />
            <label htmlFor="content">Add notes...</label>
          </div>
        </div>
      ) : activeFolder ? (
        <div className="tab-content__no-tab flex-center">No Note Selected</div>
      ) : (
        <div className="tab-content__no-tab flex-center">
          No Folder Selected
        </div>
      )}
    </div>
  );
}

export default TabContent;
