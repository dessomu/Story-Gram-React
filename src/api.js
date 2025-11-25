import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:3009", // your backend URL
});

export default API;
