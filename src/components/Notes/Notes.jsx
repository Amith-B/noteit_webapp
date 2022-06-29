import { useContext, useMemo } from "react";
import "./Notes.css";
import TabContent from "../TabContent/TabContent";
import Tabs from "../Tabs/Tabs";
import NotesContext from "../../context/notesContext";

function Notes() {
  const {
    activeTheme,
    isSaved,
    notes,
    updateNotes,
    activeNoteId,
    activeFolderId,
  } = useContext(NotesContext);

  const handleNotesDataChange = (tabId, data) => {
    if (tabId) {
      if (
        activeNoteData &&
        activeNoteData.title === data.title &&
        activeNoteData.content === data.content
      ) {
        return;
      }
      updateNotes(tabId, data.title, data.content);
    }
  };

  const activeNoteData = useMemo(() => {
    if (activeFolderId && Reflect.has(notes, activeFolderId)) {
      return notes[activeFolderId].find((note) => note.id === activeNoteId);
    }

    return [];
  }, [notes, activeNoteId, activeFolderId]);

  return (
    <div className={"Note theme " + activeTheme}>
      <div className={"save-status " + (isSaved === 2 ? "error" : "")}>
        {isSaved === 1
          ? "Saved✔️"
          : isSaved === 0
          ? "Saving..."
          : (isSaved === 2 && "Storage Exceeded") || ""}
      </div>
      <Tabs />
      <TabContent
        key={activeNoteId}
        activeTabId={activeNoteId}
        notesTitle={activeNoteData ? activeNoteData.title : ""}
        notesContent={activeNoteData ? activeNoteData.content : ""}
        onNotesDataChange={(data) => handleNotesDataChange(activeNoteId, data)}
      />
    </div>
  );
}

export default Notes;
