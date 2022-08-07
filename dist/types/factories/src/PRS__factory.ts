/* Autogenerated file. Do not edit manually. */
/* tslint:disable */
/* eslint-disable */
import { Signer, utils, Contract, ContractFactory, Overrides } from "ethers";
import type { Provider, TransactionRequest } from "@ethersproject/providers";
import type { PromiseOrValue } from "../../common";
import type { PRS, PRSInterface } from "../../src/PRS";

const _abi = [
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "CreatedGame",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        indexed: false,
        internalType: "enum PRS.Choices",
        name: "",
        type: "uint8",
      },
      {
        indexed: true,
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        indexed: false,
        internalType: "enum PRS.Choices",
        name: "",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "GameDraw",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        indexed: true,
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "JoinedGameOf",
    type: "event",
  },
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
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "PaidOut",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "RemovedGame",
    type: "event",
  },
  {
    anonymous: false,
    inputs: [
      {
        indexed: true,
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        indexed: false,
        internalType: "enum PRS.Choices",
        name: "",
        type: "uint8",
      },
      {
        indexed: true,
        internalType: "address",
        name: "",
        type: "address",
      },
      {
        indexed: false,
        internalType: "enum PRS.Choices",
        name: "",
        type: "uint8",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
      {
        indexed: false,
        internalType: "uint256",
        name: "",
        type: "uint256",
      },
    ],
    name: "WonGameAgainst",
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
    name: "REVEAL_TIMEOUT",
    outputs: [
      {
        internalType: "uint32",
        name: "",
        type: "uint32",
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
        internalType: "uint256",
        name: "mintEntryFee",
        type: "uint256",
      },
    ],
    name: "changeMinEntryFee",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "uint32",
        name: "revealTimeout",
        type: "uint32",
      },
    ],
    name: "changeRevealTimeout",
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
    name: "changeTaxPercent",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "enum PRS.Choices",
        name: "p1Choice",
        type: "uint8",
      },
      {
        internalType: "enum PRS.Choices",
        name: "p2Choice",
        type: "uint8",
      },
      {
        internalType: "address",
        name: "p1",
        type: "address",
      },
      {
        internalType: "address",
        name: "p2",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "entryFee",
        type: "uint256",
      },
    ],
    name: "chooseWinner",
    outputs: [],
    stateMutability: "nonpayable",
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
    inputs: [
      {
        internalType: "address",
        name: "player",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
      },
    ],
    name: "getGame",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "entryFee",
            type: "uint256",
          },
          {
            internalType: "bytes32",
            name: "p1SaltedChoice",
            type: "bytes32",
          },
          {
            internalType: "address",
            name: "p2",
            type: "address",
          },
          {
            internalType: "enum PRS.Choices",
            name: "p2Choice",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "timerStart",
            type: "uint256",
          },
        ],
        internalType: "struct PRS.Game",
        name: "",
        type: "tuple",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "player",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
      },
    ],
    name: "getGameEntryFee",
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
        internalType: "bytes32",
        name: "hashChoice",
        type: "bytes32",
      },
      {
        internalType: "string",
        name: "clearChoice",
        type: "string",
      },
    ],
    name: "getHashChoice",
    outputs: [
      {
        internalType: "enum PRS.Choices",
        name: "",
        type: "uint8",
      },
    ],
    stateMutability: "pure",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "player",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
      },
    ],
    name: "getTimeLeft",
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
        name: "p1",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
      },
      {
        internalType: "enum PRS.Choices",
        name: "p2Choice",
        type: "uint8",
      },
    ],
    name: "joinGame",
    outputs: [],
    stateMutability: "payable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "player",
        type: "address",
      },
    ],
    name: "listGames",
    outputs: [
      {
        components: [
          {
            internalType: "uint256",
            name: "entryFee",
            type: "uint256",
          },
          {
            internalType: "bytes32",
            name: "p1SaltedChoice",
            type: "bytes32",
          },
          {
            internalType: "address",
            name: "p2",
            type: "address",
          },
          {
            internalType: "enum PRS.Choices",
            name: "p2Choice",
            type: "uint8",
          },
          {
            internalType: "uint256",
            name: "timerStart",
            type: "uint256",
          },
        ],
        internalType: "struct PRS.Game[]",
        name: "",
        type: "tuple[]",
      },
    ],
    stateMutability: "view",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "bytes32",
        name: "encChoice",
        type: "bytes32",
      },
    ],
    name: "makeGame",
    outputs: [],
    stateMutability: "payable",
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
    inputs: [
      {
        internalType: "address",
        name: "winner",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "entryFee",
        type: "uint256",
      },
    ],
    name: "payoutWithAppliedTax",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "p1",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
      },
    ],
    name: "removeGame",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "p1",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
      },
    ],
    name: "removeGameP1",
    outputs: [],
    stateMutability: "nonpayable",
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
        name: "gameId",
        type: "uint256",
      },
      {
        internalType: "string",
        name: "movePw",
        type: "string",
      },
    ],
    name: "resolveGameP1",
    outputs: [],
    stateMutability: "nonpayable",
    type: "function",
  },
  {
    inputs: [
      {
        internalType: "address",
        name: "p1",
        type: "address",
      },
      {
        internalType: "uint256",
        name: "gameId",
        type: "uint256",
      },
    ],
    name: "resolveGameP2",
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
    stateMutability: "payable",
    type: "receive",
  },
];

