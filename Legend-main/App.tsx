
import React, { useState } from 'react';
import HomePage from './pages/HomePage';
import { ARTICLES } from './constants';

const App: React.FC = () => {
  const [selectedArticleId, setSelectedArticleId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('HOME');

  const handleArticleSelect = (id: string) => {
    setSelectedArticleId(id);
    // 페이지 이동 대신 내부 상태만 변경하여 HomePage가 오버레이를 띄우도록 유도
  };

  const handleBack = () => {
    const currentArticle = ARTICLES.find(a => a.id === selectedArticleId);
    if (currentArticle?.category === '인터랙티브' || currentArticle?.isInteractive) {
      setSelectedCategory('인터랙티브');
    }
    setSelectedArticleId(null);
  };

  return (
    <div className="min-h-screen">
      {/* 
        단일 페이지 원칙: 
        페이지 전환 로직을 삭제하고 HomePage만 렌더링합니다.
        HomePage 내부에서 selectedArticleId에 따라 슬라이드-오버나 모달이 출력됩니다.
      */}
      <HomePage 
        onArticleSelect={handleArticleSelect} 
        selectedCategory={selectedCategory}
        setSelectedCategory={(cat) => {
          setSelectedCategory(cat);
          setSelectedArticleId(null);
        }}
        viewingArticleId={selectedArticleId}
        onCloseArticle={handleBack}
      />
    </div>
  );
};

export default App;
