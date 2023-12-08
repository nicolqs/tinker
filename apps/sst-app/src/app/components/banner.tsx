'use client'
import React, { useState } from 'react'
import { useWeb3React } from '@web3-react/core'

const Banner = () => {
  const { active, account, chainId } = useWeb3React()
  return (
    <section>
      <div>Connection Status: {active}</div>
      <div>Account: {account}</div>
      <div>Network ID: {chainId}</div>
    </section>
  )
}

export default Banner
