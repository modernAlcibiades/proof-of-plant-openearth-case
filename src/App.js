import { hot } from "react-hot-loader";
import React, { createContext, useReducer } from "react";
import PropTypes from 'prop-types'
import initState from "./initState";
import reducer from "./reducer";

import AppContent from "./Components/AppContent";
import "./App.css";

export const AppStateContext = createContext(initState)
export const AppDispatchContext = createContext(() => { })


function AppStateProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initState)

  return (
    <AppDispatchContext.Provider value={dispatch}>
      <AppStateContext.Provider value={state}>
        {children}
      </AppStateContext.Provider>
    </AppDispatchContext.Provider>
  )
}

AppStateProvider.propTypes = {
  children: PropTypes.any.isRequired,
}

function App() {
  const [state, dispatch] = useReducer(reducer, initState);

  return (
    <AppStateProvider>
      <AppContent/>
    </AppStateProvider>
  );
}

export default module.hot ? hot(module)(App) : App;
