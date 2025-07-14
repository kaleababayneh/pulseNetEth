import React from 'react';
import { useWallet } from '../contexts/WalletContext';
import { AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';

const NetworkStatus = () => {
  const { 
    chainId, 
    isConnected, 
    isCorrectNetwork, 
    switchToCorrectNetwork, 
    getCurrentNetwork 
  } = useWallet();

  if (!isConnected) return null;

  const network = getCurrentNetwork();
  const isCorrect = isCorrectNetwork();

  if (isCorrect) {
    return (
        <></>
    //   <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
       
    //     <div className="flex items-center space-x-3">
            
    //       <CheckCircle className="h-5 w-5 text-green-600" />
    //       <div>
    //         <p className="text-sm font-medium text-green-800">
    //           Connected to {network.name}
    //         </p>
    //         <p className="text-xs text-green-600">
    //           Chain ID: {network.chainId}
    //         </p>
    //       </div> */}
    //       {network.blockExplorer && (
    //         <a
    //           href={network.blockExplorer}
    //           target="_blank"
    //           rel="noopener noreferrer"
    //           className="text-green-600 hover:text-green-700"
    //         >
    //           <ExternalLink className="h-4 w-4" />
    //         </a>
    //       )}
    //     </div>
    //   </div>
    );
  }

  return (
    <div className="card bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          <div>
            <p className="text-sm font-medium text-yellow-800">
              Wrong Network Detected
            </p>
            <p className="text-xs text-yellow-600">
              Please switch to {network.name} (Chain ID: {network.chainId})
            </p>
            <p className="text-xs text-yellow-500">
              Current: Chain ID {chainId}
            </p>
          </div>
        </div>
        <button
          onClick={switchToCorrectNetwork}
          className="px-4 py-2 bg-yellow-600 text-white text-sm font-medium rounded-lg hover:bg-yellow-700 transition-colors"
        >
          Switch Network
        </button>
      </div>
    </div>
  );
};

export default NetworkStatus;
