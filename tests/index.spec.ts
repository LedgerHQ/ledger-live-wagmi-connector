import { describe, expect, it } from "vitest";
import { testChains } from "@wagmi/core/internal/test";
import { IFrameEthereumConnector } from "../src";

describe("IFrameEthereumConnector", () => {
  it("inits", () => {
    const connector = new IFrameEthereumConnector({
      chains: testChains,
      options: {},
    });
    expect(connector.name).toEqual("Ledger Live");
    expect(connector.id).toEqual("ledgerLive");
  });
});
