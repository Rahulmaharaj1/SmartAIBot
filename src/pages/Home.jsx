import React, { useContext } from "react";

import {
  dataContext,
  prevUser,
  user,
} from "../context/UserContext";

import { generateResponse } from "../gemini";
import { query } from "../huggingFace";

import "../App.css";

import { FaImage } from "react-icons/fa";
import { RiImageAddLine } from "react-icons/ri";
import { IoChatbubbleOutline } from "react-icons/io5";
import { FiPlus } from "react-icons/fi";
import { FaArrowUpLong } from "react-icons/fa6";

import Chat from "./chat";

export default function Home() {
  const {
    startResult,
    setStartResult,

    popup,
    setPopup,

    input,
    setInput,

    feature,
    setFeature,

    setPrevInput,

    setResult,

    loading,
    setLoading,

    setGenImgUrl,
  } = useContext(dataContext);

  // =========================================
  // GENERATE IMAGE
  // =========================================

  const handleGenerateImg = async () => {
    if (!input.trim()) return;

    const prompt = input.trim();

    console.log("Image Prompt:", prompt);

    // Save prompt
    prevUser.prompt = prompt;

    // UI state
    setStartResult(true);
    setFeature("genImg");
    setLoading(true);
    setResult("");
    setGenImgUrl("");
    setPrevInput(prompt);

    try {
      console.log("Generating image:", prompt);

      // Call backend
      const blob = await query(prompt);

      console.log("Image Blob:", blob);
      console.log("Image Type:", blob.type);
      console.log("Image Size:", blob.size);

      if (!blob || !blob.type.startsWith("image/")) {
        throw new Error("Invalid image received from server");
      }

      // Blob → browser URL
      const imageUrl = URL.createObjectURL(blob);

      console.log("Image URL:", imageUrl);

      // Show image
      setGenImgUrl(imageUrl);
    } catch (error) {
      console.error("Image Generation Error:", error);

      setResult(
        `❌ Image generation failed: ${
          error.message || "Please try again."
        }`
      );
    } finally {
      setLoading(false);
      setInput("");
    }
  };

  // =========================================
  // CHAT SUBMIT
  // =========================================

 // =========================================
// CHAT + IMAGE SUBMIT
// =========================================

const handleSubmit = async (e) => {
  e.preventDefault();

  if (!input.trim()) return;

  const prompt = input.trim();

  console.log("================================");
  console.log("💬 Chat Prompt:", prompt);
  console.log(
    "🖼️ Image:",
    user.data ? "YES ✅" : "NO"
  );
  console.log(
    "📷 MimeType:",
    user.mimeType
  );
  console.log("================================");

  // =========================================
  // SAVE USER MESSAGE
  // =========================================

  prevUser.prompt = prompt;
  prevUser.data = user.data;
  prevUser.mimeType = user.mimeType;
  prevUser.imgUrl = user.imgUrl;

  // =========================================
  // UI STATE
  // =========================================

  setPrevInput(prompt);

  setStartResult(true);

  setFeature("chat");

  setLoading(true);

  setResult("");

  try {
    let aiResponse;

    // =======================================
    // IMAGE + TEXT
    // =======================================

    if (user.data && user.mimeType) {

      console.log(
        "🖼️ Sending IMAGE + PROMPT..."
      );

      aiResponse = await generateResponse(
        prompt,
        user.data,
        user.mimeType
      );

    }

    // =======================================
    // TEXT ONLY
    // =======================================

    else {

      console.log(
        "💬 Sending TEXT only..."
      );

      aiResponse = await generateResponse(
        prompt
      );
    }

    console.log(
      "✅ AI Response:",
      aiResponse
    );

    // =========================================
    // SHOW AI RESPONSE
    // =========================================

    setResult(aiResponse);

  } catch (error) {

    console.error(
      "❌ Chat Error:",
      error
    );

    setResult(
      `❌ ${
        error.message ||
        "Something went wrong."
      }`
    );

  } finally {

    setLoading(false);

    setFeature("chat");

    setInput("");

    // =======================================
    // DO NOT CLEAR prevUser
    // =======================================

    user.data = null;
    user.mimeType = null;
    user.imgUrl = null;
  }
};

// =========================================
// IMAGE UPLOAD
// =========================================


const handleImage = (e) => {
  const file = e.target.files?.[0];

  if (!file) return;

  // =======================================
  // VALIDATE IMAGE
  // =======================================

  if (!file.type.startsWith("image/")) {
    alert("Please select a valid image file.");
    return;
  }

  // =======================================
  // SIZE LIMIT
  // =======================================

  const maxSize = 10 * 1024 * 1024;

  if (file.size > maxSize) {
    alert(
      "Image size must be less than 10MB."
    );
    return;
  }

  console.log(
    "🖼️ Selected Image:",
    file
  );

  // =======================================
  // READ IMAGE
  // =======================================

  const reader = new FileReader();

  reader.onload = (event) => {

    const result =
      event.target?.result;

    if (!result) return;

    // =====================================
    // BASE64
    // =====================================

    const base64 =
      result.split(",")[1];

    // =====================================
    // SAVE IMAGE
    // =====================================

    user.data = base64;

    user.mimeType =
      file.type;

    user.imgUrl =
      result;

    console.log(
      "✅ Uploaded User Image:",
      {
        mimeType: user.mimeType,
        imageSize: base64.length,
        hasImage: !!user.data,
      }
    );

    // =====================================
    // IMPORTANT
    // =====================================
    // Image upload ke baad
    // normal CHAT mode rahega

    setFeature("chat");

    // Chat screen show karo

    setStartResult(true);

    // Popup close

    setPopup(false);
  };

  reader.readAsDataURL(file);

  // Same image dobara select karne ke liye

  e.target.value = "";
};

  // =========================================
  // LOGO CLICK
  // =========================================

  const handleLogoClick = () => {
    setStartResult(false);
    setFeature("chat");
    setPopup(false);
    setInput("");
    setResult("");
    setGenImgUrl("");
  };

  // =========================================
  // FORM SUBMIT
  // =========================================

  const handleFormSubmit = (e) => {
    e.preventDefault();

    if (loading) return;

    if (feature === "genImg") {
      handleGenerateImg();
    } else {
      handleSubmit(e);
    }
  };

  // =========================================
  // JSX
  // =========================================

  return (
    <div className="app">

      {/* =====================================
          NAVBAR
      ===================================== */}

      <nav>
        <div
          className="logo"
          onClick={handleLogoClick}
        >
          Smart AI Bot
        </div>
      </nav>

      {/* =====================================
          HIDDEN IMAGE INPUT
      ===================================== */}

      <input
        type="file"
        accept="image/*"
        hidden
        id="inputImg"
        onChange={handleImage}
      />

      {/* =====================================
          HOME / HERO
      ===================================== */}

      {!startResult ? (
        <div className="hero">

          <span id="tag">
            What Can I Help With ?
          </span>

          <div className="cate">

            {/* UPLOAD IMAGE */}

            <div
              className="upImg"
              onClick={() => {
                document
                  .getElementById("inputImg")
                  .click();
              }}
            >
              <RiImageAddLine />

              <span>
                Upload Image
              </span>
            </div>

            {/* GENERATE IMAGE */}

            <div
              className="genImg"
              onClick={() => {
                setFeature("genImg");
                setStartResult(true);
              }}
            >
              <FaImage />

              <span>
                Generate Image
              </span>
            </div>

            {/* CHAT */}

            <div
              className="chat"
              onClick={() => {
                setFeature("chat");
                setStartResult(true);
              }}
            >
              <IoChatbubbleOutline />

              <span>
                Chat
              </span>
            </div>

          </div>
        </div>
      ) : (
        <Chat />
      )}

      {/* =====================================
          INPUT AREA
      ===================================== */}

      <div className="input-area">

        <form onSubmit={handleFormSubmit}>

          {/* ADD BUTTON */}

          <button
            type="button"
            id="add"
            disabled={loading}
            onClick={() => {
              setPopup(!popup);
            }}
          >
            {feature === "genImg" ? (
              <FaImage />
            ) : feature === "uploadImg" ? (
              <RiImageAddLine />
            ) : (
              <FiPlus />
            )}
          </button>

          {/* TEXT INPUT */}

          <input
            type="text"
            placeholder={
              feature === "genImg"
                ? "Describe the image you want..."
                : "Ask me anything..."
            }
            value={input}
            disabled={loading}
            onChange={(e) => {
              setInput(e.target.value);
            }}
          />

          {/* SEND BUTTON */}

          {input.trim() !== "" && !loading && (
            <button
              type="submit"
              title={
                feature === "genImg"
                  ? "Generate Image"
                  : "Send"
              }
            >
              <FaArrowUpLong />
            </button>
          )}

          {/* =================================
              POPUP MENU
          ================================= */}

          {popup && (
            <div className="select-up">

              {/* UPLOAD */}

              <div
                className="select-upload"
                onClick={() => {
                  setPopup(false);
                  setFeature("uploadImg");

                  document
                    .getElementById("inputImg")
                    .click();
                }}
              >
                <RiImageAddLine />

                <span>
                  Upload Image
                </span>
              </div>

              {/* GENERATE IMAGE */}

              <div
                className="select-gen"
                onClick={() => {
                  setFeature("genImg");
                  setPopup(false);
                  setStartResult(true);
                }}
              >
                <FaImage />

                <span>
                  Generate Image
                </span>
              </div>

              {/* CHAT */}

              <div
                className="select-chat"
                onClick={() => {
                  setFeature("chat");
                  setPopup(false);
                  setStartResult(true);
                }}
              >
                <IoChatbubbleOutline />

                <span>
                  Chat
                </span>
              </div>

            </div>
          )}

        </form>

      </div>

    </div>
  );
}