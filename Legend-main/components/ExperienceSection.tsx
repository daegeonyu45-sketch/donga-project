import React, { useState, useMemo } from 'react';

const ExperienceSection: React.FC = () => {
  const [actionCount, setActionCount] = useState<number>(0);
  const [clickedButtons, setClickedButtons] = useState<Set<number>>(new Set());
  const [showSummary, setShowSummary] = useState<boolean>(false);

  const ACTIONS = [
    { id: 0, label: "에어컨을 켠다", summary: "냉난방 가전: 냉난방 가전은 전력 소비를 급격히 증가시킵니다. 이 전력은 대부분 화석연료 기반으로 생산되며, 폭염을 다시 강화하는 악순환을 만듭니다." },
    { id: 1, label: "자동차를 운전한다", summary: "자동차: 내연기관 차량은 이동하는 순간마다 온실가스를 직접 대기로 배출합니다. 도시는 이 열을 가두는 구조를 가지고 있습니다." },
    { id: 2, label: "고기를 먹는다", summary: "고기 소비: 축산업은 사료 생산과 사육 과정에서 대량의 온실가스를 발생시킵니다. 특히 메탄은 강력한 온난화 효과를 가집니다." },
    { id: 3, label: "일회용품을 사용한다", summary: "일회용품: 일회용품은 사용 시간보다 생산과 폐기 과정에서 더 많은 탄소를 남깁니다. 대부분은 소각되며 추가 배출을 유발합니다." }
  ];

  const handleAction = (id: number) => {
    if (clickedButtons.has(id)) return;
    setClickedButtons(new Set([...clickedButtons, id]));
    setActionCount(prev => prev + 1);
  };

  const status = useMemo(() => {
    if (actionCount === 0) return { bg: 'bg-white', overlay: 'opacity-0' };
    if (actionCount === 1) return { bg: 'bg-yellow-200', overlay: 'opacity-20' };
    if (actionCount === 2) return { bg: 'bg-orange-400', overlay: 'opacity-40' };
    if (actionCount === 3) return { bg: 'bg-orange-600', overlay: 'opacity-60' };
    return { bg: 'bg-red-950', overlay: 'opacity-100', critical: true };
  }, [actionCount]);

  if (showSummary) {
    return (
      <div className="fixed inset-0 z-[100] bg-zinc-950 text-white overflow-y-auto">
        <div className="max-w-2xl mx-auto px-8 py-20 md:py-32 space-y-24">
          {/* Analysis Section */}
          <div className="space-y-12">
            <h2 className="text-red-600 text-xs font-black tracking-[0.5em] uppercase border-b border-red-900 pb-4">Climate Impact Analysis</h2>
            {ACTIONS.map(action => (
              <div key={action.id} className="space-y-2">
                <p className="text-xl md:text-2xl font-bold leading-relaxed">
                  {action.summary}
                </p>
              </div>
            ))}
            <div className="pt-12 text-center">
              <p className="text-zinc-600 text-[10px] font-black tracking-[0.3em] uppercase">Data-driven journalism simulation</p>
            </div>
          </div>

          {/* Final Narrative Section */}
          <div className="pt-40 pb-40 space-y-16 animate-in fade-in duration-1000 border-t border-zinc-900">
            <p className="text-zinc-500 text-[11px] font-black tracking-[0.4em] uppercase text-center">
              이 모든 변화는, 어느 날 갑자기 시작되지 않았습니다.
            </p>
            
            <div className="space-y-10 text-lg md:text-2xl font-bold leading-relaxed text-zinc-300">
              <p>우리는 종종 기후 위기를<br/>거대한 공장, 먼 나라의 이야기,<br/>정부나 기업의 문제로 생각합니다.</p>
              <p>하지만 지금 우리가 서 있는 이 지점은<br/>수십 년, 수백 년 동안의 선택이<br/>조용히 쌓여 도착한 결과입니다.</p>
              <p>산업화는 편리함을 주었고,<br/>동시에 열을 남겼습니다.</p>
              <p>공장을 돌리고, 도시를 밝히고,<br/>더 빠르게 이동하고, 더 많이 생산하는 동안<br/>지구는 그 열을 고스란히 흡수해 왔습니다.</p>
              <p>그리고 지금,<br/>그 열은 다시 우리에게 돌아오고 있습니다.</p>
              <p>우리는 이제 또 다른 방식으로<br/>가속하고 있습니다.</p>
              <p>인공지능, 데이터 센터,<br/>끊임없이 돌아가는 서버와 냉각 시스템,<br/>항상 연결된 삶은<br/>또 다른 에너지를 요구합니다.</p>
              <p>기술은 중립적이지만,<br/>그 사용 방식은 결코 중립적이지 않습니다.</p>
              <p>에어컨을 켜는 순간,<br/>차를 타는 선택,<br/>고기를 먹고, 일회용품을 사용하는 하루.</p>
              <p>이 모든 일상은 작아 보이지만<br/>수십억 번 반복될 때,<br/>지금의 현실이 됩니다.</p>
              <p>이제 기후 위기는<br/>미래의 경고가 아니라<br/>현재의 조건이 되었습니다.</p>
              <p>우리는 더 이상<br/>“언젠가 누군가가 해결하겠지”라고<br/>말할 수 없습니다.</p>
              <p>지금 필요한 것은<br/>거대한 희생이 아니라,<br/>방향의 전환입니다.</p>
              <p>모두가 완벽해질 필요는 없습니다.<br/>하지만 모두가<br/>움직이기 시작해야 합니다.</p>
              <p>지금의 선택이<br/>다음 세대의 일상이 되지 않도록.</p>
            </div>

            <div className="pt-20 border-t border-red-900/40">
              <p className="text-white text-3xl md:text-5xl font-black leading-tight tracking-tighter italic">
                이것은 경고이자, 마지막 기회입니다.<br/>
                지구는 이미 신호를 보내고 있습니다.<br/>
                이제 응답할 차례는, 우리입니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`fixed inset-0 z-[100] flex flex-col items-center justify-center transition-colors duration-1000 select-none ${status.bg}`}>
      
      {/* Visual Feedback Layer */}
      {status.critical && (
        <div className="absolute inset-0 bg-red-600/20 animate-pulse pointer-events-none" />
      )}

      {/* Warning Overlay */}
      {actionCount === 4 && (
        <div className="absolute inset-0 z-[110] bg-black/40 backdrop-blur-sm flex items-center justify-center p-6">
          <div className="bg-white border-4 border-red-600 p-8 md:p-12 max-w-lg w-full text-center shadow-[0_0_50px_rgba(220,38,38,0.5)]">
            <h2 className="text-red-600 text-2xl md:text-4xl font-black mb-6 tracking-tighter">
              ⚠️ 긴급 경고
            </h2>
            <p className="text-black text-lg md:text-xl font-bold leading-tight mb-10">
              현재 환경에서는 더 이상<br/>인간의 생존이 불가능합니다.
            </p>
            <button 
              onClick={() => setShowSummary(true)}
              className="w-full py-4 bg-red-600 text-white font-black tracking-[0.2em] uppercase active:scale-95 transition-transform"
            >
              [확인]
            </button>
          </div>
        </div>
      )}

      {/* Interaction Elements */}
      {actionCount < 4 && (
        <div className="max-w-xl w-full px-6 space-y-16 text-center">
          <div className="space-y-4">
            <h1 className="text-black text-4xl md:text-6xl font-black tracking-tighter leading-none">
              당신의 하루,<br/>지구의 내일
            </h1>
            <p className="text-black/60 font-medium tracking-tight">
              일상의 사소한 선택들이 누적되어 기후를 결정합니다.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {ACTIONS.map((action) => (
              <button
                key={action.id}
                disabled={clickedButtons.has(action.id)}
                onClick={() => handleAction(action.id)}
                className={`py-6 px-4 text-sm font-black tracking-tighter uppercase transition-all border-2 rounded-sm ${
                  clickedButtons.has(action.id)
                    ? 'bg-transparent text-black/10 border-black/5 cursor-default'
                    : 'bg-white/80 text-black border-black hover:bg-black hover:text-white active:scale-95 shadow-xl'
                }`}
              >
                {action.label}
              </button>
            ))}
          </div>

          <div className="flex flex-col items-center gap-2">
            <div className="w-full max-w-[200px] h-1 bg-black/10 rounded-full overflow-hidden">
              <div 
                className="h-full bg-black transition-all duration-500" 
                style={{ width: `${(actionCount / 4) * 100}%` }}
              />
            </div>
            <p className="text-[10px] font-black tracking-[0.3em] text-black/40 uppercase">
              Accumulated Impact: {actionCount} / 4
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExperienceSection;