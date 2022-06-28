/*global chrome*/
import "./Tabs.css";
import React, {
  useRef,
  useEffect,
  useCallback,
  useState,
  useContext,
} from "react";
import NotesContext from "../../context/notesContext";

function Tabs({ tabs, activeTabId, onAddTab, onTabClick, onTabClose }) {
  const { themes, activeTheme, setActiveTheme, notes } =
    useContext(NotesContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const [maxLimit, setMaxLimit] = useState(0);
  const [usedSpace, setUsedSpace] = useState(0);
  const tabGroup = useRef();

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
    if (chrome.storage && chrome.storage.local) {
      chrome.storage.local.getBytesInUse().then((value) => {
        setUsedSpace(value);
      });
    }
  }, [notes]);

  useEffect(() => {
    const tabRef = tabGroup.current;
    tabRef.addEventListener("wheel", handleHorizontalScroll);
    if (chrome.storage && chrome.storage.local) {
      setMaxLimit(chrome.storage.local.QUOTA_BYTES);
    }

    return () => tabRef.removeEventListener("wheel", handleHorizontalScroll);
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    const activeTab = document.querySelector(".tab.active");

    if (activeTab) {
      activeTab.scrollIntoView();
    }
  }, [activeTabId]);

  return (
    <section className="tab__container">
      <div className="tab__controls">
        {" "}
        <div className="tab-group hide-scrollbar" ref={tabGroup}>
          {tabs.map((tab) => (
            <button
              className={
                "tab " + (activeTabId === tab.id ? "active" : "clickable")
              }
              key={tab.id}
              onClick={() => onTabClick(tab.id)}
              tabIndex={activeTabId === tab.id ? "-1" : "0"}
            >
              <div className="tab-title" title={tab.title}>
                {tab.title}
              </div>
              <div
                className="clickable tab-close flex-center"
                onClick={(event) => {
                  event.stopPropagation();
                  onTabClose(tab.id);
                }}
              >
                +
              </div>
            </button>
          ))}
        </div>
        <button className="clickable tab-add flex-center" onClick={onAddTab}>
          +
        </button>
      </div>
      <button
        className="clickable notes-menu__toggle flex-center"
        onClick={() => setMenuOpen(true)}
      ></button>
      <div
        className={"notes-menu__overlay " + (menuOpen ? "visible" : "")}
        onClick={() => setMenuOpen(false)}
      >
        <div className="notes-menu">
          <h4>Choose Theme</h4>
          <hr />
          {themes.map((theme) => (
            <div
              className={
                "clickable notes-menu-item " +
                (theme === activeTheme ? "active" : "")
              }
              key={theme}
              onClick={(event) => {
                event.stopPropagation();
                setActiveTheme(theme);
              }}
            >
              {theme.charAt(0).toUpperCase() + theme.slice(1)}
            </div>
          ))}
          <hr />
          <h4>Storage Used</h4>
          <hr />
          <span className="notes-menu-item">
            <progress
              style={{ width: "120px" }}
              type="progress"
              max={maxLimit}
              value={usedSpace}
            ></progress>
          </span>
        </div>
      </div>
    </section>
  );
}

export default Tabs;
