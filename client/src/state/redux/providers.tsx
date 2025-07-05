"use client";

import { ReactNode } from "react";
import { Provider } from "react-redux";
import { persistor, store } from "./store";
import { PersistGate } from "redux-persist/integration/react";

export function ReduxProvider({ children }: { children: ReactNode }) {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
    </Provider>
  );
}
