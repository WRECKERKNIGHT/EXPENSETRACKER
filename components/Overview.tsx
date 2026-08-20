
import React, { useMemo, useState, useEffect, useRef } from 'react';
import { Expense, UserPreferences, WidgetKey } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip, AreaChart, Area, XAxis, YAxis, CartesianGrid, Legend } from 'recharts';
import { TrendingUp, TrendingDown, Wallet, Plus, PieChart as PieChartIcon, Activity, ListChecks, Link as LinkIcon, CheckCircle2, Loader2, Sparkles, UploadCloud, MessageSquare, SlidersHorizontal, X, Gauge } from 'lucide-react';
import QuickAdd from './QuickAdd';
import QuickAddInline from './QuickAddInline';
import { connectBankAPI, getBankConnectionsAPI, uploadBankCSVAPI } from '../services/apiService';
import SmsImportModal from './SmsImportModal';
import BudgetsCard from './BudgetsCard';
import RecurringCard from './RecurringCard';
import GoalCard from './GoalCard';
import DailyAllowanceCard from './DailyAllowanceCard';
import RunwayCard from './RunwayCard';
import StreakCard from './StreakCard';
import AlertStrip from './AlertStrip';
import SpendingInsightsCard from './SpendingInsightsCard';
import SmartInsights from './SmartInsights';

declare global {
  interface Window { gsap: any; ScrollTrigger: any; THREE: any; }
}

interface OverviewProps {
  expenses: Expense[];
  monthlyIncome: number;
  currency: string;
  onAddTx: () => void;
  onManageExpenses: () => void;
  userName?: string;
  onImportComplete?: () => void;
  preferences?: UserPreferences | null;
  showCustomizePrompt?: boolean;
  onCustomize?: () => void;
  onDismissCustomize?: () => void;
}

const COLORS_CATEGORY = ['#d4af37', '#3fae6e', '#3f7d9e', '#b3492f', '#6f8f5e', '#8a6f4d', '#2f8f9e', '#7a5ea8', '#64748b'];
const COLORS_HEALTH = ['#d4af37', '#3fae6e'];

const formatCurrency = (amount: number, currency: string) =>
  new Intl.NumberFormat(undefined, { style: 'currency', currency, maximumFractionDigits: 0 }).format(amount);

/* ═══════════════════════════════════════════════
   THREE.JS 3D GOLD COIN
   ═══════════════════════════════════════════════ */
