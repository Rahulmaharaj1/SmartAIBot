import React, { createContext, useState } from "react";

export const dataContext = createContext();

// Uploaded Image
export let user = {
  data: null,
  mimeType: null,
  imgUrl: null,
};

// Previous User Data
export let prevUser = {
  data: null,
  mimeType: null,
  prompt: "",
  imgUrl: null,
};

export default function UserContext({ children }) {
  // Home / Chat Screen
  const [startResult, setStartResult] = useState(false);

  // Popup
  const [popup, setPopup] = useState(false);

  // Input Box
  const [input, setInput] = useState("");

  // chat | uploadImg | genImg
  const [feature, setFeature] = useState("chat");

  // Loading
  const [loading, setLoading] = useState(false);

  // Previous Input
  const [prevInput, setPrevInput] = useState("");

  // AI Text Response
  const [result, setResult] = useState("");

  // Generated AI Image
  // Generated AI Image
const [genImgUrl, setGenImgUrl] = useState("");

return (
  <dataContext.Provider
    value={{
      startResult,
      setStartResult,

      popup,
      setPopup,

      input,
      setInput,

      feature,
      setFeature,

      prevInput,
      setPrevInput,

      result,
      setResult,

      loading,
      setLoading,

      genImgUrl,
      setGenImgUrl,
    }}
  >
    {children}
  </dataContext.Provider>
);
}