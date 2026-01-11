import React from 'react';

const Wellcome = () => {
  return (
    <div className="w-[400px] h-[400px] flex items-center justify-center border rounded-lg border-secondary-brand">
      <h1 className="text-3xl text-primary-brand text-center font-bold">
        İş Takip Uygulamasına <br />
        <span className="text-secondary-brand">Hoşgeldiniz !</span>{' '}
      </h1>
    </div>
  );
};

export default Wellcome;
