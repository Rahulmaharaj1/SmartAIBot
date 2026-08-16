import React, { useContext } from "react";

import {
  dataContext,
  prevUser,
  user,
} from "../context/UserContext";

import { generateResponse } from "../gemini";

import "../App.css";

import { FaImage } from "react-icons/fa";
import { RiImageAddLine } from "react-icons/ri";
import { IoChatbubbleOutline } from "react-icons/io5";
import { FiPlus } from "react-icons/fi";
import { FaArrowUpLong } from "react-icons/fa6";

import Chat from "./chat";

import { query } from "../huggingFace";


export default function Home() {

  // ================================
  // CONTEXT
  // ================================

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

    result,
    setResult,

    loading,
    setLoading,

    genImgUrl,
    setGenImgUrl,

  } = useContext(dataContext);


  // ================================
  // GENERATE IMAGE
  // ================================

  const handleGenerateImg = async () => {

    // Empty input check
    if (!input.trim()) return;

    const prompt = input.trim();

    console.log("Image Prompt:", prompt);


    // ================================
    // SAVE USER PROMPT
    // ================================

    prevUser.prompt = prompt;


    // ================================
    // UI STATE
    // ================================

    setStartResult(true);

    setFeature("genImg");

    setLoading(true);

    setResult("");

    setGenImgUrl("");

    setPrevInput(prompt);


    try {

      console.log("Generating image:", prompt);


      // ================================
      // CALL HUGGING FACE
      // ================================

      const blob = await query(prompt);


      console.log("Image Blob:", blob);

      console.log("Image Type:", blob.type);

      console.log("Image Size:", blob.size);


      // ================================
      // BLOB → URL
      // ================================

      const imageUrl = URL.createObjectURL(blob);


      console.log("Image URL:", imageUrl);


      // ================================
      // SAVE IMAGE URL
      // ================================

      setGenImgUrl(imageUrl);


    } catch (error) {

      console.error(
        "Image Generation Error:",
        error
      );

      setResult(
        "❌ Image generation failed. Please try again."
      );

    } finally {

      setLoading(false);

      setInput("");

    }

  };


  // ================================
  // CHAT SUBMIT
  // ================================

  const handleSubmit = async (e) => {

    e.preventDefault();


    // Empty input
    if (!input.trim()) return;


    // ================================
    // SAVE USER DATA
    // ================================

    prevUser.prompt = input;

    prevUser.data = user.data;

    prevUser.mimeType = user.mimeType;

    prevUser.imgUrl = user.imgUrl;


    // ================================
    // UI
    // ================================

    setPrevInput(input);

    setStartResult(true);

    setFeature("chat");

    setLoading(true);

    setResult("");


    try {

      // ================================
      // GEMINI / OPENROUTER RESPONSE
      // ================================

      const aiResponse = await generateResponse();

      setResult(aiResponse);

    } catch (error) {

      console.error(
        "Chat Error:",
        error
      );

      setResult(
        "Something went wrong."
      );

    } finally {

      setLoading(false);

      setFeature("chat");

      setInput("");


      // ================================
      // CLEAR CURRENT USER IMAGE
      // ================================

      user.data = null;

      user.mimeType = null;

      user.imgUrl = null;

    }

  };


  // ================================
  // IMAGE UPLOAD
  // ================================

  const handleImage = (e) => {

    const file = e.target.files[0];


    if (!file) return;


    // Only image files
    if (!file.type.startsWith("image/")) {

      alert("Please select an image file.");

      return;

    }


    console.log("Selected Image:", file);


    // ================================
    // FEATURE
    // ================================

    setFeature("uploadImg");


    // ================================
    // FILE READER
    // ================================

    const reader = new FileReader();


    reader.onload = (event) => {

      const base64 =
        event.target.result.split(",")[1];


      // ================================
      // SAVE IMAGE DATA
      // ================================

      user.data = base64;

      user.mimeType = file.type;

      user.imgUrl =
        `data:${file.type};base64,${base64}`;


      console.log(
        "Uploaded User Image:",
        user
      );

    };


    reader.readAsDataURL(file);

  };


  // ================================
  // LOGO CLICK
  // ================================

  const handleLogoClick = () => {

    setStartResult(false);

    setFeature("chat");

    setPopup(false);

    setInput("");

  };


  // ================================
  // SEND FORM
  // ================================

  const handleFormSubmit = (e) => {

    e.preventDefault();


    // Generate Image
    if (feature === "genImg") {

      handleGenerateImg();

    }

    // Normal Chat
    else {

      handleSubmit(e);

    }

  };


  // ================================
  // JSX
  // ================================

  return (

    <div className="app">


      {/* ==================================
          NAVBAR
      ================================== */}

      <nav>

        <div
          className="logo"
          onClick={handleLogoClick}
        >
          Smart AI Bot
        </div>

      </nav>


      {/* ==================================
          HIDDEN IMAGE INPUT
      ================================== */}

      <input
        type="file"
        accept="image/*"
        hidden
        id="inputImg"
        onChange={handleImage}
      />


      {/* ==================================
          HOME / HERO
      ================================== */}

      {!startResult ? (

        <div className="hero">

          <span id="tag">
            What Can I Help With ?
          </span>


          {/* ==================================
              CATEGORY BUTTONS
          ================================== */}

          <div className="cate">


            {/* ================================
                UPLOAD IMAGE
            ================================ */}

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


            {/* ================================
                GENERATE IMAGE
            ================================ */}

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


            {/* ================================
                CHAT
            ================================ */}

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

        /* ==================================
           CHAT SCREEN
        ================================== */

        <Chat />

      )}


      {/* ==================================
          INPUT AREA
      ================================== */}

      <div className="input-area">

        <form
          onSubmit={handleFormSubmit}
        >


          {/* ==================================
              ADD / FEATURE BUTTON
          ================================== */}

          <button
            type="button"
            id="add"
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


          {/* ==================================
              TEXT INPUT
          ================================== */}

          <input
            type="text"
            placeholder={
              feature === "genImg"
                ? "Describe the image you want..."
                : "Ask me anything..."
            }
            value={input}
            onChange={(e) =>
              setInput(e.target.value)
            }
          />


          {/* ==================================
              SEND BUTTON
          ================================== */}

          {input.trim() !== "" && (

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


          {/* ==================================
              POPUP MENU
          ================================== */}

          {popup && (

            <div className="select-up">


              {/* ================================
                  UPLOAD IMAGE
              ================================ */}

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


              {/* ================================
                  GENERATE IMAGE
              ================================ */}

              <div
                className="select-gen"
                onClick={() => {

                  setFeature("genImg");

                  setPopup(false);

                }}
              >

                <FaImage />

                <span>
                  Generate Image
                </span>

              </div>


              {/* ================================
                  CHAT
              ================================ */}

              <div
                className="select-chat"
                onClick={() => {

                  setFeature("chat");

                  setPopup(false);

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