import React, { useState, useEffect, useRef } from "react";
import { getTodaySalesCount } from "../services/firebase";
import { useNavigate } from "react-router-dom";

const intents = [
  {
    id: "create_invoice",
    keywords: ["create invoice", "invoice", "bill", "create bill", "make invoice", "new bill", "new invoice"],
    response: {
      text: "To create an invoice:\n1. Open the Billing page\n2. Select a customer\n3. Add products and quantities\n4. Save the invoice",
      actions: [{ label: "Go to Billing", route: "/billing" }]
    }
  },
  {
    id: "add_product",
    keywords: ["add product", "new product", "create product", "add item", "new item", "product"],
    response: {
      text: "To add a product:\n1. Open Products\n2. Click Add Product\n3. Enter item details and stock\n4. Save changes",
      actions: [{ label: "Go to Products", route: "/products" }]
    }
  },
  {
    id: "view_analytics",
    keywords: ["view analytics", "analytics", "insights", "business insights", "insight"],
    response: {
      text: "To view your business insights:\n1. Open the Analytics page\n2. Review performance charts\n3. Adjust filters for dates and metrics",
      actions: [{ label: "Go to Analytics", route: "/analytics" }]
    }
  },
  {
    id: "check_stock",
    keywords: ["check stock", "stock", "inventory", "inventory management", "stock levels"],
    response: {
      text: "To check inventory:\n1. Open Stock\n2. Review low-stock items\n3. Update quantities as needed",
      actions: [{ label: "Go to Stock", route: "/stock" }]
    }
  },
  {
    id: "customer_details",
    keywords: ["customer details", "customer", "client", "clients", "customer info", "client details", "manage customers"],
    response: {
      text: "To manage customers:\n1. Open Customers\n2. Select a customer to view details\n3. Edit or remove customer records",
      actions: [{ label: "Go to Customers", route: "/customers" }]
    }
  },
  {
    id: "view_bills",
    keywords: ["view bills", "bills", "past invoices", "invoice history", "billing history", "all bills"],
    response: {
      text: "To view past invoices:\n1. Open Bills\n2. Select a bill to see details\n3. Download or print when needed",
      actions: [{ label: "Go to Bills", route: "/bills" }]
    }
  },
  {
    id: "sales_today",
    keywords: ["sales today", "today sales", "today's sales", "sales count today", "sales count"],
    response: {
      text: "Fetching today's sales..."
    }
  },
  {
    id: "gst_info",
    keywords: ["gst", "tax", "gst report", "tax report"],
    response: {
      text: "GST is added automatically in the invoice totals on the Billing page. Review the summary before saving."
    }
  },
  {
    id: "help",
    keywords: ["help", "what can you do", "suggestions", "assistant", "what should i ask", "how can you help"],
    response: {
      text: "I can help with Billing, Customers, Products, Analytics, Bills, Stock, and Sales Today.\nTry: Create Invoice, Add Customer, View Analytics, Check Stock, Sales Today."
    }
  }
];

