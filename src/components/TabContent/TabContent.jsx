import "./TabContent.css";
import React, { useState, useEffect, useContext } from "react";
import NotesContext from "../../context/notesContext";

function TabContent({
  activeTabId,
  notesTitle,
  notesContent,
  onNotesDataChange,
}) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const { isSaved } = useContext(NotesContext);

  useEffect(() => {
    if (notesTitle) {
      setTitle(notesTitle);
    }
    if (notesContent) {
      setContent(notesContent);
    }
  }, [notesTitle, notesContent]);

  useEffect(() => {
    const timmer = setTimeout(() => {
      onNotesDataChange({
        title,
        content,
      });
    }, 200);

    return () => clearTimeout(timmer);
    // eslint-disable-next-line
  }, [title, content]);

  return (
    <div className="tab-content__container">
      <div className={"save-status " + (isSaved ? "hide" : "show")}>
        {isSaved ? "Saved✔️" : "Saving..."}
      </div>
      {activeTabId ? (
        <div style={{ height: "100%" }}>
          <div className="tab-content__title-container">
            <input
              id="title"
              className={"tab-content__title-input " + (!title ? "empty" : "")}
              type="text"
              maxLength="40"
              minLength="1"
              key={activeTabId}
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
              className={"tab-content-input " + (!content ? "empty" : "")}
              key={activeTabId}
              value={content}
              onChange={(event) => {
                setContent(event.target.value);
              }}
            />
            <label htmlFor="content">Add notes...</label>
          </div>
        </div>
      ) : (
        <div className="tab-content__no-tab flex-center">No Note Selected</div>
      )}
    </div>
  );
}

export default TabContent;
