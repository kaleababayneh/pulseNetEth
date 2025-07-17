import React, { createContext, useContext, useState, useEffect } from 'react';
import { ethers } from 'ethers';
import toast from 'react-hot-toast';
import { getCurrentNetwork, getContractAddress, isCorrectNetwork } from '../config/networks';

const WalletContext = createContext();

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [chainId, setChainId] = useState(null);

  // Check if wallet is already connected on page load
  useEffect(() => {
    checkWalletConnection();
    
    // Listen for account changes
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
      window.ethereum.on('chainChanged', handleChainChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        window.ethereum.removeListener('chainChanged', handleChainChanged);
      }
    };
  }, []);

  const checkWalletConnection = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_accounts' });
        if (accounts.length > 0) {
          await connectWallet();
        }
      } catch (error) {
        console.error('Error checking wallet connection:', error);
      }
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      toast.error('MetaMask is not installed. Please install MetaMask to continue.');
      return false;
    }

    setIsConnecting(true);

    try {
      // Request account access
      const accounts = await window.ethereum.request({
        method: 'eth_requestAccounts',
      });

      if (accounts.length === 0) {
        toast.error('No accounts found. Please connect your wallet.');
        return false;
      }

      // Create provider and signer
      const web3Provider = new ethers.BrowserProvider(window.ethereum);
      const web3Signer = await web3Provider.getSigner();
      const network = await web3Provider.getNetwork();

      setProvider(web3Provider);
      setSigner(web3Signer);
      setAccount(accounts[0]);
      setChainId(network.chainId.toString());

      // Check if we're on the correct network
      const currentNetwork = getCurrentNetwork();
      if (!isCorrectNetwork(network.chainId.toString())) {
        toast.error(`Please switch to ${currentNetwork.name} (Chain ID: ${currentNetwork.chainId})`);
        // Optionally, try to switch network automatically
        // await switchToCorrectNetwork();
      }

      toast.success(`Wallet connected: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
      return true;

    } catch (error) {
      console.error('Error connecting wallet:', error);
      if (error.code === 4001) {
        toast.error('User rejected the connection request.');
      } else {
        toast.error('Failed to connect wallet. Please try again.');
      }
      return false;
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnectWallet = () => {
    setAccount(null);
    setProvider(null);
    setSigner(null);
    setChainId(null);
    toast.success('Wallet disconnected');
  };

  const handleAccountsChanged = (accounts) => {
    if (accounts.length === 0) {
      disconnectWallet();
    } else if (accounts[0] !== account) {
      setAccount(accounts[0]);
      toast.info(`Switched to account: ${accounts[0].slice(0, 6)}...${accounts[0].slice(-4)}`);
    }
  };

  const handleChainChanged = (newChainId) => {
    setChainId(newChainId);
    // Reload the page to reset the app state
    window.location.reload();
  };

  const switchToNetwork = async (targetChainId) => {
    if (!window.ethereum) return false;

    try {
      await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: ethers.toQuantity(targetChainId) }],
      });
      return true;
    } catch (error) {
      if (error.code === 4902) {
        // Network not added to MetaMask
        toast.error('Please add the network to MetaMask manually.');
      } else {
        console.error('Error switching network:', error);
        toast.error('Failed to switch network.');
      }
      return false;
    }
  };

  const switchToCorrectNetwork = async () => {
    const network = getCurrentNetwork();
    
    if (network.chainId === 296) { // Sepolia
      try {
        await window.ethereum.request({
          method: 'wallet_switchEthereumChain',
          params: [{ chainId: '0x128' }], // Sepolia chain ID in hex
        });
        return true;
      } catch (error) {
        if (error.code === 4902) {
          // Network not added, try to add it
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: [{
                chainId: '0xaa36a7',
                chainName: 'HEDERA Test Network',
                nativeCurrency: {
                  name: 'Hedera',
                  symbol: 'HBAR',
                  decimals: 18,
                },
                
              }],
            });
            return true;
          } catch (addError) {
            console.error('Error adding network:', addError);
            toast.error('Failed to add Hedera testnet network. Please add it manually.');
            return false;
          }
        } else {
          console.error('Error switching to Hedera testnet:', error);
          toast.error('Failed to switch to Hedera testnet network.');
          return false;
        }
      }
    } else {
      return switchToNetwork(network.chainId);
    }
  };

  const getBalance = async () => {
    if (!provider || !account) return '0';

    try {
      const balance = await provider.getBalance(account);
      return ethers.formatEther(balance);
    } catch (error) {
      console.error('Error getting balance:', error);
      return '0';
    }
  };

  const signMessage = async (message) => {
    if (!signer) {
      throw new Error('Wallet not connected');
    }

    try {
      return await signer.signMessage(message);
    } catch (error) {
      console.error('Error signing message:', error);
      throw error;
    }
  };

  // Contract addresses (from deployment)
  const CONTRACT_ADDRESSES = {
    PulseNet: getContractAddress('PulseNet'),
    PulseToken: getContractAddress('PulseToken')
  };

  // Contract ABIs
  const PULSE_NET_ABI = [
    "function submitData(bytes32 dataHash) external",
    "function getSubmissionCount(address user) external view returns (uint256)",
    "function getPlatformStats() external view returns (uint256, uint256)",
    "event DataSubmitted(address indexed user, bytes32 indexed dataHash, uint256 timestamp)",
    "event UserRewarded(address indexed user, uint256 amount)"
  ];

  const PULSE_TOKEN_ABI = [
    "function balanceOf(address account) external view returns (uint256)",
    "function decimals() external view returns (uint8)",
    "function symbol() external view returns (string)"
  ];

  // Get contract instance
  const getContract = (contractName) => {
    if (!signer) {
      throw new Error('Wallet not connected');
    }

    const address = CONTRACT_ADDRESSES[contractName];
    const abi = contractName === 'PulseNet' ? PULSE_NET_ABI : PULSE_TOKEN_ABI;

    if (!address) {
      throw new Error(`Contract address not found for ${contractName}`);
    }

    return new ethers.Contract(address, abi, signer);
  };

  // Submit data hash directly to blockchain
  const submitDataToBlockchain = async (dataHash) => {
    try {
      if (!signer) {
        throw new Error('Wallet not connected');
      }

      const contract = getContract('PulseNet');
      
      // Estimate gas
      const gasEstimate = await contract.submitData.estimateGas(dataHash);
      
      // Submit transaction
      const tx = await contract.submitData(dataHash, {
        gasLimit: gasEstimate + BigInt(50000) // Add buffer
      });

      // Return transaction details immediately
      return {
        success: true,
        transactionHash: tx.hash,
        status: 'pending'
      };

    } catch (error) {
      console.error('Blockchain submission error:', error);
      
      if (error.code === 'ACTION_REJECTED') {
        throw new Error('Transaction was rejected by user');
      } else if (error.code === 'INSUFFICIENT_FUNDS') {
        throw new Error('Insufficient funds for gas fees');
      } else {
        throw new Error(error.reason || error.message || 'Blockchain transaction failed');
      }
    }
  };

  // Wait for transaction confirmation
  const waitForTransaction = async (txHash) => {
    try {
      if (!provider) {
        throw new Error('Provider not available');
      }

      const receipt = await provider.waitForTransaction(txHash);
      
      return {
        success: receipt.status === 1,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString(),
        transactionHash: receipt.hash
      };

    } catch (error) {
      console.error('Error waiting for transaction:', error);
      throw error;
    }
  };

  // Get user's token balance
  const getUserTokenBalance = async (userAddress = account) => {
    try {
      if (!userAddress) return '0';
      
      const contract = getContract('PulseToken');
      const balance = await contract.balanceOf(userAddress);
      const decimals = await contract.decimals();
      
      return ethers.formatUnits(balance, decimals);
    } catch (error) {
      console.error('Error getting token balance:', error);
      return '0';
    }
  };

  // Get user's submission count
  const getUserSubmissionCount = async (userAddress = account) => {
    try {
      if (!userAddress) return 0;
      
      const contract = getContract('PulseNet');
      const count = await contract.getSubmissionCount(userAddress);
      
      return Number(count);
    } catch (error) {
      console.error('Error getting submission count:', error);
      return 0;
    }
  };

  // Get platform statistics
  const getPlatformStats = async () => {
    try {
      const contract = getContract('PulseNet');
      const [totalSubmissions, uniqueContributors] = await contract.getPlatformStats();
      
      return {
        totalSubmissions: Number(totalSubmissions),
        uniqueContributors: Number(uniqueContributors)
      };
    } catch (error) {
      console.error('Error getting platform stats:', error);
      return { totalSubmissions: 0, uniqueContributors: 0 };
    }
  };

  const value = {
    account,
    provider,
    signer,
    chainId,
    isConnecting,
    connectWallet,
    disconnectWallet,
    switchToNetwork,
    switchToCorrectNetwork,
    getBalance,
    signMessage,
    isConnected: !!account,
    submitDataToBlockchain,
    waitForTransaction,
    getUserTokenBalance,
    getUserSubmissionCount,
    getPlatformStats,
    isCorrectNetwork: () => isCorrectNetwork(chainId),
    getCurrentNetwork
  };

  return (
    <WalletContext.Provider value={value}>
      {children}
    </WalletContext.Provider>
  );
};
