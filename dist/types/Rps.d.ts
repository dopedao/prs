import type { BaseContract, BigNumber, BigNumberish, BytesLike, CallOverrides, ContractTransaction, Overrides, PayableOverrides, PopulatedTransaction, Signer, utils } from "ethers";
import type { FunctionFragment, Result, EventFragment } from "@ethersproject/abi";
import type { Listener, Provider } from "@ethersproject/providers";
import type { TypedEventFilter, TypedEvent, TypedListener, OnEvent, PromiseOrValue } from "./common";
export declare namespace Rps {
    type GameStruct = {
        entryFee: PromiseOrValue<BigNumberish>;
        p1SaltedChoice: PromiseOrValue<BytesLike>;
        p2: PromiseOrValue<string>;
        p2Choice: PromiseOrValue<BigNumberish>;
        timerStart: PromiseOrValue<BigNumberish>;
    };
    type GameStructOutput = [
        BigNumber,
        string,
        string,
        number,
        BigNumber
    ] & {
        entryFee: BigNumber;
        p1SaltedChoice: string;
        p2: string;
        p2Choice: number;
        timerStart: BigNumber;
    };
}
export interface RpsInterface extends utils.Interface {
    functions: {
        "MIN_ENTRY_FEE()": FunctionFragment;
        "REVEAL_TIMEOUT()": FunctionFragment;
        "TAX_PERCENT()": FunctionFragment;
        "changeMinEntryFee(uint256)": FunctionFragment;
        "changeRevealTimeout(uint32)": FunctionFragment;
        "changeTaxPercent(uint8)": FunctionFragment;
        "chooseWinner(uint8,uint8,address,address,uint256)": FunctionFragment;
        "getBalance()": FunctionFragment;
        "getChoiceFromStr(string)": FunctionFragment;
        "getGame(address,uint8)": FunctionFragment;
        "getGameEntryFee(address,uint8)": FunctionFragment;
        "getHashChoice(bytes32,string)": FunctionFragment;
        "getTimeLeft(address,uint8)": FunctionFragment;
        "joinGame(address,uint8,uint8)": FunctionFragment;
        "listgames(address)": FunctionFragment;
        "makeGame(bytes32)": FunctionFragment;
        "payoutWithAppliedTax(address,uint256)": FunctionFragment;
        "rcv()": FunctionFragment;
        "removeGame(address,uint8)": FunctionFragment;
        "removeGameP1(address,uint8)": FunctionFragment;
        "resolveGameP1(uint8,string)": FunctionFragment;
        "resolveGameP2(address,uint8)": FunctionFragment;
    };
    getFunction(nameOrSignatureOrTopic: "MIN_ENTRY_FEE" | "REVEAL_TIMEOUT" | "TAX_PERCENT" | "changeMinEntryFee" | "changeRevealTimeout" | "changeTaxPercent" | "chooseWinner" | "getBalance" | "getChoiceFromStr" | "getGame" | "getGameEntryFee" | "getHashChoice" | "getTimeLeft" | "joinGame" | "listgames" | "makeGame" | "payoutWithAppliedTax" | "rcv" | "removeGame" | "removeGameP1" | "resolveGameP1" | "resolveGameP2"): FunctionFragment;
    encodeFunctionData(functionFragment: "MIN_ENTRY_FEE", values?: undefined): string;
    encodeFunctionData(functionFragment: "REVEAL_TIMEOUT", values?: undefined): string;
    encodeFunctionData(functionFragment: "TAX_PERCENT", values?: undefined): string;
    encodeFunctionData(functionFragment: "changeMinEntryFee", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "changeRevealTimeout", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "changeTaxPercent", values: [PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "chooseWinner", values: [
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<string>,
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "getBalance", values?: undefined): string;
    encodeFunctionData(functionFragment: "getChoiceFromStr", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "getGame", values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "getGameEntryFee", values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "getHashChoice", values: [PromiseOrValue<BytesLike>, PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "getTimeLeft", values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "joinGame", values: [
        PromiseOrValue<string>,
        PromiseOrValue<BigNumberish>,
        PromiseOrValue<BigNumberish>
    ]): string;
    encodeFunctionData(functionFragment: "listgames", values: [PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "makeGame", values: [PromiseOrValue<BytesLike>]): string;
    encodeFunctionData(functionFragment: "payoutWithAppliedTax", values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "rcv", values?: undefined): string;
    encodeFunctionData(functionFragment: "removeGame", values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "removeGameP1", values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]): string;
    encodeFunctionData(functionFragment: "resolveGameP1", values: [PromiseOrValue<BigNumberish>, PromiseOrValue<string>]): string;
    encodeFunctionData(functionFragment: "resolveGameP2", values: [PromiseOrValue<string>, PromiseOrValue<BigNumberish>]): string;
    decodeFunctionResult(functionFragment: "MIN_ENTRY_FEE", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "REVEAL_TIMEOUT", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "TAX_PERCENT", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "changeMinEntryFee", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "changeRevealTimeout", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "changeTaxPercent", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "chooseWinner", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getBalance", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getChoiceFromStr", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getGame", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getGameEntryFee", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getHashChoice", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "getTimeLeft", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "joinGame", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "listgames", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "makeGame", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "payoutWithAppliedTax", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "rcv", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "removeGame", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "removeGameP1", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "resolveGameP1", data: BytesLike): Result;
    decodeFunctionResult(functionFragment: "resolveGameP2", data: BytesLike): Result;
    events: {
        "CreatedGame(address,uint256,uint256)": EventFragment;
        "GameDraw(address,uint8,address,uint8,uint256,uint256)": EventFragment;
        "JoinedGameOf(address,address,uint256,uint256,uint256)": EventFragment;
        "PaidOut(address,uint256,uint256)": EventFragment;
        "RemovedGame(address,uint8,uint256)": EventFragment;
        "WonGameAgainst(address,uint8,address,uint8,uint256,uint256)": EventFragment;
    };
    getEvent(nameOrSignatureOrTopic: "CreatedGame"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "GameDraw"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "JoinedGameOf"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "PaidOut"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "RemovedGame"): EventFragment;
    getEvent(nameOrSignatureOrTopic: "WonGameAgainst"): EventFragment;
}
export interface CreatedGameEventObject {
    arg0: string;
    arg1: BigNumber;
    arg2: BigNumber;
}
export declare type CreatedGameEvent = TypedEvent<[
    string,
    BigNumber,
    BigNumber
], CreatedGameEventObject>;
export declare type CreatedGameEventFilter = TypedEventFilter<CreatedGameEvent>;
export interface GameDrawEventObject {
    arg0: string;
    arg1: number;
    arg2: string;
    arg3: number;
    arg4: BigNumber;
    arg5: BigNumber;
}
export declare type GameDrawEvent = TypedEvent<[
    string,
    number,
    string,
    number,
    BigNumber,
    BigNumber
], GameDrawEventObject>;
export declare type GameDrawEventFilter = TypedEventFilter<GameDrawEvent>;
export interface JoinedGameOfEventObject {
    arg0: string;
    arg1: string;
    arg2: BigNumber;
    arg3: BigNumber;
    arg4: BigNumber;
}
export declare type JoinedGameOfEvent = TypedEvent<[
    string,
    string,
    BigNumber,
    BigNumber,
    BigNumber
], JoinedGameOfEventObject>;
export declare type JoinedGameOfEventFilter = TypedEventFilter<JoinedGameOfEvent>;
export interface PaidOutEventObject {
    arg0: string;
    arg1: BigNumber;
    arg2: BigNumber;
}
export declare type PaidOutEvent = TypedEvent<[
    string,
    BigNumber,
    BigNumber
], PaidOutEventObject>;
export declare type PaidOutEventFilter = TypedEventFilter<PaidOutEvent>;
export interface RemovedGameEventObject {
    arg0: string;
    arg1: number;
    arg2: BigNumber;
}
export declare type RemovedGameEvent = TypedEvent<[
    string,
    number,
    BigNumber
], RemovedGameEventObject>;
export declare type RemovedGameEventFilter = TypedEventFilter<RemovedGameEvent>;
export interface WonGameAgainstEventObject {
    arg0: string;
    arg1: number;
    arg2: string;
    arg3: number;
    arg4: BigNumber;
    arg5: BigNumber;
}
export declare type WonGameAgainstEvent = TypedEvent<[
    string,
    number,
    string,
    number,
    BigNumber,
    BigNumber
], WonGameAgainstEventObject>;
export declare type WonGameAgainstEventFilter = TypedEventFilter<WonGameAgainstEvent>;
export interface Rps extends BaseContract {
    connect(signerOrProvider: Signer | Provider | string): this;
    attach(addressOrName: string): this;
    deployed(): Promise<this>;
    interface: RpsInterface;
    queryFilter<TEvent extends TypedEvent>(event: TypedEventFilter<TEvent>, fromBlockOrBlockhash?: string | number | undefined, toBlock?: string | number | undefined): Promise<Array<TEvent>>;
    listeners<TEvent extends TypedEvent>(eventFilter?: TypedEventFilter<TEvent>): Array<TypedListener<TEvent>>;
    listeners(eventName?: string): Array<Listener>;
    removeAllListeners<TEvent extends TypedEvent>(eventFilter: TypedEventFilter<TEvent>): this;
    removeAllListeners(eventName?: string): this;
    off: OnEvent<this>;
    on: OnEvent<this>;
    once: OnEvent<this>;
    removeListener: OnEvent<this>;
    functions: {
        MIN_ENTRY_FEE(overrides?: CallOverrides): Promise<[BigNumber]>;
        REVEAL_TIMEOUT(overrides?: CallOverrides): Promise<[number]>;
        TAX_PERCENT(overrides?: CallOverrides): Promise<[number]>;
        changeMinEntryFee(mintEntryFee: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        changeRevealTimeout(revealTimeout: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        changeTaxPercent(taxPercent: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        chooseWinner(p1Choice: PromiseOrValue<BigNumberish>, p2Choice: PromiseOrValue<BigNumberish>, p1: PromiseOrValue<string>, p2: PromiseOrValue<string>, entryFee: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        getBalance(overrides?: CallOverrides): Promise<[BigNumber]>;
        getChoiceFromStr(clearChoice: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[number]>;
        getGame(player: PromiseOrValue<string>, gameId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[Rps.GameStructOutput]>;
        getGameEntryFee(player: PromiseOrValue<string>, gameId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[BigNumber]>;
        getHashChoice(hashChoice: PromiseOrValue<BytesLike>, clearChoice: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[number]>;
        getTimeLeft(player: PromiseOrValue<string>, gameId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<[BigNumber]>;
        joinGame(p1: PromiseOrValue<string>, gameId: PromiseOrValue<BigNumberish>, p2Choice: PromiseOrValue<BigNumberish>, overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        listgames(player: PromiseOrValue<string>, overrides?: CallOverrides): Promise<[Rps.GameStructOutput[]]>;
        makeGame(encChoice: PromiseOrValue<BytesLike>, overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        payoutWithAppliedTax(winner: PromiseOrValue<string>, initalBet: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        rcv(overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        removeGame(p1: PromiseOrValue<string>, gameId: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        removeGameP1(p1: PromiseOrValue<string>, gameId: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        resolveGameP1(gameId: PromiseOrValue<BigNumberish>, movePw: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
        resolveGameP2(p1: PromiseOrValue<string>, gameId: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<ContractTransaction>;
    };
    MIN_ENTRY_FEE(overrides?: CallOverrides): Promise<BigNumber>;
    REVEAL_TIMEOUT(overrides?: CallOverrides): Promise<number>;
    TAX_PERCENT(overrides?: CallOverrides): Promise<number>;
    changeMinEntryFee(mintEntryFee: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    changeRevealTimeout(revealTimeout: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    changeTaxPercent(taxPercent: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    chooseWinner(p1Choice: PromiseOrValue<BigNumberish>, p2Choice: PromiseOrValue<BigNumberish>, p1: PromiseOrValue<string>, p2: PromiseOrValue<string>, entryFee: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    getBalance(overrides?: CallOverrides): Promise<BigNumber>;
    getChoiceFromStr(clearChoice: PromiseOrValue<string>, overrides?: CallOverrides): Promise<number>;
    getGame(player: PromiseOrValue<string>, gameId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<Rps.GameStructOutput>;
    getGameEntryFee(player: PromiseOrValue<string>, gameId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
    getHashChoice(hashChoice: PromiseOrValue<BytesLike>, clearChoice: PromiseOrValue<string>, overrides?: CallOverrides): Promise<number>;
    getTimeLeft(player: PromiseOrValue<string>, gameId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
    joinGame(p1: PromiseOrValue<string>, gameId: PromiseOrValue<BigNumberish>, p2Choice: PromiseOrValue<BigNumberish>, overrides?: PayableOverrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    listgames(player: PromiseOrValue<string>, overrides?: CallOverrides): Promise<Rps.GameStructOutput[]>;
    makeGame(encChoice: PromiseOrValue<BytesLike>, overrides?: PayableOverrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    payoutWithAppliedTax(winner: PromiseOrValue<string>, initalBet: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    rcv(overrides?: PayableOverrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    removeGame(p1: PromiseOrValue<string>, gameId: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    removeGameP1(p1: PromiseOrValue<string>, gameId: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    resolveGameP1(gameId: PromiseOrValue<BigNumberish>, movePw: PromiseOrValue<string>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    resolveGameP2(p1: PromiseOrValue<string>, gameId: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
        from?: PromiseOrValue<string>;
    }): Promise<ContractTransaction>;
    callStatic: {
        MIN_ENTRY_FEE(overrides?: CallOverrides): Promise<BigNumber>;
        REVEAL_TIMEOUT(overrides?: CallOverrides): Promise<number>;
        TAX_PERCENT(overrides?: CallOverrides): Promise<number>;
        changeMinEntryFee(mintEntryFee: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        changeRevealTimeout(revealTimeout: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        changeTaxPercent(taxPercent: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        chooseWinner(p1Choice: PromiseOrValue<BigNumberish>, p2Choice: PromiseOrValue<BigNumberish>, p1: PromiseOrValue<string>, p2: PromiseOrValue<string>, entryFee: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        getBalance(overrides?: CallOverrides): Promise<BigNumber>;
        getChoiceFromStr(clearChoice: PromiseOrValue<string>, overrides?: CallOverrides): Promise<number>;
        getGame(player: PromiseOrValue<string>, gameId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<Rps.GameStructOutput>;
        getGameEntryFee(player: PromiseOrValue<string>, gameId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        getHashChoice(hashChoice: PromiseOrValue<BytesLike>, clearChoice: PromiseOrValue<string>, overrides?: CallOverrides): Promise<number>;
        getTimeLeft(player: PromiseOrValue<string>, gameId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        joinGame(p1: PromiseOrValue<string>, gameId: PromiseOrValue<BigNumberish>, p2Choice: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        listgames(player: PromiseOrValue<string>, overrides?: CallOverrides): Promise<Rps.GameStructOutput[]>;
        makeGame(encChoice: PromiseOrValue<BytesLike>, overrides?: CallOverrides): Promise<void>;
        payoutWithAppliedTax(winner: PromiseOrValue<string>, initalBet: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        rcv(overrides?: CallOverrides): Promise<void>;
        removeGame(p1: PromiseOrValue<string>, gameId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        removeGameP1(p1: PromiseOrValue<string>, gameId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
        resolveGameP1(gameId: PromiseOrValue<BigNumberish>, movePw: PromiseOrValue<string>, overrides?: CallOverrides): Promise<void>;
        resolveGameP2(p1: PromiseOrValue<string>, gameId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<void>;
    };
    filters: {
        "CreatedGame(address,uint256,uint256)"(arg0?: PromiseOrValue<string> | null, arg1?: null, arg2?: null): CreatedGameEventFilter;
        CreatedGame(arg0?: PromiseOrValue<string> | null, arg1?: null, arg2?: null): CreatedGameEventFilter;
        "GameDraw(address,uint8,address,uint8,uint256,uint256)"(arg0?: PromiseOrValue<string> | null, arg1?: null, arg2?: PromiseOrValue<string> | null, arg3?: null, arg4?: null, arg5?: null): GameDrawEventFilter;
        GameDraw(arg0?: PromiseOrValue<string> | null, arg1?: null, arg2?: PromiseOrValue<string> | null, arg3?: null, arg4?: null, arg5?: null): GameDrawEventFilter;
        "JoinedGameOf(address,address,uint256,uint256,uint256)"(arg0?: PromiseOrValue<string> | null, arg1?: PromiseOrValue<string> | null, arg2?: null, arg3?: null, arg4?: null): JoinedGameOfEventFilter;
        JoinedGameOf(arg0?: PromiseOrValue<string> | null, arg1?: PromiseOrValue<string> | null, arg2?: null, arg3?: null, arg4?: null): JoinedGameOfEventFilter;
        "PaidOut(address,uint256,uint256)"(arg0?: PromiseOrValue<string> | null, arg1?: null, arg2?: null): PaidOutEventFilter;
        PaidOut(arg0?: PromiseOrValue<string> | null, arg1?: null, arg2?: null): PaidOutEventFilter;
        "RemovedGame(address,uint8,uint256)"(arg0?: PromiseOrValue<string> | null, arg1?: null, arg2?: null): RemovedGameEventFilter;
        RemovedGame(arg0?: PromiseOrValue<string> | null, arg1?: null, arg2?: null): RemovedGameEventFilter;
        "WonGameAgainst(address,uint8,address,uint8,uint256,uint256)"(arg0?: PromiseOrValue<string> | null, arg1?: null, arg2?: PromiseOrValue<string> | null, arg3?: null, arg4?: null, arg5?: null): WonGameAgainstEventFilter;
        WonGameAgainst(arg0?: PromiseOrValue<string> | null, arg1?: null, arg2?: PromiseOrValue<string> | null, arg3?: null, arg4?: null, arg5?: null): WonGameAgainstEventFilter;
    };
    estimateGas: {
        MIN_ENTRY_FEE(overrides?: CallOverrides): Promise<BigNumber>;
        REVEAL_TIMEOUT(overrides?: CallOverrides): Promise<BigNumber>;
        TAX_PERCENT(overrides?: CallOverrides): Promise<BigNumber>;
        changeMinEntryFee(mintEntryFee: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        changeRevealTimeout(revealTimeout: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        changeTaxPercent(taxPercent: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        chooseWinner(p1Choice: PromiseOrValue<BigNumberish>, p2Choice: PromiseOrValue<BigNumberish>, p1: PromiseOrValue<string>, p2: PromiseOrValue<string>, entryFee: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        getBalance(overrides?: CallOverrides): Promise<BigNumber>;
        getChoiceFromStr(clearChoice: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        getGame(player: PromiseOrValue<string>, gameId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        getGameEntryFee(player: PromiseOrValue<string>, gameId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        getHashChoice(hashChoice: PromiseOrValue<BytesLike>, clearChoice: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        getTimeLeft(player: PromiseOrValue<string>, gameId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<BigNumber>;
        joinGame(p1: PromiseOrValue<string>, gameId: PromiseOrValue<BigNumberish>, p2Choice: PromiseOrValue<BigNumberish>, overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        listgames(player: PromiseOrValue<string>, overrides?: CallOverrides): Promise<BigNumber>;
        makeGame(encChoice: PromiseOrValue<BytesLike>, overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        payoutWithAppliedTax(winner: PromiseOrValue<string>, initalBet: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        rcv(overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        removeGame(p1: PromiseOrValue<string>, gameId: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        removeGameP1(p1: PromiseOrValue<string>, gameId: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        resolveGameP1(gameId: PromiseOrValue<BigNumberish>, movePw: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
        resolveGameP2(p1: PromiseOrValue<string>, gameId: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<BigNumber>;
    };
    populateTransaction: {
        MIN_ENTRY_FEE(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        REVEAL_TIMEOUT(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        TAX_PERCENT(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        changeMinEntryFee(mintEntryFee: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        changeRevealTimeout(revealTimeout: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        changeTaxPercent(taxPercent: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        chooseWinner(p1Choice: PromiseOrValue<BigNumberish>, p2Choice: PromiseOrValue<BigNumberish>, p1: PromiseOrValue<string>, p2: PromiseOrValue<string>, entryFee: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        getBalance(overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getChoiceFromStr(clearChoice: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getGame(player: PromiseOrValue<string>, gameId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getGameEntryFee(player: PromiseOrValue<string>, gameId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getHashChoice(hashChoice: PromiseOrValue<BytesLike>, clearChoice: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        getTimeLeft(player: PromiseOrValue<string>, gameId: PromiseOrValue<BigNumberish>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        joinGame(p1: PromiseOrValue<string>, gameId: PromiseOrValue<BigNumberish>, p2Choice: PromiseOrValue<BigNumberish>, overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        listgames(player: PromiseOrValue<string>, overrides?: CallOverrides): Promise<PopulatedTransaction>;
        makeGame(encChoice: PromiseOrValue<BytesLike>, overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        payoutWithAppliedTax(winner: PromiseOrValue<string>, initalBet: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        rcv(overrides?: PayableOverrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        removeGame(p1: PromiseOrValue<string>, gameId: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        removeGameP1(p1: PromiseOrValue<string>, gameId: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        resolveGameP1(gameId: PromiseOrValue<BigNumberish>, movePw: PromiseOrValue<string>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
        resolveGameP2(p1: PromiseOrValue<string>, gameId: PromiseOrValue<BigNumberish>, overrides?: Overrides & {
            from?: PromiseOrValue<string>;
        }): Promise<PopulatedTransaction>;
    };
}
