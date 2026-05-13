/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useCallback, useEffect, ReactNode, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Globe, 
  Calculator as CalcIcon, 
  Equal, 
  Languages, 
  Utensils, 
  UserPlus, 
  ShoppingBag, 
  Users, 
  History,
  TrendingUp,
  Menu as MenuIcon,
  X
} from 'lucide-react';

type Language = 'es' | 'ja';
type View = 'hello' | 'calc' | 'taqueria';

const translations = {
  es: {
    hello: '¡Hola Mundo!',
    calcTitle: 'Calculadora Pro',
    taqueriaTitle: 'Taquería La Imperial',
    changeLang: 'Cambiar a Japonés',
    footer: 'Hecho con ❤️ para ti',
    clear: 'AC',
    delete: 'DEL',
    registerUser: 'Registro de Cliente',
    newOrder: 'Nuevo Pedido',
    recentOrders: 'Pedidos Recientes',
    userName: 'Nombre del Cliente',
    phone: 'Teléfono',
    items: 'Artículos (ej: 3 Tacos Pastor, 1 Horchata)',
    total: 'Total ($)',
    submit: 'Registrar',
    success: '¡Éxito!',
    error: 'Error al procesar',
    viewCalc: 'Calculadora',
    viewTacos: 'Taquería',
    back: 'Volver'
  },
  ja: {
    hello: 'こんにちは、世界！',
    calcTitle: '電卓プロ',
    taqueriaTitle: 'インペリアル・タコス',
    changeLang: 'スペイン語に切り替え',
    footer: 'あなたのために❤️を込めて',
    clear: 'クリア',
    delete: '削除',
    registerUser: '顧客登録',
    newOrder: '新規注文',
    recentOrders: '最近の注文',
    userName: '氏名',
    phone: '電話番号',
    items: '注文内容 (例: タコス3つ、飲み物1つ)',
    total: '合計 ($)',
    submit: '登録する',
    success: '成功！',
    error: 'エラーが発生しました',
    viewCalc: '電卓',
    viewTacos: 'タコス店',
    back: '戻る'
  }
};

