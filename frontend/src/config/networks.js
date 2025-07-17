// Network configuration for PulseNet
export const NETWORKS = {
  // Local Hardhat network
  localhost: {
    chainId: 1337,
    name: 'Localhost',
    rpcUrl: 'http://127.0.0.1:8545',
    blockExplorer: null,
    contracts: {
      PulseNet: '0xeeF4ce53de33bBcffcDbd849ba96322046062A98',
      PulseToken: '0x90Be5Bf44be09D3FC6516695DEad2B6DaD365e09'
    }
  },
  
  // Ethereum Sepolia Testnet
  sepolia: {
    chainId: 296,
    name: 'Hedera Testnet',
    rpcUrl: 'https://testnet.mirrornode.hedera.com/',
    blockExplorer: 'https://testnet.mirrornode.hedera.com/',
    contracts: {
      PulseNet: '0xeeF4ce53de33bBcffcDbd849ba96322046062A98', // Will be updated after deployment
      PulseToken: '0x90Be5Bf44be09D3FC6516695DEad2B6DaD365e09' // Will be updated after deployment
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
