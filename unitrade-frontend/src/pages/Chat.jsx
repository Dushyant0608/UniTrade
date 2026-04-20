import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { getMessages, getConversations, sendMessage as sendMessageApi } from "../services/api";
import { connectSocket, disconnectSocket } from "../services/socket";
import { useAuth } from "../context/AuthContext";

const API_BASE = "http://localhost:3000";

// Generate a consistent room ID for two users + item
function getRoomId(itemId, userId1, userId2) {
    const sorted = [userId1, userId2].sort();
    return `${itemId}_${sorted[0]}_${sorted[1]}`;
}

export default function Chat() {
    const { itemId, userId } = useParams();
    const [searchParams] = useSearchParams();
    const itemTitle = searchParams.get("title") || "Item";
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    // If we have itemId + userId → show chat view, else show conversation list
    const isActiveChat = itemId && userId;

    return isActiveChat ? (
        <ChatRoom
            itemId={itemId}
            userId={userId}
            itemTitle={itemTitle}
            currentUser={user}
            navigate={navigate}
        />
    ) : (
        <ConversationList
            currentUser={user}
            navigate={navigate}
            logout={logout}
        />
    );
}


/* ═══════════════════════════════════════════════
   CONVERSATION LIST
   ═══════════════════════════════════════════════ */

