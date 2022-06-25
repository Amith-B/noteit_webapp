import { useEffect, useState } from "react";
import "./App.css";
import TabContent from "./components/TabContent/TabContent";
import Tabs from "./components/Tabs/Tabs";

function App() {
  const [tabs, setTabs] = useState([]);

  const [activeTabId, setActiveTabId] = useState("");

  useEffect(() => {
    setTabs([{ id: new Date().getTime().toString(), title: "New Tab" }]);
  }, []);

  const handleAddTab = () => {
    setTabs((lst) => {
      const tabList = [...lst];
      const newTabId = "" + new Date().getTime();
      tabList.push({ id: newTabId, title: "Folder" });
      setActiveTabId(newTabId);
      return tabList;
    });
  };

  const handleTabChange = (tabId) => {
    setActiveTabId(tabId);
  };

  const handleTabClose = (tabId) => {
    setTabs(tabs.filter((tab) => tab.id !== tabId));
    if (activeTabId === tabId) {
      setActiveTabId("");
    }
  };

  const handleNotesDataChange = (tabId, data) => {
    if (tabId) {
      console.log(tabId, data);
    }
  };

  return (
    <div className="App">
      <Tabs
        tabs={tabs}
        activeTabId={activeTabId}
        onAddTab={handleAddTab}
        onTabClick={handleTabChange}
        onTabClose={handleTabClose}
      />
      <TabContent
        activeTabId={activeTabId}
        notesTitle={""}
        notesContent={""}
        onNotesDataChange={(data) => handleNotesDataChange(activeTabId, data)}
      />
    </div>
  );
}

export default App;
