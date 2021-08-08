import React, { useState, useEffect } from "react";

import { w3cwebsocket as W3CWebSocket } from "websocket";

import {
  TextField,
  Button,
  Grid,
  List,
  ListItem,
  ListItemText,
  Divider,
  // Typography,
  Container,
} from "@material-ui/core";

const App = () => {
  const [messages, setMessages] = useState([]);

  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const [client, setClient] = useState();

  useEffect(() => {
    setClient(new W3CWebSocket("ws://127.0.0.1:8080/message"));
  }, []);

  useEffect(() => {
    if (client != null) {
      client.onmessage = (e) => {
        setMessages(JSON.parse(e.data));
      };
    }
  }, [client]);

  const submit = () => {
    client.send(JSON.stringify({ name, message }));
  };

  return (
    <Grid
      style={{ height: "100%" }}
      container
      direction="row"
      justifyContent="center"
      alignItems="center"
    >
      <Grid item>
        <Container>
          <Grid container direction="row" spacing={3} alignItems="center">
            <Grid item>
              <TextField
                variant="outlined"
                label="Name"
                onChange={(e) => setName(e.target.value)}
                value={name}
                size="small"
              />
            </Grid>
            <Grid item>
              <TextField
                variant="outlined"
                label="Message"
                onChange={(e) => setMessage(e.target.value)}
                value={message}
                size="small"
              />
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                color="primary"
                onClick={submit}
                size="small"
              >
                Submit
              </Button>
            </Grid>
          </Grid>
          <List>
            { messages ? messages.map((e) => (
              <React.Fragment>
                <ListItem key={e.name + "-" + e.message}>
                  <ListItemText primary={e.name} secondary={e.message} />
                </ListItem>
                <Divider variant="inset" />
              </React.Fragment>
            )) : null}
          </List>
        </Container>
      </Grid>
    </Grid>
  );
};

export default App;
