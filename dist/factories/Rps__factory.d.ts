import { Signer } from "ethers";
import type { Provider } from "@ethersproject/providers";
import type { Rps, RpsInterface } from "../Rps";
export declare class Rps__factory {
    static readonly abi: string[];
    static createInterface(): RpsInterface;
    static connect(address: string, signerOrProvider: Signer | Provider): Rps;
}
