import React from "react";
import NoteCard from "../components/NoteCard";
import { useState, useEffect, useRef } from "react";
import axios from "../utils/axiosurl";
import SingleNote from "../components/SingleNote";
import swal from "sweetalert";
import { useHistory } from "react-router-dom";
import "react-markdown-editor-lite/lib/index.css";

import Editor from "react-markdown-editor-lite";

import MarkdownIt from "markdown-it";
const mdParser = new MarkdownIt();
const mdDefault = `
> Here is a template quote

# This is a note heading

**This is a bold text**

![Image placeholder](https://designshack.net/wp-content/uploads/placeholder-image.png)

`;

export default function Notes(props) {
  const history = useHistory();
  const mdEditor = useRef(null);

  const user = props.user;

  const [create, setCreate] = useState(0);

  const [note, setNote] = useState({
    title: "",
    description: "",
  });

  const handleEditorChange = ({ html, text }) => {
    setNote({ ...note, description: text });
  };

  const [getNotes, setGetNotes] = useState([]);

  const getAllNotes = () => {
    axios
      .get("/getNotes")
      .then((res) => {
        if (res.status === 200) {
          setGetNotes(res.data);

          swal("Good going", "Your notes are saved!", "success").then((clicked) => {
            if (clicked) {
              setCreate(!create);
            }
          });
        }
      })
      .catch((err) => console.log("Error", err));
  };
  const createNote = async (e) => {
    e.preventDefault();
    await axios
      .post("/create", note)
      .then((res) => {
        getAllNotes();
      })
      .catch((err) => {
        console.log(err);
      });
  };
  const logout = (e) => {
    e.preventDefault();
    axios
      .get("/logout", note)
      .then((res) => {
        if (res.data === "Logged out successfully") {
          swal(res.data, "Come back later!", "success").then((clicked) => {
            if (clicked) {
              window.location.href = "/";
            }
          });
        }
      })
      .catch((err) => {
        console.log(err);
      });
  };

  useEffect(() => {
    const getAllNotes = async () => {
      await axios
        .get("/getNotes")
        .then((res) => {
          if (res.status === 200) {
            setGetNotes(res.data);
          }
        })
        .catch((err) => console.log("Error", err));
    };
    getAllNotes();
  }, []);

  return (
    <section className="dashboard">
      <div className="headers">
        <div className="left">
          <h1 className="title">Welcome {user.name}</h1>
          <h3 className="sub-title">Your notes : {getNotes.length}</h3>
          <button className="primary-btn m-0" onClick={() => setCreate(!create)}>
            {create ? "View All notes" : "Create new Note"}
          </button>
        </div>
        <div className="right">
          <button className="primary-btn" onClick={(e) => logout(e)}>
            Logout
          </button>
        </div>
      </div>

      {create ? (
        <div className="create-note">
          <form onSubmit={(e) => createNote(e)} className="auth-form">
            <label>Title of your Note</label>
            <input
              type="text"
              placeholder="Title of your note"
              name="title"
              onChange={(e) => {
                setNote({ ...note, title: e.target.value });
              }}
            />
            <label className="my-1">Description</label>

            {/* <textarea
              type="text"
              placeholder="Content of your note"
              name="description"
              onChange={(e) => {
                setNote({ ...note, description: e.target.value });
              }}
            /> */}
            <Editor
              ref={mdEditor}
              style={{ height: "600px" }}
              defaultValue={mdDefault}
              className="editor"
              placeholder="start typing here.."
              onChange={handleEditorChange}
              renderHTML={(text) => mdParser.render(text)}
            />
            {note.title.length > 0 && note.description.length > 0 ? (
              <button className="primary-btn" type="submit">
                Submit
              </button>
            ) : (
              <div className="my-1">
                <h2>To save your note add a title and description</h2>
              </div>
            )}
          </form>

          <div className="preview">
            <h1 className="my-1">Note preview</h1>

            <SingleNote props={note} />
          </div>
        </div>
      ) : (
        <div className="notes">
          {getNotes.length > 0 ? (
            <>
              {getNotes &&
                getNotes.map((item, idx) => {
                  return (
                    <div
                      className="note-card-single-container"
                      onClick={() => {
                        history.push(`/note/${item._id}`);
                      }}
                      key={idx}
                    >
                      <NoteCard data={item} user={user} />
                    </div>
                  );
                })}
            </>
          ) : (
            <>
              <h1>No Notes yet! Create one by clicking on the Create Note button</h1>
            </>
          )}
        </div>
      )}
    </section>
  );
}
