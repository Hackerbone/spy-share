import axios from "axios";

const instance = axios.create({
  baseURL: "https://spy-share.herokuapp.com",
  withCredentials: true,
});

export default instance;
