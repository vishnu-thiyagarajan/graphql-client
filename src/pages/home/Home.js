import React, { useState, Fragment, useEffect } from "react";
import { Row, Col, Button } from "react-bootstrap";
import { gql, useSubscription } from "@apollo/client";

import { useAuthDispatch, useAuthState } from "../../context/auth";
import { useMessageDispatch } from "../../context/message";

import Users from "./Users";
import Messages from "./Messages";
import Newchannel from "../Newchannel";

const NEW_MESSAGE = gql`
  subscription newMessage {
    newMessage {
      uuid
      from
      to
      channel
      content
      createdAt
    }
  }
`;

export default function Home({ history }) {
  const [show, setShow] = useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);
  const authDispatch = useAuthDispatch();
  const messageDispatch = useMessageDispatch();

  const { user } = useAuthState();

  const { data: messageData, error: messageError } =
    useSubscription(NEW_MESSAGE);
  useEffect(() => {
    if (messageError) console.log(messageError);

    if (messageData) {
      const message = messageData.newMessage;
      const otherUser =
        user.username === message.to ? message.from : message.to;
      if (message.channel) {
        messageDispatch({
          type: "PUBLISH_MESSAGE",
          payload: {
            uuid: message.to,
            message,
          },
        });
      } else {
        messageDispatch({
          type: "ADD_MESSAGE",
          payload: {
            username: otherUser,
            message,
          },
        });
      }
    }
  }, [messageError, messageData, messageDispatch, user.username]);

  const logout = () => {
    authDispatch({ type: "LOGOUT" });
    window.location.href = "/login";
  };

  return (
    <Fragment>
      <Row className="bg-white justify-content-between align-items-center mb-1">
        <Col>Hi {user.username}</Col>
        <Button variant="link" onClick={handleShow}>
          Create Channel
        </Button>
        <Button variant="link" onClick={logout}>
          Logout
        </Button>
      </Row>
      <Row className="bg-white">
        <Users />
        <Messages />
      </Row>
      <Newchannel handleClose={handleClose} show={show} />
    </Fragment>
  );
}
