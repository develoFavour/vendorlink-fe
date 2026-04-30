"use client";

import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { MessageCircle, PackageOpen, Send, Store } from "lucide-react";
import { toast } from "sonner";
import { getChatSocket } from "@/lib/chat-socket";
import { formatCurrency } from "@/lib/seller-products";
import { conversationService, type ChatMessage, type Conversation } from "@/services/conversation.service";

type MessageCenterProps = {
  role: "buyer" | "seller";
};

const getParticipantName = (conversation: Conversation, role: "buyer" | "seller") =>
  role === "buyer" ? conversation.sellerId.fullName : conversation.buyerId.fullName;

const getUnreadCount = (conversation: Conversation, role: "buyer" | "seller") =>
  role === "buyer" ? conversation.unreadByBuyer : conversation.unreadBySeller;

const hasProductPreview = (conversation: Conversation) =>
  Boolean(
    conversation.productId &&
      typeof conversation.productId === "object" &&
      conversation.productId.name
  );

export function MessageCenter({ role }: MessageCenterProps) {
  const searchParams = useSearchParams();
  const requestedConversationId = searchParams.get("conversation");
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string>("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [draft, setDraft] = useState("");
  const [isLoadingConversations, setIsLoadingConversations] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const activeConversation = useMemo(
    () => conversations.find((conversation) => conversation._id === activeConversationId) || null,
    [activeConversationId, conversations]
  );

  useEffect(() => {
    conversationService
      .getConversations()
      .then((result) => {
        setConversations(result);
        const preferred = requestedConversationId && result.some((item) => item._id === requestedConversationId)
          ? requestedConversationId
          : result[0]?._id || "";
        setActiveConversationId(preferred);
      })
      .catch(() => toast.error("Unable to load conversations."))
      .finally(() => setIsLoadingConversations(false));
  }, [requestedConversationId]);

  useEffect(() => {
    const socket = getChatSocket();
    socket.connect();

    const handleNewMessage = (payload: { conversationId: string; message: ChatMessage; conversation: Conversation }) => {
      setConversations((current) => {
        const next = current.filter((conversation) => conversation._id !== payload.conversationId);
        return [payload.conversation, ...next];
      });

      if (payload.conversationId === activeConversationId) {
        setMessages((current) => current.some((message) => message._id === payload.message._id) ? current : [...current, payload.message]);
        void conversationService.markAsRead(payload.conversationId);
      }
    };

    const handleSentMessage = (payload: { conversationId: string; conversation: Conversation }) => {
      setConversations((current) => {
        const next = current.filter((conversation) => conversation._id !== payload.conversationId);
        return [payload.conversation, ...next];
      });
    };

    socket.on("message:new", handleNewMessage);
    socket.on("message:sent", handleSentMessage);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("message:sent", handleSentMessage);
    };
  }, [activeConversationId]);

  useEffect(() => {
    if (!activeConversationId) {
      return;
    }

    const socket = getChatSocket();
    socket.emit("conversation:join", activeConversationId);

    const loadMessages = async () => {
      setIsLoadingMessages(true);

      try {
        const result = await conversationService.getMessages(activeConversationId);
        setMessages(result.messages);
        const updated = await conversationService.markAsRead(activeConversationId);
        setConversations((current) =>
          current.map((conversation) => conversation._id === updated._id ? updated : conversation)
        );
      } catch {
        toast.error("Unable to load messages.");
      } finally {
        setIsLoadingMessages(false);
      }
    };

    void loadMessages();

    return () => {
      socket.emit("conversation:leave", activeConversationId);
    };
  }, [activeConversationId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const body = draft.trim();
    if (!activeConversation || !body) return;

    setIsSending(true);

    try {
      const message = await conversationService.sendMessage(activeConversation._id, body);
      setMessages((current) => current.some((item) => item._id === message._id) ? current : [...current, message]);
      setDraft("");
    } catch {
      toast.error("Unable to send message.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="grid overflow-visible rounded-[24px] bg-white shadow-sm sm:rounded-[30px] xl:min-h-[calc(100vh-130px)] xl:grid-cols-[340px_minmax(0,1fr)] xl:overflow-hidden">
      <aside className="border-b border-black/[0.06] xl:border-b-0 xl:border-r">
        <div className="border-b border-black/[0.06] p-4 sm:p-5">
          <p className="text-[11px] font-black uppercase tracking-[0.24em] text-[#F25A1D]">
            {role === "buyer" ? "Vendor messages" : "Buyer messages"}
          </p>
          <h1 className="mt-2 text-2xl font-black tracking-tight text-[#171714]">Inbox</h1>
        </div>

        <div className="max-h-[42vh] overflow-y-auto p-3 xl:max-h-[72vh]">
          {isLoadingConversations ? (
            <p className="p-4 text-sm font-black text-[#74746F]">Loading conversations...</p>
          ) : conversations.length === 0 ? (
            <div className="grid min-h-[300px] place-items-center p-6 text-center">
              <div>
                <PackageOpen className="mx-auto h-10 w-10 text-[#F25A1D]" />
                <p className="mt-3 text-sm font-black text-[#171714]">No conversations yet</p>
                <p className="mt-1 text-xs font-semibold text-[#74746F]">
                  {role === "buyer" ? "Start one from a product page." : "Buyer inquiries will appear here."}
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {conversations.map((conversation) => {
                const isActive = conversation._id === activeConversationId;
                const unread = getUnreadCount(conversation, role);

                return (
                  <button
                    key={conversation._id}
                    type="button"
                    onClick={() => setActiveConversationId(conversation._id)}
                    className={`w-full rounded-3xl p-3 text-left transition-colors ${
                      isActive ? "bg-[#FFEDE5]" : "hover:bg-[#F8F8F6]"
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-white">
                          {hasProductPreview(conversation) && conversation.productId?.image ? (
                            <Image src={conversation.productId.image} alt={conversation.productId.name} fill sizes="56px" className="object-contain p-1.5" />
                          ) : (
                          <div className="grid h-full place-items-center bg-[#F6F6F4] text-[#F25A1D]">
                            <Store className="h-5 w-5" />
                          </div>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-sm font-black text-[#171714]">{getParticipantName(conversation, role)}</p>
                          {unread > 0 && (
                            <span className="rounded-full bg-[#F25A1D] px-2 py-0.5 text-[10px] font-black text-white">{unread}</span>
                          )}
                        </div>
                        <p className="mt-1 truncate text-xs font-bold text-[#74746F]">
                          {hasProductPreview(conversation) ? conversation.productId?.name : "General conversation"}
                        </p>
                        <p className="mt-1 truncate text-xs font-semibold text-[#8A8A86]">
                          {conversation.lastMessage || "No messages yet"}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </aside>

      <section className="flex min-h-[560px] flex-col xl:min-h-0">
        {activeConversation ? (
          <>
            <div className="border-b border-black/[0.06] p-4 sm:p-5">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <p className="text-sm font-black text-[#171714]">{getParticipantName(activeConversation, role)}</p>
                  <p className="mt-1 text-xs font-semibold text-[#74746F]">
                    {hasProductPreview(activeConversation) ? "Product conversation" : "Conversation"}
                  </p>
                </div>
                {hasProductPreview(activeConversation) && activeConversation.productId && (
                  <Link
                    href={role === "buyer" ? `/buyer/products/${activeConversation.productId._id}` : `/seller/products/${activeConversation.productId._id}`}
                    className="flex w-full max-w-md items-center gap-3 rounded-3xl bg-[#F8F8F6] p-3 text-left md:w-auto"
                  >
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl bg-white">
                      {activeConversation.productId.image && (
                        <Image src={activeConversation.productId.image} alt={activeConversation.productId.name} fill sizes="48px" className="object-contain p-1.5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-xs font-black text-[#171714]">{activeConversation.productId.name}</p>
                      <p className="mt-1 text-xs font-bold text-[#F25A1D]">{formatCurrency(activeConversation.productId.price || 0)}</p>
                    </div>
                  </Link>
                )}
              </div>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto bg-[#FAFAF9] p-4 sm:p-5">
              {isLoadingMessages ? (
                <p className="text-sm font-black text-[#74746F]">Loading messages...</p>
              ) : messages.length === 0 ? (
                <div className="grid h-full place-items-center text-center">
                  <div>
                    <MessageCircle className="mx-auto h-10 w-10 text-[#F25A1D]" />
                    <p className="mt-3 text-sm font-black text-[#171714]">Start the conversation</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {messages.map((message) => {
                    const isMine = role === "buyer"
                      ? message.senderId === activeConversation.buyerId._id
                      : message.senderId === activeConversation.sellerId._id;

                    return (
                      <div key={message._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
                        <div className={`max-w-[86%] rounded-3xl px-4 py-3 sm:max-w-[78%] ${
                          isMine ? "bg-[#F25A1D] text-white" : "bg-white text-[#171714] shadow-sm"
                        }`}>
                          <p className="text-sm font-semibold leading-6">{message.body}</p>
                          <p className={`mt-2 text-[10px] font-bold ${isMine ? "text-white/70" : "text-[#8A8A86]"}`}>
                            {new Date(message.createdAt).toLocaleTimeString("en-NG", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={bottomRef} />
                </div>
              )}
            </div>

            <form onSubmit={sendMessage} className="border-t border-black/[0.06] p-3 sm:p-4">
              <div className="flex gap-3 rounded-3xl bg-[#F6F6F4] p-2">
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder="Write a message..."
                  className="min-w-0 flex-1 bg-transparent px-4 text-sm font-bold text-[#171714] outline-none placeholder:text-[#B7B7B2]"
                />
                <button
                  type="submit"
                  disabled={!draft.trim() || isSending}
                  className="grid h-11 w-11 place-items-center rounded-2xl bg-[#F25A1D] text-white disabled:opacity-50"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="grid h-full min-h-[360px] place-items-center p-5 text-center sm:min-h-[520px] sm:p-8">
            <div>
              <MessageCircle className="mx-auto h-12 w-12 text-[#F25A1D]" />
              <h2 className="mt-4 text-2xl font-black text-[#171714]">Select a conversation</h2>
              <p className="mt-2 text-sm font-semibold text-[#74746F]">Messages will open here.</p>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
