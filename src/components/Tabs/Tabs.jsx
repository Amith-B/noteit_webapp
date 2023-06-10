import "./Tabs.scss";

import React, {
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";

import Menu from "../Menu/Menu";
import NotesContext from "../../context/notesContext";
import SidePanel from "../SidePanel/SidePanel";
import arrowLeft from "../../assets/arrow-previous-left.svg";
import hamburger from "../../assets/hamburger.svg";
import verticalDot from "../../assets/vertical_dots.svg";

function Tabs({ onSidePanelToggle }) {
  const { activeFolder, closeTab, activeNoteId, setActiveNoteId, addNote } =
    useContext(NotesContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(false);
  const tabGroup = useRef();

  useEffect(() => {
    onSidePanelToggle(panelOpen);
    // eslint-disable-next-line
  }, [panelOpen]);

  const handleHorizontalScroll = useCallback(
    (event) => {
      const tabRef = tabGroup.current;

      const toLeft = event.deltaY < 0 && tabRef.scrollLeft > 0;
      const toRight =
        event.deltaY > 0 &&
        tabRef.scrollLeft < tabRef.scrollWidth - tabRef.clientWidth;

      if (toLeft || toRight) {
        event.preventDefault();
        tabGroup.current.scrollLeft += event.deltaY;
      }
    },
    [tabGroup]
  );

  useEffect(() => {
    const tabRef = tabGroup.current;
    tabRef.addEventListener("wheel", handleHorizontalScroll);

    return () => tabRef.removeEventListener("wheel", handleHorizontalScroll);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    handleScroll();
  }, [activeFolder, activeNoteId]);

  const handleScroll = () => {
    const activeTab = document.querySelector(".tab.active");

    if (activeTab) {
      activeTab.scrollIntoView();
    }
  };

  return (
    <section className="tab__container">
      <button
        className="clickable notes-panel__toggle flex-center"
        onClick={() => setPanelOpen((toggle) => !toggle)}
      >
        <img
          style={{ height: "16px" }}
          src={panelOpen ? arrowLeft : hamburger}
          alt="3-dot"
        />
      </button>
      <div className="tab__controls">
        {" "}
        <div className="tab-group hide-scrollbar" ref={tabGroup}>
          {activeFolder &&
            activeFolder?.notes?.map((note) => (
              <button
                className={
                  "tab " +
                  (activeFolder.activeNoteId === note._id
                    ? "active"
                    : "clickable")
                }
                key={note._id}
                onClick={() => setActiveNoteId(activeFolder._id, note._id)}
                tabIndex={activeFolder.activeNoteId === note._id ? "-1" : "0"}
              >
                <div className="tab-title" title={note.title}>
                  {note.title}
                </div>
                <div
                  className="clickable tab-close flex-center"
                  onClick={(event) => {
                    event.stopPropagation();
                    closeTab(note._id);
                  }}
                >
                  +
                </div>
              </button>
            ))}
        </div>
        {activeFolder && (
          <button className="clickable tab-add flex-center" onClick={addNote}>
            +
          </button>
        )}
      </div>
      <button
        className="clickable notes-menu__toggle flex-center"
        onClick={() => setMenuOpen(true)}
      >
        <img style={{ height: "16px" }} src={verticalDot} alt="3-dot" />
      </button>
      <Menu open={menuOpen} onClose={() => setMenuOpen(false)} />
      <SidePanel open={panelOpen} onClose={() => setPanelOpen(false)} />
    </section>
  );
}

export default Tabs;