const _bytecode =
  "0x6080604052662386f26fc1000060015560056002556202a300600360006101000a81548163ffffffff021916908363ffffffff1602179055503480156200004557600080fd5b50620000666200005a6200006c60201b60201c565b6200007460201b60201c565b62000138565b600033905090565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b612f1080620001486000396000f3fe6080604052600436106101445760003560e01c806381883759116100b6578063ebb744e11161006f578063ebb744e114610435578063ec4c7eff1461045e578063ee61ff9614610487578063f2fde38b146104c4578063fc06b26a146104ed578063fd177667146105165761014b565b806381883759146102ff5780638411f44f1461032a5780638533f5611461035357806385c839aa146103905780638da5cb5b146103cd578063d6df2b89146103f85761014b565b80635d25bb97116101085780635d25bb97146102285780636b4b6999146102445780636f8359521461026d578063715018a6146102965780637f7c3724146102ad5780637f9b19a7146102d65761014b565b806312065fe0146101505780632e5e5b151461017b5780633d6ae3a714610197578063442ba89f146101c25780634c112706146101ff5761014b565b3661014b57005b600080fd5b34801561015c57600080fd5b50610165610541565b60405161017291906122a8565b60405180910390f35b61019560048036038101906101909190612303565b610549565b005b3480156101a357600080fd5b506101ac610737565b6040516101b9919061234f565b60405180910390f35b3480156101ce57600080fd5b506101e960048036038101906101e491906123c8565b61074d565b6040516101f691906125b0565b60405180910390f35b34801561020b57600080fd5b5061022660048036038101906102219190612663565b61089a565b005b610242600480360381019061023d91906126e8565b610992565b005b34801561025057600080fd5b5061026b60048036038101906102669190612767565b610d55565b005b34801561027957600080fd5b50610294600480360381019061028f9190612794565b610d81565b005b3480156102a257600080fd5b506102ab6110ae565b005b3480156102b957600080fd5b506102d460048036038101906102cf9190612794565b6110c2565b005b3480156102e257600080fd5b506102fd60048036038101906102f891906127d4565b6113ee565b005b34801561030b57600080fd5b50610314611400565b60405161032191906122a8565b60405180910390f35b34801561033657600080fd5b50610351600480360381019061034c9190612794565b611406565b005b34801561035f57600080fd5b5061037a60048036038101906103759190612794565b61155f565b60405161038791906122a8565b60405180910390f35b34801561039c57600080fd5b506103b760048036038101906103b29190612801565b6116dd565b6040516103c49190612870565b60405180910390f35b3480156103d957600080fd5b506103e26118a9565b6040516103ef919061289a565b60405180910390f35b34801561040457600080fd5b5061041f600480360381019061041a9190612794565b6118d2565b60405161042c91906122a8565b60405180910390f35b34801561044157600080fd5b5061045c600480360381019061045791906128b5565b6118ef565b005b34801561046a57600080fd5b5061048560048036038101906104809190612794565b611d15565b005b34801561049357600080fd5b506104ae60048036038101906104a99190612794565b611e72565b6040516104bb9190612998565b60405180910390f35b3480156104d057600080fd5b506104eb60048036038101906104e691906123c8565b612020565b005b3480156104f957600080fd5b50610514600480360381019061050f91906127d4565b6120a4565b005b34801561052257600080fd5b5061052b6120b6565b60405161053891906122a8565b60405180910390f35b600047905090565b6001543410156040518060400160405280600381526020017f61746c0000000000000000000000000000000000000000000000000000000000815250906105c6576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016105bd9190612a4c565b60405180910390fd5b506105cf612235565b3481600001818152505081816020018181525050600460003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020819080600181540180825580915050600190039060005260206000209060040201600090919091909150600082015181600001556020820151816001015560408201518160020160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060608201518160020160146101000a81548160ff021916908360038111156106d2576106d161244e565b5b02179055506080820151816003015550503373ffffffffffffffffffffffffffffffffffffffff167f0bb8b3c1699d88c3b6dec18d63fc02f194b610b760b178b7292b481906b3ad66344260405161072b929190612a6e565b60405180910390a25050565b600360009054906101000a900463ffffffff1681565b6060600460008373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff168152602001908152602001600020805480602002602001604051908101604052809291908181526020016000905b8282101561088f57838290600052602060002090600402016040518060a001604052908160008201548152602001600182015481526020016002820160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020016002820160149054906101000a900460ff1660038111156108605761085f61244e565b5b60038111156108725761087161244e565b5b8152602001600382015481525050815260200190600101906107ae565b505050509050919050565b60006108a63385611e72565b9050600073ffffffffffffffffffffffffffffffffffffffff16816040015173ffffffffffffffffffffffffffffffffffffffff1614156040518060400160405280600381526020017f6e7370000000000000000000000000000000000000000000000000000000000081525090610954576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161094b9190612a4c565b60405180910390fd5b506000610966826020015185856116dd565b905061097233866110c2565b61098b81836060015133856040015186600001516118ef565b5050505050565b3373ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff1614156040518060400160405280600381526020017f636a67000000000000000000000000000000000000000000000000000000000081525090610a39576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610a309190612a4c565b60405180910390fd5b506000600460008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000209050828180549050116040518060400160405280600481526020017f696f6f620000000000000000000000000000000000000000000000000000000081525090610afb576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610af29190612a4c565b60405180910390fd5b506000818481548110610b1157610b10612a97565b5b90600052602060002090600402019050600073ffffffffffffffffffffffffffffffffffffffff168160020160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16146040518060400160405280600381526020017f636a67000000000000000000000000000000000000000000000000000000000081525090610bec576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610be39190612a4c565b60405180910390fd5b5080600001543410156040518060400160405280600381526020017f61746c000000000000000000000000000000000000000000000000000000000081525090610c6c576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610c639190612a4c565b60405180910390fd5b50338160020160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550828160020160146101000a81548160ff02191690836003811115610cd757610cd661244e565b5b02179055504281600301819055508473ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff167f70fc8cbbf6bf1c3929b063284d69be02695d9de0c6a918f74b2277d81ee28c4b863442604051610d4693929190612ac6565b60405180910390a35050505050565b610d5d6120bc565b80600360006101000a81548163ffffffff021916908363ffffffff16021790555050565b8173ffffffffffffffffffffffffffffffffffffffff163373ffffffffffffffffffffffffffffffffffffffff16146040518060400160405280600381526020017f637267000000000000000000000000000000000000000000000000000000000081525090610e27576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401610e1e9190612a4c565b60405180910390fd5b506000600460003373ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002090506000610e778484611e72565b90508160018380549050610e8b9190612b2c565b81548110610e9c57610e9b612a97565b5b9060005260206000209060040201828481548110610ebd57610ebc612a97565b5b906000526020600020906004020160008201548160000155600182015481600101556002820160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff168160020160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506002820160149054906101000a900460ff168160020160146101000a81548160ff02191690836003811115610f7e57610f7d61244e565b5b02179055506003820154816003015590505081805480610fa157610fa0612b60565b5b600190038181906000526020600020906004020160008082016000905560018201600090556002820160006101000a81549073ffffffffffffffffffffffffffffffffffffffff02191690556002820160146101000a81549060ff0219169055600382016000905550509055600073ffffffffffffffffffffffffffffffffffffffff16816040015173ffffffffffffffffffffffffffffffffffffffff16146110585761105781604001518260000151611406565b5b8373ffffffffffffffffffffffffffffffffffffffff167f4e14f0d3524409e58c1cdeac5ae0ea0f8cb729438dde9af2f81d62772089e01184426040516110a0929190612a6e565b60405180910390a250505050565b6110b66120bc565b6110c0600061213a565b565b6000600460008473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16815260200190815260200160002090506000818054905014156040518060400160405280600381526020017f637267000000000000000000000000000000000000000000000000000000000081525090611185576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161117c9190612a4c565b60405180910390fd5b50818180549050116040518060400160405280600481526020017f696f6f620000000000000000000000000000000000000000000000000000000081525090611204576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016111fb9190612a4c565b60405180910390fd5b5080600182805490506112179190612b2c565b8154811061122857611227612a97565b5b906000526020600020906004020181838154811061124957611248612a97565b5b906000526020600020906004020160008201548160000155600182015481600101556002820160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff168160020160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055506002820160149054906101000a900460ff168160020160146101000a81548160ff0219169083600381111561130a5761130961244e565b5b0217905550600382015481600301559050508080548061132d5761132c612b60565b5b600190038181906000526020600020906004020160008082016000905560018201600090556002820160006101000a81549073ffffffffffffffffffffffffffffffffffffffff02191690556002820160146101000a81549060ff02191690556003820160009055505090558273ffffffffffffffffffffffffffffffffffffffff167f4e14f0d3524409e58c1cdeac5ae0ea0f8cb729438dde9af2f81d62772089e01183426040516113e1929190612a6e565b60405180910390a2505050565b6113f66120bc565b8060018190555050565b60015481565b6000600254606460028461141a9190612b8f565b6114249190612c18565b61142e9190612b8f565b60028361143b9190612b8f565b6114459190612b2c565b9050804710156040518060400160405280600581526020017f6e656d6963000000000000000000000000000000000000000000000000000000815250906114c2576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016114b99190612a4c565b60405180910390fd5b508273ffffffffffffffffffffffffffffffffffffffff166108fc829081150290604051600060405180830381858888f19350505050158015611509573d6000803e3d6000fd5b508273ffffffffffffffffffffffffffffffffffffffff167f7ca7469714f3e1d8732b3a67b0599fba3be82b826137fcfa805c19afc2b20aeb8242604051611552929190612a6e565b60405180910390a2505050565b60008061156c8484611e72565b905061157b81608001516121fe565b156040518060400160405280600281526020017f7466000000000000000000000000000000000000000000000000000000000000815250906115f3576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016115ea9190612a4c565b60405180910390fd5b50600073ffffffffffffffffffffffffffffffffffffffff16816040015173ffffffffffffffffffffffffffffffffffffffff1614156040518060400160405280600381526020017f6e61740000000000000000000000000000000000000000000000000000000000815250906116a0576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016116979190612a4c565b60405180910390fd5b508060800151426116b19190612b2c565b600360009054906101000a900463ffffffff1663ffffffff166116d49190612b2c565b91505092915050565b600080600284846040516020016116f5929190612c88565b6040516020818303038152906040526040516117119190612ce8565b602060405180830381855afa15801561172e573d6000803e3d6000fd5b5050506040513d601f19601f820116820180604052508101906117519190612d14565b90508085146040518060400160405280600281526020017f6970000000000000000000000000000000000000000000000000000000000000815250906117cd576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016117c49190612a4c565b60405180910390fd5b506000848460008181106117e4576117e3612a97565b5b9050013560f81c60f81b9050603060f81b817effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff19161415611829576000925050506118a2565b603160f81b817effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff19161415611862576001925050506118a2565b603260f81b817effffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff1916141561189b576002925050506118a2565b6003925050505b9392505050565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b6000806118df8484611e72565b9050806000015191505092915050565b8360038111156119025761190161244e565b5b8560038111156119155761191461244e565b5b14156119b7576119318360028361192c9190612c18565b611406565b611947826002836119429190612c18565b611406565b8173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167f0b9941cef1aa10b842b624e5965581bafc13a2025e1030cf301a233a74ce07ec878785426040516119aa9493929190612d41565b60405180910390a3611d0e565b600160038111156119cb576119ca61244e565b5b8560038111156119de576119dd61244e565b5b148015611a0f5750600060038111156119fa576119f961244e565b5b846003811115611a0d57611a0c61244e565b5b145b80611a6e575060006003811115611a2957611a2861244e565b5b856003811115611a3c57611a3b61244e565b5b148015611a6d575060026003811115611a5857611a5761244e565b5b846003811115611a6b57611a6a61244e565b5b145b5b80611acd575060026003811115611a8857611a8761244e565b5b856003811115611a9b57611a9a61244e565b5b148015611acc575060016003811115611ab757611ab661244e565b5b846003811115611aca57611ac961244e565b5b145b5b15611b4c57611adc8382611406565b8173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167f1f0963b195b50f5d46ec758a39bbbcab4167b8077db3aeca518b991899f00bec87878542604051611b3f9493929190612d41565b60405180910390a3611d0e565b600380811115611b5f57611b5e61244e565b5b856003811115611b7257611b7161244e565b5b1415611bf257611b828282611406565b8273ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167f1f0963b195b50f5d46ec758a39bbbcab4167b8077db3aeca518b991899f00bec86888542604051611be59493929190612d41565b60405180910390a3611d0e565b600380811115611c0557611c0461244e565b5b846003811115611c1857611c1761244e565b5b1415611c9857611c288382611406565b8173ffffffffffffffffffffffffffffffffffffffff168373ffffffffffffffffffffffffffffffffffffffff167f1f0963b195b50f5d46ec758a39bbbcab4167b8077db3aeca518b991899f00bec87878542604051611c8b9493929190612d41565b60405180910390a3611d0e565b611ca28282611406565b8273ffffffffffffffffffffffffffffffffffffffff168273ffffffffffffffffffffffffffffffffffffffff167f1f0963b195b50f5d46ec758a39bbbcab4167b8077db3aeca518b991899f00bec86888542604051611d059493929190612d41565b60405180910390a35b5050505050565b6000611d218383611e72565b9050600073ffffffffffffffffffffffffffffffffffffffff16816040015173ffffffffffffffffffffffffffffffffffffffff1614156040518060400160405280600381526020017f6e7370000000000000000000000000000000000000000000000000000000000081525090611dcf576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611dc69190612a4c565b60405180910390fd5b50611ddd81608001516121fe565b6040518060400160405280600381526020017f747372000000000000000000000000000000000000000000000000000000000081525090611e54576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611e4b9190612a4c565b60405180910390fd5b50611e5f83836110c2565b611e6d338260000151611406565b505050565b611e7a612235565b6000600460008573ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020019081526020016000209050828180549050116040518060400160405280600481526020017f696f6f620000000000000000000000000000000000000000000000000000000081525090611f3b576040517f08c379a0000000000000000000000000000000000000000000000000000000008152600401611f329190612a4c565b60405180910390fd5b50808381548110611f4f57611f4e612a97565b5b90600052602060002090600402016040518060a001604052908160008201548152602001600182015481526020016002820160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff1681526020016002820160149054906101000a900460ff166003811115611ff757611ff661244e565b5b60038111156120095761200861244e565b5b815260200160038201548152505091505092915050565b6120286120bc565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff161415612098576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161208f90612df8565b60405180910390fd5b6120a18161213a565b50565b6120ac6120bc565b8060028190555050565b60025481565b6120c461222d565b73ffffffffffffffffffffffffffffffffffffffff166120e26118a9565b73ffffffffffffffffffffffffffffffffffffffff1614612138576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161212f90612e64565b60405180910390fd5b565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff169050816000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508173ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a35050565b6000600360009054906101000a900463ffffffff1663ffffffff16826122249190612e84565b42119050919050565b600033905090565b6040518060a001604052806000815260200160008019168152602001600073ffffffffffffffffffffffffffffffffffffffff168152602001600060038111156122825761228161244e565b5b8152602001600081525090565b6000819050919050565b6122a28161228f565b82525050565b60006020820190506122bd6000830184612299565b92915050565b600080fd5b600080fd5b6000819050919050565b6122e0816122cd565b81146122eb57600080fd5b50565b6000813590506122fd816122d7565b92915050565b600060208284031215612319576123186122c3565b5b6000612327848285016122ee565b91505092915050565b600063ffffffff82169050919050565b61234981612330565b82525050565b60006020820190506123646000830184612340565b92915050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b60006123958261236a565b9050919050565b6123a58161238a565b81146123b057600080fd5b50565b6000813590506123c28161239c565b92915050565b6000602082840312156123de576123dd6122c3565b5b60006123ec848285016123b3565b91505092915050565b600081519050919050565b600082825260208201905092915050565b6000819050602082019050919050565b61242a8161228f565b82525050565b612439816122cd565b82525050565b6124488161238a565b82525050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052602160045260246000fd5b6004811061248e5761248d61244e565b5b50565b600081905061249f8261247d565b919050565b60006124af82612491565b9050919050565b6124bf816124a4565b82525050565b60a0820160008201516124db6000850182612421565b5060208201516124ee6020850182612430565b506040820151612501604085018261243f565b50606082015161251460608501826124b6565b5060808201516125276080850182612421565b50505050565b600061253983836124c5565b60a08301905092915050565b6000602082019050919050565b600061255d826123f5565b6125678185612400565b935061257283612411565b8060005b838110156125a357815161258a888261252d565b975061259583612545565b925050600181019050612576565b5085935050505092915050565b600060208201905081810360008301526125ca8184612552565b905092915050565b6125db8161228f565b81146125e657600080fd5b50565b6000813590506125f8816125d2565b92915050565b600080fd5b600080fd5b600080fd5b60008083601f840112612623576126226125fe565b5b8235905067ffffffffffffffff8111156126405761263f612603565b5b60208301915083600182028301111561265c5761265b612608565b5b9250929050565b60008060006040848603121561267c5761267b6122c3565b5b600061268a868287016125e9565b935050602084013567ffffffffffffffff8111156126ab576126aa6122c8565b5b6126b78682870161260d565b92509250509250925092565b600481106126d057600080fd5b50565b6000813590506126e2816126c3565b92915050565b600080600060608486031215612701576127006122c3565b5b600061270f868287016123b3565b9350506020612720868287016125e9565b9250506040612731868287016126d3565b9150509250925092565b61274481612330565b811461274f57600080fd5b50565b6000813590506127618161273b565b92915050565b60006020828403121561277d5761277c6122c3565b5b600061278b84828501612752565b91505092915050565b600080604083850312156127ab576127aa6122c3565b5b60006127b9858286016123b3565b92505060206127ca858286016125e9565b9150509250929050565b6000602082840312156127ea576127e96122c3565b5b60006127f8848285016125e9565b91505092915050565b60008060006040848603121561281a576128196122c3565b5b6000612828868287016122ee565b935050602084013567ffffffffffffffff811115612849576128486122c8565b5b6128558682870161260d565b92509250509250925092565b61286a816124a4565b82525050565b60006020820190506128856000830184612861565b92915050565b6128948161238a565b82525050565b60006020820190506128af600083018461288b565b92915050565b600080600080600060a086880312156128d1576128d06122c3565b5b60006128df888289016126d3565b95505060206128f0888289016126d3565b9450506040612901888289016123b3565b9350506060612912888289016123b3565b9250506080612923888289016125e9565b9150509295509295909350565b60a0820160008201516129466000850182612421565b5060208201516129596020850182612430565b50604082015161296c604085018261243f565b50606082015161297f60608501826124b6565b5060808201516129926080850182612421565b50505050565b600060a0820190506129ad6000830184612930565b92915050565b600081519050919050565b600082825260208201905092915050565b60005b838110156129ed5780820151818401526020810190506129d2565b838111156129fc576000848401525b50505050565b6000601f19601f8301169050919050565b6000612a1e826129b3565b612a2881856129be565b9350612a388185602086016129cf565b612a4181612a02565b840191505092915050565b60006020820190508181036000830152612a668184612a13565b905092915050565b6000604082019050612a836000830185612299565b612a906020830184612299565b9392505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603260045260246000fd5b6000606082019050612adb6000830186612299565b612ae86020830185612299565b612af56040830184612299565b949350505050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601160045260246000fd5b6000612b378261228f565b9150612b428361228f565b925082821015612b5557612b54612afd565b5b828203905092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052603160045260246000fd5b6000612b9a8261228f565b9150612ba58361228f565b9250817fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff0483118215151615612bde57612bdd612afd565b5b828202905092915050565b7f4e487b7100000000000000000000000000000000000000000000000000000000600052601260045260246000fd5b6000612c238261228f565b9150612c2e8361228f565b925082612c3e57612c3d612be9565b5b828204905092915050565b600081905092915050565b82818337600083830152505050565b6000612c6f8385612c49565b9350612c7c838584612c54565b82840190509392505050565b6000612c95828486612c63565b91508190509392505050565b600081519050919050565b600081905092915050565b6000612cc282612ca1565b612ccc8185612cac565b9350612cdc8185602086016129cf565b80840191505092915050565b6000612cf48284612cb7565b915081905092915050565b600081519050612d0e816122d7565b92915050565b600060208284031215612d2a57612d296122c3565b5b6000612d3884828501612cff565b91505092915050565b6000608082019050612d566000830187612861565b612d636020830186612861565b612d706040830185612299565b612d7d6060830184612299565b95945050505050565b7f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160008201527f6464726573730000000000000000000000000000000000000000000000000000602082015250565b6000612de26026836129be565b9150612ded82612d86565b604082019050919050565b60006020820190508181036000830152612e1181612dd5565b9050919050565b7f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e6572600082015250565b6000612e4e6020836129be565b9150612e5982612e18565b602082019050919050565b60006020820190508181036000830152612e7d81612e41565b9050919050565b6000612e8f8261228f565b9150612e9a8361228f565b9250827fffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffffff03821115612ecf57612ece612afd565b5b82820190509291505056fea264697066735822122028b3b67df7a7d0133485b7179fc2da5d5485a25a6d48f732a09cccab11e1e6f164736f6c63430008090033";

