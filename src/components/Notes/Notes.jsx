import { useContext } from "react";
import "./Notes.css";
import TabContent from "../TabContent/TabContent";
import Tabs from "../Tabs/Tabs";
import NotesContext from "../../context/notesContext";

function Notes() {
  const { activeTheme, isSaved, activeNoteId, activeFolderId } =
    useContext(NotesContext);

  return (
    <div className={"Note theme " + activeTheme}>
      <div className={"save-status " + (isSaved === 2 ? "error" : "")}>
        {isSaved === 1
          ? "Saved✔️"
          : isSaved === 0
          ? "Saving..."
          : (isSaved === 2 && "Storage Exceeded") || ""}
      </div>
      <Tabs key={activeFolderId} />
      <TabContent key={activeNoteId} />
    </div>
  );
}

export default Notes;