const followUpKeywords = ["how to do it", "how do i do it", "what next", "how do i", "tell me", "continue", "more details"];

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      type: "bot",
      text: "Hi! I'm your Billing Assistant. Ask me about Billing, Customers, Products, Analytics, Bills, Stock, or Sales Today."
    }
  ]);
  const [input, setInput] = useState("");
  const [lastIntent, setLastIntent] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  const findIntent = (text) => {
    const lower = text.toLowerCase();
    return intents.find((item) => item.keywords.some((keyword) => lower.includes(keyword)));
  };

  const buildFallback = () => ({
    text: "Sorry, I didn't recognize that action. Try: Create Invoice, Add Customer, View Analytics, Check Stock, Sales Today."
  });

  const sendMessage = async (messageText = input.trim()) => {
    if (!messageText) return;

    setMessages((prev) => [...prev, { type: "user", text: messageText }] );
    setInput("");
    setIsTyping(true);

    const normalized = messageText.toLowerCase();
    const intent = findIntent(normalized);
    const isFollowUp = followUpKeywords.some((phrase) => normalized.includes(phrase));

    setTimeout(async () => {
      let botReply = { text: "", actions: [] };

      if (isFollowUp && lastIntent) {
        const remembered = intents.find((item) => item.id === lastIntent);
        if (remembered) {
          botReply = {
            text: `Here are the steps again for ${remembered.id.replace(/_/g, " ")}:\n${remembered.response.text}`,
            actions: remembered.response.actions || []
          };
        }
      } else if (intent?.id === "sales_today") {
        const count = await getTodaySalesCount();
        botReply = {
          text: `You have ${count} sales today 📊`,
          actions: [{ label: "View Analytics", route: "/analytics" }]
        };
        setLastIntent(intent.id);
      } else if (intent) {
        botReply = intent.response;
        setLastIntent(intent.id);
      } else {
        botReply = buildFallback();
      }

      setMessages((prev) => [...prev, { type: "bot", ...botReply }]);
      setIsTyping(false);
    }, 700);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      sendMessage();
    }
  };

  const handleAction = (route) => {
    navigate(route);
  };

  const quickReplies = [
    "Create Invoice",
    "Add Customer",
    "View Analytics",
    "Check Stock",
    "Sales Today"
  ];

  return (
    <>
      <div
        onClick={() => setOpen((prev) => !prev)}
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          background: "#4CAF50",
          color: "#fff",
          padding: 15,
          borderRadius: "50%",
          cursor: "pointer",
          boxShadow: "0 6px 18px rgba(0,0,0,0.18)",
          zIndex: 1000
        }}
      >
        💬
      </div>

      {open && (
        <div
          style={{
            position: "fixed",
            bottom: 80,
            right: 20,
            width: 360,
            maxHeight: 520,
            background: "#fff",
            borderRadius: 18,
            boxShadow: "0 16px 48px rgba(0,0,0,0.18)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            border: "1px solid #e6e6e6",
            zIndex: 1000
          }}
        >
          <div
            style={{
              background: "#2F855A",
              color: "#fff",
              padding: "16px 20px",
              fontWeight: 700,
              fontSize: 16
            }}
          >
            Billing Assistant
          </div>

          <div
            style={{
              flex: 1,
              padding: 18,
              overflowY: "auto",
              background: "#F7FAFC"
            }}
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                style={{
                  display: "flex",
                  justifyContent: msg.type === "user" ? "flex-end" : "flex-start",
                  marginBottom: 14
                }}
              >
                <div
                  style={{
                    maxWidth: "72%",
                    padding: "12px 14px",
                    borderRadius: msg.type === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                    background: msg.type === "user" ? "#DFF6E0" : "#FFFFFF",
                    color: "#1A202C",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)",
                    whiteSpace: "pre-line",
                    fontSize: 14
                  }}
                >
                  {msg.text}

                  {msg.actions && msg.actions.length > 0 && (
                    <div style={{ marginTop: 10, display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {msg.actions.map((action, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleAction(action.route)}
                          style={{
                            border: "none",
                            background: "#2F855A",
                            color: "#fff",
                            borderRadius: 20,
                            padding: "8px 12px",
                            cursor: "pointer",
                            fontSize: 12
                          }}
                        >
                          {action.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isTyping && (
              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-start",
                  marginBottom: 14
                }}
              >
                <div
                  style={{
                    padding: "10px 14px",
                    borderRadius: "18px 18px 18px 4px",
                    background: "#FFFFFF",
                    color: "#718096",
                    fontSize: 14,
                    boxShadow: "0 2px 6px rgba(0,0,0,0.08)"
                  }}
                >
                  Assistant is typing...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <div
            style={{
              padding: "10px 16px",
              background: "#EDF2F7",
              borderTop: "1px solid #E2E8F0",
              display: "flex",
              flexWrap: "wrap",
              gap: 8
            }}
          >
            {quickReplies.map((reply, index) => (
              <button
                key={index}
                onClick={() => setInput(reply)}
                style={{
                  border: "1px solid #CBD5E0",
                  background: "#FFFFFF",
                  color: "#2D3748",
                  borderRadius: 18,
                  padding: "8px 12px",
                  cursor: "pointer",
                  fontSize: 12
                }}
              >
                {reply}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", borderTop: "1px solid #E2E8F0", background: "#fff" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Ask something..."
              style={{
                flex: 1,
                padding: "14px 16px",
                border: "none",
                outline: "none",
                fontSize: 14,
                background: "#fff"
              }}
            />
            <button
              onClick={() => sendMessage()}
              style={{
                border: "none",
                background: "#2F855A",
                color: "#fff",
                padding: "0 18px",
                cursor: "pointer",
                fontSize: 14
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;