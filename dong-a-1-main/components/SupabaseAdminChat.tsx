
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { Send, Loader2, UserX, ShieldCheck, Terminal, AlertCircle, FileText, Trash2 } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  text: string;
  isSystem?: boolean;
}

const SupabaseAdminChat: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: "안녕하세요. Supabase 및 뉴스룸 대시보드 통합 관리자 AI입니다. 사용자 삭제나 대시보드 기사 관리를 도와드릴까요?" }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const delete_user_by_email = async (args: { email: string }) => {
    console.log(`Deleting user: ${args.email}`);
    return { success: true, message: `Supabase 인증 서버에서 사용자 ${args.email}가 성공적으로 제거되었습니다.` };
  };

  const list_dashboard_articles = async () => {
    try {
      const saved = JSON.parse(localStorage.getItem('dashboard_db') || '[]');
      if (saved.length === 0) return { success: true, articles: [], message: "현재 대시보드에 저장된 기사가 없습니다." };
      const articleList = saved.map((a: any) => ({ id: a.id, title: a.title, date: a.date }));
      return { success: true, articles: articleList };
    } catch (e) {
      return { success: false, message: "기사 목록을 불러오는 중 오류가 발생했습니다." };
    }
  };

  const delete_dashboard_article = async (args: { title: string }) => {
    try {
      const saved = JSON.parse(localStorage.getItem('dashboard_db') || '[]');
      const initialCount = saved.length;
      const filtered = saved.filter((a: any) => !a.title.toLowerCase().includes(args.title.toLowerCase()));
      
      if (initialCount === filtered.length) {
        return { success: false, message: `제목에 "${args.title}"이(가) 포함된 기사를 대시보드에서 찾을 수 없습니다.` };
      }
      
      localStorage.setItem('dashboard_db', JSON.stringify(filtered));
      return { 
        success: true, 
        message: `제목에 "${args.title}"이(가) 포함된 기사 ${initialCount - filtered.length}건이 대시보드에서 영구 삭제되었습니다.` 
      };
    } catch (e) {
      return { success: false, message: "기사 삭제 처리 중 오류가 발생했습니다." };
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: 'user', text: userMessage }]);
    setLoading(true);

    try {
      // 시스템 API 키를 사용하여 즉시 초기화
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      const contents = [
        ...messages.map(m => ({
          role: m.role,
          parts: [{ text: m.text }]
        })),
        { role: 'user', parts: [{ text: userMessage }] }
      ];

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents,
        config: {
          systemInstruction: `당신은 Supabase 데이터베이스 및 동아 AI 뉴스룸 대시보드를 관리하는 관리자(Admin) AI입니다.

[보유 권한 및 도구]
1. delete_user_by_email: 사용자의 이메일을 기반으로 인증 서버에서 삭제합니다.
2. list_dashboard_articles: 현재 대시보드에 저장된 모든 기사의 제목과 정보를 확인합니다.
3. delete_dashboard_article: 대시보드에서 특정 제목을 가진 기사를 영구 삭제합니다.

[중요 규칙 - 반드시 지킬 것]
1. 삭제(사용자 또는 기사) 요청이 들어오면, 즉시 도구를 실행하지 마십시오.
2. 반드시 삭제 대상(이메일 또는 기사 제목)을 정확히 언급하며 "정말로 삭제하시겠습니까? 이 작업은 복구할 수 없습니다."라고 명시적으로 확인을 받으십시오.
3. 사용자가 "예", "동의", "진행해" 등 확실한 긍정 답변을 했을 때만 삭제 도구를 실행하십시오.
4. 모든 작업은 자동으로 설정된 시스템 권한을 통해 수행됩니다.`,
          tools: [{
            functionDeclarations: [
              {
                name: 'delete_user_by_email',
                description: '사용자의 이메일을 기반으로 Supabase에서 사용자를 삭제합니다.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    email: { type: Type.STRING, description: '삭제할 사용자의 이메일 주소' }
                  },
                  required: ['email']
                }
              },
              {
                name: 'list_dashboard_articles',
                description: '현재 대시보드에 저장된 모든 기사 목록을 조회합니다.',
                parameters: { type: Type.OBJECT, properties: {} }
              },
              {
                name: 'delete_dashboard_article',
                description: '대시보드(localStorage)에서 특정 제목을 포함하는 기사를 삭제합니다.',
                parameters: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING, description: '삭제할 기사의 제목 또는 키워드' }
                  },
                  required: ['title']
                }
              }
            ]
          }]
        }
      });

      if (response.functionCalls && response.functionCalls.length > 0) {
        const functionResponses = [];
        for (const fc of response.functionCalls) {
          let result;
          if (fc.name === 'delete_user_by_email') {
            result = await delete_user_by_email(fc.args as any);
          } else if (fc.name === 'list_dashboard_articles') {
            result = await list_dashboard_articles();
          } else if (fc.name === 'delete_dashboard_article') {
            result = await delete_dashboard_article(fc.args as any);
          }
          
          if (result) {
            functionResponses.push({
              name: fc.name,
              id: fc.id,
              response: result
            });
          }
        }

        if (functionResponses.length > 0) {
          const modelTurn = response.candidates[0].content;
          const toolResponse = await ai.models.generateContent({
            model: 'gemini-3-flash-preview',
            contents: [
              ...contents,
              modelTurn,
              { role: 'user', parts: functionResponses.map(fr => ({ functionResponse: fr })) }
            ]
          });
          setMessages(prev => [...prev, { role: 'model', text: toolResponse.text || "요청하신 작업을 완료했습니다." }]);
        }
      } else {
        setMessages(prev => [...prev, { role: 'model', text: response.text || "죄송합니다. 명령을 처리하는 중 문제가 발생했습니다." }]);
      }
    } catch (error: any) {
      console.error(error);
      setMessages(prev => [...prev, { role: 'model', text: "시스템 오류가 발생했습니다. 잠시 후 다시 시도해 주세요." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-100 flex flex-col animate-fade-in text-white">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-red-600/20 p-2 rounded-xl border border-red-500/30">
            <ShieldCheck className="text-red-400" size={24} />
          </div>
          <div>
            <h4 className="fw-black m-0 tracking-tighter">통합 관리자 컨트롤 타워</h4>
            <p className="text-[11px] text-slate-500 m-0">Supabase & Newsroom Dashboard Admin</p>
          </div>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-[10px] text-slate-400">
          <Terminal size={12} /> AUTH: FULL_ACCESS
        </div>
      </div>

      <div className="flex-1 glass-card rounded-3xl overflow-hidden flex flex-col border border-slate-800 shadow-2xl mb-4 bg-slate-950/50">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed ${
                m.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none shadow-lg' 
                  : 'bg-slate-800 text-slate-200 rounded-tl-none border border-slate-700'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-800 p-3 rounded-2xl rounded-tl-none border border-slate-700 flex items-center gap-2">
                <Loader2 size={16} className="animate-spin text-red-400" />
                <span className="text-xs text-slate-400">데이터베이스 쿼리 중...</span>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 bg-slate-900/80 border-t border-slate-800">
          <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-2xl px-4 py-1 shadow-inner focus-within:border-red-500/50 transition-all">
            <input 
              type="text" 
              className="flex-1 !bg-transparent border-0 text-white text-sm py-3 focus:ring-0"
              placeholder="명령어 입력 (예: 기사 목록 보여줘, [제목] 기사 삭제해줘)"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            />
            <button 
              onClick={handleSend}
              disabled={loading || !input.trim()}
              className="p-2 text-red-500 hover:text-red-400 transition-colors disabled:opacity-30"
            >
              <Send size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SupabaseAdminChat;
