import { createContext, useState } from "react";

export const SavedResultsContext = createContext();

export const SavedResultsProvider = ({ children }) => {
  const [savedResults, setSavedResults] = useState([]);

  return (
    <SavedResultsContext.Provider value={{ savedResults, setSavedResults }}>
      {children}
    </SavedResultsContext.Provider>
  );
};
