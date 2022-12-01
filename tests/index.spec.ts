import { describe, expect, it } from "vitest";
import { defaultChains } from "wagmi";
import { IFrameEthereumConnector } from "../src";

describe("IFrameEthereumConnector", () => {
  it("inits", () => {
    const connector = new IFrameEthereumConnector({
      chains: defaultChains,
      options: {},
    });
    expect(connector.name).toEqual("Ledger Live");
    expect(connector.id).toEqual("ledgerLive");
  });
});
