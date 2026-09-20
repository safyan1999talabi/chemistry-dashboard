import { Calculator, CheckCircle2, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { Interpretation } from '@/types';
import { formatValue } from '@/lib/calculations';

interface CalculationCardProps {
  title: string;
  badge?: string;
  badgeColor?: string;
  description: string;
  onCalculate: () => void;
  canCalculate: boolean;
  children: React.ReactNode;
}

export function CalculationCard({
  title,
  badge,
  badgeColor = '#0d9488',
  description,
  onCalculate,
  canCalculate,
  children,
}: CalculationCardProps) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[55%_45%] gap-6">
      {/* Input zone */}
      <div className="bg-white rounded-xl p-5 surface-card">
        <div className="flex items-center gap-2 mb-1">
          <h2 className="text-lg font-semibold text-[#0f172a]">{title}</h2>
          {badge && (
            <Badge style={{ backgroundColor: badgeColor, color: 'white' }} className="text-[11px] font-medium">
              {badge}
            </Badge>
          )}
        </div>
        <p className="text-[13px] text-[#475569] mb-5">{description}</p>

        <div className="space-y-4">
          {children}
        </div>

          <Button
          onClick={onCalculate}
          disabled={!canCalculate}
          className="w-full mt-5 h-11 bg-[#4f46e5] hover:bg-[#4338ca] text-white gap-2 text-[14px] font-medium disabled:opacity-50"
        >
          <Calculator className="w-4 h-4" />
          Calculer
        </Button>
      </div>
    </div>
  );
}

interface ResultCardProps {
  results: { label: string; value: number; unit?: string }[];
  interpretation?: Interpretation;
  formula?: string;
  additionalInfo?: React.ReactNode;
}

export function ResultCard({ results, interpretation, formula, additionalInfo }: ResultCardProps) {
  if (!interpretation && results.length === 0) return null;

  const statusIcon = {
    success: <CheckCircle2 className="w-5 h-5 text-[#059669]" />,
    warning: <AlertTriangle className="w-5 h-5 text-[#f59e0b]" />,
    error: <AlertCircle className="w-5 h-5 text-[#e11d48]" />,
    info: <Info className="w-5 h-5 text-[#2a5298]" />,
  };

  const statusBadge = {
    success: 'bg-[#ecfdf5] text-[#059669] border-[#99f6e4]',
    warning: 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]',
    error: 'bg-[#fef2f2] text-[#dc2626] border-[#fecaca]',
    info: 'bg-[#eff6ff] text-[#2563eb] border-[#bfdbfe]',
  };

  return (
    <div className="calc-result rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <CheckCircle2 className="w-5 h-5 text-[#5eead4]" />
        <h3 className="text-[15px] font-semibold text-[#e2e8f0]">Résultats</h3>
      </div>

      {results.length > 0 && (
        <div className="space-y-3 mb-4">
          {results.map((r, i) => (
            <div key={i} className="flex items-center justify-between py-2 border-b border-[#99f6e4]/50 last:border-0">
              <span className="text-[13px] text-[#94a3b8]">{r.label}</span>
              <span className="font-mono text-[18px] font-semibold text-[#5eead4]">
                {formatValue(r.value)}{r.unit ? ` ${r.unit}` : ''}
              </span>
            </div>
          ))}
        </div>
      )}

      {formula && (
        <div className="mb-4 p-3 bg-white/60 rounded-lg">
          <span className="text-[12px] text-[#94a3b8]">Formule: </span>
          <span className="font-mono text-[12px] text-[#cbd5e1]">{formula}</span>
        </div>
      )}

      {additionalInfo}

      {interpretation && (
        <div className={`mt-4 p-4 rounded-lg border ${statusBadge[interpretation.status]}`}>
          <div className="flex items-start gap-3">
            {statusIcon[interpretation.status]}
            <div>
              <div className="font-semibold text-[14px]">{interpretation.badge}</div>
              <div className="text-[13px] mt-1 opacity-90">{interpretation.message}</div>
              {interpretation.detail && (
                <div className="text-[12px] mt-2 opacity-75">{interpretation.detail}</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function InputField({
  label,
  value,
  onChange,
  unit,
  required = false,
  type = 'number',
  step = 'any',
  placeholder,
}: {
  label: string;
  value: string | number;
  onChange: (val: string) => void;
  unit?: string;
  required?: boolean;
  type?: string;
  step?: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="flex items-center gap-1 text-[12px] font-medium text-[#475569] mb-1.5">
        {label}
        {required && <span className="text-[#e11d48]">*</span>}
      </label>
      <div className="relative">
        <input
          type={type}
          step={step}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className="w-full h-10 px-3 pr-12 text-[14px] bg-white border border-[#cbd5e1] rounded-md
            focus:outline-none focus:border-[#4f46e5] focus:ring-[3px] focus:ring-[rgba(79,70,229,0.12)]
            transition-all placeholder:text-[#94a3b8]"
        />
        {unit && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[12px] text-[#94a3b8] font-medium">
            {unit}
          </span>
        )}
      </div>
    </div>
  );
}
