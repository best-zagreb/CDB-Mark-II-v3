import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import reportWebVitals from "./reportWebVitals";

import "./index.css";

import { BrowserRouter } from "react-router-dom";

import { UserProvider } from "./context/UserContext";
import { ToastProvider } from "./context/ToastContext";
import { DeleteAlertProvider } from "./context/DeleteAlertContext";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <UserProvider>
    <ToastProvider>
      <DeleteAlertProvider>
        <React.StrictMode>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </React.StrictMode>
      </DeleteAlertProvider>
    </ToastProvider>
  </UserProvider>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
