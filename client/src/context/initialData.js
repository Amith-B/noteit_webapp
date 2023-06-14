const initialData = {
  folders: [],
  themes: {
    default: { primary: "antiquewhite", secondary: "#ffc760" },
    blue: {
      primary: "#e8e8e8",
      secondary: "#4b9fc9",
    },
    purple: {
      primary: "#e8e8e8",
      secondary: "#4b9fc9",
    },
    brown: {
      primary: "#e4ba9f",
      secondary: "#9e6c54",
    },
    pink: {
      primary: "#edd3cc",
      secondary: "#c0838e",
    },
    dark: {
      primary: "rgb(74, 74, 74)",
      secondary: "#242424",
    },
  },
  activeTheme: "default",
  activeFolderId: "folder_uniqueid",
};

export default initialData;
