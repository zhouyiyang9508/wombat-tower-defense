import { useEffect, useState } from 'react';
import './RandomEventNotification.css';

interface RandomEvent {
  id: string;
  title: string;
  description: string;
  type: 'positive' | 'negative' | 'neutral';
  waveTriggered: number;
}

interface Props {
  event: RandomEvent | null;
  onDismiss: () => void;
}

export function RandomEventNotification({ event, onDismiss }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (event) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 500); // 等待动画结束
      }, 4000); // 4秒后自动消失
      
      return () => clearTimeout(timer);
    }
  }, [event, onDismiss]);

  if (!event) return null;

  return (
    <div className={`random-event-notification ${visible ? 'visible' : ''} event-${event.type}`}>
      <div className="event-content">
        <div className="event-title">{event.title}</div>
        <div className="event-description">{event.description}</div>
      </div>
    </div>
  );
}