type PRSConstructorParams =
  | [signer?: Signer]
  | ConstructorParameters<typeof ContractFactory>;

const isSuperArgs = (
  xs: PRSConstructorParams
): xs is ConstructorParameters<typeof ContractFactory> => xs.length > 1;

export class PRS__factory extends ContractFactory {
  constructor(...args: PRSConstructorParams) {
    if (isSuperArgs(args)) {
      super(...args);
    } else {
      super(_abi, _bytecode, args[0]);
    }
  }

  override deploy(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): Promise<PRS> {
    return super.deploy(overrides || {}) as Promise<PRS>;
  }
  override getDeployTransaction(
    overrides?: Overrides & { from?: PromiseOrValue<string> }
  ): TransactionRequest {
    return super.getDeployTransaction(overrides || {});
  }
  override attach(address: string): PRS {
    return super.attach(address) as PRS;
  }
  override connect(signer: Signer): PRS__factory {
    return super.connect(signer) as PRS__factory;
  }

  static readonly bytecode = _bytecode;
  static readonly abi = _abi;
  static createInterface(): PRSInterface {
    return new utils.Interface(_abi) as PRSInterface;
  }
  static connect(address: string, signerOrProvider: Signer | Provider): PRS {
    return new Contract(address, _abi, signerOrProvider) as PRS;
  }
}
