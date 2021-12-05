import React from "react";
import classNames from "classnames";

import { useAuthState } from "../../context/auth";

export default function Message({ message }) {
  const { user } = useAuthState();
  const sent = message.from === user.username;
  const received = !sent;

  return (
    <div
      className={classNames("d-flex my-3", {
        "ml-auto": sent,
        "mr-auto": received,
      })}
    >
      <div
        className={classNames("py-2 px-3 rounded-pill position-relative", {
          "bg-primary": sent,
          "bg-secondary": received,
        })}
        style={{
          overflowWrap: "anywhere",
          wordWrap: "break-word",
          whiteSpace: "pre-wrap",
          maxWidth: "500px",
        }}
      >
        <p className={classNames({ "text-white": sent })} key={message.uuid}>
          {message.content}
        </p>
      </div>
      {received && <div style={{ marginTop: "auto" }}>-{message.from}</div>}
    </div>
  );
}
