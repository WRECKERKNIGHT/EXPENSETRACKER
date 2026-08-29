import React, { useState } from 'react';
import { ArrowLeft, ArrowRight, Banknote, Home, Receipt, Rocket, SlidersHorizontal, Smartphone, Sparkles, Target, Wallet } from 'lucide-react';
import { APP_OPTIONS, DEFAULT_INPUTS, LEAK_OPTIONS, OnboardInputs, SpendStyle, parseRupee } from './engine';

interface OnboardingProps {
  initial?: OnboardInputs | null;
  onComplete: (inputs: OnboardInputs) => void;
  onCancel?: () => void;
}

const STEPS = [
  { key: 'name', title: 'First things first', icon: Wallet, hint: 'What should your dashboard call you?' },
  { key: 'income', title: 'Your monthly take-home', icon: Banknote, hint: 'After tax, what hits your account every month?' },
  { key: 'rent', title: 'Monthly rent', icon: Home, hint: 'The number that gets locked first, no matter what.' },
  { key: 'bills', title: 'Fixed bills', icon: Receipt, hint: 'Electricity, internet, EMIs — all the non-negotiables.' },
  { key: 'goal', title: 'Your savings goal', icon: Target, hint: 'How much to bank automatically before you see the rest.' },
  { key: 'leak', title: 'The money leak', icon: Sparkles, hint: 'What quietly drains you? The watcher will start hunting there first.' },
  { key: 'apps', title: 'Wallets you use', icon: Smartphone, hint: 'SpendSmart auto-reads UPI and SMS from these — pick every one you actually use.' },
  { key: 'style', title: 'Spending style', icon: SlidersHorizontal, hint: 'Sets how much flex your autonomy gives you daily.' },
] as const;

const INCOME_CHIPS = [25000, 40000, 60000, 90000, 140000];
const RENT_CHIPS = [5000, 10000, 18000, 28000];
const BILLS_CHIPS = [2000, 4000, 8000, 12000];

const inputClass =
  'w-full text-xl md:text-2xl font-semibold text-black bg-transparent border-b-2 border-black/10 focus:border-[#B8860B] outline-none py-3 transition-colors duration-200';

const chipClass = (active: boolean) =>
  `px-4 py-2 rounded-full text-sm font-medium border transition-colors duration-200 cursor-pointer ${
    active ? 'bg-[#18241C] border-[#18241C] text-white' : 'border-black/15 text-black/60 hover:border-black/40'
  }`;

