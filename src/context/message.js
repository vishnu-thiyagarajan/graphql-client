import React, { createContext, useReducer, useContext } from "react";

const MessageStateContext = createContext();
const MessageDispatchContext = createContext();

const messageReducer = (state, action) => {
  let usersCopy, userIndex, channelscopy, channelindex;
  const { username, message, messages } = action.payload;
  const channelUuid = action?.payload?.uuid;
  switch (action.type) {
    case "NEW_CHANNEL":
      return {
        ...state,
        channels: [...state.channels, action.payload],
      };
    case "SET_CHANNELS":
      return {
        ...state,
        channels: action.payload,
      };
    case "SET_USERS":
      return {
        ...state,
        users: action.payload,
      };
    case "SET_CHANNEL_MESSAGES":
      channelscopy = state.channels ? [...state.channels] : [];

      channelindex = channelscopy.findIndex((u) => u.uuid == channelUuid);

      channelscopy[channelindex] = { ...channelscopy[channelindex], messages };

      return {
        ...state,
        channels: channelscopy,
      };
    case "SET_USER_MESSAGES":
      usersCopy = [...state.users];

      userIndex = usersCopy.findIndex((u) => u.username === username);

      usersCopy[userIndex] = { ...usersCopy[userIndex], messages };

      return {
        ...state,
        users: usersCopy,
      };
    case "SET_SELECTED_CHANNEL":
      channelscopy = state.channels.map((chl) => ({
        ...chl,
        selected: chl.uuid == action.payload,
      }));
      return {
        ...state,
        channels: channelscopy,
      };
    case "SET_SELECTED_USER":
      usersCopy = state.users.map((user) => ({
        ...user,
        selected: user.username === action.payload,
      }));

      return {
        ...state,
        users: usersCopy,
      };
    case "PUBLISH_MESSAGE":
      channelscopy = [...state.channels];

      channelindex = channelscopy.findIndex((u) => u.uuid == channelUuid);

      let newChannel = {
        ...channelscopy[channelindex],
        messages: channelscopy[channelindex]?.messages
          ? [message, ...channelscopy[channelindex]?.messages]
          : null,
        latestMessage: message,
      };

      channelscopy[channelindex] = newChannel;
      return {
        ...state,
        channels: channelscopy,
      };

    case "ADD_MESSAGE":
      usersCopy = [...state.users];

      userIndex = usersCopy.findIndex((u) => u.username === username);

      let newUser = {
        ...usersCopy[userIndex],
        messages: usersCopy[userIndex]?.messages
          ? [message, ...usersCopy[userIndex]?.messages]
          : null,
        latestMessage: message,
      };

      usersCopy[userIndex] = newUser;

      return {
        ...state,
        users: usersCopy,
      };

    default:
      throw new Error(`Unknown action type: ${action.type}`);
  }
};

export const MessageProvider = ({ children }) => {
  const [state, dispatch] = useReducer(messageReducer, {
    users: null,
    channels: null,
  });

  return (
    <MessageDispatchContext.Provider value={dispatch}>
      <MessageStateContext.Provider value={state}>
        {children}
      </MessageStateContext.Provider>
    </MessageDispatchContext.Provider>
  );
};

export const useMessageState = () => useContext(MessageStateContext);
export const useMessageDispatch = () => useContext(MessageDispatchContext);
