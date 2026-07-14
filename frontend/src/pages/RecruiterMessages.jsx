import React, { useEffect, useState, useRef } from 'react';
import Layout from '../components/Layout';
import api from '../utils/api';
import { useSocket } from '../context/SocketContext';
import { motion } from 'framer-motion';
import {
  Send,
  MessageSquare,
  User,
  Paperclip,
  Award
} from 'lucide-react';

const getAvatarUrl = (url) => {
  if (!url) return 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&q=80';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `http://localhost:5000${url}`;
};

const RecruiterMessages = () => {
  const { socket } = useSocket();
  const [conversations, setConversations] = useState([]);
  const [activePartner, setActivePartner] = useState(null);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);

  const messagesEndRef = useRef(null);

  const fetchConversations = async (autoSelectId = null) => {
    try {
      setLoading(true);
      const res = await api.get('/recruiter/conversations');
      if (res.data.status === 'success') {
        const list = res.data.data.conversations || [];
        setConversations(list);

        if (autoSelectId) {
          const match = list.find(c => c.partner?._id === autoSelectId);
          if (match) setActivePartner(match.partner);
        } else if (list.length > 0 && !activePartner) {
          setActivePartner(list[0].partner);
        }
      }
    } catch (err) {
      console.error('Failed to load chats list:', err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (partnerId) => {
    try {
      setLoadingMsgs(true);
      const res = await api.get(`/recruiter/messages/${partnerId}`);
      if (res.data.status === 'success') {
        setMessages(res.data.data.messages || []);
      }
    } catch (err) {
      console.error('Failed to load message thread:', err.message);
    } finally {
      setLoadingMsgs(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (activePartner) {
      fetchMessages(activePartner._id);
    }
  }, [activePartner]);

  // Scroll chat bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle incoming real-time socket messages
  useEffect(() => {
    if (!socket) return;

    const handleIncomingMessage = (payload) => {
      const { message, sender } = payload;
      // If message is from currently open chat partner, add to messages list
      if (activePartner && (message.senderId === activePartner._id || message.recipientId === activePartner._id)) {
        setMessages(prev => [...prev, message]);
      }
      // Reload conversations list in background
      fetchConversations(activePartner?._id);
    };

    socket.on('recruiter_message_received', handleIncomingMessage);

    return () => {
      socket.off('recruiter_message_received', handleIncomingMessage);
    };
  }, [socket, activePartner]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!content.trim() || !activePartner) return;

    try {
      const res = await api.post('/recruiter/messages', {
        recipientId: activePartner._id,
        content
      });

      if (res.data.status === 'success') {
        setMessages(prev => [...prev, res.data.data.message]);
        setContent('');
        fetchConversations(activePartner._id);
      }
    } catch (err) {
      alert('Failed to send message.');
    }
  };

  return (
    <Layout>
      <div className="rounded-3xl border bg-white shadow-sm flex h-[78vh] overflow-hidden text-xs text-left max-w-7xl mx-auto">
        
        {/* Left Side: Conversations List */}
        <div className="w-1/3 border-r flex flex-col">
          <div className="p-4 border-b">
            <h3 className="font-extrabold text-sm text-slate-800 flex items-center">
              <MessageSquare className="w-4 h-4 mr-1.5 text-indigo-500" />
              <span>Inbox Chat Messages</span>
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto divide-y">
            {loading ? (
              <div className="text-center py-12 animate-pulse text-slate-400">Syncing chat lists...</div>
            ) : conversations.length === 0 ? (
              <div className="text-center py-12 text-slate-400 font-semibold italic">No active messages.</div>
            ) : (
              conversations.map((c) => {
                const partner = c.partner;
                if (!partner) return null;
                const isSelected = activePartner?._id === partner._id;
                return (
                  <button
                    key={partner._id}
                    onClick={() => setActivePartner(partner)}
                    className={`w-full p-4 text-left transition-colors flex items-center space-x-3 ${
                      isSelected ? 'bg-slate-50 border-r-2 border-indigo-500' : 'hover:bg-slate-50/40'
                    }`}
                  >
                    <img src={getAvatarUrl(partner.avatar)} alt="Avatar" className="w-9 h-9 rounded-full border object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-center">
                        <span className="font-extrabold text-slate-800 truncate">{partner.name}</span>
                        {c.unreadCount > 0 && (
                          <span className="bg-indigo-550 text-white font-bold text-[8px] px-1.5 py-0.5 rounded-full">
                            {c.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-450 truncate mt-0.5">{c.lastMessage}</p>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        {/* Right Side: Active Messages Chat Thread */}
        <div className="w-2/3 flex flex-col justify-between bg-slate-50/30">
          {activePartner ? (
            <>
              {/* Active Header */}
              <div className="p-4 border-b bg-white flex justify-between items-center">
                <div className="flex items-center space-x-2.5">
                  <img src={getAvatarUrl(activePartner.avatar)} alt="Avatar" className="w-9 h-9 rounded-full border object-cover" />
                  <div>
                    <span className="font-extrabold text-slate-800 block">{activePartner.name}</span>
                    <span className="text-[9px] text-slate-400 block">{activePartner.college || 'DevMesh Member'}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-1.5 bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded font-bold text-[9px]">
                  <Award className="w-3.5 h-3.5" />
                  <span>{activePartner.reputation || 0} REP</span>
                </div>
              </div>

              {/* Message History list */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {loadingMsgs ? (
                  <div className="text-center py-12 animate-pulse text-slate-400">Loading message log...</div>
                ) : messages.length === 0 ? (
                  <div className="text-center py-12 text-slate-400 italic">No messages sent. Start the conversation below.</div>
                ) : (
                  messages.map((m) => {
                    const isSelf = m.senderId !== activePartner._id;
                    return (
                      <div key={m._id} className={`flex ${isSelf ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-md rounded-2xl px-4 py-2.5 shadow-sm space-y-1 ${
                          isSelf ? 'bg-slate-900 text-white rounded-tr-none' : 'bg-white border text-slate-800 rounded-tl-none'
                        }`}>
                          <p className="leading-relaxed">{m.content}</p>
                          <span className={`block text-[8px] text-right ${isSelf ? 'text-slate-400' : 'text-slate-400'}`}>
                            {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input form */}
              <form onSubmit={handleSend} className="p-4 bg-white border-t flex space-x-2 items-center">
                <input
                  type="text"
                  required
                  placeholder="Write message..."
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  className="bg-slate-50 border rounded-xl px-4 py-2.5 flex-1 focus:outline-none"
                />
                <button
                  type="submit"
                  className="p-2.5 bg-brand-primary text-white rounded-xl hover:opacity-90 shadow"
                >
                  <Send className="w-4.5 h-4.5" />
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center space-y-3 text-slate-400">
              <MessageSquare className="w-10 h-10 text-slate-300" />
              <span className="font-bold">Select a conversation from the left to start messaging.</span>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default RecruiterMessages;
