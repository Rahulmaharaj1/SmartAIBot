import React, { useContext } from "react";

import {
  dataContext,
  prevUser,
  user,
} from "../context/UserContext";

export default function Chat() {
  const {
    result,
    loading,
    feature,
    genImgUrl,
  } = useContext(dataContext);

  // =========================================
  // CURRENT IMAGE
  // =========================================

  // New uploaded image ko priority do.
  // Agar current image nahi hai to previous image use karo.
  const uploadedImage =
    user.imgUrl || prevUser.imgUrl;

  // =========================================
  // GENERATED IMAGE
  // =========================================

  if (feature === "genImg") {
    return (
      <div className="chat-page">

        {/* USER PROMPT */}
        <div className="user">
          {prevUser.prompt && (
            <span>{prevUser.prompt}</span>
          )}
        </div>

        {/* AI IMAGE */}
        <div className="ai">

          {loading ? (
            <div className="loader">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          ) : genImgUrl ? (
            <img
              src={genImgUrl}
              alt="Generated AI"
              className="ai-img"
            />
          ) : (
            <span>No Image Generated</span>
          )}

        </div>

      </div>
    );
  }

  // =========================================
  // NORMAL CHAT / IMAGE ANALYSIS
  // =========================================

  return (
    <div className="chat-page">

      {/* =====================================
          USER MESSAGE
      ===================================== */}

      <div className="user">

        {/* UPLOADED IMAGE */}
        {uploadedImage && (
          <img
            src={uploadedImage}
            alt="Uploaded"
            className="user-img"
          />
        )}

        {/* USER PROMPT */}
        {prevUser.prompt && (
          <span>{prevUser.prompt}</span>
        )}

      </div>

      {/* =====================================
          AI RESPONSE
      ===================================== */}

      <div className="ai">

        {loading ? (
          <div className="loader">
            <div className="dot"></div>
            <div className="dot"></div>
            <div className="dot"></div>
          </div>
        ) : (
          <span>{result}</span>
        )}

      </div>

    </div>
  );
}