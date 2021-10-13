import "./styles/App.css";
import twitterLogo from "./assets/twitter-logo.svg";
import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import EpicNft from "./utils/EpicNFT.json";

// Constants
const TWITTER_HANDLE = "judicodes";
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;
// const TOTAL_MINT_COUNT = 50;

const CONTRACT_ADDRESS = "0x402c7749b4A16164e46e5BDe48090A66B287D4fB";

const App = () => {
  /*
   * Just a state variable we use to store our user's public wallet. Don't forget to import useState.
   */
  const [currentAccount, setCurrentAccount] = useState("");
  const [mintedNFT, setMintedNFT] = useState(0);
  const [minting, setMinting] = useState(false);
  const [openSeaLink, setOpenSeaLink] = useState("");

  const checkIfWalletIsConnected = async () => {
    /*
     * First make sure we have access to window.ethereum
     */

    const { ethereum } = window;

    console.log(ethereum.networkVersion, "window.ethereum.networkVersion");
    if (!ethereum) {
      console.log("Make sure you have metamask!");
      if (ethereum.networkVersion !== "4") {
        console.log("Make sure you are on the Rinkeby testnet!");
      }
      return;
    } else {
      console.log("We have the ethereum object", ethereum);
    }

    /*
     * Check if we're authorized to access the user's wallet
     */
    const accounts = await ethereum.request({ method: "eth_accounts" });

    /*
     * User can have multiple authorized accounts, we grab the first one if its there!
     */
    if (accounts.length !== 0) {
      const account = accounts[0];
      console.log("Found an authorized account:", account);
      setCurrentAccount(account);
      // Setup listener! This is for the case where a user comes to our site
      // and ALREADY had their wallet connected + authorized.
      setupEventListener();
    } else {
      console.log("No authorized account found");
    }
  };

  // Connect wallet
  const connectWallet = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("get metamask!");
        return;
      }

      // requesting for access to all accounts
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      console.log("Connected account: ", accounts[0]);

      // set the found account to our current account
      setCurrentAccount(accounts[0]);
      // Setup listener! This is for the case where a user comes to our site
      // and connected their wallet for the first time.
      setupEventListener();
    } catch (error) {
      console.log(error);
    }
  };

  // Setup our listener.
  const setupEventListener = async () => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          EpicNft.abi,
          signer
        );

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("NewEpicNFTMinted", (from, tokenId) => {
          console.log(from, tokenId.toNumber());
          alert(
            `Hey there! We've minted your NFT and sent it to your wallet. It may be blank right now. It can take a max of 10 min to show up on OpenSea. Here's the link: https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
          setOpenSeaLink(
            `https://testnets.opensea.io/assets/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
          );
        });

        console.log("Setup event listener!");
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const askContractToMintNft = async () => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          EpicNft.abi,
          signer
        );

        console.log("Going to pop wallet now to pay gas...");
        let nftTxn = await connectedContract.getCrucifix();

        console.log("Mining...please wait.");
        setMinting(true);
        await nftTxn.wait();

        console.log(
          `Mined, see transaction: https://rinkeby.etherscan.io/tx/${nftTxn.hash}`
        );
        setMinting(false);
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const mintedSoFar = async () => {
    try {
      const { ethereum } = window;
      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          EpicNft.abi,
          signer
        );
        const mintedSoFar = await connectedContract.mintedSoFar();
        setMintedNFT(mintedSoFar);
        console.log(mintedNFT, " is minted NFT");
      }
    } catch (error) {
      console.log(error);
    }
  };

  /*
   * This runs our function when the page loads.
   */
  useEffect(() => {
    checkIfWalletIsConnected();
    mintedSoFar();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Render Methods
  const renderNotConnectedContainer = () => (
    <button
      className="cta-button connect-wallet-button"
      onClick={connectWallet}
    >
      Connect to Wallet
    </button>
  );

  const renderMintUI = () => (
    <button
      onClick={askContractToMintNft}
      className="cta-button connect-wallet-button"
    >
      {minting ? "Minting..." : "Mint NFT"}
    </button>
  );

  return (
    <div className="App">
      <div className="container">
        <div className="left">
          <div className="header-container">
            <h1 className="logo">⍥</h1>
            <p className="header gradient-text">
              Each <span className="keyword">unique.</span> Each{" "}
              <span className="keyword">beautiful.</span> Each{" "}
              <span className="keyword">dope.</span>
            </p>
            <h6 className="sub-text" style={{ fontWeight: 400 }}>
              Discover your NFT today!
            </h6>
            {currentAccount === ""
              ? renderNotConnectedContainer()
              : renderMintUI()}
          </div>
          <div className="footer-container">
            <img
              alt="Twitter Logo"
              className="twitter-logo"
              src={twitterLogo}
            />
            <a
              className="footer-text"
              href={TWITTER_LINK}
              target="_blank"
              rel="noreferrer"
            >{`crafted by @${TWITTER_HANDLE}`}</a>
          </div>
        </div>
        <div className="right">
          <div className="card">
            <div className="card-top">
              <h2 className="walletAddress">0x4610...Cb4F</h2>
            </div>
            <div className="card-bottom">
              <div className="name-price">
                <h3 className="name">Product Name</h3>
                <p className="price">0.7 ETH</p>
              </div>
              <a href={openSeaLink} className="view">
                View on OS
              </a>
            </div>
          </div>
          {/* <h5 style={{ color: "white" }}>
              {parseInt(mintedNFT)} /50 has been minted!
            </h5> */}
        </div>
      </div>
    </div>
  );
};

export default App;
