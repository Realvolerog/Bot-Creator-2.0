import React from 'react';

const BillingTab: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
       <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
       <h3 className="font-semibold text-lg">В разработке</h3>
       <p className="text-sm">Этот раздел скоро появится.</p>
    </div>
  );
};

export default BillingTab;