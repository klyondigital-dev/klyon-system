import React from 'react';
import clsx from 'clsx';

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  glow?: boolean;
  onClick?: () => void;
}

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  className,
  glow = false,
  onClick
}) => {
  return (
    <div
      onClick={onClick}
      className={clsx(
        "rounded-2xl transition-all duration-300",
        glow ? "glass-panel-glow" : "glass-panel",
        onClick && "cursor-pointer hover:translate-y-[-2px] active:translate-y-[0px]",
        className
      )}
    >
      {children}
    </div>
  );
};
