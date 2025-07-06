/**
 * @file A form component for inputting the athlete's nutrition plan,
 * including macronutrients and health supplements.
 */
import React from 'react';
import { useTranslation } from 'react-i18next';
import { NutritionPlan } from '../shared/types';
import { Flame, Beef, Wheat, Droplets, FlaskConical } from 'lucide-react';
import { SUPPLEMENT_OPTIONS } from '../constants';

interface NutritionFormProps {
  nutrition: NutritionPlan;
  onChange: (nutrition: NutritionPlan) => void;
}

export const NutritionForm: React.FC<NutritionFormProps> = ({ nutrition, onChange }) => {
  const { t } = useTranslation();
  /**
   * Handles changes for the numeric macronutrient inputs.
   */
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange({ ...nutrition, [e.target.name]: Number(e.target.value) });
  };
  
  /**
   * Handles changes for the supplement checkboxes,
   * adding or removing supplements from the array.
   */
  const handleSupplementChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value, checked } = e.target;
    const currentSupplements = nutrition.supplements;
    if (checked) {
      onChange({ ...nutrition, supplements: [...currentSupplements, value] });
    } else {
      onChange({ ...nutrition, supplements: currentSupplements.filter(s => s !== value) });
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-brand-green flex items-center gap-2"><Flame size={20}/> {t('forms.nutrition.title')}</h2>
      {/* Calorie input */}
      <div>
        <label className="block text-sm font-medium text-gray-400 mb-1">{t('forms.nutrition.calories')}</label>
        <input type="number" name="calories" value={nutrition.calories} onChange={handleInputChange} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-brand-green focus:outline-none"/>
      </div>
      {/* Macronutrient inputs */}
      <div className="grid grid-cols-3 gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-1"><Beef size={14}/> {t('forms.nutrition.protein')}</label>
          <input type="number" name="protein" value={nutrition.protein} onChange={handleInputChange} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-brand-green focus:outline-none"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-1"><Wheat size={14}/> {t('forms.nutrition.carbs')}</label>
          <input type="number" name="carbs" value={nutrition.carbs} onChange={handleInputChange} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-brand-green focus:outline-none"/>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1 flex items-center gap-1"><Droplets size={14}/> {t('forms.nutrition.fat')}</label>
          <input type="number" name="fat" value={nutrition.fat} onChange={handleInputChange} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 focus:ring-2 focus:ring-brand-green focus:outline-none"/>
        </div>
      </div>
      {/* Health supplements selection */}
       <div>
        <label className="block text-sm font-medium text-gray-400 mb-2 flex items-center gap-2"><FlaskConical size={16}/> {t('forms.nutrition.supplements')}</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
            {SUPPLEMENT_OPTIONS.map(optionKey => (
                <label key={optionKey} className="flex items-center space-x-2 text-sm text-gray-300 cursor-pointer">
                    <input
                        type="checkbox"
                        value={optionKey}
                        checked={nutrition.supplements.includes(optionKey)}
                        onChange={handleSupplementChange}
                        className="form-checkbox h-4 w-4 rounded bg-gray-600 border-gray-500 text-brand-green focus:ring-brand-green"
                    />
                    <span>{t(optionKey)}</span>
                </label>
            ))}
        </div>
      </div>
    </div>
  );
};
