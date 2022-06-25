import "./Tabs.css";
import React, { useRef, useEffect, useCallback } from "react";

function Tabs({ tabs, activeTabId, onAddTab, onTabClick, onTabClose }) {
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
    const tabRef = tabGroup.current;
    tabRef.addEventListener("wheel", handleHorizontalScroll);

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
            {tabs.length > 1 && (
              <div
                className="clickable tab-close flex-center"
                onClick={(event) => {
                  event.stopPropagation();
                  onTabClose(tab.id);
                }}
              >
                +
              </div>
            )}
          </button>
        ))}
      </div>
      <button className="clickable tab-add flex-center" onClick={onAddTab}>
        +
      </button>
    </section>
  );
}

export default Tabs;
