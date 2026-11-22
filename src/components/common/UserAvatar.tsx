import React, { useState } from 'react';
import { Pencil, User } from 'lucide-react';
import { AvatarUploadModal } from '../modals/AvatarUploadModal';

interface UserAvatarProps {
  avatarUrl?: string;
  name: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  showEditButton?: boolean;
  onAvatarUpdated?: (newUrl: string) => void;
  className?: string;
}

export const UserAvatar: React.FC<UserAvatarProps> = ({
  avatarUrl,
  name,
  size = 'md',
  showEditButton = false,
  className = '',
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sizeClasses = {
    xs: 'w-7 h-7 text-[10px]',
    sm: 'w-9 h-9 text-xs',
    md: 'w-11 h-11 text-sm',
    lg: 'w-16 h-16 text-xl',
    xl: 'w-24 h-24 text-3xl',
  };

  const editButtonSizes = {
    xs: 'w-3.5 h-3.5 p-0.5 -bottom-0.5 -right-0.5',
    sm: 'w-4 h-4 p-0.5 -bottom-0.5 -right-0.5',
    md: 'w-5 h-5 p-1 -bottom-1 -right-1',
    lg: 'w-6 h-6 p-1.5 bottom-0 right-0',
    xl: 'w-8 h-8 p-2 bottom-0 right-0',
  };

  const getInitials = (n: string) => {
    if (!n) return 'B';
    const parts = n.trim().split(' ');
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  return (
    <>
      <div className={`relative inline-block select-none ${className}`}>
        {/* Avatar container with cyan/blue gradient border */}
        <div
          onClick={() => showEditButton && setIsModalOpen(true)}
          className={`rounded-full p-[2px] bg-gradient-to-tr from-cyan-400 via-blue-500 to-indigo-600 shadow-lg ${
            showEditButton ? 'cursor-pointer group hover:scale-105 transition-transform' : ''
          }`}
        >
          <div
            className={`${sizeClasses[size]} rounded-full overflow-hidden bg-slate-900 flex items-center justify-center font-black text-white relative`}
          >
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt={name}
                className="w-full h-full object-cover rounded-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-tr from-blue-700 to-cyan-600 text-white font-bold tracking-wider">
                {getInitials(name)}
              </div>
            )}
          </div>
        </div>

        {/* Edit Button overlapping bottom-right corner (Matching Reference Image) */}
        {showEditButton && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            title="Rasmni oʻzgartirish"
            className={`absolute ${editButtonSizes[size]} rounded-full bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black shadow-md flex items-center justify-center ring-2 ring-[var(--surface)] transition active:scale-95`}
          >
            <Pencil className="w-full h-full" />
          </button>
        )}
      </div>

      {showEditButton && (
        <AvatarUploadModal
          isOpen={isModalOpen}
          currentAvatar={avatarUrl}
          userName={name}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
};
