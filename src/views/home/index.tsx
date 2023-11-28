// Next, React
import { FC, useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

// Wallet
import {
  useWallet,
  useConnection,
  useAnchorWallet,
} from "@solana/wallet-adapter-react";

// Components
import { RequestAirdrop } from "../../components/RequestAirdrop";
import pkg from "../../../package.json";

// Store
import { SoundworkBidSDK, SoundworkListSDK } from "@jimii/soundwork-sdk";
import { AnchorProvider, BN } from "@coral-xyz/anchor";
import { LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, Transaction } from "@solana/web3.js";

export const HomeView: FC = ({ }) => {
  const wallet = useWallet();
  const { connection } = useConnection();
  let anchorWallet = useAnchorWallet();

  const anchorProvider = useMemo((): AnchorProvider => {
    return new AnchorProvider(
      connection,
      anchorWallet,
      AnchorProvider.defaultOptions()
    )
  }, [anchorWallet, connection]);

  const bidSDK = useMemo((): SoundworkBidSDK => {
    return new SoundworkBidSDK(anchorProvider, connection);
  }, [anchorProvider, connection]);

  const listSDK = useMemo((): SoundworkListSDK => {
    return new SoundworkListSDK(anchorProvider, connection);
  }, [anchorProvider, connection]);

  const nftMint = useMemo((): PublicKey => {
    return new PublicKey(
      "E3nQYNBhTu7F2idxy5zceAFh5YMKXU6Uo3oeSeebhcWC"
    )
  }, []);

  const handleCreateListing = useCallback(async () => {
    let tx = new Transaction();

    let ix = await listSDK.createListing(nftMint, 1);
    tx.add(ix);

    let txSig = await wallet.sendTransaction(tx, connection);
    console.log(`create listing tx: https://explorer.solana.com/tx/${txSig}?cluster=devnet`);
  }, [listSDK, nftMint, wallet, connection]);

  const handleCreateBid = useCallback(async () => {
    let tx = new Transaction();

    let now = new Date();
    let expire_ts = now.setFullYear(now.getFullYear() + 1); // ! should default to a year

    let ix = await bidSDK.placeBid(
      nftMint,
      new BN(1 * LAMPORTS_PER_SOL),
      new BN(expire_ts),
    );

    tx.add(ix);

    let txSig = await wallet.sendTransaction(tx, connection);
    console.log(`create bid tx: https://explorer.solana.com/tx/${txSig}?cluster=devnet`);
  }, [nftMint, wallet, connection, bidSDK]);

  const handleDeleteBid = useCallback(async () => {
    let tx = new Transaction();
    let ix = await bidSDK.deleteBid(nftMint);

    tx.add(ix);

    let txSig = await wallet.sendTransaction(tx, connection);
    console.log(`delete bid tx: https://explorer.solana.com/tx/${txSig}?cluster=devnet`);
  }, [nftMint, wallet, connection, bidSDK]);


  const handleDeleteListing = useCallback(async () => {
    let tx = new Transaction();

    let ix = await listSDK.deleteListing(nftMint);
    tx.add(ix);

    let txSig = await wallet.sendTransaction(tx, connection);
    console.log(`delete listing tx: https://explorer.solana.com/tx/${txSig}?cluster=devnet`);
  }, [listSDK, nftMint, wallet, connection]);


  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "23px" }}>
      <button
        onClick={handleCreateListing}
        style={{ border: "2px solid white", padding: "10px" }}>
        create listing
      </button>

      <button
        onClick={handleCreateBid}
        style={{ border: "2px solid white", padding: "10px" }}>
        create bid
      </button>

      <button
        onClick={handleDeleteBid}
        style={{ border: "2px solid white", padding: "10px" }}>
        delete bid
      </button>

      <button
        onClick={handleDeleteListing}
        style={{ border: "2px solid white", padding: "10px" }}>
        delete listing
      </button>
    </div>
  );
};