const CoinScene: React.FC<{ containerId: string }> = ({ containerId }) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!mountRef.current || !window.THREE) return;
    const container = mountRef.current;
    const w = container.clientWidth;
    const h = container.clientHeight;

    const scene = new window.THREE.Scene();
    const camera = new window.THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    camera.position.set(0, 0, 4);

    const renderer = new window.THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setSize(w, h);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const ambientLight = new window.THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    const dirLight = new window.THREE.DirectionalLight(0xffffff, 1.2);
    dirLight.position.set(3, 4, 5);
    scene.add(dirLight);
    const rimLight = new window.THREE.PointLight(0xd4af37, 0.8, 10);
    rimLight.position.set(-2, 1, 3);
    scene.add(rimLight);

    const coinGeometry = new window.THREE.CylinderGeometry(1, 1, 0.12, 64);
    const coinMaterial = new window.THREE.MeshStandardMaterial({
      color: 0xd4af37,
      metalness: 0.9,
      roughness: 0.15,
    });
    const coin = new window.THREE.Mesh(coinGeometry, coinMaterial);
    coin.rotation.x = Math.PI * 0.15;
    scene.add(coin);

    const edgeGeometry = new window.THREE.TorusGeometry(1, 0.06, 8, 64);
    const edgeMaterial = new window.THREE.MeshStandardMaterial({ color: 0xb8960b, metalness: 0.95, roughness: 0.1 });
    const edge = new window.THREE.Mesh(edgeGeometry, edgeMaterial);
    edge.rotation.x = Math.PI / 2;
    coin.add(edge);

    const dollarShape = new window.THREE.Shape();
    dollarShape.moveTo(-0.25, -0.45);
    dollarShape.lineTo(-0.25, 0.05);
    dollarShape.bezierCurveTo(-0.25, 0.35, -0.05, 0.5, 0.0, 0.5);
    dollarShape.bezierCurveTo(0.15, 0.5, 0.35, 0.35, 0.35, 0.1);
    dollarShape.bezierCurveTo(0.35, -0.1, 0.15, -0.2, 0.0, -0.2);
    dollarShape.bezierCurveTo(-0.1, -0.2, -0.2, -0.15, -0.25, -0.05);
    dollarShape.lineTo(-0.25, -0.45);
    const dollarGeometry = new window.THREE.ExtrudeGeometry(dollarShape, { depth: 0.02, bevelEnabled: false });
    const dollarMaterial = new window.THREE.MeshStandardMaterial({ color: 0xf3e29a, metalness: 0.7, roughness: 0.2 });
    const dollar = new window.THREE.Mesh(dollarGeometry, dollarMaterial);
    dollar.position.set(0, 0, 0.065);
    dollar.scale.set(1.2, 1.2, 1.2);
    coin.add(dollar);

    const rimRingGeometry = new window.THREE.TorusGeometry(0.85, 0.015, 8, 64);
    const rimRingMaterial = new window.THREE.MeshStandardMaterial({ color: 0xf3e29a, metalness: 0.8, roughness: 0.2 });
    const rimRing = new window.THREE.Mesh(rimRingGeometry, rimRingMaterial);
    rimRing.position.z = 0.065;
    coin.add(rimRing);

    const clock = new window.THREE.Clock();
    const animate = () => {
      frameRef.current = requestAnimationFrame(animate);
      const t = clock.getElapsedTime();
      coin.rotation.y = t * 0.5;
      coin.position.y = Math.sin(t * 0.8) * 0.1;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(frameRef.current);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      if (container.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="absolute inset-0 pointer-events-none" style={{ zIndex: 1 }} />;
};

/* ═══════════════════════════════════════════════
   MAIN OVERVIEW COMPONENT
   ═══════════════════════════════════════════════ */
const Overview: React.FC<OverviewProps> = ({ expenses, monthlyIncome, currency, onAddTx, onManageExpenses, userName, onImportComplete, preferences, showCustomizePrompt, onCustomize, onDismissCustomize }) => {
  const [isBankConnecting, setIsBankConnecting] = useState(false);
  const [isBankConnected, setIsBankConnected] = useState(false);
  const [showSmsModal, setShowSmsModal] = useState(false);
  const [showQuickInline, setShowQuickInline] = useState(false);
  const [isUploadingCsv, setIsUploadingCsv] = useState(false);
  const [csvMessage, setCsvMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const mainRef = useRef<HTMLDivElement>(null);

  /* ── GSAP Scroll Animations ── */
  useEffect(() => {
    if (!mainRef.current || !window.gsap || !window.ScrollTrigger) return;
    window.gsap.registerPlugin(window.ScrollTrigger);

    const sections = mainRef.current.querySelectorAll('.gsap-section');
    sections.forEach((section, i) => {
      window.gsap.fromTo(section,
        { opacity: 0, y: 50 },
        {
          opacity: 1, y: 0,
          duration: 0.9,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 88%',
            toggleActions: 'play none none none',
          }
        }
      );
    });

    return () => { window.ScrollTrigger.getAll().forEach((t: any) => t.kill()); };
  }, [expenses, preferences]);

  const widgetOrder: WidgetKey[] = useMemo(() => {
    const preferred = preferences ? preferences.widgets : ['goal', 'allowance', 'runway', 'streak'];
    return preferred.filter((w): w is WidgetKey => ['goal', 'allowance', 'runway', 'streak'].includes(w));
  }, [preferences]);

  const renderWidget = (key: WidgetKey) => {
    switch (key) {
      case 'goal': return preferences ? <GoalCard expenses={expenses} prefs={preferences} currency={currency} /> : null;
      case 'allowance': return preferences ? <DailyAllowanceCard expenses={expenses} prefs={preferences} monthlyIncome={monthlyIncome} currency={currency} /> : null;
      case 'runway': return preferences ? <RunwayCard expenses={expenses} prefs={preferences} monthlyIncome={monthlyIncome} currency={currency} /> : null;
      case 'streak': return preferences ? <StreakCard expenses={expenses} prefs={preferences} monthlyIncome={monthlyIncome} /> : null;
      default: return null;
    }
  };

  useEffect(() => { checkBankConnection(); }, []);

  const checkBankConnection = async () => {
    try {
      const connections: any = await getBankConnectionsAPI();
      const arr = Array.isArray(connections) ? connections : (connections && (connections.items || connections.connections)) || [];
      setIsBankConnected(Array.isArray(arr) && arr.length > 0);
    } catch (error) { console.error('Failed to check bank connections:', error); }
  };

  const handleConnectBank = async () => {
    if (isBankConnected) return;
    setIsBankConnecting(true);
    try { await connectBankAPI('HDFC Bank', '****1234'); setIsBankConnected(true); onImportComplete && onImportComplete(); }
    catch (error) { console.error('Failed to connect bank:', error); }
    finally { setIsBankConnecting(false); }
  };

  const handleFilePick = () => { fileRef.current?.click(); };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setIsUploadingCsv(true); setCsvMessage(null);
    try {
      const text = await f.text();
      const result: any = await uploadBankCSVAPI('', text);
      if (result.imported && result.imported > 0) { setCsvMessage({ type: 'success', text: `Imported ${result.imported} transaction(s)` }); onImportComplete && onImportComplete(); }
      else { setCsvMessage({ type: 'error', text: 'No transactions found in CSV' }); }
    } catch (err: any) { setCsvMessage({ type: 'error', text: err.message || 'Failed to upload CSV' }); }
    finally { setIsUploadingCsv(false); if (fileRef.current) fileRef.current.value = ''; setTimeout(() => setCsvMessage(null), 3000); }
  };

  const calculations = useMemo(() => {
    const totalIncomeTx = expenses.filter(e => e.type === 'income').reduce((acc, curr) => acc + curr.amount, 0);
    const totalExpense = expenses.filter(e => e.type === 'expense').reduce((acc, curr) => acc + curr.amount, 0);
    return { totalIncomeTx, totalExpense, balance: totalIncomeTx - totalExpense };
  }, [expenses]);

  const healthData = useMemo(() => [
    { name: 'Available Balance', value: Math.max(0, calculations.balance) },
    { name: 'Total Spent', value: calculations.totalExpense }
  ], [calculations]);

  const spendingVelocity = useMemo(() => {
    const now = new Date();
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const dayOfMonth = now.getDate();
    const totalDaysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const monthExpenses = expenses.filter(e => e.type === 'expense' && new Date(e.date) >= monthStart && new Date(e.date) <= now).reduce((acc, e) => acc + e.amount, 0);
    const dailyBurn = dayOfMonth > 0 ? monthExpenses / dayOfMonth : 0;
    const projectedMonthEnd = dailyBurn * totalDaysInMonth;
    const burnPct = monthlyIncome > 0 ? (projectedMonthEnd / monthlyIncome) * 100 : 0;
    const remainingDays = totalDaysInMonth - dayOfMonth;
    const remainingBudget = monthlyIncome - monthExpenses;
    const dailyAllowance = remainingDays > 0 ? remainingBudget / remainingDays : 0;
    return { dailyBurn, projectedMonthEnd, burnPct, remainingBudget, dailyAllowance };
  }, [expenses, monthlyIncome]);

  const categoryData = useMemo(() => {
    const map = new Map<string, number>();
    expenses.filter(e => e.type === 'expense').forEach(e => map.set(e.category, (map.get(e.category) || 0) + e.amount));
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [expenses]);

  const monthlyData = useMemo(() => {
    const map = new Map<string, { income: number, expense: number }>();
    [...expenses].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).forEach(e => {
      const month = new Date(e.date).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' });
      if (!map.has(month)) map.set(month, { income: 0, expense: 0 });
      const current = map.get(month)!;
      if (e.type === 'income') current.income += e.amount; else current.expense += e.amount;
    });
    return Array.from(map.entries()).slice(-7).map(([name, val]) => ({ name, Income: val.income, Expense: val.expense }));
  }, [expenses]);

  return (
    <div ref={mainRef} className="space-y-6 py-2 animate-fade-in font-sans">

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          HERO — 3D COIN + GREETING
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="relative overflow-hidden rounded-2xl border-b border-gold/10" style={{ background: 'linear-gradient(135deg, rgba(8,13,26,0.9) 0%, rgba(17,24,39,0.8) 50%, rgba(8,13,26,0.95) 100%)' }}>
        <div className="mesh-blob bg-gold/20 w-64 h-64 absolute -top-20 -left-20" />
        <div className="mesh-blob bg-brand/15 w-48 h-48 absolute -bottom-10 right-10" />
        <div className="particle-field">
          <span style={{left:'10%',bottom:'-5%',animationDelay:'0s',animationDuration:'18s'}} />
          <span style={{left:'30%',bottom:'-5%',animationDelay:'3s',animationDuration:'22s'}} />
          <span style={{left:'60%',bottom:'-5%',animationDelay:'7s',animationDuration:'20s'}} />
          <span style={{left:'85%',bottom:'-5%',animationDelay:'2s',animationDuration:'25s'}} />
        </div>
        <div className="relative flex flex-col md:flex-row items-center gap-8 px-8 py-12 md:py-16 min-h-[280px]">
          <div className="flex-1 relative z-10">
            <p className="text-gold text-xs font-bold uppercase tracking-[0.25em] mb-3">Dashboard</p>
            <h1 className="heading-serif text-3xl md:text-5xl font-black text-app leading-tight mb-3">
              Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 18 ? 'afternoon' : 'evening'}, <span className="text-gold text-glow-gold">{userName || 'there'}</span>
            </h1>
            <p className="text-soft text-base md:text-lg max-w-lg">Track every rupee. Every transaction. Every insight.</p>
          </div>
          <div className="relative w-40 h-40 md:w-52 md:h-52 flex-shrink-0">
            <CoinScene containerId="hero-coin" />
          </div>
        </div>
      </div>

      {/* ━━━ QUICK ACTIONS ━━━ */}
      <div className="flex flex-col sm:flex-row gap-4 gsap-section animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
        <button onClick={onAddTx} className="flex-1 btn-gold flex items-center justify-center gap-3 text-base font-bold py-4 rounded-xl transition-all hover:scale-[1.02]">
          <Plus size={20} strokeWidth={2.5} /> Quick Add
        </button>
        <button onClick={onManageExpenses} className="flex-1 card-3d flex items-center justify-center gap-3 text-base font-bold py-4 rounded-xl text-app hover:text-gold cursor-pointer tilt-hover">
          <ListChecks size={20} /> Manage Expenses
        </button>
      </div>

      {/* ━━━ IMPORT BAR ━━━ */}
      <div className="card-3d px-5 py-3 flex flex-wrap items-center gap-3 gsap-section animate-fade-in-up-d1" style={{ animationDelay: '0.2s' }}>
        <span className="text-xs font-bold text-faint uppercase tracking-wider">Import</span>
        <div className="flex-1" />
        <button onClick={handleConnectBank} disabled={isBankConnecting || isBankConnected}
          className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold border transition-all ${isBankConnected ? 'bg-gold/10 text-gold border-gold/30' : 'bg-surface-2 text-soft border-app hover:border-gold/40'}`}>
          {isBankConnecting ? <Loader2 size={12} className="animate-spin" /> : isBankConnected ? <CheckCircle2 size={12} /> : <LinkIcon size={12} />}
          {isBankConnecting ? 'Syncing...' : isBankConnected ? 'Connected' : 'Connect Bank'}
        </button>
        <button onClick={() => setShowSmsModal(true)} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold bg-surface-2 text-soft border border-app hover:border-gold/40 transition-all">
          <MessageSquare size={12} /> SMS
        </button>
        <button onClick={handleFilePick} disabled={isUploadingCsv} className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold bg-surface-2 text-soft border border-app hover:border-gold/40 transition-all disabled:opacity-50">
          {isUploadingCsv ? <Loader2 size={12} className="animate-spin" /> : <UploadCloud size={12} />} CSV
        </button>
        <input ref={fileRef} type="file" accept=".csv" className="hidden" onChange={handleFileChange} />
      </div>

      {/* ━━━ CUSTOMIZE PROMPT ━━━ */}
      {showCustomizePrompt && !preferences && (
        <div className="card-3d gold-shimmer p-6 gsap-section relative overflow-hidden" style={{ animationDelay: '0.3s' }}>
          <div className="absolute top-0 left-0 right-0 h-0.5" style={{ background: 'linear-gradient(90deg, var(--gold), var(--brand), var(--gold))' }} />
          <button onClick={onDismissCustomize} className="absolute top-4 right-4 p-1 rounded-full text-faint hover:text-app transition-colors" aria-label="Dismiss"><X size={16} /></button>
          <div className="flex flex-col md:flex-row items-start md:items-center gap-5">
            <div className="p-3 bg-gold/10 rounded-xl text-gold border border-gold/20"><Sparkles size={24} /></div>
            <div className="flex-1">
              <h3 className="heading-serif text-xl font-bold mb-1">Personalize Your Dashboard</h3>
              <p className="text-sm text-soft">Answer 6 quick questions to get a personalized savings goal, daily allowance, and runway.</p>
            </div>
            <button onClick={onCustomize} className="shrink-0 btn-gold text-sm flex items-center gap-2"><SlidersHorizontal size={16} /> Personalize</button>
          </div>
        </div>
      )}

      {/* ━━━ ALERTS ━━━ */}
      <div className="gsap-section" style={{ animationDelay: '0.4s' }}><AlertStrip expenses={expenses} currency={currency} /></div>

      {/* ━━━ INSIGHTS ━━━ */}
      <div className="gsap-section" style={{ animationDelay: '0.5s' }}><SpendingInsightsCard expenses={expenses} monthlyIncome={monthlyIncome} currency={currency} /></div>

      {/* ━━━ SMART AUTO-DETECTED INSIGHTS ━━━ */}
      <div className="gsap-section animate-fade-in" style={{ animationDelay: '0.6s' }}><SmartInsights expenses={expenses} /></div>

      {/* ━━━ WIDGETS ━━━ */}
      {preferences && widgetOrder.length > 0 && (
        <div className="gsap-section" style={{ animationDelay: '0.7s' }}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Sparkles size={18} className="text-gold" />
              <h3 className="heading-serif text-xl font-bold">Your Plan</h3>
            </div>
            <button onClick={onCustomize} className="text-xs font-bold text-faint hover:text-gold border border-app hover:border-gold/40 px-3 py-1.5 rounded-lg transition-all flex items-center gap-1.5">
              <SlidersHorizontal size={12} /> Edit
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {widgetOrder.map(key => <div key={key}>{renderWidget(key)}</div>)}
          </div>
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          KPI CARDS
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="gsap-section" style={{ animationDelay: '0.8s' }}>
        <div className="flex items-center gap-2 mb-4">
          <Gauge size={18} className="text-gold" />
          <h3 className="heading-serif text-xl font-bold">Overview</h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Balance */}
          <div className="card-3d gold-shimmer p-6 tilt-hover relative overflow-hidden transition-all duration-500 hover:scale-[1.02]">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2.5 rounded-xl bg-gold/10 border border-gold/20 text-gold"><Wallet size={18} /></div>
              <span className="text-xs font-bold uppercase tracking-wider text-faint">Balance</span>
            </div>
            <p className="heading-serif text-4xl font-black text-glow-gold text-gold mb-1">{formatCurrency(calculations.balance, currency)}</p>
            <p className="text-xs text-faint">Available Funds</p>
            <div className="progress-bar mt-3"><div className="progress-bar-fill shimmer-fill" style={{ width: `${monthlyIncome > 0 ? Math.min((calculations.balance / monthlyIncome) * 100, 100) : 0}%` }} /></div>
          </div>
          {/* Spent */}
          <div className="card-3d gold-shimmer p-6 tilt-hover relative overflow-hidden transition-all duration-500 hover:scale-[1.02]">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-red-500/10 blur-3xl pointer-events-none" />
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400"><TrendingDown size={18} /></div>
              <span className="text-xs font-bold uppercase tracking-wider text-faint">Spent</span>
            </div>
            <p className="heading-serif text-4xl font-black text-glow-danger text-red-400 mb-1">{formatCurrency(calculations.totalExpense, currency)}</p>
            <p className="text-xs text-faint">Total Outflow</p>
            <div className="progress-bar mt-3"><div className="progress-bar-fill shimmer-fill" style={{ width: `${monthlyIncome > 0 ? Math.min((calculations.totalExpense / monthlyIncome) * 100, 100) : 0}%`, background: 'linear-gradient(90deg, #e07a5f, #e74c3c)' }} /></div>
          </div>
          {/* Income */}
          <div className="card-3d gold-shimmer p-6 tilt-hover relative overflow-hidden transition-all duration-500 hover:scale-[1.02]">
            <div className="absolute top-0 left-0 right-0 h-[2px]" style={{ background: 'linear-gradient(90deg, transparent, var(--gold), transparent)' }} />
            <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-brand/10 blur-3xl pointer-events-none" />
            <div className="flex items-center gap-2.5 mb-3">
              <div className="p-2.5 rounded-xl bg-brand/10 border border-brand/20 text-brand"><TrendingUp size={18} /></div>
              <span className="text-xs font-bold uppercase tracking-wider text-faint">Income</span>
            </div>
            <p className="heading-serif text-4xl font-black text-glow-success text-brand mb-1">{formatCurrency(monthlyIncome, currency)}</p>
            <p className="text-xs text-faint">Monthly Salary</p>
            <div className="progress-bar mt-3"><div className="progress-bar-fill shimmer-fill" style={{ width: '100%', background: 'linear-gradient(90deg, #27ae60, #2ecc71)' }} /></div>
          </div>
        </div>
      </div>

      {/* ━━━ CSV FEEDBACK ━━━ */}
      {csvMessage && (
        <div className={`p-4 rounded-xl text-sm font-bold border gsap-section ${csvMessage.type === 'success' ? 'bg-gold/10 text-gold border-gold/30' : 'bg-danger/10 text-danger border-danger/30'}`} style={{ animationDelay: '0.9s' }}>
          {csvMessage.text}
        </div>
      )}

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          SPENDING VELOCITY
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="card-3d gold-line-top p-6 gsap-section animate-fade-in-up" style={{ animationDelay: '1.0s' }}>
        <div className="flex items-center gap-2.5 mb-6">
          <div className="p-2 rounded-lg bg-gold/10 text-gold border border-gold/20"><Gauge size={18} /></div>
          <h3 className="heading-serif text-xl font-bold">Spending Velocity</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-surface-2 border border-app rounded-xl p-4 space-y-2 tilt-hover">
            <span className="text-xs font-bold uppercase tracking-wider text-faint">Daily Burn</span>
            <p className="text-2xl font-bold font-display text-gold">{formatCurrency(spendingVelocity.dailyBurn, currency)}</p>
            <p className="text-xs text-faint">per day average</p>
          </div>
          <div className="bg-surface-2 border border-app rounded-xl p-4 space-y-2 tilt-hover">
            <span className="text-xs font-bold uppercase tracking-wider text-faint">Projected Month-End</span>
            <p className={`text-2xl font-bold font-display ${spendingVelocity.burnPct > 100 ? 'text-danger' : spendingVelocity.burnPct > 80 ? 'text-gold' : 'text-brand'}`}>
              {formatCurrency(spendingVelocity.projectedMonthEnd, currency)}
            </p>
            <div className="progress-bar"><div className="progress-bar-fill" style={{ width: `${Math.min(spendingVelocity.burnPct, 100)}%`, background: spendingVelocity.burnPct > 100 ? '#e74c3c' : spendingVelocity.burnPct > 80 ? 'var(--gold)' : 'var(--brand)' }} /></div>
            <p className="text-xs text-faint">{spendingVelocity.burnPct.toFixed(0)}% of {formatCurrency(monthlyIncome, currency)}</p>
          </div>
          <div className="bg-surface-2 border border-app rounded-xl p-4 space-y-2 tilt-hover">
            <span className="text-xs font-bold uppercase tracking-wider text-faint">Daily Budget Left</span>
            <p className={`text-2xl font-bold font-display ${spendingVelocity.dailyAllowance > 0 ? 'text-brand' : 'text-danger'}`}>
              {formatCurrency(Math.max(0, spendingVelocity.dailyAllowance), currency)}
            </p>
            <p className="text-xs text-faint">for rest of month</p>
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          CHARTS
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 gsap-section" style={{ animationDelay: '1.1s' }}>
        {/* Health */}
        <div className="card-3d p-6 relative overflow-hidden min-h-[340px] animate-fade-in-up-d1">
          <h3 className="heading-serif text-lg font-bold mb-5 flex items-center gap-2.5">
            <Activity size={18} className="text-gold" /> Financial Health
          </h3>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={healthData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} paddingAngle={5} dataKey="value" stroke="none" cornerRadius={6}>
                  {healthData.map((_, index) => <Cell key={index} fill={COLORS_HEALTH[index]} />)}
                </Pie>
                <RechartsTooltip contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--gold)', borderRadius: '12px', color: 'var(--text)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }} itemStyle={{ fontWeight: 600 }} formatter={(v: number) => [formatCurrency(v, currency), 'Amount']} />
                <Legend verticalAlign="bottom" height={30} iconType="circle" formatter={(v) => <span className="text-soft font-medium ml-1 text-sm">{v}</span>} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Categories */}
        <div className="card-3d p-6 relative overflow-hidden min-h-[340px] animate-fade-in-up-d2">
          <h3 className="heading-serif text-lg font-bold mb-5 flex items-center gap-2.5">
            <PieChartIcon size={18} className="text-gold" /> Categories
          </h3>
          <div className="flex flex-col md:flex-row items-center h-56">
            <div className="h-full w-full md:w-1/2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={4} dataKey="value" stroke="none" cornerRadius={5}>
                    {categoryData.map((_, index) => <Cell key={index} fill={COLORS_CATEGORY[index % COLORS_CATEGORY.length]} />)}
                  </Pie>
                  <RechartsTooltip contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--gold)', borderRadius: '12px', color: 'var(--text)', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }} itemStyle={{ fontWeight: 600 }} formatter={(v: number) => [formatCurrency(v, currency), 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 h-full overflow-y-auto pr-2 no-scrollbar">
              <div className="space-y-1.5">
                {categoryData.length === 0 && <p className="text-faint text-sm text-center mt-10">No expenses yet.</p>}
                {categoryData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center justify-between p-2 rounded-lg hover:bg-surface-2 transition-colors">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS_CATEGORY[index % COLORS_CATEGORY.length] }} />
                      <span className="text-sm text-soft">{entry.name}</span>
                    </div>
                    <span className="text-sm font-bold text-faint font-display">{formatCurrency(entry.value, currency)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
          BUDGETS + RECURRING + CASH FLOW
      ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 gsap-section" style={{ animationDelay: '1.2s' }}>
        <div className="space-y-4 2xl:col-span-1 animate-fade-in-up-d3">
          <BudgetsCard expenses={expenses} currency={currency} />
          <RecurringCard expenses={expenses} currency={currency} />
        </div>
        <div className="2xl:col-span-2 card-3d gold-line-top p-6 relative overflow-hidden animate-fade-in-up-d4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-6 gap-3">
            <h3 className="heading-serif text-lg font-bold flex items-center gap-2.5">
              <TrendingUp size={18} className="text-gold" /> Cash Flow
            </h3>
            <div className="flex gap-5 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-gold"><span className="w-2 h-2 rounded-full bg-gold" /> Income</span>
              <span className="flex items-center gap-1.5 text-danger"><span className="w-2 h-2 rounded-full bg-danger" /> Expenses</span>
            </div>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="gradGold" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#d4af37" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="#d4af37" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradRed" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#e74c3c" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#e74c3c" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.4} />
                <XAxis dataKey="name" stroke="var(--text-faint)" fontSize={11} tickLine={false} axisLine={false} dy={8} fontWeight={500} />
                <YAxis stroke="var(--text-faint)" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v/1000}k`} fontWeight={500} />
                <RechartsTooltip cursor={{ stroke: 'var(--gold)', strokeWidth: 1 }} contentStyle={{ backgroundColor: 'var(--surface)', borderColor: 'var(--gold)', borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.3)', color: 'var(--text)' }} itemStyle={{ fontWeight: 600 }} />
                <Area type="monotone" dataKey="Income" stroke="#d4af37" strokeWidth={2} fillOpacity={1} fill="url(#gradGold)" activeDot={{ r: 5, fill: '#d4af37', stroke: '#fff', strokeWidth: 2 }} />
                <Area type="monotone" dataKey="Expense" stroke="#e74c3c" strokeWidth={2} fillOpacity={1} fill="url(#gradRed)" activeDot={{ r: 5, fill: '#e74c3c', stroke: '#fff', strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <SmsImportModal isOpen={showSmsModal} onClose={() => setShowSmsModal(false)} onImported={onImportComplete} />
    </div>
  );
};

export default Overview;
