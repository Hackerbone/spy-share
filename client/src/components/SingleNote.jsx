import React from "react";
import ReactMarkdown from "react-markdown";
import gfm from "remark-gfm";

export default function SingleNote({ props }) {
  return (
    <div className="single-note">
      <h1>{props.title.length ? props.title : "Note title comes here"}</h1>
      {/* <p>{props.description ? props.description : "Note description comes here"}</p> */}

      <ReactMarkdown className="custom-html-style" remarkPlugins={[gfm]} children={props.description ? props.description : "Note description comes here"} />
    </div>
  );
}
