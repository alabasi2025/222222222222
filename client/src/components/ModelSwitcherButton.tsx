// client/src/components/ModelSwitcherButton.tsx
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button'; // Adjust import based on your UI library
import { toast } from 'sonner';

interface ModelInfo {
  activeModel: string;
  availableModels: string[];
}

const ModelSwitcherButton: React.FC = () => {
  const [models, setModels] = useState<ModelInfo>({ activeModel: '', availableModels: [] });
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    // Fetch current model info on mount
    fetch('/api/model-switch')
      .then((res) => res.json())
      .then(setModels)
      .catch(() => toast.error('فشل جلب معلومات النموذج'));
  }, []);

  const switchModel = async (model: string) => {
    try {
      const res = await fetch('/api/model-switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ model }),
      });
      const data = await res.json();
      if (res.ok) {
        setModels({ ...models, activeModel: data.activeModel });
        toast.success(`تم تبديل النموذج إلى ${data.activeModel}`);
      } else {
        toast.error(data.error || 'خطأ في تبديل النموذج');
      }
    } catch {
      toast.error('خطأ في الاتصال بالخادم');
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <Button variant="outline" onClick={() => setShowMenu(!showMenu)}>
        الوكيل المساعد: {models.activeModel || '...'}
      </Button>
      {showMenu && (
        <ul
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            background: 'white',
            border: '1px solid #ddd',
            listStyle: 'none',
            margin: 0,
            padding: '0.5rem',
            zIndex: 1000,
          }}
        >
          {models.availableModels.map((m) => (
            <li key={m} style={{ margin: '0.25rem 0' }}>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  switchModel(m);
                  setShowMenu(false);
                }}
                disabled={m === models.activeModel}
              >
                {m}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ModelSwitcherButton;
