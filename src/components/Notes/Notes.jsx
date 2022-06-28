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
    addNote,
    closeTab,
    updateNotes,
    activeNoteId,
    setActiveNoteId,
  } = useContext(NotesContext);

  const handleAddTab = () => {
    addNote();
  };

  const handleTabChange = (tabId) => {
    setActiveNoteId(tabId);
  };

  const handleTabClose = (tabId) => {
    closeTab(tabId);
  };

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
    return notes.find((note) => note.id === activeNoteId);
  }, [notes, activeNoteId]);

  return (
    <div className={"Note theme " + activeTheme}>
      <div className={"save-status " + (isSaved ? "hide" : "show")}>
        {isSaved ? "Saved✔️" : "Saving..."}
      </div>
      <Tabs
        tabs={notes}
        activeTabId={activeNoteId}
        onAddTab={handleAddTab}
        onTabClick={handleTabChange}
        onTabClose={handleTabClose}
      />
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
