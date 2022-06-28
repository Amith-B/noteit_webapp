import "./SidePanel.css";
import React from "react";

function SidePanel({ open, onClose }) {
  return (
    <div
      className={"sidepanel__overlay " + (open ? "visible" : "")}
      onClick={onClose}
    >
      <section className="sidepanel">
        <h3 className="panel-item">Folders</h3>
        <hr />
      </section>
    </div>
  );
}

export default SidePanel;
