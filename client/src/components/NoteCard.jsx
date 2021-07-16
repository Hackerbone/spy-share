import React from "react";

import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";
export default function NoteCard(props) {
  return (
    <>
      {props.data ? (
        <div className="note-card">
          <div className="alpha-bg">
            <h2 className="note-heading">{props.data.title.length ? props.data.title : "-"}</h2>

            <div className="note-description">
              <ReactMarkdown className="custom-html-style" remarkPlugins={[gfm]} children={props.data.description ? props.data.description : "Note description comes here"} />
            </div>
            {/* <h4 className="note-description">{props.data.description.length ? props.data.description : "-"}</h4> */}
            <p style={{ marginTop: "1rem" }}>
              <i>
                Created on : {new Date(Date.parse(props.data.date)).toLocaleDateString()} {new Date(Date.parse(props.data.date)).toLocaleTimeString()}{" "}
              </i>
            </p>
            {props.data.modifiedDate ? (
              <p>
                <i>
                  Last modified : {new Date(Date.parse(props.data.modifiedDate)).toLocaleDateString()} {new Date(Date.parse(props.data.modifiedDate)).toLocaleTimeString()}{" "}
                </i>
              </p>
            ) : (
              <></>
            )}
          </div>
          {props.data.owner && props.user.email === props.data.owner ? <div className="tag">Owned By you</div> : <div className="tag-shared">Shared By {props.data.owner}</div>}
        </div>
      ) : (
        <></>
      )}
    </>
  );
}
