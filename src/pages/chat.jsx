import React, { useContext } from "react";
import { dataContext, prevUser } from "../context/UserContext";

export default function Chat() {
  const { result, loading, feature, genImgUrl } = useContext(dataContext);

  return (
    <div className="chat-page">
      <div className="user">
        {prevUser.imgUrl && (
          <img src={prevUser.imgUrl} alt="Uploaded" className="user-img" />
        )}

        {prevUser.prompt && <span>{prevUser.prompt}</span>}
      </div>

      <div className="ai">
        {feature === "genImg" ? (
          loading ? (
            <div className="loader">
              <div className="dot"></div>
              <div className="dot"></div>
              <div className="dot"></div>
            </div>
          ) : genImgUrl ? (
            <img src={genImgUrl} alt="Generated AI" className="ai-img" />
          ) : (
            <span>No Image Generated</span>
          )
        ) : loading ? (
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