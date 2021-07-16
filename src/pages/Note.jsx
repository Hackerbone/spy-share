import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router";
import { Link } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import axios from "../utils/axiosurl";
import swal from "sweetalert";
import SingleNote from "../components/SingleNote";

import gfm from "remark-gfm";

import Editor from "react-markdown-editor-lite";

import MarkdownIt from "markdown-it";
import "react-markdown-editor-lite/lib/index.css";

const mdParser = new MarkdownIt();

export default function Note({ user }) {
  const mdEditor = useRef(null);
  const [note, setNote] = useState({});
  const [modifiedNote, setModifiedNote] = useState({});
  const [click, setClick] = useState(0);
  const [userEmail, setUserEmail] = useState("");
  const params = useParams();
  const noteID = params.noteID;

  const handleEditorChange = ({ html, text }) => {
    setModifiedNote({ ...modifiedNote, description: text });
  };
  const getSingleNote = (e) => {
    axios.get("/getNote/" + noteID).then((res) => {
      setNote(res.data);
      setModifiedNote(res.data);
    });
  };

  const shareNote = async (e) => {
    e.preventDefault();
    await axios
      .post("/share/" + noteID, { userEmail: userEmail })
      .then((res) => {
        if (res.status === 200) {
          swal("Your note has been shared ", `${userEmail} can now view your note`, "success").then((clicked) => {
            if (clicked) {
              getSingleNote();
              setClick(0);
            }
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const modifyNote = async (e) => {
    e.preventDefault();
    const modifiedObj = modifiedNote;
    modifiedObj.modifiedDate = Date.now();
    await axios
      .post("/update/" + noteID, modifiedObj)
      .then((res) => {
        if (res.status === 200) {
          swal("Your note has been modified", "Continue to your note", "success").then((clicked) => {
            if (clicked) {
              getSingleNote();
              setClick(0);
            }
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const deleteNote = async () => {
    swal("Are you sure you want to delete this note?", "This action cannot be undone", "warning").then(async (clicked) => {
      if (clicked) {
        await axios
          .get("/delete/" + noteID)
          .then((res) => {
            if (res.status === 200) {
              swal("Your note has been deleted", "Continue to your notes", "success").then((clickedA) => {
                if (clickedA) {
                  window.location.href = "/notes";
                }
              });
            }
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        swal("Phew! That was kinda close", "Your note remains", "success");
      }
    });
  };

  const deleteShareNote = async () => {
    swal("Are you sure you want to delete this note?", "This action cannot be undone", "warning").then(async (clicked) => {
      if (clicked) {
        await axios
          .get("/delete-shared/" + noteID)
          .then((res) => {
            if (res.status === 200) {
              swal("Your note has been removed", "Continue to your notes", "success").then((clickedA) => {
                if (clickedA) {
                  window.location.href = "/notes";
                }
              });
            }
          })
          .catch((err) => {
            console.log(err);
          });
      } else {
        swal("Phew! That was kinda close", "Your note remains", "success");
      }
    });
  };
  useEffect(() => {
    axios.get("/getNote/" + noteID).then((res) => {
      setNote(res.data);
      setModifiedNote(res.data);
    });
  }, [noteID]);
  return (
    <div className="single-note-container">
      <div>
        <Link to="/notes" className="primary-btn m-0">
          Back to all notes
        </Link>
      </div>
      {click === 0 ? (
        <>
          <div className="note">
            <h1>{note.title}</h1>

            <ReactMarkdown className="custom-html-style" remarkPlugins={[gfm]} children={note.description ? note.description : "This note is not owned by you or does not exist"} />
          </div>

          {note.owner && user.email === note.owner ? <div className="tag">Owned By you</div> : <div className="tag-shared">Shared By {note.owner}</div>}
          {note.owner === user.email ? (
            <>
              {note.description && note.title ? (
                <div className="actions">
                  <button className="btn mr-1 my-1" onClick={() => setClick(2)}>
                    Share this note
                  </button>
                  <button className="btn mr-1 my-1" onClick={() => setClick(1)}>
                    Edit this note
                  </button>
                  <button className="btn mr-1 my-1" onClick={() => deleteNote()}>
                    Delete this note
                  </button>
                </div>
              ) : (
                <></>
              )}
            </>
          ) : (
            <>
              <button className="btn mr-1 my-1" onClick={() => deleteShareNote()}>
                Delete this note
              </button>
            </>
          )}
        </>
      ) : click === 1 ? (
        <>
          <div className="create-note">
            <button className="btn" onClick={() => setClick(0)}>
              Back to note
            </button>
            <form onSubmit={(e) => modifyNote(e)} className="auth-form">
              <label>Title of your Note</label>
              <input
                type="text"
                placeholder={modifiedNote.title}
                defaultValue={modifiedNote.title}
                name="title"
                onChange={(e) => {
                  setModifiedNote({ ...modifiedNote, title: e.target.value });
                }}
              />
              <label>Description</label>
              <Editor
                ref={mdEditor}
                style={{ height: "600px" }}
                defaultValue={modifiedNote.description}
                className="editor"
                placeholder="start typing here.."
                onChange={handleEditorChange}
                renderHTML={(text) => mdParser.render(text)}
              />
              {modifiedNote.title !== note.title || modifiedNote.description !== note.description ? (
                <button className="primary-btn" type="submit">
                  Submit
                </button>
              ) : (
                <div className="my-1">
                  <h2>Changes need to be done to save a note</h2>
                </div>
              )}

              {/* <textarea
                type="text"
                placeholder={modifiedNote.description}
                defaultValue={modifiedNote.description}
                name="description"
                onChange={(e) => {
                  setModifiedNote({ ...modifiedNote, description: e.target.value });
                }}
              /> */}
            </form>

            <div className="preview">
              <SingleNote props={modifiedNote} />
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="create-note">
            <form onSubmit={(e) => shareNote(e)} className="auth-form">
              <label>Enter the email to which you want to share this note with</label>
              <input
                type="text"
                placeholder={"example@gmail.com"}
                defaultValue={""}
                name="email"
                onChange={(e) => {
                  setUserEmail(e.target.value);
                }}
              />

              <button className="primary-btn" type="submit">
                Submit
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
