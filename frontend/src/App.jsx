import { useState, useEffect } from 'react'
import {ethers} from 'ethers';
import './App.css'
import PageButton from './components/PageButton';
import ConnectButton from './components/ConnectButton';
import {GearFill} from 'react-bootstrap-icons'
import ConfigModal from './components/ConfigModal';
import BeatLoader from 'react-spinners/BeatLoader'
import CurrencyField from './components/CurrencyField';
import {getWethContract, getUniContract, getPrice, runSwap } from './AlphaRouterService.js'


function App() {
  const [provider, setProvider] = useState(undefined)
  // signer will run swaps and push transactions on behalf of our wallet
  const [signer, setSigner] = useState(undefined)
  const [signerAddress, setSignerAddress ] = useState(undefined)
  const [showModal, setShowModal] = useState(undefined)
  const [slippageAmount, setSlippageAmount] = useState(2)
  const [deadlineMinutes, setDeadlineMinutes] = useState(10)

  const [inputAmount, setInputAmount] = useState(undefined)
  const [outputAmount, setOutputAmount] = useState(undefined)
  const [transaction, setTransaction] = useState(undefined)
  const [loading, setLoading] = useState(undefined)
  const [ratio, setRatio] = useState(undefined)
  const [wethContract, setWethContract] = useState(undefined)
  const [uniContract, setUniContract] = useState(undefined)
  const [wethAmount, setWethAmount] = useState(undefined)
  const [uniAmount, setUniAmount] =  useState(undefined)

  useEffect(() => {
    const onLoad = async () => {
      const provider = await new ethers.providers.Web3Provider(window.ethereum)
      setProvider(provider)

      const wethContract = getWethContract()
      setWethContract(wethContract)

      const uniContract = getUniContract()
      setUniContract(uniContract)
    }
    onLoad();
  }, [])

  const getSigner = async provider => {
    provider.send("eth_requestAccounts", [])
    const signer = provider.getSigner();
    setSigner(signer);
  }

  // checks if there is a signer as an accoount
  const isConnected = () => signer != undefined
  const getWalletAddress = () => {
    signer.getAddress()
    .then(address => {
      // this gets the signer contract and we connect to it with its abi 
      setSignerAddress(address)

      // connect the wrapped ether and uniswap token contracts as well
      wethContract.balanceOf(address).then(res => {
        setWethAmount(Number(ethers.utils.formatEther(res)))
      })
      uniContract.balanceOf(address).then(res => {
        setUniAmount(Number(ethers.utils.formatEther(res)))
      })
    })

    
  }
  if (signer !== undefined) {
    getWalletAddress()
  }


  const getSwapPrice = (inputAmount) => {
    setLoading(true);
    setInputAmount(inputAmount)

    const swap = getPrice(inputAmount, slippageAmount, Math.floor(Date.now()/1000 + (deadlineMinutes * 60), signerAddress)).then(data => {
      setTransaction(data[0])
      setOutputAmount(data[1])
      setRatio(data[2])
      setLoading(false)
    })
  }


  return (
    <div className='App'>
      <div className="appNav">
        <div className='my-2 buttonContainer buttonContainerTop'>
          <PageButton name={"Swap"} isBold={true} />
          <PageButton name={"Pool"}  />
          <PageButton name={"Vote"}  />
          <PageButton name={"Charts"}  />
        </div>
        <div className='rightNav'>
          <div className='connectButtonContainer'>
            <ConnectButton
              provider={provider}
              isConnected={isConnected}
              signerAddress={signerAddress}
              getSigner={getSigner}
            />
          </div>
          <div  className='my-2 buttonContainer'>
            <PageButton name={"..."} isBold={true} />
          </div>
        </div>
      </div>

      <div className='appBody'>
        <div className='swapContainer'>
          <div className='swapHeader'>
          <span className='swapText'>Swap</span>
          <span className='gearContainer' onClick={() => setShowModal(true)}>
            <GearFill />
          </span>
          {showModal && (
            <ConfigModal
              onClose={() => setShowModal(false)}
              setDeadlineMinutes={setDeadlineMinutes}
              deadlineMinutes={deadlineMinutes}
              setSlippageAmount={setSlippageAmount}
              slippageAmount={slippageAmount}

            />
          )}
            
          </div>

          <div className='swapBody'>
          <CurrencyField
              field='input'
              token='WETH'
              getSwapPrice={getSwapPrice}
              signer={signer}
              balance={wethAmount}

            />
            <CurrencyField
              field='Output'
              token='UNI'
              value={outputAmount}
              signer={signer}
              balance={uniAmount}
              spinner={BeatLoader}
              loading={loading}

            />

          </div>

        </div>
      </div>
     
    </div>
  )
}

export default App
