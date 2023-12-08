'use client'
import Header from './components/header'
import Banner from '@/app/components/banner'
import Footer from '@/app/components/footer'
import { Web3ReactProvider } from '@web3-react/core'
import { Web3Provider } from '@ethersproject/providers'
import type { Web3Provider as ProviderType } from '@ethersproject/providers'
import { WalletLinkConnector } from '@web3-react/walletlink-connector'
import { WalletConnectConnector } from '@web3-react/walletconnect-connector'
import { InjectedConnector } from '@web3-react/injected-connector'

function getLibrary(provider: any): ProviderType {
  return new Web3Provider(provider)
}

export default function Home() {
  return (
    <Web3ReactProvider getLibrary={getLibrary}>
      <main>
        <div className={'flex flex-col justify-between h-[100vh]'}>
          <Header />
          <Banner />
          <Footer />
        </div>
      </main>
    </Web3ReactProvider>
  )
}
