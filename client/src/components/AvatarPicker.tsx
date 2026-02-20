import { useState } from 'react';
import './AvatarPicker.css';

interface AvatarPickerProps {
  onSelect: (avatar: string) => void;
  initialAvatar?: string;
}

const PRESET_AVATARS = [
  '🐻', '🐨', '🦘', '🐼', '🦝', '🐶', '🐱', '🦊', '🐯', '🦁'
];

export function AvatarPicker({ onSelect, initialAvatar }: AvatarPickerProps) {
  const [selectedAvatar, setSelectedAvatar] = useState(initialAvatar || PRESET_AVATARS[0]);
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);

  const handlePresetSelect = (avatar: string) => {
    setSelectedAvatar(avatar);
    setUploadedImage(null);
    onSelect(avatar);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 限制2MB
    if (file.size > 2 * 1024 * 1024) {
      alert('图片大小不能超过2MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setUploadedImage(dataUrl);
      setSelectedAvatar(dataUrl);
      onSelect(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="avatar-picker">
      <h3>选择头像</h3>
      
      {/* 预览 */}
      <div className="avatar-preview">
        {uploadedImage ? (
          <img src={uploadedImage} alt="Avatar" />
        ) : (
          <div className="avatar-emoji">{selectedAvatar}</div>
        )}
      </div>

      {/* 预设头像 */}
      <div className="preset-avatars">
        {PRESET_AVATARS.map(avatar => (
          <button
            key={avatar}
            className={`preset-avatar ${selectedAvatar === avatar && !uploadedImage ? 'selected' : ''}`}
            onClick={() => handlePresetSelect(avatar)}
          >
            {avatar}
          </button>
        ))}
      </div>

      {/* 上传自定义头像 */}
      <div className="upload-section">
        <label htmlFor="avatar-upload" className="upload-button">
          📸 上传自定义头像
        </label>
        <input
          id="avatar-upload"
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          style={{ display: 'none' }}
        />
      </div>
    </div>
  );
}
