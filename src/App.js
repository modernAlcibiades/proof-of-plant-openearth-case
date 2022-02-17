import { hot } from "react-hot-loader";
import React, { createContext, useReducer } from "react";
import initState from "./initState";
import reducer from "./reducer";

import AppContent from "./Components/AppContent";
import "./App.css";

export const AppStateContext = createContext(initState);

function App() {
  const [state, dispatch] = useReducer(reducer, initState);

  return (
    <AppStateContext.Provider value={[state, dispatch]}>
      <AppContent/>
    </AppStateContext.Provider>
  );
}

export default module.hot ? hot(module)(App) : App;