const Onboarding: React.FC<OnboardingProps> = ({ initial, onComplete, onCancel }) => {
  const [step, setStep] = useState(0);
  const [inputs, setInputs] = useState<OnboardInputs>(
    initial || DEFAULT_INPUTS
  );

  const set = <K extends keyof OnboardInputs>(k: K, v: OnboardInputs[K]) =>
    setInputs((s) => ({ ...s, [k]: v }));

  const stepOk = () => {
    switch (STEPS[step].key) {
      case 'name':
        return inputs.name.trim().length > 0;
      case 'income':
        return inputs.income > 0;
      case 'rent':
        return inputs.rent >= 0;
      case 'bills':
        return inputs.bills >= 0;
      case 'goal':
        return inputs.goal >= 0;
      case 'leak':
        return inputs.leak.length > 0;
      case 'apps':
        return true;
      default:
        return true;
    }
  };

  const next = () => {
    if (!stepOk()) return;
    if (step < STEPS.length - 1) setStep(step + 1);
    else onComplete(inputs);
  };

  const goalPct = inputs.income > 0 ? Math.round((inputs.goal / inputs.income) * 100) : 0;

  const locked = inputs.rent + inputs.bills;
  const spendable = Math.max(0, inputs.income - locked - inputs.goal);
  const dailyPreview = {
    allowance: inputs.income > 0 ? spendable / 30 : 0,
    save: inputs.goal,
    locked,
  };

  return (
    <div className="min-h-screen bg-[#F4EFE4]">
      <div
        className="px-6 pt-8 pb-16 text-white"
        style={{ background: 'linear-gradient(160deg, #17142B 0%, #18241C 100%)' }}
      >
        <div className="max-w-[88rem] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md"
              style={{ background: 'linear-gradient(135deg, #d5b256, #b8860b)' }}
            >
              <Wallet size={18} className="text-white" />
            </div>
            <span className="text-xl font-medium tracking-tight">SpendSmart</span>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="text-sm text-white/60 font-medium hover:text-white transition-colors duration-200 cursor-pointer"
            >
              → Back to site
            </button>
          )}
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 -mt-6 pb-24">
        <div className="bg-[#FBF9F0] rounded-3xl shadow-xl border border-[#E7DEC7] p-8 md:p-12">
          {/* Progress */}
          <div className="flex items-center gap-2 mb-10">
            {STEPS.map((_, i) => (
              <div key={i} className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: '#E9E0CB' }}>
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: i <= step ? '100%' : '0%',
                    background: 'linear-gradient(90deg, #d5b256, #b8860b)',
                  }}
                />
              </div>
            ))}
          </div>

          {/* Step header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-xl bg-[#18241C] flex items-center justify-center">
                {(() => {
                  const Icon = STEPS[step].icon;
                  return <Icon size={18} className="text-[#d4af37]" />;
                })()}
              </div>
              <p className="text-xs uppercase tracking-[0.24em] text-black/40 font-semibold">
                Step {step + 1} of {STEPS.length}
              </p>
            </div>
            <h1 className="text-4xl md:text-5xl font-medium text-black">
              {STEPS[step].title}
            </h1>
            <p className="text-black/60 mt-2">{STEPS[step].hint}</p>
          </div>

          {/* Step body */}
          <div className="min-h-40">
            {STEPS[step].key === 'name' && (
              <input
                autoFocus
                className={inputClass}
                placeholder="e.g. Harsh"
                value={inputs.name}
                onChange={(e) => set('name', e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && next()}
              />
            )}

            {STEPS[step].key === 'income' && (
              <div>
                <input
                  autoFocus
                  className={inputClass}
                  placeholder="₹60,000"
                  value={inputs.income || ''}
                  onChange={(e) => set('income', parseRupee(e.target.value))}
                  onKeyDown={(e) => e.key === 'Enter' && next()}
                />
                <div className="flex flex-wrap gap-2 mt-5">
                  {INCOME_CHIPS.map((c) => (
                    <button key={c} className={chipClass(inputs.income === c)} onClick={() => set('income', c)}>
                      ₹{c.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {STEPS[step].key === 'rent' && (
              <div>
                <input
                  autoFocus
                  className={inputClass}
                  placeholder="₹15,000"
                  value={inputs.rent || ''}
                  onChange={(e) => set('rent', parseRupee(e.target.value))}
                  onKeyDown={(e) => e.key === 'Enter' && next()}
                />
                <div className="flex flex-wrap gap-2 mt-5">
                  {RENT_CHIPS.map((c) => (
                    <button key={c} className={chipClass(inputs.rent === c)} onClick={() => set('rent', c)}>
                      ₹{c.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {STEPS[step].key === 'bills' && (
              <div>
                <input
                  autoFocus
                  className={inputClass}
                  placeholder="₹4,000"
                  value={inputs.bills || ''}
                  onChange={(e) => set('bills', parseRupee(e.target.value))}
                  onKeyDown={(e) => e.key === 'Enter' && next()}
                />
                <div className="flex flex-wrap gap-2 mt-5">
                  {BILLS_CHIPS.map((c) => (
                    <button key={c} className={chipClass(inputs.bills === c)} onClick={() => set('bills', c)}>
                      ₹{c.toLocaleString('en-IN')}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {STEPS[step].key === 'goal' && (
              <div>
                <div className="flex items-end justify-between mb-3">
                  <span className="text-3xl md:text-4xl font-semibold text-[#B8860B]" style={{ letterSpacing: '-0.03em' }}>
                    ₹{inputs.goal.toLocaleString('en-IN')}
                  </span>
                  <span className="text-sm text-black/50">{goalPct}% of income</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={Math.max(1, Math.round(inputs.income * 0.4))}
                  step={500}
                  value={inputs.goal}
                  onChange={(e) => set('goal', parseInt(e.target.value, 10))}
                  className="w-full accent-[#B8860B] cursor-pointer"
                />
                <div className="flex justify-between text-xs text-black/40 mt-1">
                  <span>₹0</span>
                  <span>40% of income</span>
                </div>
              </div>
            )}

            {STEPS[step].key === 'leak' && (
              <div className="space-y-3">
                {LEAK_OPTIONS.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => set('leak', l.id)}
                    className={`w-full flex items-center gap-4 rounded-2xl px-5 py-4 text-left border-2 transition-all duration-200 cursor-pointer ${
                      inputs.leak === l.id ? 'border-[#B8860B] bg-[#B8860B]/5' : 'border-black/10 hover:border-black/30'
                    }`}
                  >
                    <span className="text-2xl">{l.icon}</span>
                    <span className="text-lg font-medium text-black">{l.label}</span>
                  </button>
                ))}
              </div>
            )}

            {STEPS[step].key === 'apps' && (
              <div>
                <div className="grid sm:grid-cols-2 gap-3">
                  {APP_OPTIONS.map((app) => {
                    const on = inputs.apps.includes(app);
                    return (
                      <button
                        key={app}
                        onClick={() =>
                          set('apps', on ? inputs.apps.filter((a) => a !== app) : [...inputs.apps, app])
                        }
                        className={`flex items-center justify-between rounded-2xl px-5 py-4 text-left border-2 transition-all duration-200 cursor-pointer ${
                          on ? 'border-[#18241C] bg-[#18241C] text-white' : 'border-black/10 hover:border-black/30'
                        }`}
                      >
                        <span className="font-medium">{app}</span>
                        <span
                          className={`h-5 w-5 rounded-full border-2 flex items-center justify-center text-[10px] ${
                            on ? 'border-[#d4af37] text-[#d4af37]' : 'border-black/25'
                          }`}
                        >
                          {on ? '✓' : ''}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <p className="text-xs text-black/45 mt-4">
                  {inputs.apps.length === 0
                    ? 'Skip for now — you can still import manually from the dashboard.'
                    : `${inputs.apps.length} source${inputs.apps.length === 1 ? '' : 's'} in the loop.`}
                </p>
              </div>
            )}

            {STEPS[step].key === 'style' && (
              <div>
                <div className="grid sm:grid-cols-3 gap-3">
                  {(
                    [
                      { id: 'strict', title: 'Strict', desc: 'Tight leash, bigger savings' },
                      { id: 'balanced', title: 'Balanced', desc: 'Save hard, still live a little' },
                      { id: 'flex', title: 'Flex', desc: 'Autonomy with room to breathe' },
                    ] as { id: SpendStyle; title: string; desc: string }[]
                  ).map((s) => (
                    <button
                      key={s.id}
                      onClick={() => set('style', s.id)}
                      className={`rounded-2xl p-5 text-left border-2 transition-all duration-200 cursor-pointer ${
                        inputs.style === s.id ? 'border-[#B8860B] bg-[#B8860B]/5' : 'border-black/10 hover:border-black/30'
                      }`}
                    >
                      <p className="font-medium text-black mb-1">{s.title}</p>
                      <p className="text-sm text-black/50 leading-snug">{s.desc}</p>
                    </button>
                  ))}
                </div>

                {/* Smart preview — the math made visible */}
                <div
                  className="mt-6 rounded-2xl p-6 text-white overflow-hidden relative"
                  style={{ background: 'linear-gradient(150deg, #18241C, #24352A)' }}
                >
                  <div
                    aria-hidden
                    className="absolute -right-14 -top-14 w-44 h-44 rounded-full opacity-25 pointer-events-none"
                    style={{ background: 'radial-gradient(circle, #d4af37 0%, transparent 65%)' }}
                  />
                  <div className="relative z-10 flex items-center gap-2 mb-4">
                    <span className="text-xs uppercase tracking-[0.3em] text-[#d4af37] font-semibold">
                      Your plan, live
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/50 mb-1">Daily</p>
                      <p className="font-serif text-2xl md:text-3xl text-white">₹{Math.round(dailyPreview.allowance).toLocaleString('en-IN')}</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/50 mb-1">Goals</p>
                      <p className="font-serif text-2xl md:text-3xl text-[#d4af37]">₹{Math.round(dailyPreview.save).toLocaleString('en-IN')}/mo</p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-[0.18em] text-white/50 mb-1">Locked</p>
                      <p className="font-serif text-2xl md:text-3xl text-white">₹{Math.round(dailyPreview.locked).toLocaleString('en-IN')}</p>
                    </div>
                  </div>
                  <p className="relative z-10 mt-4 text-xs text-white/55 leading-relaxed">
                    Rent + bills locked first · {inputs.style} flex factor ·{' '}
                    {inputs.apps.length === 0 ? 'manual imports' : `${inputs.apps.length} sources auto-read`}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between mt-10">
            <button
              onClick={() => (step > 0 ? setStep(step - 1) : onCancel?.())}
              className={`inline-flex items-center gap-2 text-sm font-medium px-5 py-2 rounded-full transition-colors duration-200 cursor-pointer ${
                step === 0 ? 'text-black/40' : 'text-black/70 hover:text-black'
              }`}
            >
              {step === 0 && onCancel ? null : <ArrowLeft size={16} />}
              {step === 0 ? 'Skip for now' : 'Back'}
            </button>

            {STEPS[step].key === 'style' ? (
              <button
                onClick={() => onComplete(inputs)}
                className="inline-flex items-center gap-3 bg-[#18241C] text-white text-base font-medium pl-8 pr-2 py-2 rounded-full hover:bg-[#2A3B31] transition-colors duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Build my dashboard
                <span className="bg-white rounded-full p-2">
                  <Rocket size={16} className="text-black" />
                </span>
              </button>
            ) : (
              <button
                onClick={next}
                disabled={!stepOk()}
                className="inline-flex items-center gap-3 bg-[#18241C] text-white text-base font-medium pl-8 pr-2 py-2 rounded-full hover:bg-[#2A3B31] transition-colors duration-200 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Continue
                <span className="bg-white rounded-full p-2">
                  <ArrowRight size={16} className="text-black" />
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Onboarding;