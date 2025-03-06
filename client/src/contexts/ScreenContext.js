// src/contexts/ScreenContext.js
import React, { createContext, useContext } from 'react';

const ScreenContext = createContext();

export const useScreenContext = () => useContext(ScreenContext);

export default ScreenContext;