function ConversationList({ currentUser, navigate, logout }) {
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchConversations();
    }, []);

    const fetchConversations = async () => {
        setLoading(true);
        try {
            const res = await getConversations();
            if (res.data.success) {
                setConversations(res.data.conversations);
            }
        } catch (err) {
            setError(err.response?.data?.message || "Could not load conversations.");
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <>
            <style>{`
                @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
                @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
                * { box-sizing: border-box; }
                body { margin: 0; background: #111111; }
            `}</style>

            <div style={{ minHeight: "100vh", background: "#111111", color: "#E8F5F1" }}>
                {/* Header */}
                <header style={{
                    position: "sticky", top: 0, zIndex: 50,
                    background: "#111111cc", backdropFilter: "blur(12px)",
                    borderBottom: "1px solid #1E1E1E",
                    padding: "0 24px", height: "56px",
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                    <button
                        onClick={() => navigate("/feed")}
                        style={{
                            display: "flex", alignItems: "center", gap: "8px",
                            background: "none", border: "none", color: "#E8F5F1",
                            fontSize: "14px", cursor: "pointer", padding: "4px 0",
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M19 12H5m0 0l7 7m-7-7l7-7" stroke="#E8F5F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        Feed
                    </button>
                    <span style={{ fontSize: "14px", fontWeight: "700", color: "#E8F5F1" }}>Messages</span>
                    <button
                        onClick={handleLogout}
                        title="Logout"
                        style={{
                            fontSize: "12px", color: "#FF6B6B", background: "#1A1A1A",
                            border: "1px solid #2A2A2A", padding: "5px 10px", borderRadius: "6px",
                            cursor: "pointer", display: "flex", alignItems: "center",
                        }}
                    >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </header>

                <main style={{ maxWidth: "700px", margin: "0 auto", padding: "20px", animation: "fadeSlideUp 0.22s ease" }}>

                    {/* Loading */}
                    {loading && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {Array.from({ length: 4 }).map((_, i) => (
                                <div key={i} style={{
                                    height: "76px", borderRadius: "14px",
                                    background: "linear-gradient(90deg, #1A1A1A 25%, #222 50%, #1A1A1A 75%)",
                                    backgroundSize: "200% 100%", animation: "shimmer 1.4s infinite",
                                }} />
                            ))}
                        </div>
                    )}

                    {/* Error */}
                    {error && (
                        <div style={{
                            background: "#2A0A0A", border: "1px solid #FF6B6B33",
                            borderRadius: "10px", padding: "16px", color: "#FF6B6B", fontSize: "14px",
                        }}>
                            {error}
                        </div>
                    )}

                    {/* Conversations */}
                    {!loading && !error && conversations.length > 0 && (
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {conversations.map((conv, i) => {
                                const imageUrl = conv.item?.images?.[0];
                                const img = imageUrl?.startsWith("http") ? imageUrl : imageUrl ? `${API_BASE}/${imageUrl}` : null;

                                return (
                                    <button
                                        key={i}
                                        onClick={() => navigate(`/chat/${conv.itemId}/${conv.otherUser?._id}?title=${encodeURIComponent(conv.item?.title || "Item")}`)}
                                        style={{
                                            display: "flex", alignItems: "center", gap: "14px",
                                            padding: "14px 16px", borderRadius: "14px",
                                            background: "#1A1A1A", border: "1px solid #2A2A2A",
                                            cursor: "pointer", transition: "border-color 0.2s",
                                            width: "100%", textAlign: "left",
                                        }}
                                        onMouseEnter={(e) => (e.currentTarget.style.borderColor = "#333")}
                                        onMouseLeave={(e) => (e.currentTarget.style.borderColor = "#2A2A2A")}
                                    >
                                        {/* Item thumbnail */}
                                        <div style={{
                                            width: "48px", height: "48px", borderRadius: "10px",
                                            background: "#222", overflow: "hidden", flexShrink: 0,
                                        }}>
                                            {img && (
                                                <img src={img} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div style={{ flex: 1, minWidth: 0 }}>
                                            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "3px" }}>
                                                <span style={{ fontSize: "13px", fontWeight: "600", color: "#E8F5F1", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {conv.otherUser?.name || "User"}
                                                </span>
                                                <span style={{ fontSize: "11px", color: "#555" }}>·</span>
                                                <span style={{ fontSize: "11px", color: "#555", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                                                    {conv.item?.title || "Item"}
                                                </span>
                                            </div>
                                            <p style={{
                                                margin: 0, fontSize: "12px", color: "#777",
                                                overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                                            }}>
                                                {conv.lastMessage}
                                            </p>
                                        </div>

                                        {/* Unread + time */}
                                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px", flexShrink: 0 }}>
                                            <span style={{ fontSize: "10px", color: "#555" }}>
                                                {conv.lastMessageAt ? new Date(conv.lastMessageAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" }) : ""}
                                            </span>
                                            {conv.unreadCount > 0 && (
                                                <span style={{
                                                    fontSize: "10px", fontWeight: "700", color: "#111",
                                                    background: "#00C896", borderRadius: "10px",
                                                    padding: "2px 7px", minWidth: "18px", textAlign: "center",
                                                }}>
                                                    {conv.unreadCount}
                                                </span>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    )}

                    {/* Empty */}
                    {!loading && !error && conversations.length === 0 && (
                        <div style={{ textAlign: "center", padding: "60px 20px" }}>
                            <svg style={{ margin: "0 auto 16px", display: "block", opacity: 0.3 }} width="48" height="48" viewBox="0 0 24 24" fill="none">
                                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#777" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            <p style={{ margin: "0 0 6px", fontSize: "15px", color: "#777" }}>No conversations yet</p>
                            <p style={{ margin: 0, fontSize: "13px", color: "#555" }}>
                                Find an item and tap "Contact Seller" to start chatting
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}


/* ═══════════════════════════════════════════════
   CHAT ROOM
   ═══════════════════════════════════════════════ */

function ChatRoom({ itemId, userId, itemTitle, currentUser, navigate }) {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    const roomId = getRoomId(itemId, currentUser._id, userId);

    // Scroll to bottom
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    // Fetch messages + setup socket
    useEffect(() => {
        const fetchAndConnect = async () => {
            setLoading(true);
            try {
                const res = await getMessages(itemId, userId);
                if (res.data.success) {
                    setMessages(res.data.messages);
                }
            } catch (err) {
                console.error("Failed to fetch messages:", err);
            } finally {
                setLoading(false);
            }

            // Connect socket
            const socket = connectSocket();
            socketRef.current = socket;
            socket.emit("join_room", roomId);

            // Listen for incoming messages
            socket.on("receive_message", (data) => {
                setMessages((prev) => [...prev, {
                    _id: Date.now(),
                    senderId: data.senderId,
                    receiverId: data.receiverId,
                    itemId: data.itemId,
                    content: data.content,
                    createdAt: new Date().toISOString(),
                }]);
            });

            // Typing indicators
            socket.on("user_typing", () => setIsTyping(true));
            socket.on("user_stop_typing", () => setIsTyping(false));
        };

        fetchAndConnect();

        return () => {
            if (socketRef.current) {
                socketRef.current.off("receive_message");
                socketRef.current.off("user_typing");
                socketRef.current.off("user_stop_typing");
            }
            disconnectSocket();
        };
    }, [itemId, userId]);

    // Auto-scroll on new messages
    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    // Handle typing indicator
    const handleInputChange = (e) => {
        setInput(e.target.value);
        if (socketRef.current) {
            socketRef.current.emit("typing", { roomId });
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = setTimeout(() => {
                socketRef.current?.emit("stop_typing", { roomId });
            }, 1000);
        }
    };

    // Send message
    const handleSend = async () => {
        const content = input.trim();
        if (!content || sending) return;

        setSending(true);
        setInput("");

        // Optimistic update
        const tempMsg = {
            _id: `temp_${Date.now()}`,
            senderId: currentUser._id,
            receiverId: userId,
            itemId,
            content,
            createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, tempMsg]);

        // Emit via socket
        if (socketRef.current) {
            socketRef.current.emit("send_message", {
                roomId,
                senderId: currentUser._id,
                receiverId: userId,
                itemId,
                content,
            });
            socketRef.current.emit("stop_typing", { roomId });
        }

        // Persist to DB
        try {
            await sendMessageApi({ receiverId: userId, itemId, content });
        } catch (err) {
            console.error("Failed to save message:", err);
        } finally {
            setSending(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    return (
        <>
            <style>{`
                @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes bounce { 0%, 80%, 100% { transform: scale(0); } 40% { transform: scale(1); } }
                * { box-sizing: border-box; }
                body { margin: 0; background: #111111; }
                ::-webkit-scrollbar { width: 5px; }
                ::-webkit-scrollbar-track { background: transparent; }
                ::-webkit-scrollbar-thumb { background: #2A2A2A; border-radius: 3px; }
            `}</style>

            <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: "#111111", color: "#E8F5F1" }}>
                {/* Header */}
                <header style={{
                    background: "#111111cc", backdropFilter: "blur(12px)",
                    borderBottom: "1px solid #1E1E1E",
                    padding: "0 20px", height: "56px", flexShrink: 0,
                    display: "flex", alignItems: "center", gap: "12px",
                }}>
                    <button
                        onClick={() => navigate("/chat")}
                        style={{
                            background: "none", border: "none", color: "#E8F5F1",
                            cursor: "pointer", padding: "4px", display: "flex",
                        }}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                            <path d="M19 12H5m0 0l7 7m-7-7l7-7" stroke="#E8F5F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                    <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ margin: 0, fontSize: "14px", fontWeight: "600", color: "#E8F5F1", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                            {itemTitle}
                        </p>
                        <p style={{ margin: 0, fontSize: "11px", color: "#555" }}>
                            {isTyping ? (
                                <span style={{ color: "#00C896" }}>typing...</span>
                            ) : "Tap to view item"}
                        </p>
                    </div>
                    <button
                        onClick={() => navigate(`/items/${itemId}`)}
                        style={{
                            fontSize: "11px", color: "#00C896", background: "#003D2B",
                            border: "1px solid #00C89622", padding: "5px 12px", borderRadius: "6px",
                            cursor: "pointer", fontWeight: "600",
                        }}
                    >
                        View Item
                    </button>
                </header>

                {/* Messages area */}
                <div style={{
                    flex: 1, overflowY: "auto", padding: "16px 20px",
                    display: "flex", flexDirection: "column", gap: "6px",
                }}>
                    {/* Loading */}
                    {loading && (
                        <div style={{ textAlign: "center", padding: "40px", color: "#555", fontSize: "13px" }}>
                            Loading messages...
                        </div>
                    )}

                    {/* Empty state */}
                    {!loading && messages.length === 0 && (
                        <div style={{ textAlign: "center", padding: "40px", color: "#555" }}>
                            <svg style={{ margin: "0 auto 12px", display: "block", opacity: 0.3 }} width="36" height="36" viewBox="0 0 24 24" fill="none">
                                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke="#777" strokeWidth="1.5" />
                            </svg>
                            <p style={{ margin: 0, fontSize: "13px" }}>Start the conversation</p>
                        </div>
                    )}

                    {/* Messages */}
                    {messages.map((msg) => {
                        const isMe = msg.senderId === currentUser._id || msg.senderId?._id === currentUser._id;
                        return (
                            <div
                                key={msg._id}
                                style={{
                                    display: "flex",
                                    justifyContent: isMe ? "flex-end" : "flex-start",
                                    animation: "fadeSlideUp 0.15s ease",
                                }}
                            >
                                <div
                                    style={{
                                        maxWidth: "70%",
                                        padding: "10px 14px",
                                        borderRadius: isMe ? "14px 14px 4px 14px" : "14px 14px 14px 4px",
                                        background: isMe ? "#003D2B" : "#1A1A1A",
                                        border: `1px solid ${isMe ? "#00C89622" : "#2A2A2A"}`,
                                        color: "#E8F5F1",
                                        fontSize: "13px",
                                        lineHeight: "1.5",
                                        wordBreak: "break-word",
                                    }}
                                >
                                    <p style={{ margin: 0 }}>{msg.content}</p>
                                    <span style={{
                                        display: "block", textAlign: "right",
                                        fontSize: "10px", color: "#555", marginTop: "4px",
                                    }}>
                                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" }) : ""}
                                    </span>
                                </div>
                            </div>
                        );
                    })}

                    {/* Typing indicator */}
                    {isTyping && (
                        <div style={{ display: "flex", justifyContent: "flex-start" }}>
                            <div style={{
                                padding: "10px 16px", borderRadius: "14px 14px 14px 4px",
                                background: "#1A1A1A", border: "1px solid #2A2A2A",
                                display: "flex", gap: "4px", alignItems: "center",
                            }}>
                                {[0, 1, 2].map((i) => (
                                    <div key={i} style={{
                                        width: "6px", height: "6px", borderRadius: "50%",
                                        background: "#555",
                                        animation: `bounce 1.4s ${i * 0.16}s infinite ease-in-out both`,
                                    }} />
                                ))}
                            </div>
                        </div>
                    )}

                    <div ref={messagesEndRef} />
                </div>

                {/* Input area */}
                <div style={{
                    padding: "12px 20px", borderTop: "1px solid #1E1E1E",
                    background: "#111111", flexShrink: 0,
                    display: "flex", gap: "10px", alignItems: "flex-end",
                }}>
                    <input
                        value={input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        placeholder="Type a message..."
                        style={{
                            flex: 1, padding: "12px 16px",
                            background: "#1A1A1A", border: "1px solid #2A2A2A",
                            borderRadius: "12px", color: "#E8F5F1",
                            fontSize: "14px", outline: "none",
                            transition: "border-color 0.2s",
                        }}
                        onFocus={(e) => (e.target.style.borderColor = "#00C896")}
                        onBlur={(e) => (e.target.style.borderColor = "#2A2A2A")}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!input.trim() || sending}
                        style={{
                            width: "44px", height: "44px", borderRadius: "12px",
                            border: "none", cursor: input.trim() && !sending ? "pointer" : "not-allowed",
                            background: input.trim() ? "#00C896" : "#2A2A2A",
                            color: input.trim() ? "#111" : "#555",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "all 0.2s", flexShrink: 0,
                        }}
                    >
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                            <path d="M22 2L11 13M22 2l-7 20-4-9-9-4 20-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </button>
                </div>
            </div>
        </>
    );
}
