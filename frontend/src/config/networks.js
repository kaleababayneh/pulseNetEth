// Network configuration for PulseNet
export const NETWORKS = {
  // Local Hardhat network
  localhost: {
    chainId: 1337,
    name: 'Localhost',
    rpcUrl: 'http://127.0.0.1:8545',
    blockExplorer: null,
    contracts: {
      PulseNet: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
      PulseToken: '0x5FbDB2315678afecb367f032d93F642f64180aa3'
    }
  },
  
  // Ethereum Sepolia Testnet
  sepolia: {
    chainId: 11155111,
    name: 'Sepolia Testnet',
    rpcUrl: 'https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID',
    blockExplorer: 'https://sepolia.etherscan.io',
    contracts: {
      PulseNet: '0x0000000000000000000000000000000000000000', // Will be updated after deployment
      PulseToken: '0x0000000000000000000000000000000000000000' // Will be updated after deployment
    }
  }
};

// Current active network - change this to switch networks
export const ACTIVE_NETWORK = 'sepolia'; // Change from 'localhost' to 'sepolia'

export const getCurrentNetwork = () => {
  return NETWORKS[ACTIVE_NETWORK];
};

export const getContractAddress = (contractName) => {
  const network = getCurrentNetwork();
  return network.contracts[contractName];
};

export const isCorrectNetwork = (chainId) => {
  const network = getCurrentNetwork();
  return parseInt(chainId) === network.chainId;
};
