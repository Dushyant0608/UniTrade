import axios from "axios";

const api = axios.create({
    baseURL: "http://localhost:3000/api",
    withCredentials: true,  // sends cookies with every request (JWT)
});

// ─────────────────────────────────────────────
// AUTH
// ─────────────────────────────────────────────
export const registerUser = (data) => api.post("/auth/signup", data);
export const loginUser = (data) => api.post("/auth/login", data);
export const logoutUser = () => api.post("/auth/logout");
export const getMe = () => api.get("/auth/me");

// ─────────────────────────────────────────────
// ITEMS
// ─────────────────────────────────────────────
export const createItem = (data) => api.post("/items", data);
export const getItem = (id) => api.get(`/items/${id}`);
export const getMyListings = () => api.get("/items/my/listings");
export const deleteItem = (id) => api.delete(`/items/${id}`);
export const markAsSold = (id) => api.put(`/items/${id}/sold`);
export const getFeed = () => api.get("/feed");
export const getExplore = (page = 1, limit = 20) => api.get(`/explore?page=${page}&limit=${limit}`);

// ─────────────────────────────────────────────
// CLICK TRACKING (Discovery Engine)
// ─────────────────────────────────────────────
export const recordItemClick = (id) => api.post(`/item/${id}/click`);

// ─────────────────────────────────────────────
// DONATIONS
// ─────────────────────────────────────────────
export const getDonations = (page = 1, limit = 20) => api.get(`/donations?page=${page}&limit=${limit}`);
export const claimDonation = (id) => api.post(`/donations/${id}/claim`);

// ─────────────────────────────────────────────
// TAGS
// ─────────────────────────────────────────────
export const suggestTags = (data) => api.post("/tags/suggest", data);

export default api;