export default function App() {
  const [lang, setLang] = useState<Language>('es');
  const [view, setView] = useState<View>('hello');
  const t = translations[lang];

  // Taqueria State
  const [taqueriaView, setTaqueriaView] = useState<'register' | 'order' | 'history'>('register');
  const [users, setUsers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  
  // Registration Form
  const [regForm, setRegForm] = useState({ name: '', phone: '', email: '' });
  const [orderForm, setOrderForm] = useState({ user_id: '', items: '', total: '' });

  // Calculator State
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [isFinished, setIsFinished] = useState(false);

  const toggleLanguage = () => {
    setLang(prev => prev === 'es' ? 'ja' : 'es');
  };

  // Backend Integration
  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/users');
      const data = await res.json();
      setUsers(data);
    } catch (e) { console.error(e); }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      const data = await res.json();
      setOrders(data);
    } catch (e) { console.error(e); }
  };

  useEffect(() => {
    if (view === 'taqueria') {
      fetchUsers();
      fetchOrders();
    }
  }, [view]);

  const handleUserSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(regForm)
      });
      setRegForm({ name: '', phone: '', email: '' });
      fetchUsers();
      alert(t.success);
    } catch (e) { alert(t.error); }
  };

  const handleOrderSubmit = async (e: FormEvent) => {
    e.preventDefault();
    try {
      await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...orderForm, 
          total: parseFloat(orderForm.total),
          items: orderForm.items.split(',').map(s => s.trim())
        })
      });
      setOrderForm({ user_id: '', items: '', total: '' });
      fetchOrders();
      alert(t.success);
    } catch (e) { alert(t.error); }
  };

  // Calculator Logic
  const handleNumber = useCallback((num: string) => {
    if (isFinished) {
      setDisplay(num);
      setIsFinished(false);
      return;
    }
    setDisplay(prev => prev === '0' ? num : prev + num);
  }, [isFinished]);

  const handleOperator = useCallback((op: string) => {
    setIsFinished(false);
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  }, [display]);

  const calculate = useCallback(() => {
    try {
      const expression = equation + display;
      const result = eval(expression.replace(/×/g, '*').replace(/÷/g, '/'));
      setDisplay(String(Number(result.toFixed(8))));
      setEquation('');
      setIsFinished(true);
    } catch (e) {
      setDisplay('Error');
      setEquation('');
      setIsFinished(true);
    }
  }, [display, equation]);

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
    setIsFinished(false);
  };

  const handleDelete = () => {
    if (display.length > 1) {
      setDisplay(prev => prev.slice(0, -1));
    } else {
      setDisplay('0');
    }
  };

  const handlePercentage = () => {
    setDisplay(prev => String(Number(prev) / 100));
  };

  const handleSign = () => {
    setDisplay(prev => prev.startsWith('-') ? prev.slice(1) : '-' + prev);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (view !== 'calc') return;
      if (/[0-9]/.test(e.key)) handleNumber(e.key);
      if (['+', '-', '*', '/'].includes(e.key)) handleOperator(e.key === '*' ? '×' : e.key === '/' ? '÷' : e.key);
      if (e.key === 'Enter' || e.key === '=') calculate();
      if (e.key === 'Backspace') handleDelete();
      if (e.key === 'Escape') handleClear();
      if (e.key === '.') handleNumber('.');
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNumber, handleOperator, calculate, view]);

  return (
    <div className="min-h-screen bg-dark-bg text-[#E0E0E0] font-sans selection:bg-accent/20">
      {/* Navbar */}
      <nav className="fixed top-0 w-full bg-dark-bg/80 backdrop-blur-md border-b border-white/5 z-50">
        <div className="max-w-6xl mx-auto px-6 h-20 flex items-center justify-between">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            onClick={() => setView('hello')}
            className="flex items-center gap-3 font-bold text-xl tracking-tight cursor-pointer"
          >
            <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
              <Languages className="text-[#000] w-4 h-4" />
            </div>
            <span className="text-white">MultiApp</span>
          </motion.div>
          
          <div className="flex gap-4 items-center">
            <button onClick={() => setView('calc')} className={`text-xs uppercase tracking-widest font-bold ${view === 'calc' ? 'text-accent' : 'text-white/40'}`}>
              {t.viewCalc}
            </button>
            <button onClick={() => setView('taqueria')} className={`text-xs uppercase tracking-widest font-bold ${view === 'taqueria' ? 'text-accent' : 'text-white/40'}`}>
              {t.viewTacos}
            </button>
            <div className="w-[1px] h-4 bg-white/10 mx-2"></div>
            <div className="flex gap-2">
              <button 
                onClick={() => setLang('es')}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all border ${lang === 'es' ? 'bg-accent text-dark-bg border-accent' : 'bg-transparent text-white/40 border-white/10 hover:border-white/20'}`}
              >
                ES
              </button>
              <button 
                onClick={() => setLang('ja')}
                className={`px-4 py-1.5 rounded-full text-[10px] font-bold tracking-widest uppercase transition-all border ${lang === 'ja' ? 'bg-accent text-dark-bg border-accent' : 'bg-transparent text-white/40 border-white/10 hover:border-white/20'}`}
              >
                JP
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
        <AnimatePresence mode="wait">
          {view === 'hello' && (
            <motion.div 
              key="hello"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <h1 className="text-7xl md:text-9xl font-bold tracking-tighter text-white mb-6 text-center">
                {t.hello}
              </h1>
              <div className="flex items-center justify-center gap-4">
                <div className="w-10 h-[1px] bg-accent"></div>
                <p className="text-white/50 text-sm uppercase tracking-[0.2em] font-medium">
                  Precision Interface v1.0
                </p>
              </div>
            </motion.div>
          )}

          {view === 'calc' && (
            <motion.div 
              key="calc"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="flex flex-col items-center py-10"
            >
              <div className="w-full max-w-[400px] bg-dark-card rounded-[32px] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.6)] border border-white/5 p-6">
                <div className="bg-dark-bg rounded-2xl h-20 flex flex-col items-end justify-center px-6 mb-6 overflow-hidden border border-white/5">
                  <div className="h-4 text-white/30 text-[10px] font-mono tracking-widest truncate mb-0.5">
                    {equation || '\u00A0'}
                  </div>
                  <div className="text-3xl font-light tracking-wider text-white truncate">
                    {display}
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-3">
                  <CalcButton label={t.clear} onClick={handleClear} variant="utility" className="text-red-400" />
                  <CalcButton label="+/-" onClick={handleSign} variant="utility" />
                  <CalcButton label="%" onClick={handlePercentage} variant="utility" />
                  <CalcButton label="÷" onClick={() => handleOperator('/')} variant="operator" />
                  <CalcButton label="7" onClick={() => handleNumber('7')} />
                  <CalcButton label="8" onClick={() => handleNumber('8')} />
                  <CalcButton label="9" onClick={() => handleNumber('9')} />
                  <CalcButton label="×" onClick={() => handleOperator('*')} variant="operator" />
                  <CalcButton label="4" onClick={() => handleNumber('4')} />
                  <CalcButton label="5" onClick={() => handleNumber('5')} />
                  <CalcButton label="6" onClick={() => handleNumber('6')} />
                  <CalcButton label="-" onClick={() => handleOperator('-')} variant="operator" />
                  <CalcButton label="1" onClick={() => handleNumber('1')} />
                  <CalcButton label="2" onClick={() => handleNumber('2')} />
                  <CalcButton label="3" onClick={() => handleNumber('3')} />
                  <CalcButton label="+" onClick={() => handleOperator('+')} variant="operator" />
                  <CalcButton label="0" onClick={() => handleNumber('0')} />
                  <CalcButton label="." onClick={() => handleNumber('.')} />
                  <CalcButton 
                    label="=" 
                    onClick={calculate} 
                    variant="accent" 
                    className="col-span-2"
                    icon={<Equal className="w-6 h-6" />} 
                  />
                </div>
              </div>
            </motion.div>
          )}

          {view === 'taqueria' && (
            <motion.div 
              key="taqueria"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-12 gap-8"
            >
              {/* Sidebar Info */}
              <div className="md:col-span-4 space-y-6">
                <div className="bg-dark-card rounded-3xl p-8 border border-white/5 relative overflow-hidden">
                  <div className="relative z-10">
                    <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(187,134,252,0.3)]">
                      <Utensils className="text-black w-6 h-6" />
                    </div>
                    <h2 className="text-3xl font-bold text-white tracking-tight mb-2">{t.taqueriaTitle}</h2>
                    <p className="text-white/40 text-sm leading-relaxed mb-8">
                      {lang === 'es' ? 'Gestión de clientes y pedidos con precisión Imperial.' : '帝国の精度で顧客と注文を管理します。'}
                    </p>
                    
                    <div className="space-y-3">
                      <NavItem icon={<UserPlus />} label={t.registerUser} active={taqueriaView === 'register'} onClick={() => setTaqueriaView('register')} />
                      <NavItem icon={<ShoppingBag />} label={t.newOrder} active={taqueriaView === 'order'} onClick={() => setTaqueriaView('order')} />
                      <NavItem icon={<History />} label={t.recentOrders} active={taqueriaView === 'history'} onClick={() => setTaqueriaView('history')} />
                    </div>
                  </div>
                  {/* Decorative background logo symbol (mocking the requested one) */}
                  <div className="absolute -bottom-10 -right-10 opacity-[0.03] rotate-12">
                    <svg width="240" height="240" viewBox="0 0 100 100" fill="currentColor" className="text-accent">
                        <path d="M50 5 L50 95 M10 40 L90 40 M20 20 L80 80 M80 20 L20 80" stroke="currentColor" strokeWidth="2" fill="none" />
                        <path d="M30 30 L40 25 M60 30 L70 25 M30 70 L40 75 M60 70 L70 75" stroke="currentColor" strokeWidth="2" fill="none" />
                    </svg>
                  </div>
                </div>

                <div className="bg-accent-dim rounded-3xl p-6 border border-accent/10">
                  <div className="flex items-center gap-3 mb-4">
                    <TrendingUp className="text-accent w-5 h-5" />
                    <span className="font-bold text-accent text-sm tracking-widest uppercase">Live Status</span>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-[10px] text-accent/60 uppercase font-bold tracking-widest mb-1">Clientes</p>
                      <p className="text-2xl font-bold text-white">{users.length}</p>
                    </div>
                    <div>
                      <p className="text-[10px] text-accent/60 uppercase font-bold tracking-widest mb-1">Pedidos</p>
                      <p className="text-2xl font-bold text-white">{orders.length}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Form Content */}
              <div className="md:col-span-8 bg-dark-card rounded-[40px] border border-white/5 p-10 overflow-hidden relative">
                <AnimatePresence mode="wait">
                  {taqueriaView === 'register' && (
                    <motion.div key="reg" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <h3 className="text-2xl font-bold text-white mb-8">{t.registerUser}</h3>
                      <form onSubmit={handleUserSubmit} className="space-y-6">
                        <InputGroup label={t.userName} value={regForm.name} onChange={(v) => setRegForm({...regForm, name: v})} placeholder="Juan Pérez" />
                        <InputGroup label={t.phone} value={regForm.phone} onChange={(v) => setRegForm({...regForm, phone: v})} placeholder="55 1234 5678" />
                        <InputGroup label="Email" value={regForm.email} onChange={(v) => setRegForm({...regForm, email: v})} placeholder="juan@correo.com" />
                        <button type="submit" className="w-full bg-accent hover:opacity-90 text-black font-bold py-4 rounded-2xl transition-all">
                          {t.submit}
                        </button>
                      </form>
                    </motion.div>
                  )}

                  {taqueriaView === 'order' && (
                    <motion.div key="order" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
                      <h3 className="text-2xl font-bold text-white mb-8">{t.newOrder}</h3>
                      <form onSubmit={handleOrderSubmit} className="space-y-6">
                        <div className="space-y-2">
                          <label className="text-[10px] text-white/40 uppercase font-bold tracking-[0.2em]">{t.userName}</label>
                          <select 
                            value={orderForm.user_id} 
                            onChange={(e) => setOrderForm({...orderForm, user_id: e.target.value})}
                            className="w-full bg-dark-bg border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-accent/50 appearance-none"
                          >
                            <option value="">{lang === 'es' ? 'Seleccionar Cliente' : '顧客を選択'}</option>
                            {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                          </select>
                        </div>
                        <InputGroup label={t.items} value={orderForm.items} onChange={(v) => setOrderForm({...orderForm, items: v})} placeholder="Tacox3, Horchata" />
                        <InputGroup label={t.total} value={orderForm.total} onChange={(v) => setOrderForm({...orderForm, total: v})} placeholder="15.50" />
                        <button type="submit" className="w-full bg-accent hover:opacity-90 text-black font-bold py-4 rounded-2xl transition-all">
                          {t.submit}
                        </button>
                      </form>
                    </motion.div>
                  )}

                  {taqueriaView === 'history' && (
                    <motion.div key="hist" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
                      <h3 className="text-2xl font-bold text-white mb-8">{t.recentOrders}</h3>
                      <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
                        {orders.map(o => (
                          <div key={o.id} className="bg-white/5 rounded-2xl p-5 border border-white/5 flex justify-between items-center group hover:border-accent/30 transition-all">
                            <div>
                              <p className="text-white font-bold mb-1">{o.user_name}</p>
                              <div className="flex gap-2">
                                {o.items.map((it: string, i: number) => (
                                  <span key={i} className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full text-white/60">{it}</span>
                                ))}
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-accent font-bold">${o.total}</p>
                              <p className="text-[10px] text-white/20">{new Date(o.created_at).toLocaleDateString()}</p>
                            </div>
                          </div>
                        ))}
                        {orders.length === 0 && <p className="text-white/20 text-center py-10 tracking-widest italic">No records found</p>}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <footer className="mt-24 text-center">
            <p className="text-white/20 text-[10px] tracking-[0.3em] uppercase">
              {t.footer}
            </p>
        </footer>
      </div>
    </div>
  );
}

// Components
function NavItem({ icon, label, active, onClick }: { icon: ReactNode, label: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all ${active ? 'bg-accent/10 border border-accent/20 text-accent' : 'bg-transparent text-white/40 hover:bg-white/5'}`}
    >
      <span className={active ? 'text-accent' : 'text-white/20'}>{icon}</span>
      <span className="text-sm font-bold tracking-tight">{label}</span>
    </button>
  );
}

function InputGroup({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder: string }) {
  return (
    <div className="space-y-2">
      <label className="text-[10px] text-white/40 uppercase font-bold tracking-[0.2em]">{label}</label>
      <input 
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-dark-bg border border-white/5 rounded-2xl p-4 text-white focus:outline-none focus:border-accent/50 placeholder:text-white/10"
      />
    </div>
  );
}

function CalcButton({ label, onClick, variant = 'number', className = '', icon }: { label: string, onClick: () => void, variant?: string, className?: string, icon?: ReactNode }) {
  const styles: any = {
    number: "bg-white/5 hover:bg-white/10 text-[#E0E0E0] border-transparent",
    operator: "bg-accent-dim hover:bg-accent/20 text-accent border-transparent",
    utility: "bg-white/5 hover:bg-white/10 text-white/60 border-transparent",
    accent: "bg-accent hover:opacity-90 text-[#000] border-transparent"
  };

  return (
    <motion.button
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={`
        h-[60px] flex items-center justify-center rounded-[18px] font-medium text-lg border transition-all duration-200
        ${styles[variant || 'number']}
        ${className}
      `}
    >
      {icon ? icon : label}
    </motion.button>
  );
}

