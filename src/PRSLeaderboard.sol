// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.12;

import { ITablelandTables } from "@tableland/evm/contracts/ITablelandTables.sol";
import { Strings } from "@openzeppelin/contracts/utils/Strings.sol";
import { Game } from "./PRSLibrary.sol";

/// Tableland interface for Paper, Rock, Scissors.
///
/// Contains logic for creating table owned by contract, inserting rows for resolved games,
/// and accessing data from the leaderboard.
///
/// @dev These functions are extracted here for code modularity, and the ability to mock each
///      for testing purposes in our mock contract. We check they're working upon dev deployment.
///      Not the most sound approach, but it will work for now.
///      All functions "virtual" for this purpose.
abstract contract PRSLeaderboard {
    ITablelandTables private _tableland;
    uint256 private _gameTableId;
    string private _tablePrefix = "prs";
    string public gameTable;

    /// Initializes Tableland table to store record of games played.
    /// @param tablelandRegistry Address of the "tableland registry" on the chain this will be deployed on.
    function _createTable(address tablelandRegistry) internal virtual {
        _tableland = ITablelandTables(tablelandRegistry);

        /// @dev Stores unique ID for our created table
        _gameTableId = _tableland.createTable(
            address(this),
            string.concat(
                "CREATE TABLE ",
                _tablePrefix,
                "_",
                Strings.toString(block.chainid),
                " (",
                "game_id INT UNIQUE, ",
                "created_at_timestamp INT, ",
                "game_entry_fee INT, ",
                "player_1 TEXT, ",
                "player_2 TEXT, ",
                "winner TEXT, ",
                "player_1_move INT, ",
                "player_2_move INT ",
                ");"
            )
        );

        /// @dev Stores full table name for new table.
        gameTable = string.concat(
            _tablePrefix,
            "_",
            Strings.toString(block.chainid),
            "_",
            Strings.toString(_gameTableId)
        );
    }

    function _insertTableRow(
        uint256 gameId,
        Game memory game,
        address winner
    ) internal virtual {
        _tableland.runSQL(
            address(this),
            _gameTableId,
            string.concat(
                "INSERT INTO ",
                gameTable,
                " (game_id, created_at_timestamp, game_entry_fee, player_1, player_2, winner, player_1_move, player_2_move) ",
                " values (",
                Strings.toString(gameId),
                Strings.toString(block.timestamp),
                Strings.toString(game.entryFee),
                Strings.toHexString(game.p1),
                Strings.toHexString(game.p2),
                Strings.toHexString(winner),
                Strings.toString(uint8(game.p1ClearChoice)),
                Strings.toString(uint8(game.p2ClearChoice)),
                ");"
            )
        );
    }
}
