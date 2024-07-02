"use client";

import { PersistGate } from "redux-persist/integration/react";
import { Toaster } from "@/components/ui/sonner";
import { persistor } from "@/provider/store";
import ReduxProvider from "@/provider/ReduxProvider";

const ReduxWrapper = ({ children }: { children: React.ReactNode }) => {
  return (
    <ReduxProvider>
      <PersistGate loading={null} persistor={persistor}>
        {children}
      </PersistGate>
      <Toaster />
    </ReduxProvider>
  );
};

export default ReduxWrapper;
