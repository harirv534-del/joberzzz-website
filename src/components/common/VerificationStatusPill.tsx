import React from 'react';
import { CompanyStatus } from '../../types';
import { Clock, CheckCircle2, XCircle } from 'lucide-react';

interface VerificationStatusPillProps {
  status: CompanyStatus | null | undefined;
  className?: string;
  showIcon?: boolean;
}

export const VerificationStatusPill: React.FC<VerificationStatusPillProps> = ({
  status = 'pending',
  className = '',
  showIcon = true,
}) => {
  const currentStatus = status || 'pending';

  const config = {
    verified: {
      label: 'Verified Status',
      containerClass: 'bg-emerald-50 text-emerald-800 border-emerald-300',
      dotClass: 'bg-emerald-500',
      icon: CheckCircle2,
    },
    pending: {
      label: 'Pending Approval',
      containerClass: 'bg-amber-50 text-amber-900 border-amber-300',
      dotClass: 'bg-amber-500',
      icon: Clock,
    },
    rejected: {
      label: 'Verification Rejected',
      containerClass: 'bg-rose-50 text-rose-800 border-rose-300',
      dotClass: 'bg-rose-500',
      icon: XCircle,
    },
  }[currentStatus] || {
    label: 'Pending Approval',
    containerClass: 'bg-amber-50 text-amber-900 border-amber-300',
    dotClass: 'bg-amber-500',
    icon: Clock,
  };

  const IconComp = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border transition-colors ${config.containerClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dotClass}`} />
      {showIcon && <IconComp className="w-3 h-3" />}
      <span>{config.label}</span>
    </span>
  );
};
