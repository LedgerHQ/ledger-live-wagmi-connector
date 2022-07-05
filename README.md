<p align="center">
 <img src="https://user-images.githubusercontent.com/9203826/154288895-670f5c23-81a1-4307-a080-1af83f7f8356.svg" align="center" alt="Ledger" />
 <h2 align="center">Ledger Live Wagmi Connector</h2>
 <p align="center"><a href="https://github.com/tmm/wagmi">Wagmi</a> Connector for the Ledger Live Ethereum Dapp Browser</p>
</p>
  <p align="center">
    <a href="https://www.npmjs.com/package/@ledgerhq/ledger-live-wagmi-connector?activeTab=versions">
      <img src="https://img.shields.io/npm/v/@ledgerhq/ledger-live-wagmi-connector.svg?style=flat-square" />
    </a>
    <a href="https://opensource.org/licenses/MIT">
      <img alt="License" src="https://img.shields.io/badge/License-MIT-blue.svg" />
    </a>
    <a href="https://github.com/LedgerHQ/ledger-live-wagmi-connector/actions">
      <img alt="Tests Passing" src="https://github.com/LedgerHQ/ledger-live-wagmi-connector/workflows/CI/badge.svg" />
    </a>
    <a href="https://github.com/LedgerHQ/ledger-live-wagmi-connector/issues">
      <img alt="Issues" src="https://img.shields.io/github/issues/LedgerHQ/ledger-live-wagmi-connector?color=0088ff" />
    </a>
    <a href="https://github.com/LedgerHQ/ledger-live-wagmi-connector/pulls">
      <img alt="GitHub pull requests" src="https://img.shields.io/github/issues-pr/LedgerHQ/ledger-live-wagmi-connector?color=0088ff" />
    </a>
    <a href="https://discord.gg/y6nZhxv2bC">
      <img alt="Discord" src="https://img.shields.io/discord/885256081289379850?color=1C1CE1&label=Ledger%20%7C%20Discord%20%F0%9F%91%8B%20&style=flat-square" />
    </a>
  </p>

  <p align="center">
    <a href="https://developers.ledger.com/docs/live-app/start-here/">Ledger Developer Portal</a>
    ·
    <a href="https://github.com/LedgerHQ/ledger-live-wagmi-connector/issues/new/choose">Report Bug</a>
    ·
    <a href="https://github.com/LedgerHQ/ledger-live-wagmi-connector/issues/new/choose">Request Feature</a>
  </p>
</p>

# About

`@ledgerhq/ledger-live-wagmi-connector` is a [wagmi](https://github.com/tmm/wagmi) connector built on top of the [@ledgerhq/iframe-provider
](https://github.com/ledgerhq/iframe-provider). It can be used to initialize a wagmi client, managing the interaction of your DApp with the Ledger Live wallet.

## How to use

Here is an example of a wagmi client using both the `IFrameEthereumConnector` and the default `InjectedConnector` to be used within Ledger Live [DApp browser](https://github.com/LedgerHQ/eth-dapp-browser) and on a regular browser with an injected provider like Metamask for example.

```js
import { IFrameEthereumConnector } from '@ledgerhq/ledger-live-wagmi-connector';
import { chain, configureChains, createClient } from 'wagmi';
import { InjectedConnector } from 'wagmi/connectors/injected';
import { publicProvider } from 'wagmi/providers/public';

const { chains, provider } = configureChains(
  [chain.mainnet, chain.polygon],
  [publicProvider()]
);

const wagmiClient = createClient({
  autoConnect: true,
  connectors: [
    new IFrameEthereumConnector({ chains, options: {} }),
    new InjectedConnector({ chains }),
  ],
  provider,
});
```

# Contributing

**You need to have a recent [Node.js](https://nodejs.org/) and
[Yarn 1 (Classic)](https://classic.yarnpkg.com/lang/en/) installed.**

### Install dependencies

```bash
yarn
```

### Build

Build the Connector

```bash
yarn build
```

### Lint

Check code quality with

```bash
yarn lint
```

# Documentation

Have a look at [the wagmi repo](https://github.com/tmm/wagmi) and [the wagmi doc](https://wagmi.sh/) to learn more on connectors and wagmi.
