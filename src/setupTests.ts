// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom/extend-expect';
import { sep } from "path";
import { existsSync, mkdirSync } from 'fs';
process.env.APPLICATION_DIR = process.env.PWD;
process.env.CONFIG_DIR = `${process.env.APPLICATION_DIR}${sep}testresources${sep}`;
process.env.LOGS_DIR = `${process.env.APPLICATION_DIR}${sep}testresources${sep}logs${sep}`;

if (!existsSync(process.env.CONFIG_DIR))
    mkdirSync(process.env.CONFIG_DIR);