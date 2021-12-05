import React, { Fragment, useEffect, useState } from "react";
import { gql, useLazyQuery, useMutation } from "@apollo/client";
import { Col, Form } from "react-bootstrap";

import { useMessageDispatch, useMessageState } from "../../context/message";
import { useAuthState } from "../../context/auth";

import Message from "./Message";

const SEND_MESSAGE = gql`
  mutation sendMessage($to: String, $chnlID: String, $content: String!) {
    sendMessage(to: $to, chnlID: $chnlID, content: $content) {
      uuid
      from
      to
      content
      createdAt
    }
  }
`;

const GET_MESSAGES = gql`
  query getMessages($from: String, $chnlID: String) {
    getMessages(from: $from, chnlID: $chnlID) {
      uuid
      from
      to
      content
      createdAt
    }
  }
`;

export default function Messages() {
  const { user: loggedInUser } = useAuthState();
  const { users, channels } = useMessageState();
  const dispatch = useMessageDispatch();
  const [content, setContent] = useState("");

  const selectedUser = users?.find((u) => u.selected === true);
  const selectedChannel = channels?.find((u) => u.selected === true);
  const messages = selectedUser?.messages || selectedChannel?.messages;
  const [getMessages, { loading: messagesLoading, data: messagesData }] =
    useLazyQuery(GET_MESSAGES);

  const [sendMessage] = useMutation(SEND_MESSAGE, {
    onError: (err) => console.log(err),
  });

  useEffect(() => {
    if (selectedUser && !selectedUser.messages) {
      getMessages({ variables: { from: selectedUser.username, chnlID: null } });
    }
    if (
      selectedChannel &&
      !selectedChannel?.messages &&
      selectedChannel?.uuid
    ) {
      getMessages({
        variables: {
          from: loggedInUser.username,
          chnlID: selectedChannel?.uuid,
        },
      });
    }
  }, [selectedUser, getMessages, selectedChannel]);

  useEffect(() => {
    if (messagesData && selectedUser) {
      dispatch({
        type: "SET_USER_MESSAGES",
        payload: {
          username: selectedUser?.username,
          messages: messagesData.getMessages,
        },
      });
    }
    if (messagesData && selectedChannel?.uuid) {
      dispatch({
        type: "SET_CHANNEL_MESSAGES",
        payload: {
          uuid: selectedChannel?.uuid,
          messages: messagesData?.getMessages,
        },
      });
    }
  }, [messagesData, dispatch]);

  const submitMessage = (e) => {
    e.preventDefault();

    if (content.trim() === "" || (!selectedUser && !selectedChannel?.uuid))
      return;

    setContent("");

    sendMessage({
      variables: {
        to: selectedUser?.username,
        chnlID: selectedChannel?.uuid,
        content,
      },
    });
  };

  let selectedChatMarkup;
  if (!messages && !messagesLoading) {
    selectedChatMarkup = <p className="info-text">Select a friend or team</p>;
  } else if (messagesLoading) {
    selectedChatMarkup = <p className="info-text">Loading..</p>;
  } else if (messages.length > 0) {
    selectedChatMarkup = messages.map((message, index) => (
      <Fragment key={message.uuid}>
        <Message message={message} />
        {index === messages.length - 1 && (
          <div className="invisible">
            <hr className="m-0" />
          </div>
        )}
      </Fragment>
    ));
  } else if (messages.length === 0) {
    selectedChatMarkup = (
      <p className="info-text">
        You are now connected! send your first message!
      </p>
    );
  }

  return (
    <Col xs={10} md={8} className="p-0">
      <div className="messages-box d-flex flex-column-reverse p-3">
        {selectedChatMarkup}
      </div>
      <div className="px-3 py-2">
        <Form onSubmit={submitMessage}>
          <Form.Group className="d-flex align-items-center m-0">
            <Form.Control
              type="text"
              className="message-input rounded-pill p-4 bg-secondary border-0"
              placeholder="Type a message.."
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <i
              className="fas fa-paper-plane fa-2x text-primary ml-2"
              onClick={submitMessage}
              role="button"
            ></i>
          </Form.Group>
        </Form>
      </div>
    </Col>
  );
}
