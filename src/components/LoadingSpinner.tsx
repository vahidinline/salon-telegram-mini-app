import Lottie from 'lottie-react';
import React from 'react';
import Loading from '../assets/img/loading.json';

const LoadingSpinner: React.FC = () => {
  return (
    // <div className="flex items-center justify-center min-h-[200px]">
    //   <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
    // </div>
    <div
      style={{
        // height: '100%',
        // width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        // backgroundColor: '#fff', // or Telegram theme background
      }}>
      <Lottie
        animationData={Loading}
        loop={true} // or false if you want it to play once
        style={{ width: '100%', height: '100%' }}
      />
    </div>
  );
};

export default LoadingSpinner;
