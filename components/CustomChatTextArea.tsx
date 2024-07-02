import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "./ui/button";
import { LoaderIcon } from "lucide-react";

interface Message {
  role: "user" | "model";
  content: string;
}

interface Chat {
  id: string;
  articleUrl: string;
  userId: string;
  articleSummary: string;
  messages: Message[];
}

interface CustomChatTextAreaProps {
  aiChat: (userInput: string) => Promise<void>;
  loading: boolean;
  userChats: Chat[];
  currentChatId: string | null;
  currentMessages: Message[];
}

const CustomChatTextArea: React.FC<CustomChatTextAreaProps> = ({
  aiChat,
  loading,
  currentMessages,
}) => {
  const [userInput, setUserInput] = useState("");

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setUserInput(e.target.value);
  };

  const onSubmit = async () => {
    if (userInput.trim()) {
      await aiChat(userInput);
      setUserInput("");
    }
  };

  return (
    <div className="chat-container flex flex-col gap-3">
      <div className="messages flex flex-col gap-3 overflow-y-auto max-h-96">
        {currentMessages.map((message, index) => (
          <div
            key={index}
            className={`message p-2 rounded-lg ${
              message.role === "user"
                ? "bg-blue-500 self-end"
                : "bg-gray-800 self-start"
            }`}
          >
            <p>{message.content}</p>
          </div>
        ))}
      </div>
      <Textarea
        className="bg-transparent"
        placeholder="Chat with AI"
        value={userInput}
        onChange={handleInputChange}
      />
      <Button
        onClick={onSubmit}
        variant="secondary"
        className="mt-2 w-full font-bold bg-slate-700 text-teal-500"
      >
        {loading ? <LoaderIcon className="animate-spin" /> : "Chat with AI"}
      </Button>
    </div>
  );
};

export default CustomChatTextArea;
