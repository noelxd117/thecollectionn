import toast, { Toaster } from "react-hot-toast";
import React, { useState, useEffect } from "react"; 
import { useRouter } from "next/router";
 
import {

    Connection,
    SystemProgram,
    Transaction,
    PublicKey,
    LAMPORTS_PER_SOL,
    clusterApiUrl,
    SendTransactionError,
} from "@solana/web3.js";
import { useStorageUpload } from "@thirdweb-dev/react";

import axios from "axios";

const SOLANA_NETWORK = "devnet";

const Home = () => {
    const [publicKey, setPublicKey] = useState(null);
    const router = useRouter();
    const [balance, setBalance] = useState(0);
    //esto cambio   
    const receiver = "Wv2y85uFXUD467cjgJpwiPcBgtkJBNvvaS5wJuA1CtK"
    const valorConstante1 = 0.2;
    const valorConstante2 = 0.5;
    const valorConstante3 = 0.35;
    const amount = 0.2;
    const amount1 = 0.5;
    const amount3 = 0.35;
    
    const [explorerLink, setExplorerLink] = useState(null);
    const [uploadUrl, setUploadUrl] = useState(null);
    const [url, setUrl] = useState(null);
    const [statusText, setStatusText] = useState("");

    useEffect(() => {
        let key = window.localStorage.getItem("publicKey"); //obtiene la publicKey del localStorage
        setPublicKey(key);
        if (key) getBalances(key);
        if (explorerLink) setExplorerLink(null);
    }, []); 

    const handleReceiverChange = () => {
        const valorConstante = "Wv2y85uFXUD467cjgJpwiPcBgtkJBNvvaS5wJuA1CtK";
        setReceiver(valorConstante);
    };

    

    const handleSubmit1 = async () => {
        console.log("Este es el receptor", receiver);
        console.log("Este es el monto", valorConstante1);
        sendTransaction1();
    };
    const handleSubmit2 = async () => {
        console.log("Este es el receptor", receiver);
        console.log("Este es el monto", valorConstante2);
        sendTransaction2();
    };
    const handleSubmit3 = async () => {
        console.log("Este es el receptor", receiver);
        console.log("Este es el monto", valorConstante3);
        sendTransaction2();
    };

    const handleUrlChange = (event) => {
        setUrl(event.target.value);
        console.log("Si se esta seteando la URL", url);
    }; 

    //Funcion para Iniciar sesion con nuestra Wallet de Phantom

    const signIn = async () => {
        //Si phantom no esta instalado
        const provider = window?.phantom?.solana;
        const { solana } = window;

        if (!provider?.isPhantom || !solana.isPhantom) {
            toast.error("Phantom no esta instalado");
            setTimeout(() => {
                window.open("https://phantom.app/", "_blank");
            }, 2000);
            return;
        }
        //Si phantom esta instalado
        let phantom;
        if (provider?.isPhantom) phantom = provider;

        const { publicKey } = await phantom.connect(); //conecta a phantom
        console.log("publicKey", publicKey.toString()); //muestra la publicKey
        setPublicKey(publicKey.toString()); //guarda la publicKey en el state
        window.localStorage.setItem("publicKey", publicKey.toString()); //guarda la publicKey en el localStorage

        toast.success("Tu Wallet esta conectada 👻");

        getBalances(publicKey);
    };

    //Funcion para cerrar sesion con nuestra Wallet de Phantom

    const signOut = async () => {
        if (window) {
            const { solana } = window;
            window.localStorage.removeItem("publicKey");
            setPublicKey(null);
            solana.disconnect();
            router.reload(window?.location?.pathname);
        }
    };

    //Funcion para obtener el balance de nuestra wallet

    const getBalances = async (publicKey) => {
        try {
            const connection = new Connection(
                clusterApiUrl(SOLANA_NETWORK),
                "confirmed"
            );

            const balance = await connection.getBalance(
                new PublicKey(publicKey)
            );

            const balancenew = balance / LAMPORTS_PER_SOL;
            setBalance(balancenew);
        } catch (error) {
            console.error("ERROR GET BALANCE", error);
            toast.error("Something went wrong getting the balance");
        }
    };

    //Funcion para enviar una transaccion
    const sendTransaction1 = async () => {
        try {
            //Consultar el balance de la wallet
            getBalances(publicKey);
            console.log("Este es el balance", balance);

            //Si el balance es menor al monto a enviar
            if (balance < amount) {
                toast.error("No tienes suficiente balance");
                return;
            }

            const provider = window?.phantom?.solana;
            const connection = new Connection(
                clusterApiUrl(SOLANA_NETWORK),
                "confirmed"
            );
            const fromPubkey = new PublicKey(publicKey);
            const toPubkey = new PublicKey(receiver);

            //Creamos la transaccion
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey,
                    toPubkey,
                    lamports: amount * LAMPORTS_PER_SOL,
                })
            );
            console.log("Esta es la transaccion", transaction);

            //Traemos el ultimo blocke de hash
            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = fromPubkey;

            //Firmamos la transaccion
            const transactionsignature = await provider.signTransaction(
                transaction
            );

            //Enviamos la transaccion
            const txid = await connection.sendRawTransaction(
                transactionsignature.serialize()
            );
            console.info(`Transaccion con numero de id ${txid} enviada`);

            //Esperamos a que se confirme la transaccion
            const confirmation = await connection.confirmTransaction(txid, {
                commitment: "singleGossip",
            });

            const { slot } = confirmation.value;

            console.info(
                `Transaccion con numero de id ${txid} confirmado en el bloque ${slot}`
            );

            const solanaExplorerLink = `https://explorer.solana.com/tx/${txid}?cluster=${SOLANA_NETWORK}`;
            setExplorerLink(solanaExplorerLink);

            toast.success("Transaccion enviada con exito :D ");

            //Actualizamos el balance
            getBalances(publicKey);
            setAmount(null);
            setReceiver(null);

            return solanaExplorerLink;
        } catch (error) {
            toast.error("Error al enviar la transaccion");
        }
    };
            const sendTransaction2 = async () => {
                try {
                    //Consultar el balance de la wallet
                    getBalances(publicKey);
                    console.log("Este es el balance", balance);
        
                    //Si el balance es menor al monto a enviar
                    if (balance < amount1) {
                        toast.error("No tienes suficiente balance");
                        return;
                    }
        
                    const provider = window?.phantom?.solana;
                    const connection = new Connection(
                        clusterApiUrl(SOLANA_NETWORK),
                        "confirmed"
                    );
                    const fromPubkey = new PublicKey(publicKey);
            const toPubkey = new PublicKey(receiver);

            //Creamos la transaccion
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey,
                    toPubkey,
                    lamports: amount1 * LAMPORTS_PER_SOL,
                })
            );
            console.log("Esta es la transaccion", transaction);

            //Traemos el ultimo blocke de hash
            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = fromPubkey;

            //Firmamos la transaccion
            const transactionsignature = await provider.signTransaction(
                transaction
            );

            //Enviamos la transaccion
            const txid = await connection.sendRawTransaction(
                transactionsignature.serialize()
            );
            console.info(`Transaccion con numero de id ${txid} enviada`);

            //Esperamos a que se confirme la transaccion
            const confirmation = await connection.confirmTransaction(txid, {
                commitment: "singleGossip",
            });

            const { slot } = confirmation.value;

            console.info(
                `Transaccion con numero de id ${txid} confirmado en el bloque ${slot}`
            );

            const solanaExplorerLink = `https://explorer.solana.com/tx/${txid}?cluster=${SOLANA_NETWORK}`;
            setExplorerLink(solanaExplorerLink);

            toast.success("Transaccion enviada con exito :D ");

            //Actualizamos el balance
            getBalances(publicKey);
            setAmount(null);
            setReceiver(null);

            return solanaExplorerLink;
        } catch (error) {
            toast.error("Error al enviar la transaccion");
        }
    };
                    const sendTransaction3 = async () => {
                        try {
                            //Consultar el balance de la wallet
                            getBalances(publicKey);
                            console.log("Este es el balance", balance);
                
                            //Si el balance es menor al monto a enviar
                            if (balance < amount3) {
                                toast.error("No tienes suficiente balance");
                                return;
                            }
                
                            const provider = window?.phantom?.solana;
                            const connection = new Connection(
                                clusterApiUrl(SOLANA_NETWORK),
                                "confirmed"
                            );
            //Llaves

            const fromPubkey = new PublicKey(publicKey);
            const toPubkey = new PublicKey(receiver);

            //Creamos la transaccion
            const transaction = new Transaction().add(
                SystemProgram.transfer({
                    fromPubkey,
                    toPubkey,
                    lamports: amount3 * LAMPORTS_PER_SOL,
                })
            );
            console.log("Esta es la transaccion", transaction);

            //Traemos el ultimo blocke de hash
            const { blockhash } = await connection.getLatestBlockhash();
            transaction.recentBlockhash = blockhash;
            transaction.feePayer = fromPubkey;

            //Firmamos la transaccion
            const transactionsignature = await provider.signTransaction(
                transaction
            );

            //Enviamos la transaccion
            const txid = await connection.sendRawTransaction(
                transactionsignature.serialize()
            );
            console.info(`Transaccion con numero de id ${txid} enviada`);

            //Esperamos a que se confirme la transaccion
            const confirmation = await connection.confirmTransaction(txid, {
                commitment: "singleGossip",
            });

            const { slot } = confirmation.value;

            console.info(
                `Transaccion con numero de id ${txid} confirmado en el bloque ${slot}`
            );

            const solanaExplorerLink = `https://explorer.solana.com/tx/${txid}?cluster=${SOLANA_NETWORK}`;
            setExplorerLink(solanaExplorerLink);

            toast.success("Transaccion enviada con exito :D ");
                
            //Actualizamos el balance
            getBalances(publicKey);
            setAmount(null);
            setReceiver(null);
                
            return solanaExplorerLink;
        } catch (error) {
            toast.error("Error al enviar la transaccion");
        }
    };  

    return (
        <div>
  <meta charSet="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" integrity="sha384-T3c6CoIi6uLrA9TneNEoa7RxnatzjcDSCmG1MXxSR1GAsXEV/Dwwykc2MPK8M2HN" crossorigin="anonymous"></link>
  <link rel="stylesheet" type="text/css" href="cuadricula.css" />
  <title>Document</title>
  <div className="grid-layout">
    <div className="caja c1">
      <marquee direction="left"> ¡Halloween event go a try luck in the event booster pack!</marquee>
    </div>
    <div className="caja c2">
      <div className="grid-Chiquita">
        <div className="caja">
          <img className="enlarge-image" src="/images/cerdo.jpg" alt="Cerdo"/>
          <br />
          <button
                                class="btn btn-primary"
                                type="submit"
                                onClick={sendTransaction1}
                            >0.2<br />SOL</button>
        </div>
        <div className="caja">
          <img className="enlarge-image" src="/images/fur.jpg" alt="Cerdo" />
          <br />
          <button
                                class="btn btn-secondary"
                                type="submit"
                                onClick={sendTransaction2}
                            >0.5<br />SOL</button>
        </div>
        <div className="caja">
          <img className="enlarge-image" src="/images/walter.jpg" alt="Cerdo" />
          <br />
          <button
                                class="btn btn-warning"
                                type="submit"
                                onClick={sendTransaction3}
                            >0.35<br />SOL</button>
        </div>
      </div>
    </div>
    <div className="caja c3">
      <h5>Actions</h5>
      <ul>
        <li>Trade</li>
        <li>Sell</li>
        <li>Auction</li>
        <li>Blog</li>
        <li>Collection</li>
      </ul>
    </div>
    <div className="caja c4">
      <h5>Friend<br />List</h5>
      <ul>
        <li>Juan</li>
        <li>ZeiNo</li>
        <li>Joao</li>
      </ul>
    </div>     
  </div>
</div>
      
    );
};

export default Home;