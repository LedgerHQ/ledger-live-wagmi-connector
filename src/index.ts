import { IFrameEthereumProvider } from "@ledgerhq/iframe-provider";
import { providers } from "ethers";
import { getAddress, hexValue } from "ethers/lib/utils";
import {
  AddChainError,
  ChainNotConfiguredError,
  Connector,
  ConnectorNotFoundError,
  ResourceUnavailableError,
  RpcError,
  SwitchChainError,
  UserRejectedRequestError,
} from "wagmi";

import { normalizeChainId, ProviderRpcError, Chain } from "@wagmi/core";

type IFrameEthereumProviderOptions = ConstructorParameters<
  typeof IFrameEthereumProvider
>[0];

export class IFrameEthereumConnector extends Connector<
  IFrameEthereumProvider,
  IFrameEthereumProviderOptions
> {
  readonly id = "ledgerLive";

  readonly name = "Ledger Live";

  readonly ready = true;

  providerInstance?: IFrameEthereumProvider;

  async connect({ chainId }: { chainId?: number } = {}) {
    try {
      const provider = await this.getProvider();
      if (!provider) throw new ConnectorNotFoundError();

      if (provider.on) {
        provider.on("accountsChanged", this.onAccountsChanged);
        provider.on("chainChanged", this.onChainChanged);
      }

      this.emit("message", { type: "connecting" });

      const account = await this.getAccount();
      // Switch to chain if provided
      let id = await this.getChainId();
      let unsupported = this.isChainUnsupported(id);
      if (chainId && id !== chainId) {
        const chain = await this.switchChain(chainId);
        id = chain.id;
        unsupported = this.isChainUnsupported(id);
      }

      return { account, chain: { id, unsupported }, provider };
    } catch (error) {
      if (this.isUserRejectedRequestError(error))
        throw new UserRejectedRequestError(error);
      if ((error as RpcError).code === -32002)
        throw new ResourceUnavailableError(error);
      throw error;
    }
  }

  async disconnect() {
    const provider = await this.getProvider();
    if (!provider?.removeListener) return;

    provider.removeListener("accountsChanged", this.onAccountsChanged);
    provider.removeListener("chainChanged", this.onChainChanged);
  }

  async getAccount() {
    const provider = await this.getProvider();
    if (!provider) throw new ConnectorNotFoundError();
    const accounts = await provider.send("eth_requestAccounts");
    // return checksum address
    return getAddress(accounts[0] as string);
  }

  async getChainId() {
    const provider = await this.getProvider();
    if (!provider) throw new ConnectorNotFoundError();
    return provider.send("eth_chainId").then(normalizeChainId);
  }

  async getProvider() {
    if (!this.providerInstance) {
      this.providerInstance = new IFrameEthereumProvider(this.options);
    }
    return this.providerInstance;
  }

  async getSigner() {
    const [provider, account] = await Promise.all([
      this.getProvider(),
      this.getAccount(),
    ]);
    return new providers.Web3Provider(
      provider as unknown as providers.ExternalProvider
    ).getSigner(account);
  }

  async isAuthorized() {
    try {
      const provider = await this.getProvider();
      if (!provider) throw new ConnectorNotFoundError();
      const accounts = await provider.send("eth_accounts");
      const account = accounts[0];
      return !!account;
    } catch {
      return false;
    }
  }

  override async switchChain(chainId: number): Promise<Chain> {
    const provider = await this.getProvider();
    if (!provider) throw new ConnectorNotFoundError();
    const id = hexValue(chainId);

    try {
      await provider.send("wallet_switchEthereumChain", [{ chainId: id }]);

      return (
        this.chains.find((x) => x.id === chainId) ?? {
          id: chainId,
          name: `Chain ${id}`,
          network: `${id}`,
          nativeCurrency: { decimals: 18, name: "Ether", symbol: "ETH" },
          rpcUrls: { default: { http: [""] }, public: { http: [""] } },
        }
      );
    } catch (error) {
      const chain = this.chains.find((x) => x.id === chainId);
      if (!chain)
        throw new ChainNotConfiguredError({ chainId, connectorId: this.id });

      // Indicates chain is not added to provider
      if (
        (error as ProviderRpcError).code === 4902 ||
        // Unwrapping for MetaMask Mobile
        // https://github.com/MetaMask/metamask-mobile/issues/2944#issuecomment-976988719
        (error as RpcError<{ originalError?: { code: number } }>)?.data
          ?.originalError?.code === 4902
      ) {
        try {
          await provider.send("wallet_addEthereumChain", [
            {
              chainId: id,
              chainName: chain.name,
              nativeCurrency: chain.nativeCurrency,
              rpcUrls: [chain.rpcUrls.public ?? chain.rpcUrls.default],
              blockExplorerUrls: this.getBlockExplorerUrls(chain),
            },
          ]);

          return chain;
        } catch (addError) {
          if (this.isUserRejectedRequestError(addError))
            throw new UserRejectedRequestError(error);
          throw new AddChainError();
        }
      }

      if (this.isUserRejectedRequestError(error))
        throw new UserRejectedRequestError(error);
      throw new SwitchChainError(error);
    }
  }

  override async watchAsset({
    address,
    decimals = 18,
    image,
    symbol,
  }: {
    address: string;
    decimals?: number;
    image?: string;
    symbol: string;
  }) {
    const provider = await this.getProvider();
    if (!provider) throw new ConnectorNotFoundError();

    return provider.send("wallet_watchAsset", [
      {
        type: "ERC20",
        options: {
          address,
          decimals,
          image,
          symbol,
        },
      },
    ]);
  }

  protected onAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0 || !accounts[0]) {
      this.emit("disconnect");
    } else {
      this.emit("change", { account: getAddress(accounts[0]) });
    }
  };

  protected onChainChanged = (chainId: number | string) => {
    const id = normalizeChainId(chainId);
    const unsupported = this.isChainUnsupported(id);
    this.emit("change", { chain: { id, unsupported } });
  };

  // eslint-disable-next-line class-methods-use-this
  protected isUserRejectedRequestError(error: unknown) {
    return (error as ProviderRpcError).code === 4001;
  }

  protected onDisconnect = () => {
    this.emit("disconnect");
  };
}
