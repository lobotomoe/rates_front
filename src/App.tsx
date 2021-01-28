import axios from "axios";
import React, { useEffect, useState } from "react";
import {
  Button,
  Container,
  Form,
  InputGroup,
  ListGroup,
} from "react-bootstrap";
import { ToastContainer, toast } from "react-toastify";
import ViewAddress from "./ViewAddress";

export type Address = {
  id: number;
  address: string;
  type: string;
};

const addrLike = (length: number) => {
  var result = "";
  var characters = "ABCDEFabcdef0123456789";
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const App = () => {
  const [newAddr, setNewAddr] = useState("");
  const [addrs, setAddrs] = useState<Address[]>([]);
  const [addr, setAddr] = useState<Address>();
  const [addrType, setAddrType] = useState("eth");

  const [availableCurrencies, setAvailableCurrencies] = useState<string[]>([]);
  const [availableTypes, setAvailableTypes] = useState<string[]>([]);

  useEffect(() => {
    axios
      .get(process.env.REACT_APP_API_HOST + "/available_tokens")
      .then((res) => {
        setAvailableTypes(res.data);
      })
      .catch((err) => {
        toast.dark("Available types loading error");
      });
  }, []);

  useEffect(() => {
    axios
      .get(process.env.REACT_APP_API_HOST + "/available_currencies")
      .then((res) => {
        setAvailableCurrencies(res.data);
      })
      .catch((err) => {
        toast.dark("Available currencis loading error");
      });
  }, [setAvailableCurrencies]);

  useEffect(() => {
    if (availableTypes.length > 0 && addrType === "") {
      // Init type
      setAddrType(availableTypes[0]);
    }
  }, [addrType, availableTypes]);

  const getAllAddresses = () => {
    axios
      .get(process.env.REACT_APP_API_HOST + "/address")
      .then((res) => setAddrs(res.data))
      .catch(() => toast.dark("Addresses loading error"));
  };

  const addNewAddr = (e: React.FormEvent) => {
    e.preventDefault();
    axios
      .post(process.env.REACT_APP_API_HOST + "/address", {
        addr: newAddr,
        addrType,
      })
      .then((res) => {
        if (res.data.success) {
          setAddrs((prev) => [...prev, res.data.payload]);
        }
        setNewAddr("");
      })
      .catch(() => toast.dark("Address add error"));
  };

  useEffect(getAllAddresses, []);

  return (
    <>
      <Container
        fluid
        className="vh-100 d-flex align-items-center flex-column py-4"
        style={{ maxWidth: 600 }}
      >
        <Form onSubmit={addNewAddr} className="align-middle w-100">
          <Form.Group className="mt-2 mb-3 w-100">
            <InputGroup>
              <Form.Control
                as="select"
                custom
                style={{ maxWidth: 100 }}
                value={addrType}
                onChange={(e) => setAddrType(e.target.value)}
              >
                {availableTypes.map((at) => (
                  <option key={at} value={at}>
                    {at}
                  </option>
                ))}
              </Form.Control>
              <Form.Control
                pattern="^0x[a-fA-F0-9]{40}$"
                placeholder="Address"
                aria-label="Address"
                value={newAddr}
                onChange={(e) => setNewAddr(e.target.value)}
              />
              <InputGroup.Append>
                <Button
                  variant="primary"
                  type="submit"
                  disabled={availableTypes.length === 0}
                >
                  Add
                </Button>
              </InputGroup.Append>
            </InputGroup>

            <Form.Text className="text-muted">
              Paste address like 0x{addrLike(40)}
            </Form.Text>
          </Form.Group>
        </Form>
        {addr && (
          <ViewAddress
            address={addr}
            currencies={availableCurrencies}
            goBack={() => setAddr(undefined)}
          />
        )}
        {addrs.length === 0 && <p>Addresses list is empty</p>}
        {!addr && (
          <ListGroup className="w-100">
            {addrs.map((a) => (
              <ListGroup.Item action key={a.id} onClick={() => setAddr(a)}>
                {a.type + ": " + a.address}
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Container>
      <ToastContainer />
    </>
  );
};

export default App;
