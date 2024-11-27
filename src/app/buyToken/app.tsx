const buyTokens = async () => {
  if (!amount || !window.ethereum) return;

  try {
    setLoading(true);
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(
      TOKEN_CONFIG.address,
      TOKEN_CONFIG.abi,
      signer
    );

    // Calculate the exact BNB amount to send
    const bnbAmount = ethers.parseEther(price.bnbEquivalent);

    // Send the transaction with the correct BNB value
    const tx = await contract.buy({
      value: bnbAmount
    });

    // Wait for transaction confirmation
    await tx.wait();

    // Add token to MetaMask
    try {
      await window.ethereum.request({
        method: 'wallet_watchAsset',
        params: {
          type: 'ERC20',
          options: {
            address: TOKEN_CONFIG.address,
            symbol: TOKEN_CONFIG.name,
            decimals: 18,
          },
        },
      });
    } catch (error) {
      console.error('Error adding token to MetaMask:', error);
    }

    toast.success(`Successfully purchased ${amount} ${TOKEN_CONFIG.name}!`);
    setAmount('');
  } catch (error) {
    const errorMessage = await handleWeb3Error(error);
    toast.error(errorMessage);
  } finally {
    setLoading(false);
  }
};
