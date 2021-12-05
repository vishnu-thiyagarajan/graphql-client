import React, { useState } from "react";
import { gql, useQuery } from "@apollo/client";
import { Col, Image, ToggleButton, ToggleButtonGroup } from "react-bootstrap";
import classNames from "classnames";

import { useMessageDispatch, useMessageState } from "../../context/message";

const GET_USERS = gql`
  query getUsers {
    getUsers {
      username
      latestMessage {
        uuid
        from
        to
        content
        createdAt
      }
    }
  }
`;

const GET_CHANNELS = gql`
  query getChannels {
    getChannels {
      uuid
      channelname
      members
      createdAt
      latestMessage {
        uuid
        from
        to
        content
        createdAt
      }
    }
  }
`;

export default function Users() {
  const dispatch = useMessageDispatch();
  const { users, channels } = useMessageState();
  const selectedUser = users?.find((u) => u.selected === true)?.username;
  const selectedChannel = channels?.find((u) => u.selected === true)?.uuid;
  const { loading } = useQuery(GET_USERS, {
    onCompleted: (data) =>
      dispatch({ type: "SET_USERS", payload: data.getUsers }),
    onError: (err) => console.log(err),
  });
  const { loading: chnloading } = useQuery(GET_CHANNELS, {
    onCompleted: (data) =>
      dispatch({ type: "SET_CHANNELS", payload: data.getChannels }),
    onError: (err) => console.log(err),
  });

  let usersMarkup, channelMarkup;
  if (!channels || chnloading) channelMarkup = <p>Loading</p>;
  else if (channels.length === 0)
    channelMarkup = <p>No Teams have been created yet</p>;
  else if (channels.length > 0) {
    channelMarkup = channels.map((chl) => {
      return (
        <div
          role="button"
          className={classNames(
            "user-div d-flex justify-content-center justify-content-md-start p-3",
            {
              "bg-white": selectedChannel === chl.uuid,
            }
          )}
          key={chl.uuid}
          onClick={() =>
            dispatch({ type: "SET_SELECTED_CHANNEL", payload: chl.uuid })
          }
        >
          <div className="d-none d-md-block ml-2">
            <p className="text-success">{chl.channelname}</p>
            <p
              className="font-weight-light"
              style={{
                whiteSpace: "nowrap",
                maxWidth: "250px",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {chl.latestMessage
                ? chl.latestMessage.content
                : "You are a member now!"}
            </p>
          </div>
        </div>
      );
    });
  }

  if (!users || loading) {
    usersMarkup = <p>Loading..</p>;
  } else if (users.length === 0) {
    usersMarkup = <p>No users have joined yet</p>;
  } else if (users.length > 0) {
    usersMarkup = users.map((user) => {
      const selected = selectedUser === user.username;
      return (
        <div
          role="button"
          className={classNames(
            "user-div d-flex justify-content-center justify-content-md-start p-3",
            {
              "bg-white": selected,
            }
          )}
          key={user.username}
          onClick={() =>
            dispatch({ type: "SET_SELECTED_USER", payload: user.username })
          }
        >
          <Image
            src={
              user.imageUrl ||
              "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
            }
            className="user-image"
          />
          <div className="d-none d-md-block ml-2">
            <p className="text-success">{user.username}</p>
            <p
              className="font-weight-light"
              style={{
                whiteSpace: "nowrap",
                maxWidth: "250px",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user.latestMessage
                ? user.latestMessage.content
                : "You are now connected!"}
            </p>
          </div>
        </div>
      );
    });
  }
  const [radioValue, setRadioValue] = useState("Private");

  const radios = [
    { name: "Private", value: "Private" },
    { name: "Team", value: "Team" },
  ];
  return (
    <Col xs={2} md={4} className="p-0 bg-secondary">
      <ToggleButtonGroup
        type="radio"
        name="radio"
        defaultValue="Private"
        style={{ width: "100%" }}
      >
        {radios.map((radio, idx) => (
          <ToggleButton
            key={idx}
            id={`radio-${idx}`}
            variant="outline-success"
            value={radio.value}
            checked={radioValue === radio.value}
            onChange={(e) => {
              setRadioValue(e.target.value);
              dispatch({ type: "SET_SELECTED_USER", payload: "" });
              dispatch({ type: "SET_SELECTED_CHANNEL", payload: "" });
            }}
          >
            {radio.name}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
      {radioValue === "Private" ? usersMarkup : channelMarkup}
    </Col>
  );
}
