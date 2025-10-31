import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Bot, 
  Send, 
  TrendingUp, 
  Sparkles, 
  Lightbulb,
  AlertCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface AIAdvisorProps {
  budget: number;
  totalAircraft: number;
  activeFlights: number;
  totalRevenue: number;
  playerLevel: number;
  reputation: number;
}

const AIAdvisor: React.FC<AIAdvisorProps> = ({
  budget,
  totalAircraft,
  activeFlights,
  totalRevenue,
  playerLevel,
  reputation,
}) => {
  const { toast } = useToast();
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '👋 Willkommen! Ich bin dein AI-Business-Berater. Ich helfe dir dabei, deine Airline zu optimieren und profitable Entscheidungen zu treffen. Wie kann ich dir heute helfen?',
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const quickSuggestions = [
    { icon: TrendingUp, text: 'Wie optimiere ich meinen Umsatz?', color: 'text-operational' },
    { icon: Lightbulb, text: 'Welches Flugzeug soll ich kaufen?', color: 'text-aviation-gold' },
    { icon: AlertCircle, text: 'Meine Reputation ist niedrig, was tun?', color: 'text-critical' },
    { icon: Sparkles, text: 'Strategie für schnelles Wachstum?', color: 'text-accent' },
  ];

  const streamChat = async (userMessage: string) => {
    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

    const response = await fetch(`${SUPABASE_URL}/functions/v1/ai-advisor`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SUPABASE_KEY}`,
      },
      body: JSON.stringify({
        message: userMessage,
        gameState: {
          budget,
          totalAircraft,
          activeFlights,
          totalRevenue,
          playerLevel,
          reputation,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to get AI response');
    }

    if (!response.body) throw new Error('No response body');

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let assistantMessage = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let newlineIndex: number;
      while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
        let line = buffer.slice(0, newlineIndex);
        buffer = buffer.slice(newlineIndex + 1);

        if (line.endsWith('\r')) line = line.slice(0, -1);
        if (line.startsWith(':') || line.trim() === '') continue;
        if (!line.startsWith('data: ')) continue;

        const jsonStr = line.slice(6).trim();
        if (jsonStr === '[DONE]') break;

        try {
          const parsed = JSON.parse(jsonStr);
          const content = parsed.choices?.[0]?.delta?.content;
          if (content) {
            assistantMessage += content;
            setMessages(prev => {
              const last = prev[prev.length - 1];
              if (last?.role === 'assistant' && last.timestamp.getTime() > Date.now() - 1000) {
                return prev.map((m, i) =>
                  i === prev.length - 1
                    ? { ...m, content: assistantMessage }
                    : m
                );
              }
              return [...prev, { role: 'assistant', content: assistantMessage, timestamp: new Date() }];
            });
          }
        } catch (e) {
          // Ignore parse errors for incomplete JSON
        }
      }
    }
  };

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || input.trim();
    if (!textToSend || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: textToSend,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      await streamChat(textToSend);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: 'Fehler',
        description: error instanceof Error ? error.message : 'Verbindung zum AI-Berater fehlgeschlagen',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card className="border-accent/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bot className="w-6 h-6 text-accent animate-pulse" />
            AI Business-Berater
            <Badge variant="outline" className="ml-auto bg-accent/10 border-accent">
              <Sparkles className="w-3 h-3 mr-1" />
              KI-gestützt
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Suggestions */}
          <div className="flex flex-wrap gap-2">
            {quickSuggestions.map((suggestion, idx) => (
              <Button
                key={idx}
                size="sm"
                variant="outline"
                onClick={() => handleSend(suggestion.text)}
                disabled={isLoading}
                className="text-xs"
              >
                <suggestion.icon className={`w-3 h-3 mr-1 ${suggestion.color}`} />
                {suggestion.text}
              </Button>
            ))}
          </div>

          {/* Chat Messages */}
          <ScrollArea className="h-[400px] border rounded-lg p-4" ref={scrollRef}>
            <div className="space-y-4">
              {messages.map((message, idx) => (
                <div
                  key={idx}
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-lg p-3 ${
                      message.role === 'user'
                        ? 'bg-accent text-white'
                        : 'bg-muted text-foreground'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <span className="text-xs opacity-70 mt-1 block">
                      {message.timestamp.toLocaleTimeString('de-DE', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-muted rounded-lg p-3">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-2 h-2 bg-accent rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="flex gap-2">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Stelle mir eine Frage..."
              disabled={isLoading}
            />
            <Button onClick={() => handleSend()} disabled={!input.trim() || isLoading} variant="aviation">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AIAdvisor;