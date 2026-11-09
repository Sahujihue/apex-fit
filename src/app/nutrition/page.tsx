'use client';

import React, { useEffect, useState } from 'react';
import {
  Utensils,
  Plus,
  Search,
  Camera,
  Trash2,
  Droplets,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Flame,
  CheckCircle2,
  AlertCircle,
  QrCode,
  Barcode,
  X,
  RefreshCw,
  Zap
} from 'lucide-react';
import AppLayout from '@/components/layout/AppLayout';

export default function NutritionPage() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Search & Logging Modal State
  const [showLogModal, setShowLogModal] = useState(false);
  const [activeMealType, setActiveMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [selectedFood, setSelectedFood] = useState<any>(null);
  const [servings, setServings] = useState(1.0);

  // Custom Food Form
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customCal, setCustomCal] = useState(250);
  const [customP, setCustomP] = useState(20);
  const [customC, setCustomC] = useState(25);
  const [customF, setCustomF] = useState(8);

  // AI Meal Scanner State
  const [showAIScanner, setShowAIScanner] = useState(false);
  const [aiMealPrompt, setAiMealPrompt] = useState('');
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);

  // Food Barcode Scanner State
  const [showBarcodeScanner, setShowBarcodeScanner] = useState(false);
  const [barcodeInput, setBarcodeInput] = useState('');
  const [barcodeSearching, setBarcodeSearching] = useState(false);
  const [scannedProduct, setScannedProduct] = useState<any>(null);
  const [barcodeError, setBarcodeError] = useState('');

  const fetchNutrition = async () => {
    try {
      const res = await fetch(`/api/nutrition?date=${selectedDate}`);
      const json = await res.json();
      setData(json);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNutrition();
  }, [selectedDate]);

  const searchFoods = async (query: string) => {
    setSearchQuery(query);
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    try {
      const res = await fetch(`/api/nutrition?search=${encodeURIComponent(query)}`);
      const json = await res.json();
      setSearchResults(json.foods || []);
    } catch (e) {
      console.error(e);
    }
  };

  const handleLogFood = async () => {
    if (!selectedFood && !isCustomMode) return;

    const payload = isCustomMode
      ? {
          date: selectedDate,
          mealType: activeMealType,
          foodName: customName,
          servings: 1.0,
          calories: Number(customCal),
          protein: Number(customP),
          carbs: Number(customC),
          fat: Number(customF),
          fiber: 0
        }
      : {
          date: selectedDate,
          mealType: activeMealType,
          foodName: selectedFood.name,
          servings: Number(servings),
          calories: Math.round(selectedFood.calories * servings),
          protein: Math.round(selectedFood.protein * servings),
          carbs: Math.round(selectedFood.carbs * servings),
          fat: Math.round(selectedFood.fat * servings),
          fiber: Math.round(selectedFood.fiber * servings)
        };

    try {
      const res = await fetch('/api/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setShowLogModal(false);
        setSelectedFood(null);
        setIsCustomMode(false);
        setSearchQuery('');
        setSearchResults([]);
        fetchNutrition();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteMealItem = async (id: string) => {
    try {
      const res = await fetch(`/api/nutrition?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        fetchNutrition();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleAIMealScan = async () => {
    if (!aiMealPrompt.trim()) return;
    setAiAnalyzing(true);
    try {
      const res = await fetch('/api/coach/meal-scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: aiMealPrompt })
      });
      const json = await res.json();
      if (json.analysis) {
        setAiResult(json.analysis);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setAiAnalyzing(false);
    }
  };

  const logAIAnalyzedMeal = async () => {
    if (!aiResult) return;
    try {
      await fetch('/api/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          mealType: activeMealType,
          foodName: aiResult.foodName,
          servings: 1.0,
          calories: aiResult.calories,
          protein: aiResult.protein,
          carbs: aiResult.carbs,
          fat: aiResult.fat,
          fiber: aiResult.fiber
        })
      });
      setShowAIScanner(false);
      setAiResult(null);
      setAiMealPrompt('');
      fetchNutrition();
    } catch (e) {
      console.error(e);
    }
  };

  const KNOWN_BARCODES: Record<string, any> = {
    '748927028669': { name: 'Optimum Nutrition Gold Standard 100% Whey', brand: 'Optimum Nutrition', serving: '1 scoop (30.4g)', calories: 120, protein: 24, carbs: 3, fat: 1.5, fiber: 0 },
    '030000010204': { name: 'Quaker 100% Whole Grain Rolled Oats', brand: 'Quaker', serving: '1/2 cup (40g)', calories: 150, protein: 5, carbs: 27, fat: 3, fiber: 4 },
    '894700010045': { name: 'Chobani Non-Fat Plain Greek Yogurt', brand: 'Chobani', serving: '3/4 cup (170g)', calories: 100, protein: 17, carbs: 6, fat: 0.7, fiber: 0 },
    '048123456789': { name: 'Organic Creamy Peanut Butter', brand: 'Kirkland Signature', serving: '2 tbsp (32g)', calories: 190, protein: 8, carbs: 7, fat: 16, fiber: 3 },
    '8906067026527': { name: 'MuscleBlaze Biozyme Performance Whey', brand: 'MuscleBlaze', serving: '1 scoop (36g)', calories: 138, protein: 25, carbs: 3.2, fat: 2.2, fiber: 0 },
    '8901262010054': { name: 'Amul High Protein Buttermilk', brand: 'Amul', serving: '200 ml pouch', calories: 95, protein: 15, carbs: 5.6, fat: 1.2, fiber: 0 }
  };

  const handleLookupBarcode = async (codeToSearch?: string) => {
    const code = (codeToSearch || barcodeInput).trim();
    if (!code) return;
    setBarcodeSearching(true);
    setBarcodeError('');
    setScannedProduct(null);

    // 1. Check verified fast local database first
    if (KNOWN_BARCODES[code]) {
      setScannedProduct(KNOWN_BARCODES[code]);
      setBarcodeSearching(false);
      return;
    }

    // 2. Query OpenFoodFacts Global database
    try {
      const res = await fetch(`https://world.openfoodfacts.org/api/v0/product/${code}.json`);
      const json = await res.json();
      if (json.status === 1 && json.product) {
        const p = json.product;
        const nutriments = p.nutriments || {};
        setScannedProduct({
          name: p.product_name || 'Scanned Product',
          brand: p.brands || 'Commercial Product',
          serving: p.serving_size || '100g serving',
          calories: Math.round(nutriments['energy-kcal_100g'] || nutriments['energy-kcal'] || 150),
          protein: Math.round(nutriments.proteins_100g || nutriments.proteins || 5),
          carbs: Math.round(nutriments.carbohydrates_100g || nutriments.carbohydrates || 20),
          fat: Math.round(nutriments.fat_100g || nutriments.fat || 3),
          fiber: Math.round(nutriments.fiber_100g || nutriments.fiber || 1)
        });
      } else {
        setBarcodeError('Barcode not found in OpenFoodFacts database. Try one of the verified sample barcodes below.');
      }
    } catch {
      setBarcodeError('Could not reach food database. Please check your network connection.');
    } finally {
      setBarcodeSearching(false);
    }
  };

  const handleLogScannedProduct = async () => {
    if (!scannedProduct) return;
    try {
      await fetch('/api/nutrition', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: selectedDate,
          mealType: activeMealType,
          foodName: `${scannedProduct.name} (${scannedProduct.brand})`,
          servings: 1.0,
          calories: scannedProduct.calories,
          protein: scannedProduct.protein,
          carbs: scannedProduct.carbs,
          fat: scannedProduct.fat,
          fiber: scannedProduct.fiber
        })
      });
      setShowBarcodeScanner(false);
      setScannedProduct(null);
      setBarcodeInput('');
      fetchNutrition();
    } catch (e) {
      console.error(e);
    }
  };

  const shiftDate = (days: number) => {
    const cur = new Date(selectedDate);
    cur.setDate(cur.getDate() + days);
    setSelectedDate(cur.toISOString().split('T')[0]);
  };

  if (loading || !data) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-10 h-10 border-4 border-emerald-500/20 border-t-emerald-400 rounded-full animate-spin"></div>
        </div>
      </AppLayout>
    );
  }

  const mealCategories: ('breakfast' | 'lunch' | 'dinner' | 'snack')[] = ['breakfast', 'lunch', 'dinner', 'snack'];

  return (
    <AppLayout>
      <div className="space-y-6">
        {/* Header & Date Selector */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Utensils className="w-6 h-6 text-emerald-400" />
              Nutrition & Macro Tracker
            </h1>
            <p className="text-xs text-zinc-400">Precision caloric intake, macronutrient ratios, and AI food analysis</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => {
                setShowBarcodeScanner(true);
                setScannedProduct(null);
                setBarcodeInput('');
                setBarcodeError('');
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/40 text-xs font-bold transition-all shadow-glow-blue"
            >
              <QrCode className="w-4 h-4 text-blue-400" />
              Scan Barcode
            </button>

            <button
              onClick={() => setShowAIScanner(true)}
              className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-purple-600/20 hover:bg-purple-600/30 text-purple-300 border border-purple-500/40 text-xs font-bold transition-all shadow-glow-purple"
            >
              <Sparkles className="w-4 h-4 text-purple-400" />
              AI Meal Scan
            </button>

            {/* Date Nav */}
            <div className="flex items-center gap-2 bg-zinc-900 px-3 py-1.5 rounded-2xl border border-zinc-800">
              <button onClick={() => shiftDate(-1)} className="p-1 rounded-lg text-zinc-400 hover:text-white">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-bold text-white min-w-[90px] text-center">
                {selectedDate === new Date().toISOString().split('T')[0] ? 'Today' : selectedDate}
              </span>
              <button onClick={() => shiftDate(1)} className="p-1 rounded-lg text-zinc-400 hover:text-white">
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Top Summary: Caloric & Macro Gauge Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Total Calories */}
          <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 glow-card">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">CALORIES</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white">{data.consumed.calories}</span>
              <span className="text-xs text-zinc-400">/ {data.targets.calories} kcal</span>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full"
                style={{ width: `${Math.min((data.consumed.calories / data.targets.calories) * 100, 100)}%` }}
              />
            </div>
            <span className="text-[11px] text-zinc-400 mt-2 block">
              {data.targets.calories - data.consumed.calories > 0
                ? `${data.targets.calories - data.consumed.calories} kcal remaining`
                : `${Math.abs(data.targets.calories - data.consumed.calories)} kcal over budget`}
            </span>
          </div>

          {/* Protein */}
          <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 glow-card">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">PROTEIN</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white">{data.consumed.protein}g</span>
              <span className="text-xs text-zinc-400">/ {data.targets.protein}g</span>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-emerald-400 rounded-full"
                style={{ width: `${Math.min((data.consumed.protein / data.targets.protein) * 100, 100)}%` }}
              />
            </div>
            <span className="text-[11px] text-zinc-400 mt-2 block">
              {Math.round((data.consumed.protein / data.targets.protein) * 100)}% of goal hit
            </span>
          </div>

          {/* Carbs */}
          <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 glow-card">
            <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">CARBOHYDRATES</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white">{data.consumed.carbs}g</span>
              <span className="text-xs text-zinc-400">/ {data.targets.carbs}g</span>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-cyan-400 rounded-full"
                style={{ width: `${Math.min((data.consumed.carbs / data.targets.carbs) * 100, 100)}%` }}
              />
            </div>
            <span className="text-[11px] text-zinc-400 mt-2 block">
              {Math.round((data.consumed.carbs / data.targets.carbs) * 100)}% of goal hit
            </span>
          </div>

          {/* Fats */}
          <div className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800 glow-card">
            <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">HEALTHY FATS</span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-white">{data.consumed.fat}g</span>
              <span className="text-xs text-zinc-400">/ {data.targets.fat}g</span>
            </div>
            <div className="w-full h-2 bg-zinc-800 rounded-full mt-3 overflow-hidden">
              <div
                className="h-full bg-purple-400 rounded-full"
                style={{ width: `${Math.min((data.consumed.fat / data.targets.fat) * 100, 100)}%` }}
              />
            </div>
            <span className="text-[11px] text-zinc-400 mt-2 block">
              {Math.round((data.consumed.fat / data.targets.fat) * 100)}% of goal hit
            </span>
          </div>
        </div>

        {/* Meal Logs by Category */}
        <div className="space-y-4">
          {mealCategories.map((type) => {
            const items = data.meals[type] || [];
            const subtotalCal = items.reduce((acc: number, cur: any) => acc + (cur.calories || 0), 0);
            const subtotalP = items.reduce((acc: number, cur: any) => acc + (cur.protein || 0), 0);

            return (
              <div key={type} className="p-5 rounded-3xl bg-zinc-900/80 border border-zinc-800">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-800/80">
                  <div className="flex items-center gap-3">
                    <span className="capitalize font-bold text-base text-white">{type}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                      {subtotalCal} kcal • {subtotalP}g protein
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setActiveMealType(type);
                      setShowLogModal(true);
                    }}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-zinc-800 hover:bg-emerald-500/20 text-xs font-bold text-zinc-200 hover:text-emerald-400 border border-zinc-700 transition-all"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Food
                  </button>
                </div>

                {items.length === 0 ? (
                  <p className="text-xs text-zinc-400 italic py-3">No foods logged for {type} yet.</p>
                ) : (
                  <div className="divide-y divide-zinc-800/50">
                    {items.map((item: any) => (
                      <div key={item.id} className="py-2.5 flex items-center justify-between">
                        <div>
                          <p className="text-sm font-semibold text-white">{item.food_name}</p>
                          <p className="text-xs text-zinc-400">
                            {item.servings} serving • {item.calories} kcal • P: {item.protein}g | C: {item.carbs}g | F: {item.fat}g
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteMealItem(item.id)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Food Search & Log Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-zinc-900 border border-zinc-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white capitalize">Add to {activeMealType}</h3>
              <button onClick={() => setShowLogModal(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setIsCustomMode(false)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  !isCustomMode ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                Search Food Database
              </button>
              <button
                onClick={() => setIsCustomMode(true)}
                className={`flex-1 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  isCustomMode ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-800 text-zinc-400'
                }`}
              >
                Custom Food Entry
              </button>
            </div>

            {!isCustomMode ? (
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => searchFoods(e.target.value)}
                    placeholder="Search e.g. Chicken, Oats, Eggs, Salmon, Rice..."
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                  {searchResults.map((f: any) => (
                    <div
                      key={f.id}
                      onClick={() => setSelectedFood(f)}
                      className={`p-3 rounded-xl border cursor-pointer transition-all ${
                        selectedFood?.id === f.id
                          ? 'bg-emerald-950/30 border-emerald-500 text-white'
                          : 'bg-zinc-950/60 border-zinc-800 text-zinc-300 hover:bg-zinc-800'
                      }`}
                    >
                      <div className="flex justify-between items-baseline">
                        <span className="text-xs font-bold text-white">{f.name}</span>
                        <span className="text-xs font-mono font-bold text-emerald-400">{f.calories} kcal</span>
                      </div>
                      <span className="text-[10px] text-zinc-400 block mt-0.5">
                        {f.serving_size} • P: {f.protein}g | C: {f.carbs}g | F: {f.fat}g
                      </span>
                    </div>
                  ))}
                  {searchQuery && searchResults.length === 0 && (
                    <p className="text-xs text-zinc-400 text-center py-4">No matching foods found. Switch to "Custom Food Entry" to add your own.</p>
                  )}
                </div>

                {selectedFood && (
                  <div className="p-3 rounded-xl bg-zinc-950 border border-zinc-800 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-white">Servings</p>
                      <p className="text-[10px] text-zinc-400">Total: {Math.round(selectedFood.calories * servings)} kcal</p>
                    </div>
                    <input
                      type="number"
                      step="0.5"
                      min="0.5"
                      value={servings}
                      onChange={(e) => setServings(parseFloat(e.target.value) || 1.0)}
                      className="w-20 px-2 py-1 rounded-lg bg-zinc-900 border border-zinc-700 text-sm font-bold text-center text-white"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-zinc-300">Food Name</label>
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Homemade Beef Chili"
                    className="w-full px-3 py-2 mt-1 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-semibold text-zinc-300">Calories (kcal)</label>
                    <input
                      type="number"
                      value={customCal}
                      onChange={(e) => setCustomCal(Number(e.target.value))}
                      className="w-full px-3 py-2 mt-1 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-300">Protein (g)</label>
                    <input
                      type="number"
                      value={customP}
                      onChange={(e) => setCustomP(Number(e.target.value))}
                      className="w-full px-3 py-2 mt-1 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-300">Carbs (g)</label>
                    <input
                      type="number"
                      value={customC}
                      onChange={(e) => setCustomC(Number(e.target.value))}
                      className="w-full px-3 py-2 mt-1 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-zinc-300">Fat (g)</label>
                    <input
                      type="number"
                      value={customF}
                      onChange={(e) => setCustomF(Number(e.target.value))}
                      className="w-full px-3 py-2 mt-1 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white"
                    />
                  </div>
                </div>
              </div>
            )}

            <button
              onClick={handleLogFood}
              disabled={!isCustomMode && !selectedFood}
              className="w-full py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-zinc-950 font-bold text-xs transition-all shadow-glow-green"
            >
              Log to {activeMealType}
            </button>
          </div>
        </div>
      )}

      {/* AI Meal Scanner Modal */}
      {showAIScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg p-6 rounded-3xl bg-zinc-900 border border-zinc-700 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                AI Meal Photo & Nutrition Scanner
              </h3>
              <button onClick={() => setShowAIScanner(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-zinc-300">Describe or type your meal dish:</label>
                <textarea
                  value={aiMealPrompt}
                  onChange={(e) => setAiMealPrompt(e.target.value)}
                  placeholder="e.g. 150g grilled sirloin steak with 1 cup mashed potatoes and steamed asparagus..."
                  className="w-full px-3 py-2 mt-1 rounded-xl bg-zinc-950 border border-zinc-800 text-sm text-white focus:outline-none focus:border-purple-500"
                  rows={3}
                />
              </div>

              {/* Sample Quick Buttons */}
              <div className="flex flex-wrap gap-1.5 text-xs">
                <button onClick={() => setAiMealPrompt('Grilled chicken Caesar salad with olive oil dressing')} className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white">
                  Chicken Caesar
                </button>
                <button onClick={() => setAiMealPrompt('Oatmeal bowl with whey protein, blueberries and peanut butter')} className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white">
                  Protein Oatmeal
                </button>
                <button onClick={() => setAiMealPrompt('Grilled salmon fillet with baked sweet potato and broccoli')} className="px-2.5 py-1 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white">
                  Salmon & Sweet Potato
                </button>
              </div>

              <button
                onClick={handleAIMealScan}
                disabled={aiAnalyzing || !aiMealPrompt.trim()}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-emerald-500 hover:from-purple-500 hover:to-emerald-400 disabled:opacity-50 text-white font-bold text-xs transition-all shadow-glow-purple flex items-center justify-center gap-2"
              >
                {aiAnalyzing ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                    Analyzing Nutrition Breakdown...
                  </>
                ) : (
                  <>
                    <Camera className="w-4 h-4" />
                    Estimate Nutrition with AI
                  </>
                )}
              </button>

              {aiResult && (
                <div className="p-4 rounded-2xl bg-zinc-950 border border-purple-500/40 space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-sm font-bold text-white">{aiResult.foodName}</span>
                    <span className="text-base font-extrabold text-emerald-400">{aiResult.calories} kcal</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                      <span className="text-[10px] text-zinc-400 block">PROTEIN</span>
                      <strong className="text-emerald-400">{aiResult.protein}g</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                      <span className="text-[10px] text-zinc-400 block">CARBS</span>
                      <strong className="text-cyan-400">{aiResult.carbs}g</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                      <span className="text-[10px] text-zinc-400 block">FAT</span>
                      <strong className="text-purple-400">{aiResult.fat}g</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                      <span className="text-[10px] text-zinc-400 block">FIBER</span>
                      <strong className="text-amber-400">{aiResult.fiber}g</strong>
                    </div>
                  </div>

                  <p className="text-[11px] text-zinc-400 italic">
                    {aiResult.disclaimer}
                  </p>

                  <button
                    onClick={logAIAnalyzedMeal}
                    className="w-full py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs"
                  >
                    Log Estimated Meal
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Food Barcode Scanner Modal */}
      {showBarcodeScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
          <div className="bg-zinc-900 border border-blue-500/40 rounded-3xl w-full max-w-lg overflow-hidden shadow-2xl relative">
            <div className="p-6 border-b border-zinc-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <QrCode className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-white">Food Barcode Nutrition Scanner</h3>
                  <p className="text-[11px] text-zinc-400">Scan packaged foods for instant macro & calorie breakdown</p>
                </div>
              </div>
              <button onClick={() => setShowBarcodeScanner(false)} className="text-zinc-400 hover:text-white">✕</button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {/* Scan / Input Box */}
              <div>
                <label className="text-zinc-300 font-semibold block mb-1">Enter or Scan Barcode Number (UPC / EAN)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={barcodeInput}
                    onChange={(e) => setBarcodeInput(e.target.value)}
                    placeholder="e.g. 748927028669 or 030000010204"
                    className="flex-1 px-3.5 py-2.5 rounded-xl bg-zinc-950 border border-zinc-700 font-mono text-white text-xs focus:border-blue-400"
                  />
                  <button
                    onClick={() => handleLookupBarcode()}
                    disabled={barcodeSearching}
                    className="px-4 py-2.5 rounded-xl bg-blue-500 hover:bg-blue-400 text-zinc-950 font-bold text-xs transition-all shadow-sm flex items-center gap-1.5"
                  >
                    {barcodeSearching ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
                    Lookup
                  </button>
                </div>
              </div>

              {/* Quick Sample Barcodes Picker */}
              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 block">
                  ⚡ 1-Click Test Packaged Barcodes:
                </span>
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => { setBarcodeInput('748927028669'); handleLookupBarcode('748927028669'); }}
                    className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left text-[11px] text-zinc-300 transition-colors"
                  >
                    🥛 <strong>Optimum Nutrition Whey</strong>
                    <span className="block text-[10px] text-zinc-500 font-mono">748927028669</span>
                  </button>
                  <button
                    onClick={() => { setBarcodeInput('030000010204'); handleLookupBarcode('030000010204'); }}
                    className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left text-[11px] text-zinc-300 transition-colors"
                  >
                    🥣 <strong>Quaker Rolled Oats</strong>
                    <span className="block text-[10px] text-zinc-500 font-mono">030000010204</span>
                  </button>
                  <button
                    onClick={() => { setBarcodeInput('894700010045'); handleLookupBarcode('894700010045'); }}
                    className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left text-[11px] text-zinc-300 transition-colors"
                  >
                    🍦 <strong>Chobani Greek Yogurt</strong>
                    <span className="block text-[10px] text-zinc-500 font-mono">894700010045</span>
                  </button>
                  <button
                    onClick={() => { setBarcodeInput('8901262010054'); handleLookupBarcode('8901262010054'); }}
                    className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-left text-[11px] text-zinc-300 transition-colors"
                  >
                    🥛 <strong>Amul High Protein Lassi</strong>
                    <span className="block text-[10px] text-zinc-500 font-mono">8901262010054</span>
                  </button>
                </div>
              </div>

              {barcodeError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{barcodeError}</span>
                </div>
              )}

              {/* Scanned Nutrition Result Card */}
              {scannedProduct && (
                <div className="p-4 rounded-2xl bg-zinc-950 border border-emerald-500/50 space-y-3 animate-fade-in">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">{scannedProduct.brand}</span>
                      <h4 className="text-sm font-bold text-white mt-0.5">{scannedProduct.name}</h4>
                      <span className="text-[11px] text-zinc-400">Serving: {scannedProduct.serving}</span>
                    </div>
                    <span className="text-lg font-black font-mono text-emerald-400">{scannedProduct.calories} kcal</span>
                  </div>

                  <div className="grid grid-cols-4 gap-2 text-center text-xs">
                    <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                      <span className="text-[10px] text-zinc-400 block">PROTEIN</span>
                      <strong className="text-emerald-400">{scannedProduct.protein}g</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                      <span className="text-[10px] text-zinc-400 block">CARBS</span>
                      <strong className="text-cyan-400">{scannedProduct.carbs}g</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                      <span className="text-[10px] text-zinc-400 block">FAT</span>
                      <strong className="text-purple-400">{scannedProduct.fat}g</strong>
                    </div>
                    <div className="p-2 rounded-xl bg-zinc-900 border border-zinc-800">
                      <span className="text-[10px] text-zinc-400 block">FIBER</span>
                      <strong className="text-amber-400">{scannedProduct.fiber}g</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <select
                      value={activeMealType}
                      onChange={(e) => setActiveMealType(e.target.value as any)}
                      className="px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-700 text-xs text-white"
                    >
                      <option value="breakfast">Breakfast</option>
                      <option value="lunch">Lunch</option>
                      <option value="dinner">Dinner</option>
                      <option value="snack">Snack</option>
                    </select>

                    <button
                      onClick={handleLogScannedProduct}
                      className="flex-1 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs transition-all shadow-glow-green"
                    >
                      Log to {activeMealType.toUpperCase()}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
