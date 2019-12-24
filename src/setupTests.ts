// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
import { sep } from "path";
process.env.APPLICATION_DIR = process.env.PWD;
process.env.CONFIG_DIR = `${process.env.APPLICATION_DIR}${sep}config${sep}`