import React from 'react';

const Wellcome = () => {
  return (
    <div className="lg:w-[400px] md:w-[400px] h-[300px] w-[300px] lg:h-[400px] md:h-[400px] h-[300px] w-[300px] flex items-center justify-center border rounded-lg border-secondary-brand">
      <h1 className="text-3xl text-primary-brand dark:text-slate-50 text-center font-bold">
        İş Takip Uygulamasına <br />
        <span className="text-secondary-brand">Hoşgeldiniz !</span>{' '}
      </h1>
    </div>
  );
};

export default Wellcome;
