import React from 'react'
import Link from 'next/link'

import { useWeb3React } from '@web3-react/core'

// import { WalletLinkConnector } from '@web3-react/walletlink-connector'
// import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { InjectedConnector } from '@web3-react/injected-connector'

// const CoinbaseWallet = new WalletLinkConnector({
//   url: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
//   appName: 'Web3-react Demo',
//   supportedChainIds: [1, 3, 4, 5, 42]
// })

// const WalletConnect = new WalletConnectConnector({
//   rpcUrl: `https://mainnet.infura.io/v3/${process.env.INFURA_KEY}`,
//   bridge: 'https://bridge.walletconnect.org',
//   qrcode: true
// })

const Injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42]
})

const Disconnect = () => {
  const { deactivate } = useWeb3React()
  return <button onClick={deactivate}>Disconnect</button>
}

const Header = () => {
  const { active, activate, deactivate } = useWeb3React()
  return (
    <header className='flex h-[65px] border-b-2 items-center w-full '>
      <nav className={'flex w-full mx-4 justify-between'}>
        <div>
          <p className='text-xl font-semibold'>
            <Link href={'/'}> Tinker </Link>
          </p>
        </div>
        <button
          onClick={() => {
            activate(Injected)
          }}
        >
          Metamask
        </button>
        {active && <Disconnect />}
      </nav>
    </header>
  )
}

export default Header
