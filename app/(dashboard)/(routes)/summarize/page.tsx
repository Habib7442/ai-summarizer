"use client";
import { useEffect, useState } from "react";
import { useLazyGetSummaryQuery } from "@/provider/redux/article";
import { CopyIcon, Link, LoaderIcon, Trash2Icon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { auth, deleteChat, fetchChatsByUser, saveChat } from "@/utils/firebase";
import { User } from "firebase/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import CustomChatTextArea from "@/components/CustomChatTextArea";
import axios from "axios";

interface Article {
  url: string;
  summary: string;
  messages?: Message[];
}

interface Message {
  role: "user" | "model";
  content: string;
}

interface Chat {
  id: string;
  userId: string;
  articleUrl: string;
  articleSummary: string;
  summary: string;
  messages: Message[];
}

const Summarize = () => {
  const [article, setArticle] = useState<Article>({
    url: "",
    summary: "",
    messages: [],
  });
  const [copied, setCopied] = useState<{ [key: string]: boolean }>({});
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);
  const [userChats, setUserChats] = useState<Chat[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string | null>(null);
  const [urlClicked, setUrlClicked] = useState<boolean>(false);
  const [currentMessages, setCurrentMessages] = useState<Message[]>([]);

  const [getSummary, { isFetching, error }] = useLazyGetSummaryQuery();

  console.log(userChats, "userChats");

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setUser(user);
      if (user) {
        fetchUserChats(user.uid);
      }
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (currentChatId) {
      const currentChat = userChats.find((chat) => chat.id === currentChatId);
      if (currentChat) {
        setCurrentMessages(currentChat.messages);
      }
    }
  }, [currentChatId, userChats]);

  const fetchUserChats = async (uid: string) => {
    try {
      const fetchedChats = await fetchChatsByUser(uid);
      const typedChats = fetchedChats.map((chat) => ({
        id: chat.id,
        userId: chat.userId || "",
        articleUrl: chat.articleUrl || "",
        articleSummary: chat.articleSummary || "",
        summary: chat.summary || "",
        messages: Array.isArray(chat.messages) ? chat.messages : [],
      })) as Chat[];
      setUserChats(typedChats);

      if (currentChatId) {
        const currentChat = typedChats.find(
          (chat) => chat.id === currentChatId
        );
        if (currentChat) {
          setCurrentMessages(currentChat.messages);
        }
      }
    } catch (error) {
      console.error("Error fetching user chats: ", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrorMsg(null);
    setUrlClicked(false);

    const urlPattern = new RegExp(
      "^(https?:\\/\\/)?" + // protocol
        "((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|((\\d{1,3}\\.){3}\\d{1,3}))" + // domain name or IP
        "(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*" + // port and path
        "(\\?[;&a-z\\d%_.~+=-]*)?" + // query string
        "(\\#[-a-z\\d_]*)?$",
      "i"
    );

    if (!urlPattern.test(article.url)) {
      setErrorMsg("Please enter a valid URL.");
      return;
    }

    const result = await getSummary({ articleUrl: article.url });

    if ("data" in result && result.data?.summary) {
      const newArticle = { ...article, summary: result.data.summary };

      // Save to Firestore
      const user = auth.currentUser;
      if (user) {
        const chatId = await saveChat(
          user.uid,
          newArticle.url,
          newArticle.summary,
          []
        );
        setCurrentChatId(chatId);
        setArticle(newArticle);
        fetchUserChats(user.uid); // Update the user chats
        setUrlClicked(true); // Set URL clicked to true
      }
    } else {
      setErrorMsg("Failed to fetch the summary. Please try again later.");
    }
  };

  const handleCopy = (copyUrl: string) => {
    setCopied((prev) => ({ ...prev, [copyUrl]: true }));
    navigator.clipboard.writeText(copyUrl);
    setTimeout(
      () => setCopied((prev) => ({ ...prev, [copyUrl]: false })),
      3000
    );
  };

  const handleDelete = async (e: React.MouseEvent, chatId: string) => {
    e.stopPropagation(); // Prevent triggering the parent onClick
    try {
      await deleteChat(chatId);
      // Remove the deleted chat from the userChats state
      setUserChats((prevChats) =>
        prevChats.filter((chat) => chat.id !== chatId)
      );
      toast("Chat deleted successfully");

      // Reset the article state to its initial empty state
      setArticle({
        url: "",
        summary: "",
        messages: [],
      });

      // Also reset the currentChatId and urlClicked states
      setCurrentChatId(null);
      setUrlClicked(false);
    } catch (error) {
      console.error("Error deleting chat:", error);
      toast.error("Failed to delete chat. Please try again.");
    }
  };

  const aiChat = async (userInput: string) => {
    try {
      setLoading(true);
      const user = auth.currentUser;
      if (!user) throw new Error("User not authenticated");

      const newMessage: Message = { role: "user", content: userInput };
      const updatedMessages = [...currentMessages, newMessage];
      setCurrentMessages(updatedMessages);

      const currentChat = userChats.find((chat) => chat.id === currentChatId);
      if (!currentChat) throw new Error("Chat not found");

      const response = await axios.post("api/conversation", {
        prompt: `Based on the following summary: "${currentChat.articleSummary}", answer this question: "${userInput}"`,
      });

      console.log(response);

      const aiResponse: Message = {
        role: "model",
        content: response.data.response,
      };
      const finalMessages = [...updatedMessages, aiResponse];
      setCurrentMessages(finalMessages);

      // Update the chat in userChats
      const updatedUserChats = userChats.map((chat) =>
        chat.id === currentChatId ? { ...chat, messages: finalMessages } : chat
      );
      setUserChats(updatedUserChats);

      // Save the chat to Firestore
      if (currentChatId) {
        await saveChat(
          user.uid,
          currentChat.articleUrl,
          currentChat.articleSummary,
          finalMessages,
          currentChatId
        );
      }

      // Fetch updated chats from the database
      await fetchUserChats(user.uid);
    } catch (error) {
      console.log(error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return (
    <section
      className={`w-full ${
        urlClicked ? "h-full" : "h-screen"
      } flex flex-col md:flex-row gap-4 rounded-lg bg-gray-900 text-white p-4`}
    >
      <div className="left w-full md:w-1/2 h-full">
        <h1 className="text-2xl font-bold text-center mb-6 text-blue-400">
          Summarize Articles
        </h1>
        <div className="flex flex-col w-full gap-4">
          <form
            className="relative flex flex-col items-center"
            onSubmit={handleSubmit}
          >
            <div className="relative w-full mb-4">
              <input
                type="url"
                placeholder="Enter a URL"
                value={article.url}
                onChange={(e) =>
                  setArticle({ ...article, url: e.target.value })
                }
                required
                className="w-full p-3 border border-gray-700 bg-gray-800 text-white pl-12 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <Link className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
            </div>
            {errorMsg && <p className="text-red-500 text-sm">{errorMsg}</p>}
            <Button
              type="submit"
              variant="secondary"
              className="w-full py-2 bg-blue-500 hover:bg-blue-600 text-white"
            >
              Submit
            </Button>
          </form>

          <div className="flex flex-col gap-2 max-h-60 overflow-y-auto">
            {userChats.map((userChat, index) => (
              <div
                key={`link-${index}`}
                onClick={() => {
                  setArticle({
                    url: userChat.articleUrl,
                    summary: userChat.summary,
                    messages: userChat.messages as Message[], // Add type assertion
                  });
                  setCurrentChatId(userChat.id);
                  setUrlClicked(true);
                }}
                className="flex items-center justify-between p-2 border border-gray-700 bg-gray-800 rounded-lg cursor-pointer hover:bg-gray-700"
              >
                <div className="flex items-center gap-2">
                  <div
                    className="text-blue-500 hover:text-blue-600"
                    onClick={() => handleCopy(userChat.articleUrl)}
                  >
                    {copied[userChat.articleUrl] ? (
                      <span className="text-green-500">Copied</span>
                    ) : (
                      <CopyIcon size={16} />
                    )}
                  </div>
                  <p className="text-sm text-gray-300">{userChat.articleUrl}</p>
                </div>
                <Trash2Icon
                  size={16}
                  onClick={(e) => handleDelete(e, userChat.id)}
                  className="text-red-500 hover:text-red-600"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="right w-full md:w-1/2 h-full">
        {isFetching ? (
          <div className="h-full flex justify-center items-center">
            <LoaderIcon className="w-12 h-12 animate-spin text-gray-300" />
          </div>
        ) : (
          <div className="flex flex-col w-full h-full gap-4">
            <div className="p-4 border border-gray-700 bg-gray-800 rounded-lg h-full overflow-y-auto">
              <h2 className="text-lg text-center font-bold text-blue-400 mb-2">
                Summary
              </h2>
              {urlClicked &&
                currentChatId &&
                article.url &&
                userChats
                  .filter((chat) => chat.id === currentChatId)
                  .map((filteredChat) => (
                    <p key={filteredChat.id} className="text-sm text-gray-300">
                      {filteredChat.articleSummary}
                    </p>
                  ))}
            </div>
            {urlClicked && (
              <CustomChatTextArea
                loading={loading}
                aiChat={aiChat}
                userChats={userChats}
                currentChatId={currentChatId}
                currentMessages={currentMessages}
              />
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Summarize;
