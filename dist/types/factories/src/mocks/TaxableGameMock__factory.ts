/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../../common";
import type {
  TaxableGameMock,
  TaxableGameMockInterface,
} from "../../../src/mocks/TaxableGameMock";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "previousOwner",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "OwnershipTransferred",
    type: "event",
  },
  {
    inputs: [],
    name: "MIN_ENTRY_FEE",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "TAX_PERCENT",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
    ],
    name: "balanceOf",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "getBalance",
    outputs: [
      {
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "owner",
    outputs: [
      {
        internalType: "address",
        name: "",
        type: "address",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [],
    name: "renounceOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "minEntryFee",
        type: "uint256",
      },
    ],
    name: "setMinEntryFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint256",
        name: "taxPercent",
        type: "uint256",
      },
    ],
    name: "setTaxPercent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "newOwner",
        type: "address",
      },
    ],
    name: "transferOwnership",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "account",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "balance",
        type: "uint256",
      },
    ],
    name: "unsafeSetBalance",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [],
    name: "withdraw",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    stateMutability: "payable",
    type: "receive",
  },
];

const _bytecode =
  "0x6080604052662386f26fc10000600255600560035534801561002057600080fd5b5061003d61003261004960201b60201c565b61005160201b60201c565b60018081905550610115565b600033905090565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b610911806101246000396000f3fe6080604052600436106100a05760003560e01c8063715018a611610064578063715018a61461017057806381883759146101875780638da5cb5b146101b2578063adbebc9f146101dd578063f2fde38b14610206578063fd1776671461022f576100a7565b806312065fe0146100ac5780633ccfd60b146100d75780635b027c33146100e1578063611783861461010a57806370a0823114610133576100a7565b366100a757005b600080fd5b3480156100b857600080fd5b506100c161025a565b6040516100ce91906105f2565b60405180910390f35b6100df610262565b005b3480156100ed57600080fd5b506101086004803603810190610103919061063e565b6102b3565b005b34801561011657600080fd5b50610131600480360381019061012c919061063e565b6102c5565b005b34801561013f57600080fd5b5061015a600480360381019061015591906106c9565b6102d7565b60405161016791906105f2565b60405180910390f35b34801561017c57600080fd5b50610185610320565b005b34801561019357600080fd5b5061019c610334565b6040516101a991906105f2565b60405180910390f35b3480156101be57600080fd5b506101c761033a565b6040516101d49190610705565b60405180910390f35b3480156101e957600080fd5b5061020460048036038101906101ff9190610720565b610363565b005b34801561021257600080fd5b5061022d600480360381019061022891906106c9565b610379565b005b34801561023b57600080fd5b506102446103fd565b60405161025191906105f2565b60405180910390f35b600047905090565b61026a610403565b3373ffffffffffffffffffffffffffffffffffffffff166108fc479081150290604051600060405180830381858888f193505050501580156102b0573d6000803e3d6000fd5b50565b6102bb610403565b8060028190555050565b6102cd610403565b8060038190555050565b6000600460008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020549050919050565b610328610403565b6103326000610481565b565b60025481565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b61036b610403565b6103758282610545565b5050565b610381610403565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff1614156103f1576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016103e8906107e3565b60405180910390fd5b6103fa81610481565b50565b60035481565b61040b6105d1565b73ffffffffffffffffffffffffffffffffffffffff1661042961033a565b73ffffffffffffffffffffffffffffffffffffffff161461047f576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016104769061084f565b60405180910390fd5b565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b6000811015610589576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610580906108bb565b60405180910390fd5b80600460008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819055505050565b600033905090565b6000819050919050565b6105ec816105d9565b82525050565b600060208201905061060760008301846105e3565b92915050565b600080fd5b61061b816105d9565b811461062657600080fd5b50565b60008135905061063881610612565b92915050565b6000602082840312156106545761065361060d565b5b600061066284828501610629565b91505092915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006106968261066b565b9050919050565b6106a68161068b565b81146106b157600080fd5b50565b6000813590506106c38161069d565b92915050565b6000602082840312156106df576106de61060d565b5b60006106ed848285016106b4565b91505092915050565b6106ff8161068b565b82525050565b600060208201905061071a60008301846106f6565b92915050565b600080604083850312156107375761073661060d565b5b6000610745858286016106b4565b925050602061075685828601610629565b9150509250929050565b600082825260208201905092915050565b7f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160008201527f6464726573730000000000000000000000000000000000000000000000000000602082015250565b60006107cd602683610760565b91506107d882610771565b604082019050919050565b600060208201905081810360008301526107fc816107c0565b9050919050565b7f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572600082015250565b6000610839602083610760565b915061084482610803565b602082019050919050565b600060208201905081810360008301526108688161082c565b9050919050565b7f42616c616e63652063616e2774206265206e6567617469766500000000000000600082015250565b60006108a5601983610760565b91506108b08261086f565b602082019050919050565b600060208201905081810360008301526108d481610898565b905091905056fea264697066735822122045e4d62b0b4eab3011fbeeeb145188d07db884dce25239d59e8edea3291bd4ae64736f6c63430008090033";

type TaxableGameMockConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: TaxableGameMockConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class TaxableGameMock__factory extends ContractFactory {
  constructor(...args: TaxableGameMockConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<TaxableGameMock> {
    return super.deploy(overrides || {}) as Promise<TaxableGameMock>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): TaxableGameMock {
    return super.attach(address) as TaxableGameMock;
  }
  override connect(signer: Signer): TaxableGameMock__factory {
    return super.connect(signer) as TaxableGameMock__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): TaxableGameMockInterface {
    return new utils.Interface(_abi) as TaxableGameMockInterface;
  }
  static connect(
    address: string,
    signerOrProvider: Signer | Provider
  ): TaxableGameMock {
    return new Contract(address, _abi, signerOrProvider) as TaxableGameMock;
  }
}