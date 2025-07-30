import { v4 } from "uuid";

export const formatError = ({
  status = 500,
  title = "Unknown Error",
  description = "An unexpected error occurred",
}) => {
  return {
    status,
    title,
    description,
  };
};

export const generateCode = (prefix = "MUN") => {
  const digits = v4();
  return `${prefix.toUpperCase()}${digits}`;
};
