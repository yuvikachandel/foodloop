import { useState } from 'react';
import { X, AlertCircle } from 'lucide-react';
import { supabase, CATEGORY_LABELS, type FoodCategory, type FoodListing } from '@/lib/supabase';
import { useAuth } from '@/lib/auth';

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60000);
  return local.toISOString().slice(0, 16);
}

interface Props {
  onClose: () => void;
  onSaved: () => void;
  editing?: FoodListing | null;
}

export function ListingForm({ onClose, onSaved, editing }: Props) {
  const { profile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    food_name: editing?.food_name ?? '',
    category: editing?.category ?? ('prepared' as FoodCategory),
    quantity: editing?.quantity ?? '',
    quantity_value: editing?.quantity_value?.toString() ?? '',
    unit: editing?.unit ?? 'meals',
    preparation_time: editing ? toLocalInput(editing.preparation_time) : '',
    pickup_deadline: editing ? toLocalInput(editing.pickup_deadline) : '',
    location: editing?.location ?? profile?.location ?? '',
    description: editing?.description ?? '',
  });

  function update(key: string, value: string) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const payload = {
      food_name: form.food_name,
      category: form.category,
      quantity: form.quantity,
      quantity_value: form.quantity_value ? parseInt(form.quantity_value, 10) : null,
      unit: form.unit || null,
      preparation_time: new Date(form.preparation_time).toISOString(),
      pickup_deadline: new Date(form.pickup_deadline).toISOString(),
      location: form.location,
      description: form.description || null,
    };

    let result;
    if (editing) {
      result = await supabase.from('food_listings').update(payload).eq('id', editing.id);
    } else {
      result = await supabase.from('food_listings').insert(payload);
    }

    setLoading(false);
    if (result.error) {
      setError(result.error.message);
    } else {
      onSaved();
      onClose();
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-forest-950/50 backdrop-blur-sm animate-fade-in">
      <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 animate-scale-in">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-forest-900">
            {editing ? 'Edit Listing' : 'List Surplus Food'}
          </h2>
          <button onClick={onClose} className="p-2 rounded-lg text-forest-500 hover:bg-forest-50">
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-start gap-2 rounded-xl bg-cream-100 border border-cream-300 p-3 text-sm text-forest-800">
              <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="label">Food Name</label>
              <input
                type="text"
                required
                value={form.food_name}
                onChange={(e) => update('food_name', e.target.value)}
                className="input"
                placeholder="e.g. Cooked Rice & Curry"
              />
            </div>

            <div>
              <label className="label">Category</label>
              <select
                value={form.category}
                onChange={(e) => update('category', e.target.value)}
                className="input"
              >
                {Object.entries(CATEGORY_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="label">Quantity (description)</label>
              <input
                type="text"
                required
                value={form.quantity}
                onChange={(e) => update('quantity', e.target.value)}
                className="input"
                placeholder="e.g. 50 meals"
              />
            </div>

            <div>
              <label className="label">Numeric Quantity (for matching)</label>
              <input
                type="number"
                min="1"
                value={form.quantity_value}
                onChange={(e) => update('quantity_value', e.target.value)}
                className="input"
                placeholder="50"
              />
            </div>

            <div>
              <label className="label">Unit</label>
              <select value={form.unit} onChange={(e) => update('unit', e.target.value)} className="input">
                <option value="meals">meals</option>
                <option value="kg">kg</option>
                <option value="boxes">boxes</option>
                <option value="litres">litres</option>
                <option value="units">units</option>
              </select>
            </div>

            <div>
              <label className="label">Preparation Time</label>
              <input
                type="datetime-local"
                required
                value={form.preparation_time}
                onChange={(e) => update('preparation_time', e.target.value)}
                className="input"
              />
            </div>

            <div>
              <label className="label">Pickup Deadline</label>
              <input
                type="datetime-local"
                required
                value={form.pickup_deadline}
                onChange={(e) => update('pickup_deadline', e.target.value)}
                className="input"
              />
              <p className="text-xs text-forest-500 mt-1">Food must be picked up before this time.</p>
            </div>

            <div className="sm:col-span-2">
              <label className="label">Pickup Location</label>
              <input
                type="text"
                required
                value={form.location}
                onChange={(e) => update('location', e.target.value)}
                className="input"
                placeholder="Address or area"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="label">Description (optional)</label>
              <textarea
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
                className="input min-h-[80px] resize-y"
                placeholder="Any details about ingredients, allergens, or handling instructions"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              {loading ? 'Saving...' : editing ? 'Update Listing' : 'Publish Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
