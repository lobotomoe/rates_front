import { useEffect, useRef, useState } from "react";
import { Button, ButtonGroup, ButtonToolbar } from "react-bootstrap";
import { Address } from "./App";
import { io, Socket } from "socket.io-client";
import moment from "moment";
import Chart from "./Chart";

type BalanceRecord = {
  balance: number;
  date: Date;
};

type CurrencyRecord = {
  price: number;
  symbol: string;
  date: Date;
};

let id = 1;
const subscribe = (ws: WebSocket, from: string, to: string) => {
  ws.send(
    JSON.stringify({
      method: "SUBSCRIBE",
      params: [from + to + "@trade"],
      id,
    })
  );
};

const unsubscribe = (ws: WebSocket, from: string, to: string) => {
  ws.send(
    JSON.stringify({
      method: "UNSUBSCRIBE",
      params: [from + to + "@trade"],
      id,
    })
  );
};

const ViewAddress = ({
  address,
  goBack,
  currencies,
}: {
  address: Address;
  goBack: () => void;
  currencies: string[];
}) => {
  const [currency, setCurrency] = useState<string>();
  const [currencyPrice, setCurrencyPrice] = useState<CurrencyRecord>();
  const [currencyHistory, setCurrencyHistory] = useState<CurrencyRecord[]>([]);

  const [balance, setBalance] = useState<BalanceRecord>();
  const [balanceHistory, setBalanceHistory] = useState<BalanceRecord[]>([]);

  const socketio = useRef<Socket>();
  const binanceSocket = useRef<WebSocket>();
  const [binanceActive, setBinanceActive] = useState(false);
  const approvedUpdateCount = useRef(1);

  useEffect(() => {
    const currencyHistoryFiller = window.setInterval(
      () => approvedUpdateCount.current++,
      5000 // Updating rate once per 5 sec
    );

    return () => {
      clearInterval(currencyHistoryFiller);
    };
  }, []);

  useEffect(() => {
    if (currencyPrice !== undefined && approvedUpdateCount.current > 0) {
      setCurrencyHistory((prev) => [...prev, currencyPrice]);
      approvedUpdateCount.current--;
    }
  }, [currency, currencyPrice]);

  useEffect(() => {
    balance && setBalanceHistory((prev) => [...prev, balance]);
  }, [balance]);

  useEffect(() => {
    if (process.env.REACT_APP_WS) {
      socketio.current = io(process.env.REACT_APP_WS, {});
      socketio.current.on("updateBalance", (value: number) => {
        const data = { balance: value, date: new Date() };
        setBalance(data);
      });
    }

    return () => {
      if (socketio.current) socketio.current.close();
    };
  }, []);

  useEffect(() => {
    if (process.env.REACT_APP_BINANCE_WS) {
      binanceSocket.current = new WebSocket(process.env.REACT_APP_BINANCE_WS);
      binanceSocket.current.onmessage = (e) => {
        try {
          const obj_data = JSON.parse(e.data);
          Object.prototype.hasOwnProperty.call(obj_data, "result") &&
            obj_data.result === null &&
            ++id;

          if (Object.prototype.hasOwnProperty.call(obj_data, "e")) {
            const { s, E, p } = obj_data;
            setCurrencyPrice({
              date: moment(E).toDate(),
              price: p,
              symbol: s,
            });
          }
        } catch (err) {
          console.error(err);
        }
      };
      binanceSocket.current.onopen = () => setBinanceActive(true);
      binanceSocket.current.onclose = () => setBinanceActive(false);
      id = 1;

      return () => {
        if (binanceSocket.current && binanceSocket.current.readyState === 1)
          binanceSocket.current.close();
      };
    }
  }, []);

  useEffect(() => {
    const currentCurrency = currency;
    if (binanceSocket.current && currentCurrency && binanceActive) {
      subscribe(binanceSocket.current, address.type, currentCurrency);
    }
    return () => {
      if (binanceSocket.current && currentCurrency)
        unsubscribe(binanceSocket.current, address.type, currentCurrency);
    };
  }, [address, binanceActive, currency]);

  useEffect(() => {
    if (!currency) {
      setCurrencyPrice(undefined);
      setCurrencyHistory([]);
    }
  }, [currency]);

  useEffect(() => {
    if (socketio.current && address) {
      socketio.current.emit("subscribe", address.id);
    }
    return () => {
      if (socketio.current) socketio.current.emit("unsubscribe");
    };
  }, [address]);

  return (
    <>
      <div className="align-items-start mb-3 w-100">
        <ButtonToolbar>
          <ButtonGroup className="mr-2">
            <Button onClick={goBack}>Back to list</Button>
          </ButtonGroup>
          <ButtonGroup aria-label="Currencies">
            {currencies.map((c) => (
              <Button
                key={c}
                variant="primary"
                active={currency === c}
                onClick={() => setCurrency(c === currency ? undefined : c)}
              >
                {c.toUpperCase()}
              </Button>
            ))}
          </ButtonGroup>
        </ButtonToolbar>
      </div>

      <div className="w-100">
        <p>{address.address}</p>
        <p style={{ fontWeight: 600, fontSize: 24 }}>
          {balance ? (
            <>
              Balance: {balance?.balance} {address.type === "eth" && "Ether"}
            </>
          ) : (
            <>Loading...</>
          )}
        </p>
        
        {currency && (
          <p>
            {currencyPrice ? (
              <>
                {currencyPrice.symbol}: {currencyPrice.price}
              </>
            ) : (
              <>Waiting trade event...</>
            )}
          </p>
        )}

        <Chart x="date" y="balance" data={balanceHistory} hidden={false} />
        <Chart x="date" y="price" data={currencyHistory} hidden={!currency} />
      </div>
    </>
  );
};

export default ViewAddress;
