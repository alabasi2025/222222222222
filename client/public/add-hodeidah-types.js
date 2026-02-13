/* global localStorage, window, CustomEvent, console */
// Script to add custom account types to Hodeidah unit
// Run this in browser console when on the AccountTypes page with UNIT-001 selected

(function() {
  const UNIT_001 = 'UNIT-001';
  const STORAGE_KEY = `account_types_${UNIT_001}`;
  
  const customTypes = [
    {
      id: "employee_operations",
      name: "employee_operations",
      label: "أعمال الموظفين",
      color: "bg-cyan-100 text-cyan-700 border-cyan-200",
      description: "حسابات أعمال الموظفين"
    },
    {
      id: "accountant_operations",
      name: "accountant_operations",
      label: "أعمال المحاسب",
      color: "bg-indigo-100 text-indigo-700 border-indigo-200",
      description: "حسابات أعمال المحاسب"
    },
    {
      id: "abbasi_operations",
      name: "abbasi_operations",
      label: "أعمال العباسي",
      color: "bg-pink-100 text-pink-700 border-pink-200",
      description: "حسابات أعمال العباسي"
    },
  ];
  
  const basicTypes = [
    {
      id: "asset",
      name: "asset",
      label: "أصول",
      color: "bg-blue-100 text-blue-700 border-blue-200",
      description: "الأصول المملوكة للشركة"
    },
    {
      id: "liability",
      name: "liability",
      label: "خصوم",
      color: "bg-rose-100 text-rose-700 border-rose-200",
      description: "الالتزامات المالية على الشركة"
    },
    {
      id: "equity",
      name: "equity",
      label: "حقوق ملكية",
      color: "bg-purple-100 text-purple-700 border-purple-200",
      description: "حقوق المالكين في الشركة"
    },
    {
      id: "income",
      name: "income",
      label: "إيرادات",
      color: "bg-emerald-100 text-emerald-700 border-emerald-200",
      description: "الإيرادات المكتسبة من العمليات"
    },
    {
      id: "expense",
      name: "expense",
      label: "مصروفات",
      color: "bg-amber-100 text-amber-700 border-amber-200",
      description: "المصروفات المتكبدة في العمليات"
    },
  ];
  
  // Get current types
  const stored = localStorage.getItem(STORAGE_KEY);
  let currentTypes = [...basicTypes];
  
  if (stored) {
    try {
      const parsed = JSON.parse(stored);
      currentTypes = [...basicTypes];
      parsed.forEach(type => {
        const existingIndex = currentTypes.findIndex(t => t.id === type.id);
        if (existingIndex >= 0) {
          currentTypes[existingIndex] = type;
        } else {
          currentTypes.push(type);
        }
      });
    } catch (e) {
      console.error('Error parsing stored types:', e);
    }
  }
  
  // Add custom types if missing
  const missingTypes = customTypes.filter(ct => 
    !currentTypes.some(t => t.id === ct.id)
  );
  
  if (missingTypes.length > 0) {
    const updatedTypes = [...currentTypes, ...missingTypes];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedTypes));
    
    // Dispatch event to notify components
    window.dispatchEvent(new CustomEvent('accountTypesUpdated', { 
      detail: { entityId: UNIT_001 } 
    }));
    
    console.log('✅ تم إضافة الأنواع بنجاح!');
    console.log('الأنواع المضافة:', missingTypes.map(t => t.label).join(', '));
    console.log('إجمالي الأنواع:', updatedTypes.length);
    console.log('جميع الأنواع:', updatedTypes.map(t => t.label).join(', '));
    
    // Reload the page to see changes
    window.location.reload();
  } else {
    console.log('✅ جميع الأنواع موجودة بالفعل!');
    console.log('الأنواع الحالية:', currentTypes.map(t => t.label).join(', '));
  }
})();
