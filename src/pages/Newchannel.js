import React, { useState } from "react";
import { Button, Modal, Form } from "react-bootstrap";
import { useAuthState } from "../context/auth";
import { useMessageDispatch, useMessageState } from "../context/message";
import { gql, useMutation } from "@apollo/client";

const NEW_CHANNEL = gql`
  mutation addChannel($channelname: String!, $members: [String]!) {
    addChannel(channelname: $channelname, members: $members) {
      uuid
      channelname
      members
      createdAt
    }
  }
`;
function Newchannel({ handleClose, show }) {
  const dispatch = useMessageDispatch();
  const [variables, setVariables] = useState({
    channelname: "",
    members: [],
  });
  const { user } = useAuthState();
  const { users } = useMessageState();
  const [errors, setErrors] = useState({});

  const [addChannel, { loading }] = useMutation(NEW_CHANNEL, {
    onCompleted(data) {
      if (data?.addChannel)
        dispatch({ type: "NEW_CHANNEL", payload: data.addChannel });
    },
    onError: (err) => setErrors(err.graphQLErrors[0].extensions.errors),
  });
  const createChannel = (e) => {
    e.preventDefault();
    variables.members.push(user.username);
    addChannel({ variables });
    handleClose();
  };

  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <p>Add New Channel</p>
      </Modal.Header>
      <Form onSubmit={createChannel}>
        <Modal.Body>
          <Form.Group>
            <Form.Label className={errors.channelname && "text-danger"}>
              {errors.channelname ?? "Channelname"}
            </Form.Label>
            <Form.Control
              type="text"
              value={variables.channelname}
              className={errors.channelname && "is-invalid"}
              onChange={(e) =>
                setVariables({ ...variables, channelname: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group>
            <Form.Label>Add Members</Form.Label>
            <Form.Control
              as="select"
              multiple
              value={variables.members}
              onChange={(e) =>
                setVariables({
                  ...variables,
                  members: [].slice
                    .call(e.target.selectedOptions)
                    .map((item) => item.value),
                })
              }
            >
              {users &&
                users.map((usr) => (
                  <option value={usr.username}>{usr.username}</option>
                ))}
            </Form.Control>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? "loading.." : "Save"}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
}

export default Newchannel;
